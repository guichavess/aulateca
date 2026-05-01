import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#F9CA24', '#A29BFE', '#FD79A8', '#00B894',
];

function getAuthorColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

function toTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d atrás`;
  return date.toLocaleDateString('pt-BR');
}

function toFrontendPost(post: any, userId?: string) {
  return {
    id: post.id,
    authorName: post.author.name,
    authorInitials: getInitials(post.author.name),
    authorColor: getAuthorColor(post.author.id),
    timeAgo: toTimeAgo(new Date(post.createdAt)),
    content: post.content,
    likes: post._count?.likes ?? 0,
    comments: post._count?.comments ?? 0,
    liked: userId ? post.likes?.some((l: any) => l.userId === userId) : false,
  };
}

const authorSelect = { select: { id: true, name: true, avatarUrl: true } };
const postInclude = {
  author: authorSelect,
  _count: { select: { likes: true, comments: true } },
};

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async findAll(sort: 'recent' | 'popular' = 'recent', page = 1, limit = 10, userId?: string) {
    const skip = (page - 1) * limit;
    const orderBy =
      sort === 'popular'
        ? { likes: { _count: 'desc' as const } }
        : { createdAt: 'desc' as const };

    const [data, total] = await Promise.all([
      this.prisma.communityPost.findMany({
        skip,
        take: limit,
        orderBy,
        include: postInclude,
      }),
      this.prisma.communityPost.count(),
    ]);

    return {
      data: data.map((p) => toFrontendPost(p, userId)),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async create(authorId: string, content: string) {
    const post = await this.prisma.communityPost.create({
      data: { authorId, content },
      include: postInclude,
    });
    return toFrontendPost(post, authorId);
  }

  async toggleLike(userId: string, postId: string) {
    const post = await this.prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post não encontrado');

    const existing = await this.prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await this.prisma.postLike.delete({ where: { userId_postId: { userId, postId } } });
      return { liked: false };
    }

    await this.prisma.postLike.create({ data: { userId, postId } });
    return { liked: true };
  }

  async addComment(authorId: string, postId: string, content: string) {
    const post = await this.prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post não encontrado');

    const comment = await this.prisma.postComment.create({
      data: { authorId, postId, content },
      include: { author: authorSelect },
    });

    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      authorName: comment.author.name,
      authorInitials: getInitials(comment.author.name),
      authorColor: getAuthorColor(comment.author.id),
    };
  }

  async getComments(postId: string) {
    const comments = await this.prisma.postComment.findMany({
      where: { postId },
      include: { author: authorSelect },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      timeAgo: toTimeAgo(new Date(c.createdAt)),
      authorName: c.author.name,
      authorInitials: getInitials(c.author.name),
      authorColor: getAuthorColor(c.author.id),
    }));
  }
}
