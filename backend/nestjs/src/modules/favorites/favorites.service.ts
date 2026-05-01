import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        resource: {
          include: { author: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(userId: string, resourceId: string) {
    const resource = await this.prisma.resource.findUnique({ where: { id: resourceId } });
    if (!resource) throw new NotFoundException('Recurso não encontrado');

    try {
      return await this.prisma.favorite.create({ data: { userId, resourceId } });
    } catch {
      throw new ConflictException('Recurso já está nos favoritos');
    }
  }

  async remove(userId: string, resourceId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_resourceId: { userId, resourceId } },
    });
    if (!favorite) throw new NotFoundException('Favorito não encontrado');

    return this.prisma.favorite.delete({
      where: { userId_resourceId: { userId, resourceId } },
    });
  }
}
