<template>
  <div class="pwa-settings-page">
    <div class="grid-container">
      <!-- Header -->
      <header class="settings-header">
        <div class="grid-x align-middle">
          <div class="cell medium-8">
            <h1 class="text-gradient text-4xl font-bold mb-2">⚙️ PWA Settings</h1>
            <p class="text-gray-600 text-lg">Manage your Bloomhabit app experience</p>
          </div>
          <div class="cell medium-4 text-right">
            <button class="button primary large rounded" @click="checkPWAStatus">
              <span class="mr-2">🔍</span> Check Status
            </button>
          </div>
        </div>
      </header>

      <!-- PWA Status -->
      <section class="pwa-status">
        <div class="grid-x grid-margin-x">
          <div class="cell medium-6">
            <div class="status-card">
              <h3 class="text-xl font-bold text-gray-800 mb-4">📱 App Status</h3>
              <div class="status-items">
                <div class="status-item">
                  <span class="status-label">Installed:</span>
                  <span class="status-value" :class="pwaStatus.installed ? 'text-green-600' : 'text-red-600'">
                    {{ pwaStatus.installed ? '✅ Yes' : '❌ No' }}
                  </span>
                </div>
                <div class="status-item">
                  <span class="status-label">Service Worker:</span>
                  <span class="status-value" :class="pwaStatus.serviceWorker ? 'text-green-600' : 'text-red-600'">
                    {{ pwaStatus.serviceWorker ? '✅ Active' : '❌ Inactive' }}
                  </span>
                </div>
                <div class="status-item">
                  <span class="status-label">Offline Support:</span>
                  <span class="status-value" :class="pwaStatus.offlineSupport ? 'text-green-600' : 'text-red-600'">
                    {{ pwaStatus.offlineSupport ? '✅ Available' : '❌ Unavailable' }}
                  </span>
                </div>
                <div class="status-item">
                  <span class="status-label">Push Notifications:</span>
                  <span class="status-value" :class="pwaStatus.pushNotifications ? 'text-green-600' : 'text-red-600'">
                    {{ pwaStatus.pushNotifications ? '✅ Enabled' : '❌ Disabled' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="cell medium-6">
            <div class="status-card">
              <h3 class="text-xl font-bold text-gray-800 mb-4">🌐 Connection</h3>
              <div class="status-items">
                <div class="status-item">
                  <span class="status-label">Online Status:</span>
                  <span class="status-value" :class="isOnline ? 'text-green-600' : 'text-red-600'">
                    {{ isOnline ? '✅ Online' : '❌ Offline' }}
                  </span>
                </div>
                <div class="status-item">
                  <span class="status-label">Cache Size:</span>
                  <span class="status-value">{{ cacheSize }}</span>
                </div>
                <div class="status-item">
                  <span class="status-label">Last Updated:</span>
                  <span class="status-value">{{ lastUpdated }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Installation Section -->
      <section class="installation-section">
        <div class="grid-x grid-margin-x">
          <div class="cell medium-8">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">📲 Install Bloomhabit</h3>
            <p class="text-gray-600 mb-4">
              Install Bloomhabit on your device for a native app experience. You'll get offline access,
              push notifications, and quick access from your home screen.
            </p>

            <div class="install-options">
              <div class="grid-x grid-margin-x">
                <div class="cell small-12 medium-6">
                  <div class="install-option">
                    <h4 class="font-semibold text-gray-800 mb-2">🌐 Web Browser</h4>
                    <p class="text-sm text-gray-600 mb-3">Install directly from your browser</p>
                    <button v-if="canInstall && !pwaStatus.installed" class="button primary expanded"
                      @click="installPWA">
                      📱 Install App
                    </button>
                    <div v-else-if="pwaStatus.installed" class="text-green-600 font-semibold">
                      ✅ Already Installed
                    </div>
                    <div v-else class="text-gray-500 text-sm">
                      Installation not available
                    </div>
                  </div>
                </div>

                <div class="cell small-12 medium-6">
                  <div class="install-option">
                    <h4 class="font-semibold text-gray-800 mb-2">📱 Mobile Device</h4>
                    <p class="text-sm text-gray-600 mb-3">Add to home screen manually</p>
                    <div class="mobile-instructions">
                      <div class="instruction-item">
                        <span class="instruction-icon">🍎</span>
                        <span class="instruction-text">iOS: Tap Share → Add to Home Screen</span>
                      </div>
                      <div class="instruction-item">
                        <span class="instruction-icon">🤖</span>
                        <span class="instruction-text">Android: Tap Menu → Add to Home Screen</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="cell medium-4">
            <div class="install-benefits">
              <h4 class="font-semibold text-gray-800 mb-3">✨ Benefits</h4>
              <ul class="benefits-list">
                <li>📱 Quick access from home screen</li>
                <li>💾 Works offline</li>
                <li>🔔 Push notifications</li>
                <li>⚡ Faster loading</li>
                <li>🎯 Native app feel</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Notifications Section -->
      <section class="notifications-section">
        <div class="grid-x grid-margin-x">
          <div class="cell medium-8">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">🔔 Push Notifications</h3>
            <p class="text-gray-600 mb-4">
              Stay motivated with timely reminders and updates about your habit garden.
            </p>

            <div class="notification-settings">
              <div class="grid-x grid-margin-x">
                <div class="cell small-12 medium-6">
                  <div class="setting-item">
                    <label class="setting-label">
                      <input type="checkbox" v-model="notificationSettings.dailyReminders"
                        @change="updateNotificationSettings" />
                      <span class="setting-text">Daily habit reminders</span>
                    </label>
                    <p class="setting-description">Get reminded to complete your daily habits</p>
                  </div>

                  <div class="setting-item">
                    <label class="setting-label">
                      <input type="checkbox" v-model="notificationSettings.weeklyReports"
                        @change="updateNotificationSettings" />
                      <span class="setting-text">Weekly progress reports</span>
                    </label>
                    <p class="setting-description">Receive weekly summaries of your progress</p>
                  </div>
                </div>

                <div class="cell small-12 medium-6">
                  <div class="setting-item">
                    <label class="setting-label">
                      <input type="checkbox" v-model="notificationSettings.achievements"
                        @change="updateNotificationSettings" />
                      <span class="setting-text">Achievement celebrations</span>
                    </label>
                    <p class="setting-description">Celebrate when you reach milestones</p>
                  </div>

                  <div class="setting-item">
                    <label class="setting-label">
                      <input type="checkbox" v-model="notificationSettings.aiInsights"
                        @change="updateNotificationSettings" />
                      <span class="setting-text">AI Gardener insights</span>
                    </label>
                    <p class="setting-description">Get personalized tips from your AI coach</p>
                  </div>
                </div>
              </div>

              <div class="notification-actions mt-4">
                <button class="button primary" @click="requestNotificationPermission"
                  :disabled="notificationPermission !== 'default'">
                  {{ getNotificationButtonText() }}
                </button>

                <button v-if="notificationPermission === 'granted'" class="button secondary ml-2"
                  @click="testNotification">
                  🧪 Test Notification
                </button>
              </div>
            </div>
          </div>

          <div class="cell medium-4">
            <div class="notification-preview">
              <h4 class="font-semibold text-gray-800 mb-3">📱 Preview</h4>
              <div class="notification-example">
                <div class="notification-header">
                  <span class="notification-icon">🌱</span>
                  <span class="notification-title">Bloomhabit</span>
                  <span class="notification-time">now</span>
                </div>
                <div class="notification-body">
                  Time to water your habits! 🌿
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Offline Settings -->
      <section class="offline-settings">
        <div class="grid-x grid-margin-x">
          <div class="cell medium-8">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">💾 Offline Settings</h3>
            <p class="text-gray-600 mb-4">
              Configure how Bloomhabit works when you're offline.
            </p>

            <div class="offline-options">
              <div class="grid-x grid-margin-x">
                <div class="cell small-12 medium-6">
                  <div class="setting-item">
                    <label class="setting-label">
                      <input type="checkbox" v-model="offlineSettings.cacheGarden" @change="updateOfflineSettings" />
                      <span class="setting-text">Cache habit garden</span>
                    </label>
                    <p class="setting-description">Store your garden data for offline viewing</p>
                  </div>

                  <div class="setting-item">
                    <label class="setting-label">
                      <input type="checkbox" v-model="offlineSettings.cacheAIInsights"
                        @change="updateOfflineSettings" />
                      <span class="setting-text">Cache AI insights</span>
                    </label>
                    <p class="setting-description">Store AI recommendations for offline access</p>
                  </div>
                </div>

                <div class="cell small-12 medium-6">
                  <div class="setting-item">
                    <label class="setting-label">
                      <input type="checkbox" v-model="offlineSettings.backgroundSync" @change="updateOfflineSettings" />
                      <span class="setting-text">Background sync</span>
                    </label>
                    <p class="setting-description">Sync changes when you come back online</p>
                  </div>

                  <div class="setting-item">
                    <label class="setting-label">
                      <input type="checkbox" v-model="offlineSettings.offlineMode" @change="updateOfflineSettings" />
                      <span class="setting-text">Offline mode</span>
                    </label>
                    <p class="setting-description">Allow full app functionality offline</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="cell medium-4">
            <div class="offline-info">
              <h4 class="font-semibold text-gray-800 mb-3">💡 Offline Tips</h4>
              <ul class="tips-list">
                <li>Your data is stored locally for privacy</li>
                <li>Changes sync automatically when online</li>
                <li>You can still track habits offline</li>
                <li>Cache size is automatically managed</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Cache Management -->
      <section class="cache-management">
        <div class="grid-x grid-margin-x">
          <div class="cell medium-8">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">🗂️ Cache Management</h3>
            <p class="text-gray-600 mb-4">
              Manage your app's offline storage and cache.
            </p>

            <div class="cache-actions">
              <button class="button secondary" @click="clearCache">
                🗑️ Clear Cache
              </button>

              <button class="button secondary ml-2" @click="updateCache">
                🔄 Update Cache
              </button>

              <button class="button secondary ml-2" @click="exportData">
                📤 Export Data
              </button>
            </div>
          </div>

          <div class="cell medium-4">
            <div class="cache-stats">
              <h4 class="font-semibold text-gray-800 mb-3">📊 Cache Statistics</h4>
              <div class="stat-item">
                <span class="stat-label">Total Size:</span>
                <span class="stat-value">{{ cacheSize }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Items Cached:</span>
                <span class="stat-value">{{ cacheItems }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Last Cleanup:</span>
                <span class="stat-value">{{ lastCleanup }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Reactive data
const isOnline = ref(navigator.onLine)
const pwaStatus = ref({
  installed: false,
  serviceWorker: false,
  offlineSupport: false,
  pushNotifications: false
})

const notificationSettings = ref({
  dailyReminders: true,
  weeklyReports: true,
  achievements: true,
  aiInsights: true
})

const offlineSettings = ref({
  cacheGarden: true,
  cacheAIInsights: true,
  backgroundSync: true,
  offlineMode: true
})

const notificationPermission = ref(Notification.permission)
const canInstall = ref(false)
const cacheSize = ref('0 MB')
const cacheItems = ref(0)
const lastUpdated = ref('Never')
const lastCleanup = ref('Never')

// Methods
const checkPWAStatus = async () => {
  // Check if PWA is installed
  pwaStatus.value.installed = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true

  // Check service worker
  pwaStatus.value.serviceWorker = 'serviceWorker' in navigator

  // Check offline support
  pwaStatus.value.offlineSupport = 'caches' in window

  // Check push notifications
  pwaStatus.value.pushNotifications = 'Notification' in window &&
    'serviceWorker' in navigator

  // Check cache size
  await updateCacheStats()

  // Check install capability
  checkInstallCapability()
}

const checkInstallCapability = () => {
  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    canInstall.value = true
  })
}

const installPWA = async () => {
  // This would trigger the install prompt
  console.log('Installing PWA...')
}

const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission()
    notificationPermission.value = permission

    if (permission === 'granted') {
      console.log('Notification permission granted')
      // Subscribe to push notifications
      await subscribeToPushNotifications()
    }
  } catch (error) {
    console.error('Failed to request notification permission:', error)
  }
}

const subscribeToPushNotifications = async () => {
  try {
    const registration = await navigator.serviceWorker.ready

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: '' // VAPID public key would go here
    })

    console.log('Push notification subscription:', subscription)

    // Send subscription to server
    await sendSubscriptionToServer(subscription)

  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
  }
}

const sendSubscriptionToServer = async (subscription: PushSubscription) => {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription)
    })

    if (response.ok) {
      console.log('Subscription sent to server successfully')
    }
  } catch (error) {
    console.error('Error sending subscription to server:', error)
  }
}

const testNotification = () => {
  if (Notification.permission === 'granted') {
    new Notification('Bloomhabit', {
      body: 'This is a test notification! 🌱',
      icon: '/android-chrome-192x192.png',
      badge: '/favicon-32x32.png'
    })
  }
}

const getNotificationButtonText = () => {
  switch (notificationPermission.value) {
    case 'granted':
      return '✅ Notifications Enabled'
    case 'denied':
      return '❌ Notifications Blocked'
    default:
      return '🔔 Enable Notifications'
  }
}

const updateNotificationSettings = () => {
  // Save notification settings to localStorage
  localStorage.setItem('bloomhabit-notifications', JSON.stringify(notificationSettings.value))
  console.log('Notification settings updated:', notificationSettings.value)
}

const updateOfflineSettings = () => {
  // Save offline settings to localStorage
  localStorage.setItem('bloomhabit-offline', JSON.stringify(offlineSettings.value))
  console.log('Offline settings updated:', offlineSettings.value)
}

const updateCacheStats = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys()
      let totalSize = 0
      let totalItems = 0

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const requests = await cache.keys()
        totalItems += requests.length

        // Estimate size (this is approximate)
        for (const request of requests) {
          const response = await cache.match(request)
          if (response) {
            const blob = await response.blob()
            totalSize += blob.size
          }
        }
      }

      cacheSize.value = formatBytes(totalSize)
      cacheItems.value = totalItems

    } catch (error) {
      console.error('Error getting cache stats:', error)
    }
  }
}

const clearCache = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))

      await updateCacheStats()
      lastCleanup.value = new Date().toLocaleDateString()

      console.log('Cache cleared successfully')
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }
}

const updateCache = async () => {
  // This would update the service worker and refresh the cache
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        window.location.reload()
      }
    } catch (error) {
      console.error('Error updating cache:', error)
    }
  }
}

const exportData = () => {
  // Export user data (habits, settings, etc.)
  const data = {
    settings: {
      notifications: notificationSettings.value,
      offline: offlineSettings.value
    },
    timestamp: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bloomhabit-settings.json'
  a.click()
  URL.revokeObjectURL(url)
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

// Lifecycle
onMounted(async () => {
  // Load saved settings
  const savedNotifications = localStorage.getItem('bloomhabit-notifications')
  if (savedNotifications) {
    notificationSettings.value = { ...notificationSettings.value, ...JSON.parse(savedNotifications) }
  }

  const savedOffline = localStorage.getItem('bloomhabit-offline')
  if (savedOffline) {
    offlineSettings.value = { ...offlineSettings.value, ...JSON.parse(savedOffline) }
  }

  // Check PWA status
  await checkPWAStatus()

  // Set up event listeners
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  // Set last updated
  lastUpdated.value = new Date().toLocaleDateString()
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<style scoped>
.pwa-settings-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 2rem 0;
}

.settings-header {
  margin-bottom: 3rem;
}

.pwa-status {
  margin-bottom: 3rem;
}

.status-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.status-items {
  space-y: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-weight: 500;
  color: #374151;
}

.status-value {
  font-weight: 600;
}

.installation-section,
.notifications-section,
.offline-settings,
.cache-management {
  margin-bottom: 3rem;
}

.install-options {
  margin-bottom: 2rem;
}

.install-option {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.mobile-instructions {
  space-y: 0.5rem;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.instruction-icon {
  font-size: 1.25rem;
}

.install-benefits {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.benefits-list {
  list-style: none;
  padding: 0;
  space-y: 0.5rem;
}

.benefits-list li {
  font-size: 0.875rem;
  color: #6b7280;
}

.notification-settings {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.setting-item {
  margin-bottom: 1.5rem;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.setting-text {
  font-weight: 500;
  color: #374151;
}

.setting-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-left: 1.75rem;
}

.notification-preview {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.notification-example {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
}

.notification-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.notification-icon {
  font-size: 1.25rem;
}

.notification-title {
  font-weight: 600;
  color: #374151;
}

.notification-time {
  margin-left: auto;
  font-size: 0.75rem;
  color: #9ca3af;
}

.notification-body {
  color: #6b7280;
  font-size: 0.875rem;
}

.offline-options {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.offline-info {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tips-list {
  list-style: none;
  padding: 0;
  space-y: 0.5rem;
}

.tips-list li {
  font-size: 0.875rem;
  color: #6b7280;
  padding-left: 1rem;
  position: relative;
}

.tips-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #22c55e;
}

.cache-actions {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cache-stats {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-value {
  font-weight: 600;
  color: #374151;
}

/* Foundation overrides */
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

/* Custom checkbox styles */
input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #22c55e;
}
</style>
