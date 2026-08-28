// ══════════════════════════════════════════════════════════════════════════════
// Carrega segredos de servidor do `.env` da raiz para dentro de process.env.
//
// Por que existe: os scripts administrativos pediam as variáveis na linha de
// comando, e o prefixo `VAR=valor node ...` da documentação é sintaxe de bash —
// no PowerShell (o shell do dev deste projeto) ele nem é lido, e o script morre
// com "Faltam credenciais" sem explicar o motivo. Colar a service role key na
// linha de comando também a deixa gravada no histórico do terminal.
//
// O `.env` é gitignorado desde sempre (`.gitignore:13`). Nada aqui INVENTA um
// lugar novo para segredo: só lê o que já era o lugar deles.
//
// Variável que já existe no ambiente VENCE o arquivo — é o que permite a CI e
// um override pontual sem editar arquivo nenhum.
// ══════════════════════════════════════════════════════════════════════════════

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Lê um .env simples (KEY=VALUE). Sem interpolação: segredo não é template. */
export function carregarEnvLocal(arquivo = ".env") {
  let bruto;
  try {
    bruto = readFileSync(resolve(RAIZ, arquivo), "utf8");
  } catch {
    return; // Sem arquivo é cenário normal: quem usa variável de ambiente passa direto.
  }

  for (const linha of bruto.split(/\r?\n/)) {
    const limpa = linha.trim();
    if (!limpa || limpa.startsWith("#")) continue;

    const igual = limpa.indexOf("=");
    if (igual <= 0) continue;

    const chave = limpa.slice(0, igual).trim();
    let valor = limpa.slice(igual + 1).trim();

    // Aspas são delimitador, não conteúdo — colar a chave entre aspas é o
    // reflexo de qualquer um, e sem isto elas iriam junto para o header.
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }

    if (process.env[chave] === undefined) process.env[chave] = valor;
  }
}
