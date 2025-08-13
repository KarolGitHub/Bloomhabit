<template>
  <div class="garden-dashboard">
    <!-- Header -->
    <header class="garden-header">
      <div class="grid-container">
        <div class="grid-x align-middle">
          <div class="cell medium-8">
            <h1 class="text-gradient text-4xl font-bold mb-2">🌱 Your Habit Garden</h1>
            <p class="text-gray-600 text-lg">Watch your habits bloom and grow</p>
          </div>
          <div class="cell medium-4 text-right">
            <div class="button-group">
              <button class="button primary large rounded" @click="showCreateHabit = true">
                <span class="mr-2">🌿</span> Plant New Habit
              </button>
              <NuxtLink to="/ai-gardener" class="button secondary large rounded">
                <span class="mr-2">🤖</span> AI Gardener
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Garden Stats -->
    <section class="garden-stats">
      <div class="grid-container">
        <div class="grid-x grid-margin-x">
          <div class="cell small-6 medium-3">
            <div class="callout garden-theme success text-center">
              <h3 class="text-2xl font-bold text-green-600">{{ stats.totalHabits || 0 }}</h3>
              <p class="text-sm text-gray-600">Total Habits</p>
            </div>
          </div>
          <div class="cell small-6 medium-3">
            <div class="callout garden-theme success text-center">
              <h3 class="text-2xl font-bold text-blue-600">{{ stats.activeHabits || 0 }}</h3>
              <p class="text-sm text-gray-600">Active</p>
            </div>
          </div>
          <div class="cell small-6 medium-3">
            <div class="callout garden-theme success text-center">
              <h3 class="text-2xl font-bold text-pink-600">{{ stats.bloomingHabits || 0 }}</h3>
              <p class="text-sm text-gray-600">Blooming</p>
            </div>
          </div>
          <div class="cell small-6 medium-3">
            <div class="text-center">
              <div class="habit-flower" :class="gardenMoodClass">
                <span class="text-4xl">{{ gardenMoodEmoji }}</span>
              </div>
              <p class="text-sm text-gray-600 mt-2">Garden Mood</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Garden Grid -->
    <section class="garden-grid">
      <div class="grid-container">
        <div class="grid-x grid-margin-x">
          <div class="cell" v-if="habits.length === 0">
            <div class="callout garden-theme text-center py-12">
              <div class="text-6xl mb-4">🌱</div>
              <h3 class="text-2xl font-bold text-gray-700 mb-2">Your garden is empty</h3>
              <p class="text-gray-600 mb-4">Start planting habits to see your garden grow!</p>
              <button class="button primary large rounded" @click="showCreateHabit = true">
                Plant Your First Habit
              </button>
            </div>
          </div>

          <div v-for="habit in habits" :key="habit.id" class="cell small-12 medium-6 large-4">
            <div class="garden-card foundation-grid">
              <div class="grid-x align-middle">
                <div class="cell medium-4 text-center">
                  <div class="habit-flower" :class="getFlowerStatus(habit)">
                    <span class="text-3xl">{{ getFlowerEmoji(habit.flowerType) }}</span>
                  </div>
                </div>
                <div class="cell medium-8">
                  <h3 class="text-xl font-bold text-gray-800 mb-2">{{ habit.title }}</h3>
                  <p class="text-gray-600 text-sm mb-3">{{ habit.description }}</p>

                  <!-- Progress Bar -->
                  <div class="progress" role="progressbar" tabindex="0" aria-valuenow="25" aria-valuemin="0"
                    aria-valuetext="25 percent" aria-label="Habit progress">
                    <div class="progress-meter" :style="{ width: `${habit.growthStage}%` }"></div>
                  </div>

                  <div class="grid-x grid-margin-x mt-3">
                    <div class="cell small-6">
                      <div class="text-center">
                        <div class="text-lg font-bold text-blue-600">{{ habit.currentStreak }}</div>
                        <div class="text-xs text-gray-500">Day Streak</div>
                      </div>
                    </div>
                    <div class="cell small-6">
                      <div class="text-center">
                        <div class="text-lg font-bold text-green-600">{{ habit.healthPoints }}%</div>
                        <div class="text-xs text-gray-500">Health</div>
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="grid-x grid-margin-x mt-4">
                    <div class="cell small-6">
                      <button class="button success small expanded" @click="completeHabit(habit.id)">
                        ✅ Complete
                      </button>
                    </div>
                    <div class="cell small-6">
                      <button class="button secondary small expanded" @click="waterHabit(habit.id)">
                        💧 Water
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Create Habit Modal -->
    <div class="reveal" id="createHabitModal" data-reveal v-if="showCreateHabit">
      <div class="reveal-header">
        <h3>🌿 Plant New Habit</h3>
        <button class="close-button" @click="showCreateHabit = false" aria-label="Close modal">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="reveal-content">
        <form @submit.prevent="createHabit">
          <div class="grid-x grid-margin-x">
            <div class="cell medium-6">
              <label class="form-label">Habit Title</label>
              <input type="text" class="form-input" v-model="newHabit.title" placeholder="e.g., Morning Exercise"
                required />
            </div>
            <div class="cell medium-6">
              <label class="form-label">Category</label>
              <select class="form-input" v-model="newHabit.category" required>
                <option value="">Select Category</option>
                <option value="HEALTH">Health & Fitness</option>
                <option value="PRODUCTIVITY">Productivity</option>
                <option value="LEARNING">Learning</option>
                <option value="MINDFULNESS">Mindfulness</option>
                <option value="RELATIONSHIPS">Relationships</option>
              </select>
            </div>
            <div class="cell medium-6">
              <label class="form-label">Frequency</label>
              <select class="form-input" v-model="newHabit.frequency" required>
                <option value="">Select Frequency</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
            <div class="cell medium-6">
              <label class="form-label">Flower Type</label>
              <select class="form-input" v-model="newHabit.flowerType" required>
                <option value="">Select Flower</option>
                <option value="ROSE">🌹 Rose</option>
                <option value="SUNFLOWER">🌻 Sunflower</option>
                <option value="TULIP">🌷 Tulip</option>
                <option value="DAISY">🌼 Daisy</option>
                <option value="LILY">🌸 Lily</option>
              </select>
            </div>
            <div class="cell">
              <label class="form-label">Description</label>
              <textarea class="form-input" v-model="newHabit.description" placeholder="Describe your habit..."
                rows="3"></textarea>
            </div>
            <div class="cell">
              <div class="grid-x grid-margin-x">
                <div class="cell medium-6">
                  <button type="submit" class="button primary expanded">
                    🌱 Plant Habit
                  </button>
                </div>
                <div class="cell medium-6">
                  <button type="button" class="button secondary expanded" @click="showCreateHabit = false">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Reactive data
const habits = ref([])
const stats = ref({})
const showCreateHabit = ref(false)
const newHabit = ref({
  title: '',
  description: '',
  category: '',
  frequency: '',
  flowerType: '',
  isPublic: false
})

// Computed properties
const gardenMoodClass = computed(() => {
  const mood = stats.value.gardenMood || 'empty'
  return {
    'blooming': mood === 'blooming',
    'growing': mood === 'growing',
    'stable': mood === 'stable',
    'wilting': mood === 'wilting'
  }
})

const gardenMoodEmoji = computed(() => {
  const mood = stats.value.gardenMood || 'empty'
  const emojis = {
    'blooming': '🌸',
    'growing': '🌱',
    'stable': '🌿',
    'wilting': '🥀',
    'empty': '🌱'
  }
  return emojis[mood]
})

// Methods
const getFlowerStatus = (habit) => {
  if (habit.growthStage >= 80 && habit.healthPoints >= 80) return 'blooming'
  if (habit.growthStage >= 50 && habit.healthPoints >= 50) return 'growing'
  if (habit.waterLevel < 30 || habit.healthPoints < 30) return 'wilting'
  return 'stable'
}

const getFlowerEmoji = (flowerType) => {
  const emojis = {
    'ROSE': '🌹',
    'SUNFLOWER': '🌻',
    'TULIP': '🌷',
    'DAISY': '🌼',
    'LILY': '🌸'
  }
  return emojis[flowerType] || '🌱'
}

const loadGardenData = async () => {
  try {
    // TODO: Replace with actual API calls
    // Mock data for now
    habits.value = [
      {
        id: 1,
        title: 'Morning Exercise',
        description: '30 minutes of cardio',
        category: 'HEALTH',
        frequency: 'DAILY',
        flowerType: 'ROSE',
        currentStreak: 7,
        growthStage: 85,
        healthPoints: 90,
        waterLevel: 95
      },
      {
        id: 2,
        title: 'Read Books',
        description: 'Read 20 pages daily',
        category: 'LEARNING',
        frequency: 'DAILY',
        flowerType: 'SUNFLOWER',
        currentStreak: 3,
        growthStage: 45,
        healthPoints: 70,
        waterLevel: 60
      }
    ]

    stats.value = {
      totalHabits: habits.value.length,
      activeHabits: habits.value.length,
      bloomingHabits: habits.value.filter(h => getFlowerStatus(h) === 'blooming').length,
      gardenMood: 'growing'
    }
  } catch (error) {
    console.error('Error loading garden data:', error)
  }
}

const createHabit = async () => {
  try {
    // TODO: Replace with actual API call
    console.log('Creating habit:', newHabit.value)

    // Reset form
    newHabit.value = {
      title: '',
      description: '',
      category: '',
      frequency: '',
      flowerType: '',
      isPublic: false
    }

    showCreateHabit.value = false
    await loadGardenData()
  } catch (error) {
    console.error('Error creating habit:', error)
  }
}

const completeHabit = async (habitId) => {
  try {
    // TODO: Replace with actual API call
    console.log('Completing habit:', habitId)
    await loadGardenData()
  } catch (error) {
    console.error('Error completing habit:', error)
  }
}

const waterHabit = async (habitId) => {
  try {
    // TODO: Replace with actual API call
    console.log('Watering habit:', habitId)
    await loadGardenData()
  } catch (error) {
    console.error('Error watering habit:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadGardenData()
})
</script>

<style scoped>
.garden-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 2rem 0;
}

.garden-header {
  margin-bottom: 3rem;
}

.garden-stats {
  margin-bottom: 3rem;
}

.garden-grid {
  margin-bottom: 3rem;
}

.garden-card {
  height: 100%;
  transition: transform 0.2s ease;
}

.garden-card:hover {
  transform: translateY(-4px);
}

.habit-flower {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.habit-flower.blooming {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  box-shadow: 0 8px 25px rgba(251, 191, 36, 0.3);
}

.habit-flower.growing {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.habit-flower.stable {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  box-shadow: 0 8px 25px rgba(107, 114, 128, 0.3);
}

.habit-flower.wilting {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
}

.progress {
  background-color: #e5e7eb;
  border-radius: 0.5rem;
  height: 0.5rem;
  margin-bottom: 1rem;
}

.progress-meter {
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 0.5rem;
  height: 100%;
  transition: width 0.3s ease;
}

/* Foundation overrides */
.reveal {
  border-radius: 1rem;
}

.reveal-header {
  background: linear-gradient(135deg, #22c55e, #a855f7);
  color: white;
  padding: 1.5rem;
  border-radius: 1rem 1rem 0 0;
}

.close-button {
  color: white;
  font-size: 1.5rem;
}

.close-button:hover {
  color: rgba(255, 255, 255, 0.8);
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}
</style>
