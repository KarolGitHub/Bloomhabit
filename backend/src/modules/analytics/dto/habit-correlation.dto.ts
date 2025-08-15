import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';

export enum CorrelationType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
  STRONG = 'strong',
  MODERATE = 'moderate',
  WEAK = 'weak',
}

export class HabitCorrelationDto {
  @ApiProperty({
    description: 'ID of the first habit',
    example: 1,
  })
  @IsNumber()
  habitId1: number;

  @ApiProperty({
    description: 'ID of the second habit',
    example: 2,
  })
  @IsNumber()
  habitId2: number;

  @ApiProperty({
    description: 'Name of the first habit',
    example: 'Morning Exercise',
  })
  @IsString()
  habitName1: string;

  @ApiProperty({
    description: 'Name of the second habit',
    example: 'Healthy Eating',
  })
  @IsString()
  habitName2: string;

  @ApiProperty({
    description: 'Correlation coefficient (-1 to 1)',
    example: 0.75,
  })
  @IsNumber()
  correlationCoefficient: number;

  @ApiProperty({
    description: 'Type of correlation',
    enum: CorrelationType,
    example: CorrelationType.POSITIVE,
  })
  @IsEnum(CorrelationType)
  correlationType: CorrelationType;

  @ApiProperty({
    description: 'Strength of correlation',
    enum: CorrelationType,
    example: CorrelationType.STRONG,
  })
  @IsEnum(CorrelationType)
  strength: CorrelationType;

  @ApiProperty({
    description: 'Confidence level of the correlation (0-1)',
    example: 0.89,
  })
  @IsNumber()
  confidence: number;

  @ApiProperty({
    description: 'Number of data points used for analysis',
    example: 45,
  })
  @IsNumber()
  dataPoints: number;

  @ApiProperty({
    description: 'Explanation of the correlation',
    example:
      'When users complete morning exercise, they are 75% more likely to eat healthy',
  })
  @IsString()
  explanation: string;

  @ApiPropertyOptional({
    description: 'Additional insights about the correlation',
    example: [
      'Peak correlation on weekdays',
      'Stronger correlation in morning hours',
    ],
  })
  @IsOptional()
  insights?: string[];

  @ApiProperty({
    description: 'Date when correlation was calculated',
    example: '2024-01-15T10:30:00Z',
  })
  calculatedAt: Date;
}

export class HabitCorrelationQueryDto {
  @ApiPropertyOptional({
    description: 'Minimum correlation coefficient to include',
    example: 0.3,
  })
  @IsOptional()
  @IsNumber()
  minCorrelation?: number;

  @ApiPropertyOptional({
    description: 'Maximum correlation coefficient to include',
    example: 0.9,
  })
  @IsOptional()
  @IsNumber()
  maxCorrelation?: number;

  @ApiPropertyOptional({
    description: 'Minimum confidence level to include',
    example: 0.7,
  })
  @IsOptional()
  @IsNumber()
  minConfidence?: number;

  @ApiPropertyOptional({
    description: 'Minimum number of data points required',
    example: 20,
  })
  @IsOptional()
  @IsNumber()
  minDataPoints?: number;

  @ApiPropertyOptional({
    description: 'Include only positive correlations',
    example: true,
  })
  @IsOptional()
  includePositive?: boolean;

  @ApiPropertyOptional({
    description: 'Include only negative correlations',
    example: false,
  })
  @IsOptional()
  includeNegative?: boolean;
}
