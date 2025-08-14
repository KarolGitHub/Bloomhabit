export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://10.0.2.2:3000/api' // Android emulator
    : 'http://localhost:3000/api', // iOS simulator
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    GOOGLE: '/auth/google',
    GITHUB: '/auth/github',
  },

  // User
  USER: {
    PROFILE: '/users/profile',
    UPDATE: '/users/profile',
    PREFERENCES: '/users/preferences',
    STATS: '/users/garden-stats',
  },

  // Habits
  HABITS: {
    LIST: '/habits',
    CREATE: '/habits',
    UPDATE: '/habits/:id',
    DELETE: '/habits/:id',
    LOG: '/habits/:id/log',
    LOGS: '/habits/:id/logs',
  },

  // AI Gardener
  AI: {
    INSIGHTS: '/ai/insights',
    COACHING: '/ai/coaching',
    REPORT: '/ai/report',
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    HABIT: '/analytics/habits/:id',
    PROGRESS: '/analytics/progress',
    TRENDS: '/analytics/trends',
    PERFORMANCE: '/analytics/performance',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/mark-all-read',
    PUSH_SUBSCRIPTIONS: '/notifications/push-subscriptions',
    PUSH_PREFERENCES: '/notifications/push-preferences',
    VAPID_KEY: '/notifications/vapid-key',
  },

  // Community
  COMMUNITY: {
    GARDENS: '/community/gardens',
    GARDEN: '/community/gardens/:id',
    CHALLENGES: '/community/challenges',
    CHALLENGE: '/community/challenges/:id',
    JOIN_GARDEN: '/community/gardens/:id/join',
    LEAVE_GARDEN: '/community/gardens/:id/leave',
    JOIN_CHALLENGE: '/community/challenges/:id/join',
    LEAVE_CHALLENGE: '/community/challenges/:id/leave',
  },
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};
