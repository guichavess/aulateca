#!/usr/bin/env node
/**
 * Gera `public/favicon.svg` a partir de `src/assets/teca-mascot.svg`.
 *
 * O ícone da aba é a MESMA Teca do app, só que parada: um favicon piscando
 * chama atenção para a aba errada, e em 16px a pálpebra vira um tremor. Em vez
 * de manter duas artes (que divergem no dia em que a mascote mudar), a versão
 * estática é derivada da animada — este script só remove o bloco da piscada.
 *
 * Falha alto se não achar o bloco: melhor quebrar o build do que publicar um
 * favicon animado sem ninguém perceber.
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGEM = join(root, "src", "assets", "teca-mascot.svg");
const DESTINO = join(root, "public", "favicon.svg");

// A piscada e o ultimo bloco do <style>, entao basta cortar dela ate o
// fim do CDATA. Ancorar em '</style>' comeria o ']]>' e deixaria o XML
// quebrado; ancorar no fim do bloco quebraria no CRLF do arquivo.
const INICIO = "/* ═══ Piscar ═══";
const FIM = "]]>";

const AVISO =
  "<!-- GERADO por scripts/build-favicon.mjs a partir de src/assets/teca-mascot.svg.\n" +
  "     Não edite à mão: rode o script depois de mexer na mascote. -->\n";

export function semAnimacao(svg) {
  const i = svg.indexOf(INICIO);
  if (i === -1) {
    throw new Error(
      `bloco da piscada não encontrado em ${ORIGEM}. Se a animação mudou de ` +
        `forma, ajuste scripts/build-favicon.mjs junto.`,
    );
  }
  const j = svg.indexOf(FIM, i);
  if (j === -1) throw new Error("fim do <style> não encontrado depois da piscada");

  const estatico = svg.slice(0, i) + svg.slice(j);
  if (/@keyframes|animation:/.test(estatico)) {
    throw new Error("sobrou animação no favicon depois do corte");
  }
  return estatico;
}

const svg = await readFile(ORIGEM, "utf8");
const estatico = AVISO + semAnimacao(svg);
await writeFile(DESTINO, estatico, "utf8");
console.log(`favicon.svg gerado (${Math.round(estatico.length / 1024)} KB)`);
