import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export interface SyncTask {
  id: string;
  type:
    | 'habits'
    | 'goals'
    | 'garden'
    | 'achievements'
    | 'social'
    | 'health'
    | 'settings';
  priority: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  scheduledFor: number;
  lastAttempt: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  errorMessage?: string;
}

export interface SyncConfig {
  autoSync: boolean;
  syncInterval: number; // in minutes
  syncOnWifiOnly: boolean;
  syncOnCharging: boolean;
  syncOnAppForeground: boolean;
  syncOnNetworkChange: boolean;
  maxConcurrentTasks: number;
  retryDelays: number[]; // in minutes
}

export interface SyncStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  pendingTasks: number;
  lastSync: number;
  nextSync: number;
  syncInProgress: boolean;
  networkStatus: 'wifi' | 'cellular' | 'none';
  batteryLevel: number;
  isCharging: boolean;
}

class BackgroundSyncService {
  private static instance: BackgroundSyncService;
  private syncTasks: Map<string, SyncTask> = new Map();
  private syncConfig: SyncConfig;
  private syncStats: SyncStats;
  private syncInProgress: boolean = false;
  private activeTasks: Set<string> = new Set();
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: ((stats: SyncStats) => void)[] = [];
  private taskListeners: ((tasks: SyncTask[]) => void)[] = [];

  private constructor() {
    this.syncConfig = this.getDefaultConfig();
    this.syncStats = this.getDefaultStats();
    this.initializeBackgroundSyncService();
  }

  public static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  private getDefaultConfig(): SyncConfig {
    return {
      autoSync: true,
      syncInterval: 15, // 15 minutes
      syncOnWifiOnly: false,
      syncOnCharging: false,
      syncOnAppForeground: true,
      syncOnNetworkChange: true,
      maxConcurrentTasks: 3,
      retryDelays: [1, 5, 15, 30, 60], // 1, 5, 15, 30, 60 minutes
    };
  }

  private getDefaultStats(): SyncStats {
    return {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      pendingTasks: 0,
      lastSync: 0,
      nextSync: 0,
      syncInProgress: false,
      networkStatus: 'none',
      batteryLevel: 100,
      isCharging: false,
    };
  }

  private async initializeBackgroundSyncService(): Promise<void> {
    try {
      await this.loadSyncTasks();
      await this.loadSyncConfig();
      await this.loadSyncStats();

      this.setupNetworkMonitoring();
      this.setupPeriodicSync();
      this.setupBatteryMonitoring();

      // Initial sync if conditions are met
      if (this.shouldStartSync()) {
        this.triggerSync();
      }
    } catch (error) {
      console.error('Failed to initialize background sync service:', error);
    }
  }

  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener((state) => {
      const wasConnected = this.syncStats.networkStatus !== 'none';
      const isConnected = state.isConnected ?? false;

      if (state.type === 'wifi') {
        this.syncStats.networkStatus = 'wifi';
      } else if (state.type === 'cellular') {
        this.syncStats.networkStatus = 'cellular';
      } else {
        this.syncStats.networkStatus = 'none';
      }

      // Trigger sync on network change if enabled
      if (this.syncConfig.syncOnNetworkChange && !wasConnected && isConnected) {
        this.triggerSync();
      }

      this.notifyListeners();
    });
  }

  private setupPeriodicSync(): void {
    if (this.syncConfig.autoSync) {
      this.syncInterval = setInterval(() => {
        if (this.shouldStartSync()) {
          this.triggerSync();
        }
      }, this.syncConfig.syncInterval * 60 * 1000);
    }
  }

  private setupBatteryMonitoring(): void {
    // In a real implementation, this would use device battery APIs
    // For now, we'll simulate battery monitoring
    setInterval(() => {
      // Simulate battery level changes
      this.syncStats.batteryLevel = Math.max(
        0,
        this.syncStats.batteryLevel - Math.random() * 2
      );
      if (this.syncStats.batteryLevel < 20) {
        this.syncStats.isCharging = true;
      }
      this.notifyListeners();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private shouldStartSync(): boolean {
    if (
      this.syncInProgress ||
      this.activeTasks.size >= this.syncConfig.maxConcurrentTasks
    ) {
      return false;
    }

    if (
      this.syncConfig.syncOnWifiOnly &&
      this.syncStats.networkStatus !== 'wifi'
    ) {
      return false;
    }

    if (this.syncConfig.syncOnCharging && !this.syncStats.isCharging) {
      return false;
    }

    return true;
  }

  public async addSyncTask(
    type: SyncTask['type'],
    data: any,
    priority: SyncTask['priority'] = 'medium',
    scheduledFor?: number
  ): Promise<string> {
    try {
      const id = `sync_${type}_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const task: SyncTask = {
        id,
        type,
        priority,
        data,
        retryCount: 0,
        maxRetries: 5,
        createdAt: Date.now(),
        scheduledFor: scheduledFor || Date.now(),
        lastAttempt: 0,
        status: 'pending',
      };

      this.syncTasks.set(id, task);
      await this.saveSyncTasks();
      await this.updateSyncStats();
      this.notifyTaskListeners();

      // Trigger sync if conditions are met
      if (this.shouldStartSync()) {
        this.triggerSync();
      }

      return id;
    } catch (error) {
      console.error('Failed to add sync task:', error);
      throw error;
    }
  }

  public async triggerSync(): Promise<void> {
    if (!this.shouldStartSync()) {
      return;
    }

    try {
      this.syncInProgress = true;
      this.syncStats.syncInProgress = true;
      await this.updateSyncStats();
      this.notifyListeners();

      const pendingTasks = Array.from(this.syncTasks.values())
        .filter(
          (task) => task.status === 'pending' && task.scheduledFor <= Date.now()
        )
        .sort(
          (a, b) =>
            this.getPriorityScore(b.priority) -
            this.getPriorityScore(a.priority)
        );

      // Process tasks up to max concurrent limit
      const tasksToProcess = pendingTasks.slice(
        0,
        this.syncConfig.maxConcurrentTasks
      );

      if (tasksToProcess.length === 0) {
        return;
      }

      // Process tasks concurrently
      const processPromises = tasksToProcess.map((task) =>
        this.processSyncTask(task)
      );
      await Promise.allSettled(processPromises);

      this.syncStats.lastSync = Date.now();
      this.syncStats.nextSync =
        Date.now() + this.syncConfig.syncInterval * 60 * 1000;
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
      this.syncStats.syncInProgress = false;
      await this.updateSyncStats();
      this.notifyListeners();
    }
  }

  private async processSyncTask(task: SyncTask): Promise<void> {
    try {
      this.activeTasks.add(task.id);
      task.status = 'in_progress';
      task.lastAttempt = Date.now();

      await this.updateTask(task);
      this.notifyTaskListeners();

      // Simulate sync processing
      await new Promise((resolve) =>
        setTimeout(resolve, 2000 + Math.random() * 3000)
      );

      // Simulate success/failure based on retry count
      if (task.retryCount > 0 && Math.random() < 0.3) {
        throw new Error('Simulated sync failure');
      }

      task.status = 'completed';
      this.syncStats.completedTasks++;
    } catch (error) {
      console.error(`Failed to process sync task ${task.id}:`, error);

      task.retryCount++;
      task.errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (task.retryCount >= task.maxRetries) {
        task.status = 'failed';
        this.syncStats.failedTasks++;
      } else {
        task.status = 'pending';
        // Reschedule based on retry delay
        const delayIndex = Math.min(
          task.retryCount - 1,
          this.syncConfig.retryDelays.length - 1
        );
        task.scheduledFor =
          Date.now() + this.syncConfig.retryDelays[delayIndex] * 60 * 1000;
      }
    } finally {
      this.activeTasks.delete(task.id);
      await this.updateTask(task);
      await this.updateSyncStats();
      this.notifyTaskListeners();
    }
  }

  private getPriorityScore(priority: SyncTask['priority']): number {
    switch (priority) {
      case 'critical':
        return 4;
      case 'high':
        return 3;
      case 'medium':
        return 2;
      case 'low':
        return 1;
      default:
        return 0;
    }
  }

  public async cancelSyncTask(taskId: string): Promise<void> {
    try {
      const task = this.syncTasks.get(taskId);
      if (task) {
        task.status = 'cancelled';
        await this.updateTask(task);
        await this.updateSyncStats();
        this.notifyTaskListeners();
      }
    } catch (error) {
      console.error('Failed to cancel sync task:', error);
    }
  }

  public async retrySyncTask(taskId: string): Promise<void> {
    try {
      const task = this.syncTasks.get(taskId);
      if (task && task.status === 'failed') {
        task.status = 'pending';
        task.retryCount = 0;
        task.errorMessage = undefined;
        task.scheduledFor = Date.now();

        await this.updateTask(task);
        await this.updateSyncStats();
        this.notifyTaskListeners();

        // Trigger sync if conditions are met
        if (this.shouldStartSync()) {
          this.triggerSync();
        }
      }
    } catch (error) {
      console.error('Failed to retry sync task:', error);
    }
  }

  public async getSyncTask(taskId: string): Promise<SyncTask | null> {
    return this.syncTasks.get(taskId) || null;
  }

  public async getAllSyncTasks(): Promise<SyncTask[]> {
    return Array.from(this.syncTasks.values());
  }

  public async getPendingSyncTasks(): Promise<SyncTask[]> {
    return Array.from(this.syncTasks.values()).filter(
      (task) => task.status === 'pending'
    );
  }

  public async getSyncConfig(): Promise<SyncConfig> {
    return { ...this.syncConfig };
  }

  public async updateSyncConfig(updates: Partial<SyncConfig>): Promise<void> {
    try {
      this.syncConfig = { ...this.syncConfig, ...updates };

      // Update periodic sync if interval changed
      if (
        updates.syncInterval !== undefined ||
        updates.autoSync !== undefined
      ) {
        if (this.syncInterval) {
          clearInterval(this.syncInterval);
        }
        this.setupPeriodicSync();
      }

      await this.saveSyncConfig();
    } catch (error) {
      console.error('Failed to update sync config:', error);
    }
  }

  public async getSyncStats(): Promise<SyncStats> {
    return { ...this.syncStats };
  }

  public async clearCompletedTasks(): Promise<void> {
    try {
      const completedTasks = Array.from(this.syncTasks.values()).filter(
        (task) => task.status === 'completed'
      );

      completedTasks.forEach((task) => {
        this.syncTasks.delete(task.id);
      });

      await this.saveSyncTasks();
      await this.updateSyncStats();
      this.notifyTaskListeners();
    } catch (error) {
      console.error('Failed to clear completed tasks:', error);
    }
  }

  public async clearAllTasks(): Promise<void> {
    try {
      this.syncTasks.clear();
      this.activeTasks.clear();

      await this.saveSyncTasks();
      await this.updateSyncStats();
      this.notifyTaskListeners();
    } catch (error) {
      console.error('Failed to clear all tasks:', error);
    }
  }

  private async updateTask(task: SyncTask): Promise<void> {
    try {
      this.syncTasks.set(task.id, task);
      await this.saveSyncTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }

  private async updateSyncStats(): Promise<void> {
    try {
      const tasks = Array.from(this.syncTasks.values());

      this.syncStats.totalTasks = tasks.length;
      this.syncStats.completedTasks = tasks.filter(
        (t) => t.status === 'completed'
      ).length;
      this.syncStats.failedTasks = tasks.filter(
        (t) => t.status === 'failed'
      ).length;
      this.syncStats.pendingTasks = tasks.filter(
        (t) => t.status === 'pending'
      ).length;

      await this.saveSyncStats();
    } catch (error) {
      console.error('Failed to update sync stats:', error);
    }
  }

  private async saveSyncTasks(): Promise<void> {
    try {
      const tasksArray = Array.from(this.syncTasks.values());
      await AsyncStorage.setItem(
        'bloomhabit_sync_tasks',
        JSON.stringify(tasksArray)
      );
    } catch (error) {
      console.error('Failed to save sync tasks:', error);
    }
  }

  private async loadSyncTasks(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('bloomhabit_sync_tasks');
      if (stored) {
        const tasksArray = JSON.parse(stored);
        this.syncTasks.clear();
        tasksArray.forEach((task: SyncTask) => {
          this.syncTasks.set(task.id, task);
        });
      }
    } catch (error) {
      console.error('Failed to load sync tasks:', error);
    }
  }

  private async saveSyncConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'bloomhabit_sync_config',
        JSON.stringify(this.syncConfig)
      );
    } catch (error) {
      console.error('Failed to save sync config:', error);
    }
  }

  private async loadSyncConfig(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('bloomhabit_sync_config');
      if (stored) {
        this.syncConfig = { ...this.syncConfig, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load sync config:', error);
    }
  }

  private async saveSyncStats(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'bloomhabit_sync_stats',
        JSON.stringify(this.syncStats)
      );
    } catch (error) {
      console.error('Failed to save sync stats:', error);
    }
  }

  private async loadSyncStats(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('bloomhabit_sync_stats');
      if (stored) {
        this.syncStats = { ...this.syncStats, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load sync stats:', error);
    }
  }

  public addSyncStatsListener(listener: (stats: SyncStats) => void): void {
    this.listeners.push(listener);
  }

  public removeSyncStatsListener(listener: (stats: SyncStats) => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public addTaskListener(listener: (tasks: SyncTask[]) => void): void {
    this.taskListeners.push(listener);
  }

  public removeTaskListener(listener: (tasks: SyncTask[]) => void): void {
    this.taskListeners = this.taskListeners.filter((l) => l !== listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener({ ...this.syncStats });
      } catch (error) {
        console.error('Error in sync stats listener:', error);
      }
    });
  }

  private notifyTaskListeners(): void {
    const tasksArray = Array.from(this.syncTasks.values());
    this.taskListeners.forEach((listener) => {
      try {
        listener(tasksArray);
      } catch (error) {
        console.error('Error in task listener:', error);
      }
    });
  }

  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.listeners = [];
    this.taskListeners = [];
  }
}

export default BackgroundSyncService;

