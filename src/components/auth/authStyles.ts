/**
 * Classes compartilhadas pelas telas de autenticação.
 *
 * O card do AuthShell é CLARO: `.glass-card` hoje é `.sticker-surface`, com
 * `background: hsl(var(--card))`. Dentro dele a tipografia tem que sair dos
 * tokens de tema — `text-white` ali vira texto invisível. Só o que fica FORA
 * do card, sobre o fundo #0A0A12 (marca, rodapé), é branco.
 *
 * Estas strings viviam copiadas em quatro páginas, e foi exatamente por isso
 * que as telas novas nasceram ilegíveis: a login foi corrigida, as cópias não.
 */
export const authLabelClass = 'font-fredoka text-sm font-bold text-ink mb-1.5 block';

/* `field-sticker` (src/index.css) traz o traço de 2px, o raio de botão e o
   foco azul-céu do design system. O que estava aqui era um campo à parte:
   borda de 1px translúcida sobre fundo cinza — visivelmente de outro kit que
   o botão logo abaixo dele, que já era adesivo. */
export const authInputClass =
  'field-sticker w-full h-11 px-3.5 text-foreground placeholder:text-muted-foreground';

/* Esta string estava copiada em seis telas de acesso. Fredoka bold, e não
   `font-semibold` em Nunito: é o mesmo rótulo dos botões do resto do app. */
export const authButtonClass =
  'w-full h-12 flex items-center justify-center gap-2 font-fredoka font-bold text-base tracking-[0.02em] btn-primary-glow disabled:opacity-45 disabled:shadow-none';

/* A antiga `authErrorClass` saiu daqui: quem desenha erro agora é o
   <AuthAlert>. Deixar o export morto foi exatamente o que deixou a LoginPage
   divergir das outras telas. */
