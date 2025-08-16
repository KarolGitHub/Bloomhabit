import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { VoiceCommand } from '../../../database/entities/voice-command.entity';
import { User } from '../../../database/entities/user.entity';
import { Habit } from '../../../database/entities/habit.entity';
import { Goal } from '../../../database/entities/goal.entity';
import {
  CreateVoiceCommandDto,
  UpdateVoiceCommandDto,
  VoiceCommandDto,
  VoiceCommandResultDto,
  VoiceCommandType,
  VoiceCommandStatus,
  VoiceQuality,
} from '../dto/voice-commands.dto';

@Injectable()
export class VoiceCommandsService {
  constructor(
    @InjectRepository(VoiceCommand)
    private voiceCommandRepository: Repository<VoiceCommand>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Habit)
    private habitRepository: Repository<Habit>,
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>
  ) {}

  async createVoiceCommand(
    userId: string,
    createDto: CreateVoiceCommandDto
  ): Promise<VoiceCommandDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate related entities if provided
    if (createDto.habitId) {
      const habit = await this.habitRepository.findOne({
        where: { id: createDto.habitId },
      });
      if (!habit) {
        throw new NotFoundException('Habit not found');
      }
    }

    if (createDto.goalId) {
      const goal = await this.goalRepository.findOne({
        where: { id: createDto.goalId },
      });
      if (!goal) {
        throw new NotFoundException('Goal not found');
      }
    }

    // Create voice command entry
    const voiceCommand = this.voiceCommandRepository.create({
      id: uuidv4(),
      userId,
      audioUrl: createDto.audioUrl,
      transcript: createDto.transcript,
      commandType: createDto.commandType || VoiceCommandType.GENERAL_QUERY,
      status: VoiceCommandStatus.PENDING,
      habitId: createDto.habitId,
      goalId: createDto.goalId,
      notes: createDto.notes,
      metadata: createDto.metadata,
    });

    const savedCommand = await this.voiceCommandRepository.save(voiceCommand);

    // Process voice command asynchronously
    this.processVoiceCommand(savedCommand.id);

    return this.mapToDto(savedCommand);
  }

  async updateVoiceCommand(
    commandId: string,
    userId: string,
    updateDto: UpdateVoiceCommandDto
  ): Promise<VoiceCommandDto> {
    const command = await this.voiceCommandRepository.findOne({
      where: { id: commandId, userId },
    });

    if (!command) {
      throw new NotFoundException('Voice command not found');
    }

    Object.assign(command, updateDto);
    const updatedCommand = await this.voiceCommandRepository.save(command);

    return this.mapToDto(updatedCommand);
  }

  async getVoiceCommand(
    commandId: string,
    userId: string
  ): Promise<VoiceCommandDto> {
    const command = await this.voiceCommandRepository.findOne({
      where: { id: commandId, userId },
    });

    if (!command) {
      throw new NotFoundException('Voice command not found');
    }

    return this.mapToDto(command);
  }

  async getUserVoiceCommands(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<VoiceCommandDto[]> {
    const commands = await this.voiceCommandRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return commands.map((command) => this.mapToDto(command));
  }

  async deleteVoiceCommand(commandId: string, userId: string): Promise<void> {
    const command = await this.voiceCommandRepository.findOne({
      where: { id: commandId, userId },
    });

    if (!command) {
      throw new NotFoundException('Voice command not found');
    }

    await this.voiceCommandRepository.remove(command);
  }

  async retryVoiceCommand(
    commandId: string,
    userId: string
  ): Promise<VoiceCommandDto> {
    const command = await this.voiceCommandRepository.findOne({
      where: { id: commandId, userId },
    });

    if (!command) {
      throw new NotFoundException('Voice command not found');
    }

    if (command.status === VoiceCommandStatus.PROCESSING) {
      throw new BadRequestException('Voice command is already being processed');
    }

    // Reset status and reprocess
    command.status = VoiceCommandStatus.PENDING;
    command.errorMessage = null;
    await this.voiceCommandRepository.save(command);

    // Reprocess voice command
    this.processVoiceCommand(command.id);

    return this.mapToDto(command);
  }

  async getVoiceCommandStats(userId: string): Promise<{
    total: number;
    completed: number;
    failed: number;
    pending: number;
    processing: number;
  }> {
    const [total, completed, failed, pending, processing] = await Promise.all([
      this.voiceCommandRepository.count({ where: { userId } }),
      this.voiceCommandRepository.count({
        where: { userId, status: VoiceCommandStatus.COMPLETED },
      }),
      this.voiceCommandRepository.count({
        where: { userId, status: VoiceCommandStatus.FAILED },
      }),
      this.voiceCommandRepository.count({
        where: { userId, status: VoiceCommandStatus.PENDING },
      }),
      this.voiceCommandRepository.count({
        where: { userId, status: VoiceCommandStatus.PROCESSING },
      }),
    ]);

    return { total, completed, failed, pending, processing };
  }

  async getVoiceCommandSuggestions(
    userId: string,
    commandType?: VoiceCommandType
  ): Promise<string[]> {
    // Generate contextual suggestions based on command type
    const suggestions = this.generateCommandSuggestions(commandType);
    return suggestions;
  }

  private async processVoiceCommand(commandId: string): Promise<void> {
    try {
      // Update status to processing
      await this.voiceCommandRepository.update(commandId, {
        status: VoiceCommandStatus.PROCESSING,
      });

      // Simulate voice processing delay
      await new Promise((resolve) =>
        setTimeout(resolve, 1500 + Math.random() * 2000)
      );

      // Get the command record
      const command = await this.voiceCommandRepository.findOne({
        where: { id: commandId },
      });
      if (!command) return;

      // Process voice command with AI (mock implementation)
      const result = await this.processVoiceWithAI(
        command.audioUrl,
        command.commandType
      );

      // Update with results
      await this.voiceCommandRepository.update(commandId, {
        status: VoiceCommandStatus.COMPLETED,
        transcript: result.transcript,
        aiInterpretation: result.aiInterpretation,
        extractedEntities: result.extractedEntities,
        confidence: result.confidence,
        voiceQuality: result.voiceQuality,
        suggestedActions: result.suggestedActions,
        processedAt: new Date(),
      });
    } catch (error) {
      // Update with error
      await this.voiceCommandRepository.update(commandId, {
        status: VoiceCommandStatus.FAILED,
        errorMessage: error.message,
        processedAt: new Date(),
      });
    }
  }

  private async processVoiceWithAI(
    audioUrl: string,
    commandType: VoiceCommandType
  ): Promise<{
    transcript: string;
    aiInterpretation: string;
    extractedEntities: string[];
    confidence: number;
    voiceQuality: VoiceQuality;
    suggestedActions: string[];
  }> {
    // Mock voice processing - in real implementation, this would call speech-to-text and NLP APIs
    const mockResults = {
      [VoiceCommandType.HABIT_LOG]: {
        transcript: 'I completed my morning workout today',
        aiInterpretation: 'User logged completion of morning workout habit',
        extractedEntities: ['morning workout', 'completed', 'today'],
        confidence: 0.92,
        voiceQuality: VoiceQuality.EXCELLENT,
        suggestedActions: [
          'Mark workout habit as complete',
          'Add workout duration',
          'Log workout type',
        ],
      },
      [VoiceCommandType.HABIT_CREATE]: {
        transcript: 'Create a new habit for reading books',
        aiInterpretation: 'User wants to create a new reading habit',
        extractedEntities: ['reading', 'books', 'new habit'],
        confidence: 0.89,
        voiceQuality: VoiceQuality.GOOD,
        suggestedActions: [
          'Create reading habit',
          'Set reading goal',
          'Choose reading time',
        ],
      },
      [VoiceCommandType.HABIT_UPDATE]: {
        transcript: 'Update my meditation habit to 20 minutes',
        aiInterpretation: 'User wants to modify meditation habit duration',
        extractedEntities: ['meditation', '20 minutes', 'update'],
        confidence: 0.87,
        voiceQuality: VoiceQuality.GOOD,
        suggestedActions: [
          'Update meditation duration',
          'Modify habit settings',
          'Adjust goal',
        ],
      },
      [VoiceCommandType.GOAL_SET]: {
        transcript: 'Set a goal to run a marathon in 6 months',
        aiInterpretation: 'User wants to set a marathon running goal',
        extractedEntities: ['marathon', '6 months', 'running goal'],
        confidence: 0.94,
        voiceQuality: VoiceQuality.EXCELLENT,
        suggestedActions: [
          'Create marathon goal',
          'Set training schedule',
          'Track progress',
        ],
      },
      [VoiceCommandType.PROGRESS_CHECK]: {
        transcript: 'How am I doing with my fitness goals',
        aiInterpretation: 'User is asking for progress update on fitness goals',
        extractedEntities: ['fitness goals', 'progress', 'check'],
        confidence: 0.91,
        voiceQuality: VoiceQuality.GOOD,
        suggestedActions: [
          'Show fitness progress',
          'Display goal status',
          'Provide insights',
        ],
      },
      [VoiceCommandType.MOTIVATION_REQUEST]: {
        transcript: 'I need some motivation to keep going',
        aiInterpretation: 'User is requesting motivational support',
        extractedEntities: ['motivation', 'keep going', 'support'],
        confidence: 0.88,
        voiceQuality: VoiceQuality.FAIR,
        suggestedActions: [
          'Show motivational quotes',
          'Display achievements',
          'Provide encouragement',
        ],
      },
      [VoiceCommandType.GARDEN_STATUS]: {
        transcript: 'Show me my habit garden status',
        aiInterpretation: 'User wants to see current habit garden overview',
        extractedEntities: ['habit garden', 'status', 'overview'],
        confidence: 0.93,
        voiceQuality: VoiceQuality.EXCELLENT,
        suggestedActions: [
          'Display garden overview',
          'Show habit status',
          'Highlight progress',
        ],
      },
      [VoiceCommandType.GENERAL_QUERY]: {
        transcript: 'What should I focus on today',
        aiInterpretation: 'User is asking for daily focus recommendations',
        extractedEntities: ['focus', 'today', 'recommendations'],
        confidence: 0.86,
        voiceQuality: VoiceQuality.GOOD,
        suggestedActions: [
          'Show daily priorities',
          'Display habit suggestions',
          'Provide focus tips',
        ],
      },
    };

    const result =
      mockResults[commandType] || mockResults[VoiceCommandType.GENERAL_QUERY];

    // Add some randomness to make it more realistic
    result.confidence = Math.max(
      0.7,
      Math.min(0.98, result.confidence + (Math.random() - 0.5) * 0.1)
    );

    return result;
  }

  private generateCommandSuggestions(commandType?: VoiceCommandType): string[] {
    const suggestions = {
      [VoiceCommandType.HABIT_LOG]: [
        'I completed my morning workout',
        'I meditated for 15 minutes',
        'I read 20 pages today',
        'I drank 8 glasses of water',
      ],
      [VoiceCommandType.HABIT_CREATE]: [
        'Create a new habit for reading',
        'Add a meditation habit',
        'Start a workout routine',
        'Begin a journaling habit',
      ],
      [VoiceCommandType.HABIT_UPDATE]: [
        'Update my workout duration',
        'Change my meditation time',
        'Modify my reading goal',
        'Adjust my water intake target',
      ],
      [VoiceCommandType.GOAL_SET]: [
        'Set a goal to run a marathon',
        'Create a weight loss target',
        'Set a reading challenge',
        'Establish a fitness milestone',
      ],
      [VoiceCommandType.PROGRESS_CHECK]: [
        'How am I doing with my goals?',
        'Show me my progress',
        "What's my current status?",
        'Give me a progress update',
      ],
      [VoiceCommandType.MOTIVATION_REQUEST]: [
        'I need motivation',
        'Give me encouragement',
        'Show me my achievements',
        'Help me stay motivated',
      ],
      [VoiceCommandType.GARDEN_STATUS]: [
        'Show my habit garden',
        "What's my garden status?",
        'Display my habit overview',
        'Show garden progress',
      ],
      [VoiceCommandType.GENERAL_QUERY]: [
        'What should I focus on today?',
        'Give me a habit tip',
        "What's my next step?",
        'How can I improve?',
      ],
    };

    return (
      suggestions[commandType] || suggestions[VoiceCommandType.GENERAL_QUERY]
    );
  }

  private mapToDto(command: VoiceCommand): VoiceCommandDto {
    return {
      id: command.id,
      userId: command.userId,
      audioUrl: command.audioUrl,
      transcript: command.transcript,
      commandType: command.commandType,
      status: command.status,
      habitId: command.habitId,
      goalId: command.goalId,
      notes: command.notes,
      aiInterpretation: command.aiInterpretation,
      extractedEntities: command.extractedEntities,
      confidence: command.confidence,
      voiceQuality: command.voiceQuality,
      duration: command.duration,
      language: command.language,
      suggestedActions: command.suggestedActions,
      metadata: command.metadata,
      errorMessage: command.errorMessage,
      createdAt: command.createdAt.toISOString(),
      updatedAt: command.updatedAt.toISOString(),
      processedAt: command.processedAt?.toISOString(),
    };
  }
}
