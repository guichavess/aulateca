import React from 'react';
import { Resource } from '@/lib/types';
import { categoryColorMap } from '@/lib/data';
import { useApp } from '@/lib/context';
import { Heart } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  index: number;
  onClick: () => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, index, onClick }) => {
  const { toggleFavorite, isFavorite } = useApp();
  const color = categoryColorMap[resource.category] || '#6C5CE7';
  const fav = isFavorite(resource.id);

  const categoryIcon: Record<string, string> = {
    math: '🔢', language: '📝', science: '🔬', arts: '🎨', history: '🏛️', games: '🎲',
  };

  return (
    <div
      className="glass-card-hover cursor-pointer overflow-hidden group animate-slide-up"
      style={{ animationDelay: `${index * 0.04}s` }}
      onClick={onClick}
    >
      {/* Color top */}
      <div
        className="h-[140px] relative flex items-center justify-center overflow-hidden"
        style={{ background: resource.imageUrl ? 'transparent' : `linear-gradient(150deg, ${color}22, ${color}0A)` }}
      >
        {resource.imageUrl ? (
          <img src={resource.imageUrl} alt={resource.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out" />
        ) : (
          <span className="text-[36px] group-hover:scale-110 transition-transform duration-300 ease-out">{categoryIcon[resource.category]}</span>
        )}
        {resource.isNew && (
          <span className="absolute top-2.5 left-2.5 type-badge shadow-sm bg-emerald-500 text-white">
            Novo
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(resource.id); }}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm ${fav ? 'animate-heart-pulse' : ''}`}
          style={{ background: 'hsla(0, 0%, 100%, 0.85)', backdropFilter: 'blur(8px)' }}
        >
          <Heart
            size={13}
            className={fav ? 'text-rose-500' : 'text-muted-foreground'}
            style={fav ? { fill: 'currentColor' } : {}}
          />
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="type-badge" style={{ background: `${color}18`, color }}>
            {resource.type === 'video' ? '▶ VÍDEO' : '📄 PDF'}
          </span>
          <span className="text-[11px] text-muted-foreground tabular-nums">{resource.duration}</span>
        </div>
        <h3 className="font-fredoka text-sm font-semibold text-foreground mb-1 line-clamp-1 leading-snug tracking-tight">{resource.title}</h3>
        <p className="text-[13px] text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{resource.description}</p>
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid hsla(228, 12%, 91%, 0.5)' }}>
          <span className="text-[11px] text-muted-foreground truncate mr-2">{resource.author}</span>
          <span className="text-[11px] font-semibold text-amber-500 shrink-0">⭐ {resource.rating}</span>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
