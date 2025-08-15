<template>
  <div class="wearable-page">
    <div class="page-header">
      <h1>{{ $t('wearable.page.title') }}</h1>
      <p>{{ $t('wearable.page.description') }}</p>
    </div>

    <!-- Navigation Tabs -->
    <div class="nav-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="nav-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <i :class="tab.icon"></i>
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Devices Tab -->
      <div v-if="activeTab === 'devices'" class="tab-pane">
        <WearableDevices />
      </div>

      <!-- Health Data Tab -->
      <div v-if="activeTab === 'health-data'" class="tab-pane">
        <HealthData />
      </div>

      <!-- Integrations Tab -->
      <div v-if="activeTab === 'integrations'" class="tab-pane">
        <div class="integrations-placeholder">
          <div class="placeholder-icon">
            <i class="fas fa-plug"></i>
          </div>
          <h3>{{ $t('wearable.integrations.comingSoon') }}</h3>
          <p>{{ $t('wearable.integrations.comingSoonDescription') }}</p>
        </div>
      </div>

      <!-- Analytics Tab -->
      <div v-if="activeTab === 'analytics'" class="tab-pane">
        <div class="analytics-placeholder">
          <div class="placeholder-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <h3>{{ $t('wearable.analytics.comingSoon') }}</h3>
          <p>{{ $t('wearable.analytics.comingSoonDescription') }}</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button
        class="btn btn-primary"
        @click="showQuickConnectModal = true"
        :disabled="loading"
      >
        <i class="fas fa-plus"></i>
        {{ $t('wearable.quickActions.connectDevice') }}
      </button>

      <button
        class="btn btn-outline-primary"
        @click="refreshAllData"
        :disabled="loading"
      >
        <i class="fas fa-sync-alt"></i>
        {{ $t('wearable.quickActions.refreshData') }}
      </button>

      <button
        class="btn btn-outline-secondary"
        @click="exportHealthData"
        :disabled="loading"
      >
        <i class="fas fa-download"></i>
        {{ $t('wearable.quickActions.exportData') }}
      </button>
    </div>

    <!-- Quick Connect Modal -->
    <div v-if="showQuickConnectModal" class="modal-overlay" @click="showQuickConnectModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('wearable.quickConnect.title') }}</h3>
          <button class="btn-close" @click="showQuickConnectModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="provider-grid">
            <div
              v-for="provider in availableProviders"
              :key="provider.id"
              class="provider-card"
              @click="selectProvider(provider)"
            >
              <div class="provider-icon">
                <i :class="provider.icon"></i>
              </div>
              <h4>{{ provider.name }}</h4>
              <p>{{ provider.description }}</p>
              <div class="provider-features">
                <span
                  v-for="feature in provider.features"
                  :key="feature"
                  class="feature-tag"
                >
                  {{ feature }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showQuickConnectModal = false">
            {{ $t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { useHead } from '#app'
import WearableDevices from '~/components/WearableDevices.vue'
import HealthData from '~/components/HealthData.vue'

const { t } = useI18n()
const toast = useToast()

// Set page meta
useHead({
  title: t('wearable.page.title'),
  meta: [
    { name: 'description', content: t('wearable.page.description') }
  ]
})

// Reactive state
const activeTab = ref('devices')
const loading = ref(false)
const showQuickConnectModal = ref(false)

// Tab configuration
const tabs = [
  {
    id: 'devices',
    label: t('wearable.tabs.devices'),
    icon: 'fas fa-watch'
  },
  {
    id: 'health-data',
    label: t('wearable.tabs.healthData'),
    icon: 'fas fa-chart-line'
  },
  {
    id: 'integrations',
    label: t('wearable.tabs.integrations'),
    icon: 'fas fa-plug'
  },
  {
    id: 'analytics',
    label: t('wearable.tabs.analytics'),
    icon: 'fas fa-chart-bar'
  }
]

// Available providers for quick connect
const availableProviders = [
  {
    id: 'fitbit',
    name: 'Fitbit',
    description: t('wearable.providers.fitbit.description'),
    icon: 'fab fa-fitbit',
    features: ['steps', 'heart_rate', 'sleep', 'calories']
  },
  {
    id: 'apple_health',
    name: 'Apple Health',
    description: t('wearable.providers.apple_health.description'),
    icon: 'fas fa-heartbeat',
    features: ['steps', 'heart_rate', 'sleep', 'weight']
  },
  {
    id: 'google_fit',
    name: 'Google Fit',
    description: t('wearable.providers.google_fit.description'),
    icon: 'fab fa-google',
    features: ['steps', 'heart_rate', 'sleep', 'calories']
  },
  {
    id: 'garmin',
    name: 'Garmin',
    description: t('wearable.providers.garmin.description'),
    icon: 'fas fa-running',
    features: ['steps', 'heart_rate', 'sleep', 'distance']
  },
  {
    id: 'oura',
    name: 'Oura Ring',
    description: t('wearable.providers.oura.description'),
    icon: 'fas fa-ring',
    features: ['sleep', 'heart_rate', 'temperature', 'activity']
  }
]

// Methods
const selectProvider = (provider) => {
  // Navigate to devices tab and show connect modal
  activeTab.value = 'devices'
  showQuickConnectModal.value = false

  // TODO: Trigger connect modal for selected provider
  toast.info(t('wearable.messages.selectProvider', { provider: provider.name }))
}

const refreshAllData = async () => {
  try {
    loading.value = true

    // Refresh data from all sources
    // This would typically involve calling refresh endpoints for all integrations

    toast.success(t('wearable.messages.dataRefreshed'))
  } catch (error) {
    console.error('Error refreshing data:', error)
    toast.error(t('wearable.errors.refreshFailed'))
  } finally {
    loading.value = false
  }
}

const exportHealthData = async () => {
  try {
    loading.value = true

    // Export health data to CSV/JSON
    // This would typically involve calling an export endpoint

    toast.success(t('wearable.messages.dataExported'))
  } catch (error) {
    console.error('Error exporting data:', error)
    toast.error(t('wearable.errors.exportFailed'))
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Initialize any necessary data
})
</script>

<style scoped>
.wearable-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.page-header p {
  font-size: 1.1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.nav-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e9ecef;
}

.nav-tab {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  margin: 0 0.25rem;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  color: #666;
  font-weight: 500;
}

.nav-tab:hover {
  color: #007bff;
  background: #f8f9fa;
}

.nav-tab.active {
  color: #007bff;
  border-bottom-color: #007bff;
  background: #f8f9fa;
}

.nav-tab i {
  margin-right: 0.5rem;
}

.tab-content {
  min-height: 400px;
}

.tab-pane {
  animation: fadeIn 0.3s ease;
}

.integrations-placeholder,
.analytics-placeholder {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #ddd;
}

.placeholder-icon i {
  opacity: 0.5;
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.provider-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.provider-card {
  padding: 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.provider-card:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
}

.provider-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #007bff;
}

.provider-card h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.provider-card p {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
}

.provider-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.feature-tag {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  border-top: 1px solid #ddd;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
}

.btn-close:hover {
  color: #333;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .nav-tabs {
    flex-wrap: wrap;
  }

  .nav-tab {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .quick-actions {
    flex-direction: column;
    align-items: center;
  }

  .provider-grid {
    grid-template-columns: 1fr;
  }
}
</style>
