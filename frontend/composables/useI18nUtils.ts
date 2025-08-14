import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export function useI18nUtils() {
  const { t, locale, locales, n, d } = useI18n();

  // Get current locale info
  const currentLocale = computed(() => {
    return (
      locales.value.find((l) => l.code === locale.value) || locales.value[0]
    );
  });

  // Check if current locale is RTL
  const isRTL = computed(() => {
    return currentLocale.value?.dir === 'rtl';
  });

  // Format number with locale-specific formatting
  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
    return n(value, options);
  };

  // Format date with locale-specific formatting
  const formatDate = (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ) => {
    const dateObj =
      typeof date === 'string' || typeof date === 'number'
        ? new Date(date)
        : date;
    return d(dateObj, options);
  };

  // Format currency with locale-specific formatting
  const formatCurrency = (
    value: number,
    currency = 'USD',
    options?: Intl.NumberFormatOptions
  ) => {
    return n(value, {
      style: 'currency',
      currency,
      ...options,
    });
  };

  // Get plural form based on count
  const getPlural = (
    key: string,
    count: number,
    options?: Record<string, any>
  ) => {
    return t(key, { count, ...options });
  };

  // Get text with interpolation
  const getText = (key: string, options?: Record<string, any>) => {
    return t(key, options);
  };

  // Get text with fallback
  const getTextWithFallback = (
    key: string,
    fallback: string,
    options?: Record<string, any>
  ) => {
    const text = t(key, options);
    return text === key ? fallback : text;
  };

  // Get localized text for common actions
  const getActionText = (action: string) => {
    return t(`common.actions.${action}`);
  };

  // Get localized text for common status
  const getStatusText = (status: string) => {
    return t(`common.status.${status}`);
  };

  // Get localized text for common messages
  const getMessageText = (message: string) => {
    return t(`common.messages.${message}`);
  };

  // Get localized text for validation
  const getValidationText = (rule: string, options?: Record<string, any>) => {
    return t(`validation.${rule}`, options);
  };

  // Get localized text for time periods
  const getTimeText = (period: string) => {
    return t(`common.time.${period}`);
  };

  // Get localized text for units
  const getUnitText = (unit: string, count = 1) => {
    return t(`common.units.${unit}`, { count });
  };

  // Get localized text for habit categories
  const getHabitCategoryText = (category: string) => {
    return t(`habits.categories.${category}`);
  };

  // Get localized text for goal types
  const getGoalTypeText = (type: string) => {
    return t(`goals.types.${type}`);
  };

  // Get localized text for goal difficulties
  const getGoalDifficultyText = (difficulty: string) => {
    return t(`goals.difficulties.${difficulty}`);
  };

  // Get localized text for goal priorities
  const getGoalPriorityText = (priority: string) => {
    return t(`goals.priorities.${priority}`);
  };

  // Get localized text for goal statuses
  const getGoalStatusText = (status: string) => {
    return t(`goals.status.${status}`);
  };

  // Get localized text for SMART goal attributes
  const getSmartAttributeText = (attribute: string) => {
    return t(`goals.smart.${attribute}`);
  };

  // Get localized text for notification types
  const getNotificationTypeText = (type: string) => {
    return t(`notifications.types.${type}`);
  };

  // Get localized text for themes
  const getThemeText = (theme: string) => {
    return t(`settings.themes.${theme}`);
  };

  // Get localized text for languages
  const getLanguageText = (lang: string) => {
    return t(`settings.languages.${lang}`);
  };

  // Get localized text for analytics metrics
  const getMetricText = (metric: string) => {
    return t(`analytics.metrics.${metric}`);
  };

  // Get localized text for analytics periods
  const getPeriodText = (period: string) => {
    return t(`analytics.periods.${period}`);
  };

  // Get localized text for analytics charts
  const getChartText = (chart: string) => {
    return t(`analytics.charts.${chart}`);
  };

  // Get localized text for community actions
  const getCommunityActionText = (action: string) => {
    return t(`community.${action}`);
  };

  // Get localized text for AI features
  const getAIText = (feature: string) => {
    return t(`ai.${feature}`);
  };

  // Get localized text for garden features
  const getGardenText = (feature: string) => {
    return t(`garden.${feature}`);
  };

  // Get localized text for habit features
  const getHabitText = (feature: string) => {
    return t(`habits.${feature}`);
  };

  // Get localized text for goal features
  const getGoalText = (feature: string) => {
    return t(`goals.${feature}`);
  };

  // Get localized text for settings features
  const getSettingText = (feature: string) => {
    return t(`settings.${feature}`);
  };

  // Get localized text for navigation
  const getNavigationText = (item: string) => {
    return t(`navigation.${item}`);
  };

  // Get localized text for app info
  const getAppText = (info: string) => {
    return t(`app.${info}`);
  };

  // Get localized text for auth features
  const getAuthText = (feature: string) => {
    return t(`auth.${feature}`);
  };

  // Get localized text for auth errors
  const getAuthErrorText = (error: string) => {
    return t(`auth.errors.${error}`);
  };

  // Check if a translation key exists
  const hasTranslation = (key: string) => {
    const translation = t(key);
    return translation !== key;
  };

  // Get all available locales
  const availableLocales = computed(() => {
    return locales.value;
  });

  // Get locale by code
  const getLocaleByCode = (code: string) => {
    return locales.value.find((l) => l.code === code);
  };

  // Get locale name by code
  const getLocaleNameByCode = (code: string) => {
    const locale = getLocaleByCode(code);
    return locale?.name || code;
  };

  // Get locale flag by code
  const getLocaleFlagByCode = (code: string) => {
    const locale = getLocaleByCode(code);
    return locale?.flag || '🌐';
  };

  return {
    // Core i18n functions
    t,
    locale,
    locales,
    n,
    d,

    // Computed properties
    currentLocale,
    isRTL,
    availableLocales,

    // Utility functions
    formatNumber,
    formatDate,
    formatCurrency,
    getPlural,
    getText,
    getTextWithFallback,

    // Specific text getters
    getActionText,
    getStatusText,
    getMessageText,
    getValidationText,
    getTimeText,
    getUnitText,
    getHabitCategoryText,
    getGoalTypeText,
    getGoalDifficultyText,
    getGoalPriorityText,
    getGoalStatusText,
    getSmartAttributeText,
    getNotificationTypeText,
    getThemeText,
    getLanguageText,
    getMetricText,
    getPeriodText,
    getChartText,
    getCommunityActionText,
    getAIText,
    getGardenText,
    getHabitText,
    getGoalText,
    getSettingText,
    getNavigationText,
    getAppText,
    getAuthText,
    getAuthErrorText,

    // Locale utilities
    hasTranslation,
    getLocaleByCode,
    getLocaleNameByCode,
    getLocaleFlagByCode,
  };
}
