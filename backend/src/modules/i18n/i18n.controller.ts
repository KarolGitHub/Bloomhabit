import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';

interface LanguageInfo {
  code: string;
  name: string;
  flag: string;
  dir?: string;
  nativeName: string;
}

interface TranslationRequest {
  keys: string[];
  language?: string;
  context?: string;
}

interface TranslationResponse {
  language: string;
  translations: Record<string, string>;
  timestamp: string;
}

@ApiTags('i18n')
@Controller('i18n')
export class I18nController {
  constructor(private readonly i18n: I18nService) {}

  @Get('languages')
  @ApiOperation({ summary: 'Get available languages' })
  @ApiResponse({
    status: 200,
    description: 'List of available languages',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'en' },
          name: { type: 'string', example: 'English' },
          flag: { type: 'string', example: '🇺🇸' },
          dir: { type: 'string', example: 'ltr' },
          nativeName: { type: 'string', example: 'English' },
        },
      },
    },
  })
  async getLanguages(): Promise<LanguageInfo[]> {
    const languages: LanguageInfo[] = [
      {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
        dir: 'ltr',
        nativeName: 'English',
      },
      {
        code: 'es',
        name: 'Español',
        flag: '🇪🇸',
        dir: 'ltr',
        nativeName: 'Español',
      },
      {
        code: 'fr',
        name: 'Français',
        flag: '🇫🇷',
        dir: 'ltr',
        nativeName: 'Français',
      },
      {
        code: 'de',
        name: 'Deutsch',
        flag: '🇩🇪',
        dir: 'ltr',
        nativeName: 'Deutsch',
      },
      {
        code: 'pt',
        name: 'Português',
        flag: '🇧🇷',
        dir: 'ltr',
        nativeName: 'Português',
      },
      {
        code: 'it',
        name: 'Italiano',
        flag: '🇮🇹',
        dir: 'ltr',
        nativeName: 'Italiano',
      },
      {
        code: 'ja',
        name: '日本語',
        flag: '🇯🇵',
        dir: 'ltr',
        nativeName: '日本語',
      },
      {
        code: 'ko',
        name: '한국어',
        flag: '🇰🇷',
        dir: 'ltr',
        nativeName: '한국어',
      },
      {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳',
        dir: 'ltr',
        nativeName: '中文',
      },
      {
        code: 'ar',
        name: 'العربية',
        flag: '🇸🇦',
        dir: 'rtl',
        nativeName: 'العربية',
      },
    ];

    return languages;
  }

  @Get('detect')
  @ApiOperation({ summary: 'Detect user language preference' })
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Accept-Language header for language detection',
    required: false,
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code from query parameter',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Detected language information',
    schema: {
      type: 'object',
      properties: {
        detectedLanguage: { type: 'string', example: 'en' },
        confidence: { type: 'string', example: 'high' },
        availableLanguages: {
          type: 'array',
          items: { type: 'string' },
          example: ['en', 'es', 'fr'],
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async detectLanguage(
    @Headers('accept-language') acceptLanguage?: string,
    @Query('lang') queryLang?: string
  ) {
    let detectedLanguage = 'en';
    let confidence = 'low';

    // Check query parameter first
    if (queryLang && this.isValidLanguage(queryLang)) {
      detectedLanguage = queryLang.toLowerCase();
      confidence = 'high';
    }
    // Check Accept-Language header
    else if (acceptLanguage) {
      const preferredLang = this.parseAcceptLanguage(acceptLanguage);
      if (preferredLang && this.isValidLanguage(preferredLang)) {
        detectedLanguage = preferredLang;
        confidence = 'medium';
      }
    }

    const availableLanguages = [
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

    return {
      detectedLanguage,
      confidence,
      availableLanguages,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('translate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get translations for multiple keys' })
  @ApiResponse({
    status: 200,
    description: 'Translations for the requested keys',
    schema: {
      type: 'object',
      properties: {
        language: { type: 'string', example: 'en' },
        translations: {
          type: 'object',
          additionalProperties: { type: 'string' },
          example: { 'common.actions.save': 'Save' },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getTranslations(
    @Body() request: TranslationRequest,
    @Query('lang') language = 'en',
    @Headers('accept-language') acceptLanguage?: string
  ): Promise<TranslationResponse> {
    // Determine language to use
    let targetLanguage = language;
    if (!this.isValidLanguage(targetLanguage)) {
      if (acceptLanguage) {
        const preferredLang = this.parseAcceptLanguage(acceptLanguage);
        if (preferredLang && this.isValidLanguage(preferredLang)) {
          targetLanguage = preferredLang;
        } else {
          targetLanguage = 'en';
        }
      } else {
        targetLanguage = 'en';
      }
    }

    // Set language for i18n service
    await this.i18n.setLanguage(targetLanguage);

    // Get translations for requested keys
    const translations: Record<string, string> = {};

    for (const key of request.keys) {
      try {
        const translation = await this.i18n.translate(key, {
          lang: targetLanguage,
          context: request.context,
        });
        translations[key] = translation;
      } catch (error) {
        // If translation fails, use the key as fallback
        translations[key] = key;
      }
    }

    return {
      language: targetLanguage,
      translations,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check i18n service health' })
  @ApiResponse({
    status: 200,
    description: 'i18n service health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        supportedLanguages: {
          type: 'array',
          items: { type: 'string' },
          example: ['en', 'es', 'fr'],
        },
        fallbackLanguage: { type: 'string', example: 'en' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getHealth() {
    const supportedLanguages = [
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

    return {
      status: 'healthy',
      supportedLanguages,
      fallbackLanguage: 'en',
      timestamp: new Date().toISOString(),
    };
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
    return validLanguages.includes(lang.toLowerCase());
  }

  private parseAcceptLanguage(acceptLanguage: string): string | null {
    // Parse Accept-Language header (e.g., "en-US,en;q=0.9,es;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map((lang) => lang.trim().split(';')[0].split('-')[0])
      .filter((lang) => this.isValidLanguage(lang));

    return languages.length > 0 ? languages[0] : null;
  }
}
