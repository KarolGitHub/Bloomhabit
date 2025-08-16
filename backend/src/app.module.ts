import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConfig } from './config/database.config';
import { JwtConfig } from './config/jwt.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HabitsModule } from './modules/habits/habits.module';
import { GardenModule } from './modules/garden/garden.module';
import { AiModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CommunityModule } from './modules/community/community.module';
import { GoalsModule } from './modules/goals/goals.module';
import { I18nModule } from './modules/i18n/i18n.module';
import { SocialModule } from './modules/social/social.module';
import { WearableModule } from './modules/wearable/wearable.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { GardenVisualizationModule } from './modules/garden-visualization/garden-visualization.module';
import { ExportImportModule } from './modules/export-import/export-import.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    JwtModule.registerAsync({
      useClass: JwtConfig,
    }),
    PassportModule,
    I18nModule,
    AuthModule,
    UsersModule,
    HabitsModule,
    GardenModule,
    AiModule,
    AnalyticsModule,
    NotificationsModule,
    CommunityModule,
    GoalsModule,
    SocialModule,
    WearableModule,
    GamificationModule,
    GardenVisualizationModule,
    ExportImportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
