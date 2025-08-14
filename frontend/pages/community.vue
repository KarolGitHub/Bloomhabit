<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">🌱 Community Gardens</h1>
        <p class="text-lg text-gray-600">Grow together with friends and fellow habit enthusiasts</p>
      </div>

      <!-- Quick Actions -->
      <div class="flex flex-wrap gap-4 mb-8 justify-center">
        <button @click="showCreateGardenModal = true" class="button primary">
          🌱 Create Garden
        </button>
        <button @click="showCreateChallengeModal = true" class="button secondary">
          🏆 Create Challenge
        </button>
        <button @click="refreshData" class="button outline">
          🔄 Refresh
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input v-model="searchQuery" type="text" placeholder="Search gardens..."
              class="w-full border border-gray-300 rounded-lg px-3 py-2" @input="searchGardens" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select v-model="typeFilter" class="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="">All Types</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="invite_only">Invite Only</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <input v-model="tagsFilter" type="text" placeholder="Filter by tags..."
              class="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div class="flex items-end">
            <button @click="applyFilters" class="button primary w-full">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Community Gardens -->
      <div class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">Community Gardens</h2>

        <div v-if="loading" class="text-center py-8">
          <div class="text-2xl mb-4">🌱</div>
          <p>Loading gardens...</p>
        </div>

        <div v-else-if="gardens.length === 0" class="text-center py-8 text-gray-500">
          <div class="text-4xl mb-4">🌱</div>
          <p>No community gardens found</p>
          <p class="text-sm">Be the first to create one!</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="garden in gardens" :key="garden.id"
            class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold text-gray-900">{{ garden.name }}</h3>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getGardenTypeClass(garden.type)">
                  {{ garden.type }}
                </span>
              </div>

              <p class="text-gray-600 mb-4">{{ garden.description }}</p>

              <div class="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                <span>👥 {{ garden.memberCount }} members</span>
                <span>🌿 {{ garden.habitCount }} habits</span>
                <span>🔥 {{ garden.totalStreak }} streak</span>
              </div>

              <div v-if="garden.tags && garden.tags.length > 0" class="mb-4">
                <div class="flex flex-wrap gap-2">
                  <span v-for="tag in garden.tags.slice(0, 3)" :key="tag"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {{ tag }}
                  </span>
                  <span v-if="garden.tags.length > 3" class="text-xs text-gray-500">
                    +{{ garden.tags.length - 3 }} more
                  </span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-500">
                  by {{ garden.owner?.username || 'Unknown' }}
                </div>
                <div class="flex space-x-2">
                  <button v-if="!isMember(garden)" @click="joinGarden(garden.id)" class="button primary small">
                    Join
                  </button>
                  <button v-else @click="leaveGarden(garden.id)" class="button secondary small">
                    Leave
                  </button>
                  <NuxtLink :to="`/community/gardens/${garden.id}`" class="button outline small">
                    View
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Group Challenges -->
      <div class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">Active Challenges</h2>

        <div v-if="challengesLoading" class="text-center py-8">
          <div class="text-2xl mb-4">🏆</div>
          <p>Loading challenges...</p>
        </div>

        <div v-else-if="activeChallenges.length === 0" class="text-center py-8 text-gray-500">
          <div class="text-4xl mb-4">🏆</div>
          <p>No active challenges</p>
          <p class="text-sm">Create one to get started!</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="challenge in activeChallenges" :key="challenge.id"
            class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold text-gray-900">{{ challenge.title }}</h3>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getChallengeTypeClass(challenge.type)">
                  {{ challenge.type }}
                </span>
              </div>

              <p class="text-gray-600 mb-4">{{ challenge.description }}</p>

              <div class="space-y-2 mb-4 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">Target:</span>
                  <span class="font-medium">{{ challenge.targetValue }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Participants:</span>
                  <span class="font-medium">{{ challenge.participantCount }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Ends:</span>
                  <span class="font-medium">{{ formatDate(challenge.endDate) }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-500">
                  in {{ challenge.communityGarden?.name }}
                </div>
                <div class="flex space-x-2">
                  <button v-if="!isParticipating(challenge)" @click="joinChallenge(challenge.id)"
                    class="button primary small">
                    Join
                  </button>
                  <button v-else @click="leaveChallenge(challenge.id)" class="button secondary small">
                    Leave
                  </button>
                  <NuxtLink :to="`/community/challenges/${challenge.id}`" class="button outline small">
                    View
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Garden Modal -->
      <div v-if="showCreateGardenModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-xl font-semibold mb-4">Create Community Garden</h3>

          <form @submit.prevent="createGarden" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input v-model="newGarden.name" type="text" required
                class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Garden name" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea v-model="newGarden.description" required rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Describe your garden"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select v-model="newGarden.type" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="invite_only">Invite Only</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
              <input v-model="newGarden.tags" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="health, fitness, mindfulness" />
            </div>

            <div class="flex space-x-2">
              <button type="submit" class="button primary flex-1" :disabled="creatingGarden">
                {{ creatingGarden ? 'Creating...' : 'Create Garden' }}
              </button>
              <button type="button" @click="showCreateGardenModal = false" class="button secondary flex-1">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Create Challenge Modal -->
      <div v-if="showCreateChallengeModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-xl font-semibold mb-4">Create Group Challenge</h3>

          <form @submit.prevent="createChallenge" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input v-model="newChallenge.title" type="text" required
                class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Challenge title" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea v-model="newChallenge.description" required rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Describe your challenge"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select v-model="newChallenge.type" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="streak">Streak</option>
                <option value="completion">Completion</option>
                <option value="consistency">Consistency</option>
                <option value="growth">Growth</option>
                <option value="team">Team</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Target Value</label>
              <input v-model="newChallenge.targetValue" type="number" required min="1"
                class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="e.g., 30 days" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input v-model="newChallenge.startDate" type="date" required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input v-model="newChallenge.endDate" type="date" required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
            </div>

            <div class="flex space-x-2">
              <button type="submit" class="button primary flex-1" :disabled="creatingChallenge">
                {{ creatingChallenge ? 'Creating...' : 'Create Challenge' }}
              </button>
              <button type="button" @click="showCreateChallengeModal = false" class="button secondary flex-1">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $api } = useNuxtApp()

// Reactive data
const gardens = ref([])
const activeChallenges = ref([])
const loading = ref(false)
const challengesLoading = ref(false)
const creatingGarden = ref(false)
const creatingChallenge = ref(false)
const showCreateGardenModal = ref(false)
const showCreateChallengeModal = ref(false)

// Filters
const searchQuery = ref('')
const typeFilter = ref('')
const tagsFilter = ref('')

// New garden/challenge forms
const newGarden = ref({
  name: '',
  description: '',
  type: 'public',
  tags: '',
})

const newChallenge = ref({
  title: '',
  description: '',
  type: 'streak',
  targetValue: 30,
  startDate: '',
  endDate: '',
  communityGardenId: 1, // Default to first garden for now
})

// Methods
const loadGardens = async () => {
  try {
    loading.value = true
    const response = await $api.get('/community/gardens')
    gardens.value = response.data.gardens
  } catch (error) {
    console.error('Failed to load gardens:', error)
  } finally {
    loading.value = false
  }
}

const loadChallenges = async () => {
  try {
    challengesLoading.value = true
    const response = await $api.get('/community/challenges/active')
    activeChallenges.value = response.data
  } catch (error) {
    console.error('Failed to load challenges:', error)
  } finally {
    challengesLoading.value = false
  }
}

const searchGardens = async () => {
  if (!searchQuery.value.trim()) {
    await loadGardens()
    return
  }

  try {
    loading.value = true
    const response = await $api.get(`/community/gardens/search?q=${encodeURIComponent(searchQuery.value)}`)
    gardens.value = response.data.gardens
  } catch (error) {
    console.error('Failed to search gardens:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams()
    if (typeFilter.value) params.append('type', typeFilter.value)
    if (tagsFilter.value) params.append('tags', tagsFilter.value)

    const response = await $api.get(`/community/gardens?${params.toString()}`)
    gardens.value = response.data.gardens
  } catch (error) {
    console.error('Failed to apply filters:', error)
  } finally {
    loading.value = false
  }
}

const createGarden = async () => {
  try {
    creatingGarden.value = true

    const gardenData = {
      ...newGarden.value,
      tags: newGarden.value.tags ? newGarden.value.tags.split(',').map(t => t.trim()) : [],
    }

    await $api.post('/community/gardens', gardenData)

    // Reset form and close modal
    newGarden.value = { name: '', description: '', type: 'public', tags: '' }
    showCreateGardenModal.value = false

    // Refresh data
    await loadGardens()

    // Show success message
    alert('Garden created successfully!')
  } catch (error) {
    console.error('Failed to create garden:', error)
    alert('Failed to create garden: ' + error.message)
  } finally {
    creatingGarden.value = false
  }
}

const createChallenge = async () => {
  try {
    creatingChallenge.value = true

    const challengeData = {
      ...newChallenge.value,
      startDate: new Date(newChallenge.value.startDate).toISOString(),
      endDate: new Date(newChallenge.value.endDate).toISOString(),
    }

    await $api.post('/community/challenges', challengeData)

    // Reset form and close modal
    newChallenge.value = { title: '', description: '', type: 'streak', targetValue: 30, startDate: '', endDate: '', communityGardenId: 1 }
    showCreateChallengeModal.value = false

    // Refresh data
    await loadChallenges()

    // Show success message
    alert('Challenge created successfully!')
  } catch (error) {
    console.error('Failed to create challenge:', error)
    alert('Failed to create challenge: ' + error.message)
  } finally {
    creatingChallenge.value = false
  }
}

const joinGarden = async (gardenId) => {
  try {
    await $api.post(`/community/gardens/${gardenId}/join`)
    await loadGardens()
    alert('Successfully joined garden!')
  } catch (error) {
    console.error('Failed to join garden:', error)
    alert('Failed to join garden: ' + error.message)
  }
}

const leaveGarden = async (gardenId) => {
  try {
    await $api.post(`/community/gardens/${gardenId}/leave`)
    await loadGardens()
    alert('Successfully left garden!')
  } catch (error) {
    console.error('Failed to leave garden:', error)
    alert('Failed to leave garden: ' + error.message)
  }
}

const joinChallenge = async (challengeId) => {
  try {
    await $api.post(`/community/challenges/${challengeId}/join`)
    await loadChallenges()
    alert('Successfully joined challenge!')
  } catch (error) {
    console.error('Failed to join challenge:', error)
    alert('Failed to join challenge: ' + error.message)
  }
}

const leaveChallenge = async (challengeId) => {
  try {
    await $api.post(`/community/challenges/${challengeId}/leave`)
    await loadChallenges()
    alert('Successfully left challenge!')
  } catch (error) {
    console.error('Failed to leave challenge:', error)
    alert('Failed to leave challenge: ' + error.message)
  }
}

const refreshData = async () => {
  await Promise.all([loadGardens(), loadChallenges()])
}

const isMember = (garden) => {
  // This would need to be implemented based on actual user membership data
  return false
}

const isParticipating = (challenge) => {
  // This would need to be implemented based on actual participation data
  return false
}

const getGardenTypeClass = (type) => {
  const classes = {
    public: 'bg-green-100 text-green-800',
    private: 'bg-red-100 text-red-800',
    invite_only: 'bg-yellow-100 text-yellow-800',
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getChallengeTypeClass = (type) => {
  const classes = {
    streak: 'bg-blue-100 text-blue-800',
    completion: 'bg-green-100 text-green-800',
    consistency: 'bg-purple-100 text-purple-800',
    growth: 'bg-orange-100 text-orange-800',
    team: 'bg-pink-100 text-pink-800',
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

// Lifecycle
onMounted(async () => {
  await Promise.all([loadGardens(), loadChallenges()])

  // Set default dates for challenge form
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  newChallenge.value.startDate = today.toISOString().split('T')[0]
  newChallenge.value.endDate = nextWeek.toISOString().split('T')[0]
})
</script>
