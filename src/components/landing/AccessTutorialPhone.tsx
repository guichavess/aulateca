import { Check, Inbox } from "lucide-react";
import TecaMascot from "@/components/brand/TecaMascot";
import { PASSWORD_MIN_LENGTH } from "@/lib/password";
import PhoneFrame from "./PhoneFrame";
import { useScreenCycle } from "./useScreenCycle";
import { AppHomeBody, AppTabBar, AppTopBar } from "./HeroPhone";
import { PESSOA } from "./phoneFichas";

// ══════════════════════════════════════════════════════════════════════════════
// O primeiro acesso, em três telas.
//
// Ocupa o lugar de `public/landing/tutorial.mp4`: 11,3 MB gravados em 22/06,
// antes da virada PDF-only, mostrando uma ferramenta que não existe mais.
//
// O que ele mostra é o caminho onde o comprador trava de verdade — do e-mail
// que chega quando o pagamento cai até estar dentro do app. Toda a copy é a que
// o sistema realmente usa: o e-mail vem de `renderAccessEmail`
// (supabase/functions/cakto-webhook/email.ts) e o formulário, de
// `CriarAcessoPage`. `AccessTutorialPhone.test.tsx` compara as duas coisas e
// quebra se a landing voltar a prometer um passo que o sistema não dá.
// ══════════════════════════════════════════════════════════════════════════════

const LEGENDAS = [
  "Assim que o pagamento cai, o e-mail chega com o link.",
  "O e-mail da compra já vem preenchido — você só escolhe a senha.",
  "Pronto: você já está dentro, com as fichas na mão.",
];

/** Passo 1 — a caixa de entrada, com o e-mail que a Edge Function envia. */
const EmailScreen = () => (
  <div className="h-full flex flex-col bg-white overflow-hidden">
    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#E5E7F0] shrink-0">
      <Inbox className="w-3 h-3 text-[#6B7186]" />
      <span className="font-nunito text-[9px] font-bold text-[#1A1D2B]">
        Caixa de entrada
      </span>
    </div>

    <div className="px-3 py-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-[#EEF2FF] flex items-center justify-center font-fredoka text-[10px] font-bold text-[#6366F1] shrink-0">
          A
        </span>
        <div className="min-w-0">
          <p className="font-nunito text-[8px] font-bold text-[#1A1D2B]">
            Aulateca
          </p>
          <p className="font-nunito text-[7px] text-[#6B7186] truncate">
            para {PESSOA.email}
          </p>
        </div>
      </div>

      <p className="font-fredoka font-bold text-[10px] text-[#1A1D2B] leading-snug">
        Seu acesso ao Aulateca: crie sua senha
      </p>

      <div className="space-y-1.5 font-nunito text-[8px] text-[#4A4F63] leading-relaxed">
        <p>Oi, {PESSOA.nome}!</p>
        <p>Sua compra de Aulateca foi confirmada — obrigado!</p>
        <p>
          Falta só um passo: criar a senha da sua conta. Use o botão abaixo; o
          e-mail já vem preenchido com o mesmo que você usou na compra.
        </p>
      </div>

      <span className="block w-full text-center rounded-lg bg-[#6366F1] text-white font-nunito text-[9px] font-bold py-2">
        Criar minha senha
      </span>

      <p className="font-nunito text-[7px] text-[#6B7186] leading-snug">
        Importante: use o mesmo e-mail da compra.
      </p>
    </div>
  </div>
);

const Campo = ({ label, valor }: { label: string; valor: string }) => (
  <div>
    <p className="font-nunito text-[7px] font-semibold text-[#6B7186] mb-0.5">
      {label}
    </p>
    <p className="rounded-md border border-[#E5E7F0] bg-[#FAFBFD] px-2 py-1.5 font-nunito text-[8px] text-[#1A1D2B] truncate">
      {valor}
    </p>
  </div>
);

/**
 * Passo 2 — `/criar-acesso`, com o card claro sobre o fundo escuro do
 * `AuthShell`. Os requisitos de senha aparecem verdes porque é o que a pessoa
 * vê enquanto digita: a política é explicada antes, não depois do erro.
 */
const CriarAcessoScreen = () => (
  // Centralizado como o `AuthShell` centraliza o card na tela.
  <div className="h-full flex flex-col justify-center px-2.5 py-2 overflow-hidden">
    <div className="flex items-center justify-center gap-1.5 pb-2 shrink-0">
      <TecaMascot size="xs" className="w-4 h-4" />
      <span className="font-fredoka text-[11px] font-bold text-white">
        Aulateca
      </span>
    </div>

    <div className="rounded-xl bg-white p-2.5 space-y-2">
      <p className="font-fredoka font-bold text-[11px] text-[#1A1D2B]">
        Criar seu acesso
      </p>

      <Campo label="E-mail da compra" valor={PESSOA.email} />
      <Campo label="Seu nome" valor={PESSOA.nomeCompleto} />
      <Campo label="Crie uma senha" valor="••••••••" />

      <ul className="space-y-0.5">
        {[
          `Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`,
          "Letras maiúsculas e minúsculas",
          "Um número ou símbolo",
        ].map((regra) => (
          <li
            key={regra}
            className="flex items-center gap-1 font-nunito text-[7px] text-[#1F8A70]"
          >
            <Check className="w-2 h-2 shrink-0" />
            {regra}
          </li>
        ))}
      </ul>

      <div>
        <p className="font-nunito text-[7px] font-semibold text-[#6B7186] mb-1">
          Eu sou
        </p>
        <div className="flex gap-1">
          {["Professor(a)", "Pai/Mãe", "Terapeuta"].map((papel, i) => (
            <span
              key={papel}
              className={`flex-1 text-center rounded-full py-[3px] font-nunito text-[7px] font-semibold ${
                i === 0
                  ? "bg-[#6366F1] text-white"
                  : "bg-white text-[#6B7186] border border-[#E5E7F0]"
              }`}
            >
              {papel}
            </span>
          ))}
        </div>
      </div>

      <span className="block w-full text-center rounded-lg bg-[#6366F1] text-white font-nunito text-[9px] font-bold py-2">
        Criar acesso e entrar →
      </span>
    </div>
  </div>
);

const AccessTutorialPhone = () => {
  const { screen, setScreen, ref } = useScreenCycle(LEGENDAS.length);

  return (
    <div ref={ref} className="flex flex-col items-center gap-4">
      {/* O passo 3 é a mesma tela do celular do hero: o tutorial termina onde a
          visitante já viu que vai chegar. Os dois primeiros não têm barra de
          abas porque o app ainda não começou. */}
      <PhoneFrame
        tone={screen === 1 ? "dark" : "light"}
        footer={screen === 2 ? <AppTabBar active={0} /> : undefined}
      >
        {screen === 2 && <AppTopBar />}
        <div key={screen} className="flex-1 min-h-0 animate-slide-up">
          {screen === 0 && <EmailScreen />}
          {screen === 1 && <CriarAcessoScreen />}
          {screen === 2 && <AppHomeBody />}
        </div>
      </PhoneFrame>

      {/* Legenda e bolinhas ficam FORA do aparelho: dentro dele o texto teria o
          tamanho do resto da tela do celular, que ninguém lê de longe.
          As cores assumem o painel roxo do `HowItWorksSection`. */}
      {/* Sem "Passo N" aqui: a seção já tem três cards numerados logo acima, e
          duas contagens de passos diferentes na mesma tela confundem. */}
      <p className="font-nunito text-sm text-white/85 text-center max-w-xs leading-relaxed min-h-[2.5rem]">
        {LEGENDAS[screen]}
      </p>

      <div className="flex items-center gap-2">
        {LEGENDAS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setScreen(i)}
            aria-label={`Passo ${i + 1}`}
            aria-current={i === screen ? "step" : undefined}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i === screen ? "bg-white" : "bg-white/35 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default AccessTutorialPhone;
