import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList, MainTabParamList } from '../types';

// Screens
import GardenScreen from '../screens/main/GardenScreen';
import HabitsScreen from '../screens/main/HabitsScreen';
import AnalyticsScreen from '../screens/main/AnalyticsScreen';
import CommunityScreen from '../screens/main/CommunityScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import HabitDetailScreen from '../screens/main/HabitDetailScreen';
import CreateHabitScreen from '../screens/main/CreateHabitScreen';
import EditHabitScreen from '../screens/main/EditHabitScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import GardenDetailScreen from '../screens/main/GardenDetailScreen';
import ChallengeDetailScreen from '../screens/main/ChallengeDetailScreen';
import CreateGardenScreen from '../screens/main/CreateGardenScreen';
import CreateChallengeScreen from '../screens/main/CreateChallengeScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const MainTabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Garden':
              iconName = focused ? 'flower' : 'flower-outline';
              break;
            case 'Habits':
              iconName = focused ? 'format-list-checks' : 'format-list-checks';
              break;
            case 'Analytics':
              iconName = focused ? 'chart-line' : 'chart-line';
              break;
            case 'Community':
              iconName = focused ? 'account-group' : 'account-group-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name='Garden'
        component={GardenScreen}
        options={{ title: 'Garden' }}
      />
      <Tab.Screen
        name='Habits'
        component={HabitsScreen}
        options={{ title: 'Habits' }}
      />
      <Tab.Screen
        name='Analytics'
        component={AnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
      <Tab.Screen
        name='Community'
        component={CommunityScreen}
        options={{ title: 'Community' }}
      />
      <Tab.Screen
        name='Profile'
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name='MainTabs' component={MainTabNavigator} />
      <Stack.Screen name='HabitDetail' component={HabitDetailScreen} />
      <Stack.Screen name='CreateHabit' component={CreateHabitScreen} />
      <Stack.Screen name='EditHabit' component={EditHabitScreen} />
      <Stack.Screen name='Analytics' component={AnalyticsScreen} />
      <Stack.Screen name='Notifications' component={NotificationsScreen} />
      <Stack.Screen name='Community' component={CommunityScreen} />
      <Stack.Screen name='GardenDetail' component={GardenDetailScreen} />
      <Stack.Screen name='ChallengeDetail' component={ChallengeDetailScreen} />
      <Stack.Screen name='CreateGarden' component={CreateGardenScreen} />
      <Stack.Screen name='CreateChallenge' component={CreateChallengeScreen} />
      <Stack.Screen name='Profile' component={ProfileScreen} />
      <Stack.Screen name='Settings' component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
