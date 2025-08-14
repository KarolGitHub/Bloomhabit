import { Module } from '@nestjs/common';
import { I18nModule as NestI18nModule } from 'nestjs-i18n';
import { join } from 'path';
import { i18nConfig } from '../../config/i18n.config';

@Module({
  imports: [
    NestI18nModule.forRoot({
      fallbackLanguage: i18nConfig.fallbackLanguage,
      loaderOptions: {
        path: join(__dirname, '../../i18n/'),
        watch: i18nConfig.loaderOptions.watch,
      },
      typesOutputPath: i18nConfig.typesOutputPath,
      throwOnMissingTranslations: i18nConfig.throwOnMissingTranslations,
      useI18nJson: i18nConfig.useI18nJson,
      defaultLanguage: i18nConfig.defaultLanguage,
      languages: i18nConfig.languages,
      defaultContext: i18nConfig.defaultContext,
      defaultInterpolation: i18nConfig.defaultInterpolation,
      defaultPluralSeparator: i18nConfig.defaultPluralSeparator,
      defaultNestingSeparator: i18nConfig.defaultNestingSeparator,
      defaultEscapeHtml: i18nConfig.defaultEscapeHtml,
      defaultDateFormat: i18nConfig.defaultDateFormat,
      defaultNumberFormat: i18nConfig.defaultNumberFormat,
      defaultCurrencyFormat: i18nConfig.defaultCurrencyFormat,
      defaultTimeFormat: i18nConfig.defaultTimeFormat,
      defaultRelativeTimeFormat: i18nConfig.defaultRelativeTimeFormat,
      defaultNumberFormatOptions: i18nConfig.defaultNumberFormatOptions,
      defaultDateFormatOptions: i18nConfig.defaultDateFormatOptions,
      defaultTimeFormatOptions: i18nConfig.defaultTimeFormatOptions,
      defaultRelativeTimeFormatOptions:
        i18nConfig.defaultRelativeTimeFormatOptions,
    }),
  ],
  exports: [NestI18nModule],
})
export class I18nModule {}
