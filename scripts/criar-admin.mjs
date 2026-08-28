#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Cria (ou promove) a conta de administrador do Aulateca.
//
// Por que existe: ninguém consegue virar ADMIN por conta própria. A migration
// 006 filtra o papel que vem do cadastro (`self_assignable_role`) e o trigger
// `guard_profile_role_change` barra qualquer UPDATE de role feito por um
// usuário logado. É de propósito — era exatamente assim que dava para se
// autopromover antes. A exceção é a chamada SEM JWT: a service_role passa, e é
// esse o caminho que este script usa.
//
// Consequência prática: num banco novo não existe nenhum admin, e não há tela
// que resolva isso. Ou se roda este script, ou se faz o UPDATE à mão no SQL
// editor do Dashboard.
//
// Credencial: SERVICE ROLE, a chave de maior privilégio do projeto. Ela ignora
// todas as regras de acesso: não vai para o navegador, não entra no repositório
// e não circula por e-mail. Este script roda na sua máquina.
//
// Uso:
//   node scripts/criar-admin.mjs <email>
//   (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY saem do `.env` da raiz)
//     --nome "Fulana de Tal"   nome do perfil (padrão: a parte antes do @)
//     --senha "<senha>"        usa esta senha em vez de gerar uma
//     --listar                 só mostra quem já é admin e sai
//
// Se o e-mail já tiver conta, o script NÃO mexe na senha: só promove.
// ══════════════════════════════════════════════════════════════════════════════

import { randomInt } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { carregarEnvLocal } from "./env-local.mjs";

// Parser posicional simples: as flags com valor consomem o argumento seguinte,
// senão um `--nome "fulano@escola.com"` seria confundido com o e-mail.
const argv = process.argv.slice(2);
const COM_VALOR = new Set(["--nome", "--senha"]);
const flags = {};
const soltos = [];

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (COM_VALOR.has(a)) flags[a] = argv[++i];
  else if (a.startsWith("--")) flags[a] = true;
  else soltos.push(a);
}

const listar = flags["--listar"] === true;
const email = soltos[0];
const nomeArg = flags["--nome"];
const senhaArg = flags["--senha"];

// Lê o `.env` da raiz antes de olhar o ambiente: no PowerShell o prefixo
// `VAR=valor node ...` da doc não funciona, e a chave acabava no histórico.
carregarEnvLocal();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    [
      "Faltam credenciais.",
      "",
      "Preencha no arquivo `.env` da raiz (ele é gitignorado):",
      "  SUPABASE_URL=https://<ref>.supabase.co",
      "  SUPABASE_SERVICE_ROLE_KEY=<service_role>   (Dashboard → Settings → API)",
      "",
      "Depois rode o comando de novo — sem prefixo de variável.",
    ].join("\n"),
  );
  process.exit(1);
}

if (!listar && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))) {
  console.error("Informe o e-mail: node scripts/criar-admin.mjs pessoa@dominio.com");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Senha ────────────────────────────────────────────────────────────────────
// Espelha `src/lib/password.ts` no que importa para GERAR: comprimento, as três
// classes de caractere e a ausência de repetição/sequência. Não é uma segunda
// implementação da política — é um gerador que produz senha aprovada por ela.
const MINUSCULAS = "abcdefghijkmnopqrstuvwxyz";
const MAIUSCULAS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITOS = "23456789";
const SIMBOLOS = "!@#$%&*?-_";

const SEQUENCIAS = ["abcdefghijklmnopqrstuvwxyz", "01234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

function temSequencia(valor) {
  const lower = valor.toLowerCase();
  for (const seq of SEQUENCIAS) {
    const invertida = [...seq].reverse().join("");
    for (const fonte of [seq, invertida]) {
      for (let i = 0; i + 4 <= fonte.length; i++) {
        if (lower.includes(fonte.slice(i, i + 4))) return true;
      }
    }
  }
  return false;
}

function sorteia(alfabeto, quantidade) {
  return Array.from({ length: quantidade }, () => alfabeto[randomInt(alfabeto.length)]);
}

function senhaForte() {
  for (let tentativa = 0; tentativa < 50; tentativa++) {
    const bruta = [
      ...sorteia(MAIUSCULAS, 4),
      ...sorteia(MINUSCULAS, 8),
      ...sorteia(DIGITOS, 4),
      ...sorteia(SIMBOLOS, 2),
    ];
    // Embaralha (Fisher-Yates) para o formato não ser previsível.
    for (let i = bruta.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [bruta[i], bruta[j]] = [bruta[j], bruta[i]];
    }
    const senha = bruta.join("");
    if (!temSequencia(senha) && !/(.)\1{3,}/.test(senha)) return senha;
  }
  throw new Error("não consegui gerar uma senha que passasse na política");
}

// ── Busca de usuário por e-mail ──────────────────────────────────────────────
// A API admin não tem "getUserByEmail": só listagem paginada. Para a escala
// desta base (dezenas a milhares) percorrer as páginas é aceitável.
async function acharPorEmail(alvo) {
  const alvoLower = alvo.toLowerCase();
  for (let page = 1; page <= 100; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers falhou: ${error.message}`);
    const achado = data.users.find((u) => (u.email ?? "").toLowerCase() === alvoLower);
    if (achado) return achado;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function admins() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, created_at")
    .eq("role", "ADMIN")
    .order("created_at");
  if (error) throw new Error(`consulta de admins falhou: ${error.message}`);
  return data ?? [];
}

async function emailDe(id) {
  const { data } = await supabase.auth.admin.getUserById(id);
  return data?.user?.email ?? "(sem e-mail)";
}

// ── --listar ─────────────────────────────────────────────────────────────────
if (listar) {
  const lista = await admins();
  if (lista.length === 0) {
    console.log("Nenhum ADMIN neste projeto — ninguém consegue abrir /admin.");
  } else {
    console.log(`${lista.length} admin(s):`);
    for (const a of lista) console.log(`  ${await emailDe(a.id)}  ${a.name}`);
  }
  process.exit(0);
}

// ── Cria ou promove ──────────────────────────────────────────────────────────
const nome = nomeArg ?? email.split("@")[0];
const existente = await acharPorEmail(email);

let senhaGerada = null;
let userId;

if (existente) {
  userId = existente.id;
  console.log(`Conta já existe (${email}) — promovendo sem tocar na senha.`);
} else {
  const senha = senhaArg ?? (senhaGerada = senhaForte());
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: senha,
    // Sem isto a conta nasce pendente e o login recusa até alguém clicar num
    // e-mail de confirmação que talvez nem esteja configurado ainda.
    email_confirm: true,
    user_metadata: { name: nome },
  });
  if (error) {
    console.error(`Não deu para criar a conta: ${error.message}`);
    process.exit(1);
  }
  userId = data.user.id;
  console.log(`Conta criada: ${email}`);
}

// O perfil é criado pelo trigger `handle_new_user`; com o papel FILTRADO, ou
// seja, nunca ADMIN. A promoção é este UPDATE, que só passa porque a
// service_role chama sem JWT (auth.uid() null) — ver migration 006.
const { data: promovido, error: erroUpdate } = await supabase
  .from("profiles")
  .update({ role: "ADMIN" })
  .eq("id", userId)
  .select("id, name, role");

if (erroUpdate) {
  console.error(`Conta existe, mas a promoção falhou: ${erroUpdate.message}`);
  process.exit(1);
}

if (!promovido?.length) {
  console.error(
    "A conta existe em auth.users mas não há linha em public.profiles.\n" +
      "O trigger handle_new_user não rodou (migrations aplicadas?). Sem perfil,\n" +
      "não há papel — e o app trata a sessão como usuário comum.",
  );
  process.exit(1);
}

console.log(`Papel: ${promovido[0].role} — ${promovido[0].name}`);

if (senhaGerada) {
  console.log("\n  Senha desta conta (aparece uma única vez):\n");
  console.log(`      ${senhaGerada}\n`);
  console.log("  Guarde num cofre de senhas e troque no primeiro acesso, em /perfil.");
}

console.log(`\nPronto. Entre em /login com ${email} e o /admin abre no menu.`);
