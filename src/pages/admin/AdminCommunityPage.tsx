import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { communityService } from '@/services/community.service';
import { supabase } from '@/integrations/supabase/client';

const AdminCommunityPage: React.FC = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'community', page],
    queryFn: () => communityService.fetchPosts('recent', page),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('community_posts').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success('Post removido');
      qc.invalidateQueries({ queryKey: ['admin', 'community'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / 10)) : 1;

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="font-fredoka text-2xl font-bold tracking-tight">Moderação da comunidade</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Remova posts ofensivos ou fora do tema.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      <div className="space-y-3">
        {data?.data.map((post) => (
          <div key={post.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: post.authorColor }}
                >
                  {post.authorInitials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{post.authorName}</p>
                  <p className="text-xs text-muted-foreground">{post.timeAgo}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm('Remover este post?')) remove.mutate(post.id);
                }}
                className="p-1.5 rounded hover:bg-rose-500/10 hover:text-rose-500 transition-colors shrink-0"
                title="Remover"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-sm mt-3 whitespace-pre-wrap">{post.content}</p>
            <div className="text-xs text-muted-foreground mt-3 flex gap-4">
              <span>❤️ {post.likes}</span>
              <span>💬 {post.comments}</span>
            </div>
          </div>
        ))}

        {data && data.data.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <p className="text-sm">Sem posts no momento.</p>
          </div>
        )}
      </div>

      {data && data.total > 10 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <span>Página {page} de {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-50 hover:bg-secondary"
            >
              Anterior
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-50 hover:bg-secondary"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommunityPage;
