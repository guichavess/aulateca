import { Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar favoritos do usuário autenticado' })
  findAll(@Request() req: any) {
    return this.favoritesService.findByUser(req.user.id);
  }

  @Post(':resourceId')
  @ApiOperation({ summary: 'Adicionar recurso aos favoritos' })
  add(@Request() req: any, @Param('resourceId') resourceId: string) {
    return this.favoritesService.add(req.user.id, resourceId);
  }

  @Delete(':resourceId')
  @ApiOperation({ summary: 'Remover recurso dos favoritos' })
  remove(@Request() req: any, @Param('resourceId') resourceId: string) {
    return this.favoritesService.remove(req.user.id, resourceId);
  }
}
