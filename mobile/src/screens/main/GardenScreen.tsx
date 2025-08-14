import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Chip,
  ProgressBar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Habit } from '../../types';
import apiService from '../../services/api';

const GardenScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedToday: 0,
    totalStreak: 0,
    averageCompletionRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [habitsResponse, statsResponse] = await Promise.all([
        apiService.getHabits(),
        apiService.getUserStats(),
      ]);

      if (habitsResponse.success) {
        setHabits(habitsResponse.data);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading garden data:', error);
      Alert.alert('Error', 'Failed to load garden data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleHabitPress = (habit: Habit) => {
    navigation.navigate('HabitDetail', { habitId: habit.id });
  };

  const handleCreateHabit = () => {
    navigation.navigate('CreateHabit');
  };

  const getHabitIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      health: 'heart-pulse',
      fitness: 'dumbbell',
      mindfulness: 'meditation',
      learning: 'book-open-variant',
      productivity: 'briefcase',
      social: 'account-group',
      default: 'flower',
    };
    return icons[category.toLowerCase()] || icons.default;
  };

  const getHabitColor = (category: string) => {
    const colors: { [key: string]: string } = {
      health: theme.colors.success,
      fitness: theme.colors.primary,
      mindfulness: theme.colors.info,
      learning: theme.colors.warning,
      productivity: theme.colors.accent,
      social: theme.colors.secondary,
      default: theme.colors.primary,
    };
    return colors[category.toLowerCase()] || colors.default;
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            Good morning, {user?.firstName || user?.username || 'Gardener'}! 🌱
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Let's check on your habit garden today
          </Text>
        </View>

        {/* Stats Overview */}
        <Card
          style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <Title style={[styles.cardTitle, { color: theme.colors.text }]}>
              Garden Overview
            </Title>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: theme.colors.primary }]}
                >
                  {stats.totalHabits}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Total Habits
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: theme.colors.success }]}
                >
                  {stats.completedToday}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Completed Today
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: theme.colors.warning }]}
                >
                  {stats.totalStreak}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Total Streak
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.info }]}>
                  {Math.round(stats.averageCompletionRate)}%
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Completion Rate
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Habits List */}
        <View style={styles.habitsSection}>
          <View style={styles.sectionHeader}>
            <Title style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Your Habits
            </Title>
            <Text
              style={[styles.habitCount, { color: theme.colors.textSecondary }]}
            >
              {habits.length} habits
            </Text>
          </View>

          {habits.length === 0 ? (
            <Card
              style={[
                styles.emptyCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Card.Content style={styles.emptyContent}>
                <Icon
                  name='flower-outline'
                  size={64}
                  color={theme.colors.textSecondary}
                />
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                  No habits yet
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Start growing your first habit to see it here
                </Text>
                <Button
                  mode='contained'
                  onPress={handleCreateHabit}
                  style={[
                    styles.createButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  Create Your First Habit
                </Button>
              </Card.Content>
            </Card>
          ) : (
            habits.map((habit) => (
              <Card
                key={habit.id}
                style={[
                  styles.habitCard,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => handleHabitPress(habit)}
              >
                <Card.Content>
                  <View style={styles.habitHeader}>
                    <View style={styles.habitInfo}>
                      <Icon
                        name={getHabitIcon(habit.category)}
                        size={24}
                        color={getHabitColor(habit.category)}
                        style={styles.habitIcon}
                      />
                      <View style={styles.habitText}>
                        <Title
                          style={[
                            styles.habitTitle,
                            { color: theme.colors.text },
                          ]}
                        >
                          {habit.title}
                        </Title>
                        <Text
                          style={[
                            styles.habitCategory,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          {habit.category}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.habitStats}>
                      <Text
                        style={[
                          styles.streakText,
                          { color: theme.colors.primary },
                        ]}
                      >
                        🔥 {habit.currentStreak}
                      </Text>
                    </View>
                  </View>

                  {habit.description && (
                    <Paragraph
                      style={[
                        styles.habitDescription,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {habit.description}
                    </Paragraph>
                  )}

                  <View style={styles.habitProgress}>
                    <View style={styles.progressInfo}>
                      <Text
                        style={[
                          styles.progressText,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        Completion Rate
                      </Text>
                      <Text
                        style={[
                          styles.progressValue,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {Math.round(habit.completionRate)}%
                      </Text>
                    </View>
                    <ProgressBar
                      progress={habit.completionRate / 100}
                      color={theme.colors.primary}
                      style={styles.progressBar}
                    />
                  </View>

                  {habit.tags && habit.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {habit.tags.slice(0, 3).map((tag, index) => (
                        <Chip
                          key={index}
                          textStyle={[
                            styles.tagText,
                            { color: theme.colors.primary },
                          ]}
                          style={[
                            styles.tag,
                            { backgroundColor: theme.colors.primary + '20' },
                          ]}
                        >
                          {tag}
                        </Chip>
                      ))}
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      <FAB
        icon='plus'
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleCreateHabit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  statsCard: {
    margin: 20,
    marginTop: 0,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  habitsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
  },
  habitCount: {
    fontSize: 14,
  },
  emptyCard: {
    marginTop: 20,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 24,
  },
  habitCard: {
    marginBottom: 16,
    elevation: 2,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitIcon: {
    marginRight: 12,
  },
  habitText: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  habitCategory: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  habitStats: {
    alignItems: 'flex-end',
  },
  streakText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  habitDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  habitProgress: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginRight: 8,
  },
  tagText: {
    fontSize: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default GardenScreen;
