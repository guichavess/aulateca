import { Check } from "lucide-react";
import CheckoutButton from "@/components/landing/CheckoutButton";
import TecaMascot from "@/components/brand/TecaMascot";
import {
  cobrancaRecorrente,
  emReais,
  taxaServicoCentavos,
  totalMensalCentavos,
  valorAnteriorCentavos,
  valorMensalCentavos,
} from "@/lib/oferta";

/**
 * O bloco de preço da landing.
 *
 * O layout veio de uma referência trazida pelo gestor — preço em destaque
 * dentro da própria página, lista de benefícios com marcação, botão logo
 * abaixo. O que **não** veio da referência é o conteúdo: ela era de outro
 * produto, e cada linha aqui descreve o AulaTeca de verdade.
 *
 * Duas regras que este card carrega de propósito:
 *
 *   1. **Nenhuma contagem de acervo.** Decisão do gestor em 29/08/2026: a
 *      landing não diz quantas fichas existem. Os benefícios são qualitativos —
 *      o que o material é e para quem serve, não quanto tem.
 *   2. **A recorrência aparece.** O preço mensal nunca é exibido sem a palavra
 *      "mês" ao lado, e a taxa de serviço da Cakto vem escrita antes do clique.
 *      Quem chega ao checkout não descobre nada novo lá.
 */

/**
 * Cada item é verificável no produto — nada aqui é promessa de roadmap.
 *
 * Conferido ficha a ficha contra `scripts/atividades.manifest.json`, primeiro em
 * 03/09/2026 e de novo em 07/09/2026, quando a segunda leva de fichas entrou no
 * acervo. Nas duas vezes a mesma lista de dez benefícios foi proposta, e nas
 * duas vezes quatro dela ficaram de fora. O motivo de cada uma fica registrado
 * porque a tentação de recolocá-las volta a cada revisão de copy:
 *
 *   - **Uma contagem de atividades quase o dobro do acervo.** Aquele número já
 *     esteve na página, foi removido por inflado, e hoje é bloqueado por
 *     `numeros.test.tsx` — que varre o código-fonte cru, então nem citá-lo num
 *     comentário como este passa. Foi assim que esta linha foi escrita. Vale
 *     notar que o acervo mais que dobrou em 07/09 e o número proposto continua
 *     sendo maior que o real: ele nunca descreveu o produto.
 *   - **"1° ao 9° ano"** — continua falso depois da segunda leva. As fichas
 *     cobrem 6 a 11 anos, e as que trazem o ano no nome vão do 1° ao 5°.
 *     Nenhuma ficha de 6° a 9° existe.
 *   - **"IA pedagógica"** — o microsserviço em `backend/fastapi` existe, mas o
 *     app não chega até ele: `pages/create/AIPlanPage.tsx` não tem rota nem
 *     import. Volta para cá quando a tela for religada, não antes.
 *   - **"Novas atividades adicionadas"** — 74 fichas entraram em 07/09/2026, o
 *     que torna a frase verdadeira sobre o passado e ainda assim arriscada:
 *     numa assinatura ela é lida como promessa de cadência, e cadência nenhuma
 *     foi acordada. Volta quando houver periodicidade combinada.
 *
 * "Menos tempo criando atividades do zero" entrou em 07/09/2026: é a única das
 * dez que descreve o resultado para quem compra sem afirmar quantidade,
 * cobertura curricular ou funcionalidade — e o material pronto para imprimir
 * que as outras linhas descrevem já a sustenta.
 *
 * A ordem das matérias é dado, não estilo. Em 03/09 era produção de texto (17
 * fichas) antes de interpretação (7) e gramática (5). A segunda leva virou a
 * conta: das 74 fichas novas, a maioria trabalha classe de palavra, sinônimo,
 * antônimo, sílaba, pontuação e tempo verbal, e gramática passou a ser o maior
 * bloco do acervo. Por isso ela vem primeiro agora. Inverter de volta sugeriria
 * um volume de redação que não existe mais na proporção antiga.
 *
 * "Alinhadas à BNCC" segue fora: é uma afirmação de conformidade curricular e
 * nada no repositório a sustenta. Volta quando a curadoria for confirmada.
 */
const BENEFICIOS = [
  "Jogos lúdicos e atividades para recortar, colar e brincar",
  "Gramática, produção de texto e interpretação",
  "Fichas em PDF A4, prontas para imprimir e levar para a sala",
  "Do 1° ao 5° ano do Ensino Fundamental",
  "Menos tempo criando atividades do zero",
  "Acesso pelo celular ou computador",
  "Acesso a todo o acervo enquanto a assinatura estiver ativa",
];

const OfertaCard = () => {
  const porMes = cobrancaRecorrente;

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-6 sm:p-8 text-left shadow-[0_20px_60px_rgba(26,29,43,0.25)]">
      {/* Preço */}
      <div className="text-center">
        <p className="font-nunito text-sm font-bold uppercase tracking-wide text-[#6B7186]">
          {valorAnteriorCentavos === null ? (
            "Assine por"
          ) : (
            <>
              De{" "}
              <span className="text-[#6B7186]/70 line-through">
                {emReais(valorAnteriorCentavos)}
              </span>{" "}
              por apenas
            </>
          )}
        </p>

        <p className="mt-1 font-fredoka font-bold leading-none text-[#1A1D2B]">
          <span className="text-4xl sm:text-5xl">
            {emReais(valorMensalCentavos)}
          </span>
          {porMes && (
            <span className="ml-1 font-nunito text-lg font-bold text-[#6B7186]">
              /mês
            </span>
          )}
        </p>

        <p className="mt-3 font-nunito text-xs leading-relaxed text-[#6B7186]">
          + {emReais(taxaServicoCentavos)} de taxa de serviço no checkout —{" "}
          <strong className="text-[#1A1D2B]">
            {emReais(totalMensalCentavos)}
            {porMes && " por mês"}
          </strong>
          {porMes && ", com renovação automática. Cancele quando quiser."}
        </p>
      </div>

      <hr className="my-6 border-[#E8EAF2]" />

      {/* Benefícios */}
      <ul className="space-y-3">
        {BENEFICIOS.map((beneficio) => (
          <li key={beneficio} className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6366F1]"
            >
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </span>
            <span className="font-nunito text-sm leading-relaxed text-[#3D4258]">
              {beneficio}
            </span>
          </li>
        ))}
      </ul>

      <CheckoutButton className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#FFB830] px-6 py-4 font-nunito text-base font-extrabold text-[#1A1D2B] shadow-[0_4px_20px_rgba(255,184,48,0.5)] transition-all hover:-translate-y-1 hover:brightness-105 hover:shadow-[0_8px_30px_rgba(255,184,48,0.6)] active:translate-y-0 sm:text-lg">
        <TecaMascot size="xs" className="w-7 h-7 shrink-0" />
        QUERO ACESSAR AS ATIVIDADES
      </CheckoutButton>

      <p className="mt-4 text-center font-nunito text-xs text-[#6B7186]">
        ✓ 7 dias de garantia (direito de arrependimento, CDC art. 49)
      </p>
    </div>
  );
};

export default OfertaCard;
