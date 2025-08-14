import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';

export interface I18nExceptionResponse {
  statusCode: number;
  message: string;
  error: string;
  language: string;
  timestamp: string;
  path: string;
}

@Catch()
export class I18nExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Detect language from request
    const language = this.detectLanguage(request);

    // Set language for i18n service
    await this.i18n.setLanguage(language);

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = this.getHttpStatusText(status);
      } else if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        message = Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message[0]
          : exceptionResponse.message;
        error = this.getHttpStatusText(status);
      } else {
        message = await this.i18n.translate('common.error.internalError');
        error = this.getHttpStatusText(status);
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = await this.i18n.translate('common.error.internalError');
      error = this.getHttpStatusText(status);
    }

    // Get localized error message
    const localizedMessage = await this.getLocalizedErrorMessage(
      request,
      status,
      message
    );

    const responseBody: I18nExceptionResponse = {
      statusCode: status,
      message: localizedMessage,
      error,
      language,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(responseBody);
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

  private getHttpStatusText(status: number): string {
    switch (status) {
      case 400:
        return 'Bad Request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not Found';
      case 409:
        return 'Conflict';
      case 422:
        return 'Unprocessable Entity';
      case 429:
        return 'Too Many Requests';
      case 500:
        return 'Internal Server Error';
      case 502:
        return 'Bad Gateway';
      case 503:
        return 'Service Unavailable';
      default:
        return 'Error';
    }
  }

  private async getLocalizedErrorMessage(
    request: Request,
    status: number,
    originalMessage: string
  ): Promise<string> {
    try {
      const path = request.path;

      // Map common error patterns to translation keys
      if (status === 400) {
        return await this.getValidationErrorMessage(path, originalMessage);
      }

      if (status === 401) {
        return await this.i18n.translate('common.error.unauthorized');
      }

      if (status === 403) {
        return await this.i18n.translate('common.error.forbidden');
      }

      if (status === 404) {
        return await this.getNotFoundErrorMessage(path);
      }

      if (status === 409) {
        return await this.getConflictErrorMessage(path, originalMessage);
      }

      if (status === 422) {
        return await this.getValidationErrorMessage(path, originalMessage);
      }

      if (status === 429) {
        return await this.i18n.translate('common.error.tooManyRequests');
      }

      if (status >= 500) {
        return await this.i18n.translate('common.error.internalError');
      }

      // Try to get specific error message based on path and original message
      const specificMessage = await this.getSpecificErrorMessage(
        path,
        originalMessage
      );
      if (specificMessage) {
        return specificMessage;
      }

      // Fallback to generic error message
      return await this.i18n.translate('common.error.badRequest');
    } catch (error) {
      // If i18n fails, return original message
      return originalMessage;
    }
  }

  private async getValidationErrorMessage(
    path: string,
    originalMessage: string
  ): Promise<string> {
    // Try to get specific validation error message based on path
    if (path.includes('/auth')) {
      if (originalMessage.includes('email')) {
        return await this.i18n.translate('auth.validation.emailInvalid');
      }
      if (originalMessage.includes('password')) {
        return await this.i18n.translate('auth.validation.passwordRequired');
      }
      return await this.i18n.translate('auth.validation.emailRequired');
    }

    if (path.includes('/users')) {
      if (originalMessage.includes('firstName')) {
        return await this.i18n.translate('user.validation.firstNameRequired');
      }
      if (originalMessage.includes('lastName')) {
        return await this.i18n.translate('user.validation.lastNameRequired');
      }
      return await this.i18n.translate('user.validation.profileNotFound');
    }

    if (path.includes('/habits')) {
      if (originalMessage.includes('name')) {
        return await this.i18n.translate('habit.validation.nameRequired');
      }
      if (originalMessage.includes('category')) {
        return await this.i18n.translate('habit.validation.categoryRequired');
      }
      return await this.i18n.translate('habit.validation.invalidFrequency');
    }

    if (path.includes('/goals')) {
      if (originalMessage.includes('title')) {
        return await this.i18n.translate('goal.validation.titleRequired');
      }
      if (originalMessage.includes('targetDate')) {
        return await this.i18n.translate('goal.validation.targetDateRequired');
      }
      return await this.i18n.translate('goal.validation.invalidTargetValue');
    }

    // Default validation error
    return await this.i18n.translate('common.validation.required');
  }

  private async getNotFoundErrorMessage(path: string): Promise<string> {
    if (path.includes('/auth')) {
      return await this.i18n.translate('auth.error.userNotFound');
    }

    if (path.includes('/users')) {
      return await this.i18n.translate('user.error.profileNotFound');
    }

    if (path.includes('/habits')) {
      return await this.i18n.translate('habit.error.notFound');
    }

    if (path.includes('/goals')) {
      return await this.i18n.translate('goal.error.notFound');
    }

    if (path.includes('/community')) {
      return await this.i18n.translate('community.error.gardenNotFound');
    }

    if (path.includes('/notifications')) {
      return await this.i18n.translate('notification.error.notFound');
    }

    // Default not found error
    return await this.i18n.translate('common.error.notFound');
  }

  private async getConflictErrorMessage(
    path: string,
    originalMessage: string
  ): Promise<string> {
    if (path.includes('/auth')) {
      return await this.i18n.translate('auth.error.userExists');
    }

    if (path.includes('/community')) {
      if (originalMessage.includes('member')) {
        return await this.i18n.translate('community.error.alreadyMember');
      }
      return await this.i18n.translate('community.error.gardenFull');
    }

    // Default conflict error
    return await this.i18n.translate('common.error.conflict');
  }

  private async getSpecificErrorMessage(
    path: string,
    originalMessage: string
  ): Promise<string | null> {
    try {
      // Try to match specific error patterns
      if (originalMessage.includes('already completed')) {
        if (path.includes('/habits')) {
          return await this.i18n.translate('habit.error.alreadyCompleted');
        }
        if (path.includes('/goals')) {
          return await this.i18n.translate('goal.error.alreadyCompleted');
        }
      }

      if (originalMessage.includes('cannot delete')) {
        if (path.includes('/habits')) {
          return await this.i18n.translate('habit.error.cannotDeleteActive');
        }
      }

      if (originalMessage.includes('cannot pause')) {
        if (path.includes('/goals')) {
          return await this.i18n.translate('goal.error.cannotPauseCompleted');
        }
      }

      if (originalMessage.includes('cannot resume')) {
        if (path.includes('/goals')) {
          return await this.i18n.translate('goal.error.cannotResumeActive');
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }
}
