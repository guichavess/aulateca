import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Resource } from '@/lib/types';
import { useApp } from '@/lib/context';
import { resourcesService } from '@/services/resources.service';
import { resources as mockResources } from '@/lib/data';
import ResourceCard from '@/components/catalog/ResourceCard';
import ResourceModal from '@/components/catalog/ResourceModal';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';

const FavoritesPage: React.FC = () => {
  const { favorites } = useApp();
  const [modalResource, setModalResource] = useState<Resource | null>(null);
  const ids = Array.from(favorites);

  const { data: remoteFavs = [], isLoading, isError } = useQuery({
    queryKey: ['favorites-resources', ids.sort().join(',')],
    queryFn: () => resourcesService.fetchByIds(ids),
    enabled: ids.length > 0,
  });

  // FALLBACK MOCK — se algum ID favoritado não veio do Supabase (ex: usuário
  // favoritou um recurso mockado da HomePage durante a demo), procura em
  // mockResources para a tela não perder esse item.
  // Uma falha no Supabase não pode esconder favoritos que temos localmente.
  const remoteIds = new Set(remoteFavs.map((r) => r.id));
  const mockFavs = mockResources.filter((r) => ids.includes(r.id) && !remoteIds.has(r.id));
  const favResources: Resource[] = [...remoteFavs, ...mockFavs];

  return (
    <div className="px-5 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="animate-slide-up">
        <h1 className="font-fredoka text-h1 font-bold text-ink mb-1">Seus Favoritos ❤️</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {favResources.length} recurso{favResources.length !== 1 ? 's' : ''} salvo{favResources.length !== 1 ? 's' : ''}
        </p>
      </div>

      {isLoading ? (
        <EmptyState tone="loading" title="Carregando favoritos…" />
      ) : isError && favResources.length === 0 ? (
        <EmptyState
          tone="error"
          mood="neutral"
          title="Não foi possível carregar os favoritos"
          description="Tente novamente em instantes."
        />
      ) : favResources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favResources.map((r, i) => (
            <ResourceCard key={r.id} resource={r} index={i} onClick={() => setModalResource(r)} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="sticker-card animate-slide-up"
          title="Nenhum favorito ainda"
          description="Toque no coração de um recurso para guardá-lo aqui."
          action={
            <Button variant="sticker-outline" asChild>
              <Link to="/explore">Explorar recursos</Link>
            </Button>
          }
        />
      )}

      {modalResource && <ResourceModal resource={modalResource} onClose={() => setModalResource(null)} />}
    </div>
  );
};

export default FavoritesPage;
