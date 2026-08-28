#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Sobe os PDFs das atividades para o bucket PRIVADO `atividades` (migration 015).
//
// Por que existe: até a Fase 5 os 54 PDFs moravam em public/atividades/, ou
// seja, iam no bundle e eram baixáveis por URL direta — sem sessão, sem compra,
// sem nada. O paywall do app era decoração. Agora o PDF só existe em dois
// lugares: build/ (staging local, fora do git) e o bucket privado, de onde o
// frontend tira uma URL assinada de 60 s por download.
//
// Origem: tudo que estiver em build/atividades/** — as 54 fichas lúdicas
// geradas por scripts/build-atividades.mjs e as 6 avaliações diagnósticas que
// vieram prontas em PDF.
// Destino: bucket `atividades`, com a chave igual ao caminho relativo
//   build/atividades/ludica/<slug>/<slug>.pdf  →  ludica/<slug>/<slug>.pdf
// — exatamente o valor que a migration 012 grava em resources.file_url.
//
// Credencial: SERVICE ROLE. O bucket não tem policy de escrita nenhuma, então
// só a chave de serviço grava nele. Ela NUNCA vai para o navegador; este script
// roda na sua máquina ou no CI.
//
// Uso:
//   node scripts/upload-atividades.mjs
//   (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY saem do `.env` da raiz)
//   ... --dry-run   lista o que subiria e sai
//   ... --force     re-envia mesmo o que já está lá com o mesmo tamanho
// ══════════════════════════════════════════════════════════════════════════════

import { existsSync, statSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, posix, relative, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { carregarEnvLocal } from "./env-local.mjs";

const root = resolve(import.meta.dirname, "..");
const BUILD_BASE = join(root, "build", "atividades");
const PDF_BASE = join(BUILD_BASE, "ludica");
const BUCKET = "atividades";

const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const force = argv.includes("--force");

// Lê o `.env` da raiz antes de olhar o ambiente: no PowerShell o prefixo
// `VAR=valor node ...` da doc não funciona, e a chave acabava no histórico.
carregarEnvLocal();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!dryRun && (!url || !serviceKey)) {
  console.error(
    [
      "Faltam credenciais.",
      "",
      "Preencha no arquivo `.env` da raiz (ele é gitignorado):",
      "  SUPABASE_URL=https://<ref>.supabase.co",
      "  SUPABASE_SERVICE_ROLE_KEY=<service_role>   (Dashboard → Settings → API)",
      "",
      "Depois rode o comando de novo — sem prefixo de variável.",
      "Use --dry-run para conferir a lista sem credencial.",
    ].join("\n"),
  );
  process.exit(1);
}

const manifest = JSON.parse(
  await readFile(join(root, "scripts", "atividades.manifest.json"), "utf8"),
);

// O manifesto é a fonte da verdade do que DEVE existir. Um PDF ausente aqui
// vira um "Baixar Recurso" quebrado em produção, então falha antes de subir
// qualquer coisa — melhor um erro no terminal que um acervo pela metade.
const faltando = manifest
  .map((entry) => ({
    slug: entry.slug,
    local: join(PDF_BASE, entry.slug, `${entry.slug}.pdf`),
  }))
  .filter((p) => !existsSync(p.local));

if (faltando.length > 0) {
  console.error(`\n✗ ${faltando.length} PDF(s) do manifesto não estão em build/:\n`);
  faltando.forEach((p) => console.error(`  ${p.slug}`));
  console.error("\n→ node scripts/build-atividades.mjs\n");
  process.exit(1);
}

// Além das fichas do manifesto, sobe qualquer outro PDF que esteja em
// build/atividades/ — hoje são as 6 avaliações diagnósticas, que vieram
// prontas do gestor e não passam pelo pipeline de geração. Elas também eram
// baixáveis por URL direta em public/ até a Fase 5.
async function pdfsEmBuild(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await pdfsEmBuild(full)));
    else if (extname(entry.name).toLowerCase() === ".pdf") out.push(full);
  }
  return out;
}

if (!existsSync(BUILD_BASE)) {
  console.error(`\n✗ ${BUILD_BASE} não existe.\n\n→ node scripts/build-atividades.mjs\n`);
  process.exit(1);
}

const planejado = (await pdfsEmBuild(BUILD_BASE))
  .map((local) => ({
    local,
    key: relative(BUILD_BASE, local).split(/[\\/]/).join(posix.sep),
  }))
  .sort((a, b) => a.key.localeCompare(b.key));

const kb = (n) => `${Math.round(n / 1024)} KB`;

if (dryRun) {
  console.log(`${planejado.length} arquivo(s) subiriam para ${BUCKET}/:\n`);
  for (const p of planejado) console.log(`  ${p.key.padEnd(72)} ${kb(statSync(p.local).size)}`);
  process.exit(0);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// O que já está lá, por pasta. Evita re-subir 21 MB a cada execução.
async function remotoAtual() {
  const pastas = [...new Set(planejado.map((p) => posix.dirname(p.key)))];
  const mapa = new Map();
  for (const pasta of pastas) {
    const { data, error } = await supabase.storage.from(BUCKET).list(pasta, { limit: 100 });
    if (error) {
      // Pasta inexistente devolve lista vazia, não erro; erro aqui é outra
      // coisa (bucket ausente, chave errada) e vale parar.
      console.error(`✗ não consegui listar ${pasta}: ${error.message}`);
      process.exit(1);
    }
    for (const f of data ?? []) mapa.set(`${pasta}/${f.name}`, f.metadata?.size ?? null);
  }
  return mapa;
}

const remoto = await remotoAtual();

let enviados = 0;
let pulados = 0;

for (const p of planejado) {
  const bytes = await readFile(p.local);
  const jaTem = remoto.get(p.key);

  if (!force && jaTem === bytes.length) {
    pulados += 1;
    console.log(`· em dia  ${p.key.padEnd(72)} ${kb(bytes.length)}`);
    continue;
  }

  const { error } = await supabase.storage.from(BUCKET).upload(p.key, bytes, {
    contentType: "application/pdf",
    // upsert: o mesmo slug pode ter arte corrigida depois; sem isso o segundo
    // envio falha com "already exists" e o acervo congela na primeira versão.
    upsert: true,
  });

  if (error) {
    console.error(`\n✗ falhou em ${p.key}: ${error.message}`);
    process.exit(1);
  }

  enviados += 1;
  console.log(`✓ enviado ${p.key.padEnd(72)} ${kb(bytes.length)}`);
}

console.log(`\n${enviados} enviado(s), ${pulados} já em dia, ${planejado.length} no total.`);
console.log(
  "O bucket é privado: nenhuma dessas chaves abre por URL direta. O app assina\n" +
    "cada download por 60 s, e só para quem tem acesso pago.",
);
