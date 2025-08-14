import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController } from './community.controller';
import { CommunityGardensService } from './community-gardens.service';
import { GroupChallengesService } from './group-challenges.service';
import { CommunityGarden } from './community-garden.entity';
import { GroupChallenge } from './group-challenge.entity';
import { ChallengeParticipation } from './challenge-participation.entity';
import { User } from '../../database/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommunityGarden,
      GroupChallenge,
      ChallengeParticipation,
      User,
    ]),
    NotificationsModule,
  ],
  controllers: [CommunityController],
  providers: [CommunityGardensService, GroupChallengesService],
  exports: [CommunityGardensService, GroupChallengesService],
})
export class CommunityModule {}
