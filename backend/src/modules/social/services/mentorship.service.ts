import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Mentorship,
  MentorshipSession,
  MentorshipStatus,
  MentorshipType,
} from '../../../database/entities/mentorship.entity';
import { User } from '../../../database/entities/user.entity';
import {
  CreateMentorshipDto,
  UpdateMentorshipDto,
  CreateMentorshipSessionDto,
  UpdateMentorshipSessionDto,
} from '../dto/mentorship.dto';

@Injectable()
export class MentorshipService {
  constructor(
    @InjectRepository(Mentorship)
    private mentorshipRepository: Repository<Mentorship>,
    @InjectRepository(MentorshipSession)
    private sessionRepository: Repository<MentorshipSession>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createMentorship(
    userId: number,
    createDto: CreateMentorshipDto
  ): Promise<Mentorship> {
    // Check if mentorship already exists between these users
    const existingMentorship = await this.mentorshipRepository.findOne({
      where: [
        { mentorId: createDto.mentorId, menteeId: userId },
        { mentorId: userId, menteeId: createDto.mentorId },
      ],
    });

    if (existingMentorship) {
      throw new BadRequestException(
        'Mentorship relationship already exists between these users'
      );
    }

    // Check if user is trying to mentor themselves
    if (createDto.mentorId === userId) {
      throw new BadRequestException('Users cannot mentor themselves');
    }

    // Verify mentor exists
    const mentor = await this.userRepository.findOne({
      where: { id: createDto.mentorId },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    const mentorship = this.mentorshipRepository.create({
      ...createDto,
      menteeId: userId,
      status: MentorshipStatus.PENDING,
    });

    return this.mentorshipRepository.save(mentorship);
  }

  async getUserMentorships(userId: number): Promise<Mentorship[]> {
    return this.mentorshipRepository.find({
      where: [{ mentorId: userId }, { menteeId: userId }],
      relations: ['mentor', 'mentee', 'sessions'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getMentorshipById(
    mentorshipId: number,
    userId: number
  ): Promise<Mentorship> {
    const mentorship = await this.mentorshipRepository.findOne({
      where: { id: mentorshipId },
      relations: ['mentor', 'mentee', 'sessions'],
    });

    if (!mentorship) {
      throw new NotFoundException('Mentorship not found');
    }

    // Check if user is part of this mentorship
    if (mentorship.mentorId !== userId && mentorship.menteeId !== userId) {
      throw new ForbiddenException('Access denied to mentorship');
    }

    return mentorship;
  }

  async updateMentorship(
    mentorshipId: number,
    userId: number,
    updateDto: UpdateMentorshipDto
  ): Promise<Mentorship> {
    const mentorship = await this.getMentorshipById(mentorshipId, userId);

    // Only mentee can update certain fields, mentor can update status
    if (mentorship.menteeId === userId) {
      // Mentee can update description, goals, expectations, schedule
      const allowedFields = [
        'description',
        'goals',
        'expectations',
        'schedule',
      ];
      Object.keys(updateDto).forEach((key) => {
        if (!allowedFields.includes(key)) {
          delete updateDto[key];
        }
      });
    } else if (mentorship.mentorId === userId) {
      // Mentor can only update status
      const allowedFields = ['status'];
      Object.keys(updateDto).forEach((key) => {
        if (!allowedFields.includes(key)) {
          delete updateDto[key];
        }
      });
    }

    Object.assign(mentorship, updateDto);
    return this.mentorshipRepository.save(mentorship);
  }

  async deleteMentorship(mentorshipId: number, userId: number): Promise<void> {
    const mentorship = await this.getMentorshipById(mentorshipId, userId);

    // Only mentee can delete pending mentorship, both can cancel active ones
    if (
      mentorship.status === MentorshipStatus.PENDING &&
      mentorship.menteeId !== userId
    ) {
      throw new ForbiddenException('Only mentee can delete pending mentorship');
    }

    await this.mentorshipRepository.remove(mentorship);
  }

  async acceptMentorship(
    mentorshipId: number,
    mentorId: number
  ): Promise<Mentorship> {
    const mentorship = await this.mentorshipRepository.findOne({
      where: { id: mentorshipId, mentorId },
    });

    if (!mentorship) {
      throw new NotFoundException('Mentorship not found');
    }

    if (mentorship.status !== MentorshipStatus.PENDING) {
      throw new BadRequestException('Mentorship is not pending');
    }

    mentorship.status = MentorshipStatus.ACTIVE;
    mentorship.startDate = new Date();

    return this.mentorshipRepository.save(mentorship);
  }

  async rejectMentorship(
    mentorshipId: number,
    mentorId: number
  ): Promise<Mentorship> {
    const mentorship = await this.mentorshipRepository.findOne({
      where: { id: mentorshipId, mentorId },
    });

    if (!mentorship) {
      throw new NotFoundException('Mentorship not found');
    }

    if (mentorship.status !== MentorshipStatus.PENDING) {
      throw new BadRequestException('Mentorship is not pending');
    }

    mentorship.status = MentorshipStatus.REJECTED;

    return this.mentorshipRepository.save(mentorship);
  }

  async completeMentorship(
    mentorshipId: number,
    userId: number
  ): Promise<Mentorship> {
    const mentorship = await this.getMentorshipById(mentorshipId, userId);

    if (mentorship.status !== MentorshipStatus.ACTIVE) {
      throw new BadRequestException('Only active mentorships can be completed');
    }

    mentorship.status = MentorshipStatus.COMPLETED;
    mentorship.endDate = new Date();

    return this.mentorshipRepository.save(mentorship);
  }

  async createMentorshipSession(
    userId: number,
    createDto: CreateMentorshipSessionDto
  ): Promise<MentorshipSession> {
    const mentorship = await this.getMentorshipById(
      createDto.mentorshipId,
      userId
    );

    if (mentorship.status !== MentorshipStatus.ACTIVE) {
      throw new BadRequestException(
        'Sessions can only be created for active mentorships'
      );
    }

    // Check if user is the mentor
    if (mentorship.mentorId !== userId) {
      throw new ForbiddenException('Only mentors can create sessions');
    }

    const session = this.sessionRepository.create({
      ...createDto,
      mentorId: mentorship.mentorId,
      menteeId: mentorship.menteeId,
    });

    return this.sessionRepository.save(session);
  }

  async updateMentorshipSession(
    sessionId: number,
    userId: number,
    updateDto: UpdateMentorshipSessionDto
  ): Promise<MentorshipSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['mentorship'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check if user is part of the mentorship
    if (session.mentorId !== userId && session.menteeId !== userId) {
      throw new ForbiddenException('Access denied to session');
    }

    Object.assign(session, updateDto);
    return this.sessionRepository.save(session);
  }

  async deleteMentorshipSession(
    sessionId: number,
    userId: number
  ): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['mentorship'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Only mentor can delete sessions
    if (session.mentorId !== userId) {
      throw new ForbiddenException('Only mentors can delete sessions');
    }

    await this.sessionRepository.remove(session);
  }

  async getMentorshipSessions(
    mentorshipId: number,
    userId: number
  ): Promise<MentorshipSession[]> {
    const mentorship = await this.getMentorshipById(mentorshipId, userId);

    return this.sessionRepository.find({
      where: { mentorshipId },
      order: { scheduledAt: 'ASC' },
    });
  }

  async searchMentors(
    query: string,
    type?: MentorshipType,
    level?: string
  ): Promise<User[]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.isActive = :isActive', { isActive: true });

    if (query) {
      queryBuilder.andWhere(
        '(user.username ILIKE :query OR user.bio ILIKE :query)',
        {
          query: `%${query}%`,
        }
      );
    }

    if (type) {
      // This would need to be implemented based on user profile/mentorship preferences
      // For now, we'll return all users matching the basic criteria
    }

    if (level) {
      // This would need to be implemented based on user profile/mentorship preferences
      // For now, we'll return all users matching the basic criteria
    }

    return queryBuilder.orderBy('user.username', 'ASC').limit(20).getMany();
  }

  async getMentorshipStats(userId: number): Promise<any> {
    const mentorships = await this.getUserMentorships(userId);

    const activeMentorships = mentorships.filter(
      (m) => m.status === MentorshipStatus.ACTIVE
    );
    const completedMentorships = mentorships.filter(
      (m) => m.status === MentorshipStatus.COMPLETED
    );
    const pendingMentorships = mentorships.filter(
      (m) => m.status === MentorshipStatus.PENDING
    );

    const totalSessions = mentorships.reduce(
      (total, m) => total + (m.sessions?.length || 0),
      0
    );

    return {
      totalMentorships: mentorships.length,
      activeMentorships: activeMentorships.length,
      completedMentorships: completedMentorships.length,
      pendingMentorships: pendingMentorships.length,
      totalSessions,
      completionRate:
        mentorships.length > 0
          ? (completedMentorships.length / mentorships.length) * 100
          : 0,
    };
  }
}
