// User types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  timezone?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// Habit types
export interface Habit {
  id: number;
  title: string;
  description?: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetValue: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
  isActive: boolean;
  reminderTime?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitLog {
  id: number;
  habitId: number;
  completedAt: Date;
  value: number;
  notes?: string;
  mood?: number;
  weather?: string;
  location?: string;
}

// AI Gardener types
export interface AiInsight {
  id: number;
  type: 'motivation' | 'tip' | 'achievement' | 'warning';
  title: string;
  message: string;
  habitId?: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface AiCoaching {
  id: number;
  type: 'daily' | 'weekly' | 'monthly';
  title: string;
  content: string;
  actions?: string[];
  createdAt: Date;
}

// Analytics types
export interface HabitAnalytics {
  habitId: number;
  habitTitle: string;
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  averageValue: number;
  completionRate: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
}

export interface ProgressReport {
  period: string;
  totalHabits: number;
  completedHabits: number;
  totalStreak: number;
  averageCompletionRate: number;
  topPerformingHabits: string[];
  needsAttentionHabits: string[];
}

// Notification types
export interface Notification {
  id: number;
  type:
    | 'habit_reminder'
    | 'streak_milestone'
    | 'goal_achievement'
    | 'ai_insight'
    | 'friend_activity';
  title: string;
  message: string;
  data?: any;
  status: 'unread' | 'read';
  priority: 'low' | 'medium' | 'high';
  scheduledFor?: Date;
  sentAt?: Date;
  isPushSent: boolean;
  isEmailSent: boolean;
  isInAppSent: boolean;
  createdAt: Date;
}

export interface PushSubscription {
  id: number;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  isActive: boolean;
  userAgent: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  preferences: {
    habitReminders: boolean;
    streakMilestones: boolean;
    goalAchievements: boolean;
    aiInsights: boolean;
    friendActivity: boolean;
  };
}

// Community types
export interface CommunityGarden {
  id: number;
  name: string;
  description: string;
  type: 'public' | 'private' | 'invite_only';
  status: 'active' | 'archived' | 'moderated';
  ownerId: number;
  owner: User;
  memberCount: number;
  habitCount: number;
  totalStreak: number;
  tags?: string[];
  rules?: string[];
  maxMembers?: number;
  requiresApproval: boolean;
  allowGuestViewing: boolean;
  coverImage?: string;
  theme?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupChallenge {
  id: number;
  title: string;
  description: string;
  type: 'streak' | 'completion' | 'consistency' | 'growth' | 'team';
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  communityGardenId: number;
  communityGarden: CommunityGarden;
  creatorId: number;
  creator: User;
  targetValue: number;
  startDate: Date;
  endDate: Date;
  participantCount: number;
  completionCount: number;
  rewards?: {
    title: string;
    description: string;
    type: 'badge' | 'points' | 'recognition';
  }[];
  rules?: string[];
  isTeamChallenge: boolean;
  maxTeamSize?: number;
  requiresVerification: boolean;
  allowLateJoins: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeParticipation {
  id: number;
  userId: number;
  user: User;
  challengeId: number;
  challenge: GroupChallenge;
  status: 'joined' | 'active' | 'completed' | 'failed' | 'withdrawn';
  currentValue: number;
  bestValue: number;
  streak: number;
  longestStreak: number;
  completionRate: number;
  joinedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  lastActivityAt: Date;
  milestones?: {
    title: string;
    description: string;
    achievedAt: Date;
    value: number;
  }[];
  notes?: string[];
  isVerified: boolean;
  verifiedBy?: number;
  verifiedAt?: Date;
  achievements?: {
    title: string;
    description: string;
    type: string;
    achievedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  HabitDetail: { habitId: number };
  CreateHabit: undefined;
  EditHabit: { habit: Habit };
  Analytics: undefined;
  Notifications: undefined;
  Community: undefined;
  GardenDetail: { gardenId: number };
  ChallengeDetail: { challengeId: number };
  CreateGarden: undefined;
  CreateChallenge: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Garden: undefined;
  Habits: undefined;
  Analytics: undefined;
  Community: undefined;
  Profile: undefined;
};

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateHabitForm {
  title: string;
  description?: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetValue: number;
  reminderTime?: string;
  tags?: string[];
}

export interface CreateGardenForm {
  name: string;
  description: string;
  type: 'public' | 'private' | 'invite_only';
  tags?: string;
  rules?: string;
  maxMembers?: number;
  requiresApproval: boolean;
  allowGuestViewing: boolean;
}

export interface CreateChallengeForm {
  title: string;
  description: string;
  type: 'streak' | 'completion' | 'consistency' | 'growth' | 'team';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  communityGardenId: number;
  targetValue: number;
  startDate: string;
  endDate: string;
  isTeamChallenge: boolean;
  maxTeamSize?: number;
  requiresVerification: boolean;
  allowLateJoins: boolean;
  tags?: string;
}
