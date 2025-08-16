import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnhancedAiController } from './controllers/enhanced-ai.controller';
import { AiChatService } from './services/ai-chat.service';
import { ImageRecognitionService } from './services/image-recognition.service';
import { VoiceCommandsService } from './services/voice-commands.service';
import { SmartRemindersService } from './services/smart-reminders.service';
import { AiChat, ChatSession } from '../../database/entities/ai-chat.entity';
import { ImageRecognition } from '../../database/entities/image-recognition.entity';
import { VoiceCommand } from '../../database/entities/voice-command.entity';
import { SmartReminder } from '../../database/entities/smart-reminder.entity';
import { User } from '../../database/entities/user.entity';
import { Habit } from '../../database/entities/habit.entity';
import { Goal } from '../../database/entities/goal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiChat,
      ChatSession,
      ImageRecognition,
      VoiceCommand,
      SmartReminder,
      User,
      Habit,
      Goal,
    ]),
  ],
  controllers: [EnhancedAiController],
  providers: [
    AiChatService,
    ImageRecognitionService,
    VoiceCommandsService,
    SmartRemindersService,
  ],
  exports: [
    AiChatService,
    ImageRecognitionService,
    VoiceCommandsService,
    SmartRemindersService,
  ],
})
export class AiEnhancedModule {}
