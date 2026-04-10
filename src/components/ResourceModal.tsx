import React from 'react';
import { Resource } from '@/lib/types';
import { categoryColorMap, categories } from '@/lib/data';
import { useApp } from '@/lib/context';
import { Heart, X, Download, Sparkles } from 'lucide-react';

interface ResourceModalProps {
  resource: Resource;
  onClose: () => void;
}

const ResourceModal: React.FC<ResourceModalProps> = ({ resource, onClose }) => {
  const { toggleFavorite, isFavorite } = useApp();
  const color = categoryColorMap[resource.category] || '#6C5CE7';
  const fav = isFavorite(resource.id);
  const cat = categories.find(c => c.id === resource.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />
      <div className="glass-card w-full max-w-[560px] relative z-10 animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()} style={{ background: 'hsl(var(--card))' }}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ background: 'hsla(0, 0%, 0%, 0.2)', backdropFilter: 'blur(8px)', color: 'hsla(0, 0%, 100%, 0.8)' }}
        >
          <X size={15} />
        </button>

        {/* Header */}
        <div className="h-36 flex items-center justify-center relative" style={{ background: `linear-gradient(150deg, ${color}30, ${color}0A)` }}>
          <span className="text-5xl">{cat?.icon}</span>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="type-badge" style={{ background: `${color}18`, color }}>
              {resource.type === 'video' ? '▶ VÍDEO' : '📄 PDF'}
            </span>
            <span className="text-[11px] text-muted-foreground">{resource.duration}</span>
            <span className="text-[11px] text-muted-foreground">• {resource.ageRange} anos</span>
          </div>

          <h2 className="font-fredoka text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-snug">{resource.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{resource.description}</p>

          {/* Author card */}
          <div className="glass-card p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: `${color}18`, color }}>
              {resource.author.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground truncate">{resource.author}</div>
              <div className="text-[11px] text-muted-foreground">⭐ {resource.rating} • {resource.downloads.toLocaleString()} downloads</div>
            </div>
          </div>

          {/* BNCC */}
          <div className="rounded-xl p-3.5" style={{ background: 'hsla(249, 76%, 64%, 0.06)', border: '1px solid hsla(249, 76%, 64%, 0.12)' }}>
            <div className="text-xs font-bold text-primary mb-0.5">📋 Alinhamento BNCC</div>
            <div className="text-[12px] text-muted-foreground leading-relaxed">Este recurso está alinhado com as competências e habilidades da Base Nacional Comum Curricular.</div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ background: color, color: '#fff', boxShadow: `0 4px 14px ${color}40` }}
            >
              <Download className="w-4 h-4" /> Baixar Recurso
            </button>
            <button
              onClick={() => toggleFavorite(resource.id)}
              className="w-11 h-11 rounded-xl flex items-center justify-center border border-border/50 hover:bg-secondary/60 hover:border-border transition-all duration-200 active:scale-95"
            >
              <Heart size={16} className={fav ? 'text-rose-500 animate-heart-pulse' : 'text-muted-foreground'} style={fav ? { fill: 'currentColor' } : {}} />
            </button>
            <button className="w-11 h-11 rounded-xl flex items-center justify-center border border-border/50 hover:bg-secondary/60 hover:border-border transition-all duration-200 active:scale-95 text-primary">
              <Sparkles size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceModal;
