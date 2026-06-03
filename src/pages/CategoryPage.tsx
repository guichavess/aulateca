import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categories, resources as mockResources } from '@/lib/data';
import { AgeRange, Resource, CategoryId } from '@/lib/types';
import { resourcesService } from '@/services/resources.service';
import ResourceCard from '@/components/ResourceCard';
import ResourceModal from '@/components/ResourceModal';

const ages: { id: AgeRange; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: '6-8', label: '1° ao 3° ano' },
  { id: '9-11', label: '4° e 5° ano' },
  { id: '12-14', label: '6° ao 9° ano' },
];

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = categories.find((c) => c.id === slug && c.id !== 'all');
  const [selectedAge, setSelectedAge] = useState<AgeRange>('all');
  const [modalResource, setModalResource] = useState<Resource | null>(null);

  const categoryId = (category?.id ?? 'all') as CategoryId;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['resources', categoryId, selectedAge],
    queryFn: () =>
      resourcesService.fetchAll({
        category: categoryId,
        ageRange: selectedAge,
      }),
    enabled: !!category,
  });

  if (!category) {
    return <Navigate to="/" replace />;
  }

  const remoteResources = data?.data ?? [];
  const usingMock = !isLoading && !isError && remoteResources.length === 0;
  const resources: Resource[] = usingMock
    ? mockResources.filter(
        (r) =>
          r.category === categoryId &&
          (selectedAge === 'all' || r.ageRange === selectedAge),
      )
    : remoteResources;

  return (
    <div className="px-5 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="animate-slide-up flex items-center gap-3">
        <span className="text-3xl">{category.icon}</span>
        <div>
          <h1 className="font-fredoka text-2xl sm:text-3xl font-bold tracking-tight gradient-text mb-1">{category.label}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">Recursos selecionados para {category.label.toLowerCase()}.</p>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-1.5 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          {ages.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAge(a.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer select-none border transition-all duration-200 ${
                selectedAge === a.id
                  ? 'bg-primary/10 text-primary border-primary/30 font-semibold'
                  : 'bg-card text-muted-foreground border-border hover:bg-secondary/60'
              }`}
            >
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
          <p className="font-fredoka text-base">Nenhum recurso encontrado nesta categoria</p>
          <p className="text-xs mt-2">Em breve teremos novos materiais por aqui.</p>
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

export default CategoryPage;
