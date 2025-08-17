<template>
  <div class="data-privacy-container">
    <!-- Header -->
    <div class="header">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        {{ $t('dataPrivacy.title') }}
      </h1>
      <p class="text-gray-600">
        {{ $t('dataPrivacy.description') }}
      </p>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="card bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 rounded-full">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ $t('dataPrivacy.summary.gdprStatus') }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ gdprStatus.gdprCompliant ? 'Compliant' : 'Non-Compliant' }}</p>
          </div>
        </div>
      </div>

      <div class="card bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ $t('dataPrivacy.summary.securityEvents') }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ securityDashboard.openEvents || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="p-3 bg-yellow-100 rounded-full">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ $t('dataPrivacy.summary.dataRequests') }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ dataRequestStats.total || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center">
          <div class="p-3 bg-purple-100 rounded-full">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ $t('dataPrivacy.summary.auditLogs') }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ auditLogSummary.totalLogs || 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="tab-content mt-8">
        <!-- Privacy Settings Tab -->
        <div v-if="activeTab === 'privacy'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('dataPrivacy.privacy.title') }}</h3>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900">{{ $t('dataPrivacy.privacy.dataSharing') }}</p>
                  <p class="text-sm text-gray-500">{{ $t('dataPrivacy.privacy.dataSharingDesc') }}</p>
                </div>
                <select v-model="privacySettings.dataSharingLevel" @change="updatePrivacySettings" class="form-select">
                  <option value="none">{{ $t('dataPrivacy.privacy.sharingLevels.none') }}</option>
                  <option value="anonymous">{{ $t('dataPrivacy.privacy.sharingLevels.anonymous') }}</option>
                  <option value="aggregated">{{ $t('dataPrivacy.privacy.sharingLevels.aggregated') }}</option>
                  <option value="personal">{{ $t('dataPrivacy.privacy.sharingLevels.personal') }}</option>
                </select>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="consent in consentSettings" :key="consent.key" class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p class="font-medium text-gray-900">{{ consent.label }}</p>
                    <p class="text-sm text-gray-500">{{ consent.description }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      :checked="privacySettings[consent.key]"
                      @change="updateConsent(consent.key, $event.target.checked)"
                      class="sr-only peer"
                    >
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('dataPrivacy.privacy.gdprRights') }}</h3>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900">{{ $t('dataPrivacy.privacy.dataPortability') }}</p>
                  <p class="text-sm text-gray-500">{{ $t('dataPrivacy.privacy.dataPortabilityDesc') }}</p>
                </div>
                <button
                  @click="enableDataPortability"
                  :disabled="privacySettings.dataPortabilityEnabled"
                  class="btn btn-primary"
                  :class="{ 'opacity-50 cursor-not-allowed': privacySettings.dataPortabilityEnabled }"
                >
                  {{ privacySettings.dataPortabilityEnabled ? $t('dataPrivacy.privacy.enabled') : $t('dataPrivacy.privacy.enable') }}
                </button>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900">{{ $t('dataPrivacy.privacy.rightToBeForgotten') }}</p>
                  <p class="text-sm text-gray-500">{{ $t('dataPrivacy.privacy.rightToBeForgottenDesc') }}</p>
                </div>
                <button
                  @click="requestRightToBeForgotten"
                  :disabled="privacySettings.rightToBeForgotten"
                  class="btn btn-secondary"
                  :class="{ 'opacity-50 cursor-not-allowed': privacySettings.rightToBeForgotten }"
                >
                  {{ privacySettings.rightToBeForgotten ? $t('dataPrivacy.privacy.requested') : $t('dataPrivacy.privacy.request') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Requests Tab -->
        <div v-if="activeTab === 'requests'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">{{ $t('dataPrivacy.requests.title') }}</h3>
              <button @click="showCreateRequestModal = true" class="btn btn-primary">
                {{ $t('dataPrivacy.requests.createNew') }}
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('dataPrivacy.requests.type') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('dataPrivacy.requests.status') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('dataPrivacy.requests.created') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('dataPrivacy.requests.actions') }}
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="request in dataRequests" :key="request.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getRequestTypeClass(request.requestType)">
                        {{ $t(`dataPrivacy.requests.types.${request.requestType}`) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(request.status)">
                        {{ $t(`dataPrivacy.requests.statuses.${request.status}`) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatDate(request.createdAt) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        v-if="request.status === 'failed'"
                        @click="retryRequest(request.id)"
                        class="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        {{ $t('dataPrivacy.requests.retry') }}
                      </button>
                      <button
                        v-if="request.status === 'pending'"
                        @click="cancelRequest(request.id)"
                        class="text-red-600 hover:text-red-900"
                      >
                        {{ $t('dataPrivacy.requests.cancel') }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Audit Logs Tab -->
        <div v-if="activeTab === 'audit'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('dataPrivacy.audit.title') }}</h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <p class="text-2xl font-bold text-gray-900">{{ auditLogSummary.totalLogs || 0 }}</p>
                <p class="text-sm text-gray-600">{{ $t('dataPrivacy.audit.totalLogs') }}</p>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <p class="text-2xl font-bold text-green-600">{{ auditLogSummary.successfulActions || 0 }}</p>
                <p class="text-sm text-gray-600">{{ $t('dataPrivacy.audit.successfulActions') }}</p>
              </div>
              <div class="text-center p-4 bg-red-50 rounded-lg">
                <p class="text-2xl font-bold text-red-600">{{ auditLogSummary.failedActions || 0 }}</p>
                <p class="text-sm text-gray-600">{{ $t('dataPrivacy.audit.failedActions') }}</p>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('dataPrivacy.audit.action') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('dataPrivacy.audit.severity') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('dataPrivacy.audit.resource') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('dataPrivacy.audit.timestamp') }}
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="log in auditLogs" :key="log.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ log.description }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getSeverityClass(log.severity)">
                        {{ log.severity }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ log.resource }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatDate(log.createdAt) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Security Tab -->
        <div v-if="activeTab === 'security'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('dataPrivacy.security.title') }}</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p class="font-medium text-red-900">{{ $t('dataPrivacy.security.criticalEvents') }}</p>
                    <p class="text-sm text-red-600">{{ securityDashboard.criticalEvents || 0 }} events</p>
                  </div>
                  <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span class="text-red-600 font-bold">{{ securityDashboard.criticalEvents || 0 }}</span>
                  </div>
                </div>

                <div class="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p class="font-medium text-orange-900">{{ $t('dataPrivacy.security.highEvents') }}</p>
                    <p class="text-sm text-orange-600">{{ securityDashboard.highEvents || 0 }} events</p>
                  </div>
                  <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span class="text-orange-600 font-bold">{{ securityDashboard.highEvents || 0 }}</span>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <div class="p-4 bg-gray-50 rounded-lg">
                  <h4 class="font-medium text-gray-900 mb-2">{{ $t('dataPrivacy.security.riskLevel') }}</h4>
                  <div class="flex items-center">
                    <span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full" :class="getRiskLevelClass(securityDashboard.riskLevel)">
                      {{ securityDashboard.riskLevel || 'LOW' }}
                    </span>
                  </div>
                </div>

                <div class="p-4 bg-gray-50 rounded-lg">
                  <h4 class="font-medium text-gray-900 mb-2">{{ $t('dataPrivacy.security.openEvents') }}</h4>
                  <p class="text-2xl font-bold text-gray-900">{{ securityDashboard.openEvents || 0 }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('dataPrivacy.security.recentEvents') }}</h3>

            <div class="space-y-3">
              <div v-for="event in securityEvents" :key="event.id" class="p-4 border border-gray-200 rounded-lg">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <p class="font-medium text-gray-900">{{ event.description }}</p>
                    <p class="text-sm text-gray-600">{{ event.eventType }}</p>
                    <div class="flex items-center mt-2 space-x-4">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getSeverityClass(event.severity)">
                        {{ event.severity }}
                      </span>
                      <span class="text-sm text-gray-500">{{ formatDate(event.createdAt) }}</span>
                    </div>
                  </div>
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(event.status)">
                    {{ event.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Request Modal -->
    <div v-if="showCreateRequestModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('dataPrivacy.requests.createNew') }}</h3>

          <form @submit.prevent="createDataRequest" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('dataPrivacy.requests.type') }}
              </label>
              <select v-model="newRequest.type" class="form-select w-full" required>
                <option value="data_portability">{{ $t('dataPrivacy.requests.types.data_portability') }}</option>
                <option value="right_to_be_forgotten">{{ $t('dataPrivacy.requests.types.right_to_be_forgotten') }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('dataPrivacy.requests.description') }}
              </label>
              <textarea v-model="newRequest.description" class="form-textarea w-full" rows="3" required></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('dataPrivacy.requests.format') }}
              </label>
              <select v-model="newRequest.format" class="form-select w-full" required>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
                <option value="pdf">PDF</option>
              </select>
            </div>

            <div class="flex items-center space-x-3">
              <input
                type="checkbox"
                v-model="newRequest.isUrgent"
                id="urgent"
                class="form-checkbox"
              >
              <label for="urgent" class="text-sm text-gray-700">
                {{ $t('dataPrivacy.requests.urgent') }}
              </label>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showCreateRequestModal = false"
                class="btn btn-secondary"
              >
                {{ $t('common.cancel') }}
              </button>
              <button type="submit" class="btn btn-primary">
                {{ $t('common.create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Reactive data
const activeTab = ref('privacy')
const showCreateRequestModal = ref(false)
const privacySettings = ref({})
const gdprStatus = ref({})
const securityDashboard = ref({})
const dataRequestStats = ref({})
const auditLogSummary = ref({})
const dataRequests = ref([])
const auditLogs = ref([])
const securityEvents = ref([])

const newRequest = ref({
  type: 'data_portability',
  description: '',
  format: 'json',
  isUrgent: false
})

// Tabs configuration
const tabs = [
  { id: 'privacy', name: t('dataPrivacy.tabs.privacy') },
  { id: 'requests', name: t('dataPrivacy.tabs.requests') },
  { id: 'audit', name: t('dataPrivacy.tabs.audit') },
  { id: 'security', name: t('dataPrivacy.tabs.security') }
]

// Consent settings configuration
const consentSettings = computed(() => [
  {
    key: 'allowAnalytics',
    label: t('dataPrivacy.privacy.consent.analytics'),
    description: t('dataPrivacy.privacy.consent.analyticsDesc')
  },
  {
    key: 'allowMarketing',
    label: t('dataPrivacy.privacy.consent.marketing'),
    description: t('dataPrivacy.privacy.consent.marketingDesc')
  },
  {
    key: 'allowThirdParty',
    label: t('dataPrivacy.privacy.consent.thirdParty'),
    description: t('dataPrivacy.privacy.consent.thirdPartyDesc')
  },
  {
    key: 'allowLocationData',
    label: t('dataPrivacy.privacy.consent.location'),
    description: t('dataPrivacy.privacy.consent.locationDesc')
  },
  {
    key: 'allowHealthData',
    label: t('dataPrivacy.privacy.consent.health'),
    description: t('dataPrivacy.privacy.consent.healthDesc')
  },
  {
    key: 'allowSocialFeatures',
    label: t('dataPrivacy.privacy.consent.social'),
    description: t('dataPrivacy.privacy.consent.socialDesc')
  }
])

// Methods
const loadData = async () => {
  try {
    // Load privacy settings
    const settingsResponse = await fetch('/api/data-privacy/privacy-settings', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    privacySettings.value = await settingsResponse.json()

    // Load GDPR status
    const gdprResponse = await fetch('/api/data-privacy/gdpr/compliance-status', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    gdprStatus.value = await gdprResponse.json()

    // Load security dashboard
    const securityResponse = await fetch('/api/data-privacy/security/dashboard', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    securityDashboard.value = await securityResponse.json()

    // Load data request stats
    const statsResponse = await fetch('/api/data-privacy/data-requests/stats/summary', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    dataRequestStats.value = await statsResponse.json()

    // Load audit log summary
    const auditResponse = await fetch('/api/data-privacy/audit-logs/summary', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    auditLogSummary.value = await auditResponse.json()

    // Load data requests
    const requestsResponse = await fetch('/api/data-privacy/data-requests', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    const requestsData = await requestsResponse.json()
    dataRequests.value = requestsData.requests || []

    // Load audit logs
    const logsResponse = await fetch('/api/data-privacy/audit-logs?limit=20', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    const logsData = await logsResponse.json()
    auditLogs.value = logsData.logs || []

    // Load security events
    const eventsResponse = await fetch('/api/data-privacy/security/events?limit=10', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    const eventsData = await eventsResponse.json()
    securityEvents.value = eventsData.events || []

  } catch (error) {
    console.error('Error loading data:', error)
  }
}

const updatePrivacySettings = async () => {
  try {
    await fetch('/api/data-privacy/privacy-settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(privacySettings.value)
    })
  } catch (error) {
    console.error('Error updating privacy settings:', error)
  }
}

const updateConsent = async (consentType, granted) => {
  try {
    await fetch(`/api/data-privacy/privacy-settings/consent/${consentType}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ granted })
    })
  } catch (error) {
    console.error('Error updating consent:', error)
  }
}

const enableDataPortability = async () => {
  try {
    await fetch('/api/data-privacy/privacy-settings/data-portability', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    await loadData()
  } catch (error) {
    console.error('Error enabling data portability:', error)
  }
}

const requestRightToBeForgotten = async () => {
  try {
    await fetch('/api/data-privacy/privacy-settings/right-to-be-forgotten', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    await loadData()
  } catch (error) {
    console.error('Error requesting right to be forgotten:', error)
  }
}

const createDataRequest = async () => {
  try {
    await fetch('/api/data-privacy/data-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        requestType: newRequest.value.type,
        description: newRequest.value.description,
        preferredFormat: newRequest.value.format,
        isUrgent: newRequest.value.isUrgent
      })
    })

    showCreateRequestModal.value = false
    newRequest.value = { type: 'data_portability', description: '', format: 'json', isUrgent: false }
    await loadData()
  } catch (error) {
    console.error('Error creating data request:', error)
  }
}

const retryRequest = async (id) => {
  try {
    await fetch(`/api/data-privacy/data-requests/${id}/retry`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    await loadData()
  } catch (error) {
    console.error('Error retrying request:', error)
  }
}

const cancelRequest = async (id) => {
  try {
    await fetch(`/api/data-privacy/data-requests/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    await loadData()
  } catch (error) {
    console.error('Error cancelling request:', error)
  }
}

// Utility methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const getRequestTypeClass = (type) => {
  const classes = {
    data_portability: 'bg-blue-100 text-blue-800',
    right_to_be_forgotten: 'bg-red-100 text-red-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    open: 'bg-red-100 text-red-800',
    investigating: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    false_positive: 'bg-gray-100 text-gray-800',
    escalated: 'bg-orange-100 text-orange-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getSeverityClass = (severity) => {
  const classes = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  }
  return classes[severity] || 'bg-gray-100 text-gray-800'
}

const getRiskLevelClass = (level) => {
  const classes = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800'
  }
  return classes[level] || 'bg-gray-100 text-gray-800'
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.data-privacy-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8;
}

.header {
  @apply mb-8;
}

.summary-cards .card {
  @apply transition-all duration-200 hover:shadow-md;
}

.tabs-container {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

.tab-content {
  @apply px-6 pb-6;
}

.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors duration-200;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

.btn-secondary {
  @apply bg-gray-300 text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2;
}

.form-select, .form-textarea, .form-checkbox {
  @apply border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.form-textarea {
  @apply resize-none;
}

.form-checkbox {
  @apply h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded;
}
</style>
