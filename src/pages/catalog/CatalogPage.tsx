import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Eye, Search, Gamepad2, PenTool, ClipboardCheck, School, ChevronRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { catalogTabs, type CatalogTab, type Subcategory } from '@/lib/catalogData';

const tabIcons: Record<string, React.ReactNode> = {
  ludicas: <Gamepad2 className="w-4 h-4" />,
  portugues: <PenTool className="w-4 h-4" />,
  avaliacao: <ClipboardCheck className="w-4 h-4" />,
  rotina: <School className="w-4 h-4" />,
};

const SubcategorySection: React.FC<{ sub: Subcategory; index: number }> = ({ sub, index }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className="animate-slide-up"
      style={{ animationDelay: `${0.06 + index * 0.08}s` }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 group mb-4 cursor-pointer"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 transition-transform duration-300 group-hover:scale-105"
          style={{ background: `${sub.color}14` }}
        >
          {sub.icon}
        </div>
        <div className="flex flex-col items-start min-w-0">
          <h2 className="font-fredoka text-base sm:text-lg font-semibold text-foreground tracking-tight leading-snug">
            {sub.title}
          </h2>
        </div>
        <span
          className="type-badge ml-2 shrink-0"
          style={{ background: `${sub.color}12`, color: sub.color }}
        >
          {sub.items.length} {sub.items.length === 1 ? 'item' : 'itens'}
        </span>
        <ChevronRight
          className={`w-4 h-4 ml-auto text-muted-foreground transition-transform duration-300 ${
            expanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-8">
          {sub.items.map((item, i) => (
            <div
              key={item.id}
              className="activity-card animate-slide-up group relative overflow-hidden"
              style={{
                animationDelay: `${Math.min(i * 0.025, 0.5)}s`,
                borderLeft: `3px solid ${sub.color}`,
              }}
            >
              {item.image && (
                <div className="w-full h-36 rounded-xl overflow-hidden mb-3 relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        'linear-gradient(to top, hsla(228, 16%, 8%, 0.35), transparent 60%)',
                    }}
                  />
                </div>
              )}

              {!item.image && (
                <div
                  className="w-full h-24 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${sub.color}08, ${sub.color}04)`,
                    border: `1px dashed ${sub.color}25`,
                  }}
                >
                  <Package
                    className="w-8 h-8 transition-transform duration-300 group-hover:scale-110"
                    style={{ color: `${sub.color}60` }}
                  />
                </div>
              )}

              <h3 className="font-fredoka text-sm font-semibold text-foreground leading-snug mb-3 tracking-tight line-clamp-2 min-h-[2.5rem]">
                {item.title}
              </h3>

              <div
                className="flex items-center justify-end pt-3 mt-auto"
                style={{ borderTop: '1px solid hsl(var(--border) / 0.5)' }}
              >
                <Button
                  size="sm"
                  onClick={() => toast.info('Página de detalhes em breve', { description: item.title })}
                  className="rounded-xl text-[11px] font-semibold gap-1 btn-primary-glow h-8 px-3"
                >
                  <Eye className="w-3 h-3" />
                  Ver detalhes
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TabContent: React.FC<{ tab: CatalogTab; searchQuery: string }> = ({ tab, searchQuery }) => {
  const query = searchQuery.toLowerCase().trim();

  const filtered = tab.subcategories
    .map((sub) => ({
      ...sub,
      items: query
        ? sub.items.filter((item) => item.title.toLowerCase().includes(query))
        : sub.items,
    }))
    .filter((sub) => sub.items.length > 0);

  const totalItems = filtered.reduce((sum, sub) => sum + sub.items.length, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 mb-6 animate-slide-up" style={{ animationDelay: '0.04s' }}>
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
          style={{ background: `${tab.accentColor}12` }}
        >
          {tab.icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">{tab.description}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">
            {totalItems} {totalItems === 1 ? 'recurso encontrado' : 'recursos encontrados'}
          </p>
        </div>
      </div>

      {filtered.map((sub, i) => (
        <SubcategorySection key={sub.id} sub={sub} index={i} />
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground animate-slide-up">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-fredoka text-base">Nenhum recurso encontrado</p>
          <p className="text-sm mt-1">Tente buscar com outros termos.</p>
        </div>
      )}
    </div>
  );
};

const CatalogPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="px-5 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div className="animate-slide-up">
        <h1 className="font-fredoka text-2xl sm:text-3xl font-bold tracking-tight gradient-text mb-1">
          Catálogo de Atividades 📚
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Explore nosso acervo completo de atividades organizadas por categoria e subcategoria.
        </p>
      </div>

      <div className="animate-slide-up relative" style={{ animationDelay: '0.04s' }}>
        <div className="relative max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar atividades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl text-sm bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200"
          />
        </div>
      </div>

      <Tabs defaultValue={catalogTabs[0].id} className="animate-slide-up">
        <TabsList className="w-full flex flex-wrap h-auto gap-1.5 bg-secondary/50 p-1.5 rounded-xl">
          {catalogTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="rounded-xl text-xs sm:text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 px-3 sm:px-4 py-2 flex items-center gap-2"
            >
              {tabIcons[tab.id]}
              <span className="hidden xs:inline">{tab.icon}</span>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {catalogTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            <TabContent tab={tab} searchQuery={searchQuery} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CatalogPage;
