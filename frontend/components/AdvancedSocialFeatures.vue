<template>
  <div class="advanced-social-features">
    <div class="header">
      <h1>{{ $t('advancedSocial.title') }}</h1>
      <p>{{ $t('advancedSocial.description') }}</p>
    </div>

    <div class="overview-cards">
      <div class="card">
        <h3>{{ $t('advancedSocial.groups.title') }}</h3>
        <p>{{ $t('advancedSocial.groups.description') }}</p>
        <div class="stats">
          <span>{{ userGroups.length }} {{ $t('advancedSocial.groups.active') }}</span>
        </div>
      </div>

      <div class="card">
        <h3>{{ $t('advancedSocial.mentorship.title') }}</h3>
        <p>{{ $t('advancedSocial.mentorship.description') }}</p>
        <div class="stats">
          <span>{{ mentorshipStats.totalMentorships }} {{ $t('advancedSocial.mentorship.total') }}</span>
        </div>
      </div>

      <div class="card">
        <h3>{{ $t('advancedSocial.challenges.title') }}</h3>
        <p>{{ $t('advancedSocial.challenges.description') }}</p>
        <div class="stats">
          <span>{{ challengeStats.totalChallenges }} {{ $t('advancedSocial.challenges.active') }}</span>
        </div>
      </div>
    </div>

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

    <div class="tab-content">
      <!-- Habit Groups Tab -->
      <div v-if="activeTab === 'groups'" class="tab-panel">
        <div class="actions">
          <button @click="showCreateGroupModal = true" class="btn-primary">
            {{ $t('advancedSocial.groups.create') }}
          </button>
          <button @click="searchGroups" class="btn-secondary">
            {{ $t('advancedSocial.groups.search') }}
          </button>
        </div>

        <div class="groups-list">
          <div v-for="group in userGroups" :key="group.id" class="group-card">
            <h4>{{ group.name }}</h4>
            <p>{{ group.description }}</p>
            <div class="group-meta">
              <span>{{ group.currentMembers }}/{{ group.maxMembers }} {{ $t('advancedSocial.groups.members') }}</span>
              <span>{{ group.category }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mentorship Tab -->
      <div v-if="activeTab === 'mentorship'" class="tab-panel">
        <div class="actions">
          <button @click="showCreateMentorshipModal = true" class="btn-primary">
            {{ $t('advancedSocial.mentorship.create') }}
          </button>
          <button @click="searchMentors" class="btn-secondary">
            {{ $t('advancedSocial.mentorship.search') }}
          </button>
        </div>

        <div class="mentorship-list">
          <div v-for="mentorship in userMentorships" :key="mentorship.id" class="mentorship-card">
            <h4>{{ mentorship.type }}</h4>
            <p>{{ mentorship.description }}</p>
            <div class="mentorship-meta">
              <span>{{ mentorship.status }}</span>
              <span>{{ mentorship.level }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Challenges Tab -->
      <div v-if="activeTab === 'challenges'" class="tab-panel">
        <div class="actions">
          <button @click="showCreateChallengeModal = true" class="btn-primary">
            {{ $t('advancedSocial.challenges.create') }}
          </button>
          <button @click="searchChallenges" class="btn-secondary">
            {{ $t('advancedSocial.challenges.search') }}
          </button>
        </div>

        <div class="challenges-list">
          <div v-for="challenge in userChallenges" :key="challenge.id" class="challenge-card">
            <h4>{{ challenge.name }}</h4>
            <p>{{ challenge.description }}</p>
            <div class="challenge-meta">
              <span>{{ challenge.type }}</span>
              <span>{{ challenge.difficulty }}</span>
              <span>{{ challenge.currentParticipants }}/{{ challenge.maxParticipants }} {{ $t('advancedSocial.challenges.participants') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals would go here -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Reactive data
const activeTab = ref('groups')
const userGroups = ref([])
const userMentorships = ref([])
const userChallenges = ref([])
const mentorshipStats = ref({ totalMentorships: 0 })
const challengeStats = ref({ totalChallenges: 0 })

// Modal states
const showCreateGroupModal = ref(false)
const showCreateMentorshipModal = ref(false)
const showCreateChallengeModal = ref(false)

// Tabs configuration
const tabs = [
  { id: 'groups', label: t('advancedSocial.tabs.groups') },
  { id: 'mentorship', label: t('advancedSocial.tabs.mentorship') },
  { id: 'challenges', label: t('advancedSocial.tabs.challenges') }
]

// Methods
const fetchUserGroups = async () => {
  try {
    const response = await fetch('/api/advanced-social/groups', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    if (response.ok) {
      userGroups.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching groups:', error)
  }
}

const fetchUserMentorships = async () => {
  try {
    const response = await fetch('/api/advanced-social/mentorship', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    if (response.ok) {
      userMentorships.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching mentorships:', error)
  }
}

const fetchUserChallenges = async () => {
  try {
    const response = await fetch('/api/advanced-social/challenges', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    if (response.ok) {
      userChallenges.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching challenges:', error)
  }
}

const fetchStats = async () => {
  try {
    const [mentorshipResponse, challengeResponse] = await Promise.all([
      fetch('/api/advanced-social/mentorship/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }),
      fetch('/api/advanced-social/challenges/stats/user', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
    ])

    if (mentorshipResponse.ok) {
      mentorshipStats.value = await mentorshipResponse.json()
    }
    if (challengeResponse.ok) {
      challengeStats.value = await challengeResponse.json()
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const searchGroups = () => {
  // Implement group search functionality
}

const searchMentors = () => {
  // Implement mentor search functionality
}

const searchChallenges = () => {
  // Implement challenge search functionality
}

// Lifecycle
onMounted(() => {
  fetchUserGroups()
  fetchUserMentorships()
  fetchUserChallenges()
  fetchStats()
})
</script>

<style scoped lang="scss">
.advanced-social-features {
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
  }
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;

  h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  p {
    color: #7f8c8d;
    margin-bottom: 1.5rem;
  }

  .stats {
    font-weight: bold;
    color: #3498db;
  }
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e1e8ed;
}

.tab-button {
  padding: 1rem 2rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #7f8c8d;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;

  &.active {
    color: #3498db;
    border-bottom-color: #3498db;
  }

  &:hover {
    color: #3498db;
  }
}

.tab-content {
  min-height: 400px;
}

.tab-panel {
  .actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .btn-primary, .btn-secondary {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .btn-primary {
    background: #3498db;
    color: white;

    &:hover {
      background: #2980b9;
    }
  }

  .btn-secondary {
    background: #ecf0f1;
    color: #2c3e50;

    &:hover {
      background: #bdc3c7;
    }
  }
}

.groups-list, .mentorship-list, .challenges-list {
  display: grid;
  gap: 1.5rem;
}

.group-card, .mentorship-card, .challenge-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e1e8ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  h4 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  p {
    color: #7f8c8d;
    margin-bottom: 1rem;
  }

  .group-meta, .mentorship-meta, .challenge-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    color: #95a5a6;

    span {
      background: #f8f9fa;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
    }
  }
}
</style>
