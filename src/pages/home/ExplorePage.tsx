import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { categories, resources as mockResources } from '@/lib/data';
import { CategoryId, AgeRange, Resource } from '@/lib/types';
import { resourcesService } from '@/services/resources.service';
import ResourceCard from '@/components/catalog/ResourceCard';
import ResourceModal from '@/components/catalog/ResourceModal';
import Chip from '@/components/ui/chip';
import EmptyState from '@/components/ui/EmptyState';
import DemoAcervoAviso from '@/components/catalog/DemoAcervoAviso';
import { demoFallbackAtivo } from '@/lib/demoFallback';
import { useBancoVazio } from '@/hooks/useBancoVazio';
import { useDebounced } from '@/hooks/useDebounced';

const ExplorePage: React.FC = () => {
  const [selectedAge, setSelectedAge] = useState<AgeRange>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [modalResource, setModalResource] = useState<Resource | null>(null);
  const [busca, setBusca] = useState('');
  const buscaAtrasada = useDebounced(busca.trim(), 300);

  const ages: { id: AgeRange; label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: '6-8', label: '1° ao 3° ano' },
    { id: '9-11', label: '4° e 5° ano' },
    { id: '12-14', label: '6° ao 9° ano' },
  ];

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['resources', selectedCategory, selectedAge, buscaAtrasada],
    queryFn: () =>
      resourcesService.fetchAll({
        category: selectedCategory,
        ageRange: selectedAge,
        search: buscaAtrasada || undefined,
        // O padrão de `fetchAll` é 12, e esta tela não pagina: sem isto, dos 54
        // materiais do acervo o professor via 12 e não tinha como chegar no
        // resto. 60 cobre o acervo de hoje com folga. Quando ele crescer, o que
        // esta tela vai precisar é de paginação de verdade, não de um número
        // maior — está registrado em docs/pendencias-gestao.md.
        limit: 60,
      }),
    // Sem isto, cada tecla da busca esvazia a grade para o estado de
    // carregamento e a tela pisca a cada palavra digitada.
    placeholderData: keepPreviousData,
  });

  // ACERVO DE DEMONSTRAÇÃO — duas condições, ambas obrigatórias.
  //
  // Antes bastava a lista filtrada voltar vazia, o que dava dois problemas ao
  // mesmo tempo: um filtro sem resultado fazia aparecer material que não existe,
  // e o Supabase fora do ar virava uma grade cheia com download morto. Agora o
  // mock exige a flag explícita E a sonda dizendo que o banco está mesmo vazio.
  const { bancoVazio } = useBancoVazio();
  const remoteResources = data?.data ?? [];
  const usandoDemo = demoFallbackAtivo && bancoVazio && !isError;
  const termo = buscaAtrasada.toLowerCase();
  const resources: Resource[] = usandoDemo
    ? mockResources.filter(
        (r) =>
          (selectedCategory === 'all' || r.category === selectedCategory) &&
          (selectedAge === 'all' || r.ageRange === selectedAge) &&
          (!termo ||
            r.title.toLowerCase().includes(termo) ||
            r.description.toLowerCase().includes(termo)),
      )
    : remoteResources;

  return (
    <div className="px-5 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="animate-slide-up">
        <h1 className="font-fredoka text-h1 font-bold text-ink mb-1">Explorar Recursos 🧭</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">Descubra materiais para enriquecer suas aulas de produção textual.</p>
      </div>

      {/* Busca por texto.
          Os filtros de categoria e faixa cobrem navegação; não cobrem a pergunta
          real do professor, que é "tenho aula de carta amanhã". O serviço já
          sabia buscar (fetchAll aceita `search`, com escape de ILIKE) — faltava
          só o campo. */}
      <div className="animate-slide-up relative" style={{ animationDelay: '0.03s' }}>
        <Search
          size={18}
          aria-hidden="true"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar por título ou descrição"
          placeholder="Buscar por assunto, título…"
          className="field-sticker w-full h-12 pl-11 pr-11 text-foreground placeholder:text-muted-foreground"
        />
        {busca && (
          <button
            type="button"
            onClick={() => setBusca('')}
            aria-label="Limpar busca"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
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

      {usandoDemo && <DemoAcervoAviso />}

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
          title={
            buscaAtrasada ? `Nada encontrado para "${buscaAtrasada}"` : 'Nada encontrado para esses filtros'
          }
          description={
            buscaAtrasada
              ? 'Tente outra palavra, ou limpe a busca para ver o acervo inteiro.'
              : 'Tente afrouxar a categoria ou a faixa de ano.'
          }
          action={
            buscaAtrasada ? (
              <button
                type="button"
                onClick={() => setBusca('')}
                className="py-2.5 px-5 rounded-xl font-semibold border-2 border-border text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                Limpar busca
              </button>
            ) : undefined
          }
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
