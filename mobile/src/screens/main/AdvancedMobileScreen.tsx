import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} from '@expo/vector-icons';

import OfflineService, { SyncStatus } from '../../services/offlineService';
import WidgetService, {
  WidgetData,
  QuickAction,
} from '../../services/widgetService';
import SmartwatchService, {
  SmartwatchDevice,
  SmartwatchComplication,
} from '../../services/smartwatchService';
import BackgroundSyncService, {
  SyncStats,
  SyncTask,
} from '../../services/backgroundSyncService';

const AdvancedMobileScreen: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [widgets, setWidgets] = useState<WidgetData[]>([]);
  const [devices, setDevices] = useState<SmartwatchDevice[]>([]);
  const [complications, setComplications] = useState<SmartwatchComplication[]>(
    []
  );
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [syncTasks, setSyncTasks] = useState<SyncTask[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'offline' | 'widgets' | 'smartwatch' | 'sync'
  >('overview');

  useEffect(() => {
    loadData();
    setupListeners();
    return () => cleanupListeners();
  }, []);

  const loadData = async () => {
    try {
      const [
        offlineStatus,
        widgetsData,
        devicesData,
        complicationsData,
        syncStatsData,
        syncTasksData,
      ] = await Promise.all([
        OfflineService.getInstance().getSyncStatus(),
        WidgetService.getInstance().getAllWidgets(),
        SmartwatchService.getInstance().getAllDevices(),
        SmartwatchService.getInstance().getAllComplications(),
        BackgroundSyncService.getInstance().getSyncStats(),
        BackgroundSyncService.getInstance().getAllSyncTasks(),
      ]);

      setSyncStatus(offlineStatus);
      setWidgets(widgetsData);
      setDevices(devicesData);
      setComplications(complicationsData);
      setSyncStats(syncStatsData);
      setSyncTasks(syncTasksData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const setupListeners = () => {
    const offlineService = OfflineService.getInstance();
    const widgetService = WidgetService.getInstance();
    const smartwatchService = SmartwatchService.getInstance();
    const backgroundSyncService = BackgroundSyncService.getInstance();

    offlineService.addSyncStatusListener(setSyncStatus);
    widgetService.addWidgetListener(setWidgets);
    smartwatchService.addDeviceListener(setDevices);
    smartwatchService.addMessageListener(() => {}); // We don't need to update UI for messages
    backgroundSyncService.addSyncStatsListener(setSyncStats);
    backgroundSyncService.addTaskListener(setSyncTasks);
  };

  const cleanupListeners = () => {
    const offlineService = OfflineService.getInstance();
    const widgetService = WidgetService.getInstance();
    const smartwatchService = SmartwatchService.getInstance();
    const backgroundSyncService = BackgroundSyncService.getInstance();

    offlineService.removeSyncStatusListener(setSyncStatus);
    widgetService.removeWidgetListener(setWidgets);
    smartwatchService.removeDeviceListener(setDevices);
    backgroundSyncService.removeSyncStatsListener(setSyncStats);
    backgroundSyncService.removeTaskListener(setSyncTasks);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateWidget = async (type: WidgetData['type']) => {
    try {
      const widgetId = await WidgetService.getInstance().createWidget(
        type,
        `${type.replace('_', ' ')} Widget`
      );
      Alert.alert('Success', `Widget created with ID: ${widgetId}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create widget');
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    try {
      await WidgetService.getInstance().executeQuickAction(action);
      Alert.alert('Success', `Executed: ${action.title}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to execute quick action');
    }
  };

  const handleConnectDevice = async (deviceId: string) => {
    try {
      const success = await SmartwatchService.getInstance().connectToDevice(
        deviceId
      );
      if (success) {
        Alert.alert('Success', 'Device connected successfully');
      } else {
        Alert.alert('Error', 'Failed to connect to device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to device');
    }
  };

  const handleSyncNow = async () => {
    try {
      await OfflineService.getInstance().triggerSync();
      Alert.alert('Success', 'Sync triggered successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to trigger sync');
    }
  };

  const handleBackgroundSync = async () => {
    try {
      await BackgroundSyncService.getInstance().triggerSync();
      Alert.alert('Success', 'Background sync triggered');
    } catch (error) {
      Alert.alert('Error', 'Failed to trigger background sync');
    }
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialIcons name='wifi' size={24} color='#4CAF50' />
          <Text style={styles.statNumber}>
            {syncStatus?.isOnline ? 'Online' : 'Offline'}
          </Text>
          <Text style={styles.statLabel}>Network Status</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialIcons name='sync' size={24} color='#2196F3' />
          <Text style={styles.statNumber}>
            {syncStatus?.pendingOperations || 0}
          </Text>
          <Text style={styles.statLabel}>Pending Operations</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialIcons name='watch' size={24} color='#FF9800' />
          <Text style={styles.statNumber}>{devices.length}</Text>
          <Text style={styles.statLabel}>Connected Devices</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialIcons name='dashboard' size={24} color='#E91E63' />
          <Text style={styles.statNumber}>{widgets.length}</Text>
          <Text style={styles.statLabel}>Active Widgets</Text>
        </View>
      </View>

      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleSyncNow}
          >
            <MaterialIcons name='sync' size={24} color='#2196F3' />
            <Text style={styles.quickActionText}>Sync Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleBackgroundSync}
          >
            <MaterialIcons name='background' size={24} color='#4CAF50' />
            <Text style={styles.quickActionText}>Background Sync</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleCreateWidget('habit_log')}
          >
            <MaterialIcons name='add' size={24} color='#FF9800' />
            <Text style={styles.quickActionText}>Add Widget</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setActiveTab('smartwatch')}
          >
            <MaterialIcons name='watch' size={24} color='#E91E63' />
            <Text style={styles.quickActionText}>Manage Devices</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderOffline = () => (
    <View style={styles.tabContent}>
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Offline Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Network:</Text>
          <Text
            style={[
              styles.statusValue,
              { color: syncStatus?.isOnline ? '#4CAF50' : '#F44336' },
            ]}
          >
            {syncStatus?.isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Pending Operations:</Text>
          <Text style={styles.statusValue}>
            {syncStatus?.pendingOperations || 0}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Last Sync:</Text>
          <Text style={styles.statusValue}>
            {syncStatus?.lastSync
              ? new Date(syncStatus.lastSync).toLocaleString()
              : 'Never'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Sync Status:</Text>
          <Text
            style={[
              styles.statusValue,
              { color: syncStatus?.syncInProgress ? '#FF9800' : '#4CAF50' },
            ]}
          >
            {syncStatus?.syncInProgress ? 'In Progress' : 'Idle'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.actionButton} onPress={handleSyncNow}>
        <Text style={styles.actionButtonText}>Trigger Manual Sync</Text>
      </TouchableOpacity>
    </View>
  );

  const renderWidgets = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Active Widgets ({widgets.length})
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleCreateWidget('progress')}
        >
          <MaterialIcons name='add' size={20} color='#FFF' />
        </TouchableOpacity>
      </View>

      {widgets.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name='dashboard' size={48} color='#CCC' />
          <Text style={styles.emptyStateText}>No widgets created yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Create widgets to get quick access to your habits and progress
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.widgetsList}>
          {widgets.map((widget) => (
            <View key={widget.id} style={styles.widgetCard}>
              <View style={styles.widgetHeader}>
                <Text style={styles.widgetTitle}>{widget.title}</Text>
                <Text style={styles.widgetType}>
                  {widget.type.replace('_', ' ')}
                </Text>
              </View>
              <Text style={styles.widgetLastUpdated}>
                Last updated: {new Date(widget.lastUpdated).toLocaleString()}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() =>
              handleQuickAction({
                id: '1',
                title: 'Log Exercise',
                icon: '🏃‍♂️',
                action: 'log_habit',
                habitId: '1',
              })
            }
          >
            <Text style={styles.quickActionIcon}>🏃‍♂️</Text>
            <Text style={styles.quickActionText}>Log Exercise</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() =>
              handleQuickAction({
                id: '2',
                title: 'Check Progress',
                icon: '📊',
                action: 'check_progress',
              })
            }
          >
            <Text style={styles.quickActionIcon}>📊</Text>
            <Text style={styles.quickActionText}>Check Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() =>
              handleQuickAction({
                id: '3',
                title: 'View Garden',
                icon: '🌱',
                action: 'view_garden',
              })
            }
          >
            <Text style={styles.quickActionIcon}>🌱</Text>
            <Text style={styles.quickActionText}>View Garden</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() =>
              handleQuickAction({
                id: '4',
                title: 'Set Reminder',
                icon: '⏰',
                action: 'set_reminder',
              })
            }
          >
            <Text style={styles.quickActionIcon}>⏰</Text>
            <Text style={styles.quickActionText}>Set Reminder</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderSmartwatch = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Smartwatch Devices ({devices.length})
        </Text>
      </View>

      {devices.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name='watch' size={48} color='#CCC' />
          <Text style={styles.emptyStateText}>No devices connected</Text>
          <Text style={styles.emptyStateSubtext}>
            Connect your smartwatch to enable advanced features
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.devicesList}>
          {devices.map((device) => (
            <View key={device.id} style={styles.deviceCard}>
              <View style={styles.deviceHeader}>
                <MaterialIcons
                  name={device.type === 'apple_watch' ? 'watch' : 'watch'}
                  size={24}
                  color={device.isConnected ? '#4CAF50' : '#F44336'}
                />
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Text style={styles.deviceModel}>
                    {device.model} - {device.osVersion}
                  </Text>
                </View>
                <View style={styles.deviceStatus}>
                  <Text
                    style={[
                      styles.deviceStatusText,
                      { color: device.isConnected ? '#4CAF50' : '#F44336' },
                    ]}
                  >
                    {device.isConnected ? 'Connected' : 'Disconnected'}
                  </Text>
                  <Text style={styles.deviceBattery}>
                    {device.batteryLevel}%
                  </Text>
                </View>
              </View>

              {device.isConnected && (
                <View style={styles.deviceActions}>
                  <TouchableOpacity
                    style={styles.deviceActionButton}
                    onPress={() => handleConnectDevice(device.id)}
                  >
                    <Text style={styles.deviceActionText}>Sync Now</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.complicationsSection}>
        <Text style={styles.sectionTitle}>
          Watch Complications ({complications.length})
        </Text>
        {complications.length === 0 ? (
          <Text style={styles.emptyStateSubtext}>
            No complications configured
          </Text>
        ) : (
          <ScrollView horizontal style={styles.complicationsList}>
            {complications.map((complication) => (
              <View key={complication.id} style={styles.complicationCard}>
                <Text style={styles.complicationType}>
                  {complication.type.replace('_', ' ')}
                </Text>
                <Text style={styles.complicationPosition}>
                  {complication.position}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );

  const renderSync = () => (
    <View style={styles.tabContent}>
      {syncStats && (
        <View style={styles.syncStatsCard}>
          <Text style={styles.syncStatsTitle}>Background Sync Statistics</Text>
          <View style={styles.syncStatsGrid}>
            <View style={styles.syncStatItem}>
              <Text style={styles.syncStatNumber}>{syncStats.totalTasks}</Text>
              <Text style={styles.syncStatLabel}>Total Tasks</Text>
            </View>
            <View style={styles.syncStatItem}>
              <Text style={styles.syncStatNumber}>
                {syncStats.completedTasks}
              </Text>
              <Text style={styles.syncStatLabel}>Completed</Text>
            </View>
            <View style={styles.syncStatItem}>
              <Text style={styles.syncStatNumber}>{syncStats.failedTasks}</Text>
              <Text style={styles.syncStatLabel}>Failed</Text>
            </View>
            <View style={styles.syncStatItem}>
              <Text style={styles.syncStatNumber}>
                {syncStats.pendingTasks}
              </Text>
              <Text style={styles.syncStatLabel}>Pending</Text>
            </View>
          </View>

          <View style={styles.syncStatusRow}>
            <Text style={styles.syncStatusLabel}>Network:</Text>
            <Text
              style={[
                styles.syncStatusValue,
                {
                  color:
                    syncStats.networkStatus === 'wifi' ? '#4CAF50' : '#FF9800',
                },
              ]}
            >
              {syncStats.networkStatus.toUpperCase()}
            </Text>
          </View>
          <View style={styles.syncStatusRow}>
            <Text style={styles.syncStatusLabel}>Battery:</Text>
            <Text
              style={[
                styles.syncStatusValue,
                { color: syncStats.batteryLevel > 20 ? '#4CAF50' : '#F44336' },
              ]}
            >
              {syncStats.batteryLevel}%{' '}
              {syncStats.isCharging ? '(Charging)' : ''}
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleBackgroundSync}
      >
        <Text style={styles.actionButtonText}>Trigger Background Sync</Text>
      </TouchableOpacity>

      <View style={styles.syncTasksSection}>
        <Text style={styles.sectionTitle}>Recent Sync Tasks</Text>
        {syncTasks.length === 0 ? (
          <Text style={styles.emptyStateSubtext}>No sync tasks found</Text>
        ) : (
          <ScrollView style={styles.syncTasksList}>
            {syncTasks.slice(0, 5).map((task) => (
              <View key={task.id} style={styles.syncTaskCard}>
                <View style={styles.syncTaskHeader}>
                  <Text style={styles.syncTaskType}>{task.type}</Text>
                  <Text
                    style={[
                      styles.syncTaskStatus,
                      { color: getStatusColor(task.status) },
                    ]}
                  >
                    {task.status.replace('_', ' ')}
                  </Text>
                </View>
                <Text style={styles.syncTaskPriority}>
                  Priority: {task.priority}
                </Text>
                {task.errorMessage && (
                  <Text style={styles.syncTaskError}>
                    Error: {task.errorMessage}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'failed':
        return '#F44336';
      case 'in_progress':
        return '#FF9800';
      case 'pending':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'offline':
        return renderOffline();
      case 'widgets':
        return renderWidgets();
      case 'smartwatch':
        return renderSmartwatch();
      case 'sync':
        return renderSync();
      default:
        return renderOverview();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#2196F3']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Advanced Mobile Features</Text>
        <Text style={styles.headerSubtitle}>
          Offline Mode • Widgets • Smartwatch • Background Sync
        </Text>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'overview', label: 'Overview', icon: 'dashboard' },
            { key: 'offline', label: 'Offline', icon: 'wifi-off' },
            { key: 'widgets', label: 'Widgets', icon: 'widgets' },
            { key: 'smartwatch', label: 'Smartwatch', icon: 'watch' },
            { key: 'sync', label: 'Background Sync', icon: 'sync' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                activeTab === tab.key && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <MaterialIcons
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.key ? '#2196F3' : '#666'}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === tab.key && styles.activeTabButtonText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  tabContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  activeTabButtonText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActionsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  widgetsList: {
    maxHeight: 200,
  },
  widgetCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  widgetType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  widgetLastUpdated: {
    fontSize: 12,
    color: '#999',
  },
  devicesList: {
    maxHeight: 300,
  },
  deviceCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deviceModel: {
    fontSize: 12,
    color: '#666',
  },
  deviceStatus: {
    alignItems: 'flex-end',
  },
  deviceStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deviceBattery: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  deviceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deviceActionButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deviceActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  complicationsSection: {
    marginTop: 24,
  },
  complicationsList: {
    maxHeight: 100,
  },
  complicationCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  complicationType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  complicationPosition: {
    fontSize: 10,
    color: '#666',
    textTransform: 'capitalize',
  },
  syncStatsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  syncStatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  syncStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  syncStatItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  syncStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  syncStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  syncStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  syncStatusLabel: {
    fontSize: 14,
    color: '#666',
  },
  syncStatusValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  syncTasksSection: {
    marginTop: 24,
  },
  syncTasksList: {
    maxHeight: 300,
  },
  syncTaskCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  syncTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  syncTaskType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textTransform: 'capitalize',
  },
  syncTaskStatus: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  syncTaskPriority: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  syncTaskError: {
    fontSize: 12,
    color: '#F44336',
    fontStyle: 'italic',
  },
});

export default AdvancedMobileScreen;

