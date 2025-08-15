import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  IsDateString,
} from 'class-validator';

export enum PredictionConfidence {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum PredictionType {
  SUCCESS_RATE = 'success_rate',
  STREAK_LENGTH = 'streak_length',
  COMPLETION_TIME = 'completion_time',
  HABIT_FORMATION = 'habit_formation',
  RELAPSE_RISK = 'relapse_risk',
}

export class HabitPredictionDto {
  @ApiProperty({
    description: 'ID of the habit',
    example: 1,
  })
  @IsNumber()
  habitId: number;

  @ApiProperty({
    description: 'Name of the habit',
    example: 'Morning Exercise',
  })
  @IsString()
  habitName: string;

  @ApiProperty({
    description: 'Type of prediction',
    enum: PredictionType,
    example: PredictionType.SUCCESS_RATE,
  })
  @IsEnum(PredictionType)
  predictionType: PredictionType;

  @ApiProperty({
    description: 'Predicted value',
    example: 0.85,
  })
  @IsNumber()
  predictedValue: number;

  @ApiProperty({
    description: 'Confidence level of the prediction',
    enum: PredictionConfidence,
    example: PredictionConfidence.HIGH,
  })
  @IsEnum(PredictionConfidence)
  confidence: PredictionConfidence;

  @ApiProperty({
    description: 'Confidence score (0-1)',
    example: 0.87,
  })
  @IsNumber()
  confidenceScore: number;

  @ApiProperty({
    description: 'Prediction timeframe in days',
    example: 30,
  })
  @IsNumber()
  timeframeDays: number;

  @ApiProperty({
    description: 'Date when prediction was made',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDateString()
  predictedAt: Date;

  @ApiProperty({
    description: 'Date when prediction expires',
    example: '2024-02-15T10:30:00Z',
  })
  @IsDateString()
  expiresAt: Date;

  @ApiProperty({
    description: 'Explanation of the prediction',
    example:
      'Based on your current 85% success rate and consistent morning routine, you are likely to maintain this habit successfully',
  })
  @IsString()
  explanation: string;

  @ApiPropertyOptional({
    description: 'Factors that influenced the prediction',
    example: [
      'Consistent morning routine',
      'High motivation levels',
      'Supportive environment',
    ],
  })
  @IsOptional()
  influencingFactors?: string[];

  @ApiPropertyOptional({
    description: 'Recommendations to improve the prediction',
    example: [
      'Maintain current routine',
      'Avoid late-night activities',
      'Keep exercise equipment visible',
    ],
  })
  @IsOptional()
  recommendations?: string[];

  @ApiPropertyOptional({
    description: 'Risk factors that could affect the prediction',
    example: ['Travel schedule changes', 'Work stress', 'Weather conditions'],
  })
  @IsOptional()
  riskFactors?: string[];

  @ApiProperty({
    description: 'Historical accuracy of similar predictions',
    example: 0.78,
  })
  @IsNumber()
  historicalAccuracy: number;
}

export class PredictiveAnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Specific habit ID to analyze',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  habitId?: number;

  @ApiPropertyOptional({
    description: 'Type of prediction to generate',
    enum: PredictionType,
    example: PredictionType.SUCCESS_RATE,
  })
  @IsOptional()
  @IsEnum(PredictionType)
  predictionType?: PredictionType;

  @ApiPropertyOptional({
    description: 'Prediction timeframe in days',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  timeframeDays?: number;

  @ApiPropertyOptional({
    description: 'Minimum confidence score required',
    example: 0.7,
  })
  @IsOptional()
  @IsNumber()
  minConfidence?: number;

  @ApiPropertyOptional({
    description: 'Include only high-confidence predictions',
    example: true,
  })
  @IsOptional()
  includeHighConfidenceOnly?: boolean;
}

export class PredictionInsightsDto {
  @ApiProperty({
    description: 'Overall prediction summary',
    example:
      'Your habits show strong positive trends with 78% accuracy in predictions',
  })
  @IsString()
  summary: string;

  @ApiProperty({
    description: 'List of habit predictions',
    type: [HabitPredictionDto],
  })
  predictions: HabitPredictionDto[];

  @ApiProperty({
    description: 'Overall confidence in predictions',
    example: 0.82,
  })
  @IsNumber()
  overallConfidence: number;

  @ApiProperty({
    description: 'Key insights from predictions',
    example: [
      'Morning habits are most successful',
      'Weekend consistency needs improvement',
    ],
  })
  @IsString()
  keyInsights: string[];

  @ApiProperty({
    description: 'Actionable recommendations',
    example: [
      'Focus on evening routine consistency',
      'Leverage morning momentum for other habits',
    ],
  })
  @IsString()
  recommendations: string[];

  @ApiProperty({
    description: 'Date when insights were generated',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDateString()
  generatedAt: Date;
}
