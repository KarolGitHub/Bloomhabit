<template>
  <div class="wearable-devices">
    <div class="header">
      <h2>{{ $t('wearable.devices.title') }}</h2>
      <button
        class="btn btn-primary"
        @click="showConnectModal = true"
        :disabled="loading"
      >
        <i class="fas fa-plus"></i>
        {{ $t('wearable.devices.connectNew') }}
      </button>
    </div>

    <!-- Device Summary Cards -->
    <div class="summary-cards" v-if="deviceSummary">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">{{ $t('wearable.devices.totalDevices') }}</h5>
          <p class="card-text">{{ deviceSummary.totalDevices }}</p>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">{{ $t('wearable.devices.connectedDevices') }}</h5>
          <p class="card-text">{{ deviceSummary.connectedDevices }}</p>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">{{ $t('wearable.devices.totalDataPoints') }}</h5>
          <p class="card-text">{{ deviceSummary.totalDataPoints }}</p>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">{{ $t('wearable.devices.lastSync') }}</h5>
          <p class="card-text">{{ formatDate(deviceSummary.lastSync) }}</p>
        </div>
      </div>
    </div>

    <!-- Devices List -->
    <div class="devices-list" v-if="devices.length > 0">
      <div
        v-for="device in devices"
        :key="device.id"
        class="device-card"
        :class="{
          'connected': device.status === 'connected',
          'disconnected': device.status === 'disconnected',
          'error': device.status === 'error',
          'pending': device.status === 'pending'
        }"
      >
        <div class="device-info">
          <div class="device-icon">
            <i :class="getDeviceIcon(device.type)"></i>
          </div>
          <div class="device-details">
            <h4>{{ device.name }}</h4>
            <p class="device-provider">{{ getProviderName(device.provider) }}</p>
            <p class="device-type">{{ getDeviceTypeName(device.type) }}</p>
            <p class="device-status">
              <span class="status-badge" :class="device.status">
                {{ $t(`wearable.devices.status.${device.status}`) }}
              </span>
            </p>
          </div>
        </div>

        <div class="device-actions">
          <button
            class="btn btn-sm btn-outline-primary"
            @click="viewDeviceStats(device.id)"
            :disabled="loading"
          >
            <i class="fas fa-chart-bar"></i>
            {{ $t('wearable.devices.viewStats') }}
          </button>

          <button
            class="btn btn-sm btn-outline-secondary"
            @click="editDevice(device)"
            :disabled="loading"
          >
            <i class="fas fa-edit"></i>
            {{ $t('wearable.devices.edit') }}
          </button>

          <button
            class="btn btn-sm btn-outline-danger"
            @click="removeDevice(device.id)"
            :disabled="loading"
          >
            <i class="fas fa-trash"></i>
            {{ $t('wearable.devices.remove') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-watch"></i>
      </div>
      <h3>{{ $t('wearable.devices.noDevices') }}</h3>
      <p>{{ $t('wearable.devices.noDevicesDescription') }}</p>
      <button
        class="btn btn-primary"
        @click="showConnectModal = true"
      >
        {{ $t('wearable.devices.connectFirst') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">{{ $t('common.loading') }}</span>
      </div>
      <p>{{ $t('wearable.devices.loading') }}</p>
    </div>

    <!-- Connect Device Modal -->
    <div v-if="showConnectModal" class="modal-overlay" @click="showConnectModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('wearable.devices.connectModal.title') }}</h3>
          <button class="btn-close" @click="showConnectModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="connectDevice">
            <div class="form-group">
              <label>{{ $t('wearable.devices.provider') }}</label>
              <select v-model="newDevice.provider" class="form-control" required>
                <option value="">{{ $t('wearable.devices.selectProvider') }}</option>
                <option value="fitbit">Fitbit</option>
                <option value="apple_health">Apple Health</option>
                <option value="google_fit">Google Fit</option>
                <option value="garmin">Garmin</option>
                <option value="oura">Oura Ring</option>
                <option value="samsung_health">Samsung Health</option>
                <option value="withings">Withings</option>
                <option value="peloton">Peloton</option>
                <option value="strava">Strava</option>
              </select>
            </div>

            <div class="form-group">
              <label>{{ $t('wearable.devices.type') }}</label>
              <select v-model="newDevice.type" class="form-control" required>
                <option value="">{{ $t('wearable.devices.selectType') }}</option>
                <option value="fitness_tracker">{{ $t('wearable.devices.types.fitness_tracker') }}</option>
                <option value="smartwatch">{{ $t('wearable.devices.types.smartwatch') }}</option>
                <option value="heart_rate_monitor">{{ $t('wearable.devices.types.heart_rate_monitor') }}</option>
                <option value="sleep_tracker">{{ $t('wearable.devices.types.sleep_tracker') }}</option>
                <option value="activity_tracker">{{ $t('wearable.devices.types.activity_tracker') }}</option>
                <option value="weight_scale">{{ $t('wearable.devices.types.weight_scale') }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>{{ $t('wearable.devices.name') }}</label>
              <input
                v-model="newDevice.name"
                type="text"
                class="form-control"
                :placeholder="$t('wearable.devices.namePlaceholder')"
                required
              />
            </div>

            <div class="form-group">
              <label>{{ $t('wearable.devices.model') }}</label>
              <input
                v-model="newDevice.model"
                type="text"
                class="form-control"
                :placeholder="$t('wearable.devices.modelPlaceholder')"
              />
            </div>

            <div class="form-group">
              <label>{{ $t('wearable.devices.capabilities') }}</label>
              <div class="capabilities-grid">
                <label class="checkbox-label" v-for="capability in availableCapabilities" :key="capability.value">
                  <input
                    type="checkbox"
                    v-model="newDevice.capabilities"
                    :value="capability.value"
                  />
                  <span>{{ capability.label }}</span>
                </label>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showConnectModal = false">
            {{ $t('common.cancel') }}
          </button>
          <button
            class="btn btn-primary"
            @click="connectDevice"
            :disabled="connecting"
          >
            <span v-if="connecting">
              <i class="fas fa-spinner fa-spin"></i>
              {{ $t('wearable.devices.connecting') }}
            </span>
            <span v-else>
              {{ $t('wearable.devices.connect') }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Device Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('wearable.devices.editModal.title') }}</h3>
          <button class="btn-close" @click="showEditModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="updateDevice">
            <div class="form-group">
              <label>{{ $t('wearable.devices.name') }}</label>
              <input
                v-model="editingDevice.name"
                type="text"
                class="form-control"
                required
              />
            </div>

            <div class="form-group">
              <label>{{ $t('wearable.devices.model') }}</label>
              <input
                v-model="editingDevice.model"
                type="text"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>{{ $t('wearable.devices.status') }}</label>
              <select v-model="editingDevice.status" class="form-control">
                <option value="connected">{{ $t('wearable.devices.status.connected') }}</option>
                <option value="disconnected">{{ $t('wearable.devices.status.disconnected') }}</option>
                <option value="pending">{{ $t('wearable.devices.status.pending') }}</option>
                <option value="error">{{ $t('wearable.devices.status.error') }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>{{ $t('wearable.devices.capabilities') }}</label>
              <div class="capabilities-grid">
                <label class="checkbox-label" v-for="capability in availableCapabilities" :key="capability.value">
                  <input
                    type="checkbox"
                    v-model="editingDevice.capabilities"
                    :value="capability.value"
                  />
                  <span>{{ capability.label }}</span>
                </label>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showEditModal = false">
            {{ $t('common.cancel') }}
          </button>
          <button
            class="btn btn-primary"
            @click="updateDevice"
            :disabled="updating"
          >
            <span v-if="updating">
              <i class="fas fa-spinner fa-spin"></i>
              {{ $t('common.updating') }}
            </span>
            <span v-else>
              {{ $t('common.update') }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'

const { t } = useI18n()
const toast = useToast()

// Reactive state
const loading = ref(false)
const connecting = ref(false)
const updating = ref(false)
const devices = ref([])
const deviceSummary = ref(null)
const showConnectModal = ref(false)
const showEditModal = ref(false)
const editingDevice = ref(null)

const newDevice = ref({
  provider: '',
  type: '',
  name: '',
  model: '',
  capabilities: []
})

const availableCapabilities = computed(() => [
  { value: 'steps', label: t('wearable.devices.capabilities.steps') },
  { value: 'heart_rate', label: t('wearable.devices.capabilities.heart_rate') },
  { value: 'sleep', label: t('wearable.devices.capabilities.sleep') },
  { value: 'calories', label: t('wearable.devices.capabilities.calories') },
  { value: 'distance', label: t('wearable.devices.capabilities.distance') },
  { value: 'weight', label: t('wearable.devices.capabilities.weight') },
  { value: 'blood_pressure', label: t('wearable.devices.capabilities.blood_pressure') },
  { value: 'glucose', label: t('wearable.devices.capabilities.glucose') },
  { value: 'oxygen_saturation', label: t('wearable.devices.capabilities.oxygen_saturation') },
  { value: 'temperature', label: t('wearable.devices.capabilities.temperature') }
])

// Methods
const fetchDevices = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/wearable/devices')
    devices.value = response
  } catch (error) {
    console.error('Error fetching devices:', error)
    toast.error(t('wearable.devices.errors.fetchFailed'))
  } finally {
    loading.value = false
  }
}

const fetchDeviceSummary = async () => {
  try {
    const response = await $fetch('/api/wearable/devices/summary/health')
    deviceSummary.value = response
  } catch (error) {
    console.error('Error fetching device summary:', error)
  }
}

const connectDevice = async () => {
  try {
    connecting.value = true

    const deviceData = {
      ...newDevice.value,
      syncSettings: {
        steps: newDevice.value.capabilities.includes('steps'),
        heartRate: newDevice.value.capabilities.includes('heart_rate'),
        sleep: newDevice.value.capabilities.includes('sleep'),
        calories: newDevice.value.capabilities.includes('calories'),
        distance: newDevice.value.capabilities.includes('distance'),
        weight: newDevice.value.capabilities.includes('weight'),
        bloodPressure: newDevice.value.capabilities.includes('blood_pressure'),
        glucose: newDevice.value.capabilities.includes('glucose'),
        oxygenSaturation: newDevice.value.capabilities.includes('oxygen_saturation'),
        temperature: newDevice.value.capabilities.includes('temperature'),
        customMetrics: []
      }
    }

    await $fetch('/api/wearable/devices', {
      method: 'POST',
      body: deviceData
    })

    toast.success(t('wearable.devices.messages.connected'))
    showConnectModal.value = false
    resetNewDevice()
    await fetchDevices()
    await fetchDeviceSummary()
  } catch (error) {
    console.error('Error connecting device:', error)
    toast.error(t('wearable.devices.errors.connectFailed'))
  } finally {
    connecting.value = false
  }
}

const editDevice = (device) => {
  editingDevice.value = { ...device }
  showEditModal.value = true
}

const updateDevice = async () => {
  try {
    updating.value = true

    await $fetch(`/api/wearable/devices/${editingDevice.value.id}`, {
      method: 'PATCH',
      body: editingDevice.value
    })

    toast.success(t('wearable.devices.messages.updated'))
    showEditModal.value = false
    editingDevice.value = null
    await fetchDevices()
    await fetchDeviceSummary()
  } catch (error) {
    console.error('Error updating device:', error)
    toast.error(t('wearable.devices.errors.updateFailed'))
  } finally {
    updating.value = false
  }
}

const removeDevice = async (deviceId) => {
  if (!confirm(t('wearable.devices.confirmRemove'))) return

  try {
    await $fetch(`/api/wearable/devices/${deviceId}`, {
      method: 'DELETE'
    })

    toast.success(t('wearable.devices.messages.removed'))
    await fetchDevices()
    await fetchDeviceSummary()
  } catch (error) {
    console.error('Error removing device:', error)
    toast.error(t('wearable.devices.errors.removeFailed'))
  }
}

const viewDeviceStats = async (deviceId) => {
  try {
    const stats = await $fetch(`/api/wearable/devices/${deviceId}/stats`)
    // TODO: Show stats in a modal or navigate to stats page
    console.log('Device stats:', stats)
  } catch (error) {
    console.error('Error fetching device stats:', error)
    toast.error(t('wearable.devices.errors.statsFailed'))
  }
}

const resetNewDevice = () => {
  newDevice.value = {
    provider: '',
    type: '',
    name: '',
    model: '',
    capabilities: []
  }
}

const getProviderName = (provider) => {
  const providerNames = {
    fitbit: 'Fitbit',
    apple_health: 'Apple Health',
    google_fit: 'Google Fit',
    garmin: 'Garmin',
    oura: 'Oura Ring',
    samsung_health: 'Samsung Health',
    withings: 'Withings',
    peloton: 'Peloton',
    strava: 'Strava'
  }
  return providerNames[provider] || provider
}

const getDeviceTypeName = (type) => {
  const typeNames = {
    fitness_tracker: t('wearable.devices.types.fitness_tracker'),
    smartwatch: t('wearable.devices.types.smartwatch'),
    heart_rate_monitor: t('wearable.devices.types.heart_rate_monitor'),
    sleep_tracker: t('wearable.devices.types.sleep_tracker'),
    activity_tracker: t('wearable.devices.types.activity_tracker'),
    weight_scale: t('wearable.devices.types.weight_scale'),
    blood_pressure_monitor: t('wearable.devices.types.blood_pressure_monitor'),
    glucose_monitor: t('wearable.devices.types.glucose_monitor'),
    oxygen_saturation_monitor: t('wearable.devices.types.oxygen_saturation_monitor'),
    temperature_monitor: t('wearable.devices.types.temperature_monitor')
  }
  return typeNames[type] || type
}

const getDeviceIcon = (type) => {
  const icons = {
    fitness_tracker: 'fas fa-running',
    smartwatch: 'fas fa-watch',
    heart_rate_monitor: 'fas fa-heartbeat',
    sleep_tracker: 'fas fa-bed',
    activity_tracker: 'fas fa-walking',
    weight_scale: 'fas fa-weight',
    blood_pressure_monitor: 'fas fa-stethoscope',
    glucose_monitor: 'fas fa-tint',
    oxygen_saturation_monitor: 'fas fa-lungs',
    temperature_monitor: 'fas fa-thermometer-half'
  }
  return icons[type] || 'fas fa-watch'
}

const formatDate = (dateString) => {
  if (!dateString) return t('common.never')
  return new Date(dateString).toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  fetchDevices()
  fetchDeviceSummary()
})
</script>

<style scoped>
.wearable-devices {
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.card {
  text-align: center;
  padding: 1rem;
}

.card-title {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.card-text {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.devices-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.device-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  transition: all 0.3s ease;
}

.device-card.connected {
  border-color: #28a745;
  background: #f8fff9;
}

.device-card.disconnected {
  border-color: #ffc107;
  background: #fffdf8;
}

.device-card.error {
  border-color: #dc3545;
  background: #fff8f8;
}

.device-card.pending {
  border-color: #17a2b8;
  background: #f8fdff;
}

.device-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.device-icon {
  font-size: 2rem;
  color: #666;
  width: 60px;
  text-align: center;
}

.device-details h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.device-provider,
.device-type {
  margin: 0 0 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.connected {
  background: #d4edda;
  color: #155724;
}

.status-badge.disconnected {
  background: #fff3cd;
  color: #856404;
}

.status-badge.error {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.pending {
  background: #d1ecf1;
  color: #0c5460;
}

.device-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #ddd;
}

.loading-state {
  text-align: center;
  padding: 3rem;
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
  max-width: 500px;
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
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #ddd;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.capabilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
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

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .device-card {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .device-actions {
    justify-content: center;
  }

  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
