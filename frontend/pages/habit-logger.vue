<template>
  <div class="habit-logger-dashboard">
    <!-- Header -->
    <div class="habit-logger-header">
      <h1>🌱 Habit Logger</h1>
      <p>Track your daily progress and watch your garden grow!</p>
    </div>

    <!-- Today's Date Display -->
    <div class="date-display">
      <div class="callout primary">
        <h3>📅 {{ formatDate(today) }}</h3>
        <p>{{ getDayOfWeek(today) }} - {{ getProgressSummary() }}</p>
      </div>
    </div>

    <!-- Quick Log Section -->
    <div class="quick-log-section">
      <h2>Quick Log Today's Habits</h2>
      <div class="grid-container">
        <div class="grid-x grid-margin-x">
          <div class="cell medium-8">
            <div class="habits-list">
              <div v-for="habit in habits" :key="habit.id" class="habit-item callout"
                :class="getHabitStatusClass(habit.id)">
                <div class="habit-header">
                  <div class="habit-info">
                    <h4>{{ habit.title }}</h4>
                    <p class="habit-category">{{ habit.category }}</p>
                  </div>
                  <div class="habit-flower">
                    {{ getFlowerEmoji(habit.flowerType) }}
                  </div>
                </div>

                <div class="habit-progress">
                  <div class="progress" role="progressbar" tabindex="0" aria-valuenow="0" aria-valuemin="0"
                    aria-valuemax="100">
                    <div class="progress-meter" :style="{ width: getHabitProgress(habit.id) + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ getHabitProgressText(habit.id) }}</span>
                </div>

                <div class="habit-actions">
                  <div class="button-group expanded">
                    <button class="button success" @click="logHabit(habit.id, 'completed')"
                      :disabled="isHabitCompleted(habit.id)">
                      ✅ Complete
                    </button>
                    <button class="button warning" @click="logHabit(habit.id, 'partial')"
                      :disabled="isHabitCompleted(habit.id)">
                      ⚠️ Partial
                    </button>
                    <button class="button alert" @click="logHabit(habit.id, 'missed')"
                      :disabled="isHabitCompleted(habit.id)">
                      ❌ Missed
                    </button>
                    <button class="button secondary" @click="logHabit(habit.id, 'skipped')"
                      :disabled="isHabitCompleted(habit.id)">
                      ⏭️ Skip
                    </button>
                  </div>
                </div>

                <!-- Habit Notes -->
                <div class="habit-notes" v-if="habitNotes[habit.id]">
                  <textarea v-model="habitNotes[habit.id]" placeholder="Add notes about today's progress..."
                    rows="2"></textarea>
                  <button class="button small" @click="saveNotes(habit.id)">
                    💾 Save Notes
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="cell medium-4">
            <!-- Daily Summary -->
            <div class="daily-summary callout secondary">
              <h3>📊 Today's Summary</h3>
              <div class="summary-stats">
                <div class="stat-item">
                  <span class="stat-label">Completed:</span>
                  <span class="stat-value success">{{ completedToday }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Partial:</span>
                  <span class="stat-value warning">{{ partialToday }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Missed:</span>
                  <span class="stat-value alert">{{ missedToday }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Skipped:</span>
                  <span class="stat-value secondary">{{ skippedToday }}</span>
                </div>
              </div>
              <div class="completion-rate">
                <h4>Overall Progress: {{ overallCompletionRate }}%</h4>
                <div class="progress" role="progressbar" tabindex="0" aria-valuenow="0" aria-valuemin="0"
                  aria-valuemax="100">
                  <div class="progress-meter" :style="{ width: overallCompletionRate + '%' }"></div>
                </div>
              </div>
            </div>

            <!-- Streak Information -->
            <div class="streak-info callout">
              <h3>🔥 Streak Status</h3>
              <div class="streak-display">
                <div class="streak-number">{{ totalActiveStreak }}</div>
                <div class="streak-label">Days Active</div>
              </div>
              <p>Keep the momentum going! 🔥</p>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions callout">
              <h3>⚡ Quick Actions</h3>
              <div class="button-group expanded">
                <button class="button expanded" @click="viewAnalytics">
                  📈 View Analytics
                </button>
                <button class="button expanded secondary" @click="viewGarden">
                  🌺 View Garden
                </button>
                <button class="button expanded warning" @click="exportTodayData">
                  📤 Export Today
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Historical Logs -->
    <div class="historical-logs">
      <h2>📚 Recent Activity</h2>
      <div class="grid-container">
        <div class="grid-x grid-margin-x">
          <div class="cell">
            <div class="logs-table">
              <table class="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Habit</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in recentLogs" :key="log.id" :class="getLogRowClass(log.status)">
                    <td>{{ formatDate(log.date) }}</td>
                    <td>{{ getHabitTitle(log.habitId) }}</td>
                    <td>
                      <span class="status-badge" :class="getStatusClass(log.status)">
                        {{ getStatusText(log.status) }}
                      </span>
                    </td>
                    <td>{{ log.completedCount }}/{{ log.targetCount }}</td>
                    <td>{{ log.notes || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Reactive data
const habits = ref([])
const todayLogs = ref([])
const recentLogs = ref([])
const habitNotes = ref({})
const loading = ref(false)

// Computed properties
const today = computed(() => new Date())

const completedToday = computed(() =>
  todayLogs.value.filter(log => log.status === 'completed').length
)

const partialToday = computed(() =>
  todayLogs.value.filter(log => log.status === 'partial').length
)

const missedToday = computed(() =>
  todayLogs.value.filter(log => log.status === 'missed').length
)

const skippedToday = computed(() =>
  todayLogs.value.filter(log => log.status === 'skipped').length
)

const overallCompletionRate = computed(() => {
  if (habits.value.length === 0) return 0
  const total = habits.value.length
  const completed = completedToday.value + partialToday.value
  return Math.round((completed / total) * 100)
})

const totalActiveStreak = computed(() => {
  // This would be calculated from actual data
  return Math.max(...habits.value.map(habit => habit.streak || 0), 0)
})

// Methods
const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getDayOfWeek = (date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

const getProgressSummary = () => {
  if (habits.value.length === 0) return 'No habits to track today'
  return `${completedToday.value + partialToday.value} of ${habits.value.length} habits completed`
}

const getFlowerEmoji = (flowerType) => {
  const emojis = {
    sunflower: '🌻',
    rose: '🌹',
    tulip: '🌷',
    daisy: '🌼',
    lily: '🌸',
    orchid: '🌺',
    cactus: '🌵',
    bonsai: '🎋'
  }
  return emojis[flowerType] || '🌱'
}

const getHabitStatusClass = (habitId) => {
  const log = todayLogs.value.find(log => log.habitId === habitId)
  if (!log) return ''

  switch (log.status) {
    case 'completed': return 'success'
    case 'partial': return 'warning'
    case 'missed': return 'alert'
    case 'skipped': return 'secondary'
    default: return ''
  }
}

const getHabitProgress = (habitId) => {
  const log = todayLogs.value.find(log => log.habitId === habitId)
  if (!log) return 0

  const habit = habits.value.find(h => h.id === habitId)
  if (!habit) return 0

  return Math.round((log.completedCount / (log.targetCount || habit.targetCount)) * 100)
}

const getHabitProgressText = (habitId) => {
  const log = todayLogs.value.find(log => log.habitId === habitId)
  if (!log) return '0/1'

  const habit = habits.value.find(h => h.id === habitId)
  return `${log.completedCount}/${log.targetCount || habit.targetCount}`
}

const isHabitCompleted = (habitId) => {
  const log = todayLogs.value.find(log => log.habitId === habitId)
  return log && (log.status === 'completed' || log.status === 'partial')
}

const logHabit = async (habitId, status) => {
  try {
    loading.value = true

    const habit = habits.value.find(h => h.id === habitId)
    const completedCount = status === 'completed' ? (habit.targetCount || 1) :
      status === 'partial' ? Math.floor((habit.targetCount || 1) / 2) : 0

    const logData = {
      habitId,
      date: today.value.toISOString().split('T')[0],
      status,
      completedCount,
      targetCount: habit.targetCount || 1,
      notes: habitNotes.value[habitId] || ''
    }

    // TODO: Replace with actual API call
    console.log('Logging habit:', logData)

    // Update local state
    const existingLogIndex = todayLogs.value.findIndex(log => log.habitId === habitId)
    if (existingLogIndex >= 0) {
      todayLogs.value[existingLogIndex] = { ...logData, id: Date.now() }
    } else {
      todayLogs.value.push({ ...logData, id: Date.now() })
    }

    // Show success message
    // TODO: Add toast notification
    console.log(`Habit ${status} successfully logged!`)

  } catch (error) {
    console.error('Error logging habit:', error)
    // TODO: Add error notification
  } finally {
    loading.value = false
  }
}

const saveNotes = (habitId) => {
  // TODO: Save notes to backend
  console.log('Saving notes for habit:', habitId, habitNotes.value[habitId])
}

const getStatusClass = (status) => {
  switch (status) {
    case 'completed': return 'success'
    case 'partial': return 'warning'
    case 'missed': return 'alert'
    case 'skipped': return 'secondary'
    default: return ''
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'completed': return '✅ Completed'
    case 'partial': return '⚠️ Partial'
    case 'missed': return '❌ Missed'
    case 'skipped': return '⏭️ Skipped'
    default: return status
  }
}

const getLogRowClass = (status) => {
  switch (status) {
    case 'completed': return 'success-row'
    case 'partial': return 'warning-row'
    case 'missed': return 'alert-row'
    case 'skipped': return 'secondary-row'
    default: return ''
  }
}

const getHabitTitle = (habitId) => {
  const habit = habits.value.find(h => h.id === habitId)
  return habit ? habit.title : 'Unknown Habit'
}

const viewAnalytics = () => {
  // TODO: Navigate to analytics page
  console.log('Navigate to analytics')
}

const viewGarden = () => {
  // TODO: Navigate to garden page
  console.log('Navigate to garden')
}

const exportTodayData = () => {
  // TODO: Export today's data
  console.log('Export today\'s data')
}

const loadData = async () => {
  try {
    loading.value = true

    // TODO: Replace with actual API calls
    // Mock data for now
    habits.value = [
      {
        id: 1,
        title: 'Morning Exercise',
        category: 'fitness',
        flowerType: 'sunflower',
        targetCount: 1,
        streak: 5
      },
      {
        id: 2,
        title: 'Read 30 minutes',
        category: 'learning',
        flowerType: 'rose',
        targetCount: 1,
        streak: 3
      },
      {
        id: 3,
        title: 'Drink 8 glasses of water',
        category: 'health',
        flowerType: 'tulip',
        targetCount: 8,
        streak: 7
      }
    ]

    todayLogs.value = []
    recentLogs.value = []

  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.habit-logger-dashboard {
  padding: 2rem 0;

  .habit-logger-header {
    text-align: center;
    margin-bottom: 2rem;

    h1 {
      color: var(--bloom-primary);
      margin-bottom: 0.5rem;
    }

    p {
      color: var(--bloom-text-secondary);
      font-size: 1.1rem;
    }
  }

  .date-display {
    margin-bottom: 2rem;

    .callout {
      text-align: center;

      h3 {
        margin-bottom: 0.5rem;
        color: var(--bloom-primary);
      }

      p {
        margin-bottom: 0;
        color: var(--bloom-text-secondary);
      }
    }
  }

  .quick-log-section {
    margin-bottom: 3rem;

    h2 {
      margin-bottom: 1.5rem;
      color: var(--bloom-primary);
    }

    .habits-list {
      .habit-item {
        margin-bottom: 1.5rem;
        border-left: 4px solid var(--bloom-border);

        &.success {
          border-left-color: var(--bloom-success);
        }

        &.warning {
          border-left-color: var(--bloom-warning);
        }

        &.alert {
          border-left-color: var(--bloom-danger);
        }

        &.secondary {
          border-left-color: var(--bloom-secondary);
        }

        .habit-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;

          .habit-info {
            h4 {
              margin-bottom: 0.25rem;
              color: var(--bloom-primary);
            }

            .habit-category {
              margin: 0;
              color: var(--bloom-text-secondary);
              font-size: 0.9rem;
              text-transform: capitalize;
            }
          }

          .habit-flower {
            font-size: 2rem;
          }
        }

        .habit-progress {
          margin-bottom: 1rem;

          .progress-text {
            display: block;
            text-align: center;
            margin-top: 0.5rem;
            font-size: 0.9rem;
            color: var(--bloom-text-secondary);
          }
        }

        .habit-actions {
          margin-bottom: 1rem;

          .button-group {
            .button {
              font-size: 0.9rem;

              &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
              }
            }
          }
        }

        .habit-notes {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--bloom-border);

          textarea {
            margin-bottom: 0.5rem;
            resize: vertical;
          }
        }
      }
    }
  }

  .daily-summary {
    margin-bottom: 1.5rem;

    h3 {
      color: var(--bloom-primary);
      margin-bottom: 1rem;
    }

    .summary-stats {
      margin-bottom: 1.5rem;

      .stat-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;

        .stat-label {
          color: var(--bloom-text-secondary);
        }

        .stat-value {
          font-weight: bold;

          &.success {
            color: var(--bloom-success);
          }

          &.warning {
            color: var(--bloom-warning);
          }

          &.alert {
            color: var(--bloom-danger);
          }

          &.secondary {
            color: var(--bloom-secondary);
          }
        }
      }
    }

    .completion-rate {
      h4 {
        margin-bottom: 0.5rem;
        color: var(--bloom-primary);
      }
    }
  }

  .streak-info {
    margin-bottom: 1.5rem;
    text-align: center;

    h3 {
      color: var(--bloom-primary);
      margin-bottom: 1rem;
    }

    .streak-display {
      margin-bottom: 1rem;

      .streak-number {
        font-size: 3rem;
        font-weight: bold;
        color: var(--bloom-warning);
        line-height: 1;
      }

      .streak-label {
        color: var(--bloom-text-secondary);
        font-size: 0.9rem;
      }
    }

    p {
      margin: 0;
      color: var(--bloom-text-secondary);
    }
  }

  .quick-actions {
    h3 {
      color: var(--bloom-primary);
      margin-bottom: 1rem;
    }

    .button-group {
      .button {
        margin-bottom: 0.5rem;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .historical-logs {
    h2 {
      margin-bottom: 1.5rem;
      color: var(--bloom-primary);
    }

    .logs-table {
      .table {
        .success-row {
          background-color: rgba(var(--bloom-success-rgb), 0.1);
        }

        .warning-row {
          background-color: rgba(var(--bloom-warning-rgb), 0.1);
        }

        .alert-row {
          background-color: rgba(var(--bloom-danger-rgb), 0.1);
        }

        .secondary-row {
          background-color: rgba(var(--bloom-secondary-rgb), 0.1);
        }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.8rem;
          font-weight: bold;

          &.success {
            background-color: var(--bloom-success);
            color: white;
          }

          &.warning {
            background-color: var(--bloom-warning);
            color: white;
          }

          &.alert {
            background-color: var(--bloom-danger);
            color: white;
          }

          &.secondary {
            background-color: var(--bloom-secondary);
            color: white;
          }
        }
      }
    }
  }
}

// Foundation overrides
.callout {
  &.primary {
    background-color: rgba(var(--bloom-primary-rgb), 0.1);
    border-color: var(--bloom-primary);
  }

  &.secondary {
    background-color: rgba(var(--bloom-secondary-rgb), 0.1);
    border-color: var(--bloom-secondary);
  }

  &.success {
    background-color: rgba(var(--bloom-success-rgb), 0.1);
    border-color: var(--bloom-success);
  }

  &.warning {
    background-color: rgba(var(--bloom-warning-rgb), 0.1);
    border-color: var(--bloom-warning);
  }

  &.alert {
    background-color: rgba(var(--bloom-danger-rgb), 0.1);
    border-color: var(--bloom-danger);
  }
}

.progress {
  background-color: var(--bloom-border);

  .progress-meter {
    background-color: var(--bloom-primary);
  }
}

.button {
  &.success {
    background-color: var(--bloom-success);
  }

  &.warning {
    background-color: var(--bloom-warning);
  }

  &.alert {
    background-color: var(--bloom-danger);
  }

  &.secondary {
    background-color: var(--bloom-secondary);
  }
}
</style>

