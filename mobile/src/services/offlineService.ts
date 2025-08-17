import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export interface OfflineData {
  id: string;
  type: 'habit' | 'goal' | 'garden' | 'achievement' | 'social';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: number;
  pendingOperations: number;
  syncInProgress: boolean;
}

class OfflineService {
  private static instance: OfflineService;
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private lastSync: number = Date.now();
  private pendingOperations: OfflineData[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: ((status: SyncStatus) => void)[] = [];

  private constructor() {
    this.initializeOfflineService();
  }

  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  private async initializeOfflineService(): Promise<void> {
    try {
      // Load pending operations from storage
      await this.loadPendingOperations();

      // Set up network monitoring
      this.setupNetworkMonitoring();

      // Set up periodic sync
      this.setupPeriodicSync();

      // Initial sync status
      await this.updateSyncStatus();
    } catch (error) {
      console.error('Failed to initialize offline service:', error);
    }
  }

  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener((state) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (!wasOnline && this.isOnline) {
        // Came back online, trigger sync
        this.triggerSync();
      }

      this.notifyListeners();
    });
  }

  private setupPeriodicSync(): void {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.pendingOperations.length > 0) {
        this.triggerSync();
      }
    }, 5 * 60 * 1000);
  }

  public async addOfflineOperation(
    type: OfflineData['type'],
    action: OfflineData['action'],
    data: any
  ): Promise<void> {
    try {
      const offlineData: OfflineData = {
        id: `${type}_${action}_${Date.now()}_${Math.random()}`,
        type,
        action,
        data,
        timestamp: Date.now(),
        retryCount: 0,
      };

      this.pendingOperations.push(offlineData);
      await this.savePendingOperations();
      await this.updateSyncStatus();

      // Trigger sync if online
      if (this.isOnline) {
        this.triggerSync();
      }
    } catch (error) {
      console.error('Failed to add offline operation:', error);
    }
  }

  public async triggerSync(): Promise<void> {
    if (
      this.syncInProgress ||
      !this.isOnline ||
      this.pendingOperations.length === 0
    ) {
      return;
    }

    try {
      this.syncInProgress = true;
      await this.updateSyncStatus();

      const operationsToProcess = [...this.pendingOperations];

      for (const operation of operationsToProcess) {
        try {
          await this.processOperation(operation);

          // Remove successful operation
          this.pendingOperations = this.pendingOperations.filter(
            (op) => op.id !== operation.id
          );
        } catch (error) {
          console.error(`Failed to process operation ${operation.id}:`, error);

          // Increment retry count
          operation.retryCount++;

          // Remove operation if max retries exceeded
          if (operation.retryCount >= 3) {
            this.pendingOperations = this.pendingOperations.filter(
              (op) => op.id !== operation.id
            );
            console.warn(
              `Operation ${operation.id} exceeded max retries, removing`
            );
          }
        }
      }

      await this.savePendingOperations();
      this.lastSync = Date.now();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
      await this.updateSyncStatus();
    }
  }

  private async processOperation(operation: OfflineData): Promise<void> {
    // Simulate API call processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real implementation, this would make actual API calls
    // For now, we'll simulate success/failure based on retry count
    if (operation.retryCount > 0 && Math.random() < 0.3) {
      throw new Error('Simulated API failure');
    }

    console.log(
      `Successfully processed operation: ${operation.type} ${operation.action}`
    );
  }

  private async savePendingOperations(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'bloomhabit_offline_operations',
        JSON.stringify(this.pendingOperations)
      );
    } catch (error) {
      console.error('Failed to save pending operations:', error);
    }
  }

  private async loadPendingOperations(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(
        'bloomhabit_offline_operations'
      );
      if (stored) {
        this.pendingOperations = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load pending operations:', error);
    }
  }

  private async updateSyncStatus(): Promise<void> {
    try {
      const status: SyncStatus = {
        isOnline: this.isOnline,
        lastSync: this.lastSync,
        pendingOperations: this.pendingOperations.length,
        syncInProgress: this.syncInProgress,
      };

      await AsyncStorage.setItem(
        'bloomhabit_sync_status',
        JSON.stringify(status)
      );
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to update sync status:', error);
    }
  }

  public async getSyncStatus(): Promise<SyncStatus> {
    try {
      const stored = await AsyncStorage.getItem('bloomhabit_sync_status');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to get sync status:', error);
    }

    return {
      isOnline: this.isOnline,
      lastSync: this.lastSync,
      pendingOperations: this.pendingOperations.length,
      syncInProgress: this.syncInProgress,
    };
  }

  public addSyncStatusListener(listener: (status: SyncStatus) => void): void {
    this.listeners.push(listener);
  }

  public removeSyncStatusListener(
    listener: (status: SyncStatus) => void
  ): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private notifyListeners(): void {
    const status: SyncStatus = {
      isOnline: this.isOnline,
      lastSync: this.lastSync,
      pendingOperations: this.pendingOperations.length,
      syncInProgress: this.syncInProgress,
    };

    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in sync status listener:', error);
      }
    });
  }

  public async clearOfflineData(): Promise<void> {
    try {
      this.pendingOperations = [];
      await AsyncStorage.removeItem('bloomhabit_offline_operations');
      await AsyncStorage.removeItem('bloomhabit_sync_status');
      await this.updateSyncStatus();
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }

  public async getPendingOperationsCount(): Promise<number> {
    return this.pendingOperations.length;
  }

  public async getPendingOperations(): Promise<OfflineData[]> {
    return [...this.pendingOperations];
  }

  public isCurrentlyOnline(): boolean {
    return this.isOnline;
  }

  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.listeners = [];
  }
}

export default OfflineService;

