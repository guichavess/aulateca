import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { ResourceCategory, ResourceType } from '@prisma/client';

interface FindAllFilters {
  category?: ResourceCategory;
  type?: ResourceType;
  ageRange?: string;
  search?: string;
  page?: number;
  limit?: number;
}

function toFrontendResource(resource: any) {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    category: resource.category.toLowerCase() as string,
    type: resource.type.toLowerCase() as string,
    ageRange: resource.ageRange,
    duration: resource.duration,
    downloads: resource.downloads,
    rating: resource.rating,
    isNew: resource.isNew,
    author: resource.author?.name ?? 'Aulateca',
  };
}

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: FindAllFilters) {
    const { category, type, ageRange, search, page = 1, limit = 12 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (type) where.type = type;
    if (ageRange) where.ageRange = ageRange;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      }),
      this.prisma.resource.count({ where }),
    ]);

    return {
      data: data.map(toFrontendResource),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { favorites: true } },
      },
    });
    if (!resource) throw new NotFoundException('Recurso não encontrado');
    return {
      ...toFrontendResource(resource),
      favorites: resource._count.favorites,
    };
  }

  async create(authorId: string, dto: CreateResourceDto) {
    const resource = await this.prisma.resource.create({
      data: { ...dto, authorId },
      include: { author: { select: { id: true, name: true } } },
    });
    return toFrontendResource(resource);
  }

  async incrementDownloads(id: string) {
    return this.prisma.resource.update({
      where: { id },
      data: { downloads: { increment: 1 } },
      select: { id: true, downloads: true },
    });
  }
}
