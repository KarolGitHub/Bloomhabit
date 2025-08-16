<template>
  <div class="garden-visualization-page">
    <div class="page-header">
      <h1 class="page-title">🌸 Advanced Garden Visualization</h1>
      <p class="page-description">
        Create stunning 3D gardens with custom themes, layouts, and immersive experiences
      </p>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button @click="showCreateThemeModal = true" class="action-btn primary">
        🎨 Create Theme
      </button>
      <button @click="showCreateLayoutModal = true" class="action-btn secondary">
        🏗️ Design Layout
      </button>
      <button @click="showCreate3dViewModal = true" class="action-btn secondary">
        🎥 3D View
      </button>
      <button @click="showShareModal = true" class="action-btn secondary">
        📤 Share Garden
      </button>
    </div>

    <!-- Dashboard Overview -->
    <div class="dashboard-overview">
      <div class="overview-card">
        <h3>🎨 Themes</h3>
        <p class="count">{{ dashboardStats.totalThemes }}</p>
        <p class="label">Available</p>
      </div>
      <div class="overview-card">
        <h3>🏗️ Layouts</h3>
        <p class="count">{{ dashboardStats.totalLayouts }}</p>
        <p class="label">Created</p>
      </div>
      <div class="overview-card">
        <h3>🎥 3D Views</h3>
        <p class="count">{{ dashboardStats.totalViews }}</p>
        <p class="label">Configured</p>
      </div>
      <div class="overview-card">
        <h3>📤 Shares</h3>
        <p class="count">{{ dashboardStats.totalShares }}</p>
        <p class="label">Published</p>
      </div>
    </div>

    <!-- Main Content Tabs -->
    <div class="content-tabs">
      <div class="tab-buttons">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
        >
          {{ tab.icon }} {{ tab.name }}
        </button>
      </div>

      <div class="tab-content">
        <!-- Themes Tab -->
        <div v-if="activeTab === 'themes'" class="tab-panel">
          <GardenThemes
            :themes="dashboardData.themes"
            @create-theme="showCreateThemeModal = true"
            @edit-theme="editTheme"
          />
        </div>

        <!-- Layouts Tab -->
        <div v-if="activeTab === 'layouts'" class="tab-panel">
          <GardenLayouts
            :layouts="dashboardData.layouts"
            @create-layout="showCreateThemeModal = true"
            @edit-layout="editLayout"
          />
        </div>

        <!-- 3D Views Tab -->
        <div v-if="activeTab === '3d-views'" class="tab-panel">
          <Garden3dViews
            :views="dashboardData.views"
            @create-view="showCreate3dViewModal = true"
            @edit-view="edit3dView"
          />
        </div>

        <!-- Sharing Tab -->
        <div v-if="activeTab === 'sharing'" class="tab-panel">
          <GardenSharing
            :shares="dashboardData.shares"
            @create-share="showShareModal = true"
            @edit-share="editShare"
          />
        </div>

        <!-- Explore Tab -->
        <div v-if="activeTab === 'explore'" class="tab-panel">
          <GardenExplore
            :explore-data="exploreData"
            @view-item="viewItem"
          />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <CreateThemeModal
      v-if="showCreateThemeModal"
      @close="showCreateThemeModal = false"
      @created="themeCreated"
    />

    <CreateLayoutModal
      v-if="showCreateLayoutModal"
      @close="showCreateLayoutModal = false"
      @created="layoutCreated"
    />

    <Create3dViewModal
      v-if="showCreate3dViewModal"
      @close="showCreate3dViewModal = false"
      @created="viewCreated"
    />

    <ShareGardenModal
      v-if="showShareModal"
      @close="showShareModal = false"
      @created="shareCreated"
    />

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading garden visualization...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import GardenThemes from '~/components/garden-visualization/GardenThemes.vue'
import GardenLayouts from '~/components/garden-visualization/GardenLayouts.vue'
import Garden3dViews from '~/components/garden-visualization/Garden3dViews.vue'
import GardenSharing from '~/components/garden-visualization/GardenSharing.vue'
import GardenExplore from '~/components/garden-visualization/GardenExplore.vue'
import CreateThemeModal from '~/components/garden-visualization/CreateThemeModal.vue'
import CreateLayoutModal from '~/components/garden-visualization/CreateLayoutModal.vue'
import Create3dViewModal from '~/components/garden-visualization/Create3dViewModal.vue'
import ShareGardenModal from '~/components/garden-visualization/ShareGardenModal.vue'

// State
const loading = ref(false)
const activeTab = ref('themes')
const showCreateThemeModal = ref(false)
const showCreateLayoutModal = ref(false)
const showCreate3dViewModal = ref(false)
const showShareModal = ref(false)

// Data
const dashboardData = ref({
  themes: [],
  layouts: [],
  views: [],
  shares: []
})

const exploreData = ref({
  themes: [],
  layouts: [],
  views: [],
  shares: []
})

const dashboardStats = ref({
  totalThemes: 0,
  totalLayouts: 0,
  totalViews: 0,
  totalShares: 0
})

// API
const { api } = useApi()

// Tabs configuration
const tabs = [
  { id: 'themes', name: 'Themes', icon: '🎨' },
  { id: 'layouts', name: 'Layouts', icon: '🏗️' },
  { id: '3d-views', name: '3D Views', icon: '🎥' },
  { id: 'sharing', name: 'Sharing', icon: '📤' },
  { id: 'explore', name: 'Explore', icon: '🔍' }
]

// Methods
const loadDashboard = async () => {
  try {
    loading.value = true
    const response = await api.get('/garden-visualization/dashboard')
    dashboardData.value = response.data
    dashboardStats.value = response.data.stats
  } catch (error) {
    console.error('Error loading dashboard:', error)
  } finally {
    loading.value = false
  }
}

const loadExploreData = async () => {
  try {
    const response = await api.get('/garden-visualization/explore')
    exploreData.value = response.data
  } catch (error) {
    console.error('Error loading explore data:', error)
  }
}

const editTheme = (theme: any) => {
  // Handle theme editing
  console.log('Edit theme:', theme)
}

const editLayout = (layout: any) => {
  // Handle layout editing
  console.log('Edit layout:', layout)
}

const edit3dView = (view: any) => {
  // Handle 3D view editing
  console.log('Edit 3D view:', view)
}

const editShare = (share: any) => {
  // Handle share editing
  console.log('Edit share:', share)
}

const viewItem = (item: any) => {
  // Handle item viewing
  console.log('View item:', item)
}

const themeCreated = () => {
  showCreateThemeModal.value = false
  loadDashboard()
}

const layoutCreated = () => {
  showCreateLayoutModal.value = false
  loadDashboard()
}

const viewCreated = () => {
  showCreate3dViewModal.value = false
  loadDashboard()
}

const shareCreated = () => {
  showShareModal.value = false
  loadDashboard()
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadDashboard(),
    loadExploreData()
  ])
})
</script>

<style scoped lang="scss">
.garden-visualization-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;

  .page-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: 0.5rem;
  }

  .page-description {
    font-size: 1.1rem;
    color: var(--color-text-secondary);
    max-width: 600px;
    margin: 0 auto;
  }
}

.quick-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;

  .action-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &.primary {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      color: white;
      box-shadow: 0 4px 15px rgba(var(--color-primary-rgb), 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(var(--color-primary-rgb), 0.4);
      }
    }

    &.secondary {
      background: var(--color-surface);
      color: var(--color-text);
      border: 2px solid var(--color-border);

      &:hover {
        background: var(--color-surface-hover);
        border-color: var(--color-primary);
      }
    }
  }
}

.dashboard-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;

  .overview-card {
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      border-color: var(--color-primary);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    h3 {
      font-size: 1.1rem;
      color: var(--color-text-secondary);
      margin-bottom: 0.5rem;
    }

    .count {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--color-primary);
      margin-bottom: 0.25rem;
    }

    .label {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
}

.content-tabs {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 20px;
  overflow: hidden;

  .tab-buttons {
    display: flex;
    background: var(--color-surface-secondary);
    border-bottom: 2px solid var(--color-border);

    .tab-btn {
      flex: 1;
      padding: 1rem 1.5rem;
      border: none;
      background: none;
      color: var(--color-text-secondary);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      border-bottom: 3px solid transparent;

      &:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
      }

      &.active {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
        background: var(--color-surface);
      }
    }
  }

  .tab-content {
    padding: 2rem;

    .tab-panel {
      min-height: 400px;
    }
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--color-border);
    border-top: 4px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  p {
    color: var(--color-text-secondary);
    font-size: 1.1rem;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Responsive Design
@media (max-width: 768px) {
  .garden-visualization-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem !important;
  }

  .quick-actions {
    flex-direction: column;
    align-items: center;

    .action-btn {
      width: 100%;
      max-width: 300px;
    }
  }

  .dashboard-overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .content-tabs {
    .tab-buttons {
      flex-direction: column;

      .tab-btn {
        border-bottom: none;
        border-right: 3px solid transparent;

        &.active {
          border-right-color: var(--color-primary);
          border-bottom-color: transparent;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .dashboard-overview {
    grid-template-columns: 1fr;
  }
}
</style>
