import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface WidgetData {
  id: string;
  type: 'habit_log' | 'progress' | 'streak' | 'quick_actions';
  title: string;
  data: any;
  lastUpdated: number;
  refreshInterval: number; // in minutes
}

export interface WidgetConfig {
  id: string;
  type: WidgetData['type'];
  title: string;
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large';
  enabled: boolean;
  refreshInterval: number;
  customizations: {
    theme: 'light' | 'dark' | 'auto';
    colors: string[];
    showProgress: boolean;
    showStreak: boolean;
  };
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  action: 'log_habit' | 'check_progress' | 'view_garden' | 'set_reminder';
  habitId?: string;
  goalId?: string;
}

class WidgetService {
  private static instance: WidgetService;
  private widgets: Map<string, WidgetData> = new Map();
  private configs: Map<string, WidgetConfig> = new Map();
  private listeners: ((widgets: WidgetData[]) => void)[] = [];
  private refreshIntervals: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.initializeWidgetService();
  }

  public static getInstance(): WidgetService {
    if (!WidgetService.instance) {
      WidgetService.instance = new WidgetService();
    }
    return WidgetService.instance;
  }

  private async initializeWidgetService(): Promise<void> {
    try {
      await this.loadWidgets();
      await this.loadConfigs();
      this.setupRefreshIntervals();
    } catch (error) {
      console.error('Failed to initialize widget service:', error);
    }
  }

  public async createWidget(
    type: WidgetData['type'],
    title: string,
    config: Partial<WidgetConfig> = {}
  ): Promise<string> {
    try {
      const id = `widget_${type}_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const defaultConfig: WidgetConfig = {
        id,
        type,
        title,
        position: { x: 0, y: 0 },
        size: 'medium',
        enabled: true,
        refreshInterval: 15,
        customizations: {
          theme: 'auto',
          colors: ['#4CAF50', '#2196F3', '#FF9800', '#E91E63'],
          showProgress: true,
          showStreak: true,
        },
        ...config,
      };

      const widgetData: WidgetData = {
        id,
        type,
        title,
        data: await this.generateWidgetData(type),
        lastUpdated: Date.now(),
        refreshInterval: defaultConfig.refreshInterval,
      };

      this.widgets.set(id, widgetData);
      this.configs.set(id, defaultConfig);

      await this.saveWidgets();
      await this.saveConfigs();
      this.setupWidgetRefresh(id, defaultConfig.refreshInterval);
      this.notifyListeners();

      return id;
    } catch (error) {
      console.error('Failed to create widget:', error);
      throw error;
    }
  }

  public async updateWidget(
    id: string,
    updates: Partial<WidgetData>
  ): Promise<void> {
    try {
      const widget = this.widgets.get(id);
      if (!widget) {
        throw new Error(`Widget ${id} not found`);
      }

      const updatedWidget = { ...widget, ...updates, lastUpdated: Date.now() };
      this.widgets.set(id, updatedWidget);

      await this.saveWidgets();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to update widget:', error);
      throw error;
    }
  }

  public async updateWidgetConfig(
    id: string,
    updates: Partial<WidgetConfig>
  ): Promise<void> {
    try {
      const config = this.configs.get(id);
      if (!config) {
        throw new Error(`Widget config ${id} not found`);
      }

      const updatedConfig = { ...config, ...updates };
      this.configs.set(id, updatedConfig);

      // Update refresh interval if changed
      if (updates.refreshInterval !== undefined) {
        this.updateWidgetRefresh(id, updates.refreshInterval);
      }

      await this.saveConfigs();
    } catch (error) {
      console.error('Failed to update widget config:', error);
      throw error;
    }
  }

  public async deleteWidget(id: string): Promise<void> {
    try {
      this.widgets.delete(id);
      this.configs.delete(id);

      // Clear refresh interval
      const interval = this.refreshIntervals.get(id);
      if (interval) {
        clearInterval(interval);
        this.refreshIntervals.delete(id);
      }

      await this.saveWidgets();
      await this.saveConfigs();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to delete widget:', error);
      throw error;
    }
  }

  public async getWidget(id: string): Promise<WidgetData | null> {
    return this.widgets.get(id) || null;
  }

  public async getWidgetConfig(id: string): Promise<WidgetConfig | null> {
    return this.configs.get(id) || null;
  }

  public async getAllWidgets(): Promise<WidgetData[]> {
    return Array.from(this.widgets.values());
  }

  public async getAllConfigs(): Promise<WidgetConfig[]> {
    return Array.from(this.configs.values());
  }

  public async refreshWidget(id: string): Promise<void> {
    try {
      const widget = this.widgets.get(id);
      if (!widget) {
        return;
      }

      const updatedData = await this.generateWidgetData(widget.type);
      await this.updateWidget(id, { data: updatedData });
    } catch (error) {
      console.error('Failed to refresh widget:', error);
    }
  }

  public async refreshAllWidgets(): Promise<void> {
    try {
      const widgetIds = Array.from(this.widgets.keys());
      await Promise.all(widgetIds.map((id) => this.refreshWidget(id)));
    } catch (error) {
      console.error('Failed to refresh all widgets:', error);
    }
  }

  private async generateWidgetData(type: WidgetData['type']): Promise<any> {
    // Simulate generating widget data based on type
    switch (type) {
      case 'habit_log':
        return {
          habits: [
            { id: '1', name: 'Morning Exercise', completed: false, streak: 5 },
            { id: '2', name: 'Read 30 min', completed: true, streak: 12 },
            { id: '3', name: 'Drink Water', completed: false, streak: 3 },
          ],
          totalHabits: 3,
          completedToday: 1,
        };

      case 'progress':
        return {
          currentStreak: 7,
          longestStreak: 21,
          weeklyProgress: [85, 90, 75, 95, 80, 88, 92],
          monthlyGoal: 80,
          currentMonth: 87,
        };

      case 'streak':
        return {
          currentStreak: 7,
          longestStreak: 21,
          totalDays: 45,
          streakType: 'daily',
          nextMilestone: 10,
        };

      case 'quick_actions':
        return {
          actions: [
            {
              id: '1',
              title: 'Log Exercise',
              icon: '🏃‍♂️',
              action: 'log_habit',
              habitId: '1',
            },
            {
              id: '2',
              title: 'Check Progress',
              icon: '📊',
              action: 'check_progress',
            },
            {
              id: '3',
              title: 'View Garden',
              icon: '🌱',
              action: 'view_garden',
            },
            {
              id: '4',
              title: 'Set Reminder',
              icon: '⏰',
              action: 'set_reminder',
            },
          ],
        };

      default:
        return {};
    }
  }

  private setupRefreshIntervals(): void {
    this.configs.forEach((config, id) => {
      if (config.enabled) {
        this.setupWidgetRefresh(id, config.refreshInterval);
      }
    });
  }

  private setupWidgetRefresh(id: string, intervalMinutes: number): void {
    // Clear existing interval
    const existingInterval = this.refreshIntervals.get(id);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Set up new interval
    const interval = setInterval(() => {
      this.refreshWidget(id);
    }, intervalMinutes * 60 * 1000);

    this.refreshIntervals.set(id, interval);
  }

  private updateWidgetRefresh(id: string, newIntervalMinutes: number): void {
    this.setupWidgetRefresh(id, newIntervalMinutes);
  }

  public async getQuickActions(): Promise<QuickAction[]> {
    // Return predefined quick actions
    return [
      {
        id: '1',
        title: 'Log Exercise',
        icon: '🏃‍♂️',
        action: 'log_habit',
        habitId: '1',
      },
      {
        id: '2',
        title: 'Check Progress',
        icon: '📊',
        action: 'check_progress',
      },
      { id: '3', title: 'View Garden', icon: '🌱', action: 'view_garden' },
      { id: '4', title: 'Set Reminder', icon: '⏰', action: 'set_reminder' },
      {
        id: '5',
        title: 'Log Reading',
        icon: '📚',
        action: 'log_habit',
        habitId: '2',
      },
      {
        id: '6',
        title: 'Log Water',
        icon: '💧',
        action: 'log_habit',
        habitId: '3',
      },
    ];
  }

  public async executeQuickAction(action: QuickAction): Promise<void> {
    try {
      switch (action.action) {
        case 'log_habit':
          if (action.habitId) {
            await this.logHabit(action.habitId);
          }
          break;
        case 'check_progress':
          await this.checkProgress();
          break;
        case 'view_garden':
          await this.viewGarden();
          break;
        case 'set_reminder':
          await this.setReminder();
          break;
      }
    } catch (error) {
      console.error('Failed to execute quick action:', error);
    }
  }

  private async logHabit(habitId: string): Promise<void> {
    // Simulate logging a habit
    console.log(`Logging habit: ${habitId}`);
    // In a real implementation, this would update the habit status
  }

  private async checkProgress(): Promise<void> {
    // Simulate checking progress
    console.log('Checking progress...');
    // In a real implementation, this would navigate to progress screen
  }

  private async viewGarden(): Promise<void> {
    // Simulate viewing garden
    console.log('Viewing garden...');
    // In a real implementation, this would navigate to garden screen
  }

  private async setReminder(): Promise<void> {
    // Simulate setting reminder
    console.log('Setting reminder...');
    // In a real implementation, this would open reminder settings
  }

  private async saveWidgets(): Promise<void> {
    try {
      const widgetsArray = Array.from(this.widgets.values());
      await AsyncStorage.setItem(
        'bloomhabit_widgets',
        JSON.stringify(widgetsArray)
      );
    } catch (error) {
      console.error('Failed to save widgets:', error);
    }
  }

  private async loadWidgets(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('bloomhabit_widgets');
      if (stored) {
        const widgetsArray = JSON.parse(stored);
        this.widgets.clear();
        widgetsArray.forEach((widget: WidgetData) => {
          this.widgets.set(widget.id, widget);
        });
      }
    } catch (error) {
      console.error('Failed to load widgets:', error);
    }
  }

  private async saveConfigs(): Promise<void> {
    try {
      const configsArray = Array.from(this.configs.values());
      await AsyncStorage.setItem(
        'bloomhabit_widget_configs',
        JSON.stringify(configsArray)
      );
    } catch (error) {
      console.error('Failed to save widget configs:', error);
    }
  }

  private async loadConfigs(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('bloomhabit_widget_configs');
      if (stored) {
        const configsArray = JSON.parse(stored);
        this.configs.clear();
        configsArray.forEach((config: WidgetConfig) => {
          this.configs.set(config.id, config);
        });
      }
    } catch (error) {
      console.error('Failed to load widget configs:', error);
    }
  }

  public addWidgetListener(listener: (widgets: WidgetData[]) => void): void {
    this.listeners.push(listener);
  }

  public removeWidgetListener(listener: (widgets: WidgetData[]) => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private notifyListeners(): void {
    const widgetsArray = Array.from(this.widgets.values());
    this.listeners.forEach((listener) => {
      try {
        listener(widgetsArray);
      } catch (error) {
        console.error('Error in widget listener:', error);
      }
    });
  }

  public destroy(): void {
    // Clear all refresh intervals
    this.refreshIntervals.forEach((interval) => clearInterval(interval));
    this.refreshIntervals.clear();

    // Clear listeners
    this.listeners = [];
  }
}

export default WidgetService;

