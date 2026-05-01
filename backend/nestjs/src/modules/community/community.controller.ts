import {
  Body, Controller, DefaultValuePipe, Get, Param,
  ParseIntPipe, Post, Query, Request, UseGuards, Optional,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CommunityService } from './community.service';

class CreatePostDto {
  @IsString()
  @MinLength(5)
  content: string;
}

class CreateCommentDto {
  @IsString()
  @MinLength(1)
  content: string;
}

@ApiTags('community')
@Controller('community')
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Listar posts da comunidade' })
  @ApiQuery({ name: 'sort', enum: ['recent', 'popular'], required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  findAll(
    @Request() req: any,
    @Query('sort') sort: 'recent' | 'popular' = 'recent',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ) {
    const userId: string | undefined = req.user?.id;
    return this.communityService.findAll(sort, page, 10, userId);
  }

  @Post('posts')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Criar novo post' })
  create(@Request() req: any, @Body() dto: CreatePostDto) {
    return this.communityService.create(req.user.id, dto.content);
  }

  @Post('posts/:id/like')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Curtir ou descurtir um post' })
  toggleLike(@Request() req: any, @Param('id') postId: string) {
    return this.communityService.toggleLike(req.user.id, postId);
  }

  @Get('posts/:id/comments')
  @ApiOperation({ summary: 'Listar comentários de um post' })
  getComments(@Param('id') postId: string) {
    return this.communityService.getComments(postId);
  }

  @Post('posts/:id/comments')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Comentar em um post' })
  addComment(
    @Request() req: any,
    @Param('id') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.communityService.addComment(req.user.id, postId, dto.content);
  }
}
