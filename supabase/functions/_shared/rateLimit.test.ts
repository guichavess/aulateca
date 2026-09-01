/**
 * O freio de abuso das três portas públicas.
 *
 * Estas regras decidem quantas vezes alguém pode bater em `criar-acesso`,
 * `recuperar-senha` e `entrar` antes de a porta emperrar. Um erro aqui não
 * aparece em uso normal — aparece como e-mail de recuperação disparado em
 * massa, ou como senha adivinhada sem ninguém contar as tentativas.
 */
import { webcrypto } from 'node:crypto';
import { describe, it, expect } from 'vitest';
import {
  clientIp,
  hashIp,
  isEmailShaped,
  normalizeEmail,
  rateLimitExceeded,
  rateLimitWindowStart,
  RATE_LIMIT_PER_EMAIL,
  RATE_LIMIT_PER_IP,
  RATE_LIMIT_WINDOW_MINUTES,
} from './rateLimit.ts';

// O jsdom do vitest não traz `crypto.subtle`; o Deno das Edge Functions traz.
// Emprestar o do Node deixa o teste rodar contra a implementação de verdade,
// em vez de dublar justamente a parte que faz o hash.
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
}

describe('rateLimitExceeded', () => {
  it('só barra ao ATINGIR o teto, nunca antes', () => {
    expect(rateLimitExceeded({ byIp: 0, byEmail: 0 })).toBe(false);
    expect(rateLimitExceeded({ byIp: RATE_LIMIT_PER_IP - 1, byEmail: 0 })).toBe(false);
    expect(rateLimitExceeded({ byIp: RATE_LIMIT_PER_IP, byEmail: 0 })).toBe(true);
    expect(rateLimitExceeded({ byIp: 0, byEmail: RATE_LIMIT_PER_EMAIL - 1 })).toBe(false);
    expect(rateLimitExceeded({ byIp: 0, byEmail: RATE_LIMIT_PER_EMAIL })).toBe(true);
  });

  it('o teto por e-mail é mais apertado que o por IP', () => {
    // Uma escola inteira sai pelo mesmo IP; um e-mail é uma pessoa só.
    expect(RATE_LIMIT_PER_EMAIL).toBeLessThan(RATE_LIMIT_PER_IP);
  });
});

describe('rateLimitWindowStart', () => {
  it('recua exatamente a janela configurada', () => {
    const agora = new Date('2026-03-10T12:00:00Z');
    expect(rateLimitWindowStart(agora)).toBe('2026-03-10T11:00:00.000Z');
    expect(RATE_LIMIT_WINDOW_MINUTES).toBe(60);
  });
});

describe('normalizeEmail', () => {
  it('apara e minúscula, como o trigger do banco', () => {
    expect(normalizeEmail('  Comprador@Example.COM ')).toBe('comprador@example.com');
  });

  it('devolve string vazia para qualquer coisa que não seja texto', () => {
    expect(normalizeEmail(null)).toBe('');
    expect(normalizeEmail(undefined)).toBe('');
    expect(normalizeEmail(42)).toBe('');
  });
});

describe('isEmailShaped', () => {
  it.each(['ana@escola.com.br', 'a@b.co'])('aceita %s', (email) => {
    expect(isEmailShaped(email)).toBe(true);
  });

  it.each(['', 'ana', 'ana@escola', 'ana escola@x.com', 'a@b.c'])('recusa %j', (email) => {
    expect(isEmailShaped(email)).toBe(false);
  });
});

describe('clientIp', () => {
  it('pega o primeiro item do x-forwarded-for', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe('203.0.113.7');
  });

  it('não devolve string vazia quando o header não vem', () => {
    // String vazia viraria "todo mundo é o mesmo IP" silenciosamente; o rótulo
    // explícito mantém a contagem legível.
    expect(clientIp(new Headers())).toBe('desconhecido');
  });
});

describe('hashIp', () => {
  it('é estável e não devolve o IP em claro', async () => {
    const hash = await hashIp('203.0.113.7', 'sal');
    expect(hash).toBe(await hashIp('203.0.113.7', 'sal'));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain('203.0.113.7');
  });

  it('IPs diferentes e sais diferentes dão hashes diferentes', async () => {
    expect(await hashIp('203.0.113.7', 'sal')).not.toBe(await hashIp('203.0.113.8', 'sal'));
    expect(await hashIp('203.0.113.7', 'sal')).not.toBe(await hashIp('203.0.113.7', 'outro'));
  });
});
