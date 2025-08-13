import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { OAuthProfileDto } from './dto/oauth-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { Request } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            username: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            avatar: { type: 'string' },
            role: { type: 'string' },
          },
        },
        access_token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            username: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            avatar: { type: 'string' },
            role: { type: 'string' },
          },
        },
        access_token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Public()
  @Post('oauth/google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google OAuth login' })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated via Google',
  })
  async googleOAuth(@Body() profile: OAuthProfileDto) {
    return this.authService.oauthLogin(profile, 'google');
  }

  @Public()
  @Post('oauth/github')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GitHub OAuth login' })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated via GitHub',
  })
  async githubOAuth(@Body() profile: OAuthProfileDto) {
    return this.authService.oauthLogin(profile, 'github');
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Token successfully refreshed',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
      },
    },
  })
  async refreshToken(@Req() req: Request) {
    return this.authService.refreshToken(req.user['id']);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        username: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        avatar: { type: 'string' },
        role: { type: 'string' },
      },
    },
  })
  async getProfile(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async logout() {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    return { message: 'Successfully logged out' };
  }
}
