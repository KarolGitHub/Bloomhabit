import { IsEmail, IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OAuthProfileDto {
  @ApiProperty({
    description: 'OAuth provider ID (e.g., Google ID, GitHub ID)',
    example: '123456789',
  })
  @IsString()
  providerId: string;

  @ApiProperty({
    description: 'User email address from OAuth provider',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Username from OAuth provider',
    example: 'johndoe',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'First name from OAuth provider',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'Last name from OAuth provider',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Avatar URL from OAuth provider',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  avatar?: string;
}
