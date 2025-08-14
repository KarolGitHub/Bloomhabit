import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  API_CONFIG,
  API_ENDPOINTS,
  HTTP_STATUS,
  ERROR_MESSAGES,
} from '../constants/api';
import { ApiResponse } from '../types';

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = await this.getHeaders();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      if (error.message.includes('Network request failed')) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }

      throw error;
    }
  }

  // Auth endpoints
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.makeRequest(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(
    userData: any
  ): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.makeRequest(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.makeRequest(API_ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.makeRequest(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  }

  // User endpoints
  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.USER.PROFILE);
  }

  async updateUserProfile(profileData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.USER.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserStats(): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.USER.STATS);
  }

  // Habits endpoints
  async getHabits(): Promise<ApiResponse<any[]>> {
    return this.makeRequest(API_ENDPOINTS.HABITS.LIST);
  }

  async createHabit(habitData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.HABITS.CREATE, {
      method: 'POST',
      body: JSON.stringify(habitData),
    });
  }

  async updateHabit(
    habitId: number,
    habitData: any
  ): Promise<ApiResponse<any>> {
    const endpoint = API_ENDPOINTS.HABITS.UPDATE.replace(
      ':id',
      habitId.toString()
    );
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(habitData),
    });
  }

  async deleteHabit(habitId: number): Promise<ApiResponse<void>> {
    const endpoint = API_ENDPOINTS.HABITS.DELETE.replace(
      ':id',
      habitId.toString()
    );
    return this.makeRequest(endpoint, {
      method: 'DELETE',
    });
  }

  async logHabit(habitId: number, logData: any): Promise<ApiResponse<any>> {
    const endpoint = API_ENDPOINTS.HABITS.LOG.replace(
      ':id',
      habitId.toString()
    );
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(logData),
    });
  }

  async getHabitLogs(habitId: number): Promise<ApiResponse<any[]>> {
    const endpoint = API_ENDPOINTS.HABITS.LOGS.replace(
      ':id',
      habitId.toString()
    );
    return this.makeRequest(endpoint);
  }

  // AI Gardener endpoints
  async getAiInsights(): Promise<ApiResponse<any[]>> {
    return this.makeRequest(API_ENDPOINTS.AI.INSIGHTS);
  }

  async getAiCoaching(): Promise<ApiResponse<any[]>> {
    return this.makeRequest(API_ENDPOINTS.AI.COACHING);
  }

  async getAiReport(): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.AI.REPORT);
  }

  // Analytics endpoints
  async getAnalyticsDashboard(): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.ANALYTICS.DASHBOARD);
  }

  async getHabitAnalytics(habitId: number): Promise<ApiResponse<any>> {
    const endpoint = API_ENDPOINTS.ANALYTICS.HABIT.replace(
      ':id',
      habitId.toString()
    );
    return this.makeRequest(endpoint);
  }

  async getProgressReport(): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.ANALYTICS.PROGRESS);
  }

  async getTrendAnalysis(): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.ANALYTICS.TRENDS);
  }

  async getPerformanceMetrics(): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.ANALYTICS.PERFORMANCE);
  }

  // Notifications endpoints
  async getNotifications(): Promise<ApiResponse<any[]>> {
    return this.makeRequest(API_ENDPOINTS.NOTIFICATIONS.LIST);
  }

  async markNotificationAsRead(
    notificationId: number
  ): Promise<ApiResponse<void>> {
    const endpoint = API_ENDPOINTS.NOTIFICATIONS.MARK_READ.replace(
      ':id',
      notificationId.toString()
    );
    return this.makeRequest(endpoint, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return this.makeRequest(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {
      method: 'PUT',
    });
  }

  async getPushSubscriptions(): Promise<ApiResponse<any[]>> {
    return this.makeRequest(API_ENDPOINTS.NOTIFICATIONS.PUSH_SUBSCRIPTIONS);
  }

  async createPushSubscription(
    subscriptionData: any
  ): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.NOTIFICATIONS.PUSH_SUBSCRIPTIONS, {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  async updatePushPreferences(preferences: any): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.NOTIFICATIONS.PUSH_PREFERENCES, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async getVapidKey(): Promise<ApiResponse<{ publicKey: string }>> {
    return this.makeRequest(API_ENDPOINTS.NOTIFICATIONS.VAPID_KEY);
  }

  // Community endpoints
  async getCommunityGardens(filters?: any): Promise<ApiResponse<any[]>> {
    const queryParams = filters
      ? `?${new URLSearchParams(filters).toString()}`
      : '';
    return this.makeRequest(`${API_ENDPOINTS.COMMUNITY.GARDENS}${queryParams}`);
  }

  async getCommunityGarden(gardenId: number): Promise<ApiResponse<any>> {
    const endpoint = API_ENDPOINTS.COMMUNITY.GARDEN.replace(
      ':id',
      gardenId.toString()
    );
    return this.makeRequest(endpoint);
  }

  async createCommunityGarden(gardenData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.COMMUNITY.GARDENS, {
      method: 'POST',
      body: JSON.stringify(gardenData),
    });
  }

  async joinCommunityGarden(gardenId: number): Promise<ApiResponse<void>> {
    const endpoint = API_ENDPOINTS.COMMUNITY.JOIN_GARDEN.replace(
      ':id',
      gardenId.toString()
    );
    return this.makeRequest(endpoint, {
      method: 'POST',
    });
  }

  async leaveCommunityGarden(gardenId: number): Promise<ApiResponse<void>> {
    const endpoint = API_ENDPOINTS.COMMUNITY.LEAVE_GARDEN.replace(
      ':id',
      gardenId.toString()
    );
    return this.makeRequest(endpoint, {
      method: 'POST',
    });
  }

  async getGroupChallenges(filters?: any): Promise<ApiResponse<any[]>> {
    const queryParams = filters
      ? `?${new URLSearchParams(filters).toString()}`
      : '';
    return this.makeRequest(
      `${API_ENDPOINTS.COMMUNITY.CHALLENGES}${queryParams}`
    );
  }

  async getGroupChallenge(challengeId: number): Promise<ApiResponse<any>> {
    const endpoint = API_ENDPOINTS.COMMUNITY.CHALLENGE.replace(
      ':id',
      challengeId.toString()
    );
    return this.makeRequest(endpoint);
  }

  async createGroupChallenge(challengeData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.COMMUNITY.CHALLENGES, {
      method: 'POST',
      body: JSON.stringify(challengeData),
    });
  }

  async joinGroupChallenge(challengeId: number): Promise<ApiResponse<any>> {
    const endpoint = API_ENDPOINTS.COMMUNITY.JOIN_CHALLENGE.replace(
      ':id',
      challengeId.toString()
    );
    return this.makeRequest(endpoint, {
      method: 'POST',
    });
  }

  async leaveGroupChallenge(challengeId: number): Promise<ApiResponse<void>> {
    const endpoint = API_ENDPOINTS.COMMUNITY.LEAVE_CHALLENGE.replace(
      ':id',
      challengeId.toString()
    );
    return this.makeRequest(endpoint, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();
export default apiService;
