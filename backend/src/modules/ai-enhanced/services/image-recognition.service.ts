import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ImageRecognition } from '../../../database/entities/image-recognition.entity';
import { User } from '../../../database/entities/user.entity';
import { Habit } from '../../../database/entities/habit.entity';
import { Goal } from '../../../database/entities/goal.entity';
import {
  CreateImageRecognitionDto,
  UpdateImageRecognitionDto,
  ImageRecognitionDto,
  ImageAnalysisResultDto,
  ImageType,
  RecognitionStatus,
  RecognitionConfidence,
} from '../dto/image-recognition.dto';

@Injectable()
export class ImageRecognitionService {
  constructor(
    @InjectRepository(ImageRecognition)
    private imageRecognitionRepository: Repository<ImageRecognition>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Habit)
    private habitRepository: Repository<Habit>,
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>
  ) {}

  async createImageRecognition(
    userId: string,
    createDto: CreateImageRecognitionDto
  ): Promise<ImageRecognitionDto> {
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

    // Create image recognition entry
    const imageRecognition = this.imageRecognitionRepository.create({
      id: uuidv4(),
      userId,
      imageUrl: createDto.imageUrl,
      imageType: createDto.imageType || ImageType.GENERAL,
      status: RecognitionStatus.PENDING,
      habitId: createDto.habitId,
      goalId: createDto.goalId,
      description: createDto.description,
      metadata: createDto.metadata,
    });

    const savedRecognition =
      await this.imageRecognitionRepository.save(imageRecognition);

    // Process image asynchronously
    this.processImageRecognition(savedRecognition.id);

    return this.mapToDto(savedRecognition);
  }

  async updateImageRecognition(
    recognitionId: string,
    userId: string,
    updateDto: UpdateImageRecognitionDto
  ): Promise<ImageRecognitionDto> {
    const recognition = await this.imageRecognitionRepository.findOne({
      where: { id: recognitionId, userId },
    });

    if (!recognition) {
      throw new NotFoundException('Image recognition not found');
    }

    Object.assign(recognition, updateDto);
    const updatedRecognition =
      await this.imageRecognitionRepository.save(recognition);

    return this.mapToDto(updatedRecognition);
  }

  async getImageRecognition(
    recognitionId: string,
    userId: string
  ): Promise<ImageRecognitionDto> {
    const recognition = await this.imageRecognitionRepository.findOne({
      where: { id: recognitionId, userId },
    });

    if (!recognition) {
      throw new NotFoundException('Image recognition not found');
    }

    return this.mapToDto(recognition);
  }

  async getUserImageRecognitions(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ImageRecognitionDto[]> {
    const recognitions = await this.imageRecognitionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return recognitions.map((recognition) => this.mapToDto(recognition));
  }

  async deleteImageRecognition(
    recognitionId: string,
    userId: string
  ): Promise<void> {
    const recognition = await this.imageRecognitionRepository.findOne({
      where: { id: recognitionId, userId },
    });

    if (!recognition) {
      throw new NotFoundException('Image recognition not found');
    }

    await this.imageRecognitionRepository.remove(recognition);
  }

  async retryImageRecognition(
    recognitionId: string,
    userId: string
  ): Promise<ImageRecognitionDto> {
    const recognition = await this.imageRecognitionRepository.findOne({
      where: { id: recognitionId, userId },
    });

    if (!recognition) {
      throw new NotFoundException('Image recognition not found');
    }

    if (recognition.status === RecognitionStatus.PROCESSING) {
      throw new BadRequestException(
        'Image recognition is already being processed'
      );
    }

    // Reset status and reprocess
    recognition.status = RecognitionStatus.PENDING;
    recognition.errorMessage = null;
    await this.imageRecognitionRepository.save(recognition);

    // Reprocess image
    this.processImageRecognition(recognition.id);

    return this.mapToDto(recognition);
  }

  async getImageRecognitionStats(userId: string): Promise<{
    total: number;
    completed: number;
    failed: number;
    pending: number;
    processing: number;
  }> {
    const [total, completed, failed, pending, processing] = await Promise.all([
      this.imageRecognitionRepository.count({ where: { userId } }),
      this.imageRecognitionRepository.count({
        where: { userId, status: RecognitionStatus.COMPLETED },
      }),
      this.imageRecognitionRepository.count({
        where: { userId, status: RecognitionStatus.FAILED },
      }),
      this.imageRecognitionRepository.count({
        where: { userId, status: RecognitionStatus.PENDING },
      }),
      this.imageRecognitionRepository.count({
        where: { userId, status: RecognitionStatus.PROCESSING },
      }),
    ]);

    return { total, completed, failed, pending, processing };
  }

  private async processImageRecognition(recognitionId: string): Promise<void> {
    try {
      // Update status to processing
      await this.imageRecognitionRepository.update(recognitionId, {
        status: RecognitionStatus.PROCESSING,
      });

      // Simulate AI processing delay
      await new Promise((resolve) =>
        setTimeout(resolve, 2000 + Math.random() * 3000)
      );

      // Get the recognition record
      const recognition = await this.imageRecognitionRepository.findOne({
        where: { id: recognitionId },
      });
      if (!recognition) return;

      // Process image with AI (mock implementation)
      const analysisResult = await this.analyzeImageWithAI(
        recognition.imageUrl,
        recognition.imageType
      );

      // Update with results
      await this.imageRecognitionRepository.update(recognitionId, {
        status: RecognitionStatus.COMPLETED,
        aiAnalysis: analysisResult.aiAnalysis,
        detectedObjects: analysisResult.detectedObjects,
        detectedActivities: analysisResult.detectedActivities,
        detectedEmotions: analysisResult.detectedEmotions,
        confidence: analysisResult.confidence,
        confidenceLevel: analysisResult.confidenceLevel,
        tags: analysisResult.tags,
        processedAt: new Date(),
      });
    } catch (error) {
      // Update with error
      await this.imageRecognitionRepository.update(recognitionId, {
        status: RecognitionStatus.FAILED,
        errorMessage: error.message,
        processedAt: new Date(),
      });
    }
  }

  private async analyzeImageWithAI(
    imageUrl: string,
    imageType: ImageType
  ): Promise<{
    aiAnalysis: string;
    detectedObjects: string[];
    detectedActivities: string[];
    detectedEmotions: string[];
    confidence: number;
    confidenceLevel: RecognitionConfidence;
    tags: Array<{ name: string; confidence: number }>;
  }> {
    // Mock AI analysis - in real implementation, this would call computer vision APIs
    const mockAnalyses = {
      [ImageType.HABIT_COMPLETION]: {
        aiAnalysis:
          "Great job! I can see you've completed your workout habit. The image shows exercise equipment and workout attire, indicating a successful fitness session.",
        detectedObjects: [
          'dumbbells',
          'yoga mat',
          'water bottle',
          'workout clothes',
        ],
        detectedActivities: ['exercise', 'workout', 'fitness training'],
        detectedEmotions: ['determined', 'accomplished', 'energized'],
        confidence: 0.92,
        confidenceLevel: RecognitionConfidence.HIGH,
        tags: [
          { name: 'workout', confidence: 0.95 },
          { name: 'fitness', confidence: 0.93 },
          { name: 'exercise', confidence: 0.91 },
          { name: 'health', confidence: 0.89 },
        ],
      },
      [ImageType.PROGRESS_PHOTO]: {
        aiAnalysis:
          'Excellent progress! This before/after comparison shows clear improvements in your physical transformation journey. Keep up the consistent effort!',
        detectedObjects: [
          'progress chart',
          'measurement tools',
          'before/after photos',
        ],
        detectedActivities: [
          'progress tracking',
          'measurement',
          'documentation',
        ],
        detectedEmotions: ['proud', 'motivated', 'satisfied'],
        confidence: 0.88,
        confidenceLevel: RecognitionConfidence.HIGH,
        tags: [
          { name: 'progress', confidence: 0.94 },
          { name: 'transformation', confidence: 0.91 },
          { name: 'results', confidence: 0.89 },
          { name: 'achievement', confidence: 0.87 },
        ],
      },
      [ImageType.GARDEN_UPDATE]: {
        aiAnalysis:
          'Your habit garden is flourishing! I can see healthy plants and organized spaces, indicating consistent care and attention to your habits.',
        detectedObjects: [
          'plants',
          'garden tools',
          'organized space',
          'growth indicators',
        ],
        detectedActivities: ['gardening', 'plant care', 'organization'],
        detectedEmotions: ['peaceful', 'accomplished', 'nurturing'],
        confidence: 0.85,
        confidenceLevel: RecognitionConfidence.MEDIUM,
        tags: [
          { name: 'garden', confidence: 0.92 },
          { name: 'plants', confidence: 0.89 },
          { name: 'growth', confidence: 0.86 },
          { name: 'care', confidence: 0.84 },
        ],
      },
      [ImageType.WORKOUT_ACTIVITY]: {
        aiAnalysis:
          "Active workout session detected! The image shows exercise equipment and movement, suggesting you're maintaining your fitness routine.",
        detectedObjects: [
          'exercise equipment',
          'sports gear',
          'fitness accessories',
        ],
        detectedActivities: ['working out', 'training', 'physical activity'],
        detectedEmotions: ['energized', 'focused', 'determined'],
        confidence: 0.9,
        confidenceLevel: RecognitionConfidence.HIGH,
        tags: [
          { name: 'workout', confidence: 0.93 },
          { name: 'fitness', confidence: 0.91 },
          { name: 'training', confidence: 0.88 },
          { name: 'activity', confidence: 0.86 },
        ],
      },
      [ImageType.MEAL_TRACKING]: {
        aiAnalysis:
          'Healthy meal preparation detected! The image shows nutritious food items and meal planning, indicating good nutrition habits.',
        detectedObjects: [
          'healthy food',
          'meal prep containers',
          'ingredients',
          'cooking tools',
        ],
        detectedActivities: [
          'meal preparation',
          'cooking',
          'nutrition planning',
        ],
        detectedEmotions: ['satisfied', 'organized', 'health-conscious'],
        confidence: 0.87,
        confidenceLevel: RecognitionConfidence.MEDIUM,
        tags: [
          { name: 'nutrition', confidence: 0.91 },
          { name: 'meal prep', confidence: 0.89 },
          { name: 'healthy eating', confidence: 0.87 },
          { name: 'cooking', confidence: 0.85 },
        ],
      },
      [ImageType.GENERAL]: {
        aiAnalysis:
          'Image analyzed successfully! I can see various elements that might be related to your habits and goals. Consider adding more context for better analysis.',
        detectedObjects: ['general objects', 'environmental elements'],
        detectedActivities: ['daily activities', 'routine tasks'],
        detectedEmotions: ['neutral', 'focused'],
        confidence: 0.75,
        confidenceLevel: RecognitionConfidence.MEDIUM,
        tags: [
          { name: 'general', confidence: 0.8 },
          { name: 'daily', confidence: 0.76 },
          { name: 'routine', confidence: 0.73 },
        ],
      },
    };

    const analysis = mockAnalyses[imageType] || mockAnalyses[ImageType.GENERAL];

    // Add some randomness to make it more realistic
    analysis.confidence = Math.max(
      0.7,
      Math.min(0.98, analysis.confidence + (Math.random() - 0.5) * 0.1)
    );

    return analysis;
  }

  private mapToDto(recognition: ImageRecognition): ImageRecognitionDto {
    return {
      id: recognition.id,
      userId: recognition.userId,
      imageUrl: recognition.imageUrl,
      imageType: recognition.imageType,
      status: recognition.status,
      habitId: recognition.habitId,
      goalId: recognition.goalId,
      description: recognition.description,
      aiAnalysis: recognition.aiAnalysis,
      detectedObjects: recognition.detectedObjects,
      detectedActivities: recognition.detectedActivities,
      detectedEmotions: recognition.detectedEmotions,
      confidence: recognition.confidence,
      confidenceLevel: recognition.confidenceLevel,
      tags: recognition.tags,
      metadata: recognition.metadata,
      errorMessage: recognition.errorMessage,
      createdAt: recognition.createdAt.toISOString(),
      updatedAt: recognition.updatedAt.toISOString(),
      processedAt: recognition.processedAt?.toISOString(),
    };
  }
}
