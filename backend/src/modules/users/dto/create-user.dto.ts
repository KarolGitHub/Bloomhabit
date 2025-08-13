import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Username for the user' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'User first name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'User last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'User avatar URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: 'User role', enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'User password (for local auth)' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: 'Google OAuth ID' })
  @IsOptional()
  @IsString()
  googleId?: string;

  @ApiPropertyOptional({ description: 'GitHub OAuth ID' })
  @IsOptional()
  @IsString()
  githubId?: string;

  @ApiPropertyOptional({ description: 'User preferences' })
  @IsOptional()
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    notifications?: boolean;
    timezone?: string;
  };
}
