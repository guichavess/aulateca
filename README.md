# AulaTeca

Acervo de atividades de produção e interpretação de texto para o Ensino Fundamental,
vendido como acesso pago. A professora compra, entra, escolhe a ficha e imprime.

- **Landing** (`/landing`) — a página de vendas, para quem ainda não comprou. Os números que
  ela anuncia saem de `src/lib/acervo.stats.ts`, gerado a partir do acervo real: a página
  nunca promete mais fichas do que existem.
- **Aplicação** — Home, Explorar, Categorias, Favoritos e Perfil, atrás de login e do
  `PaidGuard`. As fichas em PDF vivem num bucket privado do Supabase; o download é uma URL
  assinada de curta duração, emitida só para quem tem acesso pago.
- **Admin** (`/admin`) — cadastro e edição das atividades do catálogo público.

## Como rodar

O passo a passo completo — pré-requisitos, variáveis de ambiente, Supabase local — está em
[`docs/COMO_RODAR.md`](docs/COMO_RODAR.md). O caminho curto:

```sh
npm install
npm run dev
```

Comandos do dia a dia:

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o Vite em modo desenvolvimento |
| `npm test` | Roda a suíte (Vitest) |
| `npm run typecheck` | Checagem de tipos |
| `npm run lint` | ESLint |
| `npm run build` | Build de produção (o `prebuild` valida os assets referenciados) |
| `npm run admin:criar` | Cria um usuário administrador |

## O acervo

As fichas **não** são digitadas à mão. `scripts/atividades.manifest.json` descreve cada uma, e

```sh
node scripts/build-atividades.mjs
```

monta os PDFs em `build/atividades/` (fora do git), grava as capas em `public/atividades/` e
regenera três arquivos versionados: a migration de seed
`supabase/migrations/012_seed_atividades_ludicas.sql`, o fallback do frontend
`src/lib/atividades.data.ts` e os números da landing `src/lib/acervo.stats.ts`. Nenhum dos três
se edita à mão — mexe-se no manifesto e roda o script.

Depois de gerar, os PDFs precisam ir para o bucket privado:

```sh
node scripts/upload-atividades.mjs --dry-run   # confere as chaves de destino
node scripts/upload-atividades.mjs             # exige SUPABASE_SERVICE_ROLE_KEY
```

Sem esse upload o botão "Baixar Recurso" não acha arquivo nenhum, mesmo para quem pagou.

## Pagamento

A venda é pela Cakto: o webhook cria a conta e libera o acesso. O fluxo, os campos do payload e
o que fazer quando um pagamento não libera estão em
[`docs/integracao-cakto.md`](docs/integracao-cakto.md).

## Pendências

O que depende de decisão ou credencial do gestor — chaves, senha do banco de produção, domínio,
plano do Supabase — fica em [`docs/pendencias-gestao.md`](docs/pendencias-gestao.md).

## Stack

Vite · React · TypeScript · Tailwind CSS · shadcn/ui · Supabase (Postgres, Auth, Storage,
Edge Functions) · Vitest.
