import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { categories, resources as mockResources } from '@/lib/data';
import { CategoryId, AgeRange, Resource } from '@/lib/types';
import { resourcesService } from '@/services/resources.service';
import ResourceCard from '@/components/catalog/ResourceCard';
import ResourceModal from '@/components/catalog/ResourceModal';
import Chip from '@/components/ui/chip';
import EmptyState from '@/components/ui/EmptyState';

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
        <h1 className="font-fredoka text-h1 font-bold text-ink mb-1">Explorar Recursos 🧭</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">Descubra materiais para enriquecer suas aulas de produção textual.</p>
      </div>

      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-2 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              icon={cat.icon}
              active={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 animate-slide-up" style={{ animationDelay: '0.08s' }}>
          {ages.map((a) => (
            <Chip key={a.id} active={selectedAge === a.id} onClick={() => setSelectedAge(a.id)}>
              {a.label}
            </Chip>
          ))}
        </div>
      </div>

      {isLoading ? (
        <EmptyState tone="loading" title="Carregando recursos…" />
      ) : isError ? (
        <EmptyState
          tone="error"
          mood="neutral"
          title="Não foi possível carregar os recursos"
          description={error instanceof Error ? error.message : 'Tente novamente em instantes.'}
        />
      ) : resources.length === 0 ? (
        <EmptyState
          title="Nada encontrado para esses filtros"
          description="Tente afrouxar a categoria ou a faixa de ano."
        />
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
