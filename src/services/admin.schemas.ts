import { z } from 'zod';

// ════════════════════════════════════════════════════════════════════════════
// Schemas de validação das atividades públicas.
// - activityInputSchema: guarda na BORDA DO SERVIÇO (payload já no domínio).
// - activityFormSchema: validação do FORMULÁRIO (campos como string do input),
//   usada com o zodResolver; toActivityInput() serializa form → domínio.
// Reaproveitados entre ActivityFormDialog e admin.service para uma única
// fonte de verdade das regras.
// ════════════════════════════════════════════════════════════════════════════

// Campos no formato do domínio (camelCase), reutilizável para create e patch.
const activityShape = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório').max(160, 'Título muito longo'),
  description: z.string().trim().max(2000, 'Descrição muito longa').nullable(),
  category: z.string().trim().max(80, 'Categoria muito longa').nullable(),
  imageUrl: z.string().trim().max(2048, 'URL muito longa').nullable(),
  capacity: z
    .number({ invalid_type_error: 'Capacidade inválida' })
    .int('Capacidade deve ser um número inteiro')
    .positive('Capacidade deve ser positiva')
    .nullable(),
  startsAt: z.string().datetime({ message: 'Data de início inválida' }).nullable(),
  endsAt: z.string().datetime({ message: 'Data de fim inválida' }).nullable(),
  isActive: z.boolean(),
});

const endsAfterStarts = (v: { startsAt: string | null; endsAt: string | null }) =>
  !v.startsAt || !v.endsAt || v.endsAt >= v.startsAt;

// Guarda para create(): payload completo no domínio.
export const activityInputSchema = activityShape.refine(endsAfterStarts, {
  message: 'O término deve ser após o início',
  path: ['endsAt'],
});

// Guarda para update(): patch parcial; undefined = não mexe na coluna.
export const activityPatchSchema = activityShape.partial();

// Tipo de domínio explícito (contrato dos serviços). Mantido à mão para
// inferência estável; os schemas acima garantem a validação em runtime.
export interface ActivityInput {
  title: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  capacity: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

// ── Formulário (inputs como string) ────────────────────────────────────────
export const activityFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Título é obrigatório').max(160, 'Título muito longo'),
    description: z.string().max(2000, 'Descrição muito longa'),
    category: z.string().max(80, 'Categoria muito longa'),
    imageUrl: z.string().max(2048, 'URL muito longa'),
    capacity: z
      .string()
      .refine((v) => v === '' || (/^\d+$/.test(v) && Number(v) > 0), 'Capacidade deve ser um inteiro positivo'),
    startsAt: z.string(),
    endsAt: z.string(),
    isActive: z.boolean(),
  })
  .refine(
    (v) => !v.startsAt || !v.endsAt || new Date(v.endsAt) >= new Date(v.startsAt),
    { message: 'O término deve ser após o início', path: ['endsAt'] },
  );

export type ActivityFormValues = z.infer<typeof activityFormSchema>;

// Serializa os valores do form (strings/datetime-local) para o domínio.
export const toActivityInput = (v: ActivityFormValues): ActivityInput => ({
  title: v.title.trim(),
  description: v.description.trim() || null,
  category: v.category.trim() || null,
  imageUrl: v.imageUrl.trim() || null,
  capacity: v.capacity ? Number(v.capacity) : null,
  startsAt: v.startsAt ? new Date(v.startsAt).toISOString() : null,
  endsAt: v.endsAt ? new Date(v.endsAt).toISOString() : null,
  isActive: v.isActive,
});
