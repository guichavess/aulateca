import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

import imgSoletrandoCoelho from '@/assets/catalog/soletrando-coelho.png';
import imgStopInterpretacao from '@/assets/catalog/stop-interpretacao.png';
import imgCalculadoraPalavras from '@/assets/catalog/calculadora-palavras.png';
import imgTermineiEAgora from '@/assets/catalog/terminei-e-agora.png';
import imgConectivos from '@/assets/catalog/conectivos-producao-texto.png';
import imgGenerosTextuais from '@/assets/catalog/generos-textuais.png';
import imgLeiturometro from '@/assets/catalog/leiturometro.png';
import imgStopOrtografia from '@/assets/catalog/stop-ortografia.png';
import imgStopLeitura from '@/assets/catalog/stop-leitura.png';
import imgSoletrandoOrtografia from '@/assets/catalog/soletrando-ortografia.png';
import imgBanquinhaLeitura from '@/assets/catalog/banquinha-leitura.png';
import imgClassificacaoPalavras from '@/assets/catalog/classificacao-palavras.png';
import imgTrilhaVerbos from '@/assets/catalog/trilha-verbos.png';
import imgExplorandoSilabas from '@/assets/catalog/explorando-silabas.png';
import imgFabricaTextos from '@/assets/catalog/fabrica-textos.png';
import imgSujeitoPredicado from '@/assets/catalog/sujeito-predicado.png';
import imgFestivalTextual from '@/assets/catalog/festival-textual.png';
import imgDitadoDivertido from '@/assets/catalog/ditado-divertido.png';
import imgAeroportoLeitura from '@/assets/catalog/aeroporto-leitura.png';
import imgCineroteirista from '@/assets/catalog/cineroteirista.png';
import imgOficinaOrtografica from '@/assets/catalog/oficina-ortografica.png';
import imgPronomes from '@/assets/catalog/pronomes.png';
import imgPorques from '@/assets/catalog/porques-lingua-portuguesa.png';
import imgAventurasOrtograficas from '@/assets/catalog/aventuras-ortograficas.png';
import imgExplorandoClassesGramaticais from '@/assets/catalog/explorando-classes-gramaticais.png';
import imgDobraduraInterpretacao from '@/assets/catalog/dobradura-interpretacao-producao.png';
import imgDesafioSilabasTonicas from '@/assets/catalog/desafio-silabas-tonicas.png';
import imgSinaisPontuacao from '@/assets/catalog/sinais-pontuacao.png';
import imgSinaisPontuacao2 from '@/assets/catalog/sinais-pontuacao-2.png';
import imgMissaoPortugues from '@/assets/catalog/missao-portugues-espaco.png';
import imgDiarioAventuras from '@/assets/catalog/diario-aventuras.png';

interface Product {
  title: string;
  image?: string;
}

const catalog: { category: string; icon: string; items: Product[] }[] = [
  {
    category: 'Lúdicas',
    icon: '🎲',
    items: [
      { title: 'Stop da Interpretação', image: imgStopInterpretacao },
      { title: 'Stop da Leitura', image: imgStopLeitura },
      { title: 'Stop da Ortografia', image: imgStopOrtografia },
      { title: 'Stop da Matemática + Bônus' },
      { title: 'STOP do Valor Posicional' },
      { title: 'Stop do Folclore Brasileiro' },
      { title: 'Stop da Interpretação – Festa Junina' },
      { title: 'Bingo do Nome' },
      { title: 'Bingo das Assinaturas' },
      { title: 'Bingo dos Vegetais' },
      { title: 'Bingo da Tabuada' },
      { title: 'Bingo das Formas Planas e Tridimensionais' },
      { title: 'Bingo da Festa Junina' },
      { title: 'Bingo da Proclamação da República' },
      { title: 'Jogo da Tabuada – Abre e Fecha' },
      { title: 'Jogo da Adição – Abre e Fecha' },
      { title: 'Jogo da Subtração – Abre e Fecha' },
      { title: 'Jogo da Divisão – Abre e Fecha' },
      { title: 'Jogo das Combinações' },
      { title: 'Jogo Matemágica 1º e 2º ANO' },
      { title: 'Jogo Matemágica 3º ao 5º ANO' },
      { title: 'Jogo Aventuras Ortográficas', image: imgAventurasOrtograficas },
      { title: 'Jogo Abre e Fecha da Bandeira' },
      { title: 'Show do Milhão' },
      { title: 'Trilha dos Verbos', image: imgTrilhaVerbos },
      { title: 'Trilha das Formas Geométricas' },
      { title: 'Desafio do Mercadinho Matemático' },
      { title: 'Pizzaria das Frações' },
      { title: 'Calculando com UNO' },
      { title: 'Lata Musical com Fichas' },
      { title: '19 Atividades Dinâmicas – Gincana da Música' },
      { title: 'Quebra-cabeça dos Números' },
      { title: 'Quebra-cabeça da Festa Junina' },
      { title: 'Labirintos Matemáticos – Contagem Saltitante' },
      { title: 'Missão Matemática no Espaço' },
      { title: 'Missão Português no Espaço', image: imgMissaoPortugues },
      { title: 'Soletrando – Ortografia (1º ao 5º ano)', image: imgSoletrandoOrtografia },
      { title: 'Soletrando com o Coelho – Páscoa e Ortografia', image: imgSoletrandoCoelho },
      { title: 'Pescaria Junina da Matemática' },
      { title: 'Folclore – Adivinhe as Lendas Brasileiras' },
      { title: 'Calculadora de Palavras-chave de Matemática', image: imgCalculadoraPalavras },
      { title: 'QUIZ sobre Bullying' },
      { title: 'Festa da Interpretação', image: imgFestivalTextual },
      { title: 'Terminei e Agora?', image: imgTermineiEAgora },
      { title: 'Terminei e Agora? – Matemática' },
      { title: 'Terminei e Agora? – Fichas de Missões' },
      { title: 'Ticket Premiado' },
    ],
  },
  {
    category: 'Língua Portuguesa',
    icon: '📝',
    items: [
      { title: 'Classificação das Palavras – Gramática Ensino Fundamental', image: imgClassificacaoPalavras },
      { title: 'Sílabas – Classificação e Separação Silábica', image: imgExplorandoSilabas },
      { title: 'Ortografia', image: imgOficinaOrtografica },
      { title: 'Gramática Contextualizada', image: imgPorques },
      { title: 'Pronomes', image: imgPronomes },
      { title: 'Uso da Vírgula' },
      { title: 'Acentuação' },
      { title: 'Sílabas Tônicas', image: imgDesafioSilabasTonicas },
      { title: 'Interpretação de Texto' },
      { title: 'Concordância' },
      { title: 'Verbos' },
      { title: 'Análise Ortográfica' },
      { title: 'Inglês e Palavras Semelhantes' },
      { title: 'Sinônimos e Antônimos' },
      { title: 'Pontuação (Exclamação, Interrogação, Ponto-final e Vírgula)', image: imgSinaisPontuacao },
      { title: 'Pontuação (Ponto e vírgula, Reticências, Travessão e Dois-pontos)', image: imgSinaisPontuacao2 },
      { title: 'Ditado', image: imgDitadoDivertido },
      { title: 'Palavras Mágicas' },
      { title: 'Textômetro' },
      { title: 'Leitura', image: imgLeiturometro },
      { title: 'Compreensão Textual' },
      { title: 'Fichas de Leitura', image: imgAeroportoLeitura },
      { title: 'Dicionário' },
      { title: 'Gramática Diária' },
      { title: 'Classe de Palavras', image: imgExplorandoClassesGramaticais },
      { title: 'Formação de Palavras' },
      { title: 'Roda de Leitura e História', image: imgBanquinhaLeitura },
      { title: 'Gêneros Textuais para 1º ANO', image: imgGenerosTextuais },
      { title: 'Gêneros Textuais para 2º ANO', image: imgGenerosTextuais },
      { title: 'Gêneros Textuais para 3º ANO', image: imgGenerosTextuais },
      { title: 'Gêneros Textuais para 4º ANO', image: imgGenerosTextuais },
      { title: 'Gêneros Textuais para 5º ANO', image: imgGenerosTextuais },
      { title: 'Produção de Frases' },
      { title: 'Rimas' },
      { title: 'Alfabeto' },
    ],
  },
  {
    category: 'Interpretação e Produção Textual',
    icon: '✍️',
    items: [
      { title: 'Fábrica de Textos', image: imgFabricaTextos },
      { title: 'Oficina de Textos', image: imgCineroteirista },
      { title: 'Kit – Produção Textual' },
      { title: 'Interpretação Textual', image: imgDobraduraInterpretacao },
      { title: 'Produção Textual – Dissertativa' },
      { title: 'Parágrafo e Dicas de Produção Textual' },
      { title: 'Redação e Produção Textual', image: imgConectivos },
      { title: 'Diário de Aventuras', image: imgDiarioAventuras },
      { title: 'Situação-Problema' },
    ],
  },
  {
    category: 'Matemática',
    icon: '🔢',
    items: [
      { title: 'Adição' },
      { title: 'Subtração' },
      { title: 'Multiplicação' },
      { title: 'Subtração com Reserva' },
      { title: 'Revisão 1º ano' },
      { title: 'Revisão 2º ano' },
      { title: 'Revisão 3º ano' },
      { title: 'Revisão 4º ano' },
      { title: 'Revisão 5º ano' },
      { title: 'Tabuada' },
      { title: 'Pitágoras Dinâmica' },
      { title: 'Frações' },
      { title: 'Operações com Números Decimais' },
      { title: 'Atividades Interativas – Adição e Subtração' },
      { title: 'Relógio de Montar' },
      { title: 'Sequência Numérica (Decimal e Natural)' },
      { title: 'Equações' },
      { title: 'Medidas' },
    ],
  },
  {
    category: 'Ciências e Meio Ambiente',
    icon: '🌿',
    items: [
      { title: 'Água – Atitudes que Mudam o Jogo' },
      { title: 'Reciclagem – Atividades + Painéis Educativos' },
      { title: 'Corpo Humano' },
      { title: 'Plantas' },
      { title: 'Animais' },
      { title: 'Planetas – Definições Celestiais' },
      { title: 'Semáforo dos Alimentos e Saúde Dental' },
      { title: 'Cadeia Alimentar' },
      { title: 'Biomas – Triorama' },
      { title: 'Meio Ambiente' },
    ],
  },
  {
    category: 'História',
    icon: '🏛️',
    items: [
      { title: 'Regiões do Brasil + Cruzadinha das Capitais' },
      { title: 'Linha do Tempo Dinâmica' },
      { title: 'Localização Geográfica: Eu no Mundo' },
      { title: 'Mapa do Brasil' },
      { title: 'Civilizações' },
      { title: 'Cultura Popular' },
      { title: 'Independência do Brasil' },
      { title: 'História do Brasil – Dia do Hino, Tiradentes' },
      { title: 'Diagnóstico da Bandeira do Brasil' },
      { title: 'Sequência Didática Saci Pererê – Folclore' },
      { title: 'Folclore' },
      { title: 'Trânsito' },
      { title: 'Semáforo dos Sentimentos' },
      { title: 'Jogo da Empatia' },
      { title: 'Emoções' },
      { title: 'História para Trabalhar Bullying' },
      { title: 'Diversidade' },
      { title: 'Cartilha – Combate ao Abuso e Exploração Sexual' },
    ],
  },
  {
    category: 'Avaliação e Sondagem',
    icon: '📊',
    items: [
      { title: 'Avaliação – 1º ao 5º Ano' },
      { title: 'Avaliação – 1º Ano' },
      { title: 'Avaliação – 2º Ano' },
      { title: 'Avaliação – 3º Ano' },
      { title: 'Avaliação – 4º Ano' },
      { title: 'Avaliação – 5º Ano' },
      { title: 'Avaliação Descritiva – Relatório do Aluno' },
      { title: 'Avaliação para Nota de Participação' },
      { title: 'Sondagem' },
      { title: 'Kit Completo' },
    ],
  },
  {
    category: 'Decoração',
    icon: '🎨',
    items: [
      { title: 'Calendário 2026' },
      { title: 'Cartazes Úteis da Rotina Escolar' },
      { title: 'Painel de Aniversário' },
      { title: 'Painel Chamadinha' },
      { title: 'Plaquinhas' },
      { title: 'Etiquetas' },
      { title: 'Calendário Cartaz' },
      { title: 'Decorações Boas-Vindas' },
      { title: 'Cantinhos' },
      { title: 'Chamadinha' },
      { title: 'Combinação Escolar' },
      { title: 'Relógio de Parede Educativo' },
      { title: 'Formas Geométricas' },
      { title: 'Moldes' },
      { title: 'Bandeirolas' },
      { title: 'Organização Escolar' },
      { title: 'Lembrança do Dia de Prova' },
      { title: 'Capas de Caderno' },
      { title: 'Capas de Prova' },
      { title: 'Fichas de Identificação' },
      { title: 'Crachás' },
      { title: 'Adesivos' },
      { title: 'Marcadores' },
      { title: 'Kit Páscoa' },
      { title: 'Páscoa – Caleidoscópio' },
      { title: 'Páscoa Cenoura' },
      { title: 'Festa Junina' },
      { title: 'São João' },
      { title: 'Consciência Negra' },
      { title: 'Indígenas – Autorretrato com Cocar' },
      { title: 'Dia das Mães – Cartão' },
      { title: 'Dia das Mães – Lembrancinha Flor' },
      { title: 'Dia das Mães – Lembrancinha Mãe Maravilhosa' },
      { title: 'Dia das Mães' },
      { title: 'Dia dos Pais' },
      { title: 'Decoração de Porta – Dia dos Pais' },
      { title: 'Primavera' },
      { title: 'Dia do Estudante' },
      { title: 'Halloween' },
      { title: 'Dia do Professor' },
      { title: 'Proclamação da República + Dia da Bandeira' },
      { title: 'Dia das Crianças' },
      { title: 'Lembrancinha Dia das Crianças' },
      { title: 'Kit Dia das Crianças' },
      { title: 'Inverno' },
      { title: 'Outono' },
      { title: 'Dia da Árvore' },
      { title: 'Decoração Natal + Painel + Lembrancinha' },
      { title: 'Volta às Aulas' },
      { title: 'Aniversário' },
      { title: 'Volta às Aulas – Mini' },
    ],
  },
  {
    category: 'Ensino Religioso e Socioemocional',
    icon: '🙏',
    items: [
      { title: 'Atividade de Ensino Religioso' },
      { title: 'Semáforo dos Sentimentos' },
      { title: 'Balão da Empatia' },
      { title: 'Bilhete das Emoções' },
      { title: 'História para Trabalhar Bullying' },
      { title: 'Mural Interativo Sobre Bullying' },
      { title: 'Maio Laranja – Combate ao Abuso e Exploração Sexual' },
    ],
  },
  {
    category: 'Datas Comemorativas',
    icon: '🎉',
    items: [
      { title: 'Kit Páscoa' },
      { title: 'Dobradura de Páscoa – Caleidoscópio' },
      { title: 'Lembrancinha de Páscoa Cenoura' },
      { title: 'Retrato Dia da Mulher' },
      { title: 'Kit Dia da Mulher' },
      { title: 'Dia da Consciência Negra' },
      { title: 'Dia dos Povos Indígenas – Autorretrato com Cocar' },
      { title: 'Dia do Trabalhador' },
      { title: 'Dia das Mães – Lembrancinha Flor' },
      { title: 'Dia das Mães – Lembrancinha Mãe Maravilhosa' },
      { title: 'Minilivro de Dia das Mães' },
      { title: 'Kit Dia dos Pais' },
      { title: 'Decoração de Porta – Dia dos Pais' },
      { title: 'Carteira do Dia dos Pais' },
      { title: 'Painel Festa Junina Colorido' },
      { title: 'Painel Festa Junina Preto e Branco Tipo Cordel' },
      { title: 'Kit Carnaval' },
      { title: 'Kit Proclamação da República + Dia da Bandeira' },
      { title: 'Painel Dia das Crianças' },
      { title: 'Bracelete das Crianças' },
      { title: 'Lapbook Dia das Crianças' },
      { title: 'Atividades da Primavera' },
      { title: 'Painel da Primavera' },
      { title: 'Sanforama Dia da Árvore' },
      { title: 'Coleção Natal + Painel + Lembrancinha' },
      { title: 'Painel de Boas-Vindas Volta às Aulas' },
      { title: 'Lembrancinha de Aniversário' },
      { title: 'Peso e Altura Volta às Aulas' },
    ],
  },
];

const CatalogPage: React.FC = () => {
  return (
    <div className="px-5 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="animate-slide-up">
        <h1 className="font-fredoka text-2xl sm:text-3xl font-bold tracking-tight gradient-text mb-1">
          Catálogo de Atividades 📚
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Explore nosso acervo completo de atividades organizadas por categoria.
        </p>
      </div>

      <Tabs defaultValue="Lúdicas" className="animate-slide-up" style={{ animationDelay: '0.08s' }}>
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-secondary/50 p-1.5 rounded-xl">
          {catalog.map((cat) => (
            <TabsTrigger
              key={cat.category}
              value={cat.category}
              className="rounded-lg text-[11px] sm:text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 px-2.5 py-1.5"
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.category}
            </TabsTrigger>
          ))}
        </TabsList>

        {catalog.map((cat) => (
          <TabsContent key={cat.category} value={cat.category} className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{cat.icon}</span>
              <h2 className="font-fredoka text-lg font-semibold text-foreground">{cat.category}</h2>
              <span className="type-badge ml-1" style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
                {cat.items.length} itens
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {cat.items.map((item, i) => (
                <div
                  key={`${cat.category}-${i}`}
                  className="activity-card animate-slide-up group"
                  style={{ animationDelay: `${Math.min(i * 0.02, 0.4)}s` }}
                >
                  {item.image && (
                    <div className="w-full h-32 rounded-lg overflow-hidden mb-3">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h3 className="font-fredoka text-sm font-semibold text-foreground leading-snug mb-3 tracking-tight line-clamp-2 min-h-[2.5rem]">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-end pt-3 mt-auto" style={{ borderTop: '1px solid hsl(var(--border) / 0.5)' }}>
                    <Button
                      size="sm"
                      className="rounded-xl text-[11px] font-semibold gap-1 btn-primary-glow h-8 px-3"
                    >
                      <Eye className="w-3 h-3" />
                      Ver detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CatalogPage;
