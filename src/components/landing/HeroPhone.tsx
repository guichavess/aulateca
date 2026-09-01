import type { ReactNode } from "react";
import { Bell, Heart, Mail, Menu, ShieldCheck } from "lucide-react";
// Versão recortada e reduzida (192px) do teca-icon.png: a arte original tem
// 669x373 com margens largas, então renderizava pequena dentro do celular e
// custava 209 KB acima da dobra.
import tecaIcon from "@/assets/teca-icon-sm.png";
import { tabs } from "@/components/layout/navTabs";
import PhoneFrame from "./PhoneFrame";
import { useScreenCycle } from "./useScreenCycle";
import {
  chipsDeAno,
  chipsDeCategoria,
  fichasDestaque,
  fichasFavoritas,
  PESSOA,
} from "./phoneFichas";

// ══════════════════════════════════════════════════════════════════════════════
// Celular do hero — a tela é HTML de verdade, não print.
//
// Espelha o app que existe hoje: as três abas de `navTabs` (as mesmas que o
// `BottomTabBar` monta), os dois grupos
// de filtro da Home (categoria e ano escolar) e fichas reais do acervo, com as
// capas que a Home carrega. Uma tela por aba, então o ciclo nunca cai numa volta
// em branco — era o que acontecia quando havia 4 abas e só 3 telas com conteúdo.
//
// Uma coisa da Home NÃO é espelhada, de propósito: a linha "54 recursos
// disponíveis". Desde 29/08/2026 nenhuma tela pública anuncia o tamanho do
// acervo — ver `numeros.test.tsx`.
// ══════════════════════════════════════════════════════════════════════════════

const Chip = ({ children, active }: { children: ReactNode; active?: boolean }) => (
  <span
    className={`px-2 py-[3px] rounded-full text-[8px] font-nunito font-semibold whitespace-nowrap ${
      active
        ? "bg-[#6366F1] text-white"
        : "bg-white text-[#6B7186] border border-[#E5E7F0]"
    }`}
  >
    {children}
  </span>
);

/** Cabeçalho do app — igual nas três abas, então fica fora do que alterna. */
export const AppTopBar = () => (
  <div className="flex items-center gap-2 px-3 py-2 border-b border-[#E5E7F0] shrink-0">
    <Menu className="w-3.5 h-3.5 text-[#1A1D2B]" />
    <img
      src={tecaIcon}
      alt=""
      width={18}
      height={18}
      className="w-[18px] h-[18px] object-contain"
    />
    <span className="font-fredoka font-bold text-[11px] text-[#1A1D2B]">
      Aulateca
    </span>
    <div className="ml-auto flex items-center gap-2">
      <span className="relative">
        <Bell className="w-3.5 h-3.5 text-[#6B7186]" />
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
      </span>
      <span className="w-5 h-5 rounded-full bg-[#EEF2FF] flex items-center justify-center font-nunito text-[9px] font-bold text-[#6366F1]">
        {PESSOA.nome[0]}
      </span>
    </div>
  </div>
);

/**
 * A Home: saudação, os dois grupos de filtro e a grade de fichas.
 *
 * Exportada porque é também o passo 3 do `AccessTutorialPhone` — o tutorial
 * termina exatamente na tela que o hero mostra, que é o ponto todo dele.
 */
export const AppHomeBody = () => (
  <div className="h-full flex flex-col overflow-hidden">
    {/* Saudação */}
    <div className="px-3 pt-3 pb-2 shrink-0">
      <p className="font-fredoka font-bold text-[13px] text-[#6366F1]">
        Olá, {PESSOA.nome}! 👋
      </p>
      <p className="font-nunito text-[9px] text-[#6B7186] leading-snug">
        Explore os recursos selecionados abaixo.
      </p>
    </div>

    {/* Filtros — as duas fileiras que a Home tem */}
    <div className="px-3 space-y-1.5 shrink-0">
      <div>
        <p className="font-nunito text-[7px] font-bold uppercase tracking-wider text-[#9AA0B4] mb-1">
          Categoria
        </p>
        <div className="flex flex-wrap gap-1">
          {chipsDeCategoria.map((c, i) => (
            <Chip key={c.label} active={i === 0}>
              {c.icon} {c.label}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="font-nunito text-[7px] font-bold uppercase tracking-wider text-[#9AA0B4] mb-1">
          Ano escolar
        </p>
        <div className="flex flex-wrap gap-1">
          {chipsDeAno.map((a, i) => (
            <Chip key={a.label} active={i === 0}>
              {a.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>

    {/* Grade */}
    <div className="grid grid-cols-2 gap-1.5 px-3 pt-2.5">
      {fichasDestaque.map((f, i) => (
        <div
          key={f.titulo}
          style={{ animationDelay: `${0.06 * i}s` }}
          className="rounded-lg bg-white border border-[#E5E7F0] overflow-hidden animate-slide-up"
        >
          {/* `lazy` mesmo acima da dobra: a grade fica abaixo dos filtros e,
              no tutorial, só aparece no terceiro passo. */}
          <img
            src={f.capa}
            alt=""
            loading="lazy"
            className="w-full h-14 object-cover"
            style={{ background: `${f.cor}1F` }}
          />
          <div className="p-1.5">
            <p className="font-nunito text-[8px] font-bold text-[#1A1D2B] leading-tight line-clamp-2">
              {f.titulo}
            </p>
            <span
              className="inline-block mt-1 px-1.5 py-[1px] rounded-full font-nunito text-[7px] font-bold"
              style={{ background: `${f.cor}22`, color: f.cor }}
            >
              {f.ano}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AppFavoritesBody = () => (
  <div className="h-full px-3 pt-3 overflow-hidden">
    <p className="font-fredoka font-bold text-[12px] text-[#1A1D2B] mb-2">
      Seus Favoritos ❤️
    </p>
    <div className="space-y-1.5">
      {fichasFavoritas.map((f, i) => (
        <div
          key={f.titulo}
          style={{ animationDelay: `${0.07 * i}s` }}
          className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-[#E5E7F0] animate-slide-up"
        >
          <img
            src={f.capa}
            alt=""
            loading="lazy"
            className="w-7 h-7 rounded-md object-cover shrink-0"
            style={{ background: `${f.cor}1F` }}
          />
          <div className="min-w-0 flex-1">
            <p className="font-nunito text-[8px] font-bold text-[#1A1D2B] truncate">
              {f.titulo}
            </p>
            <p className="font-nunito text-[7px] text-[#6B7186]">{f.ano}</p>
          </div>
          <Heart className="w-3 h-3 text-[#FF6B6B] shrink-0" fill="currentColor" />
        </div>
      ))}
    </div>
  </div>
);

const AppProfileBody = () => (
  <div className="h-full px-3 pt-3 overflow-hidden">
    <p className="font-fredoka font-bold text-[12px] text-[#1A1D2B] mb-2">
      Meu perfil
    </p>

    <div className="rounded-xl bg-white border border-[#E5E7F0] p-2.5 flex items-center gap-2.5">
      <span className="w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center font-fredoka text-[13px] font-bold text-[#6366F1] shrink-0">
        {PESSOA.nome[0]}
      </span>
      <div className="min-w-0">
        <p className="font-fredoka text-[10px] font-bold text-[#1A1D2B] truncate">
          {PESSOA.nomeCompleto}
        </p>
        <p className="flex items-center gap-1 font-nunito text-[7px] text-[#6B7186] truncate">
          <Mail className="w-2.5 h-2.5 shrink-0" />
          {PESSOA.email}
        </p>
        <p className="flex items-center gap-1 font-nunito text-[7px] text-[#6B7186]">
          <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
          {PESSOA.papel}
        </p>
      </div>
    </div>

    {/* Contagem pessoal — quantas ela salvou, não quantas o acervo tem. */}
    <div className="mt-2 rounded-xl bg-white border border-[#E5E7F0] p-2.5 flex items-center gap-2.5">
      <span className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
        <Heart className="w-3.5 h-3.5 text-[#6366F1]" fill="currentColor" />
      </span>
      <div>
        <p className="font-fredoka text-[13px] font-bold text-[#1A1D2B] leading-none">
          {fichasFavoritas.length}
        </p>
        <p className="font-nunito text-[7px] text-[#6B7186] mt-0.5">Favoritos</p>
      </div>
    </div>
  </div>
);

/** A barra de abas, desenhada a partir da lista real de navegação. */
export const AppTabBar = ({ active }: { active: number }) => (
  <div
    data-testid="phone-tabs"
    className="flex items-stretch border-t border-[#E5E7F0] bg-white shrink-0"
  >
    {tabs.map((tab, i) => {
      const isActive = i === active;
      return (
        <div key={tab.path} className="flex-1 flex flex-col items-center gap-0.5 py-2">
          <tab.icon
            className={`w-3.5 h-3.5 transition-colors duration-300 ${
              isActive ? "text-[#6366F1]" : "text-[#B4B9C9]"
            }`}
            fill={isActive ? "currentColor" : "none"}
          />
          <span
            className={`font-nunito text-[7px] transition-colors duration-300 ${
              isActive
                ? "text-[#6366F1] font-bold"
                : "text-[#B4B9C9] font-semibold"
            }`}
          >
            {tab.label}
          </span>
        </div>
      );
    })}
  </div>
);

const HeroPhone = () => {
  const { screen, ref } = useScreenCycle(tabs.length);

  return (
    <div ref={ref}>
      <PhoneFrame footer={<AppTabBar active={screen} />}>
        <AppTopBar />

        {/* Uma tela por aba: nenhuma volta do ciclo fica vazia. */}
        <div key={screen} className="flex-1 min-h-0 animate-slide-up">
          {screen === 0 && <AppHomeBody />}
          {screen === 1 && <AppFavoritesBody />}
          {screen === 2 && <AppProfileBody />}
        </div>
      </PhoneFrame>
    </div>
  );
};

export default HeroPhone;
