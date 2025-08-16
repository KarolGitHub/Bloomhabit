import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AiChat, ChatSession } from '../../../database/entities/ai-chat.entity';
import { User } from '../../../database/entities/user.entity';
import { Habit } from '../../../database/entities/habit.entity';
import { Goal } from '../../../database/entities/goal.entity';
import {
  CreateAiChatDto,
  UpdateAiChatDto,
  AiChatDto,
  ChatSessionDto,
  CreateChatSessionDto,
  UpdateChatSessionDto,
  ChatMessageType,
  ChatContextType,
} from '../dto/ai-chat.dto';

@Injectable()
export class AiChatService {
  constructor(
    @InjectRepository(AiChat)
    private aiChatRepository: Repository<AiChat>,
    @InjectRepository(ChatSession)
    private chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Habit)
    private habitRepository: Repository<Habit>,
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>
  ) {}

  async createChat(
    userId: string,
    createChatDto: CreateAiChatDto
  ): Promise<AiChatDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate related entities if provided
    if (createChatDto.habitId) {
      const habit = await this.habitRepository.findOne({
        where: { id: createChatDto.habitId },
      });
      if (!habit) {
        throw new NotFoundException('Habit not found');
      }
    }

    if (createChatDto.goalId) {
      const goal = await this.goalRepository.findOne({
        where: { id: createChatDto.goalId },
      });
      if (!goal) {
        throw new NotFoundException('Goal not found');
      }
    }

    // Create AI chat entry
    const aiChat = this.aiChatRepository.create({
      id: uuidv4(),
      userId,
      message: createChatDto.message,
      messageType: ChatMessageType.USER,
      contextType: createChatDto.contextType || ChatContextType.GENERAL,
      habitId: createChatDto.habitId,
      goalId: createChatDto.goalId,
      metadata: createChatDto.metadata,
    });

    const savedChat = await this.aiChatRepository.save(aiChat);

    // Process with AI and generate response
    const aiResponse = await this.processWithAI(
      createChatDto.message,
      createChatDto.contextType
    );

    // Create AI response entry
    const aiResponseChat = this.aiChatRepository.create({
      id: uuidv4(),
      userId,
      message: aiResponse.message,
      messageType: ChatMessageType.AI,
      contextType: createChatDto.contextType || ChatContextType.GENERAL,
      habitId: createChatDto.habitId,
      goalId: createChatDto.goalId,
      aiResponse: aiResponse.message,
      confidence: aiResponse.confidence,
      suggestions: aiResponse.suggestions,
      metadata: createChatDto.metadata,
    });

    await this.aiChatRepository.save(aiResponseChat);

    return this.mapToDto(savedChat);
  }

  async updateChat(
    chatId: string,
    userId: string,
    updateChatDto: UpdateAiChatDto
  ): Promise<AiChatDto> {
    const chat = await this.aiChatRepository.findOne({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    Object.assign(chat, updateChatDto);
    const updatedChat = await this.aiChatRepository.save(chat);

    return this.mapToDto(updatedChat);
  }

  async getChat(chatId: string, userId: string): Promise<AiChatDto> {
    const chat = await this.aiChatRepository.findOne({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return this.mapToDto(chat);
  }

  async getUserChats(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<AiChatDto[]> {
    const chats = await this.aiChatRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return chats.map((chat) => this.mapToDto(chat));
  }

  async deleteChat(chatId: string, userId: string): Promise<void> {
    const chat = await this.aiChatRepository.findOne({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    await this.aiChatRepository.remove(chat);
  }

  async createChatSession(
    userId: string,
    createSessionDto: CreateChatSessionDto
  ): Promise<ChatSessionDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const session = this.chatSessionRepository.create({
      id: uuidv4(),
      userId,
      title: createSessionDto.title,
      primaryContext: createSessionDto.primaryContext,
      metadata: createSessionDto.metadata,
      lastActivityAt: new Date(),
    });

    const savedSession = await this.chatSessionRepository.save(session);

    return this.mapSessionToDto(savedSession);
  }

  async updateChatSession(
    sessionId: string,
    userId: string,
    updateSessionDto: UpdateChatSessionDto
  ): Promise<ChatSessionDto> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    Object.assign(session, updateSessionDto);
    const updatedSession = await this.chatSessionRepository.save(session);

    return this.mapSessionToDto(updatedSession);
  }

  async getChatSession(
    sessionId: string,
    userId: string
  ): Promise<ChatSessionDto> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId, userId },
      relations: ['messages'],
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    return this.mapSessionToDto(session);
  }

  async getUserChatSessions(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ChatSessionDto[]> {
    const sessions = await this.chatSessionRepository.find({
      where: { userId },
      order: { lastActivityAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return sessions.map((session) => this.mapSessionToDto(session));
  }

  async deleteChatSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    await this.chatSessionRepository.remove(session);
  }

  async getChatSuggestions(
    userId: string,
    contextType?: ChatContextType
  ): Promise<string[]> {
    // Get user's recent chat history for context
    const recentChats = await this.aiChatRepository.find({
      where: { userId, contextType },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    // Generate contextual suggestions based on chat history and context type
    const suggestions = this.generateContextualSuggestions(
      contextType,
      recentChats
    );

    return suggestions;
  }

  private async processWithAI(
    message: string,
    contextType?: ChatContextType
  ): Promise<{
    message: string;
    confidence: number;
    suggestions: string[];
  }> {
    // Mock AI processing - in real implementation, this would call OpenAI or similar
    const responses = {
      [ChatContextType.HABIT_QUESTION]: [
        "Great question! Based on your habit patterns, I'd recommend focusing on consistency over intensity. Start small and build gradually.",
        "That's a common challenge. Try breaking it down into smaller, more manageable steps.",
        'Consider setting up a reminder system and tracking your progress to stay motivated.',
      ],
      [ChatContextType.GARDEN_HELP]: [
        'Your garden is looking wonderful! Remember to water your habits daily to keep them blooming.',
        "I notice some habits might need extra attention. Let's focus on the ones that are struggling.",
        'Great progress! Your garden is flourishing with consistent care.',
      ],
      [ChatContextType.MOTIVATION]: [
        "You're doing amazing! Every small step counts towards your bigger goals.",
        'Remember why you started. You have the power to create lasting change.',
        "Progress isn't always linear, but you're moving forward. Keep going!",
      ],
      [ChatContextType.GOAL_PLANNING]: [
        'Setting SMART goals is key. Make them Specific, Measurable, Achievable, Relevant, and Time-bound.',
        'Break down your big goals into smaller milestones. Celebrate each achievement!',
        'Consider your current habits and how they align with your new goals.',
      ],
      [ChatContextType.GENERAL]: [
        "I'm here to help you on your habit-building journey. What would you like to know?",
        'Great question! Let me help you with that.',
        "I'm excited to support you in building better habits and achieving your goals.",
      ],
    };

    const contextResponses = responses[contextType || ChatContextType.GENERAL];
    const randomResponse =
      contextResponses[Math.floor(Math.random() * contextResponses.length)];

    return {
      message: randomResponse,
      confidence: 0.85 + Math.random() * 0.1, // 0.85-0.95
      suggestions: this.generateSuggestions(contextType),
    };
  }

  private generateContextualSuggestions(
    contextType?: ChatContextType
  ): string[] {
    const suggestions = {
      [ChatContextType.HABIT_QUESTION]: [
        "How can I stay motivated when I don't feel like doing my habit?",
        "What's the best time of day to practice my habit?",
        'How long does it take to form a new habit?',
        'What should I do if I miss a day?',
      ],
      [ChatContextType.GARDEN_HELP]: [
        'Show me my garden progress',
        'Which habits need attention?',
        'How can I improve my garden layout?',
        'What seasonal changes are coming?',
      ],
      [ChatContextType.MOTIVATION]: [
        'Give me a motivational quote',
        'Show me my recent achievements',
        "What's my next milestone?",
        'How am I doing compared to last week?',
      ],
      [ChatContextType.GOAL_PLANNING]: [
        'Help me set a new goal',
        'Review my current goals',
        'Suggest habit changes for my goals',
        "What's my progress timeline?",
      ],
      [ChatContextType.GENERAL]: [
        'How can I build better habits?',
        'Show me my progress',
        'What should I focus on today?',
        'Give me a habit tip',
      ],
    };

    return (
      suggestions[contextType || ChatContextType.GENERAL] ||
      suggestions[ChatContextType.GENERAL]
    );
  }

  private generateSuggestions(contextType?: ChatContextType): string[] {
    return this.generateContextualSuggestions(contextType).slice(0, 3);
  }

  private mapToDto(chat: AiChat): AiChatDto {
    return {
      id: chat.id,
      userId: chat.userId,
      message: chat.message,
      messageType: chat.messageType,
      contextType: chat.contextType,
      habitId: chat.habitId,
      goalId: chat.goalId,
      metadata: chat.metadata,
      aiResponse: chat.aiResponse,
      confidence: chat.confidence,
      suggestions: chat.suggestions,
      isHelpful: chat.isHelpful,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    };
  }

  private mapSessionToDto(session: ChatSession): ChatSessionDto {
    return {
      id: session.id,
      userId: session.userId,
      title: session.title,
      primaryContext: session.primaryContext,
      messages: session.messages?.map((msg) => this.mapToDto(msg)) || [],
      summary: session.summary,
      metadata: session.metadata,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      lastActivityAt: session.lastActivityAt?.toISOString(),
    };
  }
}
