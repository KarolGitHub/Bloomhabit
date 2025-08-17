import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SmartwatchDevice {
  id: string;
  name: string;
  type: 'apple_watch' | 'android_wear' | 'garmin' | 'fitbit' | 'other';
  model: string;
  osVersion: string;
  isConnected: boolean;
  batteryLevel: number;
  lastSync: number;
  capabilities: SmartwatchCapabilities;
}

export interface SmartwatchCapabilities {
  notifications: boolean;
  healthTracking: boolean;
  habitLogging: boolean;
  progressViewing: boolean;
  customComplications: boolean;
  voiceCommands: boolean;
  hapticFeedback: boolean;
}

export interface SmartwatchMessage {
  id: string;
  type:
    | 'habit_log'
    | 'progress_request'
    | 'notification'
    | 'sync_request'
    | 'health_data';
  data: any;
  timestamp: number;
  acknowledged: boolean;
}

export interface SmartwatchComplication {
  id: string;
  type: 'habit_streak' | 'daily_progress' | 'next_habit' | 'weekly_stats';
  position:
    | 'top_left'
    | 'top_right'
    | 'bottom_left'
    | 'bottom_right'
    | 'center';
  data: any;
  lastUpdated: number;
  refreshInterval: number; // in minutes
}

export interface HealthData {
  steps: number;
  heartRate: number;
  sleepHours: number;
  calories: number;
  distance: number;
  timestamp: number;
}

class SmartwatchService {
  private static instance: SmartwatchService;
  private devices: Map<string, SmartwatchDevice> = new Map();
  private messages: Map<string, SmartwatchMessage> = new Map();
  private complications: Map<string, SmartwatchComplication> = new Map();
  private listeners: ((devices: SmartwatchDevice[]) => void)[] = [];
  private messageListeners: ((messages: SmartwatchMessage[]) => void)[] = [];
  private syncInProgress: boolean = false;

  private constructor() {
    this.initializeSmartwatchService();
  }

  public static getInstance(): SmartwatchService {
    if (!SmartwatchService.instance) {
      SmartwatchService.instance = new SmartwatchService();
    }
    return SmartwatchService.instance;
  }

  private async initializeSmartwatchService(): Promise<void> {
    try {
      await this.loadDevices();
      await this.loadMessages();
      await this.loadComplications();
      this.setupMockDevices();
    } catch (error) {
      console.error('Failed to initialize smartwatch service:', error);
    }
  }

  private setupMockDevices(): void {
    // Add mock devices for demonstration
    if (Platform.OS === 'ios') {
      this.addDevice({
        id: 'apple_watch_1',
        name: 'Apple Watch Series 7',
        type: 'apple_watch',
        model: 'Series 7',
        osVersion: 'watchOS 8.0',
        isConnected: true,
        batteryLevel: 85,
        lastSync: Date.now(),
        capabilities: {
          notifications: true,
          healthTracking: true,
          habitLogging: true,
          progressViewing: true,
          customComplications: true,
          voiceCommands: true,
          hapticFeedback: true,
        },
      });
    } else {
      this.addDevice({
        id: 'android_wear_1',
        name: 'Samsung Galaxy Watch 4',
        type: 'android_wear',
        model: 'Galaxy Watch 4',
        osVersion: 'Wear OS 3.0',
        isConnected: true,
        batteryLevel: 78,
        lastSync: Date.now(),
        capabilities: {
          notifications: true,
          healthTracking: true,
          habitLogging: true,
          progressViewing: true,
          customComplications: true,
          voiceCommands: false,
          hapticFeedback: true,
        },
      });
    }
  }

  public async addDevice(device: SmartwatchDevice): Promise<void> {
    try {
      this.devices.set(device.id, device);
      await this.saveDevices();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to add device:', error);
    }
  }

  public async removeDevice(deviceId: string): Promise<void> {
    try {
      this.devices.delete(deviceId);
      await this.saveDevices();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to remove device:', error);
    }
  }

  public async updateDevice(
    deviceId: string,
    updates: Partial<SmartwatchDevice>
  ): Promise<void> {
    try {
      const device = this.devices.get(deviceId);
      if (!device) {
        throw new Error(`Device ${deviceId} not found`);
      }

      const updatedDevice = { ...device, ...updates };
      this.devices.set(deviceId, updatedDevice);

      await this.saveDevices();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to update device:', error);
    }
  }

  public async getDevice(deviceId: string): Promise<SmartwatchDevice | null> {
    return this.devices.get(deviceId) || null;
  }

  public async getAllDevices(): Promise<SmartwatchDevice[]> {
    return Array.from(this.devices.values());
  }

  public async connectToDevice(deviceId: string): Promise<boolean> {
    try {
      const device = this.devices.get(deviceId);
      if (!device) {
        return false;
      }

      // Simulate connection process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      device.isConnected = true;
      device.lastSync = Date.now();

      await this.updateDevice(deviceId, device);

      // Send initial sync
      await this.syncWithDevice(deviceId);

      return true;
    } catch (error) {
      console.error('Failed to connect to device:', error);
      return false;
    }
  }

  public async disconnectFromDevice(deviceId: string): Promise<void> {
    try {
      const device = this.devices.get(deviceId);
      if (device) {
        device.isConnected = false;
        await this.updateDevice(deviceId, device);
      }
    } catch (error) {
      console.error('Failed to disconnect from device:', error);
    }
  }

  public async syncWithDevice(deviceId: string): Promise<void> {
    if (this.syncInProgress) {
      return;
    }

    try {
      this.syncInProgress = true;
      const device = this.devices.get(deviceId);

      if (!device || !device.isConnected) {
        return;
      }

      // Simulate sync process
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Update device sync time
      device.lastSync = Date.now();
      await this.updateDevice(deviceId, device);

      // Send complications data
      await this.sendComplicationsToDevice(deviceId);
    } catch (error) {
      console.error('Failed to sync with device:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  public async sendMessageToDevice(
    deviceId: string,
    type: SmartwatchMessage['type'],
    data: any
  ): Promise<string> {
    try {
      const device = this.devices.get(deviceId);
      if (!device || !device.isConnected) {
        throw new Error('Device not connected');
      }

      const message: SmartwatchMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: Date.now(),
        acknowledged: false,
      };

      this.messages.set(message.id, message);
      await this.saveMessages();
      this.notifyMessageListeners();

      // Simulate sending to device
      await new Promise((resolve) => setTimeout(resolve, 500));

      return message.id;
    } catch (error) {
      console.error('Failed to send message to device:', error);
      throw error;
    }
  }

  public async acknowledgeMessage(messageId: string): Promise<void> {
    try {
      const message = this.messages.get(messageId);
      if (message) {
        message.acknowledged = true;
        await this.saveMessages();
        this.notifyMessageListeners();
      }
    } catch (error) {
      console.error('Failed to acknowledge message:', error);
    }
  }

  public async getMessages(deviceId?: string): Promise<SmartwatchMessage[]> {
    const allMessages = Array.from(this.messages.values());
    if (deviceId) {
      // Filter by device if specified
      return allMessages.filter((msg) => msg.data.deviceId === deviceId);
    }
    return allMessages;
  }

  public async createComplication(
    type: SmartwatchComplication['type'],
    position: SmartwatchComplication['position'],
    refreshInterval: number = 15
  ): Promise<string> {
    try {
      const id = `complication_${type}_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const complication: SmartwatchComplication = {
        id,
        type,
        position,
        data: await this.generateComplicationData(type),
        lastUpdated: Date.now(),
        refreshInterval,
      };

      this.complications.set(id, complication);
      await this.saveComplications();

      return id;
    } catch (error) {
      console.error('Failed to create complication:', error);
      throw error;
    }
  }

  public async updateComplication(
    complicationId: string,
    updates: Partial<SmartwatchComplication>
  ): Promise<void> {
    try {
      const complication = this.complications.get(complicationId);
      if (!complication) {
        throw new Error(`Complication ${complicationId} not found`);
      }

      const updatedComplication = { ...complication, ...updates };
      this.complications.set(complicationId, updatedComplication);

      await this.saveComplications();
    } catch (error) {
      console.error('Failed to update complication:', error);
    }
  }

  public async deleteComplication(complicationId: string): Promise<void> {
    try {
      this.complications.delete(complicationId);
      await this.saveComplications();
    } catch (error) {
      console.error('Failed to delete complication:', error);
    }
  }

  public async getAllComplications(): Promise<SmartwatchComplication[]> {
    return Array.from(this.complications.values());
  }

  public async refreshComplication(complicationId: string): Promise<void> {
    try {
      const complication = this.complications.get(complicationId);
      if (!complication) {
        return;
      }

      const updatedData = await this.generateComplicationData(
        complication.type
      );
      await this.updateComplication(complicationId, {
        data: updatedData,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error('Failed to refresh complication:', error);
    }
  }

  private async generateComplicationData(
    type: SmartwatchComplication['type']
  ): Promise<any> {
    // Simulate generating complication data
    switch (type) {
      case 'habit_streak':
        return {
          currentStreak: 7,
          longestStreak: 21,
          habitName: 'Morning Exercise',
        };

      case 'daily_progress':
        return {
          completed: 3,
          total: 5,
          percentage: 60,
          goal: 'Complete 5 habits today',
        };

      case 'next_habit':
        return {
          habitName: 'Read 30 minutes',
          dueTime: '2:00 PM',
          category: 'Learning',
        };

      case 'weekly_stats':
        return {
          weeklyGoal: 35,
          completed: 28,
          daysRemaining: 2,
          onTrack: true,
        };

      default:
        return {};
    }
  }

  private async sendComplicationsToDevice(deviceId: string): Promise<void> {
    try {
      const complications = Array.from(this.complications.values());

      for (const complication of complications) {
        await this.sendMessageToDevice(deviceId, 'sync_request', {
          type: 'complication_update',
          complicationId: complication.id,
          data: complication.data,
        });
      }
    } catch (error) {
      console.error('Failed to send complications to device:', error);
    }
  }

  public async logHabitFromWatch(
    deviceId: string,
    habitId: string,
    notes?: string
  ): Promise<void> {
    try {
      // Send message to main app
      await this.sendMessageToDevice(deviceId, 'habit_log', {
        habitId,
        notes,
        source: 'smartwatch',
        timestamp: Date.now(),
      });

      // Update device sync time
      const device = this.devices.get(deviceId);
      if (device) {
        device.lastSync = Date.now();
        await this.updateDevice(deviceId, device);
      }
    } catch (error) {
      console.error('Failed to log habit from watch:', error);
    }
  }

  public async getHealthData(deviceId: string): Promise<HealthData | null> {
    try {
      const device = this.devices.get(deviceId);
      if (!device || !device.isConnected) {
        return null;
      }

      // Simulate health data retrieval
      const healthData: HealthData = {
        steps: Math.floor(Math.random() * 10000) + 5000,
        heartRate: Math.floor(Math.random() * 40) + 60,
        sleepHours: Math.random() * 3 + 6,
        calories: Math.floor(Math.random() * 500) + 1500,
        distance: Math.random() * 5 + 2,
        timestamp: Date.now(),
      };

      return healthData;
    } catch (error) {
      console.error('Failed to get health data:', error);
      return null;
    }
  }

  public async sendNotificationToWatch(
    deviceId: string,
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    try {
      await this.sendMessageToDevice(deviceId, 'notification', {
        title,
        body,
        data,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to send notification to watch:', error);
    }
  }

  private async saveDevices(): Promise<void> {
    try {
      const devicesArray = Array.from(this.devices.values());
      await AsyncStorage.setItem(
        'bloomhabit_smartwatch_devices',
        JSON.stringify(devicesArray)
      );
    } catch (error) {
      console.error('Failed to save devices:', error);
    }
  }

  private async loadDevices(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(
        'bloomhabit_smartwatch_devices'
      );
      if (stored) {
        const devicesArray = JSON.parse(stored);
        this.devices.clear();
        devicesArray.forEach((device: SmartwatchDevice) => {
          this.devices.set(device.id, device);
        });
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  }

  private async saveMessages(): Promise<void> {
    try {
      const messagesArray = Array.from(this.messages.values());
      await AsyncStorage.setItem(
        'bloomhabit_smartwatch_messages',
        JSON.stringify(messagesArray)
      );
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }

  private async loadMessages(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(
        'bloomhabit_smartwatch_messages'
      );
      if (stored) {
        const messagesArray = JSON.parse(stored);
        this.messages.clear();
        messagesArray.forEach((message: SmartwatchMessage) => {
          this.messages.set(message.id, message);
        });
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }

  private async saveComplications(): Promise<void> {
    try {
      const complicationsArray = Array.from(this.complications.values());
      await AsyncStorage.setItem(
        'bloomhabit_smartwatch_complications',
        JSON.stringify(complicationsArray)
      );
    } catch (error) {
      console.error('Failed to save complications:', error);
    }
  }

  private async loadComplications(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(
        'bloomhabit_smartwatch_complications'
      );
      if (stored) {
        const complicationsArray = JSON.parse(stored);
        this.complications.clear();
        complicationsArray.forEach((complication: SmartwatchComplication) => {
          this.complications.set(complication.id, complication);
        });
      }
    } catch (error) {
      console.error('Failed to load complications:', error);
    }
  }

  public addDeviceListener(
    listener: (devices: SmartwatchDevice[]) => void
  ): void {
    this.listeners.push(listener);
  }

  public removeDeviceListener(
    listener: (devices: SmartwatchDevice[]) => void
  ): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public addMessageListener(
    listener: (messages: SmartwatchMessage[]) => void
  ): void {
    this.messageListeners.push(listener);
  }

  public removeMessageListener(
    listener: (messages: SmartwatchMessage[]) => void
  ): void {
    this.messageListeners = this.messageListeners.filter((l) => l !== listener);
  }

  private notifyListeners(): void {
    const devicesArray = Array.from(this.devices.values());
    this.listeners.forEach((listener) => {
      try {
        listener(devicesArray);
      } catch (error) {
        console.error('Error in device listener:', error);
      }
    });
  }

  private notifyMessageListeners(): void {
    const messagesArray = Array.from(this.messages.values());
    this.messageListeners.forEach((listener) => {
      try {
        listener(messagesArray);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  public destroy(): void {
    this.listeners = [];
    this.messageListeners = [];
  }
}

export default SmartwatchService;

