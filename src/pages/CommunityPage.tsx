import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Heart, MessageCircle, Share2, Image, Paperclip, BarChart3 } from 'lucide-react';
import { communityService } from '@/services/community.service';
import { communityPosts as mockCommunityPosts } from '@/lib/data';
import type { CommunityPost } from '@/lib/types';

type SortMode = 'recent' | 'popular';

const CommunityPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SortMode>('recent');
  const [newPost, setNewPost] = useState('');
  // Para posts mockados, mantemos overrides locais de like (não persistem).
  const [mockLikeOverride, setMockLikeOverride] = useState<Record<string, { liked: boolean; delta: number }>>({});

  const queryKey = ['community-posts', activeTab];

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => communityService.fetchPosts(activeTab, 1),
  });

  // FALLBACK MOCK — quando o Supabase não tem posts (banco zerado da demo),
  // mostramos communityPosts de src/lib/data.ts. Like/Publicar continuam reais
  // (com persistência no Supabase) — só o feed inicial vem do mock.
  const remotePosts = data?.data ?? [];
  const usingMock = !isLoading && !isError && remotePosts.length === 0;
  const applyMockOverride = (p: CommunityPost): CommunityPost => {
    const o = mockLikeOverride[p.id];
    if (!o) return { ...p, liked: false };
    return { ...p, liked: o.liked, likes: p.likes + o.delta };
  };
  const mockSorted: CommunityPost[] = usingMock
    ? activeTab === 'popular'
      ? [...mockCommunityPosts].map(applyMockOverride).sort((a, b) => b.likes - a.likes)
      : mockCommunityPosts.map(applyMockOverride)
    : [];
  const posts: CommunityPost[] = usingMock ? mockSorted : remotePosts;

  const createMutation = useMutation({
    mutationFn: (content: string) => communityService.createPost(content),
    onSuccess: () => {
      setNewPost('');
      toast.success('Post publicado!');
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Não foi possível publicar.');
    },
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => communityService.toggleLike(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<{ data: CommunityPost[]; total: number }>(queryKey);
      if (previous) {
        queryClient.setQueryData(queryKey, {
          ...previous,
          data: previous.data.map((p) =>
            p.id === postId
              ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
              : p,
          ),
        });
      }
      return { previous };
    },
    onError: (_err, _postId, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
      toast.error('Não foi possível curtir agora.');
    },
  });

  // Posts mockados têm IDs curtos (1..5). Para esses, like fica só no estado
  // local; persistência real só rola quando o post veio do Supabase (UUID).
  const isPersistableId = (id: string) => id.length >= 32 && id.includes('-');

  const handleLike = (post: CommunityPost) => {
    if (isPersistableId(post.id)) {
      likeMutation.mutate(post.id);
      return;
    }
    setMockLikeOverride((prev) => {
      const next = { ...prev };
      const wasLiked = next[post.id]?.liked ?? post.liked ?? false;
      next[post.id] = {
        liked: !wasLiked,
        delta: (next[post.id]?.delta ?? 0) + (wasLiked ? -1 : 1),
      };
      return next;
    });
  };

  const handlePublish = () => {
    const content = newPost.trim();
    if (!content) return;
    createMutation.mutate(content);
  };

  const handleShare = async (post: CommunityPost) => {
    const url = window.location.href;
    const text = post.content.slice(0, 100);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Aulateca — Comunidade', text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n\n${url}`);
        toast.success('Link copiado!');
      }
    } catch {
      // usuário cancelou o share — silencioso
    }
  };

  const tabs: { id: SortMode; label: string }[] = [
    { id: 'recent', label: 'Feed' },
    { id: 'popular', label: 'Popular' },
  ];

  return (
    <div className="px-5 py-6 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <div className="animate-slide-up">
        <h1 className="font-fredoka text-2xl sm:text-3xl font-bold tracking-tight gradient-text mb-1">Comunidade 💬</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">Conecte-se com outros educadores apaixonados por escrita.</p>
      </div>

      <div className="flex gap-1.5 animate-slide-up" style={{ animationDelay: '0.05s' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`chip ${activeTab === t.id ? 'chip-active' : 'text-muted-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="glass-card p-4 sm:p-5 animate-slide-up" style={{ animationDelay: '0.08s' }}>
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/15 to-primary/8 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">EU</div>
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Compartilhe algo com a comunidade..."
              rows={2}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between mt-2.5 pt-2.5" style={{ borderTop: '1px solid hsla(228, 12%, 91%, 0.5)' }}>
              <div className="flex gap-0.5">
                <button
                  onClick={() => toast.info('Upload de imagem em breve')}
                  className="text-muted-foreground hover:text-primary hover:bg-primary/8 rounded-lg p-1.5 transition-all duration-200"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toast.info('Anexar arquivo em breve')}
                  className="text-muted-foreground hover:text-primary hover:bg-primary/8 rounded-lg p-1.5 transition-all duration-200"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toast.info('Enquete em breve')}
                  className="text-muted-foreground hover:text-primary hover:bg-primary/8 rounded-lg p-1.5 transition-all duration-200"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handlePublish}
                disabled={!newPost.trim() || createMutation.isPending}
                className="px-6 py-2 rounded-full text-xs font-bold text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(to right, hsl(262, 83%, 58%), hsl(239, 84%, 57%))' }}
              >
                {createMutation.isPending ? 'Publicando…' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-3xl mb-2">⏳</p>
          <p className="font-fredoka text-sm">Carregando posts…</p>
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-3xl mb-2">⚠️</p>
          <p className="font-fredoka text-sm">Não foi possível carregar a comunidade</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-3xl mb-2">💭</p>
          <p className="font-fredoka text-sm">Seja o primeiro a postar!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <div key={post.id} className="glass-card p-4 sm:p-5 animate-slide-up" style={{ animationDelay: `${0.1 + i * 0.04}s` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: `${post.authorColor}14`, color: post.authorColor }}>
                  {post.authorInitials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{post.authorName}</div>
                  <div className="text-[11px] text-muted-foreground">{post.timeAgo}</div>
                </div>
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
              <div className="flex items-center gap-4 pt-3" style={{ borderTop: '1px solid hsla(228, 12%, 91%, 0.4)' }}>
                <button
                  onClick={() => handleLike(post)}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-all duration-200 ${post.liked ? 'text-brand-pink' : 'text-muted-foreground hover:text-primary'}`}
                >
                  <Heart size={13} className={post.liked ? 'fill-current' : ''} /> {post.likes}
                </button>
                <button
                  onClick={() => toast.info('Comentários em breve')}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-all duration-200"
                >
                  <MessageCircle size={13} /> {post.comments}
                </button>
                <button
                  onClick={() => handleShare(post)}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-all duration-200"
                >
                  <Share2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
