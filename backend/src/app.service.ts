import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '🌸 Welcome to Bloomhabit API!';
  }

  getVersion(): { version: string; name: string; description: string } {
    return {
      version: '1.0.0',
      name: 'Bloomhabit',
      description: 'A habit-focused app that helps users create and maintain good habits using a garden-inspired metaphor',
    };
  }
}
