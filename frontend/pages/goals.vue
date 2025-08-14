<template>
  <div class="goals-page">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">🎯 Advanced Goal Setting</h1>
      <p class="page-subtitle">Set SMART goals and track your progress with precision</p>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button @click="showCreateGoalModal = true" class="btn btn-primary">
        <i class="fas fa-plus"></i> Create New Goal
      </button>
      <button @click="showTemplatesModal = true" class="btn btn-secondary">
        <i class="fas fa-lightbulb"></i> Goal Templates
      </button>
      <button @click="showSuggestionsModal = true" class="btn btn-outline">
        <i class="fas fa-magic"></i> AI Suggestions
      </button>
    </div>

    <!-- Goal Analytics Overview -->
    <div class="analytics-section">
      <h2 class="section-title">Goal Analytics</h2>
      <div class="analytics-grid">
        <div class="analytics-card">
          <div class="analytics-icon">📊</div>
          <div class="analytics-content">
            <h3>Total Goals</h3>
            <p class="analytics-value">{{ analytics.totalGoals }}</p>
          </div>
        </div>
        <div class="analytics-card">
          <div class="analytics-icon">🚀</div>
          <div class="analytics-content">
            <h3>Active Goals</h3>
            <p class="analytics-value">{{ analytics.activeGoals }}</p>
          </div>
        </div>
        <div class="analytics-card">
          <div class="analytics-icon">✅</div>
          <div class="analytics-content">
            <h3>Completed</h3>
            <p class="analytics-value">{{ analytics.completedGoals }}</p>
          </div>
        </div>
        <div class="analytics-card">
          <div class="analytics-icon">📈</div>
          <div class="analytics-content">
            <h3>Avg Progress</h3>
            <p class="analytics-value">{{ analytics.averageProgress.toFixed(1) }}%</p>
          </div>
        </div>
        <div class="analytics-card">
          <div class="analytics-icon">🎯</div>
          <div class="analytics-content">
            <h3>On Track</h3>
            <p class="analytics-value">{{ analytics.onTrackGoals }}</p>
          </div>
        </div>
        <div class="analytics-card">
          <div class="analytics-icon">⚠️</div>
          <div class="analytics-content">
            <h3>Needs Attention</h3>
            <p class="analytics-value">{{ analytics.behindScheduleGoals }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Goals List -->
    <div class="goals-section">
      <div class="section-header">
        <h2 class="section-title">Your Goals</h2>
        <div class="filters">
          <select v-model="statusFilter" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select v-model="categoryFilter" class="filter-select">
            <option value="">All Categories</option>
            <option value="fitness">Fitness</option>
            <option value="learning">Learning</option>
            <option value="productivity">Productivity</option>
            <option value="wellness">Wellness</option>
            <option value="lifestyle">Lifestyle</option>
          </select>
          <select v-model="priorityFilter" class="filter-select">
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div v-if="filteredGoals.length === 0" class="empty-state">
        <div class="empty-icon">🎯</div>
        <h3>No goals yet</h3>
        <p>Start by creating your first SMART goal to begin your journey!</p>
        <button @click="showCreateGoalModal = true" class="btn btn-primary">
          Create Your First Goal
        </button>
      </div>

      <div v-else class="goals-grid">
        <div v-for="goal in filteredGoals" :key="goal.id" class="goal-card" :class="getGoalStatusClass(goal.status)">
          <div class="goal-header">
            <div class="goal-title-section">
              <h3 class="goal-title">{{ goal.title }}</h3>
              <div class="goal-meta">
                <span class="goal-category">{{ goal.category }}</span>
                <span class="goal-priority" :class="`priority-${goal.priority}`">
                  {{ goal.priority }}
                </span>
                <span class="goal-difficulty" :class="`difficulty-${goal.difficulty}`">
                  {{ goal.difficulty }}
                </span>
              </div>
            </div>
            <div class="goal-actions">
              <button @click="viewGoal(goal)" class="btn-icon" title="View Details">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="editGoal(goal)" class="btn-icon" title="Edit Goal">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="addProgress(goal)" class="btn-icon" title="Add Progress">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>

          <p v-if="goal.description" class="goal-description">{{ goal.description }}</p>

          <!-- SMART Goal Attributes -->
          <div class="smart-attributes">
            <div class="smart-attribute">
              <strong>S:</strong> {{ goal.specific }}
            </div>
            <div class="smart-attribute">
              <strong>M:</strong> {{ goal.measurable }}
            </div>
            <div class="smart-attribute">
              <strong>A:</strong> {{ goal.achievable }}
            </div>
            <div class="smart-attribute">
              <strong>R:</strong> {{ goal.relevant }}
            </div>
            <div class="smart-attribute">
              <strong>T:</strong> {{ goal.timeBound }}
            </div>
          </div>

          <!-- Progress Section -->
          <div class="goal-progress">
            <div class="progress-header">
              <span class="progress-label">Progress</span>
              <span class="progress-value">{{ goal.progressPercentage.toFixed(1) }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${goal.progressPercentage}%` }"
                :class="getProgressClass(goal.progressPercentage)"></div>
            </div>
            <div class="progress-details">
              <span>{{ goal.currentValue || 0 }} / {{ goal.targetValue || 'N/A' }}</span>
              <span class="goal-dates">
                {{ formatDate(goal.startDate) }} - {{ formatDate(goal.targetDate) }}
              </span>
            </div>
          </div>

          <!-- Milestones -->
          <div v-if="goal.milestones && goal.milestones.length > 0" class="milestones-section">
            <h4 class="milestones-title">Milestones</h4>
            <div class="milestones-list">
              <div v-for="milestone in goal.milestones" :key="milestone.id" class="milestone-item"
                :class="{ completed: milestone.isCompleted }">
                <div class="milestone-status">
                  <i v-if="milestone.isCompleted" class="fas fa-check-circle"></i>
                  <i v-else class="fas fa-circle"></i>
                </div>
                <div class="milestone-content">
                  <span class="milestone-title">{{ milestone.title }}</span>
                  <span class="milestone-value">{{ milestone.targetValue }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Goal Status Actions -->
          <div class="goal-status-actions">
            <button v-if="goal.status === 'active'" @click="pauseGoal(goal.id)" class="btn btn-warning btn-sm">
              Pause
            </button>
            <button v-if="goal.status === 'paused'" @click="resumeGoal(goal.id)" class="btn btn-success btn-sm">
              Resume
            </button>
            <button v-if="goal.status === 'active'" @click="completeGoal(goal.id)" class="btn btn-primary btn-sm">
              Complete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Goal Modal -->
    <div v-if="showCreateGoalModal" class="modal-overlay" @click="showCreateGoalModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Create New SMART Goal</h3>
          <button @click="showCreateGoalModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="createGoal" class="goal-form">
          <div class="form-group">
            <label>Goal Title *</label>
            <input v-model="newGoal.title" type="text" required class="form-input" />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newGoal.description" class="form-textarea"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Category *</label>
              <select v-model="newGoal.category" required class="form-select">
                <option value="">Select Category</option>
                <option value="fitness">Fitness</option>
                <option value="learning">Learning</option>
                <option value="productivity">Productivity</option>
                <option value="wellness">Wellness</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
            </div>
            <div class="form-group">
              <label>Type *</label>
              <select v-model="newGoal.type" required class="form-select">
                <option value="">Select Type</option>
                <option value="habit_based">Habit Based</option>
                <option value="numeric">Numeric</option>
                <option value="time_based">Time Based</option>
                <option value="milestone">Milestone</option>
                <option value="composite">Composite</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Difficulty *</label>
              <select v-model="newGoal.difficulty" required class="form-select">
                <option value="">Select Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div class="form-group">
              <label>Priority *</label>
              <select v-model="newGoal.priority" required class="form-select">
                <option value="">Select Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <!-- SMART Goal Attributes -->
          <div class="smart-goal-section">
            <h4>SMART Goal Attributes</h4>
            <div class="form-group">
              <label>Specific *</label>
              <textarea v-model="newGoal.specific" placeholder="What exactly do you want to achieve?" required
                class="form-textarea"></textarea>
            </div>
            <div class="form-group">
              <label>Measurable *</label>
              <textarea v-model="newGoal.measurable" placeholder="How will you measure progress?" required
                class="form-textarea"></textarea>
            </div>
            <div class="form-group">
              <label>Achievable *</label>
              <textarea v-model="newGoal.achievable" placeholder="Is this goal realistic?" required
                class="form-textarea"></textarea>
            </div>
            <div class="form-group">
              <label>Relevant *</label>
              <textarea v-model="newGoal.relevant" placeholder="Why is this goal important?" required
                class="form-textarea"></textarea>
            </div>
            <div class="form-group">
              <label>Time-bound *</label>
              <textarea v-model="newGoal.timeBound" placeholder="When do you want to achieve this?" required
                class="form-textarea"></textarea>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Start Date *</label>
              <input v-model="newGoal.startDate" type="date" required class="form-input" />
            </div>
            <div class="form-group">
              <label>Target Date *</label>
              <input v-model="newGoal.targetDate" type="date" required class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label>Target Value</label>
            <input v-model="newGoal.targetValue" type="number" class="form-input" />
          </div>

          <div class="form-group">
            <label>Motivation</label>
            <textarea v-model="newGoal.motivation" placeholder="Why does this goal matter to you?"
              class="form-textarea"></textarea>
          </div>

          <div class="form-group">
            <label>Tags</label>
            <input v-model="newGoal.tags" type="text" placeholder="fitness, health, motivation" class="form-input" />
          </div>

          <div class="form-actions">
            <button type="button" @click="showCreateGoalModal = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isCreating">
              {{ isCreating ? 'Creating...' : 'Create Goal' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Progress Modal -->
    <div v-if="showProgressModal" class="modal-overlay" @click="showProgressModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add Progress</h3>
          <button @click="showProgressModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="submitProgress" class="progress-form">
          <div class="form-group">
            <label>Goal</label>
            <input :value="selectedGoal?.title" type="text" disabled class="form-input" />
          </div>

          <div class="form-group">
            <label>Progress Value *</label>
            <input v-model="newProgress.value" type="number" step="0.01" required class="form-input" />
          </div>

          <div class="form-group">
            <label>Date</label>
            <input v-model="newProgress.date" type="date" class="form-input" />
          </div>

          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="newProgress.notes" class="form-textarea" placeholder="How did it go?"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Mood (1-10)</label>
              <input v-model="newProgress.mood" type="number" min="1" max="10" class="form-input" />
            </div>
            <div class="form-group">
              <label>Weather</label>
              <input v-model="newProgress.weather" type="text" class="form-input" placeholder="Sunny, Rainy, etc." />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="showProgressModal = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isAddingProgress">
              {{ isAddingProgress ? 'Adding...' : 'Add Progress' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

// State
const goals = ref([])
const analytics = ref({
  totalGoals: 0,
  activeGoals: 0,
  completedGoals: 0,
  averageProgress: 0,
  onTrackGoals: 0,
  behindScheduleGoals: 0,
  completionRate: 0,
  averageDaysToComplete: 0,
  topPerformingCategories: [],
  needsAttentionGoals: [],
})

const showCreateGoalModal = ref(false)
const showProgressModal = ref(false)
const selectedGoal = ref(null)
const isCreating = ref(false)
const isAddingProgress = ref(false)

// Filters
const statusFilter = ref('')
const categoryFilter = ref('')
const priorityFilter = ref('')

// New goal form
const newGoal = ref({
  title: '',
  description: '',
  category: '',
  type: '',
  difficulty: '',
  priority: '',
  specific: '',
  measurable: '',
  achievable: '',
  relevant: '',
  timeBound: '',
  targetValue: '',
  startDate: '',
  targetDate: '',
  motivation: '',
  tags: '',
})

// New progress form
const newProgress = ref({
  value: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
  mood: '',
  weather: '',
})

// Computed
const filteredGoals = computed(() => {
  return goals.value.filter(goal => {
    if (statusFilter.value && goal.status !== statusFilter.value) return false
    if (categoryFilter.value && goal.category !== categoryFilter.value) return false
    if (priorityFilter.value && goal.priority !== priorityFilter.value) return false
    return true
  })
})

// Methods
const loadGoals = async () => {
  try {
    const response = await fetch('/api/goals', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (response.ok) {
      goals.value = await response.json()
    }
  } catch (error) {
    console.error('Error loading goals:', error)
    toast.error('Failed to load goals')
  }
}

const loadAnalytics = async () => {
  try {
    const response = await fetch('/api/goals/analytics', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (response.ok) {
      analytics.value = await response.json()
    }
  } catch (error) {
    console.error('Error loading analytics:', error)
  }
}

const createGoal = async () => {
  try {
    isCreating.value = true

    const goalData = {
      ...newGoal.value,
      tags: newGoal.value.tags ? newGoal.value.tags.split(',').map(tag => tag.trim()) : [],
    }

    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(goalData),
    })

    if (response.ok) {
      const createdGoal = await response.json()
      goals.value.unshift(createdGoal)
      showCreateGoalModal.value = false
      resetNewGoalForm()
      await loadAnalytics()
      toast.success('Goal created successfully!')
    } else {
      const error = await response.json()
      toast.error(error.message || 'Failed to create goal')
    }
  } catch (error) {
    console.error('Error creating goal:', error)
    toast.error('Failed to create goal')
  } finally {
    isCreating.value = false
  }
}

const addProgress = (goal) => {
  selectedGoal.value = goal
  newProgress.value.value = goal.currentValue || 0
  showProgressModal.value = true
}

const submitProgress = async () => {
  try {
    isAddingProgress.value = true

    const progressData = {
      goalId: selectedGoal.value.id,
      ...newProgress.value,
    }

    const response = await fetch(`/api/goals/${selectedGoal.value.id}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(progressData),
    })

    if (response.ok) {
      const progress = await response.json()
      // Update goal progress in the list
      const goalIndex = goals.value.findIndex(g => g.id === selectedGoal.value.id)
      if (goalIndex !== -1) {
        goals.value[goalIndex].currentValue = progress.value
        goals.value[goalIndex].progressPercentage = (progress.value / goals.value[goalIndex].targetValue) * 100
      }

      showProgressModal.value = false
      resetNewProgressForm()
      await loadAnalytics()
      toast.success('Progress added successfully!')
    } else {
      const error = await response.json()
      toast.error(error.message || 'Failed to add progress')
    }
  } catch (error) {
    console.error('Error adding progress:', error)
    toast.error('Failed to add progress')
  } finally {
    isAddingProgress.value = false
  }
}

const completeGoal = async (goalId) => {
  try {
    const response = await fetch(`/api/goals/${goalId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (response.ok) {
      const updatedGoal = await response.json()
      const goalIndex = goals.value.findIndex(g => g.id === goalId)
      if (goalIndex !== -1) {
        goals.value[goalIndex] = updatedGoal
      }
      await loadAnalytics()
      toast.success('Goal completed! Congratulations!')
    }
  } catch (error) {
    console.error('Error completing goal:', error)
    toast.error('Failed to complete goal')
  }
}

const pauseGoal = async (goalId) => {
  try {
    const response = await fetch(`/api/goals/${goalId}/pause`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (response.ok) {
      const updatedGoal = await response.json()
      const goalIndex = goals.value.findIndex(g => g.id === goalId)
      if (goalIndex !== -1) {
        goals.value[goalIndex] = updatedGoal
      }
      toast.success('Goal paused')
    }
  } catch (error) {
    console.error('Error pausing goal:', error)
    toast.error('Failed to pause goal')
  }
}

const resumeGoal = async (goalId) => {
  try {
    const response = await fetch(`/api/goals/${goalId}/resume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (response.ok) {
      const updatedGoal = await response.json()
      const goalIndex = goals.value.findIndex(g => g.id === goalId)
      if (goalIndex !== -1) {
        goals.value[goalIndex] = updatedGoal
      }
      toast.success('Goal resumed')
    }
  } catch (error) {
    console.error('Error resuming goal:', error)
    toast.error('Failed to resume goal')
  }
}

const viewGoal = (goal) => {
  // Navigate to goal detail page
  console.log('View goal:', goal)
}

const editGoal = (goal) => {
  // Navigate to goal edit page
  console.log('Edit goal:', goal)
}

const resetNewGoalForm = () => {
  newGoal.value = {
    title: '',
    description: '',
    category: '',
    type: '',
    difficulty: '',
    priority: '',
    specific: '',
    measurable: '',
    achievable: '',
    relevant: '',
    timeBound: '',
    targetValue: '',
    startDate: '',
    targetDate: '',
    motivation: '',
    tags: '',
  }
}

const resetNewProgressForm = () => {
  newProgress.value = {
    value: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    mood: '',
    weather: '',
  }
}

const getGoalStatusClass = (status) => {
  return `status-${status}`
}

const getProgressClass = (progress) => {
  if (progress >= 80) return 'progress-excellent'
  if (progress >= 60) return 'progress-good'
  if (progress >= 40) return 'progress-average'
  if (progress >= 20) return 'progress-poor'
  return 'progress-very-poor'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadGoals()
  loadAnalytics()
})
</script>

<style scoped>
.goals-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.quick-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 40px;
  justify-content: center;
}

.analytics-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.analytics-card {
  background: var(--surface-color);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.analytics-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.analytics-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--primary-color);
}

.goals-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.filters {
  display: flex;
  gap: 10px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--surface-color);
  color: var(--text-primary);
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.goal-card {
  background: var(--surface-color);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--primary-color);
}

.goal-card.status-completed {
  border-left-color: var(--success-color);
}

.goal-card.status-paused {
  border-left-color: var(--warning-color);
}

.goal-card.status-cancelled {
  border-left-color: var(--error-color);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.goal-title {
  font-size: 1.3rem;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.goal-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.goal-category,
.goal-priority,
.goal-difficulty {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.goal-category {
  background: var(--primary-color);
  color: white;
}

.goal-priority.priority-high {
  background: var(--warning-color);
  color: white;
}

.goal-priority.priority-critical {
  background: var(--error-color);
  color: white;
}

.goal-difficulty.difficulty-expert {
  background: var(--error-color);
  color: white;
}

.goal-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--background-color);
  color: var(--primary-color);
}

.goal-description {
  color: var(--text-secondary);
  margin-bottom: 15px;
  line-height: 1.5;
}

.smart-attributes {
  background: var(--background-color);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.smart-attribute {
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.goal-progress {
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-label {
  font-weight: 500;
  color: var(--text-primary);
}

.progress-value {
  font-weight: bold;
  color: var(--primary-color);
}

.progress-bar {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.progress-fill.progress-excellent {
  background: var(--success-color);
}

.progress-fill.progress-good {
  background: var(--primary-color);
}

.progress-fill.progress-average {
  background: var(--warning-color);
}

.progress-fill.progress-poor {
  background: var(--error-color);
}

.progress-fill.progress-very-poor {
  background: #8b0000;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.milestones-section {
  margin-bottom: 20px;
}

.milestones-title {
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.milestone-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 6px;
  background: var(--background-color);
}

.milestone-item.completed {
  background: var(--success-color);
  color: white;
}

.milestone-status {
  color: var(--primary-color);
}

.milestone-item.completed .milestone-status {
  color: white;
}

.milestone-content {
  display: flex;
  justify-content: space-between;
  flex: 1;
}

.goal-status-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 10px;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

/* Modal Styles */
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
  background: var(--surface-color);
  border-radius: 12px;
  padding: 0;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: var(--background-color);
  color: var(--text-primary);
}

.goal-form,
.progress-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--surface-color);
  color: var(--text-primary);
  font-size: 1rem;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.smart-goal-section {
  background: var(--background-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.smart-goal-section h4 {
  color: var(--text-primary);
  margin-bottom: 15px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .goals-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filters {
    justify-content: center;
  }

  .quick-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
