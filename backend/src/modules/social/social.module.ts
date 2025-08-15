import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialController } from './social.controller';
import { FriendshipsService } from './friendships.service';
import { HabitSharesService } from './habit-shares.service';
import { SocialActivitiesService } from './social-activities.service';
import { Friendship } from '../../database/entities/friendship.entity';
import { HabitShare } from '../../database/entities/habit-share.entity';
import { SocialActivity } from '../../database/entities/social-activity.entity';
import { User } from '../../database/entities/user.entity';
import { Habit } from '../../database/entities/habit.entity';
import { HabitLog } from '../../database/entities/habit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Friendship,
      HabitShare,
      SocialActivity,
      User,
      Habit,
      HabitLog,
    ]),
  ],
  controllers: [SocialController],
  providers: [FriendshipsService, HabitSharesService, SocialActivitiesService],
  exports: [FriendshipsService, HabitSharesService, SocialActivitiesService],
})
export class SocialModule {}
