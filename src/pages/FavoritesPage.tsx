import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Resource } from '@/lib/types';
import { useApp } from '@/lib/context';
import { resourcesService } from '@/services/resources.service';
import { resources as mockResources } from '@/lib/data';
import ResourceCard from '@/components/ResourceCard';
import ResourceModal from '@/components/ResourceModal';

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
  const remoteIds = new Set(remoteFavs.map((r) => r.id));
  const mockFavs = mockResources.filter((r) => ids.includes(r.id) && !remoteIds.has(r.id));
  const favResources: Resource[] = [...remoteFavs, ...mockFavs];

  return (
    <div className="px-5 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="animate-slide-up">
        <h1 className="font-fredoka text-2xl sm:text-3xl font-bold tracking-tight gradient-text mb-1">Seus Favoritos ❤️</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {favResources.length} recurso{favResources.length !== 1 ? 's' : ''} salvo{favResources.length !== 1 ? 's' : ''}
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">⏳</p>
          <p className="font-fredoka text-base">Carregando favoritos…</p>
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="font-fredoka text-base">Não foi possível carregar os favoritos</p>
        </div>
      ) : favResources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favResources.map((r, i) => (
            <ResourceCard key={r.id} resource={r} index={i} onClick={() => setModalResource(r)} />
          ))}
        </div>
      ) : (
        <div className="glass-card text-center py-16 px-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <p className="text-4xl mb-3">❤️</p>
          <p className="font-fredoka text-base font-semibold text-foreground mb-1">Nenhum favorito ainda</p>
          <p className="text-sm text-muted-foreground">Clique no coração dos recursos para salvá-los aqui.</p>
        </div>
      )}

      {modalResource && <ResourceModal resource={modalResource} onClose={() => setModalResource(null)} />}
    </div>
  );
};

export default FavoritesPage;
