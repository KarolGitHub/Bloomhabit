import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HabitsModule } from './modules/habits/habits.module';
import { GardenModule } from './modules/garden/garden.module';
import { AiModule } from './modules/ai/ai.module';
import { DatabaseConfig } from './config/database.config';
import { JwtConfig } from './config/jwt.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),

    // Authentication
    JwtModule.registerAsync({
      useClass: JwtConfig,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Feature modules
    AuthModule,
    UsersModule,
    HabitsModule,
    GardenModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
