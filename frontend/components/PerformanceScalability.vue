<template>
  <div class="performance-scalability">
    <!-- Header -->
    <div class="header">
      <h1>{{ $t('performanceScalability.title') }}</h1>
      <p>{{ $t('performanceScalability.description') }}</p>
    </div>

    <!-- Overview Cards -->
    <div class="overview-grid">
      <div class="overview-card">
        <div class="card-icon">📊</div>
        <h3>{{ $t('performanceScalability.overview.metrics.title') }}</h3>
        <p>{{ $t('performanceScalability.overview.metrics.description') }}</p>
        <div class="metric-value">{{ systemMetrics.memory?.used || 0 }} MB</div>
      </div>

      <div class="overview-card">
        <div class="card-icon">💾</div>
        <h3>{{ $t('performanceScalability.overview.cache.title') }}</h3>
        <p>{{ $t('performanceScalability.overview.cache.description') }}</p>
        <div class="metric-value">{{ cacheStats.keys || 0 }} keys</div>
      </div>

      <div class="overview-card">
        <div class="card-icon">⚡</div>
        <h3>{{ $t('performanceScalability.overview.queues.title') }}</h3>
        <p>{{ $t('performanceScalability.overview.queues.description') }}</p>
        <div class="metric-value">{{ queueStats.total || 0 }} jobs</div>
      </div>

      <div class="overview-card">
        <div class="card-icon">🏥</div>
        <h3>{{ $t('performanceScalability.overview.health.title') }}</h3>
        <p>{{ $t('performanceScalability.overview.health.description') }}</p>
        <div class="metric-value" :class="healthStatusClass">{{ healthStatus }}</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Monitoring Tab -->
        <div v-if="activeTab === 'monitoring'" class="tab-panel">
          <div class="section">
            <h3>{{ $t('performanceScalability.monitoring.systemMetrics') }}</h3>
            <div class="metrics-grid">
              <div class="metric-item">
                <span class="metric-label">{{ $t('performanceScalability.monitoring.memory') }}</span>
                <span class="metric-value">{{ systemMetrics.memory?.used || 0 }} / {{ systemMetrics.memory?.total || 0 }} MB</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">{{ $t('performanceScalability.monitoring.cpu') }}</span>
                <span class="metric-value">{{ systemMetrics.cpu?.usage || 0 }}%</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">{{ $t('performanceScalability.monitoring.uptime') }}</span>
                <span class="metric-value">{{ formatUptime(systemMetrics.uptime) }}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>{{ $t('performanceScalability.monitoring.healthCheck') }}</h3>
            <div class="health-grid">
              <div
                v-for="(check, key) in healthChecks"
                :key="key"
                class="health-item"
                :class="check.status"
              >
                <span class="health-name">{{ key }}</span>
                <span class="health-status">{{ check.status }}</span>
                <span class="health-time">{{ check.responseTime }}ms</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Caching Tab -->
        <div v-if="activeTab === 'caching'" class="tab-panel">
          <div class="section">
            <h3>{{ $t('performanceScalability.caching.operations') }}</h3>
            <div class="action-buttons">
              <button @click="refreshCache" class="btn btn-primary">
                {{ $t('performanceScalability.caching.refresh') }}
              </button>
              <button @click="resetCache" class="btn btn-secondary">
                {{ $t('performanceScalability.caching.reset') }}
              </button>
            </div>
          </div>

          <div class="section">
            <h3>{{ $t('performanceScalability.caching.statistics') }}</h3>
            <div class="cache-stats">
              <div class="stat-item">
                <span class="stat-label">{{ $t('performanceScalability.caching.totalKeys') }}</span>
                <span class="stat-value">{{ cacheStats.keys || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ $t('performanceScalability.caching.memoryUsage') }}</span>
                <span class="stat-value">{{ cacheStats.memory || 0 }} MB</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Queues Tab -->
        <div v-if="activeTab === 'queues'" class="tab-panel">
          <div class="section">
            <h3>{{ $t('performanceScalability.queues.overview') }}</h3>
            <div class="queue-stats">
              <div
                v-for="queue in queueStats"
                :key="queue.name"
                class="queue-item"
              >
                <div class="queue-header">
                  <h4>{{ queue.name }}</h4>
                  <div class="queue-actions">
                    <button @click="pauseQueue(queue.name)" class="btn btn-small">Pause</button>
                    <button @click="resumeQueue(queue.name)" class="btn btn-small">Resume</button>
                  </div>
                </div>
                <div class="queue-metrics">
                  <span class="metric">Waiting: {{ queue.waiting }}</span>
                  <span class="metric">Active: {{ queue.active }}</span>
                  <span class="metric">Completed: {{ queue.completed }}</span>
                  <span class="metric">Failed: {{ queue.failed }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="actions">
      <button @click="refreshAll" class="btn btn-primary">
        {{ $t('performanceScalability.actions.refreshAll') }}
      </button>
      <button @click="runHealthCheck" class="btn btn-secondary">
        {{ $t('performanceScalability.actions.runHealthCheck') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Reactive data
const activeTab = ref('monitoring')
const systemMetrics = ref<any>({})
const healthChecks = ref<any>({})
const cacheStats = ref<any>({})
const queueStats = ref<any[]>([])
const loading = ref(false)

// Tabs configuration
const tabs = [
  { id: 'monitoring', label: t('performanceScalability.tabs.monitoring') },
  { id: 'caching', label: t('performanceScalability.tabs.caching') },
  { id: 'queues', label: t('performanceScalability.tabs.queues') },
]

// Computed properties
const healthStatus = computed(() => {
  if (!healthChecks.value || Object.keys(healthChecks.value).length === 0) return 'Unknown'

  const downCount = Object.values(healthChecks.value).filter((check: any) => check.status === 'down').length
  const totalCount = Object.keys(healthChecks.value).length

  if (downCount === 0) return 'Healthy'
  if (downCount === totalCount) return 'Unhealthy'
  return 'Degraded'
})

const healthStatusClass = computed(() => {
  const status = healthStatus.value
  if (status === 'Healthy') return 'status-healthy'
  if (status === 'Degraded') return 'status-degraded'
  return 'status-unhealthy'
})

// Methods
const fetchSystemMetrics = async () => {
  try {
    const response = await fetch('/api/performance/metrics', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (response.ok) {
      systemMetrics.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to fetch system metrics:', error)
  }
}

const fetchHealthCheck = async () => {
  try {
    const response = await fetch('/api/performance/health', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (response.ok) {
      healthChecks.value = (await response.json()).checks
    }
  } catch (error) {
    console.error('Failed to fetch health check:', error)
  }
}

const fetchCacheStats = async () => {
  try {
    const response = await fetch('/api/performance/cache/stats', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (response.ok) {
      cacheStats.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to fetch cache stats:', error)
  }
}

const fetchQueueStats = async () => {
  try {
    const response = await fetch('/api/performance/queues/stats', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (response.ok) {
      queueStats.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to fetch queue stats:', error)
  }
}

const refreshCache = async () => {
  try {
    await fetch('/api/performance/cache/keys?pattern=*', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    await fetchCacheStats()
  } catch (error) {
    console.error('Failed to refresh cache:', error)
  }
}

const resetCache = async () => {
  try {
    await fetch('/api/performance/cache/reset', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    await fetchCacheStats()
  } catch (error) {
    console.error('Failed to reset cache:', error)
  }
}

const pauseQueue = async (queueName: string) => {
  try {
    await fetch(`/api/performance/queues/${queueName}/pause`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    await fetchQueueStats()
  } catch (error) {
    console.error('Failed to pause queue:', error)
  }
}

const resumeQueue = async (queueName: string) => {
  try {
    await fetch(`/api/performance/queues/${queueName}/resume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    await fetchQueueStats()
  } catch (error) {
    console.error('Failed to resume queue:', error)
  }
}

const refreshAll = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchSystemMetrics(),
      fetchHealthCheck(),
      fetchCacheStats(),
      fetchQueueStats(),
    ])
  } finally {
    loading.value = false
  }
}

const runHealthCheck = async () => {
  await fetchHealthCheck()
}

const formatUptime = (seconds: number) => {
  if (!seconds) return '0s'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
  if (minutes > 0) return `${minutes}m ${secs}s`
  return `${secs}s`
}

// Lifecycle
onMounted(() => {
  refreshAll()
})
</script>

<style scoped lang="scss">
.performance-scalability {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;

  h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    color: #7f8c8d;
    max-width: 600px;
    margin: 0 auto;
  }
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.overview-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  .card-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  p {
    color: #7f8c8d;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .metric-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #27ae60;
  }
}

.tabs-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #ecf0f1;

  .tab-button {
    flex: 1;
    padding: 1rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;
    color: #7f8c8d;
    transition: all 0.2s;

    &.active {
      color: #27ae60;
      border-bottom: 2px solid #27ae60;
    }

    &:hover {
      background: #f8f9fa;
    }
  }
}

.tab-content {
  padding: 2rem;
}

.section {
  margin-bottom: 2rem;

  h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
    border-bottom: 1px solid #ecf0f1;
    padding-bottom: 0.5rem;
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;

  .metric-label {
    color: #7f8c8d;
  }

  .metric-value {
    font-weight: bold;
    color: #2c3e50;
  }
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.health-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid;

  &.up {
    background: #d4edda;
    border-left-color: #28a745;
  }

  &.down {
    background: #f8d7da;
    border-left-color: #dc3545;
  }

  .health-name {
    font-weight: bold;
    text-transform: capitalize;
  }

  .health-status {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    text-transform: uppercase;

    .up & {
      background: #28a745;
      color: white;
    }

    .down & {
      background: #dc3545;
      color: white;
    }
  }

  .health-time {
    color: #6c757d;
    font-size: 0.9rem;
  }
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;

  &.btn-primary {
    background: #27ae60;
    color: white;

    &:hover {
      background: #229954;
    }
  }

  &.btn-secondary {
    background: #95a5a6;
    color: white;

    &:hover {
      background: #7f8c8d;
    }
  }

  &.btn-small {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

.cache-stats, .queue-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;

  .stat-label {
    color: #7f8c8d;
  }

  .stat-value {
    font-weight: bold;
    color: #2c3e50;
  }
}

.queue-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;

  .queue-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    h4 {
      margin: 0;
      color: #2c3e50;
      text-transform: capitalize;
    }

    .queue-actions {
      display: flex;
      gap: 0.5rem;
    }
  }

  .queue-metrics {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;

    .metric {
      background: white;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      font-size: 0.9rem;
      color: #7f8c8d;
    }
  }
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.status-healthy {
  color: #28a745;
}

.status-degraded {
  color: #ffc107;
}

.status-unhealthy {
  color: #dc3545;
}
</style>
