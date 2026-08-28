import React from 'react';
import { Resource } from '@/lib/types';
import { categoryColorMap } from '@/lib/data';
import { useApp } from '@/lib/context';
import { Heart } from 'lucide-react';
import ResourceTypeBadge from './ResourceTypeBadge';

interface ResourceCardProps {
  resource: Resource;
  index: number;
  onClick: () => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, index, onClick }) => {
  const { toggleFavorite, isFavorite } = useApp();
  const color = categoryColorMap[resource.category] || categoryColorMap.all;
  const fav = isFavorite(resource.id);

  const categoryIcon: Record<string, string> = {
    math: '🔢', language: '📝', science: '🔬', arts: '🎨', history: '🏛️', games: '🎲',
  };

  return (
    <div
      className="sticker-card sticker-card-interactive cursor-pointer overflow-hidden group animate-slide-up"
      style={{ animationDelay: `${index * 0.04}s` }}
      onClick={onClick}
    >
      {/* Faixa da categoria: fundo chapado na cor, sem gradiente. */}
      <div
        className="h-[150px] relative flex items-center justify-center overflow-hidden"
        style={{ background: resource.imageUrl ? 'transparent' : `${color}1F` }}
      >
        {resource.imageUrl ? (
          <img src={resource.imageUrl} alt={resource.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out" />
        ) : (
          <span className="text-[44px] group-hover:scale-110 transition-transform duration-300 ease-out">{categoryIcon[resource.category]}</span>
        )}
        {resource.isNew && (
          <span className="absolute top-3 left-3 type-badge bg-success text-white">
            Novo
          </span>
        )}
        {/* 36px de alvo: o botão anterior tinha 28px, pequeno demais no toque. */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(resource.id); }}
          aria-label={fav ? `Remover ${resource.title} dos favoritos` : `Salvar ${resource.title} nos favoritos`}
          aria-pressed={fav}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-card border-2 border-border flex items-center justify-center transition-transform duration-150 hover:scale-110 active:scale-95 ${fav ? 'animate-heart-pulse' : ''}`}
        >
          <Heart
            size={16}
            className={fav ? 'text-danger' : 'text-muted-foreground'}
            style={fav ? { fill: 'currentColor' } : {}}
          />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 border-t-2 border-border">
        <div className="flex items-center justify-between mb-2.5">
          <ResourceTypeBadge style={{ background: `${color}1F`, color }} />
          <span className="text-xs font-semibold text-muted-foreground tabular-nums">{resource.duration}</span>
        </div>
        <h3 className="font-fredoka text-base font-bold text-ink mb-1 line-clamp-1 leading-snug">{resource.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{resource.description}</p>
        <div className="flex items-center justify-between pt-3 border-t-2 border-border">
          <span className="text-xs text-muted-foreground truncate mr-2">{resource.author}</span>
          <span className="text-xs font-bold text-ink shrink-0">⭐ {resource.rating}</span>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
