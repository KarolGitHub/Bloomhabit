<template>
  <div class="social-page">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        {{ $t('social.title') }}
      </h1>
      <p class="text-gray-600">
        {{ $t('social.description') }}
      </p>
    </div>

    <!-- Social Navigation Tabs -->
    <div class="social-tabs mb-8">
      <nav class="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          ]"
        >
          <i :class="tab.icon + ' mr-2'"></i>
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Friends Tab -->
      <div v-if="activeTab === 'friends'" class="space-y-6">
        <FriendsList />
      </div>

      <!-- Habit Sharing Tab -->
      <div v-if="activeTab === 'sharing'" class="space-y-6">
        <HabitShare />
      </div>

      <!-- Activity Feed Tab -->
      <div v-if="activeTab === 'activity'" class="space-y-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            {{ $t('social.activityFeed.title') }}
          </h2>
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-stream text-4xl mb-4"></i>
            <p>{{ $t('social.activityFeed.comingSoon') }}</p>
          </div>
        </div>
      </div>

      <!-- Social Stats Tab -->
      <div v-if="activeTab === 'stats'" class="space-y-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            {{ $t('social.stats.title') }}
          </h2>
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-chart-bar text-4xl mb-4"></i>
            <p>{{ $t('social.stats.comingSoon') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions mt-8">
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h3 class="text-lg font-semibold mb-3">
          {{ $t('social.quickActions.title') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            @click="activeTab = 'friends'; showAddFriendModal = true"
            class="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <i class="fas fa-user-plus text-2xl mb-2"></i>
            <p class="font-medium">{{ $t('social.quickActions.addFriend') }}</p>
          </button>
          <button
            @click="activeTab = 'sharing'; showShareModal = true"
            class="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <i class="fas fa-share-alt text-2xl mb-2"></i>
            <p class="font-medium">{{ $t('social.quickActions.shareHabit') }}</p>
          </button>
          <button
            @click="navigateTo('/community')"
            class="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <i class="fas fa-users text-2xl mb-2"></i>
            <p class="font-medium">{{ $t('social.quickActions.joinCommunity') }}</p>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// State
const activeTab = ref('friends')
const showAddFriendModal = ref(false)
const showShareModal = ref(false)

// Tab configuration
const tabs = [
  {
    id: 'friends',
    label: t('social.tabs.friends'),
    icon: 'fas fa-users'
  },
  {
    id: 'sharing',
    label: t('social.tabs.sharing'),
    icon: 'fas fa-share-alt'
  },
  {
    id: 'activity',
    label: t('social.tabs.activity'),
    icon: 'fas fa-stream'
  },
  {
    id: 'stats',
    label: t('social.tabs.stats'),
    icon: 'fas fa-chart-bar'
  }
]

// Page metadata
useHead({
  title: t('social.pageTitle'),
  meta: [
    {
      name: 'description',
      content: t('social.pageDescription')
    }
  ]
})
</script>

<style scoped>
.social-page {
  @apply max-w-6xl mx-auto px-4 py-8;
}

.page-header {
  @apply text-center mb-8;
}

.social-tabs {
  @apply flex justify-center;
}

.tab-content {
  @apply min-h-[400px];
}

.quick-actions {
  @apply max-w-4xl mx-auto;
}
</style>
