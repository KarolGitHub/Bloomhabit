import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthProfileDto } from './dto/oauth-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
      },
      access_token: this.generateToken(user),
    };
  }

  async register(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    // Create user with hashed password
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
      },
      access_token: token,
    };
  }

  async oauthLogin(profile: OAuthProfileDto, provider: 'google' | 'github') {
    let user = await this.usersService.findByEmail(profile.email);

    if (!user) {
      // Create new user from OAuth profile
      const createUserDto: CreateUserDto = {
        email: profile.email,
        username: profile.username || profile.email.split('@')[0],
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        avatar: profile.avatar,
        password: '', // OAuth users don't have passwords
        googleId: provider === 'google' ? profile.providerId : undefined,
        githubId: provider === 'github' ? profile.providerId : undefined,
      };

      user = await this.usersService.create(createUserDto);
    } else {
      // Update existing user with OAuth provider ID
      const updateData: any = {};
      if (provider === 'google') {
        updateData.googleId = profile.providerId;
      } else if (provider === 'github') {
        updateData.githubId = profile.providerId;
      }

      if (Object.keys(updateData).length > 0) {
        await this.usersService.update(user.id, updateData);
      }
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
      },
      access_token: this.generateToken(user),
    };
  }

  private generateToken(user: any): string {
    const payload = {
      email: user.email,
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  async refreshToken(userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      access_token: this.generateToken(user),
    };
  }

  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
