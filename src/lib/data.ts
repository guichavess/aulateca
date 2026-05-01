import { Category, Resource, CommunityPost, PlanHistory } from './types';

export const categories: Category[] = [
  { id: 'all', label: 'Todos', icon: '✦', color: 'brand-purple', count: 12 },
  { id: 'narrative', label: 'Narrativa', icon: '📖', color: 'brand-red', count: 3 },
  { id: 'descriptive', label: 'Descrição', icon: '🔍', color: 'brand-teal', count: 2 },
  { id: 'opinion', label: 'Opinião', icon: '💬', color: 'brand-blue', count: 2 },
  { id: 'poetry', label: 'Poesia', icon: '🎭', color: 'brand-yellow', count: 2 },
  { id: 'informative', label: 'Informativo', icon: '📰', color: 'brand-lilac', count: 1 },
  { id: 'games', label: 'Jogos', icon: '🎲', color: 'brand-pink', count: 2 },
];

export const categoryColorMap: Record<string, string> = {
  narrative: '#FF6B6B',
  descriptive: '#4ECDC4',
  opinion: '#45B7D1',
  poetry: '#F9CA24',
  informative: '#A29BFE',
  games: '#FD79A8',
  all: '#6C5CE7',
};

export const resources: Resource[] = [
  { id: '1', title: 'Contando Histórias', description: 'Aprenda a criar narrativas criativas com começo, meio e fim usando elementos visuais e prompts de escrita.', category: 'narrative', type: 'video', ageRange: '6-8', duration: '15min', downloads: 2340, rating: 4.9, isNew: true, author: 'Profa. Ana Lima' },
  { id: '2', title: 'Meu Primeiro Texto', description: 'Material completo para introdução à produção textual com atividades de escrita guiada para os anos iniciais.', category: 'narrative', type: 'pdf', ageRange: '6-8', duration: '20min', downloads: 5120, rating: 4.8, author: 'Profa. Maria Santos' },
  { id: '3', title: 'Descrevendo o Mundo', description: 'Atividades para desenvolver textos descritivos usando os cinco sentidos e observação do ambiente.', category: 'descriptive', type: 'video', ageRange: '9-11', duration: '30min', downloads: 1890, rating: 4.7, isNew: true, author: 'Prof. Carlos Mendes' },
  { id: '4', title: 'Poesia na Sala de Aula', description: 'Oficina de criação poética com rimas, versos e estrofes para despertar a sensibilidade literária.', category: 'poetry', type: 'pdf', ageRange: '9-11', duration: '25min', downloads: 3200, rating: 4.9, author: 'Profa. Julia Costa' },
  { id: '5', title: 'Carta do Leitor', description: 'Material sobre produção de textos de opinião com foco em argumentação e posicionamento crítico.', category: 'opinion', type: 'pdf', ageRange: '12-14', duration: '35min', downloads: 1450, rating: 4.6, author: 'Prof. Roberto Silva' },
  { id: '6', title: 'Caça-Palavras Textual', description: 'Jogos de caça-palavras temáticos para desenvolver vocabulário e ortografia aplicados à produção de texto.', category: 'games', type: 'pdf', ageRange: '6-8', duration: '10min', downloads: 4500, rating: 4.8, isNew: true, author: 'Profa. Fernanda Oliveira' },
  { id: '7', title: 'Fábulas e Recontos', description: 'Videoaulas sobre reconto de fábulas clássicas e criação de versões autorais pelos alunos.', category: 'narrative', type: 'video', ageRange: '6-8', duration: '18min', downloads: 2100, rating: 4.7, author: 'Profa. Ana Lima' },
  { id: '8', title: 'Roda de Escrita', description: 'Guia completo para organizar rodas de escrita colaborativa e revisão de textos entre pares.', category: 'descriptive', type: 'pdf', ageRange: '9-11', duration: '40min', downloads: 3800, rating: 4.9, isNew: true, author: 'Profa. Maria Santos' },
  { id: '9', title: 'Reportagem Escolar', description: 'Projeto de criação de jornal escolar com textos informativos e jornalísticos produzidos pelos alunos.', category: 'informative', type: 'video', ageRange: '12-14', duration: '25min', downloads: 2750, rating: 4.8, author: 'Prof. Carlos Mendes' },
  { id: '10', title: 'Teatro de Palavras', description: 'Atividade de criação de roteiros teatrais e diálogos para estimular a escrita criativa e a oralidade.', category: 'poetry', type: 'video', ageRange: '9-11', duration: '20min', downloads: 1980, rating: 4.6, isNew: true, author: 'Profa. Julia Costa' },
  { id: '11', title: 'Quiz Ortográfico', description: 'Jogo interativo de ortografia e gramática aplicada à produção textual.', category: 'games', type: 'pdf', ageRange: '12-14', duration: '15min', downloads: 3100, rating: 4.7, author: 'Prof. Roberto Silva' },
  { id: '12', title: 'Diário de Bordo', description: 'Aprenda a escrever diários e relatos pessoais com técnicas de narrativa em primeira pessoa.', category: 'narrative', type: 'video', ageRange: '9-11', duration: '22min', downloads: 4200, rating: 4.9, isNew: true, author: 'Profa. Ana Lima' },
];

export const communityPosts: CommunityPost[] = [
  { id: '1', authorName: 'Profa. Camila Rodrigues', authorInitials: 'CR', authorColor: '#6C5CE7', timeAgo: 'há 2h', content: 'Acabei de usar a atividade "Contando Histórias" com minha turma do 3° ano e foi um sucesso! Os alunos criaram narrativas incríveis. Recomendo demais! 🎉', likes: 24, comments: 8 },
  { id: '2', authorName: 'Prof. Marcos Almeida', authorInitials: 'MA', authorColor: '#FF6B6B', timeAgo: 'há 5h', content: 'Alguém tem sugestões de atividades de produção de texto para turma de 6° ano? Quero algo que trabalhe argumentação de forma lúdica.', likes: 12, comments: 15 },
  { id: '3', authorName: 'Profa. Letícia Ferreira', authorInitials: 'LF', authorColor: '#4ECDC4', timeAgo: 'há 1d', content: 'O plano de aula gerado pela Teca ficou incrível! Usei como base para uma sequência de produção de crônicas. Economizou muito tempo de planejamento. 🤖✨', likes: 45, comments: 12 },
  { id: '4', authorName: 'Prof. Daniel Souza', authorInitials: 'DS', authorColor: '#F9CA24', timeAgo: 'há 2d', content: 'Compartilhando minha experiência com "Teatro de Palavras": as crianças amaram criar seus próprios roteiros! Fizemos uma apresentação para os pais.', likes: 38, comments: 6 },
  { id: '5', authorName: 'Profa. Beatriz Nunes', authorInitials: 'BN', authorColor: '#FD79A8', timeAgo: 'há 3d', content: 'Dica: combinem o "Caça-Palavras Textual" com a "Roda de Escrita" para uma semana temática de produção textual. Funcionou muito bem aqui! 📚', likes: 31, comments: 9 },
];

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

export const mockAIPlan = `## 📋 Plano de Aula: Produção de Narrativas Criativas

**Duração:** 2 aulas de 50 minutos  
**Turma:** 4° ano do Ensino Fundamental  
**Alinhamento BNCC:** EF04LP21 — Planejar e produzir textos narrativos

---

### 🎯 Objetivos de Aprendizagem
- Compreender a estrutura narrativa (começo, meio e fim)
- Criar personagens e cenários para suas histórias
- Produzir textos narrativos coerentes e criativos

### 📦 Materiais Necessários
- Cartões com elementos de história (personagens, lugares, objetos)
- Folhas pautadas e coloridas
- Dado de histórias (faces com prompts)
- Lápis de cor e canetinhas

### 📝 Etapas da Aula

**Momento 1 — Aquecimento (10 min)**
Roda de conversa: "Qual foi a melhor história que vocês já ouviram?" Explorar elementos narrativos.

**Momento 2 — Planejamento (15 min)**
Cada aluno sorteia 3 cartões (personagem, lugar, objeto) e planeja sua história usando organizador gráfico.

**Momento 3 — Escrita (20 min)**
Produção do texto narrativo com acompanhamento individual da professora.

**Momento 4 — Fechamento (5 min)**
Leitura voluntária de trechos. Registro das descobertas.

### ♿ Adaptações Inclusivas
- Material em alto contraste para alunos com baixa visão
- Possibilidade de narrar a história oralmente para escriba
- Cartões com imagens para apoio visual na criação`;
