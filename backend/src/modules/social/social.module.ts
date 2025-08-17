import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialController } from './social.controller';
import { AdvancedSocialController } from './controllers/advanced-social.controller';
import { FriendshipsService } from './friendships.service';
import { HabitSharesService } from './habit-shares.service';
import { SocialActivitiesService } from './social-activities.service';
import { HabitGroupService } from './services/habit-group.service';
import { MentorshipService } from './services/mentorship.service';
import { SocialChallengeService } from './services/social-challenge.service';
import { Friendship } from '../../database/entities/friendship.entity';
import { HabitShare } from '../../database/entities/habit-share.entity';
import { SocialActivity } from '../../database/entities/social-activity.entity';
import { HabitGroup, GroupMember } from '../../database/entities/habit-group.entity';
import { Mentorship, MentorshipSession } from '../../database/entities/mentorship.entity';
import { SocialChallenge, ChallengeParticipant } from '../../database/entities/social-challenge.entity';
import { User } from '../../database/entities/user.entity';
import { Habit } from '../../database/entities/habit.entity';
import { HabitLog } from '../../database/entities/habit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Friendship,
      HabitShare,
      SocialActivity,
      HabitGroup,
      GroupMember,
      Mentorship,
      MentorshipSession,
      SocialChallenge,
      ChallengeParticipant,
      User,
      Habit,
      HabitLog,
    ]),
  ],
  controllers: [SocialController, AdvancedSocialController],
  providers: [
    FriendshipsService,
    HabitSharesService,
    SocialActivitiesService,
    HabitGroupService,
    MentorshipService,
    SocialChallengeService,
  ],
  exports: [
    FriendshipsService,
    HabitSharesService,
    SocialActivitiesService,
    HabitGroupService,
    MentorshipService,
    SocialChallengeService,
  ],
})
export class SocialModule {}
