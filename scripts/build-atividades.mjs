#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Pipeline do acervo lúdico: PNG do gestor → PDF imprimível + capa do card.
//
// A pasta de origem ("atividades ludicas", fora do repo) tem 54 fichas em PNG
// de ~2 MB cada. Embutir o PNG cru num PDF manteria os 2 MB: 110 MB no git e no
// deploy. Reamostrando para JPEG q82 cada ficha cai para ~380 KB — as artes têm
// 1024–1536 px, o que dá ~130 dpi em A4, suficiente para impressão doméstica.
// (q82 foi conferido a 100% contra o PNG original: indistinguível no texto.)
//
// Saída, por ficha, em dois lugares DIFERENTES — e a diferença é o paywall:
//   build/atividades/ludica/<slug>/<slug>.pdf   conteúdo pago, fora do git e
//     fora de public/. É só o material de origem do upload para o bucket
//     privado `atividades` (scripts/upload-atividades.mjs). Enquanto o PDF
//     morava em public/, qualquer pessoa com o link baixava sem sessão.
//   public/atividades/ludica/<slug>/capa.webp   miniatura de 640 px do card.
//     Continua pública de propósito: é a vitrine, não o produto.
//
// Além dos assets, o script deriva do mesmo manifesto:
//   supabase/migrations/012_seed_atividades_ludicas.sql
//   src/lib/atividades.data.ts
// O manifesto é a fonte única — nada aqui é escrito à mão duas vezes.
//
// Uso:  node scripts/build-atividades.mjs [--src "../atividades ludicas"] [--force]
// ══════════════════════════════════════════════════════════════════════════════

import { existsSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const manifestPath = join(root, "scripts", "atividades.manifest.json");

// ── Argumentos ────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const force = argv.includes("--force");
const srcDir = resolve(root, flag("--src", join("..", "atividades ludicas")));

// ── Constantes de saída ───────────────────────────────────────────────────────
// PDFs: staging local, gitignorado (`build/` já está no .gitignore).
const PDF_BASE = join(root, "build", "atividades", "ludica");
// Capas: continuam versionadas e servidas por public/.
const CAPA_BASE = join(root, "public", "atividades", "ludica");
const CAPA_URL_BASE = "/atividades/ludica";
// Prefixo dentro do bucket privado `atividades` (migration 015).
const BUCKET_PREFIX = "ludica";
const JPEG_QUALITY = 82;
const CAPA_WIDTH = 640;

// A4 em pontos PostScript (72 dpi).
const A4_SHORT = 595.28;
const A4_LONG = 841.89;

const AUTHOR = "Aulateca";
const UUID_PREFIX = "a01a7eca-0002-4000-8000-";

// ── Helpers ───────────────────────────────────────────────────────────────────
const uuidFor = (index) => UUID_PREFIX + String(index + 1).padStart(12, "0");

// Regenera se a fonte, o manifesto ou o próprio script mudaram depois da saída.
function isStale(outPath, ...sources) {
  if (force || !existsSync(outPath)) return true;
  const out = statSync(outPath).mtimeMs;
  return sources.some((s) => statSync(s).mtimeMs > out);
}

function sqlString(value) {
  return "'" + String(value).replace(/'/g, "''") + "'";
}

function tsString(value) {
  return JSON.stringify(String(value));
}

// ── Assets ────────────────────────────────────────────────────────────────────
async function buildOne(entry) {
  const sourcePath = join(srcDir, entry.source);
  if (!existsSync(sourcePath)) {
    throw new Error(`fonte ausente para "${entry.slug}": ${sourcePath}`);
  }

  const pdfDir = join(PDF_BASE, entry.slug);
  const capaDir = join(CAPA_BASE, entry.slug);
  const pdfPath = join(pdfDir, `${entry.slug}.pdf`);
  const capaPath = join(capaDir, "capa.webp");
  const self = join(root, "scripts", "build-atividades.mjs");
  const deps = [sourcePath, manifestPath, self];

  const meta = await sharp(sourcePath).metadata();
  const landscape = meta.width >= meta.height;

  let built = false;

  if (isStale(pdfPath, ...deps)) {
    await mkdir(pdfDir, { recursive: true });

    // A arte já vem com margem própria; não reamostramos para cima.
    const jpeg = await sharp(sourcePath)
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: JPEG_QUALITY, chromaSubsampling: "4:4:4", mozjpeg: true })
      .toBuffer();

    const pdf = await PDFDocument.create();
    pdf.setTitle(entry.title);
    pdf.setAuthor(AUTHOR);
    pdf.setSubject(entry.description);
    pdf.setProducer("Aulateca — scripts/build-atividades.mjs");

    const pageW = landscape ? A4_LONG : A4_SHORT;
    const pageH = landscape ? A4_SHORT : A4_LONG;
    const page = pdf.addPage([pageW, pageH]);

    const image = await pdf.embedJpg(jpeg);
    // Contain: nunca corta arte, e a margem branca que sobra é o que a
    // impressora doméstica precisa de qualquer forma.
    const scale = Math.min(pageW / image.width, pageH / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    page.drawImage(image, { x: (pageW - w) / 2, y: (pageH - h) / 2, width: w, height: h });

    await writeFile(pdfPath, await pdf.save());
    built = true;
  }

  if (isStale(capaPath, ...deps)) {
    await mkdir(capaDir, { recursive: true });
    await sharp(sourcePath)
      .resize({ width: CAPA_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(capaPath);
    built = true;
  }

  return {
    ...entry,
    landscape,
    built,
    // Caminho DENTRO do bucket, sem barra inicial: é assim que o frontend
    // distingue conteúdo pago (assina a URL) de link público (abre direto).
    bucketPath: `${BUCKET_PREFIX}/${entry.slug}/${entry.slug}.pdf`,
    capaUrl: `${CAPA_URL_BASE}/${entry.slug}/capa.webp`,
    pdfBytes: statSync(pdfPath).size,
    capaBytes: statSync(capaPath).size,
  };
}

// ── Migration de seed ─────────────────────────────────────────────────────────
function renderSeedSql(items) {
  const rows = items.map((item, i) =>
    "  (" +
    [
      sqlString(uuidFor(i)),
      sqlString(item.title),
      sqlString(item.description),
      sqlString(item.category),
      "'pdf'",
      sqlString(item.ageRange),
      sqlString(item.duration),
      sqlString(item.bucketPath),
      sqlString(item.capaUrl),
      sqlString(AUTHOR),
    ].join(", ") +
    ")",
  );

  return [
    "-- ════════════════════════════════════════════════════════════════════════════",
    "-- 012 — Acervo real: as fichas lúdicas em PDF da pasta do gestor.",
    "--",
    "-- GERADO por scripts/build-atividades.mjs a partir de",
    "-- scripts/atividades.manifest.json. Não editar à mão: rode o script.",
    "--",
    "-- file_url NÃO é uma URL: é o caminho do PDF dentro do bucket privado",
    "-- `atividades` (migration 015). O frontend troca isso por uma URL assinada de",
    "-- curta duração, e só para quem tem acesso pago. image_url continua sendo URL",
    "-- pública de verdade — a capa é vitrine.",
    "--",
    "-- Idempotente via uuids fixos + on conflict do nothing: rodar de novo não",
    "-- duplica nem sobrescreve edições feitas pelo /admin depois.",
    "-- ════════════════════════════════════════════════════════════════════════════",
    "",
    "insert into public.resources",
    "  (id, title, description, category, type, age_range, duration, file_url, image_url, author_name)",
    "values",
    rows.join(",\n"),
    "on conflict (id) do nothing;",
    "",
  ].join("\n");
}

// ── Fallback do frontend ──────────────────────────────────────────────────────
function renderDataTs(items) {
  const rows = items.map((item, i) =>
    "  {\n" +
    [
      `    id: ${tsString(uuidFor(i))}`,
      `    title: ${tsString(item.title)}`,
      `    description: ${tsString(item.description)}`,
      `    category: ${tsString(item.category)}`,
      `    type: "pdf"`,
      `    ageRange: ${tsString(item.ageRange)}`,
      `    duration: ${tsString(item.duration)}`,
      `    downloads: 0`,
      `    rating: 0`,
      `    author: ${tsString(AUTHOR)}`,
      `    fileUrl: ${tsString(item.bucketPath)}`,
      `    imageUrl: ${tsString(item.capaUrl)}`,
    ].join(",\n") +
    ",\n  }",
  );

  return [
    "// ═══════════════════════════════════════════════════════════════════════════",
    "// GERADO por scripts/build-atividades.mjs a partir de",
    "// scripts/atividades.manifest.json. Não editar à mão: rode",
    "//   node scripts/build-atividades.mjs",
    "//",
    "// É o acervo que a Home mostra quando o banco volta vazio. Os uuids são os",
    "// mesmos da migration 012, então favoritar no fallback e no banco dá no",
    "// mesmo registro.",
    "// ═══════════════════════════════════════════════════════════════════════════",
    "",
    'import type { Resource } from "./types";',
    "",
    "export const atividades: Resource[] = [",
    rows.join(",\n"),
    "];",
    "",
  ].join("\n");
}

// ── Números do acervo para a landing ──────────────────────────────
// Arquivo próprio, separado de atividades.data.ts de propósito: a landing é a
// página de quem ainda NÃO comprou, e importar o catálogo inteiro (32 KB) só
// para exibir três números jogaria o acervo no chunk da página de vendas.
function renderStatsTs(items) {
  const porCategoria = {};
  for (const item of items) {
    porCategoria[item.category] = (porCategoria[item.category] ?? 0) + 1;
  }
  const linhas = Object.keys(porCategoria)
    .sort()
    .map((cat) => `  ${tsString(cat)}: ${porCategoria[cat]},`);

  return [
    "// ════════════════════════════════════════════════════════════════════════════",
    "// GERADO por scripts/build-atividades.mjs a partir de",
    "// scripts/atividades.manifest.json. Não editar à mão: rode",
    "//   node scripts/build-atividades.mjs",
    "//",
    "// Fonte única dos números que a landing anuncia. Se o acervo crescer, o texto",
    "// da página de vendas acompanha sozinho — e nunca promete o que não existe.",
    "// ════════════════════════════════════════════════════════════════════════════",
    "",
    `export const totalAtividades = ${items.length};`,
    "",
    "export const atividadesPorCategoria: Record<string, number> = {",
    linhas.join("\n"),
    "};",
    "",
    "export const totalJogosLudicos = atividadesPorCategoria[\"ludica\"] ?? 0;",
    "",
    "export const totalExerciciosTexto =",
    "  (atividadesPorCategoria[\"producao-texto\"] ?? 0) +",
    "  (atividadesPorCategoria[\"interpretacao-texto\"] ?? 0);",
    "",
  ].join("\n");
}

// ── Main ──────────────────────────────────────────────────────────────────────
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

const slugs = new Set();
for (const entry of manifest) {
  if (slugs.has(entry.slug)) throw new Error(`slug duplicado no manifesto: ${entry.slug}`);
  slugs.add(entry.slug);
}

console.log(`Fonte: ${srcDir}`);
console.log(`${manifest.length} ficha(s) no manifesto.\n`);

const items = [];
for (const entry of manifest) {
  const item = await buildOne(entry);
  items.push(item);
  const kb = (n) => `${Math.round(n / 1024)} KB`;
  console.log(
    `${item.built ? "✓ gerado " : "· em dia "} ${item.slug.padEnd(46)} ` +
      `${item.landscape ? "paisagem" : "retrato "}  pdf ${kb(item.pdfBytes).padStart(7)}  capa ${kb(item.capaBytes).padStart(6)}`,
  );
}

const seedPath = join(root, "supabase", "migrations", "012_seed_atividades_ludicas.sql");
const dataPath = join(root, "src", "lib", "atividades.data.ts");
const statsPath = join(root, "src", "lib", "acervo.stats.ts");
await mkdir(dirname(seedPath), { recursive: true });
await writeFile(seedPath, renderSeedSql(items), "utf8");
await writeFile(dataPath, renderDataTs(items), "utf8");
await writeFile(statsPath, renderStatsTs(items), "utf8");

const totalPdf = items.reduce((a, i) => a + i.pdfBytes, 0);
const totalCapa = items.reduce((a, i) => a + i.capaBytes, 0);
const mb = (n) => (n / 1024 / 1024).toFixed(1);

console.log(
  `\nPDFs: ${mb(totalPdf)} MB em build/ (fora do git) · capas: ${mb(totalCapa)} MB versionadas em public/`,
);
console.log(`Escrito: ${seedPath.replace(root, ".")}`);
console.log(`Escrito: ${dataPath.replace(root, ".")}`);
console.log(`Escrito: ${statsPath.replace(root, ".")}`);
console.log("\nPróximo passo: node scripts/upload-atividades.mjs — sem isso o");
console.log("bucket fica vazio e o botão \"Baixar Recurso\" não acha o arquivo.");
