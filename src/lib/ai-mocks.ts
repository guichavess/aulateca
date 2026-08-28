// IA fora da interface (decisão da gestão: PDF-only, sem IA por enquanto).
// Mocks preservados aqui — não apagados — para religar quando a IA voltar.
// Consumidos hoje só por AIPlanPage e TecaDemoSection, que não são importados
// de nenhuma rota ativa.

export interface AIPlanMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PlanHistory {
  id: string;
  title: string;
  date: string;
}

export const aiSuggestions = [
  'Crie um plano de aula sobre produção de narrativas para o 4° ano com atividades lúdicas',
  'Planeje uma sequência didática de texto descritivo para turma do 3° ano',
  'Elabore uma oficina de produção de poemas com jogos de rimas para o 5° ano',
  'Monte um projeto de jornal escolar com textos informativos para o 7° ano',
];

export const mockPlanHistory: PlanHistory[] = [
  { id: '1', title: 'Narrativa criativa — 4° ano', date: '02/03/2026' },
  { id: '2', title: 'Texto descritivo — 3° ano', date: '28/02/2026' },
  { id: '3', title: 'Jornal escolar — 7° ano', date: '25/02/2026' },
];
