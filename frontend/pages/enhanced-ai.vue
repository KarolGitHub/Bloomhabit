<template>
  <div class="enhanced-ai-page">
    <!-- Header Section -->
    <div class="header-section">
      <h1 class="page-title">🤖 Enhanced AI Features</h1>
      <p class="page-subtitle">
        Experience the future of habit tracking with AI-powered natural language processing,
        image recognition, voice commands, and intelligent reminders.
      </p>
    </div>

    <!-- Dashboard Overview -->
    <div class="dashboard-overview" v-if="dashboardData">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">💬</div>
          <div class="stat-content">
            <div class="stat-number">{{ dashboardData.overview.totalChats }}</div>
            <div class="stat-label">AI Chats</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📸</div>
          <div class="stat-content">
            <div class="stat-number">{{ dashboardData.overview.totalImages }}</div>
            <div class="stat-label">Images Analyzed</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎤</div>
          <div class="stat-content">
            <div class="stat-number">{{ dashboardData.overview.totalVoiceCommands }}</div>
            <div class="stat-label">Voice Commands</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <div class="stat-number">{{ dashboardData.overview.totalReminders }}</div>
            <div class="stat-label">Smart Reminders</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Feature Tabs -->
    <div class="feature-tabs">
      <div class="tab-buttons">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- AI Chat Tab -->
      <div v-if="activeTab === 'chat'" class="tab-content">
        <div class="chat-interface">
          <div class="chat-sessions">
            <h3>💬 Chat Sessions</h3>
            <div class="session-list">
              <div
                v-for="session in dashboardData?.recentActivity.chats"
                :key="session.id"
                class="session-item"
                @click="selectChatSession(session)"
              >
                <div class="session-title">{{ session.title }}</div>
                <div class="session-context">{{ session.primaryContext }}</div>
                <div class="session-date">{{ formatDate(session.lastActivityAt) }}</div>
              </div>
            </div>
            <button class="new-session-btn" @click="showNewSessionModal = true">
              + New Chat Session
            </button>
          </div>

          <div class="chat-messages" v-if="selectedSession">
            <div class="chat-header">
              <h4>{{ selectedSession.title }}</h4>
              <button class="close-chat" @click="selectedSession = null">×</button>
            </div>
            <div class="messages-container">
              <div
                v-for="message in selectedSession.messages"
                :key="message.id"
                :class="['message', message.messageType.toLowerCase()]"
              >
                <div class="message-content">{{ message.message }}</div>
                <div class="message-time">{{ formatDate(message.createdAt) }}</div>
                <div v-if="message.aiResponse" class="ai-response">
                  <strong>AI Response:</strong> {{ message.aiResponse }}
                </div>
              </div>
            </div>
            <div class="chat-input">
              <input
                v-model="newMessage"
                placeholder="Ask your AI Gardener anything..."
                @keyup.enter="sendMessage"
              />
              <button @click="sendMessage">Send</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Recognition Tab -->
      <div v-if="activeTab === 'images'" class="tab-content">
        <div class="image-upload-section">
          <h3>📸 Analyze Images</h3>
          <div class="upload-area">
            <input
              type="file"
              ref="imageInput"
              accept="image/*"
              @change="handleImageUpload"
              style="display: none"
            />
            <div class="upload-placeholder" @click="$refs.imageInput.click()">
              <div class="upload-icon">📸</div>
              <div class="upload-text">Click to upload an image</div>
              <div class="upload-hint">Supports JPG, PNG, GIF up to 10MB</div>
            </div>
          </div>
        </div>

        <div class="image-analysis-results">
          <h3>Recent Image Analysis</h3>
          <div class="image-grid">
            <div
              v-for="image in dashboardData?.recentActivity.images"
              :key="image.id"
              class="image-result-card"
            >
              <div class="image-preview">
                <img :src="image.imageUrl" :alt="image.description || 'Uploaded image'" />
                <div class="image-status" :class="image.status.toLowerCase()">
                  {{ image.status }}
                </div>
              </div>
              <div class="image-details">
                <div class="image-type">{{ image.imageType }}</div>
                <div v-if="image.aiAnalysis" class="ai-analysis">
                  {{ image.aiAnalysis }}
                </div>
                <div v-if="image.confidence" class="confidence">
                  Confidence: {{ (image.confidence * 100).toFixed(1) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Voice Commands Tab -->
      <div v-if="activeTab === 'voice'" class="tab-content">
        <div class="voice-interface">
          <h3>🎤 Voice Commands</h3>
          <div class="voice-controls">
            <button
              :class="['voice-btn', { recording: isRecording }]"
              @click="toggleRecording"
            >
              {{ isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording' }}
            </button>
            <div v-if="isRecording" class="recording-indicator">
              Recording... Speak now!
            </div>
          </div>

          <div class="voice-suggestions">
            <h4>Voice Command Examples</h4>
            <div class="suggestion-grid">
              <div
                v-for="suggestion in voiceSuggestions"
                :key="suggestion"
                class="suggestion-item"
                @click="useVoiceSuggestion(suggestion)"
              >
                "{{ suggestion }}"
              </div>
            </div>
          </div>

          <div class="voice-history">
            <h4>Recent Voice Commands</h4>
            <div class="voice-commands-list">
              <div
                v-for="command in dashboardData?.recentActivity.voiceCommands"
                :key="command.id"
                class="voice-command-item"
              >
                <div class="command-type">{{ command.commandType }}</div>
                <div v-if="command.transcript" class="transcript">
                  "{{ command.transcript }}"
                </div>
                <div v-if="command.aiInterpretation" class="interpretation">
                  {{ command.aiInterpretation }}
                </div>
                <div class="command-status" :class="command.status.toLowerCase()">
                  {{ command.status }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Smart Reminders Tab -->
      <div v-if="activeTab === 'reminders'" class="tab-content">
        <div class="reminders-interface">
          <div class="reminders-header">
            <h3>⏰ Smart Reminders</h3>
            <button class="new-reminder-btn" @click="showNewReminderModal = true">
              + New Reminder
            </button>
          </div>

          <div class="reminders-list">
            <div
              v-for="reminder in dashboardData?.recentActivity.reminders"
              :key="reminder.id"
              class="reminder-item"
            >
              <div class="reminder-content">
                <div class="reminder-title">{{ reminder.title }}</div>
                <div class="reminder-message">{{ reminder.message }}</div>
                <div class="reminder-meta">
                  <span class="reminder-type">{{ reminder.reminderType }}</span>
                  <span class="reminder-priority" :class="reminder.priority.toLowerCase()">
                    {{ reminder.priority }}
                  </span>
                  <span class="reminder-time">{{ formatDate(reminder.scheduledAt) }}</span>
                </div>
              </div>
              <div class="reminder-actions">
                <button
                  v-if="reminder.status === 'SCHEDULED'"
                  @click="cancelReminder(reminder.id)"
                  class="cancel-btn"
                >
                  Cancel
                </button>
                <div class="reminder-status" :class="reminder.status.toLowerCase()">
                  {{ reminder.status }}
                </div>
              </div>
            </div>
          </div>

          <div class="ai-optimization">
            <h4>🤖 AI Optimization Insights</h4>
            <div class="optimization-cards">
              <div class="optimization-card">
                <div class="optimization-title">Timing Analysis</div>
                <div class="optimization-content">
                  AI analyzes your behavior patterns to suggest optimal reminder times
                </div>
              </div>
              <div class="optimization-card">
                <div class="optimization-title">Engagement Patterns</div>
                <div class="optimization-content">
                  Learn when you're most likely to act on reminders
                </div>
              </div>
              <div class="optimization-card">
                <div class="optimization-title">Personalization</div>
                <div class="optimization-content">
                  Reminders adapt to your schedule and preferences
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <div v-if="showNewSessionModal" class="modal-overlay" @click="showNewSessionModal = false">
      <div class="modal" @click.stop>
        <h3>New Chat Session</h3>
        <input v-model="newSessionTitle" placeholder="Session title" />
        <select v-model="newSessionContext">
          <option value="GENERAL">General</option>
          <option value="HABIT_QUESTION">Habit Question</option>
          <option value="GARDEN_HELP">Garden Help</option>
          <option value="MOTIVATION">Motivation</option>
          <option value="GOAL_PLANNING">Goal Planning</option>
        </select>
        <div class="modal-actions">
          <button @click="createNewSession">Create</button>
          <button @click="showNewSessionModal = false">Cancel</button>
        </div>
      </div>
    </div>

    <div v-if="showNewReminderModal" class="modal-overlay" @click="showNewReminderModal = false">
      <div class="modal" @click.stop>
        <h3>New Smart Reminder</h3>
        <input v-model="newReminderTitle" placeholder="Reminder title" />
        <textarea v-model="newReminderMessage" placeholder="Reminder message"></textarea>
        <select v-model="newReminderType">
          <option value="HABIT_REMINDER">Habit Reminder</option>
          <option value="GOAL_REMINDER">Goal Reminder</option>
          <option value="MOTIVATION">Motivation</option>
          <option value="PROGRESS_CHECK">Progress Check</option>
          <option value="GARDEN_UPDATE">Garden Update</option>
        </select>
        <select v-model="newReminderFrequency">
          <option value="ONCE">Once</option>
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
        </select>
        <div class="modal-actions">
          <button @click="createNewReminder">Create</button>
          <button @click="showNewReminderModal = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

// Reactive data
const activeTab = ref('chat')
const dashboardData = ref(null)
const selectedSession = ref(null)
const newMessage = ref('')
const isRecording = ref(false)
const showNewSessionModal = ref(false)
const showNewReminderModal = ref(false)
const newSessionTitle = ref('')
const newSessionContext = ref('GENERAL')
const newReminderTitle = ref('')
const newReminderMessage = ref('')
const newReminderType = ref('HABIT_REMINDER')
const newReminderFrequency = ref('ONCE')

// Voice suggestions
const voiceSuggestions = ref([
  "I completed my morning workout",
  "Create a new habit for reading",
  "Show me my garden progress",
  "What should I focus on today?",
  "Give me some motivation"
])

// Tab configuration
const tabs = [
  { id: 'chat', label: 'AI Chat', icon: '💬' },
  { id: 'images', label: 'Image Recognition', icon: '📸' },
  { id: 'voice', label: 'Voice Commands', icon: '🎤' },
  { id: 'reminders', label: 'Smart Reminders', icon: '⏰' }
]

// API composable
const { api } = useApi()

// Methods
const loadDashboard = async () => {
  try {
    const response = await api.get('/ai-enhanced/dashboard')
    dashboardData.value = response.data
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  }
}

const selectChatSession = (session) => {
  selectedSession.value = session
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedSession.value) return

  try {
    const response = await api.post('/ai-enhanced/chat', {
      message: newMessage.value,
      contextType: selectedSession.value.primaryContext
    })

    // Refresh the session to get the AI response
    await loadDashboard()
    newMessage.value = ''
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const formData = new FormData()
    formData.append('image', file)

    const response = await api.post('/ai-enhanced/upload/image', formData)

    // Create image recognition entry
    await api.post('/ai-enhanced/image-recognition', {
      imageUrl: response.data.imageUrl,
      imageType: 'GENERAL'
    })

    // Refresh dashboard
    await loadDashboard()
  } catch (error) {
    console.error('Failed to upload image:', error)
  }
}

const toggleRecording = () => {
  isRecording.value = !isRecording.value
  // In a real implementation, this would handle actual voice recording
}

const useVoiceSuggestion = (suggestion) => {
  newMessage.value = suggestion
}

const createNewSession = async () => {
  try {
    await api.post('/ai-enhanced/chat/sessions', {
      title: newSessionTitle.value,
      primaryContext: newSessionContext.value
    })

    showNewSessionModal.value = false
    newSessionTitle.value = ''
    await loadDashboard()
  } catch (error) {
    console.error('Failed to create session:', error)
  }
}

const createNewReminder = async () => {
  try {
    await api.post('/ai-enhanced/smart-reminders', {
      title: newReminderTitle.value,
      message: newReminderMessage.value,
      reminderType: newReminderType.value,
      frequency: newReminderFrequency.value
    })

    showNewReminderModal.value = false
    newReminderTitle.value = ''
    newReminderMessage.value = ''
    await loadDashboard()
  } catch (error) {
    console.error('Failed to create reminder:', error)
  }
}

const cancelReminder = async (reminderId) => {
  try {
    await api.post(`/ai-enhanced/smart-reminders/${reminderId}/cancel`)
    await loadDashboard()
  } catch (error) {
    console.error('Failed to cancel reminder:', error)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
.enhanced-ai-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header-section {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 1rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #718096;
  max-width: 600px;
  margin: 0 auto;
}

.dashboard-overview {
  margin-bottom: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: bold;
  color: #2d3748;
}

.stat-label {
  color: #718096;
  font-size: 0.9rem;
}

.feature-tabs {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tab-buttons {
  display: flex;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
}

.tab-button {
  flex: 1;
  padding: 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  color: #718096;
  transition: all 0.2s;
}

.tab-button.active {
  background: white;
  color: #2d3748;
  border-bottom: 3px solid #4299e1;
}

.tab-content {
  padding: 2rem;
}

/* Chat Interface Styles */
.chat-interface {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  height: 600px;
}

.chat-sessions {
  border-right: 1px solid #e2e8f0;
  padding-right: 1rem;
}

.session-item {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.session-item:hover {
  background: #f7fafc;
}

.session-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.session-context {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.session-date {
  font-size: 0.8rem;
  color: #a0aec0;
}

.new-session-btn {
  width: 100%;
  padding: 0.75rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1rem;
}

.close-chat {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.message {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 12px;
  max-width: 80%;
}

.message.user {
  background: #4299e1;
  color: white;
  margin-left: auto;
}

.message.ai {
  background: #f7fafc;
  color: #2d3748;
}

.message-time {
  font-size: 0.8rem;
  color: #a0aec0;
  margin-top: 0.5rem;
}

.ai-response {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #edf2f7;
  border-radius: 6px;
  font-size: 0.9rem;
}

.chat-input {
  display: flex;
  gap: 0.5rem;
}

.chat-input input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.chat-input button {
  padding: 0.75rem 1.5rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

/* Image Recognition Styles */
.image-upload-section {
  margin-bottom: 2rem;
}

.upload-area {
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.upload-area:hover {
  border-color: #4299e1;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-text {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.upload-hint {
  color: #718096;
  font-size: 0.9rem;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.image-result-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-preview {
  position: relative;
}

.image-preview img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.image-status {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.image-status.completed {
  background: #48bb78;
  color: white;
}

.image-status.processing {
  background: #ed8936;
  color: white;
}

.image-status.failed {
  background: #f56565;
  color: white;
}

.image-details {
  padding: 1rem;
}

.image-type {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.ai-analysis {
  font-size: 0.9rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.confidence {
  font-size: 0.8rem;
  color: #718096;
}

/* Voice Commands Styles */
.voice-controls {
  text-align: center;
  margin-bottom: 2rem;
}

.voice-btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s;
}

.voice-btn:not(.recording) {
  background: #4299e1;
  color: white;
}

.voice-btn.recording {
  background: #f56565;
  color: white;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.recording-indicator {
  margin-top: 1rem;
  color: #f56565;
  font-weight: 600;
}

.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.suggestion-item {
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  text-align: center;
}

.suggestion-item:hover {
  background: #edf2f7;
}

.voice-commands-list {
  max-height: 400px;
  overflow-y: auto;
}

.voice-command-item {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.command-type {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.transcript {
  font-style: italic;
  margin-bottom: 0.5rem;
}

.interpretation {
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.command-status {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.command-status.completed {
  background: #48bb78;
  color: white;
}

.command-status.processing {
  background: #ed8936;
  color: white;
}

.command-status.failed {
  background: #f56565;
  color: white;
}

/* Smart Reminders Styles */
.reminders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.new-reminder-btn {
  padding: 0.75rem 1.5rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.reminder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.reminder-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.reminder-message {
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.reminder-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
}

.reminder-type {
  color: #718096;
}

.reminder-priority {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.reminder-priority.high {
  background: #fed7d7;
  color: #c53030;
}

.reminder-priority.medium {
  background: #fef5e7;
  color: #d69e2e;
}

.reminder-priority.low {
  background: #e6fffa;
  color: #319795;
}

.reminder-time {
  color: #718096;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background: #f56565;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 1rem;
}

.reminder-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.reminder-status.scheduled {
  background: #bee3f8;
  color: #2b6cb0;
}

.reminder-status.sent {
  background: #c6f6d5;
  color: #2f855a;
}

.reminder-status.cancelled {
  background: #fed7d7;
  color: #c53030;
}

.ai-optimization {
  margin-top: 3rem;
}

.optimization-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.optimization-card {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #4299e1;
}

.optimization-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.optimization-content {
  color: #718096;
  font-size: 0.9rem;
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

.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  min-width: 400px;
}

.modal h3 {
  margin-bottom: 1.5rem;
}

.modal input,
.modal textarea,
.modal select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.modal textarea {
  min-height: 100px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.modal-actions button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.modal-actions button:first-child {
  background: #4299e1;
  color: white;
}

.modal-actions button:last-child {
  background: #e2e8f0;
  color: #4a5568;
}

/* Responsive Design */
@media (max-width: 768px) {
  .enhanced-ai-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .chat-interface {
    grid-template-columns: 1fr;
    height: auto;
  }

  .chat-sessions {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    padding-right: 0;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tab-buttons {
    flex-direction: column;
  }

  .reminder-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .reminder-meta {
    flex-wrap: wrap;
  }
}
</style>
