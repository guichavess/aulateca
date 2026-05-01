import {
  Body, Controller, Get, Param, Post, Patch,
  Query, Request, UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResourceCategory, ResourceType } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';

@ApiTags('resources')
@Controller('resources')
export class ResourcesController {
  constructor(private resourcesService: ResourcesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar recursos com filtros e paginação' })
  @ApiQuery({ name: 'category', enum: ResourceCategory, required: false })
  @ApiQuery({ name: 'type', enum: ResourceType, required: false })
  @ApiQuery({ name: 'ageRange', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('category') category?: ResourceCategory,
    @Query('type') type?: ResourceType,
    @Query('ageRange') ageRange?: string,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit?: number,
  ) {
    return this.resourcesService.findAll({ category, type, ageRange, search, page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar recurso por ID' })
  findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Criar novo recurso (requer autenticação)' })
  create(@Request() req: any, @Body() dto: CreateResourceDto) {
    return this.resourcesService.create(req.user.id, dto);
  }

  @Patch(':id/download')
  @ApiOperation({ summary: 'Registrar download de um recurso' })
  download(@Param('id') id: string) {
    return this.resourcesService.incrementDownloads(id);
  }
}
