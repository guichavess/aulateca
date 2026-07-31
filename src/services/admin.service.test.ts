import { describe, it, expect, vi } from 'vitest';

// Evita instanciar o client real (createClient exige env vars ausentes no teste).
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

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
