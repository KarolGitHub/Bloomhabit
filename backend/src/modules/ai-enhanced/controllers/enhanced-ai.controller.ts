import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AiChatService } from '../services/ai-chat.service';
import { ImageRecognitionService } from '../services/image-recognition.service';
import { VoiceCommandsService } from '../services/voice-commands.service';
import { SmartRemindersService } from '../services/smart-reminders.service';
import {
  CreateAiChatDto,
  UpdateAiChatDto,
  CreateChatSessionDto,
  UpdateChatSessionDto,
} from '../dto/ai-chat.dto';
import {
  CreateImageRecognitionDto,
  UpdateImageRecognitionDto,
} from '../dto/image-recognition.dto';
import {
  CreateVoiceCommandDto,
  UpdateVoiceCommandDto,
} from '../dto/voice-commands.dto';
import {
  CreateSmartReminderDto,
  UpdateSmartReminderDto,
} from '../dto/smart-reminders.dto';

@Controller('ai-enhanced')
@UseGuards(JwtAuthGuard)
export class EnhancedAiController {
  constructor(
    private readonly aiChatService: AiChatService,
    private readonly imageRecognitionService: ImageRecognitionService,
    private readonly voiceCommandsService: VoiceCommandsService,
    private readonly smartRemindersService: SmartRemindersService
  ) {}

  // ===== AI CHAT ENDPOINTS =====

  @Post('chat')
  async createChat(@Request() req, @Body() createChatDto: CreateAiChatDto) {
    return this.aiChatService.createChat(req.user.id, createChatDto);
  }

  @Put('chat/:id')
  async updateChat(
    @Param('id') id: string,
    @Request() req,
    @Body() updateChatDto: UpdateAiChatDto
  ) {
    return this.aiChatService.updateChat(id, req.user.id, updateChatDto);
  }

  @Get('chat/:id')
  async getChat(@Param('id') id: string, @Request() req) {
    return this.aiChatService.getChat(id, req.user.id);
  }

  @Get('chat')
  async getUserChats(
    @Request() req,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.aiChatService.getUserChats(req.user.id, limit, offset);
  }

  @Delete('chat/:id')
  async deleteChat(@Param('id') id: string, @Request() req) {
    return this.aiChatService.deleteChat(id, req.user.id);
  }

  @Post('chat/sessions')
  async createChatSession(
    @Request() req,
    @Body() createSessionDto: CreateChatSessionDto
  ) {
    return this.aiChatService.createChatSession(req.user.id, createSessionDto);
  }

  @Put('chat/sessions/:id')
  async updateChatSession(
    @Param('id') id: string,
    @Request() req,
    @Body() updateSessionDto: UpdateChatSessionDto
  ) {
    return this.aiChatService.updateChatSession(
      id,
      req.user.id,
      updateSessionDto
    );
  }

  @Get('chat/sessions/:id')
  async getChatSession(@Param('id') id: string, @Request() req) {
    return this.aiChatService.getChatSession(id, req.user.id);
  }

  @Get('chat/sessions')
  async getUserChatSessions(
    @Request() req,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0
  ) {
    return this.aiChatService.getUserChatSessions(req.user.id, limit, offset);
  }

  @Delete('chat/sessions/:id')
  async deleteChatSession(@Param('id') id: string, @Request() req) {
    return this.aiChatService.deleteChatSession(id, req.user.id);
  }

  @Get('chat/suggestions')
  async getChatSuggestions(
    @Request() req,
    @Query('contextType') contextType?: string
  ) {
    return this.aiChatService.getChatSuggestions(req.user.id, contextType);
  }

  // ===== IMAGE RECOGNITION ENDPOINTS =====

  @Post('image-recognition')
  async createImageRecognition(
    @Request() req,
    @Body() createDto: CreateImageRecognitionDto
  ) {
    return this.imageRecognitionService.createImageRecognition(
      req.user.id,
      createDto
    );
  }

  @Put('image-recognition/:id')
  async updateImageRecognition(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDto: UpdateImageRecognitionDto
  ) {
    return this.imageRecognitionService.updateImageRecognition(
      id,
      req.user.id,
      updateDto
    );
  }

  @Get('image-recognition/:id')
  async getImageRecognition(@Param('id') id: string, @Request() req) {
    return this.imageRecognitionService.getImageRecognition(id, req.user.id);
  }

  @Get('image-recognition')
  async getUserImageRecognitions(
    @Request() req,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.imageRecognitionService.getUserImageRecognitions(
      req.user.id,
      limit,
      offset
    );
  }

  @Delete('image-recognition/:id')
  async deleteImageRecognition(@Param('id') id: string, @Request() req) {
    return this.imageRecognitionService.deleteImageRecognition(id, req.user.id);
  }

  @Post('image-recognition/:id/retry')
  async retryImageRecognition(@Param('id') id: string, @Request() req) {
    return this.imageRecognitionService.retryImageRecognition(id, req.user.id);
  }

  @Get('image-recognition/stats')
  async getImageRecognitionStats(@Request() req) {
    return this.imageRecognitionService.getImageRecognitionStats(req.user.id);
  }

  // ===== VOICE COMMANDS ENDPOINTS =====

  @Post('voice-commands')
  async createVoiceCommand(
    @Request() req,
    @Body() createDto: CreateVoiceCommandDto
  ) {
    return this.voiceCommandsService.createVoiceCommand(req.user.id, createDto);
  }

  @Put('voice-commands/:id')
  async updateVoiceCommand(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDto: UpdateVoiceCommandDto
  ) {
    return this.voiceCommandsService.updateVoiceCommand(
      id,
      req.user.id,
      updateDto
    );
  }

  @Get('voice-commands/:id')
  async getVoiceCommand(@Param('id') id: string, @Request() req) {
    return this.voiceCommandsService.getVoiceCommand(id, req.user.id);
  }

  @Get('voice-commands')
  async getUserVoiceCommands(
    @Request() req,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.voiceCommandsService.getUserVoiceCommands(
      req.user.id,
      limit,
      offset
    );
  }

  @Delete('voice-commands/:id')
  async deleteVoiceCommand(@Param('id') id: string, @Request() req) {
    return this.voiceCommandsService.deleteVoiceCommand(id, req.user.id);
  }

  @Post('voice-commands/:id/retry')
  async retryVoiceCommand(@Param('id') id: string, @Request() req) {
    return this.voiceCommandsService.retryVoiceCommand(id, req.user.id);
  }

  @Get('voice-commands/stats')
  async getVoiceCommandStats(@Request() req) {
    return this.voiceCommandsService.getVoiceCommandStats(req.user.id);
  }

  @Get('voice-commands/suggestions')
  async getVoiceCommandSuggestions(
    @Request() req,
    @Query('commandType') commandType?: string
  ) {
    return this.voiceCommandsService.getVoiceCommandSuggestions(
      req.user.id,
      commandType
    );
  }

  // ===== SMART REMINDERS ENDPOINTS =====

  @Post('smart-reminders')
  async createSmartReminder(
    @Request() req,
    @Body() createDto: CreateSmartReminderDto
  ) {
    return this.smartRemindersService.createSmartReminder(
      req.user.id,
      createDto
    );
  }

  @Put('smart-reminders/:id')
  async updateSmartReminder(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDto: UpdateSmartReminderDto
  ) {
    return this.smartRemindersService.updateSmartReminder(
      id,
      req.user.id,
      updateDto
    );
  }

  @Get('smart-reminders/:id')
  async getSmartReminder(@Param('id') id: string, @Request() req) {
    return this.smartRemindersService.getSmartReminder(id, req.user.id);
  }

  @Get('smart-reminders')
  async getUserSmartReminders(
    @Request() req,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.smartRemindersService.getUserSmartReminders(
      req.user.id,
      limit,
      offset
    );
  }

  @Delete('smart-reminders/:id')
  async deleteSmartReminder(@Param('id') id: string, @Request() req) {
    return this.smartRemindersService.deleteSmartReminder(id, req.user.id);
  }

  @Post('smart-reminders/:id/cancel')
  async cancelSmartReminder(@Param('id') id: string, @Request() req) {
    return this.smartRemindersService.cancelSmartReminder(id, req.user.id);
  }

  @Post('smart-reminders/:id/retry')
  async retrySmartReminder(@Param('id') id: string, @Request() req) {
    return this.smartRemindersService.retrySmartReminder(id, req.user.id);
  }

  @Get('smart-reminders/stats')
  async getSmartReminderStats(@Request() req) {
    return this.smartRemindersService.getSmartReminderStats(req.user.id);
  }

  @Get('smart-reminders/upcoming')
  async getUpcomingReminders(
    @Request() req,
    @Query('hours') hours: number = 24
  ) {
    return this.smartRemindersService.getUpcomingReminders(req.user.id, hours);
  }

  // ===== DASHBOARD ENDPOINTS =====

  @Get('dashboard')
  async getEnhancedAiDashboard(@Request() req) {
    const [chatStats, imageStats, voiceStats, reminderStats] =
      await Promise.all([
        this.aiChatService.getUserChats(req.user.id, 5, 0),
        this.imageRecognitionService.getImageRecognitionStats(req.user.id),
        this.voiceCommandsService.getVoiceCommandStats(req.user.id),
        this.smartRemindersService.getSmartReminderStats(req.user.id),
      ]);

    const [recentChats, recentImages, recentVoiceCommands, upcomingReminders] =
      await Promise.all([
        this.aiChatService.getUserChats(req.user.id, 3, 0),
        this.imageRecognitionService.getUserImageRecognitions(
          req.user.id,
          3,
          0
        ),
        this.voiceCommandsService.getUserVoiceCommands(req.user.id, 3, 0),
        this.smartRemindersService.getUpcomingReminders(req.user.id, 24),
      ]);

    return {
      overview: {
        totalChats: chatStats.length,
        totalImages: imageStats.total,
        totalVoiceCommands: voiceStats.total,
        totalReminders: reminderStats.total,
      },
      recentActivity: {
        chats: recentChats,
        images: recentImages,
        voiceCommands: recentVoiceCommands,
        reminders: upcomingReminders,
      },
      stats: {
        imageRecognition: imageStats,
        voiceCommands: voiceStats,
        smartReminders: reminderStats,
      },
    };
  }

  // ===== FILE UPLOAD ENDPOINTS =====

  @Post('upload/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif)' }),
        ],
      })
    )
    file: Express.Multer.File,
    @Body() metadata: any
  ) {
    // In a real implementation, you would upload to cloud storage and return the URL
    const imageUrl = `https://example.com/uploads/${file.filename}`;

    return {
      success: true,
      imageUrl,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      metadata,
    };
  }

  @Post('upload/audio')
  @UseInterceptors(FileInterceptor('audio'))
  async uploadAudio(
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
          new FileTypeValidator({ fileType: '.(mp3|wav|m4a|ogg)' }),
        ],
      })
    )
    file: Express.Multer.File,
    @Body() metadata: any
  ) {
    // In a real implementation, you would upload to cloud storage and return the URL
    const audioUrl = `https://example.com/uploads/${file.filename}`;

    return {
      success: true,
      audioUrl,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      metadata,
    };
  }
}
