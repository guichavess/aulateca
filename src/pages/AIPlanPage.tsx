import React, { useState, useRef, useEffect } from 'react';
import { aiSuggestions, mockPlanHistory, categories } from '@/lib/data';
import { AIPlanMessage, PlanHistory } from '@/lib/types';
import { streamTecaChat } from '@/services/ai.service';
import ReactMarkdown from 'react-markdown';
import {
  Send, Copy, FileDown, Pencil, Plus, Clock, Calendar, ChevronDown,
  Target, BookOpen, Layers, Lightbulb, Share2, FileText, GraduationCap,
  Timer, BarChart3, CheckCircle2, ChevronRight, Settings2, Sparkles,
  MessageSquare
} from 'lucide-react';
import tecaMascot from '@/assets/teca-mascot.png';

const gradeOptions = ['1º ano', '2º ano', '3º ano', '4º ano', '5º ano', '6º ano', '7º ano', '8º ano', '9º ano'];
const durationOptions = ['30 min', '45 min', '50 min', '60 min', '90 min'];

const suggestionCards = [
  { icon: Target, title: 'Plano por Objetivo', desc: 'Defina o objetivo de produção textual e a Teca monta o plano', color: 'from-[hsl(var(--brand-purple))] to-[hsl(var(--brand-lilac))]', prompt: aiSuggestions[0] },
  { icon: BookOpen, title: 'Plano por Gênero', desc: 'Escolha um gênero textual e receba um plano completo', color: 'from-[hsl(var(--brand-teal))] to-[hsl(var(--brand-blue))]', prompt: aiSuggestions[1] },
  { icon: Layers, title: 'Sequência Didática', desc: 'Sequências de produção de texto por etapas', color: 'from-[hsl(var(--brand-red))] to-[hsl(var(--brand-pink))]', prompt: aiSuggestions[2] },
  { icon: Lightbulb, title: 'Projeto de Escrita', desc: 'Projetos de escrita criativa para sua turma', color: 'from-[hsl(var(--brand-yellow))] to-[hsl(var(--brand-red))]', prompt: aiSuggestions[3] },
];

const planTabs = ['Visão Geral', 'Objetivos', 'Atividades', 'Recursos', 'Avaliação'];

const getCategoryBadge = (title: string) => {
  if (title.toLowerCase().includes('narrativa') || title.toLowerCase().includes('história') || title.toLowerCase().includes('conto')) return { label: 'Narrativa', color: '#FF6B6B' };
  if (title.toLowerCase().includes('descritiv')) return { label: 'Descrição', color: '#4ECDC4' };
  if (title.toLowerCase().includes('opinião') || title.toLowerCase().includes('argument')) return { label: 'Opinião', color: '#45B7D1' };
  if (title.toLowerCase().includes('poema') || title.toLowerCase().includes('poesia')) return { label: 'Poesia', color: '#F9CA24' };
  if (title.toLowerCase().includes('jornal') || title.toLowerCase().includes('informativ')) return { label: 'Informativo', color: '#A29BFE' };
  return { label: 'Produção Textual', color: '#6C5CE7' };
};

const AIPlanPage: React.FC = () => {
  const [messages, setMessages] = useState<AIPlanMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<PlanHistory[]>(mockPlanHistory);
  const [historyFilter, setHistoryFilter] = useState<'today' | 'week' | 'older'>('today');
  const [grade, setGrade] = useState('4º ano');
  const [duration, setDuration] = useState('50 min');
  const [useBNCC, setUseBNCC] = useState(true);
  const [useAulateca, setUseAulateca] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ overview: true });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const hasAssistantMessage = messages.some(m => m.role === 'assistant');

  const sendMessage = (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: AIPlanMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Build message history for context
    const chatHistory = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.id === 'streaming') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { id: 'streaming', role: 'assistant' as const, content: assistantSoFar, timestamp: new Date() }];
      });
    };

    streamTecaChat({
      messages: chatHistory,
      grade,
      duration,
      bnccAligned: useBNCC,
      onDelta: (chunk) => upsertAssistant(chunk),
      onDone: () => {
        // Finalize message with real ID
        setMessages(prev => prev.map(m => m.id === 'streaming' ? { ...m, id: (Date.now() + 1).toString() } : m));
        setHistory(prev => [{ id: Date.now().toString(), title: text.slice(0, 40), date: new Date().toLocaleDateString('pt-BR') }, ...prev]);
        setLoading(false);
        setShowPanel(true);
      },
      onError: (errorMsg) => {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: errorMsg, timestamp: new Date() }]);
        setLoading(false);
      },
    });
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* ── LEFT SIDEBAR ── */}
      <div className="w-[280px] border-r border-border/30 flex flex-col shrink-0 hidden lg:flex bg-card">
        {/* New plan button */}
        <div className="p-4">
          <button
            onClick={() => { setMessages([]); setShowPanel(false); }}
            className="w-full btn-primary-glow text-primary-foreground rounded-xl py-3 px-4 font-nunito font-bold text-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Novo Plano
          </button>
        </div>

        {/* History filters */}
        <div className="px-4 pb-3 flex gap-1.5">
          {([['today', 'Hoje'], ['week', 'Semana'], ['older', 'Anteriores']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setHistoryFilter(key)}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${historyFilter === key ? 'chip-active text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              style={historyFilter !== key ? { background: 'hsl(var(--secondary))' } : {}}
            >
              {label}
            </button>
          ))}
        </div>

        {/* History list */}
        <div className="flex-1 overflow-auto px-4 pb-4 space-y-1.5">
          <p className="section-label mb-2.5">Histórico</p>
          {history.map((h) => {
            const badge = getCategoryBadge(h.title);
            return (
              <div key={h.id} className="glass-card p-3 cursor-pointer hover:bg-primary/5 transition-all duration-200 group rounded-xl">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 w-2 h-2 rounded-full shrink-0" style={{ background: badge.color }} />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-200">{h.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: badge.color + '18', color: badge.color }}>{badge.label}</span>
                      <span className="text-[10px] text-muted-foreground">{h.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Settings */}
        <div className="border-t border-border/30 p-4 space-y-3 bg-card">
          <div className="flex items-center gap-2 mb-1">
            <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="section-label">Configurações</p>
          </div>

          {/* Grade select */}
          <div>
            <label className="text-[11px] text-muted-foreground font-semibold mb-1 block">Série</label>
            <div className="relative">
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full appearance-none text-xs bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all duration-200"
              >
                {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Duration select */}
          <div>
            <label className="text-[11px] text-muted-foreground font-semibold mb-1 block">Duração</label>
            <div className="relative">
              <select
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full appearance-none text-xs bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all duration-200"
              >
                {durationOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Checkboxes */}
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" checked={useBNCC} onChange={e => setUseBNCC(e.target.checked)} className="accent-[hsl(var(--primary))] w-3.5 h-3.5 rounded" />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-200">Alinhamento BNCC</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" checked={useAulateca} onChange={e => setUseAulateca(e.target.checked)} className="accent-[hsl(var(--primary))] w-3.5 h-3.5 rounded" />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-200">Recursos Aulateca</span>
          </label>
        </div>
      </div>

      {/* ── CENTRAL CHAT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto px-6 py-6 lg:px-8">
          {messages.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-start sm:justify-center min-h-full py-8 animate-slide-up">
              {/* Hero */}
              <div className="relative mb-6 sm:mb-8">
                <div className="w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
                  <img src={tecaMascot} alt="Teca" className="w-40 h-40 sm:w-48 sm:h-48 object-contain" />
                </div>
              </div>
              <h2 className="font-fredoka text-xl sm:text-2xl font-bold tracking-tight gradient-text mb-2 text-center">Teca — Assistente de Escrita</h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-normal max-w-md text-center mb-6 sm:mb-8 px-2 leading-relaxed">Descreva o que você precisa e a Teca criará um plano de aula de produção de texto completo com objetivos, materiais e atividades.</p>

              {/* Suggestion cards 2x2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                {suggestionCards.map((card, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(card.prompt)}
                    className="glass-card p-4 text-left group hover:shadow-lg transition-all duration-200"
                    style={{ animationDelay: `${i * 0.08}s`, borderTop: `3px solid ${['hsl(var(--brand-purple))', 'hsl(var(--brand-blue))', 'hsl(43, 96%, 52%)', 'hsl(var(--brand-pink))'][i]}` }}
                  >
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                      <card.icon className="w-[18px] h-[18px] text-primary-foreground" />
                    </div>
                    <div className="text-sm font-semibold text-foreground mb-1 font-fredoka">{card.title}</div>
                    <div className="text-[11px] text-muted-foreground leading-relaxed">{card.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[hsl(var(--brand-purple))] to-[hsl(var(--brand-lilac))] flex items-center justify-center mr-3 mt-1 shrink-0 overflow-hidden">
                      <img src={tecaMascot} alt="Teca" className="w-6 h-6 object-contain" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-[hsl(var(--brand-purple))] to-[hsl(var(--brand-lilac))] text-primary-foreground'
                    : 'glass-card'
                    }`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/30">
                        <span className="text-xs font-bold text-primary font-fredoka">Teca</span>
                        <span className="text-[9px] text-muted-foreground">• agora</span>
                      </div>
                    )}
                    {msg.role === 'assistant' ? (
                      <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-td:text-foreground prose-th:text-foreground">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                    )}
                    {msg.role === 'assistant' && (
                      <div className="flex gap-2 mt-4 pt-3 border-t border-border/30">
                        <button className="chip text-[10px] flex items-center gap-1 text-muted-foreground hover:text-primary transition-all duration-200"><Copy size={12} /> Copiar</button>
                        <button className="chip text-[10px] flex items-center gap-1 text-muted-foreground hover:text-primary transition-all duration-200"><FileDown size={12} /> Baixar</button>
                        <button className="chip text-[10px] flex items-center gap-1 text-muted-foreground hover:text-primary transition-all duration-200"><Pencil size={12} /> Editar</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start animate-slide-up">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[hsl(var(--brand-purple))] to-[hsl(var(--brand-lilac))] flex items-center justify-center mr-3 mt-1 shrink-0 overflow-hidden">
                    <img src={tecaMascot} alt="Teca" className="w-6 h-6 object-contain" />
                  </div>
                  <div className="glass-card p-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="px-6 py-4 lg:px-8 border-t border-border/30">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                  placeholder="Descreva o plano de produção de texto que você precisa..."
                  rows={1}
                  className="w-full resize-none px-4 py-3 rounded-xl bg-secondary/50 border border-border/30 text-foreground text-sm placeholder:text-muted-foreground outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary/40"
                />
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${input.trim() ? 'btn-primary-glow text-primary-foreground' : 'bg-secondary/50 text-muted-foreground'}`}
              >
                <Send className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      {showPanel && hasAssistantMessage && (
        <div className="w-[300px] border-l border-border/30 flex flex-col shrink-0 hidden xl:flex animate-slide-up overflow-hidden bg-card">
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-border/30 px-2 pt-2 gap-0.5 scrollbar-none">
            {planTabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-3 py-2 text-[11px] font-bold whitespace-nowrap rounded-t-lg transition-all duration-200 ${activeTab === i
                  ? 'text-primary bg-primary/10 border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Timer, label: 'Tempo', value: '50 min', color: 'hsl(var(--brand-teal))' },
                { icon: BarChart3, label: 'Nível', value: 'Médio', color: 'hsl(var(--brand-yellow))' },
                { icon: CheckCircle2, label: 'BNCC', value: '85%', color: 'hsl(var(--brand-purple))' },
              ].map((m, i) => (
                <div key={i} className="glass-card p-2.5 text-center">
                  <m.icon className="w-4 h-4 mx-auto mb-1" style={{ color: m.color }} />
                  <div className="text-[10px] text-muted-foreground">{m.label}</div>
                  <div className="text-xs font-bold text-foreground">{m.value}</div>
                </div>
              ))}
            </div>

            {/* Expandable sections */}
            {[
              { key: 'overview', title: '📋 Visão Geral', content: 'Plano de aula sobre frações usando atividades lúdicas com pizza de papel, bingo de frações e registro no caderno.' },
              { key: 'objectives', title: '🎯 Objetivos', content: '• Compreender fração como parte de um todo\n• Identificar frações unitárias\n• Resolver situações-problema com frações\n• Relacionar frações ao cotidiano' },
              { key: 'activities', title: '📝 Atividades', content: '1. Aquecimento — Roda de conversa (10 min)\n2. Exploração — Pizzas de papel (20 min)\n3. Jogo — Bingo das Frações (15 min)\n4. Fechamento — Registro e partilha (5 min)' },
              { key: 'resources', title: '📦 Recursos', content: '• Pizzas de papel cartão recortáveis\n• Barras de chocolate simuladas\n• Folhas de atividades impressas\n• Dados coloridos' },
              { key: 'assessment', title: '⭐ Avaliação', content: '• Observação durante as atividades\n• Registro das frações no caderno\n• Participação no Bingo das Frações\n• Autoavaliação com carinhas' },
            ].map((section) => (
              <div key={section.key} className="glass-card overflow-hidden">
                <button
                  onClick={() => toggleSection(section.key)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-secondary/30 transition-all duration-200"
                >
                  <span className="text-xs font-bold text-foreground">{section.title}</span>
                  <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${expandedSections[section.key] ? 'rotate-90' : ''}`} />
                </button>
                {expandedSections[section.key] && (
                  <div className="px-3 pb-3 text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap border-t border-border/20 pt-2">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Export buttons */}
          <div className="border-t border-border/30 p-4 space-y-2">
            <button className="w-full btn-primary-glow text-primary-foreground rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-2">
              <FileDown className="w-3.5 h-3.5" /> Exportar PDF
            </button>
            <div className="flex gap-2">
              <button className="flex-1 glass-card py-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center gap-1.5 rounded-xl">
                <FileText className="w-3.5 h-3.5" /> Word
              </button>
              <button className="flex-1 glass-card py-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center gap-1.5 rounded-xl">
                <Share2 className="w-3.5 h-3.5" /> Compartilhar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPlanPage;
