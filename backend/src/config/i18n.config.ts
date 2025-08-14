import { I18nOptions } from 'nestjs-i18n';
import { join } from 'path';

export const i18nConfig: I18nOptions = {
  fallbackLanguage: 'en',
  loaderOptions: {
    path: join(__dirname, '../i18n/'),
    watch: true,
  },
  typesOutputPath: join(__dirname, '../i18n/generated/i18n.generated.types.ts'),
  throwOnMissingTranslations: false,
  useI18nJson: true,
  defaultLanguage: 'en',
  languages: ['en', 'es', 'fr', 'de', 'pt', 'it', 'ja', 'ko', 'zh', 'ar'],
  defaultContext: 'app',
  defaultInterpolation: {
    prefix: '{',
    suffix: '}',
  },
  defaultPluralSeparator: '|',
  defaultNestingSeparator: '.',
  defaultEscapeHtml: true,
  defaultDateFormat: 'short',
  defaultNumberFormat: 'decimal',
  defaultCurrencyFormat: 'USD',
  defaultTimeFormat: 'short',
  defaultRelativeTimeFormat: 'auto',
  defaultNumberFormatOptions: {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  defaultDateFormatOptions: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  defaultTimeFormatOptions: {
    hour: '2-digit',
    minute: '2-digit',
  },
  defaultRelativeTimeFormatOptions: {
    numeric: 'auto',
  },
};
