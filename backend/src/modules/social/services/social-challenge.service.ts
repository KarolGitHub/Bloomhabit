import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SocialChallenge,
  ChallengeParticipant,
  ChallengeStatus,
  ParticipantStatus,
} from '../../../database/entities/social-challenge.entity';
import { User } from '../../../database/entities/user.entity';
import {
  CreateSocialChallengeDto,
  UpdateSocialChallengeDto,
  JoinChallengeDto,
  UpdateParticipantStatusDto,
} from '../dto/social-challenge.dto';

@Injectable()
export class SocialChallengeService {
  constructor(
    @InjectRepository(SocialChallenge)
    private challengeRepository: Repository<SocialChallenge>,
    @InjectRepository(ChallengeParticipant)
    private participantRepository: Repository<ChallengeParticipant>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createSocialChallenge(
    userId: number,
    createDto: CreateSocialChallengeDto
  ): Promise<SocialChallenge> {
    // Check if challenge name already exists
    const existingChallenge = await this.challengeRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingChallenge) {
      throw new BadRequestException('Challenge name already exists');
    }

    // Validate dates
    const startDate = new Date(createDto.startDate);
    const endDate = new Date(createDto.endDate);
    const now = new Date();

    if (startDate <= now) {
      throw new BadRequestException('Start date must be in the future');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const challenge = this.challengeRepository.create({
      ...createDto,
      creatorId: userId,
      currentParticipants: 0,
      status: ChallengeStatus.DRAFT,
    });

    return this.challengeRepository.save(challenge);
  }

  async getUserChallenges(userId: number): Promise<SocialChallenge[]> {
    return this.challengeRepository
      .createQueryBuilder('challenge')
      .leftJoinAndSelect('challenge.participants', 'participant')
      .leftJoinAndSelect('challenge.creator', 'creator')
      .where('participant.userId = :userId', { userId })
      .orWhere('challenge.creatorId = :userId', { userId })
      .orWhere('challenge.isPublic = :isPublic', { isPublic: true })
      .orderBy('challenge.startDate', 'ASC')
      .getMany();
  }

  async getSocialChallengeById(
    challengeId: number,
    userId?: number
  ): Promise<SocialChallenge> {
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId },
      relations: ['participants', 'participants.user', 'creator', 'habits'],
    });

    if (!challenge) {
      throw new NotFoundException('Social challenge not found');
    }

    // Check if user has access to private challenges
    if (!challenge.isPublic && userId && challenge.creatorId !== userId) {
      const isParticipant = challenge.participants.some(
        (p) => p.userId === userId
      );
      if (!isParticipant) {
        throw new ForbiddenException('Access denied to private challenge');
      }
    }

    return challenge;
  }

  async updateSocialChallenge(
    challengeId: number,
    userId: number,
    updateDto: UpdateSocialChallengeDto
  ): Promise<SocialChallenge> {
    const challenge = await this.getSocialChallengeById(challengeId, userId);

    if (challenge.creatorId !== userId) {
      throw new ForbiddenException(
        'Only challenge creators can update challenges'
      );
    }

    if (challenge.status !== ChallengeStatus.DRAFT) {
      throw new BadRequestException('Only draft challenges can be updated');
    }

    // Check if new name conflicts with existing challenges
    if (updateDto.name && updateDto.name !== challenge.name) {
      const existingChallenge = await this.challengeRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existingChallenge) {
        throw new BadRequestException('Challenge name already exists');
      }
    }

    // Validate dates if being updated
    if (updateDto.startDate || updateDto.endDate) {
      const startDate = updateDto.startDate
        ? new Date(updateDto.startDate)
        : challenge.startDate;
      const endDate = updateDto.endDate
        ? new Date(updateDto.endDate)
        : challenge.endDate;

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    Object.assign(challenge, updateDto);
    return this.challengeRepository.save(challenge);
  }

  async deleteSocialChallenge(
    challengeId: number,
    userId: number
  ): Promise<void> {
    const challenge = await this.getSocialChallengeById(challengeId, userId);

    if (challenge.creatorId !== userId) {
      throw new ForbiddenException(
        'Only challenge creators can delete challenges'
      );
    }

    if (challenge.status !== ChallengeStatus.DRAFT) {
      throw new BadRequestException('Only draft challenges can be deleted');
    }

    await this.challengeRepository.remove(challenge);
  }

  async activateChallenge(
    challengeId: number,
    userId: number
  ): Promise<SocialChallenge> {
    const challenge = await this.getSocialChallengeById(challengeId, userId);

    if (challenge.creatorId !== userId) {
      throw new ForbiddenException(
        'Only challenge creators can activate challenges'
      );
    }

    if (challenge.status !== ChallengeStatus.DRAFT) {
      throw new BadRequestException('Only draft challenges can be activated');
    }

    const now = new Date();
    if (challenge.startDate <= now) {
      throw new BadRequestException(
        'Cannot activate challenge with past start date'
      );
    }

    challenge.status = ChallengeStatus.ACTIVE;
    return this.challengeRepository.save(challenge);
  }

  async pauseChallenge(
    challengeId: number,
    userId: number
  ): Promise<SocialChallenge> {
    const challenge = await this.getSocialChallengeById(challengeId, userId);

    if (challenge.creatorId !== userId) {
      throw new ForbiddenException(
        'Only challenge creators can pause challenges'
      );
    }

    if (challenge.status !== ChallengeStatus.ACTIVE) {
      throw new BadRequestException('Only active challenges can be paused');
    }

    challenge.status = ChallengeStatus.PAUSED;
    return this.challengeRepository.save(challenge);
  }

  async completeChallenge(
    challengeId: number,
    userId: number
  ): Promise<SocialChallenge> {
    const challenge = await this.getSocialChallengeById(challengeId, userId);

    if (challenge.creatorId !== userId) {
      throw new ForbiddenException(
        'Only challenge creators can complete challenges'
      );
    }

    if (
      challenge.status !== ChallengeStatus.ACTIVE &&
      challenge.status !== ChallengeStatus.PAUSED
    ) {
      throw new BadRequestException(
        'Only active or paused challenges can be completed'
      );
    }

    challenge.status = ChallengeStatus.COMPLETED;
    challenge.endDate = new Date();
    return this.challengeRepository.save(challenge);
  }

  async joinChallenge(
    challengeId: number,
    userId: number,
    joinDto: JoinChallengeDto
  ): Promise<ChallengeParticipant> {
    const challenge = await this.getSocialChallengeById(challengeId, userId);

    if (challenge.status !== ChallengeStatus.ACTIVE) {
      throw new BadRequestException('Challenge is not active');
    }

    if (challenge.currentParticipants >= challenge.maxParticipants) {
      throw new BadRequestException('Challenge is at maximum capacity');
    }

    // Check registration deadline
    if (
      challenge.registrationDeadline &&
      new Date() > challenge.registrationDeadline
    ) {
      throw new BadRequestException('Registration deadline has passed');
    }

    // Check if user is already a participant
    const existingParticipant = challenge.participants.find(
      (p) => p.userId === userId
    );
    if (existingParticipant) {
      throw new BadRequestException(
        'User is already a participant in this challenge'
      );
    }

    const participant = this.participantRepository.create({
      challengeId,
      userId,
      status: ParticipantStatus.JOINED,
    });

    // Update participant count
    challenge.currentParticipants += 1;
    await this.challengeRepository.save(challenge);

    return this.participantRepository.save(participant);
  }

  async leaveChallenge(challengeId: number, userId: number): Promise<void> {
    const challenge = await this.getSocialChallengeById(challengeId, userId);

    const participant = challenge.participants.find((p) => p.userId === userId);
    if (!participant) {
      throw new BadRequestException(
        'User is not a participant in this challenge'
      );
    }

    if (challenge.creatorId === userId) {
      throw new BadRequestException(
        'Challenge creators cannot leave their challenges'
      );
    }

    await this.participantRepository.remove(participant);

    // Update participant count
    challenge.currentParticipants -= 1;
    await this.challengeRepository.save(challenge);
  }

  async updateParticipantStatus(
    challengeId: number,
    adminUserId: number,
    participantUserId: number,
    updateDto: UpdateParticipantStatusDto
  ): Promise<ChallengeParticipant> {
    const challenge = await this.getSocialChallengeById(
      challengeId,
      adminUserId
    );

    if (challenge.creatorId !== adminUserId) {
      throw new ForbiddenException(
        'Only challenge creators can update participant status'
      );
    }

    const participant = challenge.participants.find(
      (p) => p.userId === participantUserId
    );
    if (!participant) {
      throw new NotFoundException('Participant not found in challenge');
    }

    Object.assign(participant, updateDto);

    // Update status to active if score or progress is provided
    if (
      updateDto.score !== undefined ||
      updateDto.progressPercentage !== undefined
    ) {
      participant.status = ParticipantStatus.ACTIVE;
    }

    return this.participantRepository.save(participant);
  }

  async searchChallenges(
    query: string,
    type?: string,
    difficulty?: string,
    status?: ChallengeStatus
  ): Promise<SocialChallenge[]> {
    const queryBuilder = this.challengeRepository
      .createQueryBuilder('challenge')
      .leftJoinAndSelect('challenge.creator', 'creator')
      .where('challenge.isPublic = :isPublic', { isPublic: true })
      .andWhere('challenge.status != :draft', { draft: ChallengeStatus.DRAFT });

    if (query) {
      queryBuilder.andWhere(
        '(challenge.name ILIKE :query OR challenge.description ILIKE :query)',
        {
          query: `%${query}%`,
        }
      );
    }

    if (type) {
      queryBuilder.andWhere('challenge.type = :type', { type });
    }

    if (difficulty) {
      queryBuilder.andWhere('challenge.difficulty = :difficulty', {
        difficulty,
      });
    }

    if (status) {
      queryBuilder.andWhere('challenge.status = :status', { status });
    }

    return queryBuilder
      .orderBy('challenge.startDate', 'ASC')
      .addOrderBy('challenge.currentParticipants', 'DESC')
      .limit(20)
      .getMany();
  }

  async getChallengeLeaderboard(
    challengeId: number
  ): Promise<ChallengeParticipant[]> {
    const challenge = await this.getSocialChallengeById(challengeId);

    return this.participantRepository.find({
      where: { challengeId },
      relations: ['user'],
      order: { score: 'DESC', progressPercentage: 'DESC' },
    });
  }

  async getChallengeStats(challengeId: number): Promise<any> {
    const challenge = await this.getSocialChallengeById(challengeId);

    const participants = challenge.participants;
    const activeParticipants = participants.filter(
      (p) => p.status === ParticipantStatus.ACTIVE
    );
    const completedParticipants = participants.filter(
      (p) => p.status === ParticipantStatus.COMPLETED
    );

    const averageScore =
      participants.length > 0
        ? participants.reduce((sum, p) => sum + p.score, 0) /
          participants.length
        : 0;

    const averageProgress =
      participants.length > 0
        ? participants.reduce((sum, p) => sum + p.progressPercentage, 0) /
          participants.length
        : 0;

    return {
      totalParticipants: participants.length,
      activeParticipants: activeParticipants.length,
      completedParticipants: completedParticipants.length,
      averageScore: Math.round(averageScore * 100) / 100,
      averageProgress: Math.round(averageProgress * 100) / 100,
      completionRate:
        participants.length > 0
          ? (completedParticipants.length / participants.length) * 100
          : 0,
    };
  }

  async getUserChallengeStats(userId: number): Promise<any> {
    const challenges = await this.getUserChallenges(userId);

    const participatedChallenges = challenges.filter((c) =>
      c.participants.some((p) => p.userId === userId)
    );

    const createdChallenges = challenges.filter((c) => c.creatorId === userId);
    const activeChallenges = challenges.filter(
      (c) => c.status === ChallengeStatus.ACTIVE
    );
    const completedChallenges = challenges.filter(
      (c) => c.status === ChallengeStatus.COMPLETED
    );

    return {
      totalChallenges: challenges.length,
      participatedChallenges: participatedChallenges.length,
      createdChallenges: createdChallenges.length,
      activeChallenges: activeChallenges.length,
      completedChallenges: completedChallenges.length,
      completionRate:
        challenges.length > 0
          ? (completedChallenges.length / challenges.length) * 100
          : 0,
    };
  }
}
