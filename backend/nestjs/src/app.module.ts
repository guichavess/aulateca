import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { CommunityModule } from './modules/community/community.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ResourcesModule,
    FavoritesModule,
    CommunityModule,
  ],
})
export class AppModule {}
