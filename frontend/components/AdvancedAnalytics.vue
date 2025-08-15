<template>
  <div class="advanced-analytics">
    <!-- Header -->
    <div class="analytics-header">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">
        {{ $t('analytics.advanced.title') }}
      </h1>
      <p class="text-gray-600 mb-6">
        {{ $t('analytics.advanced.description') }}
      </p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ $t('analytics.advanced.correlations') }}</p>
            <p class="text-2xl font-semibold text-gray-900">{{ summary.totalCorrelations || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ $t('analytics.advanced.predictions') }}</p>
            <p class="text-2xl font-semibold text-gray-900">{{ summary.totalPredictions || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 text-purple-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ $t('analytics.advanced.confidence') }}</p>
            <p class="text-2xl font-semibold text-gray-900">{{ Math.round((summary.averagePredictedSuccess || 0) * 100) }}%</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-orange-100 text-orange-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ $t('analytics.advanced.exports') }}</p>
            <p class="text-2xl font-semibold text-gray-900">{{ summary.totalExports || 0 }}</p>
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
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Correlations Tab -->
      <div v-if="activeTab === 'correlations'" class="space-y-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            {{ $t('analytics.advanced.habitCorrelations') }}
          </h3>

          <!-- Filters -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('analytics.advanced.minCorrelation') }}
              </label>
              <input
                v-model="correlationFilters.minCorrelation"
                type="number"
                min="0"
                max="1"
                step="0.1"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.3"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('analytics.advanced.minConfidence') }}
              </label>
              <input
                v-model="correlationFilters.minConfidence"
                type="number"
                min="0"
                max="1"
                step="0.1"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.6"
              />
            </div>
            <div class="flex items-end">
              <button
                @click="analyzeCorrelations"
                :disabled="loading"
                class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ loading ? $t('common.loading') : $t('analytics.advanced.analyze') }}
              </button>
            </div>
          </div>

          <!-- Correlations List -->
          <div v-if="correlations.length > 0" class="space-y-4">
            <div
              v-for="correlation in correlations"
              :key="`${correlation.habitId1}-${correlation.habitId2}`"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      correlation.correlationType === 'positive'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ correlation.correlationType === 'positive' ? '+' : '-' }}{{ Math.round(Math.abs(correlation.correlationCoefficient) * 100) }}%
                  </span>
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      correlation.strength === 'strong'
                        ? 'bg-blue-100 text-blue-800'
                        : correlation.strength === 'moderate'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ correlation.strength }}
                  </span>
                </div>
                <span class="text-sm text-gray-500">
                  {{ Math.round(correlation.confidence * 100) }}% confidence
                </span>
              </div>

              <h4 class="font-medium text-gray-800 mb-2">
                {{ correlation.habitName1 }} ↔ {{ correlation.habitName2 }}
              </h4>

              <p class="text-sm text-gray-600 mb-3">
                {{ correlation.explanation }}
              </p>

              <div v-if="correlation.insights && correlation.insights.length > 0" class="space-y-1">
                <p class="text-xs font-medium text-gray-700">{{ $t('analytics.advanced.insights') }}:</p>
                <ul class="text-xs text-gray-600 space-y-1">
                  <li v-for="insight in correlation.insights" :key="insight" class="flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    {{ insight }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div v-else-if="!loading" class="text-center py-8 text-gray-500">
            {{ $t('analytics.advanced.noCorrelations') }}
          </div>
        </div>
      </div>

      <!-- Predictions Tab -->
      <div v-if="activeTab === 'predictions'" class="space-y-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            {{ $t('analytics.advanced.habitPredictions') }}
          </h3>

          <!-- Filters -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('analytics.advanced.timeframe') }}
              </label>
              <select
                v-model="predictionFilters.timeframeDays"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">7 days</option>
                <option value="30" selected>30 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
              </select>
            </div>
            <div class="flex items-end">
              <button
                @click="generatePredictions"
                :disabled="loading"
                class="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {{ loading ? $t('common.loading') : $t('analytics.advanced.generate') }}
              </button>
            </div>
          </div>

          <!-- Predictions List -->
          <div v-if="predictions.length > 0" class="space-y-4">
            <div
              v-for="prediction in predictions"
              :key="prediction.habitId"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-800">{{ prediction.habitName }}</h4>
                <div class="flex items-center space-x-2">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      prediction.confidence === 'high'
                        ? 'bg-green-100 text-green-800'
                        : prediction.confidence === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ prediction.confidence }} confidence
                  </span>
                  <span class="text-sm text-gray-500">
                    {{ Math.round(prediction.confidenceScore * 100) }}%
                  </span>
                </div>
              </div>

              <div class="mb-3">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm text-gray-600">{{ $t('analytics.advanced.predictedSuccess') }}</span>
                  <span class="text-sm font-medium text-gray-800">
                    {{ Math.round(prediction.predictedValue * 100) }}%
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full"
                    :style="{ width: `${prediction.predictedValue * 100}%` }"
                  ></div>
                </div>
              </div>

              <p class="text-sm text-gray-600 mb-3">
                {{ prediction.explanation }}
              </p>

              <div v-if="prediction.recommendations && prediction.recommendations.length > 0" class="space-y-1">
                <p class="text-xs font-medium text-gray-700">{{ $t('analytics.advanced.recommendations') }}:</p>
                <ul class="text-xs text-gray-600 space-y-1">
                  <li v-for="recommendation in prediction.recommendations" :key="recommendation" class="flex items-start">
                    <span class="text-green-500 mr-2">•</span>
                    {{ recommendation }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div v-else-if="!loading" class="text-center py-8 text-gray-500">
            {{ $t('analytics.advanced.noPredictions') }}
          </div>
        </div>
      </div>

      <!-- Data Export Tab -->
      <div v-if="activeTab === 'export'" class="space-y-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            {{ $t('analytics.advanced.dataExport') }}
          </h3>

          <!-- Export Form -->
          <form @submit.prevent="exportData" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('analytics.advanced.exportType') }}
                </label>
                <select
                  v-model="exportForm.exportType"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="habit_data">Habit Data</option>
                  <option value="habit_logs">Habit Logs</option>
                  <option value="analytics">Analytics</option>
                  <option value="correlations">Correlations</option>
                  <option value="predictions">Predictions</option>
                  <option value="goals">Goals</option>
                  <option value="complete_profile">Complete Profile</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('analytics.advanced.exportFormat') }}
                </label>
                <select
                  v-model="exportForm.format"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('analytics.advanced.timeRange') }}
                </label>
                <select
                  v-model="exportForm.timeRange"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="last_30_days" selected>Last 30 Days</option>
                  <option value="last_90_days">Last 90 Days</option>
                  <option value="last_year">Last Year</option>
                  <option value="all_time">All Time</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('analytics.advanced.includeMetadata') }}
                </label>
                <div class="flex items-center">
                  <input
                    v-model="exportForm.includeMetadata"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 text-sm text-gray-700">
                    {{ $t('analytics.advanced.includeMetadataLabel') }}
                  </label>
                </div>
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="exporting"
                class="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                {{ exporting ? $t('common.exporting') : $t('analytics.advanced.export') }}
              </button>
            </div>
          </form>
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
const exporting = ref(false)
const activeTab = ref('correlations')
const summary = ref({
  totalCorrelations: 0,
  totalPredictions: 0,
  averagePredictedSuccess: 0,
  totalExports: 0,
})
const correlations = ref([])
const predictions = ref([])

// Filters
const correlationFilters = ref({
  minCorrelation: 0.3,
  minConfidence: 0.6,
})

const predictionFilters = ref({
  timeframeDays: 30,
})

const exportForm = ref({
  exportType: 'habit_data',
  format: 'csv',
  timeRange: 'last_30_days',
  includeMetadata: true,
})

// Tabs
const tabs = [
  { id: 'correlations', name: t('analytics.advanced.correlations') },
  { id: 'predictions', name: t('analytics.advanced.predictions') },
  { id: 'export', name: t('analytics.advanced.export') },
]

// Methods
const loadAnalyticsSummary = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/analytics/advanced/summary', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    summary.value = response.summary
    correlations.value = response.correlations || []
    predictions.value = response.predictions || []
  } catch (error) {
    console.error('Error loading analytics summary:', error)
    showToast('Error loading analytics data', 'error')
  } finally {
    loading.value = false
  }
}

const analyzeCorrelations = async () => {
  try {
    loading.value = true
    const queryParams = new URLSearchParams()

    if (correlationFilters.value.minCorrelation) {
      queryParams.append('minCorrelation', correlationFilters.value.minCorrelation.toString())
    }
    if (correlationFilters.value.minConfidence) {
      queryParams.append('minConfidence', correlationFilters.value.minConfidence.toString())
    }

    const response = await $fetch(`/api/analytics/advanced/correlations?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    correlations.value = response
    showToast(`Found ${response.length} habit correlations`, 'success')
  } catch (error) {
    console.error('Error analyzing correlations:', error)
    showToast('Error analyzing habit correlations', 'error')
  } finally {
    loading.value = false
  }
}

const generatePredictions = async () => {
  try {
    loading.value = true
    const queryParams = new URLSearchParams()

    if (predictionFilters.value.timeframeDays) {
      queryParams.append('timeframeDays', predictionFilters.value.timeframeDays.toString())
    }

    const response = await $fetch(`/api/analytics/advanced/predictions?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    predictions.value = response.predictions || []
    showToast(`Generated ${response.predictions?.length || 0} habit predictions`, 'success')
  } catch (error) {
    console.error('Error generating predictions:', error)
    showToast('Error generating habit predictions', 'error')
  } finally {
    loading.value = false
  }
}

const exportData = async () => {
  try {
    exporting.value = true

    const response = await $fetch('/api/analytics/advanced/export', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: exportForm.value,
    })

    showToast('Export job created successfully', 'success')

    // Refresh summary to update export count
    await loadAnalyticsSummary()
  } catch (error) {
    console.error('Error creating export:', error)
    showToast('Error creating export job', 'error')
  } finally {
    exporting.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadAnalyticsSummary()
})
</script>

<style scoped>
.advanced-analytics {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8;
}

.analytics-header {
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
