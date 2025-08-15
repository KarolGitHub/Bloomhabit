import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AdvancedAnalyticsController } from './advanced-analytics.controller';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { User } from '../../database/entities/user.entity';
import { Habit } from '../../database/entities/habit.entity';
import { HabitLog } from '../../database/entities/habit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Habit, HabitLog])],
  controllers: [AnalyticsController, AdvancedAnalyticsController],
  providers: [AnalyticsService, AdvancedAnalyticsService],
  exports: [AnalyticsService, AdvancedAnalyticsService],
})
export class AnalyticsModule {}
