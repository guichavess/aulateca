import React, { useState } from 'react';
import { communityPosts } from '@/lib/data';
import { CommunityPost } from '@/lib/types';
import { Heart, MessageCircle, Share2, Image, Paperclip, BarChart3 } from 'lucide-react';

const CommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState<CommunityPost[]>(communityPosts.map(p => ({ ...p, liked: false })));
  const [newPost, setNewPost] = useState('');

  const toggleLike = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const tabs = [
    { id: 'feed', label: 'Feed' },
    { id: 'popular', label: 'Popular' },
    { id: 'questions', label: 'Perguntas' },
  ];

  const displayPosts = activeTab === 'popular' ? [...posts].sort((a, b) => b.likes - a.likes) : posts;

  return (
    <div className="px-5 py-6 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <div className="animate-slide-up">
        <h1 className="font-fredoka text-2xl sm:text-3xl font-bold tracking-tight gradient-text mb-1">Comunidade 💬</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">Conecte-se com outros educadores apaixonados por escrita.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 animate-slide-up" style={{ animationDelay: '0.05s' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`chip ${activeTab === t.id ? 'chip-active' : 'text-muted-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* New post */}
      <div className="glass-card p-4 sm:p-5 animate-slide-up" style={{ animationDelay: '0.08s' }}>
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/15 to-primary/8 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">MS</div>
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
                <button className="text-muted-foreground hover:text-primary hover:bg-primary/8 rounded-lg p-1.5 transition-all duration-200"><Image className="w-4 h-4" /></button>
                <button className="text-muted-foreground hover:text-primary hover:bg-primary/8 rounded-lg p-1.5 transition-all duration-200"><Paperclip className="w-4 h-4" /></button>
                <button className="text-muted-foreground hover:text-primary hover:bg-primary/8 rounded-lg p-1.5 transition-all duration-200"><BarChart3 className="w-4 h-4" /></button>
              </div>
              <button className="px-6 py-2 rounded-full text-xs font-bold text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200" style={{ background: 'linear-gradient(to right, hsl(262, 83%, 58%), hsl(239, 84%, 57%))', }}>Publicar</button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {displayPosts.map((post, i) => (
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
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">{post.content}</p>
            <div className="flex items-center gap-4 pt-3" style={{ borderTop: '1px solid hsla(228, 12%, 91%, 0.4)' }}>
              <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 text-xs font-medium transition-all duration-200 ${post.liked ? 'text-brand-pink' : 'text-muted-foreground hover:text-primary'}`}>
                <Heart size={13} className={post.liked ? 'fill-current' : ''} /> {post.likes}
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-all duration-200">
                <MessageCircle size={13} /> {post.comments}
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-all duration-200">
                <Share2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityPage;
