export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {},
  pluralizationRules: {
    en: function (choice: number, choicesLength: number) {
      if (choice === 0) return 0;
      if (choice === 1) return 1;
      return 2;
    },
    es: function (choice: number, choicesLength: number) {
      if (choice === 0) return 0;
      if (choice === 1) return 1;
      return 2;
    },
    fr: function (choice: number, choicesLength: number) {
      if (choice === 0) return 0;
      if (choice === 1) return 1;
      return 2;
    },
    de: function (choice: number, choicesLength: number) {
      if (choice === 0) return 0;
      if (choice === 1) return 1;
      return 2;
    },
  },
  numberFormats: {
    en: {
      currency: {
        style: 'currency',
        currency: 'USD',
      },
      decimal: {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
    es: {
      currency: {
        style: 'currency',
        currency: 'EUR',
      },
      decimal: {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
    fr: {
      currency: {
        style: 'currency',
        currency: 'EUR',
      },
      decimal: {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
    de: {
      currency: {
        style: 'currency',
        currency: 'EUR',
      },
      decimal: {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
  },
  dateTimeFormats: {
    en: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      },
    },
    es: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      },
    },
    fr: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      },
    },
    de: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      },
    },
  },
}));
