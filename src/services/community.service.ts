import { supabase } from '@/integrations/supabase/client';
import type { CommunityPost } from '@/lib/types';

const AVATAR_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#F9CA24', '#A29BFE', '#FD79A8', '#00B894'];

function getColor(id: string): string {
  let hash = 0;
  // | 0 mantém em int32 a cada passo; >>> 0 no fim força unsigned para o módulo.
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_COLORS[(hash >>> 0) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

function toTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d atrás`;
  return new Date(date).toLocaleDateString('pt-BR');
}

type PostRow = {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  profiles?: { name?: string } | null;
  post_likes?: { count: number }[];
  post_comments?: { count: number }[];
};

function toPost(row: PostRow, likedIds: string[]): CommunityPost {
  return {
    id: row.id,
    content: row.content,
    authorName: row.profiles?.name ?? 'Usuário',
    authorInitials: getInitials(row.profiles?.name ?? 'U'),
    authorColor: getColor(row.author_id),
    timeAgo: toTimeAgo(row.created_at),
    likes: row.post_likes?.[0]?.count ?? 0,
    comments: row.post_comments?.[0]?.count ?? 0,
    liked: likedIds.includes(row.id),
  };
}

export const communityService = {
  async fetchPosts(sort: 'recent' | 'popular' = 'recent', page = 1): Promise<{ data: CommunityPost[]; total: number }> {
    const limit = 10;
    const from = (page - 1) * limit;

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error, count } = await supabase
      .from('community_posts')
      .select(`
        id, content, author_id, created_at,
        profiles(name),
        post_likes(count),
        post_comments(count)
      `, { count: 'exact' })
      .range(from, from + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // TODO: para "popular" global, materializar likes_count em community_posts
    // via trigger e ordenar no banco. Por ora, reordena a página atual em
    // memória — funciona, mas não atravessa páginas.
    const rows = (data ?? []) as PostRow[];
    const ordered = sort === 'popular'
      ? [...rows].sort((a, b) => (b.post_likes?.[0]?.count ?? 0) - (a.post_likes?.[0]?.count ?? 0))
      : rows;

    let likedIds: string[] = [];
    if (user && rows.length) {
      const postIds = rows.map((p) => p.id);
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);
      likedIds = (likes ?? []).map((l: { post_id: string }) => l.post_id);
    }

    return {
      data: ordered.map((p) => toPost(p, likedIds)),
      total: count ?? 0,
    };
  },

  async createPost(content: string): Promise<CommunityPost> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { data, error } = await supabase
      .from('community_posts')
      .insert({ content, author_id: user.id })
      .select('id, content, author_id, created_at, profiles(name)')
      .single();

    if (error) throw new Error(error.message);
    return toPost({ ...(data as unknown as PostRow), post_likes: [{ count: 0 }], post_comments: [{ count: 0 }] }, []);
  },

  async toggleLike(postId: string): Promise<{ liked: boolean }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { data: existing } = await supabase
      .from('post_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .maybeSingle();

    if (existing) {
      await supabase.from('post_likes').delete().eq('id', existing.id);
      return { liked: false };
    }

    await supabase.from('post_likes').insert({ user_id: user.id, post_id: postId });
    return { liked: true };
  },

  async addComment(postId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, author_id: user.id, content })
      .select('id, content, created_at, profiles(name, id:author_id)')
      .single();

    if (error) throw new Error(error.message);
    const row = data as { id: string; content: string; created_at: string; profiles?: { name?: string } | null };
    return {
      id: row.id,
      content: row.content,
      timeAgo: toTimeAgo(row.created_at),
      authorName: row.profiles?.name ?? 'Usuário',
      authorInitials: getInitials(row.profiles?.name ?? 'U'),
      authorColor: getColor(user.id),
    };
  },
};
