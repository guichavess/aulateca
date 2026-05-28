// ══════════════════════════════════════════════════════════════════════════════
// Catalog Data — Structured by Tabs > Subcategories > Items
// ══════════════════════════════════════════════════════════════════════════════

import imgAventurasOrtograficas from '@/assets/catalog/aventuras-ortograficas.png';
import imgDesafioSilabasTonicas from '@/assets/catalog/desafio-silabas-tonicas.png';
import imgMissaoPortugues from '@/assets/catalog/missao-portugues-espaco.png';
import imgLeiturometro from '@/assets/catalog/leiturometro.png';
import imgDiarioAventuras from '@/assets/catalog/diario-aventuras.png';
import imgAeroportoLeitura from '@/assets/catalog/aeroporto-leitura.png';
import imgBanquinhaLeitura from '@/assets/catalog/banquinha-leitura.png';
import imgFabricaTextos from '@/assets/catalog/fabrica-textos.png';
import imgFestivalTextual from '@/assets/catalog/festival-textual.png';
import imgCineroteirista from '@/assets/catalog/cineroteirista.png';
import imgConectivos from '@/assets/catalog/conectivos-producao-texto.png';
import imgDobraduraInterpretacao from '@/assets/catalog/dobradura-interpretacao-producao.png';
import imgSoletrandoOrtografia from '@/assets/catalog/soletrando-ortografia.png';
import imgOficinaOrtografica from '@/assets/catalog/oficina-ortografica.png';
import imgTrilhaVerbos from '@/assets/catalog/trilha-verbos.png';
import imgClassificacaoPalavras from '@/assets/catalog/classificacao-palavras.png';
import imgExplorandoSilabas from '@/assets/catalog/explorando-silabas.png';
import imgSujeitoPredicado from '@/assets/catalog/sujeito-predicado.png';
import imgPronomes from '@/assets/catalog/pronomes.png';
import imgPorques from '@/assets/catalog/porques-lingua-portuguesa.png';
import imgSinaisPontuacao from '@/assets/catalog/sinais-pontuacao.png';
import imgSinaisPontuacao2 from '@/assets/catalog/sinais-pontuacao-2.png';
import imgDitadoDivertido from '@/assets/catalog/ditado-divertido.png';
import imgGenerosTextuais from '@/assets/catalog/generos-textuais.png';
import imgSoletrandoCoelho from '@/assets/catalog/soletrando-coelho.png';
import imgBloquinhoCarnaval from '@/assets/catalog/bloquinho-interpretacao-carnaval.png';
import imgStopInterpretacao from '@/assets/catalog/stop-interpretacao.png';
import imgTermineiEAgora from '@/assets/catalog/terminei-e-agora.png';
import imgKitJogosPortugues from '@/assets/catalog/kit-jogos-portugues.png';
import imgJogoCombinacoes from '@/assets/catalog/jogo-combinacoes.png';
import imgPalavrasMagicas from '@/assets/catalog/palavras-magicas.png';
import imgBingoNome from '@/assets/catalog/bingo-nome.png';
import imgBingoAssinaturas from '@/assets/catalog/bingo-assinaturas.png';
import imgAtividadesDinamicas from '@/assets/catalog/atividades-dinamicas.png';
import imgCertificadoExplorador from '@/assets/catalog/certificado-explorador.png';
import imgMaletaLiteraria from '@/assets/catalog/maleta-literaria.png';
import imgRoleReconte from '@/assets/catalog/role-reconte.png';
import imgBilheteAgenda from '@/assets/catalog/bilhete-agenda.png';
import imgGuiaJornada from '@/assets/catalog/guia-jornada.png';
import imgMelhorLivro from '@/assets/catalog/melhor-livro.png';
import imgRelatorioLeitura from '@/assets/catalog/relatorio-leitura.png';
import imgPassaportePremium from '@/assets/catalog/passaporte-premium.png';
import imgProducaoDissertativa from '@/assets/catalog/producao-dissertativa.png';
import imgMarcadorParagrafo from '@/assets/catalog/marcador-paragrafo.png';
import imgKitProducaoTexto from '@/assets/catalog/kit-producao-texto.png';
import imgKitLapisProducao from '@/assets/catalog/kit-lapis-producao.png';

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
        { id: uid(), title: 'Kit Jogos Português', image: imgKitJogosPortugues },
        { id: uid(), title: 'Jogo das Combinações', image: imgJogoCombinacoes },
        { id: uid(), title: 'Jogo Aventuras Ortográficas', image: imgAventurasOrtograficas },
        { id: uid(), title: 'Desafio das Sílabas Tônicas', image: imgDesafioSilabasTonicas },
        { id: uid(), title: 'Missão Português no Espaço', image: imgMissaoPortugues },
        { id: uid(), title: 'Palavras Mágicas', image: imgPalavrasMagicas },
        { id: uid(), title: 'Bingo do Nome', image: imgBingoNome },
        { id: uid(), title: 'Bingo das Assinaturas', image: imgBingoAssinaturas },
        { id: uid(), title: '19 Atividades Dinâmicas (Gincana da Música e Continue o Desenho)', image: imgAtividadesDinamicas },
      ],
    },
    {
      id: 'leitura-interativa',
      title: 'Leitura Interativa',
      icon: '📖',
      color: 'hsl(199, 65%, 48%)',
      items: [
        { id: uid(), title: 'Passaporte da Leitura', image: imgLeiturometro },
        { id: uid(), title: 'Certificado do Explorador Literário', image: imgCertificadoExplorador },
        { id: uid(), title: 'Maleta Literária', image: imgMaletaLiteraria },
        { id: uid(), title: 'Role e Reconte', image: imgRoleReconte },
        { id: uid(), title: 'Atividade de Leitura e Visualização', image: imgAeroportoLeitura },
        { id: uid(), title: 'Hora da História', image: imgBanquinhaLeitura },
        { id: uid(), title: 'Diário de Aventuras', image: imgDiarioAventuras },
        { id: uid(), title: 'Bilhete para Agenda sobre Leitura do Livro', image: imgBilheteAgenda },
        { id: uid(), title: 'Guia da Jornada Textual e Literária', image: imgGuiaJornada },
        { id: uid(), title: 'O Melhor Livro (Painel + Atividades Google)', image: imgMelhorLivro },
        { id: uid(), title: 'Kit Relatório de Leitura', image: imgRelatorioLeitura },
        { id: uid(), title: 'Kit Passaporte da Leitura (Versão Premium)', image: imgPassaportePremium },
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
        { id: uid(), title: 'Fábrica de Textos', image: imgFabricaTextos },
        { id: uid(), title: 'Festival Textual', image: imgFestivalTextual },
        { id: uid(), title: 'Cineroteirista – Produção Textual', image: imgCineroteirista },
        { id: uid(), title: 'Conectivos para Melhorar a Produção de Texto', image: imgConectivos },
        { id: uid(), title: 'Dobradura da Interpretação e Produção Textual', image: imgDobraduraInterpretacao },
        { id: uid(), title: 'Produção Textual Dissertativa', image: imgProducaoDissertativa },
        { id: uid(), title: 'Marcador de Parágrafo e Dicas de Produção', image: imgMarcadorParagrafo },
        { id: uid(), title: 'Kit Produção de Texto (Recursos Completos)', image: imgKitProducaoTexto },
        { id: uid(), title: 'Kit Lápis da Produção Textual', image: imgKitLapisProducao },
        { id: uid(), title: 'Literatura de Cordel' },
      ],
    },
    {
      id: 'gramatica-ortografia',
      title: 'Gramática e Ortografia',
      icon: '🔤',
      color: 'hsl(173, 58%, 44%)',
      items: [
        { id: uid(), title: 'Soletrando – Ortografia (1º ao 5º ano)', image: imgSoletrandoOrtografia },
        { id: uid(), title: 'Oficina Ortográfica', image: imgOficinaOrtografica },
        { id: uid(), title: 'Trilha dos Verbos', image: imgTrilhaVerbos },
        { id: uid(), title: 'Classificação das Palavras (Gramática EF)', image: imgClassificacaoPalavras },
        { id: uid(), title: 'Explorando as Sílabas (Classificação e Separação)', image: imgExplorandoSilabas },
        { id: uid(), title: 'Atividade Sujeito e Predicado', image: imgSujeitoPredicado },
        { id: uid(), title: 'Uso da Vírgula' },
        { id: uid(), title: 'Pronomes', image: imgPronomes },
        { id: uid(), title: 'Painel + Atividade dos Porquês', image: imgPorques },
        { id: uid(), title: 'Sinais de Pontuação (Exclamação, Interrogação, Ponto-final e Vírgula)', image: imgSinaisPontuacao },
        { id: uid(), title: 'Sinais de Pontuação (Ponto e vírgula, Reticências, Travessão e Dois-pontos)', image: imgSinaisPontuacao2 },
        { id: uid(), title: 'Ditado dos Sinônimos e Antônimos', image: imgDitadoDivertido },
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
        { id: uid(), title: 'Gêneros Textuais - 1º Ano', image: imgGenerosTextuais },
        { id: uid(), title: 'Gêneros Textuais - 2º Ano', image: imgGenerosTextuais },
        { id: uid(), title: 'Gêneros Textuais - 3º Ano', image: imgGenerosTextuais },
        { id: uid(), title: 'Gêneros Textuais - 4º Ano', image: imgGenerosTextuais },
        { id: uid(), title: 'Gêneros Textuais - 5º Ano', image: imgGenerosTextuais },
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
        { id: uid(), title: 'Terminei e Agora? – Fichas de Missões', image: imgTermineiEAgora },
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
        { id: uid(), title: 'Páscoa: Kit Páscoa, Soletrando com o Coelho, Dobradura Caleidoscópio, Lembrancinha Cenoura', image: imgSoletrandoCoelho },
        { id: uid(), title: 'Carnaval: Kit Carnaval, Festa da Interpretação (Bloquinho de Carnaval)', image: imgBloquinhoCarnaval },
        { id: uid(), title: 'Festas Juninas: Painel Colorido, Painel Cordel (P&B), Stop da Interpretação Festa Junina', image: imgStopInterpretacao },
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
