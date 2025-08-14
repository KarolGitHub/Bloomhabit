<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">🔔 Notifications</h1>
        <p class="text-lg text-gray-600">Stay updated with your habit progress and insights</p>
      </div>

      <!-- Notification Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow p-6 text-center">
          <div class="text-3xl font-bold text-blue-600">{{ stats.total }}</div>
          <div class="text-gray-600">Total</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6 text-center">
          <div class="text-3xl font-bold text-orange-600">{{ stats.unread }}</div>
          <div class="text-gray-600">Unread</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6 text-center">
          <div class="text-3xl font-bold text-green-600">{{ stats.read }}</div>
          <div class="text-gray-600">Read</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6 text-center">
          <div class="text-3xl font-bold text-purple-600">{{ stats.archived }}</div>
          <div class="text-gray-600">Archived</div>
        </div>
      </div>

      <!-- Push Notification Settings -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h2 class="text-2xl font-semibold mb-4">Push Notifications</h2>

        <div v-if="!isPushSupported" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div class="flex">
            <div class="text-yellow-800">⚠️ Push notifications are not supported in this browser</div>
          </div>
        </div>

        <div v-else>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-medium">Enable Push Notifications</h3>
              <p class="text-gray-600">Receive notifications even when the app is closed</p>
            </div>
            <button v-if="!pushSubscription" @click="subscribeToPush" class="button primary" :disabled="isSubscribing">
              {{ isSubscribing ? 'Subscribing...' : 'Subscribe' }}
            </button>
            <button v-else @click="unsubscribeFromPush" class="button secondary" :disabled="isUnsubscribing">
              {{ isUnsubscribing ? 'Unsubscribing...' : 'Unsubscribe' }}
            </button>
          </div>

          <div v-if="pushSubscription" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Notification Preferences
                </label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input v-model="preferences.habitReminders" type="checkbox"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="ml-2 text-sm text-gray-700">Habit Reminders</span>
                  </label>
                  <label class="flex items-center">
                    <input v-model="preferences.streakMilestones" type="checkbox"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="ml-2 text-sm text-gray-700">Streak Milestones</span>
                  </label>
                  <label class="flex items-center">
                    <input v-model="preferences.goalAchievements" type="checkbox"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="ml-2 text-sm text-gray-700">Goal Achievements</span>
                  </label>
                  <label class="flex items-center">
                    <input v-model="preferences.aiInsights" type="checkbox"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="ml-2 text-sm text-gray-700">AI Insights</span>
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Info
                </label>
                <div class="text-sm text-gray-600 space-y-1">
                  <div>Status: <span class="text-green-600 font-medium">Active</span></div>
                  <div>Device: {{ deviceInfo.type || 'Unknown' }}</div>
                  <div>Browser: {{ deviceInfo.browser || 'Unknown' }}</div>
                </div>
              </div>
            </div>

            <button @click="updatePreferences" class="button primary small" :disabled="isUpdatingPreferences">
              {{ isUpdatingPreferences ? 'Updating...' : 'Update Preferences' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-semibold">Your Notifications</h2>
            <div class="flex space-x-2">
              <button @click="markAllAsRead" class="button secondary small" :disabled="!hasUnreadNotifications">
                Mark All Read
              </button>
              <select v-model="statusFilter" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="notifications.length === 0" class="p-8 text-center text-gray-500">
          <div class="text-4xl mb-4">🔔</div>
          <p>No notifications yet</p>
          <p class="text-sm">You'll see notifications here when you achieve milestones or receive insights</p>
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div v-for="notification in filteredNotifications" :key="notification.id"
            class="p-6 hover:bg-gray-50 transition-colors" :class="{ 'bg-blue-50': notification.status === 'unread' }">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <div class="text-2xl">{{ getNotificationIcon(notification.type) }}</div>
                  <div>
                    <h3 class="text-lg font-medium text-gray-900">
                      {{ notification.title }}
                    </h3>
                    <p class="text-sm text-gray-500">
                      {{ formatDate(notification.createdAt) }}
                    </p>
                  </div>
                </div>
                <p class="text-gray-700 mb-3">{{ notification.message }}</p>
                <div class="flex items-center space-x-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getPriorityClass(notification.priority)">
                    {{ notification.priority }}
                  </span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusClass(notification.status)">
                    {{ notification.status }}
                  </span>
                </div>
              </div>
              <div class="flex space-x-2 ml-4">
                <button v-if="notification.status === 'unread'" @click="markAsRead(notification.id)"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Mark Read
                </button>
                <button @click="deleteNotification(notification.id)"
                  class="text-red-600 hover:text-red-800 text-sm font-medium">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $api } = useNuxtApp()

// Reactive data
const stats = ref({ total: 0, unread: 0, read: 0, archived: 0 })
const notifications = ref([])
const pushSubscription = ref(null)
const isPushSupported = ref(false)
const isSubscribing = ref(false)
const isUnsubscribing = ref(false)
const isUpdatingPreferences = ref(false)
const statusFilter = ref('')
const preferences = ref({
  habitReminders: true,
  streakMilestones: true,
  goalAchievements: true,
  aiInsights: true,
  systemUpdates: true,
  friendActivity: false
})
const deviceInfo = ref({})

// Computed properties
const filteredNotifications = computed(() => {
  if (!statusFilter.value) return notifications.value
  return notifications.value.filter(n => n.status === statusFilter.value)
})

const hasUnreadNotifications = computed(() => {
  return notifications.value.some(n => n.status === 'unread')
})

// Methods
const loadNotifications = async () => {
  try {
    const response = await $api.get('/notifications')
    notifications.value = response.data
  } catch (error) {
    console.error('Failed to load notifications:', error)
  }
}

const loadStats = async () => {
  try {
    const response = await $api.get('/notifications/stats')
    stats.value = response.data
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const markAsRead = async (id) => {
  try {
    await $api.put(`/notifications/${id}/read`)
    await loadNotifications()
    await loadStats()
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
  }
}

const markAllAsRead = async () => {
  try {
    await $api.put('/notifications/mark-all-read')
    await loadNotifications()
    await loadStats()
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
  }
}

const deleteNotification = async (id) => {
  try {
    await $api.delete(`/notifications/${id}`)
    await loadNotifications()
    await loadStats()
  } catch (error) {
    console.error('Failed to delete notification:', error)
  }
}

const subscribeToPush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert('Push notifications are not supported in this browser')
    return
  }

  try {
    isSubscribing.value = true

    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js')

    // Request notification permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      throw new Error('Notification permission denied')
    }

    // Get VAPID public key
    const vapidResponse = await $api.get('/notifications/push/vapid-public-key')
    const vapidPublicKey = vapidResponse.data.publicKey

    if (!vapidPublicKey) {
      throw new Error('VAPID public key not available')
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    })

    // Send subscription to backend
    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
      },
      userAgent: navigator.userAgent,
      deviceType: getDeviceType(),
      preferences: preferences.value
    }

    const response = await $api.post('/notifications/push/subscriptions', subscriptionData)
    pushSubscription.value = response.data
    deviceInfo.value = {
      type: getDeviceType(),
      browser: getBrowserInfo()
    }

    // Load existing preferences
    if (response.data.preferences) {
      preferences.value = { ...preferences.value, ...response.data.preferences }
    }

  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
    alert('Failed to subscribe to push notifications: ' + error.message)
  } finally {
    isSubscribing.value = false
  }
}

const unsubscribeFromPush = async () => {
  try {
    isUnsubscribing.value = true

    if (pushSubscription.value) {
      await $api.delete(`/notifications/push/subscriptions/${pushSubscription.value.id}`)
    }

    // Unsubscribe from push manager
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
      }
    }

    pushSubscription.value = null
    deviceInfo.value = {}

  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error)
    alert('Failed to unsubscribe from push notifications: ' + error.message)
  } finally {
    isUnsubscribing.value = false
  }
}

const updatePreferences = async () => {
  if (!pushSubscription.value) return

  try {
    isUpdatingPreferences.value = true
    await $api.put(`/notifications/push/subscriptions/${pushSubscription.value.id}/preferences`, preferences.value)
  } catch (error) {
    console.error('Failed to update preferences:', error)
    alert('Failed to update preferences: ' + error.message)
  } finally {
    isUpdatingPreferences.value = false
  }
}

const getNotificationIcon = (type) => {
  const icons = {
    habit_reminder: '⏰',
    streak_milestone: '🎉',
    goal_achievement: '🏆',
    ai_insight: '🌱',
    system_update: '🔧',
    friend_activity: '👥'
  }
  return icons[type] || '🔔'
}

const getPriorityClass = (priority) => {
  const classes = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }
  return classes[priority] || 'bg-gray-100 text-gray-800'
}

const getStatusClass = (status) => {
  const classes = {
    unread: 'bg-blue-100 text-blue-800',
    read: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getDeviceType = () => {
  const ua = navigator.userAgent
  if (/Android/i.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS'
  if (/Windows/i.test(ua)) return 'Windows'
  if (/Mac/i.test(ua)) return 'macOS'
  if (/Linux/i.test(ua)) return 'Linux'
  return 'Unknown'
}

const getBrowserInfo = () => {
  const ua = navigator.userAgent
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  return 'Unknown'
}

// Lifecycle
onMounted(async () => {
  isPushSupported.value = 'serviceWorker' in navigator && 'PushManager' in window

  await loadNotifications()
  await loadStats()
})
</script>
