<template>
  <div class="health-data">
    <div class="header">
      <h2>{{ $t('wearable.healthData.title') }}</h2>
      <div class="header-actions">
        <select v-model="selectedDataType" class="form-control" @change="fetchHealthData">
          <option value="">{{ $t('wearable.healthData.allTypes') }}</option>
          <option value="steps">{{ $t('wearable.healthData.types.steps') }}</option>
          <option value="heart_rate">{{ $t('wearable.healthData.types.heart_rate') }}</option>
          <option value="sleep">{{ $t('wearable.healthData.types.sleep') }}</option>
          <option value="calories">{{ $t('wearable.healthData.types.calories') }}</option>
          <option value="distance">{{ $t('wearable.healthData.types.distance') }}</option>
          <option value="weight">{{ $t('wearable.healthData.types.weight') }}</option>
        </select>

        <select v-model="selectedTimeRange" class="form-control" @change="fetchHealthData">
          <option value="7">{{ $t('wearable.healthData.timeRanges.7days') }}</option>
          <option value="30">{{ $t('wearable.healthData.timeRanges.30days') }}</option>
          <option value="90">{{ $t('wearable.healthData.timeRanges.90days') }}</option>
          <option value="365">{{ $t('wearable.healthData.timeRanges.1year') }}</option>
        </select>
      </div>
    </div>

    <!-- Data Summary -->
    <div class="data-summary" v-if="dataSummary">
      <div class="summary-card">
        <div class="summary-icon">
          <i class="fas fa-database"></i>
        </div>
        <div class="summary-content">
          <h4>{{ $t('wearable.healthData.totalDataPoints') }}</h4>
          <p>{{ dataSummary.totalDataPoints }}</p>
        </div>
      </div>

      <div class="summary-card" v-if="dataSummary.dataByType">
        <div class="summary-icon">
          <i class="fas fa-chart-pie"></i>
        </div>
        <div class="summary-content">
          <h4>{{ $t('wearable.healthData.dataTypes') }}</h4>
          <p>{{ dataSummary.dataByType.length }}</p>
        </div>
      </div>

      <div class="summary-card" v-if="dataSummary.dataByDevice">
        <div class="summary-icon">
          <i class="fas fa-watch"></i>
        </div>
        <div class="summary-content">
          <h4>{{ $t('wearable.healthData.devices') }}</h4>
          <p>{{ dataSummary.dataByDevice.length }}</p>
        </div>
      </div>
    </div>

    <!-- Data Chart -->
    <div class="chart-container" v-if="chartData.length > 0">
      <h3>{{ $t('wearable.healthData.chartTitle') }}</h3>
      <div class="chart-wrapper">
        <canvas ref="chartCanvas" width="400" height="200"></canvas>
      </div>
    </div>

    <!-- Data Table -->
    <div class="data-table-container" v-if="healthData.length > 0">
      <h3>{{ $t('wearable.healthData.recentData') }}</h3>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>{{ $t('wearable.healthData.table.type') }}</th>
              <th>{{ $t('wearable.healthData.table.value') }}</th>
              <th>{{ $t('wearable.healthData.table.unit') }}</th>
              <th>{{ $t('wearable.healthData.table.timestamp') }}</th>
              <th>{{ $t('wearable.healthData.table.device') }}</th>
              <th>{{ $t('wearable.healthData.table.quality') }}</th>
              <th>{{ $t('wearable.healthData.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="data in healthData" :key="data.id">
              <td>
                <span class="data-type-badge" :class="data.type">
                  {{ $t(`wearable.healthData.types.${data.type}`) }}
                </span>
              </td>
              <td>{{ formatValue(data.value, data.type) }}</td>
              <td>{{ data.unit || '-' }}</td>
              <td>{{ formatDate(data.timestamp) }}</td>
              <td>{{ data.device?.name || '-' }}</td>
              <td>
                <span class="quality-badge" :class="data.quality">
                  {{ $t(`wearable.healthData.quality.${data.quality}`) }}
                </span>
              </td>
              <td>
                <button
                  class="btn btn-sm btn-outline-primary"
                  @click="viewDataDetails(data)"
                  :disabled="loading"
                >
                  <i class="fas fa-eye"></i>
                  {{ $t('wearable.healthData.view') }}
                </button>

                <button
                  v-if="!data.isProcessed"
                  class="btn btn-sm btn-outline-secondary"
                  @click="processData(data.id)"
                  :disabled="processing"
                >
                  <i class="fas fa-cog"></i>
                  {{ $t('wearable.healthData.process') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button
          class="btn btn-outline-primary"
          @click="changePage(currentPage - 1)"
          :disabled="currentPage <= 1"
        >
          <i class="fas fa-chevron-left"></i>
          {{ $t('common.previous') }}
        </button>

        <span class="page-info">
          {{ $t('common.page') }} {{ currentPage }} {{ $t('common.of') }} {{ totalPages }}
        </span>

        <button
          class="btn btn-outline-primary"
          @click="changePage(currentPage + 1)"
          :disabled="currentPage >= totalPages"
        >
          {{ $t('common.next') }}
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-chart-line"></i>
      </div>
      <h3>{{ $t('wearable.healthData.noData') }}</h3>
      <p>{{ $t('wearable.healthData.noDataDescription') }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">{{ $t('common.loading') }}</span>
      </div>
      <p>{{ $t('wearable.healthData.loading') }}</p>
    </div>

    <!-- Data Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="showDetailsModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('wearable.healthData.detailsModal.title') }}</h3>
          <button class="btn-close" @click="showDetailsModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body" v-if="selectedData">
          <div class="detail-row">
            <label>{{ $t('wearable.healthData.detailsModal.type') }}:</label>
            <span>{{ $t(`wearable.healthData.types.${selectedData.type}`) }}</span>
          </div>

          <div class="detail-row">
            <label>{{ $t('wearable.healthData.detailsModal.value') }}:</label>
            <span>{{ formatValue(selectedData.value, selectedData.type) }}</span>
          </div>

          <div class="detail-row">
            <label>{{ $t('wearable.healthData.detailsModal.unit') }}:</label>
            <span>{{ selectedData.unit || '-' }}</span>
          </div>

          <div class="detail-row">
            <label>{{ $t('wearable.healthData.detailsModal.timestamp') }}:</label>
            <span>{{ formatDate(selectedData.timestamp) }}</span>
          </div>

          <div class="detail-row">
            <label>{{ $t('wearable.healthData.detailsModal.device') }}:</label>
            <span>{{ selectedData.device?.name || '-' }}</span>
          </div>

          <div class="detail-row">
            <label>{{ $t('wearable.healthData.detailsModal.quality') }}:</label>
            <span class="quality-badge" :class="selectedData.quality">
              {{ $t(`wearable.healthData.quality.${selectedData.quality}`) }}
            </span>
          </div>

          <div class="detail-row" v-if="selectedData.metadata">
            <label>{{ $t('wearable.healthData.detailsModal.metadata') }}:</label>
            <pre>{{ JSON.stringify(selectedData.metadata, null, 2) }}</pre>
          </div>

          <div class="detail-row" v-if="selectedData.processedData">
            <label>{{ $t('wearable.healthData.detailsModal.processedData') }}:</label>
            <div class="processed-data">
              <div v-for="(insight, index) in selectedData.processedData.insights" :key="index" class="insight">
                <i class="fas fa-lightbulb"></i>
                {{ insight }}
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDetailsModal = false">
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'

const { t } = useI18n()
const toast = useToast()

// Reactive state
const loading = ref(false)
const processing = ref(false)
const healthData = ref([])
const dataSummary = ref(null)
const chartData = ref([])
const selectedDataType = ref('')
const selectedTimeRange = ref(30)
const currentPage = ref(1)
const totalPages = ref(1)
const showDetailsModal = ref(false)
const selectedData = ref(null)
const chartCanvas = ref(null)
let chart = null

// Methods
const fetchHealthData = async () => {
  try {
    loading.value = true

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(selectedTimeRange.value))

    const query = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: 50,
      offset: (currentPage.value - 1) * 50,
      order: 'desc'
    }

    if (selectedDataType.value) {
      query.type = selectedDataType.value
    }

    const response = await $fetch('/api/wearable/health-data', { query })
    healthData.value = response.data
    totalPages.value = Math.ceil(response.total / 50)

    // Prepare chart data
    prepareChartData()

  } catch (error) {
    console.error('Error fetching health data:', error)
    toast.error(t('wearable.healthData.errors.fetchFailed'))
  } finally {
    loading.value = false
  }
}

const fetchDataSummary = async () => {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(selectedTimeRange.value))

    const response = await $fetch('/api/wearable/health-data/summary', {
      query: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    })
    dataSummary.value = response
  } catch (error) {
    console.error('Error fetching data summary:', error)
  }
}

const prepareChartData = () => {
  if (!healthData.value.length) return

  // Group data by date and type
  const groupedData = {}

  healthData.value.forEach(data => {
    const date = new Date(data.timestamp).toLocaleDateString()
    if (!groupedData[date]) {
      groupedData[date] = {}
    }
    if (!groupedData[date][data.type]) {
      groupedData[date][data.type] = []
    }
    groupedData[date][data.type].push(data.value)
  })

  // Calculate averages
  const chartLabels = Object.keys(groupedData).sort()
  const datasets = []

  const types = [...new Set(healthData.value.map(d => d.type))]
  types.forEach(type => {
    const data = chartLabels.map(date => {
      const values = groupedData[date][type] || []
      return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
    })

    datasets.push({
      label: t(`wearable.healthData.types.${type}`),
      data: data,
      borderColor: getTypeColor(type),
      backgroundColor: getTypeColor(type, 0.1),
      tension: 0.4
    })
  })

  chartData.value = {
    labels: chartLabels,
    datasets: datasets
  }

  // Update chart
  nextTick(() => {
    updateChart()
  })
}

const updateChart = () => {
  if (!chartCanvas.value || !chartData.value.labels.length) return

  const ctx = chartCanvas.value.getContext('2d')

  if (chart) {
    chart.destroy()
  }

  // Simple chart implementation (in production, use Chart.js or similar)
  chart = {
    destroy: () => {
      // Clean up chart
    }
  }

  // Draw simple line chart
  drawSimpleChart(ctx, chartData.value)
}

const drawSimpleChart = (ctx, data) => {
  const canvas = ctx.canvas
  const width = canvas.width
  const height = canvas.height

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  // Draw axes
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(50, 20)
  ctx.lineTo(50, height - 50)
  ctx.lineTo(width - 20, height - 50)
  ctx.stroke()

  // Draw data lines
  data.datasets.forEach((dataset, datasetIndex) => {
    if (dataset.data.length === 0) return

    const maxValue = Math.max(...dataset.data)
    const minValue = Math.min(...dataset.data)
    const range = maxValue - minValue || 1

    ctx.strokeStyle = dataset.borderColor
    ctx.lineWidth = 2
    ctx.beginPath()

    dataset.data.forEach((value, index) => {
      const x = 50 + (index / (dataset.data.length - 1)) * (width - 70)
      const y = height - 50 - ((value - minValue) / range) * (height - 70)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()
  })
}

const getTypeColor = (type, alpha = 1) => {
  const colors = {
    steps: `rgba(52, 152, 219, ${alpha})`,
    heart_rate: `rgba(231, 76, 60, ${alpha})`,
    sleep: `rgba(155, 89, 182, ${alpha})`,
    calories: `rgba(46, 204, 113, ${alpha})`,
    distance: `rgba(52, 73, 94, ${alpha})`,
    weight: `rgba(241, 196, 15, ${alpha})`
  }
  return colors[type] || `rgba(149, 165, 166, ${alpha})`
}

const changePage = (page) => {
  currentPage.value = page
  fetchHealthData()
}

const viewDataDetails = (data) => {
  selectedData.value = data
  showDetailsModal.value = true
}

const processData = async (dataId) => {
  try {
    processing.value = true

    await $fetch(`/api/wearable/health-data/${dataId}/process`, {
      method: 'POST'
    })

    toast.success(t('wearable.healthData.messages.processed'))
    await fetchHealthData()
  } catch (error) {
    console.error('Error processing data:', error)
    toast.error(t('wearable.healthData.errors.processFailed'))
  } finally {
    processing.value = false
  }
}

const formatValue = (value, type) => {
  if (type === 'sleep') {
    return `${Math.floor(value)}h ${Math.round((value % 1) * 60)}m`
  }
  if (type === 'heart_rate') {
    return `${value} bpm`
  }
  if (type === 'weight') {
    return `${value} kg`
  }
  if (type === 'distance') {
    return `${(value / 1000).toFixed(2)} km`
  }
  return value
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// Watchers
watch([selectedDataType, selectedTimeRange], () => {
  currentPage.value = 1
  fetchHealthData()
  fetchDataSummary()
})

// Lifecycle
onMounted(() => {
  fetchHealthData()
  fetchDataSummary()
})
</script>

<style scoped>
.health-data {
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.header-actions .form-control {
  min-width: 150px;
}

.data-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.summary-icon {
  font-size: 2rem;
  color: #666;
  width: 60px;
  text-align: center;
}

.summary-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
}

.summary-content p {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.chart-container {
  margin-bottom: 2rem;
}

.chart-wrapper {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.data-table-container {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
}

.table {
  margin-bottom: 1rem;
}

.data-type-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background: #e9ecef;
  color: #495057;
}

.quality-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.quality-badge.high {
  background: #d4edda;
  color: #155724;
}

.quality-badge.medium {
  background: #fff3cd;
  color: #856404;
}

.quality-badge.low {
  background: #f8d7da;
  color: #721c24;
}

.quality-badge.unknown {
  background: #e9ecef;
  color: #495057;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.page-info {
  font-weight: 500;
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
  max-width: 600px;
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

.detail-row {
  display: flex;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row label {
  font-weight: 500;
  min-width: 120px;
  margin-right: 1rem;
}

.detail-row pre {
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  margin: 0;
  font-size: 0.9rem;
  overflow-x: auto;
}

.processed-data {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.insight {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #e8f5e8;
  border-radius: 4px;
  color: #155724;
}

.insight i {
  color: #28a745;
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

  .header-actions {
    flex-direction: column;
  }

  .data-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .table-responsive {
    overflow-x: auto;
  }
}
</style>
