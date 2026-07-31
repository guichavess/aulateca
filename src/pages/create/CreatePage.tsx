import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '@/lib/data';
import { toast } from 'sonner';
import { useApp } from '@/lib/context';
import { resourcesService } from '@/services/resources.service';
import type { AgeRange, CategoryId, ResourceType } from '@/lib/types';

const ageRanges: { id: Exclude<AgeRange, 'all'>; label: string }[] = [
  { id: '6-8', label: 'EF1 — 1° ao 3° ano' },
  { id: '9-11', label: 'EF1 — 4° e 5° ano' },
  { id: '12-14', label: 'EF2 — 6° ao 9° ano' },
];

const types: { id: ResourceType; label: string }[] = [
  { id: 'pdf', label: 'PDF' },
  { id: 'video', label: 'Vídeo' },
];

const durations = ['10 min', '15 min', '20 min', '25 min', '30 min', '40 min', '50 min', '60 min'];

const CreatePage: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Exclude<CategoryId, 'all'> | ''>('');
  const [ageRange, setAgeRange] = useState<Exclude<AgeRange, 'all'> | ''>('');
  const [type, setType] = useState<ResourceType | ''>('');
  const [duration, setDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    !!title.trim() && !!description.trim() && !!category && !!ageRange && !!type && !!duration && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (!user) {
      toast.error('Você precisa estar logado para publicar.');
      return;
    }

    setSubmitting(true);
    try {
      await resourcesService.create(
        {
          title: title.trim(),
          description: description.trim(),
          category: category as Exclude<CategoryId, 'all'>,
          type: type as ResourceType,
          ageRange: ageRange as Exclude<AgeRange, 'all'>,
          duration,
          isNew: true,
        },
        user.id,
      );
      toast.success('Recurso publicado!');
      setTitle('');
      setDescription('');
      setCategory('');
      setAgeRange('');
      setType('');
      setDuration('');
      navigate('/explore');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível publicar o recurso.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl text-sm text-foreground bg-secondary/40 border border-border/40 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary/30 placeholder:text-muted-foreground/60';

  const selectClass =
    'w-full px-4 py-3 rounded-xl text-sm text-foreground bg-secondary/40 border border-border/40 outline-none appearance-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary/30';

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6 animate-slide-up">
      <div>
        <h1 className="font-fredoka text-xl font-bold gradient-text mb-1">Criar Novo Recurso ✨</h1>
        <p className="text-sm text-muted-foreground">Preencha os campos para publicar na biblioteca.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Oficina de Poemas Visuais"
            className={inputClass}
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva a atividade, objetivos e como aplicar em sala..."
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Categoria */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className={selectClass}
          >
            <option value="">Selecione uma categoria</option>
            {categories.filter(c => c.id !== 'all').map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
            ))}
          </select>
        </div>

        {/* Nível */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Nível / Série</label>
          <select
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value as typeof ageRange)}
            className={selectClass}
          >
            <option value="">Selecione o nível</option>
            {ageRanges.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Row: Tipo + Tempo */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ResourceType)}
              className={selectClass}
            >
              <option value="">Selecione</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Tempo estimado</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={selectClass}
            >
              <option value="">Selecione</option>
              {durations.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.98]"
          style={{
            background: canSubmit
              ? 'linear-gradient(135deg, hsl(262, 83%, 58%), hsl(249, 76%, 48%))'
              : 'hsl(var(--secondary))',
            color: canSubmit ? 'white' : 'hsl(var(--muted-foreground))',
            boxShadow: canSubmit ? '0 4px 14px hsla(262, 83%, 58%, 0.35)' : 'none',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          {submitting ? 'Publicando…' : 'Publicar Recurso'}
        </button>
      </form>
    </div>
  );
};

export default CreatePage;
