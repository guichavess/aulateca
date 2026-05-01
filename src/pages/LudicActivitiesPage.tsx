import React from 'react';
import { Users, Clock, Star } from 'lucide-react';

const activities = [
  { id: '1', title: 'Dado de Histórias', description: 'Lance o dado e crie uma narrativa com os elementos sorteados. Trabalha criatividade e estrutura textual.', ageRange: 'EF1 — 1° ao 5° ano', duration: '20 min', players: '2-6 jogadores', rating: 4.9, color: 'hsl(var(--brand-purple))', icon: '🎲' },
  { id: '2', title: 'Corrida das Palavras', description: 'Jogo de tabuleiro onde cada casa exige a escrita de uma frase ou trecho de texto para avançar.', ageRange: 'EF1 — 3° ao 5° ano', duration: '30 min', players: '2-4 jogadores', rating: 4.8, color: 'hsl(var(--brand-teal))', icon: '🏃' },
  { id: '3', title: 'Telefone sem Fio Escrito', description: 'Cada aluno escreve um trecho e passa para o próximo continuar a história. Trabalha coesão e criatividade coletiva.', ageRange: 'EF1 e EF2', duration: '25 min', players: 'Turma inteira', rating: 4.7, color: 'hsl(var(--brand-red))', icon: '📞' },
  { id: '4', title: 'Caça ao Tesouro Textual', description: 'Pistas escritas em diferentes gêneros textuais levam os alunos a encontrar o "tesouro" pela escola.', ageRange: 'EF2 — 6° ao 9° ano', duration: '45 min', players: 'Grupos de 4-5', rating: 4.9, color: 'hsl(var(--brand-yellow))', icon: '🗺️' },
  { id: '5', title: 'Bingo de Gêneros Textuais', description: 'Cartelas com trechos de textos. Alunos identificam o gênero e marcam na cartela.', ageRange: 'EF2 — 6° ao 9° ano', duration: '20 min', players: 'Turma inteira', rating: 4.6, color: 'hsl(var(--brand-lilac))', icon: '📋' },
  { id: '6', title: 'Batalha de Rimas', description: 'Competição amigável de criação de versos rimados sobre temas sorteados.', ageRange: 'EF1 e EF2', duration: '15 min', players: '2 equipes', rating: 4.8, color: 'hsl(var(--brand-pink))', icon: '⚔️' },
];

const LudicActivitiesPage: React.FC = () => {
  return (
    <div className="px-5 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="animate-slide-up">
        <h1 className="font-fredoka text-2xl sm:text-3xl font-bold tracking-tight gradient-text mb-1">Atividades Lúdicas 🎮</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">Jogos e dinâmicas para estimular a produção de texto de forma divertida.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity, i) => (
          <div
            key={activity.id}
            className="activity-card animate-slide-up hover:bg-gradient-to-br hover:from-slate-50 hover:to-purple-50/30"
            style={{ animationDelay: `${i * 0.04}s`, borderLeft: `4px solid ${activity.color}` }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${activity.color}10` }}>
                {activity.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-fredoka text-sm font-semibold text-foreground leading-snug mb-1 tracking-tight">{activity.title}</h3>
                <span className="type-badge inline-block" style={{ background: `${activity.color}12`, color: activity.color }}>
                  {activity.ageRange}
                </span>
              </div>
            </div>

            <p className="text-[13px] text-muted-foreground leading-relaxed mb-3 flex-1 line-clamp-2">{activity.description}</p>

            <div className="activity-meta">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {activity.duration}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {activity.players}</span>
              <span className="flex items-center gap-1 ml-auto"><Star className="w-3 h-3 text-amber-500" /> {activity.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LudicActivitiesPage;
