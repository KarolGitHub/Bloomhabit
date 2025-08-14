<template>
  <div class="analytics-page">
    <div class="grid-container">
      <!-- Header -->
      <header class="analytics-header">
        <div class="grid-x align-middle">
          <div class="cell medium-8">
            <h1 class="text-gradient text-4xl font-bold mb-2">📊 Analytics Dashboard</h1>
            <p class="text-gray-600 text-lg">Deep insights into your habit performance and progress</p>
          </div>
          <div class="cell medium-4 text-right">
            <div class="period-selector">
              <label class="form-label">Time Period:</label>
              <select v-model="selectedPeriod" @change="loadAnalytics" class="form-input">
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <!-- Performance Overview -->
      <section class="performance-overview">
        <div class="grid-x grid-margin-x">
          <div class="cell medium-3">
            <div class="metric-card">
              <div class="metric-icon">🎯</div>
              <div class="metric-content">
                <h3 class="metric-value">{{ performanceMetrics.overallScore }}%</h3>
                <p class="metric-label">Overall Score</p>
                <span class="metric-category" :class="getCategoryClass(performanceMetrics.category)">
                  {{ performanceMetrics.category }}
                </span>
              </div>
            </div>
          </div>

          <div class="cell medium-3">
            <div class="metric-card">
              <div class="metric-icon">📈</div>
              <div class="metric-content">
                <h3 class="metric-value">{{ performanceMetrics.consistencyScore }}%</h3>
                <p class="metric-label">Consistency</p>
                <span class="metric-trend" :class="getTrendClass('consistency')">
                  {{ getTrendIcon('consistency') }} {{ getTrendText('consistency') }}
                </span>
              </div>
            </div>
          </div>

          <div class="cell medium-3">
            <div class="metric-card">
              <div class="metric-icon">🚀</div>
              <div class="metric-content">
                <h3 class="metric-value">{{ performanceMetrics.momentumScore }}%</h3>
                <p class="metric-label">Momentum</p>
                <span class="metric-trend" :class="getTrendClass('momentum')">
                  {{ getTrendIcon('momentum') }} {{ getTrendText('momentum') }}
                </span>
              </div>
            </div>
          </div>

          <div class="cell medium-3">
            <div class="metric-card">
              <div class="metric-icon">💪</div>
              <div class="metric-content">
                <h3 class="metric-value">{{ performanceMetrics.resilienceScore }}%</h3>
                <p class="metric-label">Resilience</p>
                <span class="metric-trend" :class="getTrendClass('resilience')">
                  {{ getTrendIcon('resilience') }} {{ getTrendText('resilience') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Progress Report -->
      <section class="progress-report">
        <div class="grid-x grid-margin-x">
          <div class="cell medium-8">
            <div class="report-card">
              <h3 class="text-2xl font-bold text-gray-800 mb-4">📋 Progress Report</h3>

              <div class="report-stats">
                <div class="stat-row">
                  <div class="stat-item">
                    <span class="stat-label">Total Habits:</span>
                    <span class="stat-value">{{ progressReport.totalHabits }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Active Habits:</span>
                    <span class="stat-value">{{ progressReport.activeHabits }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Success Rate:</span>
                    <span class="stat-value">{{ progressReport.overallSuccessRate }}%</span>
                  </div>
                </div>

                <div class="stat-row">
                  <div class="stat-item">
                    <span class="stat-label">Total Streak:</span>
                    <span class="stat-value">{{ progressReport.totalStreak }} days</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Daily Completions:</span>
                    <span class="stat-value">{{ progressReport.averageDailyCompletions }}</span>
                  </div>
                </div>
              </div>

              <div class="habit-categories">
                <div class="category-section">
                  <h4 class="font-semibold text-green-600 mb-2">🏆 Top Performing Habits</h4>
                  <ul class="habit-list">
                    <li v-for="habit in progressReport.topPerformingHabits" :key="habit" class="habit-item">
                      {{ habit }}
                    </li>
                  </ul>
                </div>

                <div class="category-section">
                  <h4 class="font-semibold text-orange-600 mb-2">⚠️ Needs Attention</h4>
                  <ul class="habit-list">
                    <li v-for="habit in progressReport.needsAttentionHabits" :key="habit" class="habit-item">
                      {{ habit }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="cell medium-4">
            <div class="achievements-card">
              <h4 class="font-semibold text-gray-800 mb-3">🏅 Achievements</h4>
              <ul class="achievements-list">
                <li v-for="achievement in progressReport.achievements" :key="achievement" class="achievement-item">
                  {{ achievement }}
                </li>
              </ul>

              <h4 class="font-semibold text-gray-800 mb-3 mt-4">🎯 Next Week Goals</h4>
              <ul class="goals-list">
                <li v-for="goal in progressReport.nextWeekGoals" :key="goal" class="goal-item">
                  {{ goal }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Loading State -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Reactive data
const loading = ref(false)
const selectedPeriod = ref('week')

const performanceMetrics = ref({
  overallScore: 78,
  consistencyScore: 82,
  momentumScore: 75,
  resilienceScore: 79,
  category: 'good',
  percentile: 78,
  breakdown: {
    consistency: { score: 82, factors: ['Daily tracking maintained', 'High completion rate'] },
    momentum: { score: 75, factors: ['Improving performance'] },
    resilience: { score: 79, factors: ['Quick recovery from setbacks', 'Long-term commitment'] },
  },
})

const progressReport = ref({
  period: 'week',
  startDate: new Date(),
  endDate: new Date(),
  totalHabits: 5,
  activeHabits: 4,
  completedHabits: 28,
  overallSuccessRate: 80,
  totalStreak: 12,
  averageDailyCompletions: 4.0,
  topPerformingHabits: ['Morning Exercise', 'Reading', 'Meditation'],
  needsAttentionHabits: ['Water Intake', 'Journaling'],
  achievements: ['Completed 10+ habits this period', 'Worked on 3+ different habits'],
  nextWeekGoals: ['Maintain current streak on top-performing habits', 'Focus on one habit that needs attention'],
})

// Methods
const loadAnalytics = async () => {
  loading.value = true
  try {
    // For now, just simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Analytics loaded for period:', selectedPeriod.value)
  } catch (error) {
    console.error('Error loading analytics:', error)
  } finally {
    loading.value = false
  }
}

const getCategoryClass = (category) => {
  const classes = {
    'excellent': 'text-green-600 bg-green-100',
    'good': 'text-blue-600 bg-blue-100',
    'average': 'text-yellow-600 bg-yellow-100',
    'needs-improvement': 'text-red-600 bg-red-100',
  }
  return classes[category] || classes.average
}

const getTrendClass = (metric) => {
  const score = performanceMetrics.value[`${metric}Score`]
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

const getTrendIcon = (metric) => {
  const score = performanceMetrics.value[`${metric}Score`]
  if (score >= 80) return '📈'
  if (score >= 60) return '➡️'
  if (score >= 40) return '📉'
  return '⚠️'
}

const getTrendText = (metric) => {
  const score = performanceMetrics.value[`${metric}Score`]
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Needs Work'
}

// Lifecycle
onMounted(() => {
  loadAnalytics()
})
</script>

<style scoped>
.analytics-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 2rem 0;
}

.analytics-header {
  margin-bottom: 3rem;
}

.period-selector {
  text-align: right;
}

.period-selector .form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.period-selector .form-input {
  min-width: 150px;
}

.performance-overview {
  margin-bottom: 3rem;
}

.metric-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 100%;
}

.metric-icon {
  font-size: 2.5rem;
  color: #22c55e;
}

.metric-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.metric-label {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.metric-category,
.metric-trend {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.progress-report {
  margin-bottom: 3rem;
}

.report-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.report-stats {
  margin-bottom: 2rem;
}

.stat-row {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-value {
  font-weight: 600;
  color: #1f2937;
}

.habit-categories {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.habit-list {
  list-style: none;
  padding: 0;
}

.habit-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}

.habit-item:last-child {
  border-bottom: none;
}

.achievements-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.achievements-list,
.goals-list {
  list-style: none;
  padding: 0;
}

.achievement-item,
.goal-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}

.achievement-item:last-child,
.goal-item:last-child {
  border-bottom: none;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #22c55e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .stat-row {
    flex-direction: column;
    gap: 1rem;
  }

  .habit-categories {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
