import { describe, it, expect } from 'vitest';
import {
  accessLinkToken,
  buildAccessLink,
  decideEmail,
  encodeEmailParam,
  escapeHtml,
  firstName,
  renderAccessEmail,
  verifyAccessLinkToken,
} from './email.ts';

const SEGREDO = 'segredo-de-teste-bem-longo-para-hmac';

describe('decideEmail', () => {
  it('convida a criar a senha quando ainda não existe conta', () => {
    expect(decideEmail({ user_id: null, access_email_sent_at: null }, 'grant')).toEqual({
      send: true,
      template: 'criar_acesso',
    });
  });

  it('avisa que liberou quando a conta já existe', () => {
    expect(decideEmail({ user_id: 'uuid-da-conta', access_email_sent_at: null }, 'grant')).toEqual({
      send: true,
      template: 'acesso_liberado',
    });
  });

  it('não reenvia para quem já foi avisado — o caso da renovação mensal', () => {
    const decisao = decideEmail(
      { user_id: 'uuid-da-conta', access_email_sent_at: '2026-01-10T12:00:00Z' },
      'grant',
    );
    expect(decisao.send).toBe(false);
  });

  it('não manda e-mail em cancelamento, reembolso ou evento sem efeito', () => {
    const linha = { user_id: null, access_email_sent_at: null };
    expect(decideEmail(linha, 'cancel').send).toBe(false);
    expect(decideEmail(linha, 'revoke').send).toBe(false);
    expect(decideEmail(linha, 'log').send).toBe(false);
  });

  it('não manda e-mail sem a linha do acesso', () => {
    expect(decideEmail(null, 'grant')).toMatchObject({ send: false });
  });
});

describe('link de acesso', () => {
  it('o e-mail vai em base64url e volta inteiro', () => {
    const param = encodeEmailParam('  Comprador@Example.COM ');
    expect(param).not.toMatch(/[+/=]/);
    expect(atob(param.replace(/-/g, '+').replace(/_/g, '/'))).toBe('comprador@example.com');
  });

  it('o token é estável para o mesmo e-mail e segredo', async () => {
    const a = await accessLinkToken('joana@escola.com', SEGREDO);
    const b = await accessLinkToken('JOANA@ESCOLA.COM ', SEGREDO);
    expect(a).toBe(b);
  });

  it('muda com o e-mail e com o segredo', async () => {
    const base = await accessLinkToken('joana@escola.com', SEGREDO);
    expect(await accessLinkToken('outra@escola.com', SEGREDO)).not.toBe(base);
    expect(await accessLinkToken('joana@escola.com', 'outro-segredo')).not.toBe(base);
  });

  it('verifica o token e recusa o adulterado', async () => {
    const token = await accessLinkToken('joana@escola.com', SEGREDO);
    expect(await verifyAccessLinkToken('joana@escola.com', token, SEGREDO)).toBe(true);
    // Trocar o e-mail mantendo o token é exatamente o ataque que ele impede:
    // mandar ao comprador um link que cria a conta no e-mail errado.
    expect(await verifyAccessLinkToken('atacante@escola.com', token, SEGREDO)).toBe(false);
    expect(await verifyAccessLinkToken('joana@escola.com', `${token}x`, SEGREDO)).toBe(false);
  });

  it('monta a URL de /criar-acesso sem barra dupla', async () => {
    const link = await buildAccessLink('https://aulateca.com.br/', 'joana@escola.com', SEGREDO);
    expect(link.startsWith('https://aulateca.com.br/criar-acesso?e=')).toBe(true);
    expect(link).toContain('&t=');
  });

  it('sem segredo, ainda gera link — só sem assinatura', async () => {
    const link = await buildAccessLink('https://aulateca.com.br', 'joana@escola.com', '');
    expect(link).toContain('/criar-acesso?e=');
    expect(link).not.toContain('&t=');
  });
});

describe('conteúdo do e-mail', () => {
  const base = {
    link: 'https://aulateca.com.br/criar-acesso?e=abc&t=def',
    loginUrl: 'https://aulateca.com.br/login',
    customerName: 'Joana Silva Prado',
    productName: 'Aulateca — Acervo completo',
    supportEmail: 'suporte@aulateca.com.br',
  };

  it('o convite aponta para /criar-acesso e pede o mesmo e-mail da compra', () => {
    const { subject, html, text } = renderAccessEmail({ ...base, template: 'criar_acesso' });
    expect(subject).toContain('crie sua senha');
    // No HTML o `&` da query vai escapado — é o correto num href, e os clientes
    // de e-mail desfazem sozinhos. No texto puro o link vai literal.
    expect(html).toContain(base.link.replace('&', '&amp;'));
    expect(text).toContain(base.link);
    expect(text).toContain('mesmo e-mail da compra');
    expect(text).toContain('Oi, Joana!');
  });

  it('quem já tem conta é mandado para o login, não para o cadastro', () => {
    const { subject, html, text } = renderAccessEmail({ ...base, template: 'acesso_liberado' });
    expect(subject).toContain('liberado');
    expect(html).toContain(base.loginUrl);
    expect(html).not.toContain('/criar-acesso');
    expect(text).not.toContain('/criar-acesso');
  });

  it('funciona sem nome e sem e-mail de suporte', () => {
    const { html, text } = renderAccessEmail({
      template: 'criar_acesso',
      link: base.link,
      loginUrl: base.loginUrl,
      customerName: null,
      productName: null,
      supportEmail: null,
    });
    expect(text.startsWith('Oi!')).toBe(true);
    expect(html).toContain('Aulateca');
    expect(html).not.toContain('mailto:');
  });

  it('escapa o que veio da Cakto — o nome do produto é campo de terceiro', () => {
    const { html } = renderAccessEmail({
      ...base,
      template: 'criar_acesso',
      productName: '<script>alert(1)</script>',
    });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('helpers', () => {
  it('escapeHtml cobre os cinco caracteres', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;',
    );
  });

  it('firstName ignora nome vazio ou de uma letra', () => {
    expect(firstName('Joana Silva')).toBe('Joana');
    expect(firstName('  ')).toBe('');
    expect(firstName('J')).toBe('');
    expect(firstName(null)).toBe('');
  });
});
