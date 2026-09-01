// ════════════════════════════════════════════════════════════════════════════
// Como falar com a gente — fonte única dos canais de suporte.
//
// Por que existe: até aqui o app inteiro não tinha um `mailto:`, um telefone
// ou um formulário. A tela de acesso encerrado chegava a dizer "se isso não
// foi você, fale com a gente" — e não oferecia ninguém. Quem caía lá era
// justamente o cliente que pagou e foi bloqueado por engano.
//
// Os dois canais vêm de variável de ambiente e cada um some sozinho quando a
// sua variável está vazia, mesmo padrão do CHECKOUT_URL. Isso é de propósito:
// um link de suporte quebrado é pior que a ausência dele.
//
// ⚠️ Sem VITE_SUPORTE_EMAIL / VITE_SUPORTE_WHATSAPP configurados no Vercel, o
// bloco de suporte não aparece em produção — e o problema volta em silêncio.
// Conferir na tela /acesso depois de cada deploy novo de ambiente.
// ════════════════════════════════════════════════════════════════════════════

const email = (import.meta.env.VITE_SUPORTE_EMAIL ?? '').trim();

/** Só dígitos, com DDI. "5511999998888". O wa.me não aceita máscara. */
const whatsapp = (import.meta.env.VITE_SUPORTE_WHATSAPP ?? '').replace(/\D/g, '');

export const temSuporte = Boolean(email || whatsapp);

/**
 * Monta o `mailto:` com assunto e corpo prontos.
 *
 * O corpo já vai preenchido com o contexto (conta, tela, id do erro) porque a
 * primeira resposta do suporte é sempre "qual seu e-mail?" — e quem está
 * travado é a pessoa com menos paciência para essa ida e volta.
 *
 * Devolve `null` quando não há e-mail configurado, para a UI não desenhar um
 * link morto.
 */
export function suporteMailto(assunto: string, corpo?: string): string | null {
  if (!email) return null;
  const params = new URLSearchParams({ subject: assunto });
  if (corpo) params.set('body', corpo);
  // O URLSearchParams codifica espaço como '+', que o mailto lê como '+'
  // literal no assunto. %20 funciona nos dois.
  return `mailto:${email}?${params.toString().replace(/\+/g, '%20')}`;
}

/** Devolve `null` quando não há número configurado. */
export function suporteWhatsappUrl(mensagem: string): string | null {
  if (!whatsapp) return null;
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

/** Endereço em texto, para quem prefere copiar a clicar. */
export const suporteEmailVisivel = email;
