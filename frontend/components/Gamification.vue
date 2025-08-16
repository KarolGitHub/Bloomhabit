<template>
  <div class="gamification">
    <!-- Header -->
    <div class="gamification-header">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">
        {{ $t('gamification.title') }}
      </h1>
      <p class="text-gray-600 mb-6">
        {{ $t('gamification.description') }}
      </p>
    </div>

    <!-- User Progress Summary -->
    <div class="user-progress-summary mb-8">
      <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold">{{ userProgress.level }}</div>
            <div class="text-sm opacity-90">{{ $t('gamification.level') }}</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold">{{ userProgress.points?.toLocaleString() || 0 }}</div>
            <div class="text-sm opacity-90">{{ $t('gamification.points') }}</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold">{{ userProgress.currentStreak || 0 }}</div>
            <div class="text-sm opacity-90">{{ $t('gamification.currentStreak') }}</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold">{{ userProgress.achievementsUnlocked || 0 }}</div>
            <div class="text-sm opacity-90">{{ $t('gamification.achievements') }}</div>
          </div>
        </div>

        <!-- Level Progress Bar -->
        <div class="mt-6">
          <div class="flex justify-between text-sm mb-2">
            <span>{{ $t('gamification.experience') }}: {{ userProgress.experience || 0 }}</span>
            <span>{{ $t('gamification.nextLevel') }}: {{ nextLevel.requiredExperience || 0 }}</span>
          </div>
          <div class="w-full bg-white bg-opacity-20 rounded-full h-3">
            <div
              class="bg-yellow-400 h-3 rounded-full transition-all duration-500"
              :style="{ width: `${Math.min(100, (nextLevel.progress || 0) * 100)}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-8">
      <nav class="flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === tab.id
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Achievements Tab -->
      <div v-if="activeTab === 'achievements'" class="space-y-6">
        <!-- Achievement Stats -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div class="bg-white rounded-lg shadow-md p-4 text-center">
            <div class="text-2xl font-bold text-amber-600">{{ achievements.byTier?.bronze || 0 }}</div>
            <div class="text-sm text-gray-600">{{ $t('gamification.bronze') }}</div>
          </div>
          <div class="bg-white rounded-lg shadow-md p-4 text-center">
            <div class="text-2xl font-bold text-gray-400">{{ achievements.byTier?.silver || 0 }}</div>
            <div class="text-sm text-gray-600">{{ $t('gamification.silver') }}</div>
          </div>
          <div class="bg-white rounded-lg shadow-md p-4 text-center">
            <div class="text-2xl font-bold text-yellow-500">{{ achievements.byTier?.gold || 0 }}</div>
            <div class="text-sm text-gray-600">{{ $t('gamification.gold') }}</div>
          </div>
          <div class="bg-white rounded-lg shadow-md p-4 text-center">
            <div class="text-2xl font-bold text-blue-400">{{ achievements.byTier?.platinum || 0 }}</div>
            <div class="text-sm text-gray-600">{{ $t('gamification.platinum') }}</div>
          </div>
          <div class="bg-white rounded-lg shadow-md p-4 text-center">
            <div class="text-2xl font-bold text-purple-500">{{ achievements.byTier?.diamond || 0 }}</div>
            <div class="text-sm text-gray-600">{{ $t('gamification.diamond') }}</div>
          </div>
        </div>

        <!-- Recent Achievements -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            {{ $t('gamification.recentAchievements') }}
          </h3>

          <div v-if="achievements.recent && achievements.recent.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="achievement in achievements.recent"
              :key="achievement.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-center space-x-3">
                <div class="text-3xl">{{ achievement.achievement.icon || '🏆' }}</div>
                <div class="flex-1">
                  <h4 class="font-medium text-gray-800">{{ achievement.achievement.name }}</h4>
                  <p class="text-sm text-gray-600">{{ achievement.achievement.description }}</p>
                  <div class="flex items-center space-x-2 mt-2">
                    <span
                      :class="[
                        'px-2 py-1 rounded-full text-xs font-medium',
                        getTierColor(achievement.achievement.tier)
                      ]"
                    >
                      {{ achievement.achievement.tier }}
                    </span>
                    <span class="text-sm text-gray-500">+{{ achievement.achievement.points }} pts</span>
                  </div>
                </div>
              </div>
              <div class="mt-3 text-xs text-gray-500">
                {{ $t('gamification.earned') }}: {{ formatDate(achievement.earnedAt) }}
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            {{ $t('gamification.noAchievements') }}
          </div>
        </div>

        <!-- Check for New Achievements -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-800">{{ $t('gamification.checkAchievements') }}</h3>
              <p class="text-sm text-gray-600">{{ $t('gamification.checkAchievementsDesc') }}</p>
            </div>
            <button
              @click="checkAchievements"
              :disabled="checkingAchievements"
              class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {{ checkingAchievements ? $t('common.checking') : $t('gamification.check') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Challenges Tab -->
      <div v-if="activeTab === 'challenges'" class="space-y-6">
        <!-- Active Challenges -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            {{ $t('gamification.activeChallenges') }}
          </h3>

          <div v-if="challenges.active > 0" class="space-y-4">
            <div
              v-for="challenge in challenges.recent"
              :key="challenge.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-800">{{ challenge.challenge.name }}</h4>
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getDifficultyColor(challenge.challenge.difficulty)
                  ]"
                >
                  {{ challenge.challenge.difficulty }}
                </span>
              </div>

              <p class="text-sm text-gray-600 mb-3">{{ challenge.challenge.description }}</p>

              <div class="mb-3">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm text-gray-600">{{ $t('gamification.progress') }}</span>
                  <span class="text-sm font-medium text-gray-800">
                    {{ Math.round(challenge.progress * 100) }}%
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-green-600 h-2 rounded-full transition-all duration-500"
                    :style="{ width: `${challenge.progress * 100}%` }"
                  ></div>
                </div>
              </div>

              <div class="flex items-center justify-between text-sm text-gray-500">
                <span>{{ $t('gamification.status') }}: {{ challenge.status }}</span>
                <span>{{ $t('gamification.joined') }}: {{ formatDate(challenge.joinedAt) }}</span>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            {{ $t('gamification.noActiveChallenges') }}
          </div>
        </div>

        <!-- Available Challenges -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            {{ $t('gamification.availableChallenges') }}
          </h3>

          <div v-if="availableChallenges && availableChallenges.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="challenge in availableChallenges"
              :key="challenge.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-center space-x-3 mb-3">
                <div class="text-2xl">{{ challenge.icon || '🎯' }}</div>
                <div>
                  <h4 class="font-medium text-gray-800">{{ challenge.name }}</h4>
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      getDifficultyColor(challenge.difficulty)
                    ]"
                  >
                    {{ challenge.difficulty }}
                  </span>
                </div>
              </div>

              <p class="text-sm text-gray-600 mb-3">{{ challenge.description }}</p>

              <div class="flex items-center justify-between mb-3">
                <span class="text-sm text-gray-500">
                  {{ challenge.currentParticipants }}/{{ challenge.maxParticipants }} {{ $t('gamification.participants') }}
                </span>
                <span class="text-sm font-medium text-green-600">+{{ challenge.rewards.points }} pts</span>
              </div>

              <button
                @click="joinChallenge(challenge.id)"
                :disabled="joiningChallenge === challenge.id"
                class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ joiningChallenge === challenge.id ? $t('common.joining') : $t('gamification.join') }}
              </button>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            {{ $t('gamification.noAvailableChallenges') }}
          </div>
        </div>
      </div>

      <!-- Leaderboards Tab -->
      <div v-if="activeTab === 'leaderboards'" class="space-y-6">
        <!-- Active Leaderboards -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            {{ $t('gamification.activeLeaderboards') }}
          </h3>

          <div v-if="activeLeaderboards && activeLeaderboards.length > 0" class="space-y-4">
            <div
              v-for="leaderboard in activeLeaderboards"
              :key="leaderboard.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              @click="viewLeaderboard(leaderboard.id)"
            >
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-800">{{ leaderboard.name }}</h4>
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getLeaderboardTypeColor(leaderboard.type)
                  ]"
                >
                  {{ leaderboard.type }}
                </span>
              </div>

              <p class="text-sm text-gray-600 mb-3">{{ leaderboard.description }}</p>

              <div class="flex items-center justify-between text-sm text-gray-500">
                <span>{{ leaderboard.currentParticipants }}/{{ leaderboard.maxEntries }} {{ $t('gamification.participants') }}</span>
                <span>{{ $t('gamification.metric') }}: {{ leaderboard.metric }}</span>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            {{ $t('gamification.noActiveLeaderboards') }}
          </div>
        </div>
      </div>

      <!-- Profile Tab -->
      <div v-if="activeTab === 'profile'" class="space-y-6">
        <!-- User Stats -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            {{ $t('gamification.userStats') }}
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('gamification.totalStreak') }}</span>
                <span class="font-medium">{{ userProgress.totalStreak || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('gamification.perfectDays') }}</span>
                <span class="font-medium">{{ userProgress.perfectDays || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('gamification.achievements') }}</span>
                <span class="font-medium">{{ userProgress.achievementsUnlocked || 0 }}</span>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('gamification.activeChallenges') }}</span>
                <span class="font-medium">{{ challenges.active || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('gamification.completedChallenges') }}</span>
                <span class="font-medium">{{ challenges.completed || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('gamification.failedChallenges') }}</span>
                <span class="font-medium">{{ challenges.failed || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Customization -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            {{ $t('gamification.customization') }}
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('gamification.customTitle') }}
              </label>
              <input
                v-model="customization.title"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                :placeholder="$t('gamification.titlePlaceholder')"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('gamification.avatarFrame') }}
              </label>
              <select
                v-model="customization.avatarFrame"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">{{ $t('gamification.noFrame') }}</option>
                <option value="gold">Gold Frame</option>
                <option value="silver">Silver Frame</option>
                <option value="bronze">Bronze Frame</option>
                <option value="rainbow">Rainbow Frame</option>
              </select>
            </div>
          </div>

          <div class="mt-4 flex justify-end">
            <button
              @click="saveCustomization"
              :disabled="savingCustomization"
              class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {{ savingCustomization ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '~/composables/useToast'

const { t } = useI18n()
const { showToast } = useToast()

// State
const loading = ref(false)
const checkingAchievements = ref(false)
const joiningChallenge = ref<number | null>(null)
const savingCustomization = ref(false)
const activeTab = ref('achievements')

// Data
const userProgress = ref({
  level: 1,
  points: 0,
  experience: 0,
  currentStreak: 0,
  totalStreak: 0,
  perfectDays: 0,
  achievementsUnlocked: 0,
  title: '',
  avatarFrame: '',
})

const nextLevel = ref({
  currentLevel: 1,
  currentExperience: 0,
  requiredExperience: 100,
  progress: 0,
})

const achievements = ref({
  total: 0,
  recent: [],
  byTier: {
    bronze: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
    diamond: 0,
  },
})

const challenges = ref({
  active: 0,
  completed: 0,
  failed: 0,
  recent: [],
})

const availableChallenges = ref([])
const activeLeaderboards = ref([])

const customization = ref({
  title: '',
  avatarFrame: '',
})

// Tabs
const tabs = [
  { id: 'achievements', name: t('gamification.achievements') },
  { id: 'challenges', name: t('gamification.challenges') },
  { id: 'leaderboards', name: t('gamification.leaderboards') },
  { id: 'profile', name: t('gamification.profile') },
]

// Methods
const loadGamificationSummary = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/gamification/summary', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    userProgress.value = response.user
    nextLevel.value = response.nextLevel
    achievements.value = response.achievements
    challenges.value = response.challenges
    availableChallenges.value = response.availableChallenges
    activeLeaderboards.value = response.activeLeaderboards

    // Set customization values
    customization.value.title = response.user.title || ''
    customization.value.avatarFrame = response.user.avatarFrame || ''
  } catch (error) {
    console.error('Error loading gamification summary:', error)
    showToast('Error loading gamification data', 'error')
  } finally {
    loading.value = false
  }
}

const checkAchievements = async () => {
  try {
    checkingAchievements.value = true
    const response = await $fetch('/api/gamification/achievements/check', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (response && response.length > 0) {
      showToast(`Earned ${response.length} new achievements!`, 'success')
      // Reload summary to update data
      await loadGamificationSummary()
    } else {
      showToast('No new achievements earned', 'info')
    }
  } catch (error) {
    console.error('Error checking achievements:', error)
    showToast('Error checking achievements', 'error')
  } finally {
    checkingAchievements.value = false
  }
}

const joinChallenge = async (challengeId: number) => {
  try {
    joiningChallenge.value = challengeId
    await $fetch(`/api/gamification/challenges/${challengeId}/join`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    showToast('Successfully joined challenge!', 'success')
    // Reload summary to update data
    await loadGamificationSummary()
  } catch (error) {
    console.error('Error joining challenge:', error)
    showToast('Error joining challenge', 'error')
  } finally {
    joiningChallenge.value = null
  }
}

const viewLeaderboard = (leaderboardId: number) => {
  // TODO: Implement leaderboard view
  showToast('Leaderboard view not implemented yet', 'info')
}

const saveCustomization = async () => {
  try {
    savingCustomization.value = true
    // TODO: Implement customization save API
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

    showToast('Customization saved successfully', 'success')
  } catch (error) {
    console.error('Error saving customization:', error)
    showToast('Error saving customization', 'error')
  } finally {
    savingCustomization.value = false
  }
}

// Utility methods
const getTierColor = (tier: string) => {
  const colors = {
    bronze: 'bg-amber-100 text-amber-800',
    silver: 'bg-gray-100 text-gray-800',
    gold: 'bg-yellow-100 text-yellow-800',
    platinum: 'bg-blue-100 text-blue-800',
    diamond: 'bg-purple-100 text-purple-800',
  }
  return colors[tier] || 'bg-gray-100 text-gray-800'
}

const getDifficultyColor = (difficulty: string) => {
  const colors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-orange-100 text-orange-800',
    expert: 'bg-red-100 text-red-800',
  }
  return colors[difficulty] || 'bg-gray-100 text-gray-800'
}

const getLeaderboardTypeColor = (type: string) => {
  const colors = {
    global: 'bg-purple-100 text-purple-800',
    weekly: 'bg-blue-100 text-blue-800',
    monthly: 'bg-green-100 text-green-800',
    seasonal: 'bg-orange-100 text-orange-800',
    event: 'bg-red-100 text-red-800',
    category: 'bg-indigo-100 text-indigo-800',
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadGamificationSummary()
})
</script>

<style scoped>
.gamification {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8;
}

.gamification-header {
  @apply text-center mb-8;
}

.tab-content {
  @apply min-h-96;
}

/* Custom scrollbar for long lists */
.space-y-4 {
  max-height: 600px;
  overflow-y: auto;
}

.space-y-4::-webkit-scrollbar {
  width: 6px;
}

.space-y-4::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.space-y-4::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.space-y-4::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

