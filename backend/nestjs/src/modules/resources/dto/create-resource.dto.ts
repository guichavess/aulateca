import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResourceCategory, ResourceType } from '@prisma/client';

export class CreateResourceDto {
  @ApiProperty({ example: 'Produção de Texto Narrativo' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Atividade para desenvolver a escrita criativa em narrativas' })
  @IsString()
  description: string;

  @ApiProperty({ enum: ResourceCategory })
  @IsEnum(ResourceCategory)
  category: ResourceCategory;

  @ApiProperty({ enum: ResourceType })
  @IsEnum(ResourceType)
  type: ResourceType;

  @ApiProperty({ example: '6-8' })
  @IsString()
  ageRange: string;

  @ApiProperty({ example: '30min' })
  @IsString()
  duration: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/recurso.pdf' })
  @IsOptional()
  @IsString()
  fileUrl?: string;
}
