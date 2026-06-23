import { Category, Resource, CommunityPost, PlanHistory } from './types';

export const categories: Category[] = [
  { id: 'all', label: 'Todos', icon: '✦', color: 'brand-purple', count: 12, path: '/' },
  { id: 'producao-texto', label: 'Produção de Texto', icon: '✍️', color: 'brand-purple', count: 5, path: '/categoria/producao-texto' },
  { id: 'interpretacao-texto', label: 'Interpretação de Texto', icon: '📖', color: 'brand-teal', count: 3, path: '/categoria/interpretacao-texto' },
  { id: 'ludica', label: 'Atividades Lúdicas', icon: '🎲', color: 'brand-pink', count: 3, path: '/categoria/ludica' },
  { id: 'sondagem', label: 'Atividades de Sondagem', icon: '🔍', color: 'brand-blue', count: 1, path: '/categoria/sondagem' },
  { id: 'datas-comemorativas', label: 'Datas Comemorativas', icon: '🎉', color: 'brand-yellow', count: 0, path: '/categoria/datas-comemorativas' },
];

export const categoryColorMap: Record<string, string> = {
  'producao-texto': '#6C5CE7',
  'interpretacao-texto': '#4ECDC4',
  'ludica': '#FD79A8',
  'sondagem': '#45B7D1',
  'datas-comemorativas': '#F9CA24',
  'all': '#6C5CE7',
};

// Imagens servidas de /public/catalog (ver catalogData.ts) para ficar fora do bundle JS.
const c = (name: string) => `/catalog/${name}.png`;

export const resources: Resource[] = [
  { id: '1', title: 'Contando Histórias', description: 'Aprenda a criar narrativas criativas com começo, meio e fim usando elementos visuais e prompts de escrita.', category: 'producao-texto', type: 'video', ageRange: '6-8', duration: '15min', downloads: 2340, rating: 4.9, isNew: true, author: 'Profa. Ana Lima', imageUrl: c('fabrica-textos') },
  { id: '2', title: 'Meu Primeiro Texto', description: 'Material completo para introdução à produção textual com atividades de escrita guiada para os anos iniciais.', category: 'producao-texto', type: 'pdf', ageRange: '6-8', duration: '20min', downloads: 5120, rating: 4.8, author: 'Profa. Maria Santos', imageUrl: c('kit-producao-texto') },
  { id: '3', title: 'Descrevendo o Mundo', description: 'Atividades para desenvolver textos descritivos usando os cinco sentidos e observação do ambiente.', category: 'interpretacao-texto', type: 'video', ageRange: '9-11', duration: '30min', downloads: 1890, rating: 4.7, isNew: true, author: 'Prof. Carlos Mendes', imageUrl: c('explorando-classes-gramaticais') },
  { id: '4', title: 'Poesia na Sala de Aula', description: 'Oficina de criação poética com rimas, versos e estrofes para despertar a sensibilidade literária.', category: 'sondagem', type: 'pdf', ageRange: '9-11', duration: '25min', downloads: 3200, rating: 4.9, author: 'Profa. Julia Costa', imageUrl: c('palavras-magicas') },
  { id: '5', title: 'Carta do Leitor', description: 'Material sobre produção de textos de opinião com foco em argumentação e posicionamento crítico.', category: 'producao-texto', type: 'pdf', ageRange: '12-14', duration: '35min', downloads: 1450, rating: 4.6, author: 'Prof. Roberto Silva', imageUrl: c('producao-dissertativa') },
  { id: '6', title: 'Caça-Palavras Textual', description: 'Jogos de caça-palavras temáticos para desenvolver vocabulário e ortografia aplicados à produção de texto.', category: 'ludica', type: 'pdf', ageRange: '6-8', duration: '10min', downloads: 4500, rating: 4.8, isNew: true, author: 'Profa. Fernanda Oliveira', imageUrl: c('oficina-ortografica') },
  { id: '7', title: 'Fábulas e Recontos', description: 'Videoaulas sobre reconto de fábulas clássicas e criação de versões autorais pelos alunos.', category: 'producao-texto', type: 'video', ageRange: '6-8', duration: '18min', downloads: 2100, rating: 4.7, author: 'Profa. Ana Lima', imageUrl: c('role-reconte') },
  { id: '8', title: 'Roda de Escrita', description: 'Guia completo para organizar rodas de escrita colaborativa e revisão de textos entre pares.', category: 'interpretacao-texto', type: 'pdf', ageRange: '9-11', duration: '40min', downloads: 3800, rating: 4.9, isNew: true, author: 'Profa. Maria Santos', imageUrl: c('banquinha-leitura') },
  { id: '9', title: 'Reportagem Escolar', description: 'Projeto de criação de jornal escolar com textos informativos e jornalísticos produzidos pelos alunos.', category: 'interpretacao-texto', type: 'video', ageRange: '12-14', duration: '25min', downloads: 2750, rating: 4.8, author: 'Prof. Carlos Mendes', imageUrl: c('cineroteirista') },
  { id: '10', title: 'Teatro de Palavras', description: 'Atividade de criação de roteiros teatrais e diálogos para estimular a escrita criativa e a oralidade.', category: 'ludica', type: 'video', ageRange: '9-11', duration: '20min', downloads: 1980, rating: 4.6, isNew: true, author: 'Profa. Julia Costa', imageUrl: c('festival-textual') },
  { id: '11', title: 'Quiz Ortográfico', description: 'Jogo interativo de ortografia e gramática aplicada à produção textual.', category: 'ludica', type: 'pdf', ageRange: '12-14', duration: '15min', downloads: 3100, rating: 4.7, author: 'Prof. Roberto Silva', imageUrl: c('stop-ortografia') },
  { id: '12', title: 'Diário de Bordo', description: 'Aprenda a escrever diários e relatos pessoais com técnicas de narrativa em primeira pessoa.', category: 'producao-texto', type: 'video', ageRange: '9-11', duration: '22min', downloads: 4200, rating: 4.9, isNew: true, author: 'Profa. Ana Lima', imageUrl: c('diario-aventuras') },
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
