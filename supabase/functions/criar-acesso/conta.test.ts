import { describe, it, expect } from 'vitest';
import { passwordProblems as clientProblems } from '@/lib/password';
import {
  hasActiveEntitlement,
  isAlreadyRegistered,
  isEntitlementActive,
  normalizeEmail,
  parseRequest,
  passwordProblems,
  rateLimitExceeded,
  rateLimitWindowStart,
  resolveRole,
  RATE_LIMIT_PER_EMAIL,
  RATE_LIMIT_PER_IP,
} from './conta.ts';

const agora = new Date('2026-03-10T12:00:00Z');
const futuro = '2026-04-10T12:00:00Z';
const passado = '2026-02-10T12:00:00Z';

describe('política de senha', () => {
  // As duas implementações são espelho declarado uma da outra. Este bloco é o
  // que impede a cópia do servidor de sair de sincronia com a do cliente em
  // silêncio — o cenário ruim é o servidor recusar uma senha que a tela acabou
  // de aprovar com todos os checkmarks verdes.
  const casos: Array<[string, { email?: string; name?: string } | undefined]> = [
    ['', undefined],
    ['curta1A', undefined],
    ['senha123', undefined],
    ['ABCDEFGHIJ', undefined],
    ['abcdefghij', undefined],
    ['Girassol#2026', undefined],
    ['Qwertyuiop1', undefined],
    ['aaaaBBBB1111', undefined],
    ['Mariana2026!', { name: 'Mariana Souza', email: 'mariana@escola.com' }],
    ['Professora#77', { email: 'professora@escola.com' }],
    ['Chuva-Amarela-42', { name: 'Ana', email: 'ana@escola.com' }],
  ];

  it.each(casos)('devolve os mesmos problemas do cliente para %j', (senha, ctx) => {
    expect(passwordProblems(senha, ctx).sort()).toEqual(clientProblems(senha, ctx).sort());
  });

  it('aceita uma senha forte', () => {
    expect(passwordProblems('Girassol#2026', { email: 'joana@escola.com' })).toEqual([]);
  });

  it('recusa senha que contém o nome', () => {
    expect(passwordProblems('Mariana2026!', { name: 'Mariana Souza' })).toContain(
      'Não contém seu nome nem seu e-mail',
    );
  });
});

describe('resolveRole', () => {
  it('mapeia as chaves conhecidas', () => {
    expect(resolveRole('teacher')).toBe('PROFESSOR');
    expect(resolveRole('parent')).toBe('PAI_MAE');
    expect(resolveRole('therapist')).toBe('TERAPEUTA');
  });

  it('nunca deixa escalar para ADMIN', () => {
    expect(resolveRole('ADMIN')).toBe('PROFESSOR');
    expect(resolveRole('admin')).toBe('PROFESSOR');
    expect(resolveRole({ role: 'ADMIN' })).toBe('PROFESSOR');
    expect(resolveRole(undefined)).toBe('PROFESSOR');
  });
});

describe('normalizeEmail', () => {
  it('repete o tratamento do trigger da 011', () => {
    expect(normalizeEmail('  Comprador@Example.COM ')).toBe('comprador@example.com');
    expect(normalizeEmail(null)).toBe('');
  });
});

describe('elegibilidade pelo entitlement', () => {
  it('active sem vencimento é vitalício', () => {
    expect(isEntitlementActive({ status: 'active', expires_at: null }, agora)).toBe(true);
  });

  it('active vencido não vale', () => {
    expect(isEntitlementActive({ status: 'active', expires_at: passado }, agora)).toBe(false);
  });

  it('canceled com data futura ainda vale — o período foi pago', () => {
    expect(isEntitlementActive({ status: 'canceled', expires_at: futuro }, agora)).toBe(true);
  });

  it('canceled sem data não vale', () => {
    expect(isEntitlementActive({ status: 'canceled', expires_at: null }, agora)).toBe(false);
  });

  it('revoked nunca vale, mesmo com data futura (reembolso/chargeback)', () => {
    expect(isEntitlementActive({ status: 'revoked', expires_at: futuro }, agora)).toBe(false);
  });

  it('basta um acesso válido entre vários', () => {
    const linhas = [
      { status: 'revoked', expires_at: futuro },
      { status: 'active', expires_at: null },
    ];
    expect(hasActiveEntitlement(linhas, agora)).toBe(true);
    expect(hasActiveEntitlement([linhas[0]], agora)).toBe(false);
    expect(hasActiveEntitlement([], agora)).toBe(false);
  });
});

describe('rate limit', () => {
  it('barra ao atingir o teto de qualquer uma das chaves', () => {
    expect(rateLimitExceeded({ byIp: 0, byEmail: 0 })).toBe(false);
    expect(rateLimitExceeded({ byIp: RATE_LIMIT_PER_IP - 1, byEmail: 0 })).toBe(false);
    expect(rateLimitExceeded({ byIp: RATE_LIMIT_PER_IP, byEmail: 0 })).toBe(true);
    expect(rateLimitExceeded({ byIp: 0, byEmail: RATE_LIMIT_PER_EMAIL })).toBe(true);
  });

  it('a janela é a última hora', () => {
    expect(rateLimitWindowStart(agora)).toBe('2026-03-10T11:00:00.000Z');
  });
});

describe('parseRequest', () => {
  const senhaBoa = 'Girassol#2026';

  it('normaliza o e-mail e resolve o papel', () => {
    const r = parseRequest({
      email: ' Joana@Escola.com ',
      password: senhaBoa,
      name: ' Joana ',
      role: 'parent',
    });
    expect(r).toEqual({
      ok: true,
      value: { email: 'joana@escola.com', password: senhaBoa, name: 'Joana', role: 'PAI_MAE' },
    });
  });

  it('aceita sem nome — o trigger deriva do e-mail', () => {
    const r = parseRequest({ email: 'joana@escola.com', password: senhaBoa });
    expect(r.ok).toBe(true);
  });

  it('recusa e-mail malformado antes de tocar no banco', () => {
    const r = parseRequest({ email: 'joana', password: senhaBoa });
    expect(r).toMatchObject({ ok: false, code: 'dados_invalidos' });
  });

  it('recusa senha fraca com a lista de problemas', () => {
    const r = parseRequest({ email: 'joana@escola.com', password: 'senha123' });
    expect(r).toMatchObject({ ok: false, code: 'senha_fraca' });
    expect(r.ok === false && r.problems.length).toBeGreaterThan(0);
  });

  it('não explode com corpo vazio', () => {
    expect(parseRequest(null)).toMatchObject({ ok: false, code: 'dados_invalidos' });
  });
});

describe('isAlreadyRegistered', () => {
  it('reconhece as variações que o Supabase devolve', () => {
    expect(isAlreadyRegistered('User already registered')).toBe(true);
    expect(isAlreadyRegistered('A user with this email address has already been registered')).toBe(true);
    expect(isAlreadyRegistered('Email address is already in use')).toBe(true);
  });

  it('não confunde com outros erros', () => {
    expect(isAlreadyRegistered('Database error creating new user')).toBe(false);
    expect(isAlreadyRegistered(undefined)).toBe(false);
  });
});
