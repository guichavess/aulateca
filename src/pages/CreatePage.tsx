import React, { useState } from 'react';
import { categories } from '@/lib/data';
import { toast } from 'sonner';

const levels = [
  { id: 'ef1-initial', label: 'EF1 — 1° ao 3° ano' },
  { id: 'ef1-final', label: 'EF1 — 4° e 5° ano' },
  { id: 'ef2', label: 'EF2 — 6° ao 9° ano' },
];

const durations = ['10 min', '15 min', '20 min', '25 min', '30 min', '40 min', '50 min', '60 min'];

const CreatePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [duration, setDuration] = useState('');
  const [players, setPlayers] = useState('');

  const canSubmit = title.trim() && description.trim() && category && level;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Recurso criado com sucesso! 🎉');
    setTitle('');
    setDescription('');
    setCategory('');
    setLevel('');
    setDuration('');
    setPlayers('');
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
            onChange={(e) => setCategory(e.target.value)}
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
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className={selectClass}
          >
            <option value="">Selecione o nível</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Row: Tempo + Jogadores */}
        <div className="grid grid-cols-2 gap-3">
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
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Nº de jogadores</label>
            <input
              type="number"
              min="1"
              max="40"
              value={players}
              onChange={(e) => setPlayers(e.target.value)}
              placeholder="Ex: 4"
              className={inputClass}
            />
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
          Publicar Recurso
        </button>
      </form>
    </div>
  );
};

export default CreatePage;
