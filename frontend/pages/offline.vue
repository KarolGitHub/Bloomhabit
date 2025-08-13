<template>
  <div class="offline-page">
    <div class="grid-container">
      <div class="text-center py-12">
        <!-- Offline Icon -->
        <div class="offline-icon text-8xl mb-6">🌱</div>

        <!-- Main Message -->
        <h1 class="text-4xl font-bold text-gray-800 mb-4">You're Offline</h1>
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Don't worry! Your habit garden is still growing. You can view your cached habits and continue tracking your
          progress.
        </p>

        <!-- Offline Features -->
        <div class="offline-features mb-8">
          <div class="grid-x grid-margin-x">
            <div class="cell small-12 medium-4">
              <div class="feature-card">
                <div class="feature-icon text-4xl mb-3">📱</div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">View Your Garden</h3>
                <p class="text-gray-600">Access your habit garden and see your progress</p>
              </div>
            </div>
            <div class="cell small-12 medium-4">
              <div class="feature-card">
                <div class="feature-icon text-4xl mb-3">📝</div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">Track Habits</h3>
                <p class="text-gray-600">Mark habits as complete (will sync when online)</p>
              </div>
            </div>
            <div class="cell small-12 medium-4">
              <div class="feature-card">
                <div class="feature-icon text-4xl mb-3">💾</div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">Offline Storage</h3>
                <p class="text-gray-600">Your data is safely stored locally</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="offline-actions">
          <div class="grid-x grid-margin-x align-center">
            <div class="cell small-12 medium-6">
              <NuxtLink to="/garden" class="button primary large expanded">
                🌿 View My Garden
              </NuxtLink>
            </div>
            <div class="cell small-12 medium-6">
              <button class="button secondary large expanded" @click="checkConnection">
                🔄 Check Connection
              </button>
            </div>
          </div>
        </div>

        <!-- Connection Status -->
        <div class="connection-status mt-8">
          <div v-if="checkingConnection" class="text-gray-600">
            <span class="mr-2">⏳</span> Checking connection...
          </div>
          <div v-else-if="isOnline" class="text-green-600">
            <span class="mr-2">✅</span> You're back online!
            <button class="button small ml-2" @click="reloadPage">
              Reload Page
            </button>
          </div>
          <div v-else class="text-gray-600">
            <span class="mr-2">📡</span> Still offline. Check your internet connection.
          </div>
        </div>

        <!-- Offline Tips -->
        <div class="offline-tips mt-8">
          <div class="callout garden-theme">
            <h3 class="text-lg font-semibold text-gray-800 mb-3">💡 Offline Tips</h3>
            <ul class="text-left text-gray-600 space-y-2">
              <li>• Your habit data is cached and available offline</li>
              <li>• Any changes you make will sync when you're back online</li>
              <li>• You can still view your garden and track progress</li>
              <li>• Push notifications will resume when connected</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Reactive data
const isOnline = ref(navigator.onLine)
const checkingConnection = ref(false)

// Methods
const checkConnection = async () => {
  checkingConnection.value = true

  try {
    // Try to fetch a small resource to test connection
    const response = await fetch('/favicon.ico', {
      method: 'HEAD',
      cache: 'no-cache'
    })

    if (response.ok) {
      isOnline.value = true
      showOnlineMessage()
    } else {
      isOnline.value = false
    }
  } catch (error) {
    isOnline.value = false
    console.log('Connection check failed:', error)
  } finally {
    checkingConnection.value = false
  }
}

const showOnlineMessage = () => {
  // Show a toast or notification that user is back online
  console.log('User is back online!')
}

const reloadPage = () => {
  window.location.reload()
}

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine

  if (isOnline.value) {
    showOnlineMessage()
  }
}

// Lifecycle
onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<style scoped>
.offline-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 2rem 0;
}

.offline-icon {
  color: #22c55e;
  filter: grayscale(0.3);
}

.offline-features {
  margin-bottom: 3rem;
}

.feature-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: 100%;
  transition: transform 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  color: #22c55e;
}

.offline-actions {
  margin-bottom: 2rem;
}

.connection-status {
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.offline-tips {
  max-width: 600px;
  margin: 0 auto;
}

/* Foundation overrides */
.callout.garden-theme {
  border-left: 4px solid #22c55e;
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

.button.small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}
</style>
