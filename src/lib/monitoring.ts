// ════════════════════════════════════════════════════════════════════════════
// Monitoramento de erro — como a gente descobre que quebrou.
//
// Até aqui, um erro de render virava tela branca e o único alarme possível era
// o professor reclamar. Só que não havia canal para reclamar, então o alarme
// nunca tocava: a falha era invisível dos dois lados.
//
// O Sentry só liga quando VITE_SENTRY_DSN existe. Em dev a variável fica vazia
// de propósito — erro de quem está programando não deve gastar a cota do plano
// gratuito (5 mil eventos/mês) nem virar alerta de madrugada.
//
// ⚠️ O CSP em vercel.json precisa liberar o host do DSN em `connect-src`. Se
// não liberar, o envio falha em SILÊNCIO: o navegador bloqueia, o Sentry não
// reclama, e o painel fica vazio parecendo que nada quebrou. Conferir a aba
// Network depois de configurar.
//
// ── Por que o import é dinâmico ──────────────────────────────────────────────
// Estático, o SDK acrescenta ~31 kB gzip ao chunk de entrada — quase o dobro do
// que ele era — e esse chunk é o que o professor baixa no 4G da escola antes de
// ver qualquer coisa. Carregado depois, ele custa zero no primeiro paint.
//
// O preço é uma janela de alguns instantes no começo, justamente onde mora o
// erro de primeiro render. Por isso existe a fila abaixo: o que quebra antes do
// SDK chegar é guardado e enviado assim que ele chega. O que se perde nessa
// janela não é o relatório — é só o código do evento na tela, que a pessoa
// usaria para abrir o chamado.
//
// ⚠️ O chunk do SDK sai em ~163 kB gzip, e isso não é pouco. Tentar enxugá-lo
// pela lista de integrações não adianta: o barrel do @sentry/react tem efeito
// colateral e o bundler não consegue podar. Se um dia esse peso incomodar, o
// caminho é trocar o SDK por um cliente próprio contra a API de store do
// Sentry — não mexer nas integrações.
// ════════════════════════════════════════════════════════════════════════════
import type * as SentryTipos from '@sentry/react';

const dsn = (import.meta.env.VITE_SENTRY_DSN ?? '').trim();

export const monitoramentoAtivo = Boolean(dsn);

let sentry: typeof SentryTipos | null = null;
let usuarioPendente: string | null = null;
const filaDeErros: { erro: unknown; contexto?: Record<string, unknown> }[] = [];

export function iniciarMonitoramento(): void {
  if (!monitoramentoAtivo) return;

  void import('@sentry/react')
    .then((mod) => {
      mod.init({
        dsn,
        environment: import.meta.env.MODE,
        // Só erro, por enquanto. Tracing multiplica o volume de eventos, e é a
        // cota do plano gratuito que garante que o alerta do erro real chegue.
        tracesSampleRate: 0,
        // O padrão manda IP e cabeçalhos da pessoa junto. O que precisamos para
        // depurar é o stack trace, não o professor.
        sendDefaultPii: false,
      });
      sentry = mod;

      if (usuarioPendente) mod.setUser({ id: usuarioPendente });
      while (filaDeErros.length) {
        const item = filaDeErros.shift()!;
        mod.captureException(item.erro, item.contexto ? { extra: item.contexto } : undefined);
      }
    })
    .catch((e) => {
      // Falhar em carregar o monitoramento não pode derrubar o app: seria a
      // ferramenta de observar quedas causando a queda.
      console.error('[monitoramento] não foi possível carregar o Sentry', e);
    });
}

/**
 * Marca quem estava na tela quando quebrou — pelo **id**, nunca pelo e-mail.
 *
 * O id basta para saber se um erro atingiu uma pessoa ou trezentas, e para
 * cruzar com o banco quando for preciso. O e-mail transformaria o painel do
 * Sentry numa cópia da base de clientes.
 */
export function identificarUsuario(id: string | null | undefined): void {
  if (!monitoramentoAtivo) return;
  usuarioPendente = id ?? null;
  if (sentry) sentry.setUser(id ? { id } : null);
}

/**
 * Reporta e devolve o id do evento, que a tela de erro mostra para a pessoa.
 * Devolve `null` quando o SDK ainda não chegou — o erro entra na fila.
 */
export function reportarErro(erro: unknown, contexto?: Record<string, unknown>): string | null {
  if (!monitoramentoAtivo) {
    // Sem Sentry configurado o erro ainda precisa aparecer em algum lugar —
    // senão o dev depura uma tela de erro sem stack trace nenhum.
    console.error('[erro capturado]', erro, contexto);
    return null;
  }
  if (!sentry) {
    filaDeErros.push({ erro, contexto });
    return null;
  }
  return sentry.captureException(erro, contexto ? { extra: contexto } : undefined);
}
