import React, { useMemo, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { categories, resources as mockResources } from '@/lib/data';
import { CategoryId, AgeRange, Resource } from '@/lib/types';
import { useApp } from '@/lib/context';
import { resourcesService } from '@/services/resources.service';
import ResourceCard from '@/components/catalog/ResourceCard';
import ResourceModal from '@/components/catalog/ResourceModal';
import FilterChipGroup, { FilterOption } from '@/components/catalog/FilterChipGroup';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/EmptyState';

const AGES: FilterOption<AgeRange>[] = [
  { id: 'all', label: 'Todas' },
  { id: '6-8', label: '1° ao 3° ano' },
  { id: '9-11', label: '4° e 5° ano' },
  { id: '12-14', label: '6° ao 9° ano' },
];

const HomePage: React.FC = () => {
  const { userName } = useApp();
  const [selectedAge, setSelectedAge] = useState<AgeRange>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [modalResource, setModalResource] = useState<Resource | null>(null);

  const hasFilters = selectedCategory !== 'all' || selectedAge !== 'all';
  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedAge('all');
  };

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['resources', selectedCategory, selectedAge],
    queryFn: () =>
      resourcesService.fetchAll({
        category: selectedCategory,
        ageRange: selectedAge,
      }),
    // Sem isto, trocar de filtro descarta o cache e a grade inteira pisca no
    // estado de carregamento. Mantemos a lista anterior na tela enquanto a
    // nova chega — só o `isFetching` sinaliza a atualização.
    placeholderData: keepPreviousData,
  });

  // Sonda sem filtro nenhum: serve só para saber se o banco está vazio.
  // Antes o fallback de mock era decidido pelo resultado *filtrado*, então
  // qualquer combinação sem resultado no banco real fazia os recursos
  // fictícios reaparecerem — o usuário filtrava e via dados que não existem.
  const { data: probe, isLoading: probeLoading } = useQuery({
    queryKey: ['resources', 'probe'],
    queryFn: () => resourcesService.fetchAll({ limit: 1 }),
    staleTime: 5 * 60 * 1000,
  });

  const databaseIsEmpty = !probeLoading && probe?.total === 0;

  const resources: Resource[] = useMemo(() => {
    if (databaseIsEmpty) {
      return mockResources.filter(
        (r) =>
          (selectedCategory === 'all' || r.category === selectedCategory) &&
          (selectedAge === 'all' || r.ageRange === selectedAge),
      );
    }
    return data?.data ?? [];
  }, [databaseIsEmpty, data, selectedCategory, selectedAge]);

  // Contagem por categoria/faixa, para o chip mostrar quantos recursos existem
  // e desabilitar o que levaria a uma tela vazia. Na demo (banco vazio) sai do
  // mock; com dados reais, do total que o Supabase devolve.
  const pool = databaseIsEmpty ? mockResources : null;
  const categoryOptions: FilterOption<CategoryId>[] = categories.map((cat) => ({
    id: cat.id,
    label: cat.label,
    icon: cat.icon,
    count: pool
      ? pool.filter(
          (r) =>
            (cat.id === 'all' || r.category === cat.id) &&
            (selectedAge === 'all' || r.ageRange === selectedAge),
        ).length
      : undefined,
  }));
  const ageOptions: FilterOption<AgeRange>[] = AGES.map((a) => ({
    ...a,
    count: pool
      ? pool.filter(
          (r) =>
            (a.id === 'all' || r.ageRange === a.id) &&
            (selectedCategory === 'all' || r.category === selectedCategory),
        ).length
      : undefined,
  }));

  const total = databaseIsEmpty ? resources.length : data?.total ?? resources.length;
  const showSkeleton = isLoading && !data;

  return (
    <div className="px-5 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Greeting */}
      <div className="animate-slide-up">
        <h1 className="font-fredoka text-h1 font-bold text-ink mb-1">
          Olá, {userName || 'Professor(a)'}! 👋
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Explore os recursos selecionados abaixo.
        </p>
      </div>

      {/* Filtros */}
      <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.08s' }}>
        <FilterChipGroup
          label="Categoria"
          options={categoryOptions}
          value={selectedCategory}
          onChange={(id) => setSelectedCategory(id)}
        />
        <FilterChipGroup
          label="Ano escolar"
          options={ageOptions}
          value={selectedAge}
          onChange={(id) => setSelectedAge(id)}
        />

        {/* Resumo do que está filtrado. Antes não havia nenhum retorno: dava
            para clicar num chip e não perceber que a lista tinha mudado. */}
        <div className="flex items-center gap-3 min-h-9" aria-live="polite">
          {!showSkeleton && !isError && (
            <p className="text-sm text-muted-foreground">
              {total === 0
                ? 'Nenhum recurso'
                : `${total} ${total === 1 ? 'recurso' : 'recursos'}`}
              {hasFilters ? ' com esses filtros' : ' disponíveis'}
              {isFetching && <span className="ml-2 opacity-70">atualizando…</span>}
            </p>
          )}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1.5">
              <X size={14} aria-hidden="true" />
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Resource Grid */}
      {showSkeleton ? (
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
          action={
            hasFilters ? (
              <Button variant="sticker-outline" onClick={clearFilters}>
                Limpar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 transition-opacity duration-150 ${
            isFetching ? 'opacity-60' : 'opacity-100'
          }`}
        >
          {resources.map((r, i) => (
            <ResourceCard key={r.id} resource={r} index={i} onClick={() => setModalResource(r)} />
          ))}
        </div>
      )}

      {modalResource && (
        <ResourceModal resource={modalResource} onClose={() => setModalResource(null)} />
      )}
    </div>
  );
};

export default HomePage;
