import React from 'react';
import { Clock, Download, Star } from 'lucide-react';

const exercises = [
  { id: '1', title: 'Reescrita de Finais', description: 'Alunos leem uma história e criam um final alternativo, desenvolvendo criatividade e coerência textual.', ageRange: 'EF1 — 3° ao 5° ano', type: 'Escrita Criativa', duration: '30 min', downloads: 1250, rating: 4.8, color: 'hsl(var(--brand-purple))' },
  { id: '2', title: 'Diário de Personagem', description: 'Escrever entradas de diário como se fosse um personagem de livro lido em classe.', ageRange: 'EF1 — 4° e 5° ano', type: 'Narrativa', duration: '25 min', downloads: 980, rating: 4.7, color: 'hsl(var(--brand-teal))' },
  { id: '3', title: 'Oficina de Revisão Textual', description: 'Atividade em duplas para revisar e melhorar textos dos colegas usando checklist de qualidade.', ageRange: 'EF2 — 6° ao 9° ano', type: 'Revisão', duration: '40 min', downloads: 2100, rating: 4.9, color: 'hsl(var(--brand-red))' },
  { id: '4', title: 'Carta para o Futuro', description: 'Produção de cartas pessoais para si mesmo no futuro, trabalhando gênero epistolar e reflexão.', ageRange: 'EF1 e EF2', type: 'Gênero Epistolar', duration: '35 min', downloads: 1800, rating: 4.8, color: 'hsl(var(--brand-yellow))' },
  { id: '5', title: 'Notícia do Dia', description: 'Transformar um acontecimento do cotidiano escolar em uma notícia jornalística com lead e corpo.', ageRange: 'EF2 — 6° ao 9° ano', type: 'Texto Informativo', duration: '30 min', downloads: 1560, rating: 4.6, color: 'hsl(var(--brand-lilac))' },
  { id: '6', title: 'Receita Maluca', description: 'Criar receitas imaginárias seguindo a estrutura do gênero instrucional, estimulando humor e criatividade.', ageRange: 'EF1 — 2° ao 4° ano', type: 'Texto Instrucional', duration: '20 min', downloads: 3200, rating: 4.9, color: 'hsl(var(--brand-pink))' },
];

const OtherActivitiesPage: React.FC = () => {
  return (
    <div className="px-5 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="animate-slide-up">
        <h1 className="font-fredoka text-2xl sm:text-3xl font-bold tracking-tight gradient-text mb-1">Outras Atividades ✏️</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">Exercícios complementares de produção textual para EF1 e EF2.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercises.map((ex, i) => (
          <div
            key={ex.id}
            className="activity-card animate-slide-up"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="type-badge" style={{ background: `${ex.color}12`, color: ex.color }}>
                {ex.type}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">{ex.ageRange}</span>
            </div>

            <h3 className="font-fredoka text-sm font-semibold text-foreground mb-1.5 leading-snug tracking-tight">{ex.title}</h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-3 flex-1 line-clamp-2">{ex.description}</p>

            <div className="activity-meta">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ex.duration}</span>
              <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {ex.downloads}</span>
              <span className="flex items-center gap-1 ml-auto"><Star className="w-3 h-3 text-amber-500" /> {ex.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OtherActivitiesPage;
