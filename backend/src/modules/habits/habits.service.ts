import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Habit } from '../../database/entities/habit.entity';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(Habit)
    private readonly habitRepository: Repository<Habit>
  ) {}

  async create(createHabitDto: CreateHabitDto, userId: number): Promise<Habit> {
    const habit = this.habitRepository.create({
      ...createHabitDto,
      userId,
      startDate: new Date(),
      isActive: true,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      growthStage: 0,
      healthPoints: 100,
      waterLevel: 100,
    });

    return this.habitRepository.save(habit);
  }

  async findAll(userId: number): Promise<Habit[]> {
    return this.habitRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Habit> {
    const habit = await this.habitRepository.findOne({
      where: { id, userId },
    });

    if (!habit) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }

    return habit;
  }

  async update(
    id: number,
    updateHabitDto: UpdateHabitDto,
    userId: number
  ): Promise<Habit> {
    const habit = await this.findOne(id, userId);
    Object.assign(habit, updateHabitDto);
    return this.habitRepository.save(habit);
  }

  async remove(id: number, userId: number): Promise<void> {
    const habit = await this.findOne(id, userId);
    await this.habitRepository.remove(habit);
  }
}
