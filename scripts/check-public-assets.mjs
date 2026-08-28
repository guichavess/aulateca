#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Trava de build: garante que todo asset de public/ referenciado pelo código
// exista em disco E esteja versionado no git.
//
// Por que existe: public/landing/ nunca foi commitado, então tutorial.mp4 e
// telaInicial.jpeg davam 200 com o HTML do SPA em produção (o rewrite
// catch-all do vercel.json engole o 404) e o vídeo da landing ficava morto —
// sem erro nenhum no build local, porque no disco do dev os arquivos existem.
// ══════════════════════════════════════════════════════════════════════════════

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, posix, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const publicDir = join(root, "public");

// Onde procurar referências
const scanDirs = [join(root, "src")];
const scanFiles = [join(root, "index.html")];
const scanExt = /\.(tsx?|jsx?|css|html)$/;

// Testes não vão para o deploy, então um caminho dentro deles nunca é um asset
// de produção — é fixture. Sem esta exclusão, `image_url: '/catalog/x.png'` num
// mock de resources.service.test.ts reprova o build inteiro.
const testFile = /\.(test|spec)\.[jt]sx?$/;

// "/algo/arquivo.ext" dentro de quotes ou template string
const assetRef = /["'`](\/[A-Za-z0-9_\-./%]+\.[A-Za-z0-9]{2,5})["'`]/g;

async function collectFiles(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await collectFiles(full)));
    } else if (scanExt.test(entry.name) && !testFile.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

// Todos os arquivos de um diretório, sem filtro de extensão.
async function collectAll(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await collectAll(full)));
    else out.push(full);
  }
  return out;
}

function trackedPublicFiles() {
  try {
    const out = execFileSync("git", ["ls-files", "public"], {
      cwd: root,
      encoding: "utf8",
    });
    return new Set(
      out
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    );
  } catch {
    // Sem git disponível (tarball, container sem .git): só checa existência.
    return null;
  }
}

const files = [
  ...scanFiles.filter((f) => existsSync(f)),
  ...(await Promise.all(scanDirs.filter((d) => existsSync(d)).map(collectFiles))).flat(),
];

// asset -> lista de "arquivo:linha" que o referenciam
const refs = new Map();

for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const match of line.matchAll(assetRef)) {
      const url = match[1].split(/[?#]/)[0];
      if (!refs.has(url)) refs.set(url, []);
      refs.get(url).push(`${relative(root, file).replace(/\\/g, "/")}:${i + 1}`);
    }
  });
}

const tracked = trackedPublicFiles();
const missing = [];
const untracked = [];

// Subpastas que existem em public/ hoje (landing, catalog, atividades...).
// Uma referência só é tratada como asset de public/ se cair numa delas ou se
// for arquivo na raiz (/robots.txt). Assim rotas do SPA e URLs de API não
// viram falso positivo.
const publicTopLevel = new Set(
  (await readdir(publicDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name),
);

let checked = 0;

for (const [url, where] of refs) {
  const rel = url.replace(/^\//, "");
  const segments = rel.split("/");
  const isRootFile = segments.length === 1;
  const inPublicDir = segments.length > 1 && publicTopLevel.has(segments[0]);

  if (!isRootFile && !inPublicDir) continue;
  checked += 1;

  const onDisk = join(publicDir, rel);
  if (!existsSync(onDisk) || !statSync(onDisk).isFile()) {
    missing.push({ url, where });
    continue;
  }

  if (tracked && !tracked.has(posix.join("public", rel))) {
    untracked.push({ url, where });
  }
}

// ── Checagem por pasta ────────────────────────────────────────────────────────
// A varredura acima só enxerga caminhos literais. Boa parte do projeto monta a
// URL dinamicamente (`/catalog/${name}.png` em lib/catalogData.ts), e nesses
// casos a regex não alcança. No nível de pasta dá pra pegar o pior cenário —
// que é exatamente o que aconteceu com public/landing/: a pasta inteira fora do
// git, invisível pro deploy.
const orphanDirs = [];
const partialDirs = [];

if (tracked) {
  for (const dir of publicTopLevel) {
    const onDisk = (await collectAll(join(publicDir, dir))).map((f) =>
      posix.join("public", relative(publicDir, f).replace(/\\/g, "/")),
    );
    if (onDisk.length === 0) continue;

    const naoVersionados = onDisk.filter((f) => !tracked.has(f));
    if (naoVersionados.length === onDisk.length) {
      orphanDirs.push({ dir, total: onDisk.length });
    } else if (naoVersionados.length > 0) {
      partialDirs.push({ dir, arquivos: naoVersionados });
    }
  }
}

// Avisos não bloqueiam: arquivo solto que ninguém referencia não quebra página.
if (partialDirs.length > 0) {
  console.warn("\n⚠ Arquivos em public/ fora do git (não vão pro deploy):\n");
  for (const { dir, arquivos } of partialDirs) {
    console.warn(`  public/${dir}/`);
    arquivos.forEach((f) => console.warn(`    ${f}`));
  }
  console.warn(
    "\n  Nenhum deles é referenciado por caminho literal no código. Se algum for\n" +
      "  usado via caminho montado em runtime, commite antes do próximo deploy.\n",
  );
}

// ── Trava do paywall ────────────────────────────────────────────
// Conteúdo pago não pode voltar para public/. Tudo em public/ vira URL pública
// no deploy: um PDF aqui é baixável por quem tem o link, sem sessão e sem compra
// — que foi exatamente a situação corrigida na Fase 5, quando os 60 PDFs saíram
// daqui para o bucket privado `atividades`. As capas .webp continuam aqui de
// propósito: capa é vitrine.
const pdfsEmPublic = (await collectAll(publicDir))
  .map((f) => posix.join("public", relative(publicDir, f).replace(/\\/g, "/")))
  .filter((f) => f.toLowerCase().endsWith(".pdf"));

const erros =
  missing.length + untracked.length + orphanDirs.length + pdfsEmPublic.length;

if (erros === 0) {
  console.log(
    `✓ assets de public/: ${checked} referência(s) literal(is) verificada(s), tudo em disco e versionado.`,
  );
  process.exit(0);
}

if (pdfsEmPublic.length > 0) {
  console.error("\n✗ Conteúdo pago em public/ (vai para o deploy como URL aberta):\n");
  pdfsEmPublic.forEach((f) => console.error(`  ${f}`));
  console.error(
    "\nPDF em public/ é baixável sem login e sem compra. O lugar dele é o bucket\n" +
      "privado `atividades`:\n" +
      "  1. mova o arquivo para build/atividades/\n" +
      "  2. node scripts/upload-atividades.mjs\n" +
      "  3. grave em resources.file_url o caminho dentro do bucket (sem barra inicial)\n",
  );
}

if (missing.length + untracked.length + orphanDirs.length > 0) {
  console.error("\n✗ Assets de public/ com problema:\n");
}

for (const { url, where } of missing) {
  console.error(`  AUSENTE EM DISCO  ${url}`);
  where.forEach((w) => console.error(`                    ← ${w}`));
}

for (const { url, where } of untracked) {
  console.error(`  NÃO VERSIONADO    ${url}`);
  where.forEach((w) => console.error(`                    ← ${w}`));
  console.error(`                    → git add public${url}`);
}

for (const { dir, total } of orphanDirs) {
  console.error(`  PASTA INTEIRA FORA DO GIT  public/${dir}/ (${total} arquivo(s))`);
  console.error(`                    → git add public/${dir}`);
}

if (missing.length + untracked.length + orphanDirs.length > 0) {
  console.error(
    "\nArquivo fora do git existe na sua máquina mas NÃO no deploy: o rewrite\n" +
      "catch-all do vercel.json devolve index.html no lugar dele e a página quebra\n" +
      "sem erro visível. Commite o arquivo ou remova a referência.\n",
  );
}

process.exit(1);
