<template>
  <div class="habit-share">
    <div class="habit-share-header">
      <h3 class="text-lg font-semibold text-gray-800 mb-2">
        {{ $t('social.habitShare.title') }}
      </h3>
      <button
        @click="showShareModal = true"
        class="btn btn-primary btn-sm"
      >
        <i class="fas fa-share-alt mr-1"></i>
        {{ $t('social.habitShare.shareHabit') }}
      </button>
    </div>

    <!-- Shared Habits -->
    <div v-if="sharedHabits.length > 0" class="mb-6">
      <h4 class="text-md font-medium text-gray-700 mb-3">
        {{ $t('social.habitShare.sharedWithOthers') }} ({{ sharedHabits.length }})
      </h4>
      <div class="space-y-3">
        <div
          v-for="share in sharedHabits"
          :key="share.id"
          class="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <i class="fas fa-seedling text-blue-600"></i>
              </div>
              <div>
                <h5 class="font-medium text-gray-800">{{ share.habit.title }}</h5>
                <p class="text-sm text-gray-600">
                  {{ $t('social.habitShare.sharedWith') }}
                  <span class="font-medium">{{ share.sharedWith.firstName }} {{ share.sharedWith.lastName }}</span>
                </p>
                <p class="text-xs text-gray-500">
                  {{ $t('social.habitShare.permission') }}:
                  <span class="font-medium">{{ getPermissionLabel(share.permission) }}</span>
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="editShare(share)"
                class="btn btn-outline btn-sm"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                @click="removeShare(share.id)"
                class="btn btn-danger btn-sm"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div v-if="share.message" class="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600">
            "{{ share.message }}"
          </div>
        </div>
      </div>
    </div>

    <!-- Habits Shared With Me -->
    <div v-if="habitsSharedWithMe.length > 0">
      <h4 class="text-md font-medium text-gray-700 mb-3">
        {{ $t('social.habitShare.sharedWithMe') }} ({{ habitsSharedWithMe.length }})
      </h4>
      <div class="space-y-3">
        <div
          v-for="share in habitsSharedWithMe"
          :key="share.id"
          class="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <i class="fas fa-heart text-green-600"></i>
              </div>
              <div>
                <h5 class="font-medium text-gray-800">{{ share.habit.title }}</h5>
                <p class="text-sm text-gray-600">
                  {{ $t('social.habitShare.sharedBy') }}
                  <span class="font-medium">{{ share.sharedBy.firstName }} {{ share.sharedBy.lastName }}</span>
                </p>
                <p class="text-xs text-gray-500">
                  {{ $t('social.habitShare.permission') }}:
                  <span class="font-medium">{{ getPermissionLabel(share.permission) }}</span>
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="viewSharedHabit(share)"
                class="btn btn-primary btn-sm"
              >
                <i class="fas fa-eye mr-1"></i>
                {{ $t('social.habitShare.view') }}
              </button>
              <button
                @click="supportHabit(share.habit.id)"
                class="btn btn-success btn-sm"
              >
                <i class="fas fa-thumbs-up mr-1"></i>
                {{ $t('social.habitShare.support') }}
              </button>
            </div>
          </div>
          <div v-if="share.message" class="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600">
            "{{ share.message }}"
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && sharedHabits.length === 0 && habitsSharedWithMe.length === 0" class="text-center py-8">
      <div class="text-gray-400 mb-3">
        <i class="fas fa-share-alt text-4xl"></i>
      </div>
      <p class="text-gray-500 mb-4">{{ $t('social.habitShare.noSharesYet') }}</p>
      <button
        @click="showShareModal = true"
        class="btn btn-primary"
      >
        <i class="fas fa-share-alt mr-2"></i>
        {{ $t('social.habitShare.shareFirstHabit') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="spinner"></div>
      <p class="text-gray-500 mt-4">{{ $t('common.loading') }}</p>
    </div>

    <!-- Share Modal -->
    <div v-if="showShareModal" class="modal-overlay" @click="showShareModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="text-lg font-semibold">{{ $t('social.habitShare.shareHabit') }}</h3>
          <button @click="showShareModal = false" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <!-- Select Habit -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('social.habitShare.selectHabit') }}
            </label>
            <select
              v-model="selectedHabitId"
              class="form-select w-full"
              required
            >
              <option value="">{{ $t('social.habitShare.chooseHabit') }}</option>
              <option
                v-for="habit in userHabits"
                :key="habit.id"
                :value="habit.id"
              >
                {{ habit.title }}
              </option>
            </select>
          </div>

          <!-- Select Friend -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('social.habitShare.selectFriend') }}
            </label>
            <select
              v-model="selectedFriendId"
              class="form-select w-full"
              required
            >
              <option value="">{{ $t('social.habitShare.chooseFriend') }}</option>
              <option
                v-for="friend in friends"
                :key="friend.id"
                :value="getFriendId(friend)"
              >
                {{ getFriendName(friend) }}
              </option>
            </select>
          </div>

          <!-- Permission Level -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('social.habitShare.permissionLevel') }}
            </label>
            <select
              v-model="selectedPermission"
              class="form-select w-full"
            >
              <option value="view">{{ $t('social.habitShare.permissions.view') }}</option>
              <option value="comment">{{ $t('social.habitShare.permissions.comment') }}</option>
              <option value="support">{{ $t('social.habitShare.permissions.support') }}</option>
              <option value="full_access">{{ $t('social.habitShare.permissions.fullAccess') }}</option>
            </select>
          </div>

          <!-- Message -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('social.habitShare.message') }} ({{ $t('common.optional') }})
            </label>
            <textarea
              v-model="shareMessage"
              :placeholder="$t('social.habitShare.messagePlaceholder')"
              class="form-textarea w-full"
              rows="3"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end gap-3">
            <button
              @click="showShareModal = false"
              class="btn btn-outline"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              @click="shareHabit"
              class="btn btn-primary"
              :disabled="!selectedHabitId || !selectedFriendId || sharing"
            >
              <span v-if="sharing">
                <i class="fas fa-spinner fa-spin mr-1"></i>
                {{ $t('common.sharing') }}
              </span>
              <span v-else>
                <i class="fas fa-share-alt mr-1"></i>
                {{ $t('social.habitShare.share') }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Share Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="text-lg font-semibold">{{ $t('social.habitShare.editShare') }}</h3>
          <button @click="showEditModal = false" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <!-- Permission Level -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('social.habitShare.permissionLevel') }}
            </label>
            <select
              v-model="editingShare.permission"
              class="form-select w-full"
            >
              <option value="view">{{ $t('social.habitShare.permissions.view') }}</option>
              <option value="comment">{{ $t('social.habitShare.permissions.comment') }}</option>
              <option value="support">{{ $t('social.habitShare.permissions.support') }}</option>
              <option value="full_access">{{ $t('social.habitShare.permissions.fullAccess') }}</option>
            </select>
          </div>

          <!-- Message -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('social.habitShare.message') }}
            </label>
            <textarea
              v-model="editingShare.message"
              class="form-textarea w-full"
              rows="3"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end gap-3">
            <button
              @click="showEditModal = false"
              class="btn btn-outline"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              @click="updateShare"
              class="btn btn-primary"
              :disabled="updating"
            >
              <span v-if="updating">
                <i class="fas fa-spinner fa-spin mr-1"></i>
                {{ $t('common.updating') }}
              </span>
              <span v-else>
                <i class="fas fa-save mr-1"></i>
                {{ $t('common.update') }}
              </span>
            </button>
          </div>
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
const sharing = ref(false)
const updating = ref(false)
const sharedHabits = ref([])
const habitsSharedWithMe = ref([])
const userHabits = ref([])
const friends = ref([])
const showShareModal = ref(false)
const showEditModal = ref(false)

// Form data
const selectedHabitId = ref('')
const selectedFriendId = ref('')
const selectedPermission = ref('view')
const shareMessage = ref('')
const editingShare = ref({})

// API calls
const fetchHabitShares = async () => {
  try {
    loading.value = true
    const [sharedResponse, sharedWithMeResponse] = await Promise.all([
      $fetch('/api/social/habit-shares/shared-by-me'),
      $fetch('/api/social/habit-shares/shared-with-me')
    ])
    sharedHabits.value = sharedResponse
    habitsSharedWithMe.value = sharedWithMeResponse
  } catch (error) {
    console.error('Error fetching habit shares:', error)
    showToast('error', t('social.habitShare.errorFetching'))
  } finally {
    loading.value = false
  }
}

const fetchUserHabits = async () => {
  try {
    const response = await $fetch('/api/habits')
    userHabits.value = response
  } catch (error) {
    console.error('Error fetching user habits:', error)
  }
}

const fetchFriends = async () => {
  try {
    const response = await $fetch('/api/social/friendships/friends')
    friends.value = response
  } catch (error) {
    console.error('Error fetching friends:', error)
  }
}

const shareHabit = async () => {
  if (!selectedHabitId.value || !selectedFriendId.value) return

  try {
    sharing.value = true
    await $fetch('/api/social/habit-shares', {
      method: 'POST',
      body: {
        habitId: parseInt(selectedHabitId.value),
        sharedWithId: parseInt(selectedFriendId.value),
        permission: selectedPermission.value,
        message: shareMessage.value || undefined
      }
    })

    showToast('success', t('social.habitShare.habitShared'))
    showShareModal.value = false
    resetForm()
    await fetchHabitShares()
  } catch (error) {
    console.error('Error sharing habit:', error)
    showToast('error', t('social.habitShare.errorSharing'))
  } finally {
    sharing.value = false
  }
}

const editShare = (share: any) => {
  editingShare.value = { ...share }
  showEditModal.value = true
}

const updateShare = async () => {
  try {
    updating.value = true
    await $fetch(`/api/social/habit-shares/${editingShare.value.id}/permission`, {
      method: 'PATCH',
      body: { permission: editingShare.value.permission }
    })

    showToast('success', t('social.habitShare.shareUpdated'))
    showEditModal.value = false
    await fetchHabitShares()
  } catch (error) {
    console.error('Error updating share:', error)
    showToast('error', t('social.habitShare.errorUpdating'))
  } finally {
    updating.value = false
  }
}

const removeShare = async (shareId: number) => {
  if (!confirm(t('social.habitShare.confirmRemove'))) return

  try {
    await $fetch(`/api/social/habit-shares/${shareId}`, {
      method: 'DELETE'
    })
    showToast('success', t('social.habitShare.shareRemoved'))
    await fetchHabitShares()
  } catch (error) {
    console.error('Error removing share:', error)
    showToast('error', t('social.habitShare.errorRemoving'))
  }
}

const viewSharedHabit = (share: any) => {
  navigateTo(`/habits/${share.habit.id}`)
}

const supportHabit = async (habitId: number) => {
  try {
    await $fetch('/api/social/activities/support/habit/' + habitId, {
      method: 'POST',
      body: { message: t('social.habitShare.supportMessage') }
    })
    showToast('success', t('social.habitShare.supportSent'))
  } catch (error) {
    console.error('Error sending support:', error)
    showToast('error', t('social.habitShare.errorSupporting'))
  }
}

// Helper methods
const resetForm = () => {
  selectedHabitId.value = ''
  selectedFriendId.value = ''
  selectedPermission.value = 'view'
  shareMessage.value = ''
}

const getPermissionLabel = (permission: string) => {
  const permissions = {
    view: t('social.habitShare.permissions.view'),
    comment: t('social.habitShare.permissions.comment'),
    support: t('social.habitShare.permissions.support'),
    full_access: t('social.habitShare.permissions.fullAccess')
  }
  return permissions[permission] || permission
}

const getFriendName = (friendship: any) => {
  const currentUserId = useAuthStore().user?.id
  const friend = friendship.requesterId === currentUserId
    ? friendship.addressee
    : friendship.requester
  return `${friend.firstName} ${friend.lastName}`
}

const getFriendId = (friendship: any) => {
  const currentUserId = useAuthStore().user?.id
  return friendship.requesterId === currentUserId
    ? friendship.addresseeId
    : friendship.requesterId
}

// Lifecycle
onMounted(() => {
  fetchHabitShares()
  fetchUserHabits()
  fetchFriends()
})
</script>

<style scoped>
.habit-share {
  @apply space-y-6;
}

.habit-share-header {
  @apply flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto;
}

.modal-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.modal-close {
  @apply text-gray-400 hover:text-gray-600 text-xl;
}

.modal-body {
  @apply p-4;
}

.spinner {
  @apply inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin;
}
</style>
