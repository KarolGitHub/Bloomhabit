<template>
  <div class="ai-gardener-dashboard">
    <!-- Header -->
    <header class="ai-header">
      <div class="grid-container">
        <div class="grid-x align-middle">
          <div class="cell medium-8">
            <h1 class="text-gradient text-4xl font-bold mb-2">🤖 AI Gardener</h1>
            <p class="text-gray-600 text-lg">Your personal habit coach and garden advisor</p>
          </div>
          <div class="cell medium-4 text-right">
            <button class="button primary large rounded" @click="refreshInsights">
              <span class="mr-2">🔄</span> Refresh Insights
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="grid-container">
        <div class="text-center py-12">
          <div class="text-6xl mb-4">🌱</div>
          <h3 class="text-2xl font-bold text-gray-700 mb-2">AI Gardener is thinking...</h3>
          <p class="text-gray-600">Analyzing your habit garden and preparing personalized insights</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="ai-content">
      <!-- Garden Insights Section -->
      <section class="garden-insights">
        <div class="grid-container">
          <div class="grid-x grid-margin-x">
            <div class="cell medium-8">
              <div class="callout garden-theme success">
                <h3 class="text-2xl font-bold text-green-600 mb-4">🌿 Garden Insights</h3>
                <div class="insight-content">
                  <p class="text-lg text-gray-700 mb-4">{{ insights.summary }}</p>
                  <div class="key-points">
                    <h4 class="font-semibold text-gray-800 mb-2">Key Points:</h4>
                    <ul class="list-disc list-inside space-y-2">
                      <li v-for="point in insights.keyPoints" :key="point" class="text-gray-600">
                        {{ point }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div class="cell medium-4">
              <div class="garden-mood-card">
                <div class="text-center">
                  <div class="mood-emoji text-6xl mb-4">{{ getMoodEmoji(gardenMood) }}</div>
                  <h4 class="text-xl font-bold text-gray-800 mb-2">Garden Mood</h4>
                  <p class="text-gray-600 capitalize">{{ gardenMood }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Recommendations Section -->
      <section class="recommendations">
        <div class="grid-container">
          <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">💡 AI Recommendations</h3>
          <div class="grid-x grid-margin-x">
            <div v-for="(rec, index) in recommendations" :key="index" class="cell small-12 medium-6 large-4">
              <div class="recommendation-card">
                <div class="card-icon text-4xl mb-3">🌱</div>
                <h4 class="text-lg font-semibold text-gray-800 mb-2">Recommendation {{ index + 1 }}</h4>
                <p class="text-gray-600">{{ rec }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Motivation Section -->
      <section class="motivation">
        <div class="grid-container">
          <div class="callout garden-theme text-center py-8">
            <div class="text-5xl mb-4">✨</div>
            <h3 class="text-2xl font-bold text-gray-700 mb-4">Daily Motivation</h3>
            <p class="text-xl text-gray-600">{{ motivation }}</p>
          </div>
        </div>
      </section>

      <!-- Habit Coaching Section -->
      <section class="habit-coaching" v-if="habits.length > 0">
        <div class="grid-container">
          <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">🎯 Individual Habit Coaching</h3>
          <div class="grid-x grid-margin-x">
            <div v-for="habit in habits" :key="habit.id" class="cell small-12 medium-6 large-4">
              <div class="coaching-card">
                <div class="habit-header">
                  <div class="habit-flower" :class="getFlowerStatus(habit)">
                    <span class="text-2xl">{{ getFlowerEmoji(habit.flowerType) }}</span>
                  </div>
                  <div class="habit-info">
                    <h4 class="text-lg font-semibold text-gray-800">{{ habit.title }}</h4>
                    <p class="text-sm text-gray-600">{{ habit.category }}</p>
                  </div>
                </div>

                <div class="coaching-actions">
                  <button class="button secondary small expanded" @click="getHabitCoaching(habit.id)">
                    🤖 Get AI Coaching
                  </button>
                </div>

                <!-- Coaching Results -->
                <div v-if="habit.coaching" class="coaching-results">
                  <div class="coaching-summary">
                    <h5 class="font-semibold text-gray-800 mb-2">AI Analysis:</h5>
                    <p class="text-sm text-gray-600">{{ habit.coaching.advice }}</p>
                  </div>

                  <div class="next-steps">
                    <h5 class="font-semibold text-gray-800 mb-2">Next Steps:</h5>
                    <ul class="text-sm text-gray-600 space-y-1">
                      <li v-for="step in habit.coaching.nextSteps" :key="step">
                        • {{ step }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Weekly Report Section -->
      <section class="weekly-report">
        <div class="grid-container">
          <div class="grid-x align-middle">
            <div class="cell medium-8">
              <h3 class="text-2xl font-bold text-gray-800 mb-4">📊 Weekly Progress Report</h3>
              <p class="text-gray-600 mb-4">Get a comprehensive analysis of your habit performance this week</p>
            </div>
            <div class="cell medium-4 text-right">
              <button class="button primary large rounded" @click="getWeeklyReport" :disabled="weeklyReportLoading">
                <span v-if="weeklyReportLoading" class="mr-2">⏳</span>
                <span v-else class="mr-2">📈</span>
                {{ weeklyReportLoading ? 'Generating...' : 'Get Report' }}
              </button>
            </div>
          </div>

          <!-- Weekly Report Results -->
          <div v-if="weeklyReport" class="weekly-report-content">
            <div class="grid-x grid-margin-x">
              <div class="cell medium-6">
                <div class="callout garden-theme">
                  <h4 class="font-semibold text-gray-800 mb-3">📋 Report Summary</h4>
                  <div class="report-content">
                    <p class="text-gray-600">{{ weeklyReport.report.content }}</p>
                  </div>
                </div>
              </div>

              <div class="cell medium-6">
                <div class="weekly-stats">
                  <h4 class="font-semibold text-gray-800 mb-3">📊 Weekly Statistics</h4>
                  <div class="stats-grid">
                    <div class="stat-item">
                      <div class="stat-value text-2xl font-bold text-blue-600">{{ weeklyReport.weeklyStats.totalHabits
                        }}</div>
                      <div class="stat-label text-sm text-gray-500">Total Habits</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value text-2xl font-bold text-green-600">{{ weeklyReport.weeklyStats.totalStreak
                        }}</div>
                      <div class="stat-label text-sm text-gray-500">Total Streak</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value text-2xl font-bold text-purple-600">{{
                        weeklyReport.weeklyStats.averageGrowth }}%</div>
                      <div class="stat-label text-sm text-gray-500">Avg Growth</div>
                    </div>
                  </div>
                </div>

                <div class="achievements mt-4">
                  <h4 class="font-semibold text-gray-800 mb-3">🏆 Achievements</h4>
                  <ul class="achievements-list">
                    <li v-for="achievement in weeklyReport.achievements" :key="achievement"
                      class="text-sm text-gray-600 mb-2">
                      ✨ {{ achievement }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Reactive data
const loading = ref(true)
const insights = ref({ summary: '', keyPoints: [] })
const gardenMood = ref('growing')
const recommendations = ref([])
const motivation = ref('')
const habits = ref([])
const weeklyReport = ref(null)
const weeklyReportLoading = ref(false)

// Computed properties
const getMoodEmoji = (mood) => {
  const emojis = {
    'blooming': '🌸',
    'growing': '🌱',
    'stable': '🌿',
    'wilting': '🥀',
    'empty': '🌱'
  }
  return emojis[mood] || '🌱'
}

// Methods
const getFlowerStatus = (habit) => {
  if (habit.growthStage >= 80 && habit.healthPoints >= 80) return 'blooming'
  if (habit.growthStage >= 50 && habit.healthPoints >= 50) return 'growing'
  if (habit.waterLevel < 30 || habit.healthPoints < 30) return 'wilting'
  return 'stable'
}

const getFlowerEmoji = (flowerType) => {
  const emojis = {
    'ROSE': '🌹',
    'SUNFLOWER': '🌻',
    'TULIP': '🌷',
    'DAISY': '🌼',
    'LILY': '🌸'
  }
  return emojis[flowerType] || '🌱'
}

const loadGardenData = async () => {
  try {
    // TODO: Replace with actual API calls
    // Mock data for now
    habits.value = [
      {
        id: 1,
        title: 'Morning Exercise',
        category: 'HEALTH',
        flowerType: 'ROSE',
        growthStage: 85,
        healthPoints: 90,
        waterLevel: 95
      },
      {
        id: 2,
        title: 'Read Books',
        category: 'LEARNING',
        flowerType: 'SUNFLOWER',
        growthStage: 45,
        healthPoints: 70,
        waterLevel: 60
      }
    ]
  } catch (error) {
    console.error('Error loading garden data:', error)
  }
}

const loadAiInsights = async () => {
  try {
    loading.value = true

    // TODO: Replace with actual API call
    // Mock AI insights for now
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate AI processing

    insights.value = {
      summary: "Your habit garden is showing promising growth! I can see you're building consistency with your morning exercise routine, which is creating a strong foundation for other habits to flourish.",
      keyPoints: [
        "Your morning exercise habit has reached 85% growth - it's almost blooming!",
        "Reading habit needs more consistent watering to reach its full potential",
        "Consider adding a mindfulness habit to complement your current routine"
      ]
    }

    gardenMood.value = 'growing'
    recommendations.value = [
      "Focus on completing your reading habit for the next 3 days to build momentum",
      "Add a 5-minute meditation habit to support your morning exercise routine",
      "Set specific time blocks for your habits to increase consistency"
    ]
    motivation.value = "Your dedication to morning exercise shows incredible discipline! That same energy can transform your entire habit garden. Keep nurturing what you've planted, and watch the magic happen! 🌟"

  } catch (error) {
    console.error('Error loading AI insights:', error)
  } finally {
    loading.value = false
  }
}

const getHabitCoaching = async (habitId) => {
  try {
    // TODO: Replace with actual API call
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit) return

    // Mock coaching data
    habit.coaching = {
      advice: "This habit shows great potential! Your consistency with morning exercise is building a strong foundation. Focus on making it non-negotiable in your daily routine.",
      nextSteps: [
        "Set a specific time for your morning exercise",
        "Prepare your workout clothes the night before",
        "Track your progress daily to maintain motivation"
      ]
    }

  } catch (error) {
    console.error('Error getting habit coaching:', error)
  }
}

const getWeeklyReport = async () => {
  try {
    weeklyReportLoading.value = true

    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate AI processing

    weeklyReport.value = {
      report: {
        content: "This week has been a fantastic growth period for your habit garden! Your morning exercise routine has maintained its strength, and you're showing great consistency. The reading habit is developing well, though it could benefit from more regular attention."
      },
      weeklyStats: {
        totalHabits: 2,
        totalStreak: 10,
        averageGrowth: 65
      },
      achievements: [
        "Maintained 7-day exercise streak! 🎉",
        "Reading habit reached 45% growth! 📚",
        "Consistent daily habit tracking! 📊"
      ]
    }

  } catch (error) {
    console.error('Error getting weekly report:', error)
  } finally {
    weeklyReportLoading.value = false
  }
}

const refreshInsights = async () => {
  await loadAiInsights()
}

// Lifecycle
onMounted(async () => {
  await loadGardenData()
  await loadAiInsights()
})
</script>

<style scoped>
.ai-gardener-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 2rem 0;
}

.ai-header {
  margin-bottom: 3rem;
}

.loading-state {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.garden-insights {
  margin-bottom: 3rem;
}

.insight-content {
  line-height: 1.6;
}

.key-points ul {
  margin-left: 1rem;
}

.garden-mood-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.recommendations {
  margin-bottom: 3rem;
}

.recommendation-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: 100%;
  transition: transform 0.2s ease;
}

.recommendation-card:hover {
  transform: translateY(-4px);
}

.card-icon {
  color: #22c55e;
}

.motivation {
  margin-bottom: 3rem;
}

.habit-coaching {
  margin-bottom: 3rem;
}

.coaching-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.habit-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.habit-flower {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  transition: all 0.3s ease;
}

.habit-flower.blooming {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
}

.habit-flower.growing {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.habit-flower.stable {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
}

.habit-flower.wilting {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.coaching-actions {
  margin-bottom: 1rem;
}

.coaching-results {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.coaching-summary,
.next-steps {
  margin-bottom: 1rem;
}

.weekly-report {
  margin-bottom: 3rem;
}

.weekly-report-content {
  margin-top: 2rem;
}

.weekly-stats {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  text-align: center;
}

.stat-item {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
}

.achievements {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.achievements-list {
  list-style: none;
  padding: 0;
}

.achievements-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.achievements-list li:last-child {
  border-bottom: none;
}

/* Foundation overrides */
.callout.garden-theme {
  border-left: 4px solid #22c55e;
  background-color: rgba(34, 197, 94, 0.05);
}

.callout.garden-theme.success {
  border-left-color: #22c55e;
  background-color: rgba(34, 197, 94, 0.05);
}

.button.primary {
  background-color: #22c55e;
  border-color: #22c55e;
}

.button.primary:hover {
  background-color: #16a34a;
  border-color: #16a34a;
}

.button.secondary {
  background-color: #a855f7;
  border-color: #a855f7;
}

.button.secondary:hover {
  background-color: #9333ea;
  border-color: #9333ea;
}
</style>
