import { describe, it, expect, vi } from 'vitest';

// Evita instanciar o client real (createClient exige env vars ausentes no teste).
// Query builder que sempre devolve 0 linhas afetadas (cenário "barrado por RLS").
const emptyResult = Promise.resolve({ data: [], error: null });
const builder: Record<string, unknown> = {};
for (const m of ['update', 'delete', 'eq', 'select']) {
  builder[m] = () => builder;
}
Object.assign(builder, { then: (...a: unknown[]) => (emptyResult as unknown as PromiseLike<unknown>).then(...(a as [never, never])) });

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: () => builder },
}));

import { toRowPatch } from '@/services/admin.service';
import {
  activityInputSchema,
  activityPatchSchema,
  activityFormSchema,
  toActivityInput,
} from '@/services/admin.schemas';

describe('toRowPatch', () => {
  it('inclui apenas chaves definidas e mapeia camelCase → snake_case', () => {
    const patch = toRowPatch({ title: 'Oficina', isActive: false });
    expect(patch).toEqual({ title: 'Oficina', is_active: false });
  });

  it('preserva null (limpa coluna) mas descarta undefined', () => {
    const patch = toRowPatch({ imageUrl: null, capacity: undefined });
    expect(patch).toHaveProperty('image_url', null);
    expect(patch).not.toHaveProperty('capacity');
  });

  it('não sobrescreve colunas ausentes em patch parcial', () => {
    expect(toRowPatch({})).toEqual({});
  });
});

describe('activityInputSchema', () => {
  const base = {
    title: 'Oficina', description: null, category: null, imageUrl: null,
    capacity: null, startsAt: null, endsAt: null, isActive: true,
  };

  it('rejeita título vazio', () => {
    expect(activityInputSchema.safeParse({ ...base, title: '  ' }).success).toBe(false);
  });

  it('rejeita capacidade não-positiva', () => {
    expect(activityInputSchema.safeParse({ ...base, capacity: 0 }).success).toBe(false);
  });

  it('rejeita fim anterior ao início', () => {
    const r = activityInputSchema.safeParse({
      ...base,
      startsAt: '2026-01-02T10:00:00.000Z',
      endsAt: '2026-01-01T10:00:00.000Z',
    });
    expect(r.success).toBe(false);
  });

  it('aceita payload válido', () => {
    expect(activityInputSchema.safeParse(base).success).toBe(true);
  });
});

describe('activityPatchSchema', () => {
  it('aceita patch parcial', () => {
    expect(activityPatchSchema.safeParse({ isActive: false }).success).toBe(true);
  });
});

describe('toActivityInput', () => {
  it('normaliza strings do form para o domínio', () => {
    const parsed = activityFormSchema.parse({
      title: '  Oficina  ', description: '', category: 'curso', imageUrl: '',
      capacity: '10', startsAt: '', endsAt: '', isActive: true,
    });
    const input = toActivityInput(parsed);
    expect(input.title).toBe('Oficina');
    expect(input.description).toBeNull();
    expect(input.imageUrl).toBeNull();
    expect(input.capacity).toBe(10);
    expect(input.startsAt).toBeNull();
  });

  it('rejeita capacidade inválida no schema do form', () => {
    const r = activityFormSchema.safeParse({
      title: 'x', description: '', category: '', imageUrl: '',
      capacity: '-3', startsAt: '', endsAt: '', isActive: true,
    });
    expect(r.success).toBe(false);
  });
});

// ── Mutações barradas por RLS não podem retornar sucesso silencioso ─────────
// Um UPDATE/DELETE bloqueado pela RLS casa 0 linhas e o PostgREST devolve
// sucesso sem erro. Sem conferir as linhas afetadas, a UI diz "removido"
// enquanto o banco não mudou.
describe('mutações admin com 0 linhas afetadas', () => {
  const cases: Array<[string, (m: typeof import('@/services/admin.service')) => Promise<unknown>]> = [
    ['publicActivitiesService.remove', (m) => m.publicActivitiesService.remove('a1')],
    ['publicActivitiesService.toggleActive', (m) => m.publicActivitiesService.toggleActive('a1', false)],
    ['enrollmentsService.updateStatus', (m) => m.enrollmentsService.updateStatus('e1', 'CONFIRMED')],
    ['enrollmentsService.remove', (m) => m.enrollmentsService.remove('e1')],
  ];

  it.each(cases)('%s lança quando nada foi afetado', async (_name, call) => {
    const mod = await import('@/services/admin.service');
    await expect(call(mod)).rejects.toThrow(/permiss/i);
  });
});
