<template>
  <div class="integration-ecosystem">
    <!-- Header -->
    <div class="header">
      <h1>{{ $t('integrationEcosystem.title') }}</h1>
      <p>{{ $t('integrationEcosystem.description') }}</p>
    </div>

    <!-- Overview Cards -->
    <div class="overview-cards">
      <div class="card overview-card">
        <div class="card-icon">📊</div>
        <div class="card-content">
          <h3>{{ $t('integrationEcosystem.overview.totalIntegrations') }}</h3>
          <p class="card-number">{{ overview.totalIntegrations }}</p>
        </div>
      </div>

      <div class="card overview-card">
        <div class="card-icon">✅</div>
        <div class="card-content">
          <h3>{{ $t('integrationEcosystem.overview.activeIntegrations') }}</h3>
          <p class="card-number">{{ overview.activeIntegrations }}</p>
        </div>
      </div>

      <div class="card overview-card">
        <div class="card-icon">🔄</div>
        <div class="card-content">
          <h3>{{ $t('integrationEcosystem.overview.lastSync') }}</h3>
          <p class="card-text">{{ formatLastSync(overview.lastSync) }}</p>
        </div>
      </div>
    </div>

    <!-- Integration Tabs -->
    <div class="tabs-container">
      <div class="tabs-header">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          {{ tab.label }}
          <span class="tab-count" v-if="tab.count > 0">({{ tab.count }})</span>
        </button>
      </div>

      <!-- Calendar Integrations Tab -->
      <div v-if="activeTab === 'calendar'" class="tab-content">
        <div class="tab-header">
          <h2>{{ $t('integrationEcosystem.calendar.title') }}</h2>
          <button class="btn btn-primary" @click="showCalendarModal = true">
            {{ $t('integrationEcosystem.calendar.addIntegration') }}
          </button>
        </div>

        <div class="integrations-list">
          <div v-for="integration in calendarIntegrations" :key="integration.id" class="integration-card">
            <div class="integration-header">
              <div class="integration-info">
                <h3>{{ integration.calendarName }}</h3>
                <p>{{ integration.provider }}</p>
              </div>
              <div class="integration-status">
                <span :class="['status-badge', integration.syncStatus]">
                  {{ integration.syncStatus }}
                </span>
              </div>
            </div>
            <div class="integration-actions">
              <button class="btn btn-secondary" @click="syncCalendar(integration.id)">
                {{ $t('integrationEcosystem.calendar.sync') }}
              </button>
              <button class="btn btn-outline" @click="editCalendar(integration)">
                {{ $t('common.edit') }}
              </button>
              <button class="btn btn-danger" @click="deleteCalendar(integration.id)">
                {{ $t('common.delete') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Integrations Tab -->
      <div v-if="activeTab === 'tasks'" class="tab-content">
        <div class="tab-header">
          <h2>{{ $t('integrationEcosystem.tasks.title') }}</h2>
          <button class="btn btn-primary" @click="showTaskModal = true">
            {{ $t('integrationEcosystem.tasks.addIntegration') }}
          </button>
        </div>

        <div class="integrations-list">
          <div v-for="integration in taskIntegrations" :key="integration.id" class="integration-card">
            <div class="integration-header">
              <div class="integration-info">
                <h3>{{ integration.projectName }}</h3>
                <p>{{ integration.provider }}</p>
              </div>
              <div class="integration-status">
                <span :class="['status-badge', integration.syncStatus]">
                  {{ integration.syncStatus }}
                </span>
              </div>
            </div>
            <div class="integration-actions">
              <button class="btn btn-secondary" @click="syncTasks(integration.id)">
                {{ $t('integrationEcosystem.tasks.sync') }}
              </button>
              <button class="btn btn-outline" @click="editTask(integration)">
                {{ $t('common.edit') }}
              </button>
              <button class="btn btn-danger" @click="deleteTask(integration.id)">
                {{ $t('common.delete') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Smart Home Integrations Tab -->
      <div v-if="activeTab === 'smartHome'" class="tab-content">
        <div class="tab-header">
          <h2>{{ $t('integrationEcosystem.smartHome.title') }}</h2>
          <button class="btn btn-primary" @click="showSmartHomeModal = true">
            {{ $t('integrationEcosystem.smartHome.addIntegration') }}
          </button>
        </div>

        <div class="integrations-list">
          <div v-for="integration in smartHomeIntegrations" :key="integration.id" class="integration-card">
            <div class="integration-header">
              <div class="integration-info">
                <h3>{{ integration.accountName }}</h3>
                <p>{{ integration.provider }}</p>
              </div>
              <div class="integration-status">
                <span class="status-badge active">{{ $t('integrationEcosystem.smartHome.active') }}</span>
              </div>
            </div>
            <div class="integration-details">
              <p>{{ $t('integrationEcosystem.smartHome.devices') }}: {{ integration.devices.length }}</p>
              <p>{{ $t('integrationEcosystem.smartHome.automations') }}: {{ integration.automationRules.length }}</p>
            </div>
            <div class="integration-actions">
              <button class="btn btn-secondary" @click="syncSmartHome(integration.id)">
                {{ $t('integrationEcosystem.smartHome.sync') }}
              </button>
              <button class="btn btn-outline" @click="editSmartHome(integration)">
                {{ $t('common.edit') }}
              </button>
              <button class="btn btn-danger" @click="deleteSmartHome(integration.id)">
                {{ $t('common.delete') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <CalendarIntegrationModal
      v-if="showCalendarModal"
      @close="showCalendarModal = false"
      @created="loadCalendarIntegrations"
    />

    <TaskIntegrationModal
      v-if="showTaskModal"
      @close="showTaskModal = false"
      @created="loadTaskIntegrations"
    />

    <SmartHomeIntegrationModal
      v-if="showSmartHomeModal"
      @close="showSmartHomeModal = false"
      @created="loadSmartHomeIntegrations"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CalendarIntegrationModal from './CalendarIntegrationModal.vue'
import TaskIntegrationModal from './TaskIntegrationModal.vue'
import SmartHomeIntegrationModal from './SmartHomeIntegrationModal.vue'

const { t } = useI18n()

// Reactive data
const activeTab = ref('calendar')
const showCalendarModal = ref(false)
const showTaskModal = ref(false)
const showSmartHomeModal = ref(false)

const overview = ref({
  totalIntegrations: 0,
  activeIntegrations: 0,
  lastSync: null
})

const calendarIntegrations = ref([])
const taskIntegrations = ref([])
const smartHomeIntegrations = ref([])

// Computed properties
const tabs = computed(() => [
  {
    id: 'calendar',
    label: t('integrationEcosystem.tabs.calendar'),
    icon: '📅',
    count: calendarIntegrations.value.length
  },
  {
    id: 'tasks',
    label: t('integrationEcosystem.tabs.tasks'),
    icon: '📋',
    count: taskIntegrations.value.length
  },
  {
    id: 'smartHome',
    label: t('integrationEcosystem.tabs.smartHome'),
    icon: '🏠',
    count: smartHomeIntegrations.value.length
  }
])

// Methods
const loadOverview = async () => {
  try {
    const response = await fetch('/api/integrations/overview', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.ok) {
      const data = await response.json()
      overview.value = {
        totalIntegrations: data.summary.totalIntegrations,
        activeIntegrations: data.summary.activeIntegrations,
        lastSync: data.tasks.lastSync || data.smartHome.lastSync
      }
    }
  } catch (error) {
    console.error('Failed to load overview:', error)
  }
}

const loadCalendarIntegrations = async () => {
  try {
    const response = await fetch('/api/integrations/calendar', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.ok) {
      calendarIntegrations.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load calendar integrations:', error)
  }
}

const loadTaskIntegrations = async () => {
  try {
    const response = await fetch('/api/integrations/tasks', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.ok) {
      taskIntegrations.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load task integrations:', error)
  }
}

const loadSmartHomeIntegrations = async () => {
  try {
    const response = await fetch('/api/integrations/smart-home', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.ok) {
      smartHomeIntegrations.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load smart home integrations:', error)
  }
}

const syncCalendar = async (id) => {
  try {
    await fetch(`/api/integrations/calendar/${id}/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    await loadCalendarIntegrations()
  } catch (error) {
    console.error('Failed to sync calendar:', error)
  }
}

const syncTasks = async (id) => {
  try {
    await fetch(`/api/integrations/tasks/${id}/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    await loadTaskIntegrations()
  } catch (error) {
    console.error('Failed to sync tasks:', error)
  }
}

const syncSmartHome = async (id) => {
  try {
    await fetch(`/api/integrations/smart-home/${id}/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    await loadSmartHomeIntegrations()
  } catch (error) {
    console.error('Failed to sync smart home:', error)
  }
}

const deleteCalendar = async (id) => {
  if (confirm(t('integrationEcosystem.calendar.confirmDelete'))) {
    try {
      await fetch(`/api/integrations/calendar/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      await loadCalendarIntegrations()
      await loadOverview()
    } catch (error) {
      console.error('Failed to delete calendar integration:', error)
    }
  }
}

const deleteTask = async (id) => {
  if (confirm(t('integrationEcosystem.tasks.confirmDelete'))) {
    try {
      await fetch(`/api/integrations/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      await loadTaskIntegrations()
      await loadOverview()
    } catch (error) {
      console.error('Failed to delete task integration:', error)
    }
  }
}

const deleteSmartHome = async (id) => {
  if (confirm(t('integrationEcosystem.smartHome.confirmDelete'))) {
    try {
      await fetch(`/api/integrations/smart-home/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      await loadSmartHomeIntegrations()
      await loadOverview()
    } catch (error) {
      console.error('Failed to delete smart home integration:', error)
    }
  }
}

const editCalendar = (integration) => {
  // TODO: Implement edit functionality
  console.log('Edit calendar integration:', integration)
}

const editTask = (integration) => {
  // TODO: Implement edit functionality
  console.log('Edit task integration:', integration)
}

const editSmartHome = (integration) => {
  // TODO: Implement edit functionality
  console.log('Edit smart home integration:', integration)
}

const formatLastSync = (date) => {
  if (!date) return t('integrationEcosystem.overview.never')
  return new Date(date).toLocaleDateString()
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadOverview(),
    loadCalendarIntegrations(),
    loadTaskIntegrations(),
    loadSmartHomeIntegrations()
  ])
})
</script>

<style scoped lang="scss">
.integration-ecosystem {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;

  h1 {
    font-size: 2.5rem;
    color: var(--primary-color);
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto;
  }
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.overview-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;

  .card-icon {
    font-size: 2rem;
    margin-right: 1rem;
  }

  .card-number {
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
  }

  .card-text {
    font-size: 1.1rem;
    margin: 0;
  }
}

.tabs-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  background: var(--background-secondary);
  border-bottom: 1px solid var(--border-color);
}

.tab-button {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: var(--background-hover);
  }

  &.active {
    background: white;
    border-bottom: 3px solid var(--primary-color);
    color: var(--primary-color);
  }

  .tab-icon {
    font-size: 1.2rem;
  }

  .tab-count {
    font-size: 0.9rem;
    opacity: 0.7;
  }
}

.tab-content {
  padding: 2rem;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h2 {
    margin: 0;
    color: var(--text-primary);
  }
}

.integrations-list {
  display: grid;
  gap: 1rem;
}

.integration-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  background: white;

  .integration-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;

    .integration-info {
      h3 {
        margin: 0 0 0.5rem 0;
        color: var(--text-primary);
      }

      p {
        margin: 0;
        color: var(--text-secondary);
        text-transform: capitalize;
      }
    }
  }

  .integration-details {
    margin-bottom: 1rem;

    p {
      margin: 0.25rem 0;
      color: var(--text-secondary);
    }
  }

  .integration-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;

  &.active {
    background: var(--success-color);
    color: white;
  }

  &.paused {
    background: var(--warning-color);
    color: white;
  }

  &.error {
    background: var(--danger-color);
    color: white;
  }

  &.disconnected {
    background: var(--text-secondary);
    color: white;
  }
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &.btn-primary {
    background: var(--primary-color);
    color: white;

    &:hover {
      background: var(--primary-dark);
    }
  }

  &.btn-secondary {
    background: var(--secondary-color);
    color: white;

    &:hover {
      background: var(--secondary-dark);
    }
  }

  &.btn-outline {
    background: transparent;
    color: var(--primary-color);
    border: 1px solid var(--primary-color);

    &:hover {
      background: var(--primary-color);
      color: white;
    }
  }

  &.btn-danger {
    background: var(--danger-color);
    color: white;

    &:hover {
      background: var(--danger-dark);
    }
  }
}
</style>
