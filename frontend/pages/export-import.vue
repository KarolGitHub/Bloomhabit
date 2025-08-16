<template>
  <div class="export-import-page">
    <div class="page-header">
      <h1>📤 Export/Import System</h1>
      <p>Manage your data exports, imports, and automated backups</p>
    </div>

    <!-- Dashboard Overview -->
    <div class="dashboard-overview" v-if="dashboardStats">
      <div class="stats-grid">
        <div class="stat-card">
          <h3>📊 Exports</h3>
          <div class="stat-numbers">
            <span class="stat-main">{{ dashboardStats.exports.total }}</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat-breakdown">
            <span class="stat-item completed">{{ dashboardStats.exports.completed }}</span>
            <span class="stat-item pending">{{ dashboardStats.exports.pending }}</span>
            <span class="stat-item failed">{{ dashboardStats.exports.failed }}</span>
          </div>
        </div>

        <div class="stat-card">
          <h3>📥 Imports</h3>
          <div class="stat-numbers">
            <span class="stat-main">{{ dashboardStats.imports.total }}</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat-breakdown">
            <span class="stat-item completed">{{ dashboardStats.imports.completed }}</span>
            <span class="stat-item pending">{{ dashboardStats.imports.pending }}</span>
            <span class="stat-item failed">{{ dashboardStats.imports.failed }}</span>
          </div>
        </div>

        <div class="stat-card">
          <h3>💾 Backups</h3>
          <div class="stat-numbers">
            <span class="stat-main">{{ dashboardStats.backups.total }}</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat-breakdown">
            <span class="stat-item completed">{{ dashboardStats.backups.completed }}</span>
            <span class="stat-item pending">{{ dashboardStats.backups.pending }}</span>
            <span class="stat-item verified">{{ dashboardStats.backups.verified }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button @click="showCreateExportModal = true" class="btn btn-primary">
          📤 Create Export
        </button>
        <button @click="showCreateImportModal = true" class="btn btn-secondary">
          📥 Create Import
        </button>
        <button @click="showCreateBackupModal = true" class="btn btn-success">
          💾 Create Backup
        </button>
      </div>
    </div>

    <!-- Main Content Tabs -->
    <div class="main-content">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
        >
          {{ tab.icon }} {{ tab.name }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Exports Tab -->
        <div v-if="activeTab === 'exports'" class="tab-panel">
          <div class="panel-header">
            <h2>Data Exports</h2>
            <button @click="showCreateExportModal = true" class="btn btn-primary">
              + New Export
            </button>
          </div>

          <div class="exports-list" v-if="exports.length > 0">
            <div v-for="exportItem in exports" :key="exportItem.id" class="export-card">
              <div class="export-header">
                <h3>{{ exportItem.name }}</h3>
                <span :class="['status-badge', exportItem.status.toLowerCase()]">
                  {{ exportItem.status }}
                </span>
              </div>
              <p class="export-description">{{ exportItem.description || 'No description' }}</p>
              <div class="export-details">
                <span class="detail-item">
                  <strong>Format:</strong> {{ exportItem.format }}
                </span>
                <span class="detail-item">
                  <strong>Type:</strong> {{ exportItem.exportType }}
                </span>
                <span class="detail-item">
                  <strong>Created:</strong> {{ formatDate(exportItem.createdAt) }}
                </span>
              </div>
              <div class="export-actions">
                <button
                  v-if="exportItem.status === 'COMPLETED'"
                  @click="downloadExport(exportItem.id)"
                  class="btn btn-sm btn-primary"
                >
                  📥 Download
                </button>
                <button
                  v-if="exportItem.status === 'FAILED'"
                  @click="retryExport(exportItem.id)"
                  class="btn btn-sm btn-secondary"
                >
                  🔄 Retry
                </button>
                <button
                  v-if="['PENDING', 'PROCESSING'].includes(exportItem.status)"
                  @click="cancelExport(exportItem.id)"
                  class="btn btn-sm btn-warning"
                >
                  ❌ Cancel
                </button>
                <button
                  @click="deleteExport(exportItem.id)"
                  class="btn btn-sm btn-danger"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <p>No exports found. Create your first export to get started.</p>
          </div>
        </div>

        <!-- Imports Tab -->
        <div v-if="activeTab === 'imports'" class="tab-panel">
          <div class="panel-header">
            <h2>Data Imports</h2>
            <button @click="showCreateImportModal = true" class="btn btn-primary">
              + New Import
            </button>
          </div>

          <div class="imports-list" v-if="imports.length > 0">
            <div v-for="importItem in imports" :key="importItem.id" class="import-card">
              <div class="import-header">
                <h3>{{ importItem.name }}</h3>
                <span :class="['status-badge', importItem.status.toLowerCase()]">
                  {{ importItem.status }}
                </span>
              </div>
              <p class="import-description">{{ importItem.description || 'No description' }}</p>
              <div class="import-details">
                <span class="detail-item">
                  <strong>Format:</strong> {{ importItem.format }}
                </span>
                <span class="detail-item">
                  <strong>Type:</strong> {{ importItem.importType }}
                </span>
                <span class="detail-item">
                  <strong>Validation:</strong> {{ importItem.validationStatus }}
                </span>
              </div>
              <div class="import-actions">
                <button
                  v-if="importItem.status === 'VALIDATED'"
                  @click="startImport(importItem.id)"
                  class="btn btn-sm btn-primary"
                >
                  ▶️ Start Import
                </button>
                <button
                  v-if="importItem.status === 'FAILED'"
                  @click="retryImport(importItem.id)"
                  class="btn btn-sm btn-secondary"
                >
                  🔄 Retry
                </button>
                <button
                  v-if="['PENDING', 'VALIDATING', 'PROCESSING'].includes(importItem.status)"
                  @click="cancelImport(importItem.id)"
                  class="btn btn-sm btn-warning"
                >
                  ❌ Cancel
                </button>
                <button
                  @click="deleteImport(importItem.id)"
                  class="btn btn-sm btn-danger"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <p>No imports found. Create your first import to get started.</p>
          </div>
        </div>

        <!-- Backups Tab -->
        <div v-if="activeTab === 'backups'" class="tab-panel">
          <div class="panel-header">
            <h2>Automated Backups</h2>
            <button @click="showCreateBackupModal = true" class="btn btn-primary">
              + New Backup
            </button>
          </div>

          <div class="backups-list" v-if="backups.length > 0">
            <div v-for="backup in backups" :key="backup.id" class="backup-card">
              <div class="backup-header">
                <h3>{{ backup.name }}</h3>
                <span :class="['status-badge', backup.status.toLowerCase()]">
                  {{ backup.status }}
                </span>
              </div>
              <p class="backup-description">{{ backup.description || 'No description' }}</p>
              <div class="backup-details">
                <span class="detail-item">
                  <strong>Type:</strong> {{ backup.backupType }}
                </span>
                <span class="detail-item">
                  <strong>Frequency:</strong> {{ backup.frequency }}
                </span>
                <span class="detail-item">
                  <strong>Verified:</strong> {{ backup.isVerified ? 'Yes' : 'No' }}
                </span>
              </div>
              <div class="backup-actions">
                <button
                  v-if="backup.status === 'COMPLETED'"
                  @click="downloadBackup(backup.id)"
                  class="btn btn-sm btn-primary"
                >
                  📥 Download
                </button>
                <button
                  v-if="backup.status === 'COMPLETED'"
                  @click="restoreBackup(backup.id)"
                  class="btn btn-sm btn-success"
                >
                  🔄 Restore
                </button>
                <button
                  v-if="backup.status === 'COMPLETED' && !backup.isVerified"
                  @click="verifyBackup(backup.id)"
                  class="btn btn-sm btn-info"
                >
                  ✅ Verify
                </button>
                <button
                  v-if="['PENDING', 'IN_PROGRESS'].includes(backup.status)"
                  @click="cancelBackup(backup.id)"
                  class="btn btn-sm btn-warning"
                >
                  ❌ Cancel
                </button>
                <button
                  @click="deleteBackup(backup.id)"
                  class="btn btn-sm btn-danger"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <p>No backups found. Create your first backup to get started.</p>
          </div>
        </div>

        <!-- Activity Tab -->
        <div v-if="activeTab === 'activity'" class="tab-panel">
          <div class="panel-header">
            <h2>Recent Activity</h2>
          </div>

          <div class="activity-list" v-if="dashboardStats?.recentActivity?.length > 0">
            <div v-for="activity in dashboardStats.recentActivity" :key="`${activity.type}-${activity.id}`" class="activity-item">
              <div class="activity-icon">
                {{ getActivityIcon(activity.type) }}
              </div>
              <div class="activity-content">
                <h4>{{ activity.name }}</h4>
                <p class="activity-type">{{ formatActivityType(activity.type) }}</p>
                <span :class="['status-badge', activity.status.toLowerCase()]">
                  {{ activity.status }}
                </span>
              </div>
              <div class="activity-time">
                {{ formatDate(activity.createdAt) }}
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <p>No recent activity found.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <CreateExportModal
      v-if="showCreateExportModal"
      @close="showCreateExportModal = false"
      @created="handleExportCreated"
    />

    <CreateImportModal
      v-if="showCreateImportModal"
      @close="showCreateImportModal = false"
      @created="handleImportCreated"
    />

    <CreateBackupModal
      v-if="showCreateBackupModal"
      @close="showCreateBackupModal = false"
      @created="handleBackupCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

// State
const activeTab = ref('exports')
const showCreateExportModal = ref(false)
const showCreateImportModal = ref(false)
const showCreateBackupModal = ref(false)
const dashboardStats = ref(null)
const exports = ref([])
const imports = ref([])
const backups = ref([])

// API composable
const { api } = useApi()

// Tabs configuration
const tabs = [
  { id: 'exports', name: 'Exports', icon: '📤' },
  { id: 'imports', name: 'Imports', icon: '📥' },
  { id: 'backups', name: 'Backups', icon: '💾' },
  { id: 'activity', name: 'Activity', icon: '📊' }
]

// Methods
const loadDashboard = async () => {
  try {
    const response = await api.get('/export-import/dashboard')
    dashboardStats.value = response.data
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  }
}

const loadExports = async () => {
  try {
    const response = await api.get('/export-import/exports')
    exports.value = response.data
  } catch (error) {
    console.error('Failed to load exports:', error)
  }
}

const loadImports = async () => {
  try {
    const response = await api.get('/export-import/imports')
    imports.value = response.data
  } catch (error) {
    console.error('Failed to load imports:', error)
  }
}

const loadBackups = async () => {
  try {
    const response = await api.get('/export-import/backups')
    backups.value = response.data
  } catch (error) {
    console.error('Failed to load backups:', error)
  }
}

const downloadExport = async (exportId) => {
  try {
    const response = await api.post(`/export-import/exports/${exportId}/download`, {}, {
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `export-${exportId}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error('Failed to download export:', error)
  }
}

const retryExport = async (exportId) => {
  try {
    await api.post(`/export-import/exports/${exportId}/retry`)
    await loadExports()
  } catch (error) {
    console.error('Failed to retry export:', error)
  }
}

const cancelExport = async (exportId) => {
  try {
    await api.post(`/export-import/exports/${exportId}/cancel`)
    await loadExports()
  } catch (error) {
    console.error('Failed to cancel export:', error)
  }
}

const deleteExport = async (exportId) => {
  if (!confirm('Are you sure you want to delete this export?')) return

  try {
    await api.delete(`/export-import/exports/${exportId}`)
    await loadExports()
    await loadDashboard()
  } catch (error) {
    console.error('Failed to delete export:', error)
  }
}

const startImport = async (importId) => {
  try {
    await api.post(`/export-import/imports/${importId}/start`)
    await loadImports()
  } catch (error) {
    console.error('Failed to start import:', error)
  }
}

const retryImport = async (importId) => {
  try {
    await api.post(`/export-import/imports/${importId}/retry`)
    await loadImports()
  } catch (error) {
    console.error('Failed to retry import:', error)
  }
}

const cancelImport = async (importId) => {
  try {
    await api.post(`/export-import/imports/${importId}/cancel`)
    await loadImports()
  } catch (error) {
    console.error('Failed to cancel import:', error)
  }
}

const deleteImport = async (importId) => {
  if (!confirm('Are you sure you want to delete this import?')) return

  try {
    await api.delete(`/export-import/imports/${importId}`)
    await loadImports()
    await loadDashboard()
  } catch (error) {
    console.error('Failed to delete import:', error)
  }
}

const downloadBackup = async (backupId) => {
  try {
    const response = await api.post(`/export-import/backups/${backupId}/download`, {}, {
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `backup-${backupId}.zip`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error('Failed to download backup:', error)
  }
}

const restoreBackup = async (backupId) => {
  if (!confirm('Are you sure you want to restore this backup? This will overwrite current data.')) return

  try {
    await api.post(`/export-import/backups/${backupId}/restore`)
    await loadBackups()
  } catch (error) {
    console.error('Failed to restore backup:', error)
  }
}

const verifyBackup = async (backupId) => {
  try {
    await api.post(`/export-import/backups/${backupId}/verify`)
    await loadBackups()
  } catch (error) {
    console.error('Failed to verify backup:', error)
  }
}

const cancelBackup = async (backupId) => {
  try {
    await api.post(`/export-import/backups/${backupId}/cancel`)
    await loadBackups()
  } catch (error) {
    console.error('Failed to cancel backup:', error)
  }
}

const deleteBackup = async (backupId) => {
  if (!confirm('Are you sure you want to delete this backup?')) return

  try {
    await api.delete(`/export-import/backups/${backupId}`)
    await loadBackups()
    await loadDashboard()
  } catch (error) {
    console.error('Failed to delete backup:', error)
  }
}

const handleExportCreated = async () => {
  showCreateExportModal.value = false
  await loadExports()
  await loadDashboard()
}

const handleImportCreated = async () => {
  showCreateImportModal.value = false
  await loadImports()
  await loadDashboard()
}

const handleBackupCreated = async () => {
  showCreateBackupModal.value = false
  await loadBackups()
  await loadDashboard()
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const getActivityIcon = (type) => {
  const icons = {
    export: '📤',
    import: '📥',
    backup: '💾'
  }
  return icons[type] || '📊'
}

const formatActivityType = (type) => {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadDashboard(),
    loadExports(),
    loadImports(),
    loadBackups()
  ])
})
</script>

<style scoped>
.export-import-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-header p {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.dashboard-overview {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-card h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.stat-numbers {
  text-align: center;
  margin-bottom: 1rem;
}

.stat-main {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.stat-breakdown {
  display: flex;
  justify-content: space-around;
  font-size: 0.8rem;
}

.stat-item {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.stat-item.completed { background: #d4edda; color: #155724; }
.stat-item.pending { background: #fff3cd; color: #856404; }
.stat-item.failed { background: #f8d7da; color: #721c24; }
.stat-item.verified { background: #d1ecf1; color: #0c5460; }

.quick-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.main-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.tabs {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  color: #6c757d;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.tab-btn.active {
  background: white;
  color: #3498db;
  border-bottom: 3px solid #3498db;
}

.tab-content {
  padding: 2rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.panel-header h2 {
  margin: 0;
  color: #2c3e50;
}

.export-card,
.import-card,
.backup-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-left: 4px solid #3498db;
}

.export-header,
.import-header,
.backup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.export-header h3,
.import-header h3,
.backup-header h3 {
  margin: 0;
  color: #2c3e50;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.completed { background: #d4edda; color: #155724; }
.status-badge.pending { background: #fff3cd; color: #856404; }
.status-badge.processing { background: #cce5ff; color: #004085; }
.status-badge.validating { background: #e2e3e5; color: #383d41; }
.status-badge.failed { background: #f8d7da; color: #721c24; }
.status-badge.cancelled { background: #f8d7da; color: #721c24; }
.status-badge.in_progress { background: #cce5ff; color: #004085; }
.status-badge.verified { background: #d1ecf1; color: #0c5460; }

.export-description,
.import-description,
.backup-description {
  color: #6c757d;
  margin-bottom: 1rem;
}

.export-details,
.import-details,
.backup-details {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.detail-item {
  font-size: 0.9rem;
}

.export-actions,
.import-actions,
.backup-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.btn-primary { background: #3498db; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.btn-success { background: #28a745; color: white; }
.btn-warning { background: #ffc107; color: #212529; }
.btn-danger { background: #dc3545; color: white; }
.btn-info { background: #17a2b8; color: white; }

.btn:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-icon {
  font-size: 1.5rem;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
}

.activity-type {
  margin: 0 0 0.5rem 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.activity-time {
  color: #6c757d;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .export-import-page {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    flex-direction: column;
  }

  .tabs {
    flex-direction: column;
  }

  .export-details,
  .import-details,
  .backup-details {
    flex-direction: column;
    gap: 0.5rem;
  }

  .export-actions,
  .import-actions,
  .backup-actions {
    flex-direction: column;
  }
}
</style>
