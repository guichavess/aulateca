import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { categories, resources as mockResources } from '@/lib/data';
import { CategoryId, AgeRange, Resource } from '@/lib/types';
import { resourcesService } from '@/services/resources.service';
import ResourceCard from '@/components/ResourceCard';
import ResourceModal from '@/components/ResourceModal';

const ExplorePage: React.FC = () => {
  const [selectedAge, setSelectedAge] = useState<AgeRange>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [modalResource, setModalResource] = useState<Resource | null>(null);

  const ages: { id: AgeRange; label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: '6-8', label: '1° ao 3° ano' },
    { id: '9-11', label: '4° e 5° ano' },
    { id: '12-14', label: '6° ao 9° ano' },
  ];

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['resources', selectedCategory, selectedAge],
    queryFn: () =>
      resourcesService.fetchAll({
        category: selectedCategory,
        ageRange: selectedAge,
      }),
  });

  // FALLBACK MOCK — mesmo padrão da HomePage. Se Supabase voltar vazio, usa
  // mockResources de src/lib/data.ts para a demo ficar visualmente cheia.
  const remoteResources = data?.data ?? [];
  const usingMock = !isLoading && !isError && remoteResources.length === 0;
  const resources: Resource[] = usingMock
    ? mockResources.filter(
        (r) =>
          (selectedCategory === 'all' || r.category === selectedCategory) &&
          (selectedAge === 'all' || r.ageRange === selectedAge),
      )
    : remoteResources;

  return (
    <div className="px-5 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="animate-slide-up">
        <h1 className="font-fredoka text-2xl sm:text-3xl font-bold tracking-tight gradient-text mb-1">Explorar Recursos 🧭</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">Descubra materiais para enriquecer suas aulas de produção textual.</p>
      </div>

      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-1.5 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`chip ${selectedCategory === cat.id ? 'chip-active' : 'text-muted-foreground'}`}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 animate-slide-up" style={{ animationDelay: '0.08s' }}>
          {ages.map((a) => (
            <button key={a.id} onClick={() => setSelectedAge(a.id)} className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer select-none border transition-all duration-200 ${
              selectedAge === a.id
                ? 'bg-primary/10 text-primary border-primary/30 font-semibold'
                : 'bg-card text-muted-foreground border-border hover:bg-secondary/60'
            }`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">⏳</p>
          <p className="font-fredoka text-base">Carregando recursos…</p>
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="font-fredoka text-base">Não foi possível carregar os recursos</p>
          <p className="text-xs mt-2">{error instanceof Error ? error.message : 'Tente novamente em instantes.'}</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-fredoka text-base">Nenhum recurso encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {resources.map((r, i) => (
            <ResourceCard key={r.id} resource={r} index={i} onClick={() => setModalResource(r)} />
          ))}
        </div>
      )}

      {modalResource && <ResourceModal resource={modalResource} onClose={() => setModalResource(null)} />}
    </div>
  );
};

export default ExplorePage;
