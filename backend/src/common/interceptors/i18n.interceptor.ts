import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { I18nService } from 'nestjs-i18n';
import { Request } from 'express';

export interface I18nResponse<T> {
  data: T;
  message: string;
  language: string;
  timestamp: string;
}

@Injectable()
export class I18nInterceptor<T> implements NestInterceptor<T, I18nResponse<T>> {
  constructor(private readonly i18n: I18nService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<I18nResponse<T>>> {
    const request = context.switchToHttp().getRequest<Request>();

    // Get language from various sources (priority order)
    const language = this.detectLanguage(request);

    // Set the language for this request
    await this.i18n.setLanguage(language);

    return next.handle().pipe(
      map(async (data) => {
        // Get localized success message based on the action
        const message = await this.getLocalizedMessage(request, data);

        return {
          data,
          message,
          language,
          timestamp: new Date().toISOString(),
        };
      })
    );
  }

  private detectLanguage(request: Request): string {
    // Priority order for language detection:
    // 1. Query parameter
    // 2. Header (Accept-Language)
    // 3. Cookie
    // 4. Default to 'en'

    // Check query parameter
    if (request.query.lang && typeof request.query.lang === 'string') {
      const lang = request.query.lang.toLowerCase();
      if (this.isValidLanguage(lang)) {
        return lang;
      }
    }

    // Check Accept-Language header
    const acceptLanguage = request.headers['accept-language'];
    if (acceptLanguage) {
      const preferredLang = this.parseAcceptLanguage(acceptLanguage);
      if (preferredLang && this.isValidLanguage(preferredLang)) {
        return preferredLang;
      }
    }

    // Check cookie
    if (request.cookies && request.cookies['bloomhabit-language']) {
      const cookieLang = request.cookies['bloomhabit-language'];
      if (this.isValidLanguage(cookieLang)) {
        return cookieLang;
      }
    }

    // Default to English
    return 'en';
  }

  private isValidLanguage(lang: string): boolean {
    const validLanguages = [
      'en',
      'es',
      'fr',
      'de',
      'pt',
      'it',
      'ja',
      'ko',
      'zh',
      'ar',
    ];
    return validLanguages.includes(lang);
  }

  private parseAcceptLanguage(acceptLanguage: string): string | null {
    // Parse Accept-Language header (e.g., "en-US,en;q=0.9,es;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map((lang) => lang.trim().split(';')[0].split('-')[0])
      .filter((lang) => this.isValidLanguage(lang));

    return languages.length > 0 ? languages[0] : null;
  }

  private async getLocalizedMessage(
    request: Request,
    data: any
  ): Promise<string> {
    try {
      const method = request.method;
      const path = request.route?.path || request.path;

      // Determine the action based on HTTP method and path
      const action = this.determineAction(method, path);

      // Get the appropriate translation key
      const translationKey = this.getTranslationKey(action, path);

      // Get localized message
      const message = await this.i18n.translate(translationKey);

      return message;
    } catch (error) {
      // Fallback to generic success message
      return await this.i18n.translate('common.success.retrieved');
    }
  }

  private determineAction(method: string, path: string): string {
    switch (method) {
      case 'GET':
        return 'retrieved';
      case 'POST':
        return 'created';
      case 'PUT':
      case 'PATCH':
        return 'updated';
      case 'DELETE':
        return 'deleted';
      default:
        return 'retrieved';
    }
  }

  private getTranslationKey(action: string, path: string): string {
    // Map common paths to translation keys
    if (path.includes('/auth')) {
      return `auth.success.${action === 'retrieved' ? 'login' : action}`;
    }

    if (path.includes('/users')) {
      return `user.success.${action === 'retrieved' ? 'profileUpdated' : action}`;
    }

    if (path.includes('/habits')) {
      return `habit.success.${action}`;
    }

    if (path.includes('/goals')) {
      return `goal.success.${action}`;
    }

    if (path.includes('/community')) {
      return `community.success.${action === 'retrieved' ? 'gardenJoined' : action}`;
    }

    if (path.includes('/notifications')) {
      return `notification.success.${action}`;
    }

    if (path.includes('/ai')) {
      return `ai.success.${action === 'retrieved' ? 'insightGenerated' : action}`;
    }

    if (path.includes('/analytics')) {
      return `analytics.success.${action === 'retrieved' ? 'reportGenerated' : action}`;
    }

    // Default to common success message
    return `common.success.${action}`;
  }
}
