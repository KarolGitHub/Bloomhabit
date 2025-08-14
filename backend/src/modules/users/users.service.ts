import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: [
        'id',
        'email',
        'username',
        'firstName',
        'lastName',
        'role',
        'createdAt',
      ],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: id as any }, // TypeORM expects string | FindOperator<string>
      relations: ['habits', 'habitLogs'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { oauthProviderId: googleId, oauthProvider: 'google' },
    });
  }

  async findByGithubId(githubId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { oauthProviderId: githubId, oauthProvider: 'github' },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being changed and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email is already taken');
      }
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.usersRepository.update(id, { lastLoginAt: new Date() });
  }

  async updatePreferences(id: number, preferences: any): Promise<User> {
    // Since User entity doesn't have preferences property, we'll skip this for now
    // This could be implemented as a separate table or JSON column in the future
    throw new Error('Preferences not implemented yet');
  }

  async getGardenStats(id: number): Promise<{
    totalHabits: number;
    activeHabits: number;
    totalStreak: number;
  }> {
    const user = await this.findOne(id);

    const totalHabits = user.habits?.length || 0;
    const activeHabits = user.habits?.filter((h) => h.isActive).length || 0;

    // Calculate total streak from habit logs
    let totalStreak = 0;
    if (user.habitLogs) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const habit of user.habits || []) {
        const habitLogs = user.habitLogs.filter(
          (log) => log.habitId === habit.id && log.date >= today
        );

        if (habitLogs.length > 0) {
          const sortedLogs = habitLogs.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          let currentStreak = 0;
          for (const log of sortedLogs) {
            if (log.status === 'completed') {
              currentStreak++;
            } else {
              break;
            }
          }
          totalStreak += currentStreak;
        }
      }
    }

    return {
      totalHabits,
      activeHabits,
      totalStreak,
    };
  }
}
