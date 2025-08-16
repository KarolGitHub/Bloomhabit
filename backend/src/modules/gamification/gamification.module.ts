import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';

// Entities
import { User } from '../../database/entities/user.entity';
import { Habit } from '../../database/entities/habit.entity';
import { HabitLog } from '../../database/entities/habit-log.entity';
import { Achievement } from '../../database/entities/achievement.entity';
import { UserAchievement } from '../../database/entities/user-achievement.entity';
import { Leaderboard } from '../../database/entities/leaderboard.entity';
import { LeaderboardEntry } from '../../database/entities/leaderboard-entry.entity';
import { Challenge } from '../../database/entities/challenge.entity';
import { UserChallenge } from '../../database/entities/user-challenge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Habit,
      HabitLog,
      Achievement,
      UserAchievement,
      Leaderboard,
      LeaderboardEntry,
      Challenge,
      UserChallenge,
    ]),
  ],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}

