// ══════════════════════════════════════════════════════════════════════════════
// Catalog Data — Structured by Tabs > Subcategories > Items
// ══════════════════════════════════════════════════════════════════════════════
//
// PERF: As imagens NÃO são importadas como módulos. Ficam em /public/catalog/
// e são servidas como arquivos estáticos com loading="lazy" no <img>.
// Isso evita que ~86MB de PNG entrem no bundle JS principal.
// ══════════════════════════════════════════════════════════════════════════════

const img = (name: string) => `/catalog/${name}.png`;

export interface CatalogItem {
  id: string;
  title: string;
  image?: string;
}

export interface Subcategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  items: CatalogItem[];
}

export interface CatalogTab {
  id: string;
  label: string;
  icon: string;
  description: string;
  accentColor: string;
  subcategories: Subcategory[];
}

let _counter = 0;
const uid = () => `cat-${++_counter}`;

// ═══════════════════════════════════════════════════════════════════════════════
// ABA 1 — ATIVIDADES LÚDICAS E DINÂMICAS
// ═══════════════════════════════════════════════════════════════════════════════

const ludicTab: CatalogTab = {
  id: 'ludicas',
  label: 'Atividades Lúdicas e Dinâmicas',
  icon: '🎮',
  description: 'Recursos para gamificação e engajamento em sala de aula.',
  accentColor: 'hsl(340, 82%, 65%)',
  subcategories: [
    {
      id: 'jogos-desafios',
      title: 'Jogos e Desafios',
      icon: '🎲',
      color: 'hsl(340, 82%, 65%)',
      items: [
        { id: uid(), title: 'Kit Jogos Português', image: img('kit-jogos-portugues') },
        { id: uid(), title: 'Jogo das Combinações', image: img('jogo-combinacoes') },
        { id: uid(), title: 'Jogo Aventuras Ortográficas', image: img('aventuras-ortograficas') },
        { id: uid(), title: 'Desafio das Sílabas Tônicas', image: img('desafio-silabas-tonicas') },
        { id: uid(), title: 'Missão Português no Espaço', image: img('missao-portugues-espaco') },
        { id: uid(), title: 'Palavras Mágicas', image: img('palavras-magicas') },
        { id: uid(), title: 'Bingo do Nome', image: img('bingo-nome') },
        { id: uid(), title: 'Bingo das Assinaturas', image: img('bingo-assinaturas') },
        { id: uid(), title: '19 Atividades Dinâmicas (Gincana da Música e Continue o Desenho)', image: img('atividades-dinamicas') },
      ],
    },
    {
      id: 'leitura-interativa',
      title: 'Leitura Interativa',
      icon: '📖',
      color: 'hsl(199, 65%, 48%)',
      items: [
        { id: uid(), title: 'Passaporte da Leitura', image: img('leiturometro') },
        { id: uid(), title: 'Certificado do Explorador Literário', image: img('certificado-explorador') },
        { id: uid(), title: 'Maleta Literária', image: img('maleta-literaria') },
        { id: uid(), title: 'Role e Reconte', image: img('role-reconte') },
        { id: uid(), title: 'Atividade de Leitura e Visualização', image: img('aeroporto-leitura') },
        { id: uid(), title: 'Hora da História', image: img('banquinha-leitura') },
        { id: uid(), title: 'Diário de Aventuras', image: img('diario-aventuras') },
        { id: uid(), title: 'Bilhete para Agenda sobre Leitura do Livro', image: img('bilhete-agenda') },
        { id: uid(), title: 'Guia da Jornada Textual e Literária', image: img('guia-jornada') },
        { id: uid(), title: 'O Melhor Livro (Painel + Atividades Google)', image: img('melhor-livro') },
        { id: uid(), title: 'Kit Relatório de Leitura', image: img('relatorio-leitura') },
        { id: uid(), title: 'Kit Passaporte da Leitura (Versão Premium)', image: img('passaporte-premium') },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// ABA 2 — LÍNGUA PORTUGUESA E PRODUÇÃO TEXTUAL
// ═══════════════════════════════════════════════════════════════════════════════

const portugueseTab: CatalogTab = {
  id: 'portugues',
  label: 'Língua Portuguesa e Produção Textual',
  icon: '✍️',
  description: 'Materiais de gramática, ortografia e escrita criativa.',
  accentColor: 'hsl(249, 76%, 64%)',
  subcategories: [
    {
      id: 'producao-texto',
      title: 'Produção de Texto',
      icon: '📝',
      color: 'hsl(249, 76%, 64%)',
      items: [
        { id: uid(), title: 'Fábrica de Textos', image: img('fabrica-textos') },
        { id: uid(), title: 'Festival Textual', image: img('festival-textual') },
        { id: uid(), title: 'Cineroteirista – Produção Textual', image: img('cineroteirista') },
        { id: uid(), title: 'Conectivos para Melhorar a Produção de Texto', image: img('conectivos-producao-texto') },
        { id: uid(), title: 'Dobradura da Interpretação e Produção Textual', image: img('dobradura-interpretacao-producao') },
        { id: uid(), title: 'Produção Textual Dissertativa', image: img('producao-dissertativa') },
        { id: uid(), title: 'Marcador de Parágrafo e Dicas de Produção', image: img('marcador-paragrafo') },
        { id: uid(), title: 'Kit Produção de Texto (Recursos Completos)', image: img('kit-producao-texto') },
        { id: uid(), title: 'Kit Lápis da Produção Textual', image: img('kit-lapis-producao') },
        { id: uid(), title: 'Literatura de Cordel' },
      ],
    },
    {
      id: 'gramatica-ortografia',
      title: 'Gramática e Ortografia',
      icon: '🔤',
      color: 'hsl(173, 58%, 44%)',
      items: [
        { id: uid(), title: 'Soletrando – Ortografia (1º ao 5º ano)', image: img('soletrando-ortografia') },
        { id: uid(), title: 'Oficina Ortográfica', image: img('oficina-ortografica') },
        { id: uid(), title: 'Trilha dos Verbos', image: img('trilha-verbos') },
        { id: uid(), title: 'Classificação das Palavras (Gramática EF)', image: img('classificacao-palavras') },
        { id: uid(), title: 'Explorando as Sílabas (Classificação e Separação)', image: img('explorando-silabas') },
        { id: uid(), title: 'Atividade Sujeito e Predicado', image: img('sujeito-predicado') },
        { id: uid(), title: 'Uso da Vírgula' },
        { id: uid(), title: 'Pronomes', image: img('pronomes') },
        { id: uid(), title: 'Painel + Atividade dos Porquês', image: img('porques-lingua-portuguesa') },
        { id: uid(), title: 'Sinais de Pontuação (Exclamação, Interrogação, Ponto-final e Vírgula)', image: img('sinais-pontuacao') },
        { id: uid(), title: 'Sinais de Pontuação (Ponto e vírgula, Reticências, Travessão e Dois-pontos)', image: img('sinais-pontuacao-2') },
        { id: uid(), title: 'Ditado dos Sinônimos e Antônimos', image: img('ditado-divertido') },
        { id: uid(), title: 'Kit Ortografia' },
        { id: uid(), title: 'Kit Gramática Interativa' },
        { id: uid(), title: 'Kit Gramática – Sílabas Tônicas e Outros' },
        { id: uid(), title: 'Kit Sinais de Pontuação' },
        { id: uid(), title: 'Kit Caça-palavras (Substantivos e Adjetivos)' },
      ],
    },
    {
      id: 'generos-textuais',
      title: 'Gêneros Textuais (Por Ano)',
      icon: '📚',
      color: 'hsl(43, 96%, 52%)',
      items: [
        { id: uid(), title: 'Gêneros Textuais - 1º Ano', image: img('generos-textuais') },
        { id: uid(), title: 'Gêneros Textuais - 2º Ano', image: img('generos-textuais') },
        { id: uid(), title: 'Gêneros Textuais - 3º Ano', image: img('generos-textuais') },
        { id: uid(), title: 'Gêneros Textuais - 4º Ano', image: img('generos-textuais') },
        { id: uid(), title: 'Gêneros Textuais - 5º Ano', image: img('generos-textuais') },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// ABA 3 — AVALIAÇÃO E SONDAGEM
// ═══════════════════════════════════════════════════════════════════════════════

const avaliacaoTab: CatalogTab = {
  id: 'avaliacao',
  label: 'Avaliação e Sondagem',
  icon: '📋',
  description: 'Ferramentas de diagnóstico, relatórios descritivos e acompanhamento de aprendizagem.',
  accentColor: 'hsl(199, 65%, 48%)',
  subcategories: [
    {
      id: 'cadernos-sondagem',
      title: 'Cadernos de Sondagem (Por Ano)',
      icon: '📓',
      color: 'hsl(199, 65%, 48%)',
      items: [
        { id: uid(), title: 'Caderno de Sondagem – 1º ao 5º Ano (Combo)' },
        { id: uid(), title: 'Caderno de Sondagem – 1º Ano' },
        { id: uid(), title: 'Caderno de Sondagem – 2º Ano' },
        { id: uid(), title: 'Caderno de Sondagem – 3º Ano' },
        { id: uid(), title: 'Caderno de Sondagem – 4º Ano' },
        { id: uid(), title: 'Caderno de Sondagem – 5º Ano' },
      ],
    },
    {
      id: 'relatorios-diagnosticos',
      title: 'Relatórios e Diagnósticos',
      icon: '📊',
      color: 'hsl(0, 84%, 62%)',
      items: [
        { id: uid(), title: 'Avaliação Diagnóstica/Sondagem 1º ao 5º ano' },
        { id: uid(), title: 'Avaliação Descritiva – Relatório do Aluno' },
        { id: uid(), title: 'Autoavaliação para Nota de Participação' },
        { id: uid(), title: 'Legenda da Correção' },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// ABA 4 — ROTINA, DECORAÇÃO E DATAS COMEMORATIVAS
// ═══════════════════════════════════════════════════════════════════════════════

const rotinaTab: CatalogTab = {
  id: 'rotina',
  label: 'Rotina, Decoração e Datas Comemorativas',
  icon: '🏫',
  description: 'Materiais de ambientação de sala, gestão de comportamento e eventos do calendário.',
  accentColor: 'hsl(43, 96%, 52%)',
  subcategories: [
    {
      id: 'decoracao-organizacao',
      title: 'Decoração e Organização de Sala',
      icon: '🎨',
      color: 'hsl(43, 96%, 52%)',
      items: [
        { id: uid(), title: 'Painel Calendário 2026' },
        { id: uid(), title: 'Painel Ajudante do Dia' },
        { id: uid(), title: 'Combinados da Turma' },
        { id: uid(), title: 'Plaquinha do Nome' },
        { id: uid(), title: 'Painel de Aniversário Cartaz' },
        { id: uid(), title: 'Saudações Boas-Vindas' },
        { id: uid(), title: 'Relógio de Parede Educativo' },
        { id: uid(), title: 'Kit Bilhetes Úteis da Rotina Escolar' },
        { id: uid(), title: 'Terminei e Agora? – Fichas de Missões', image: img('terminei-e-agora') },
        { id: uid(), title: 'Incentive o Uso da Borracha – Borracha, pra quê?' },
        { id: uid(), title: 'Aviso de Porta' },
        { id: uid(), title: 'Pauta Reunião Escolar' },
        { id: uid(), title: 'Carta de Compromisso' },
      ],
    },
    {
      id: 'alfabetos-cartazes',
      title: 'Alfabetos e Cartazes (Gerais e Temáticos)',
      icon: '🔠',
      color: 'hsl(173, 58%, 44%)',
      items: [
        { id: uid(), title: 'Alfabeto Cursiva e Caixa Alta (Bordas Coloridas)' },
        { id: uid(), title: 'Alfabeto Cursiva e Caixa Alta (Com Imagens)' },
        { id: uid(), title: 'Alfabeto LIBRAS' },
        { id: uid(), title: 'Alfabeto Caixa Alta Bandeirinha' },
        { id: uid(), title: 'Cartazes Tema Cores: Alfabeto, Calendário, Combinados, Painéis, Sinais de Pontuação e Sílaba Tônica' },
        { id: uid(), title: 'Cartazes Tema Espaço: Alfabeto, Calendário, Combinados, Painéis, Sinais de Pontuação e Sílaba Tônica' },
      ],
    },
    {
      id: 'datas-comemorativas',
      title: 'Datas Comemorativas e Lembrancinhas',
      icon: '🎉',
      color: 'hsl(340, 82%, 65%)',
      items: [
        { id: uid(), title: 'Páscoa: Kit Páscoa, Soletrando com o Coelho, Dobradura Caleidoscópio, Lembrancinha Cenoura', image: img('soletrando-coelho') },
        { id: uid(), title: 'Carnaval: Kit Carnaval, Festa da Interpretação (Bloquinho de Carnaval)', image: img('bloquinho-interpretacao-carnaval') },
        { id: uid(), title: 'Festas Juninas: Painel Colorido, Painel Cordel (P&B), Stop da Interpretação Festa Junina', image: img('stop-interpretacao') },
        { id: uid(), title: 'Folclore: Stop do Folclore, Adivinhe as Lendas, Sequência Didática Saci Pererê' },
        { id: uid(), title: 'Datas Cívicas: Dia da Consciência Negra, Acróstico da Bandeira, Livreto Independência do Brasil, Kit Proclamação da República e Dia da Bandeira' },
        { id: uid(), title: 'Família e Datas Especiais: Dia das Mães (Lembrancinha Flor, Mãe Maravilhosa e Minilivro), Dia dos Pais (Decoração de Porta e Carteira), Dia da Mulher (Retrato e Kit), Dia dos Povos Indígenas (Autorretrato com Cocar)' },
        { id: uid(), title: 'Infância e Escola: Lapbook Dia das Crianças, Bracelete das Crianças, Painel Dia das Crianças, Kit Dia da Escola, Lembrancinha de Aniversário' },
        { id: uid(), title: 'Volta às Aulas: Painel de Boas-Vindas Bobbie Goods, Bracelete do Estudante, Peso e Altura' },
      ],
    },
    {
      id: 'projetos-especiais',
      title: 'Projetos Especiais',
      icon: '🌟',
      color: 'hsl(249, 76%, 64%)',
      items: [
        { id: uid(), title: 'Lata Musical com Fichas' },
        { id: uid(), title: 'Projeto Descomplicando a Caligrafia' },
        { id: uid(), title: 'Assinatura do Clube das Profs' },
      ],
    },
  ],
};

export const catalogTabs: CatalogTab[] = [ludicTab, portugueseTab, avaliacaoTab, rotinaTab];
