import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  GroupChallenge,
  ChallengeStatus,
  ChallengeType,
} from './group-challenge.entity';
import {
  ChallengeParticipation,
  ParticipationStatus,
} from './challenge-participation.entity';
import { CommunityGarden } from './community-garden.entity';
import { CreateGroupChallengeDto } from './dto/create-group-challenge.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class GroupChallengesService {
  constructor(
    @InjectRepository(GroupChallenge)
    private groupChallengesRepository: Repository<GroupChallenge>,
    @InjectRepository(ChallengeParticipation)
    private challengeParticipationRepository: Repository<ChallengeParticipation>,
    @InjectRepository(CommunityGarden)
    private communityGardensRepository: Repository<CommunityGarden>,
    private notificationsService: NotificationsService
  ) {}

  async create(
    userId: number,
    createGroupChallengeDto: CreateGroupChallengeDto
  ): Promise<GroupChallenge> {
    // Verify user has access to the community garden
    const garden = await this.communityGardensRepository.findOne({
      where: { id: createGroupChallengeDto.communityGardenId },
      relations: ['owner', 'members'],
    });

    if (!garden) {
      throw new NotFoundException('Community garden not found');
    }

    if (
      garden.ownerId !== userId &&
      !garden.members.some((m) => m.id === userId)
    ) {
      throw new ForbiddenException(
        'You must be a member of the garden to create challenges'
      );
    }

    const challenge = this.groupChallengesRepository.create({
      ...createGroupChallengeDto,
      creatorId: userId,
      participantCount: 0,
      completionCount: 0,
    });

    const savedChallenge = await this.groupChallengesRepository.save(challenge);

    // Send notification to garden members about new challenge
    for (const member of garden.members) {
      if (member.id !== userId) {
        await this.notificationsService.create(member.id, {
          type: 'friend_activity',
          title: 'New Challenge Available! 🏆',
          message: `A new challenge "${savedChallenge.title}" has been created in ${garden.name}`,
          data: {
            challengeId: savedChallenge.id,
            challengeTitle: savedChallenge.title,
            gardenName: garden.name,
          },
          priority: 'medium',
        });
      }
    }

    return savedChallenge;
  }

  async findAll(filters?: {
    status?: ChallengeStatus;
    type?: ChallengeType;
    gardenId?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ challenges: GroupChallenge[]; total: number }> {
    const queryBuilder = this.groupChallengesRepository
      .createQueryBuilder('challenge')
      .leftJoinAndSelect('challenge.creator', 'creator')
      .leftJoinAndSelect('challenge.communityGarden', 'garden')
      .leftJoinAndSelect('challenge.participants', 'participants');

    if (filters?.status) {
      queryBuilder.andWhere('challenge.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.type) {
      queryBuilder.andWhere('challenge.type = :type', { type: filters.type });
    }

    if (filters?.gardenId) {
      queryBuilder.andWhere('challenge.communityGardenId = :gardenId', {
        gardenId: filters.gardenId,
      });
    }

    const total = await queryBuilder.getCount();

    if (filters?.limit) {
      queryBuilder.limit(filters.limit);
    }
    if (filters?.offset) {
      queryBuilder.offset(filters.offset);
    }

    const challenges = await queryBuilder
      .orderBy('challenge.createdAt', 'DESC')
      .getMany();

    return { challenges, total };
  }

  async findOne(id: number): Promise<GroupChallenge> {
    const challenge = await this.groupChallengesRepository.findOne({
      where: { id },
      relations: ['creator', 'communityGarden', 'participants'],
    });

    if (!challenge) {
      throw new NotFoundException('Group challenge not found');
    }

    return challenge;
  }

  async update(
    id: number,
    userId: number,
    updateData: Partial<CreateGroupChallengeDto>
  ): Promise<GroupChallenge> {
    const challenge = await this.findOne(id);

    if (challenge.creatorId !== userId) {
      throw new ForbiddenException(
        'Only the challenge creator can update the challenge'
      );
    }

    if (challenge.status !== ChallengeStatus.UPCOMING) {
      throw new ForbiddenException(
        'Cannot update active or completed challenges'
      );
    }

    Object.assign(challenge, updateData);
    return this.groupChallengesRepository.save(challenge);
  }

  async remove(id: number, userId: number): Promise<void> {
    const challenge = await this.findOne(id);

    if (challenge.creatorId !== userId) {
      throw new ForbiddenException(
        'Only the challenge creator can delete the challenge'
      );
    }

    challenge.status = ChallengeStatus.CANCELLED;
    await this.groupChallengesRepository.save(challenge);
  }

  async joinChallenge(
    challengeId: number,
    userId: number
  ): Promise<ChallengeParticipation> {
    const challenge = await this.findOne(challengeId);

    if (
      challenge.status !== ChallengeStatus.UPCOMING &&
      challenge.status !== ChallengeStatus.ACTIVE
    ) {
      throw new ForbiddenException('Challenge is not accepting participants');
    }

    if (
      !challenge.allowLateJoins &&
      challenge.status === ChallengeStatus.ACTIVE
    ) {
      throw new ForbiddenException('Challenge does not allow late joins');
    }

    // Check if user is already participating
    const existingParticipation =
      await this.challengeParticipationRepository.findOne({
        where: { challengeId, userId },
      });

    if (existingParticipation) {
      throw new ConflictException(
        'You are already participating in this challenge'
      );
    }

    // Verify user has access to the community garden
    const garden = await this.communityGardensRepository.findOne({
      where: { id: challenge.communityGardenId },
      relations: ['owner', 'members'],
    });

    if (
      garden.ownerId !== userId &&
      !garden.members.some((m) => m.id === userId)
    ) {
      throw new ForbiddenException(
        'You must be a member of the garden to join challenges'
      );
    }

    const participation = this.challengeParticipationRepository.create({
      userId,
      challengeId,
      status: ParticipationStatus.JOINED,
      joinedAt: new Date(),
      lastActivityAt: new Date(),
    });

    const savedParticipation =
      await this.challengeParticipationRepository.save(participation);

    // Update challenge participant count
    challenge.participantCount += 1;
    await this.groupChallengesRepository.save(challenge);

    // Send notification to challenge creator
    if (challenge.creatorId !== userId) {
      await this.notificationsService.create(challenge.creatorId, {
        type: 'friend_activity',
        title: 'New Challenge Participant! 🎉',
        message: `Someone joined your challenge "${challenge.title}"`,
        data: { challengeId: challenge.id, challengeTitle: challenge.title },
        priority: 'low',
      });
    }

    return savedParticipation;
  }

  async leaveChallenge(challengeId: number, userId: number): Promise<void> {
    const participation = await this.challengeParticipationRepository.findOne({
      where: { challengeId, userId },
    });

    if (!participation) {
      throw new NotFoundException(
        'You are not participating in this challenge'
      );
    }

    if (participation.status === ParticipationStatus.COMPLETED) {
      throw new ForbiddenException('Cannot leave a completed challenge');
    }

    await this.challengeParticipationRepository.remove(participation);

    // Update challenge participant count
    const challenge = await this.findOne(challengeId);
    challenge.participantCount = Math.max(0, challenge.participantCount - 1);
    await this.groupChallengesRepository.save(challenge);
  }

  async updateProgress(
    challengeId: number,
    userId: number,
    progressData: {
      currentValue: number;
      streak?: number;
      notes?: string;
    }
  ): Promise<ChallengeParticipation> {
    const participation = await this.challengeParticipationRepository.findOne({
      where: { challengeId, userId },
      relations: ['challenge'],
    });

    if (!participation) {
      throw new NotFoundException(
        'You are not participating in this challenge'
      );
    }

    if (participation.challenge.status !== ChallengeStatus.ACTIVE) {
      throw new ForbiddenException('Challenge is not active');
    }

    // Update participation data
    participation.currentValue = progressData.currentValue;
    participation.bestValue = Math.max(
      participation.bestValue,
      progressData.currentValue
    );
    participation.streak = progressData.streak || participation.streak;
    participation.longestStreak = Math.max(
      participation.longestStreak,
      participation.streak
    );
    participation.lastActivityAt = new Date();

    if (progressData.notes) {
      participation.notes = participation.notes || [];
      participation.notes.push(progressData.notes);
    }

    // Check if challenge is completed
    if (participation.currentValue >= participation.challenge.targetValue) {
      participation.status = ParticipationStatus.COMPLETED;
      participation.completedAt = new Date();

      // Update challenge completion count
      const challenge = await this.findOne(challengeId);
      challenge.completionCount += 1;
      await this.groupChallengesRepository.save(challenge);

      // Send completion notification
      await this.notificationsService.create(userId, {
        type: 'goal_achievement',
        title: 'Challenge Completed! 🏆',
        message: `Congratulations! You've completed "${participation.challenge.title}" challenge!`,
        data: { challengeId: challenge.id, challengeTitle: challenge.title },
        priority: 'high',
      });
    } else {
      participation.status = ParticipationStatus.ACTIVE;
    }

    return this.challengeParticipationRepository.save(participation);
  }

  async getChallengeLeaderboard(
    challengeId: number
  ): Promise<ChallengeParticipation[]> {
    return this.challengeParticipationRepository
      .createQueryBuilder('participation')
      .leftJoinAndSelect('participation.user', 'user')
      .where('participation.challengeId = :challengeId', { challengeId })
      .orderBy('participation.currentValue', 'DESC')
      .addOrderBy('participation.streak', 'DESC')
      .addOrderBy('participation.joinedAt', 'ASC')
      .getMany();
  }

  async getActiveChallenges(gardenId?: number): Promise<GroupChallenge[]> {
    const queryBuilder = this.groupChallengesRepository
      .createQueryBuilder('challenge')
      .leftJoinAndSelect('challenge.creator', 'creator')
      .leftJoinAndSelect('challenge.communityGarden', 'garden')
      .where('challenge.status = :status', { status: ChallengeStatus.ACTIVE });

    if (gardenId) {
      queryBuilder.andWhere('challenge.communityGardenId = :gardenId', {
        gardenId,
      });
    }

    return queryBuilder.orderBy('challenge.endDate', 'ASC').getMany();
  }

  async getUpcomingChallenges(gardenId?: number): Promise<GroupChallenge[]> {
    const queryBuilder = this.groupChallengesRepository
      .createQueryBuilder('challenge')
      .leftJoinAndSelect('challenge.creator', 'creator')
      .leftJoinAndSelect('challenge.communityGarden', 'garden')
      .where('challenge.status = :status', { status: ChallengeStatus.UPCOMING })
      .andWhere('challenge.startDate > :now', { now: new Date() });

    if (gardenId) {
      queryBuilder.andWhere('challenge.communityGardenId = :gardenId', {
        gardenId,
      });
    }

    return queryBuilder.orderBy('challenge.startDate', 'ASC').getMany();
  }

  async getUserChallenges(userId: number): Promise<ChallengeParticipation[]> {
    return this.challengeParticipationRepository
      .createQueryBuilder('participation')
      .leftJoinAndSelect('participation.challenge', 'challenge')
      .leftJoinAndSelect('challenge.communityGarden', 'garden')
      .where('participation.userId = :userId', { userId })
      .orderBy('participation.lastActivityAt', 'DESC')
      .getMany();
  }
}
