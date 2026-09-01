import React from 'react';
import { toast } from 'sonner';
import { Resource } from '@/lib/types';
import { categoryColorMap, categories } from '@/lib/data';
import { useApp } from '@/lib/context';
import { resourcesService } from '@/services/resources.service';
import { Heart, X, Download } from 'lucide-react';
import ResourceTypeBadge from './ResourceTypeBadge';
import { Button } from '@/components/ui/button';

interface ResourceModalProps {
  resource: Resource;
  onClose: () => void;
}

const ResourceModal: React.FC<ResourceModalProps> = ({ resource, onClose }) => {
  const { toggleFavorite, isFavorite } = useApp();
  const color = categoryColorMap[resource.category] || '#6C5CE7';
  const fav = isFavorite(resource.id);
  const cat = categories.find(c => c.id === resource.category);

  const [baixando, setBaixando] = React.useState(false);
  const tituloId = `recurso-${resource.id}-titulo`;

  React.useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [onClose]);

  const handleDownload = async () => {
    const fileUrl = resource.fileUrl;
    if (!fileUrl) {
      toast.info('Arquivo em processamento', { description: 'Este recurso ainda não tem download disponível.' });
      return;
    }
    if (baixando) return;

    // A aba precisa ser aberta AGORA, dentro do clique: o link do bucket
    // privado só existe depois de um await, e a essa altura o navegador já
    // trata window.open como popup e bloqueia.
    const aba = window.open('', '_blank', 'noopener,noreferrer');
    setBaixando(true);

    try {
      const url = await resourcesService.resolveDownloadUrl(fileUrl);
      if (aba) aba.location.href = url;
      else window.location.assign(url); // popup bloqueado: não deixa o clique morrer
    } catch {
      aba?.close();
      toast.error('Não foi possível abrir o arquivo', {
        description: 'Se o seu acesso está ativo, tente de novo em instantes.',
      });
      return;
    } finally {
      setBaixando(false);
    }

    try {
      await resourcesService.registerDownload(resource.id);
    } catch {
      // contador é nice-to-have — não bloqueia o download
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/60" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="sticker-card w-full max-w-[560px] relative z-10 animate-pop-in overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 36px de alvo e traço de 2px: o botão anterior tinha 32px de vidro
            fosco sobre a faixa colorida, e sumia quando a cor era clara. */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-card border-2 border-border flex items-center justify-center text-muted-foreground transition-transform duration-press ease-press hover:scale-110 active:scale-95"
        >
          <X size={16} aria-hidden="true" />
        </button>

        {/* Faixa da categoria: cor chapada, sem degradê — mesma linguagem do
            card que abriu este modal. */}
        <div
          className="h-36 flex items-center justify-center relative border-b-2 border-border"
          style={{ background: `${color}1F` }}
        >
          <span className="text-5xl" aria-hidden="true">{cat?.icon}</span>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <ResourceTypeBadge style={{ background: `${color}18`, color }} />
            <span className="text-[11px] text-muted-foreground">{resource.duration}</span>
            <span className="text-[11px] text-muted-foreground">• {resource.ageRange} anos</span>
          </div>

          <h2 id={tituloId} className="font-fredoka text-h2 font-bold text-ink leading-snug">{resource.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{resource.description}</p>

          {/* Author card */}
          <div className="sticker-surface p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: `${color}18`, color }}>
              {resource.author.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground truncate">{resource.author}</div>
              {/* Mesma regra do card: nota e contador só aparecem quando têm o
                  que dizer. Se os dois forem zero, a linha inteira some — em vez
                  de anunciar "⭐ 0 • 0 downloads" logo abaixo do autor. */}
              {(resource.rating > 0 || resource.downloads > 0) && (
                <div className="text-[11px] text-muted-foreground">
                  {resource.rating > 0 && (
                    <span className="font-bold text-ink">⭐ {resource.rating}</span>
                  )}
                  {resource.rating > 0 && resource.downloads > 0 && ' • '}
                  {resource.downloads > 0 && `${resource.downloads.toLocaleString()} downloads`}
                </div>
              )}
            </div>
          </div>

          {/* BNCC */}
          <div className="rounded-button border-2 border-primary/20 bg-accent p-3.5">
            <div className="text-xs font-bold text-primary mb-0.5">📋 Alinhamento BNCC</div>
            <div className="text-[12px] text-muted-foreground leading-relaxed">Este recurso está alinhado com as competências e habilidades da Base Nacional Comum Curricular.</div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            {/* A ação principal era um botão com glow difuso na cor da
                categoria — bonito, mas era o único botão do app que não
                afundava, e o brilho colorido brigava com a faixa acima. */}
            <Button onClick={handleDownload} disabled={baixando} size="lg" className="flex-1">
              <Download className="w-4 h-4" aria-hidden="true" />
              {baixando ? 'Abrindo…' : 'Baixar recurso'}
            </Button>
            <Button
              variant="sticker-outline"
              size="icon"
              onClick={() => toggleFavorite(resource.id)}
              aria-label={fav ? `Remover ${resource.title} dos favoritos` : `Salvar ${resource.title} nos favoritos`}
              aria-pressed={fav}
            >
              <Heart size={16} className={fav ? 'text-danger animate-heart-pulse' : 'text-muted-foreground'} style={fav ? { fill: 'currentColor' } : {}} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceModal;
