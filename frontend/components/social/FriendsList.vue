<template>
  <div class="friends-list">
    <div class="friends-header">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">
        {{ $t('social.friends.title') }}
      </h2>
      <button
        @click="showAddFriendModal = true"
        class="btn btn-primary"
      >
        <i class="fas fa-user-plus mr-2"></i>
        {{ $t('social.friends.addFriend') }}
      </button>
    </div>

    <!-- Friend Requests -->
    <div v-if="pendingRequests.length > 0" class="mb-6">
      <h3 class="text-lg font-semibold text-gray-700 mb-3">
        {{ $t('social.friends.pendingRequests') }} ({{ pendingRequests.length }})
      </h3>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="request in pendingRequests"
          :key="request.id"
          class="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-400"
        >
          <div class="flex items-center mb-3">
            <img
              :src="request.requester.avatar || '/default-avatar.png'"
              :alt="request.requester.username"
              class="w-12 h-12 rounded-full mr-3"
            />
            <div>
              <h4 class="font-semibold text-gray-800">
                {{ request.requester.firstName }} {{ request.requester.lastName }}
              </h4>
              <p class="text-sm text-gray-600">@{{ request.requester.username }}</p>
            </div>
          </div>
          <p v-if="request.message" class="text-gray-600 mb-3 text-sm">
            "{{ request.message }}"
          </p>
          <div class="flex gap-2">
            <button
              @click="acceptFriendRequest(request.id)"
              class="btn btn-success btn-sm"
            >
              <i class="fas fa-check mr-1"></i>
              {{ $t('social.friends.accept') }}
            </button>
            <button
              @click="rejectFriendRequest(request.id)"
              class="btn btn-danger btn-sm"
            >
              <i class="fas fa-times mr-1"></i>
              {{ $t('social.friends.reject') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Friends List -->
    <div v-if="friends.length > 0">
      <h3 class="text-lg font-semibold text-gray-700 mb-3">
        {{ $t('social.friends.yourFriends') }} ({{ friends.length }})
      </h3>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="friendship in friends"
          :key="friendship.id"
          class="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-400"
        >
          <div class="flex items-center mb-3">
            <img
              :src="getFriendAvatar(friendship)"
              :alt="getFriendName(friendship)"
              class="w-12 h-12 rounded-full mr-3"
            />
            <div class="flex-1">
              <h4 class="font-semibold text-gray-800">
                {{ getFriendName(friendship) }}
              </h4>
              <p class="text-sm text-gray-600">@{{ getFriendUsername(friendship) }}</p>
              <span class="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                {{ getFriendshipType(friendship.type) }}
              </span>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="viewFriendProfile(getFriendId(friendship))"
              class="btn btn-outline btn-sm flex-1"
            >
              <i class="fas fa-eye mr-1"></i>
              {{ $t('social.friends.viewProfile') }}
            </button>
            <button
              @click="removeFriend(friendship.id)"
              class="btn btn-danger btn-sm"
            >
              <i class="fas fa-user-minus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && friends.length === 0 && pendingRequests.length === 0" class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <i class="fas fa-users text-6xl"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-600 mb-2">
        {{ $t('social.friends.noFriendsYet') }}
      </h3>
      <p class="text-gray-500 mb-4">
        {{ $t('social.friends.startBuilding') }}
      </p>
      <button
        @click="showAddFriendModal = true"
        class="btn btn-primary"
      >
        <i class="fas fa-user-plus mr-2"></i>
        {{ $t('social.friends.findFriends') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="spinner"></div>
      <p class="text-gray-500 mt-4">{{ $t('common.loading') }}</p>
    </div>

    <!-- Add Friend Modal -->
    <div v-if="showAddFriendModal" class="modal-overlay" @click="showAddFriendModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="text-lg font-semibold">{{ $t('social.friends.addFriend') }}</h3>
          <button @click="showAddFriendModal = false" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('social.friends.searchUsers') }}
            </label>
            <div class="relative">
              <input
                v-model="searchQuery"
                @input="searchUsers"
                type="text"
                :placeholder="$t('social.friends.searchPlaceholder')"
                class="form-input w-full pl-10"
              />
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">
              {{ $t('social.friends.searchResults') }}
            </h4>
            <div class="space-y-2 max-h-60 overflow-y-auto">
              <div
                v-for="user in searchResults"
                :key="user.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center">
                  <img
                    :src="user.avatar || '/default-avatar.png'"
                    :alt="user.username"
                    class="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p class="font-medium text-gray-800">
                      {{ user.firstName }} {{ user.lastName }}
                    </p>
                    <p class="text-sm text-gray-600">@{{ user.username }}</p>
                  </div>
                </div>
                <button
                  @click="sendFriendRequest(user.id)"
                  class="btn btn-primary btn-sm"
                  :disabled="sendingRequest === user.id"
                >
                  <span v-if="sendingRequest === user.id">
                    <i class="fas fa-spinner fa-spin mr-1"></i>
                    {{ $t('common.sending') }}
                  </span>
                  <span v-else>
                    <i class="fas fa-user-plus mr-1"></i>
                    {{ $t('social.friends.sendRequest') }}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div v-else-if="searchQuery && !searching" class="text-center py-4 text-gray-500">
            {{ $t('social.friends.noUsersFound') }}
          </div>

          <!-- Search Loading -->
          <div v-if="searching" class="text-center py-4">
            <div class="spinner"></div>
            <p class="text-gray-500 mt-2">{{ $t('common.searching') }}</p>
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
const friends = ref([])
const pendingRequests = ref([])
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const sendingRequest = ref(null)
const showAddFriendModal = ref(false)

// API calls
const fetchFriends = async () => {
  try {
    loading.value = true
    const [friendsResponse, pendingResponse] = await Promise.all([
      $fetch('/api/social/friendships/friends'),
      $fetch('/api/social/friendships/pending')
    ])
    friends.value = friendsResponse
    pendingRequests.value = pendingResponse
  } catch (error) {
    console.error('Error fetching friends:', error)
    showToast('error', t('social.friends.errorFetching'))
  } finally {
    loading.value = false
  }
}

const searchUsers = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  try {
    searching.value = true
    const results = await $fetch('/api/social/users/search', {
      params: { q: searchQuery.value, limit: 10 }
    })
    searchResults.value = results
  } catch (error) {
    console.error('Error searching users:', error)
    showToast('error', t('social.friends.errorSearching'))
  } finally {
    searching.value = false
  }
}

const sendFriendRequest = async (userId: number) => {
  try {
    sendingRequest.value = userId
    await $fetch('/api/social/friendships', {
      method: 'POST',
      body: { addresseeId: userId }
    })
    showToast('success', t('social.friends.requestSent'))
    searchResults.value = searchResults.value.filter(u => u.id !== userId)
  } catch (error) {
    console.error('Error sending friend request:', error)
    showToast('error', t('social.friends.errorSendingRequest'))
  } finally {
    sendingRequest.value = null
  }
}

const acceptFriendRequest = async (friendshipId: number) => {
  try {
    await $fetch(`/api/social/friendships/${friendshipId}`, {
      method: 'PATCH',
      body: { status: 'accepted' }
    })
    showToast('success', t('social.friends.requestAccepted'))
    await fetchFriends()
  } catch (error) {
    console.error('Error accepting friend request:', error)
    showToast('error', t('social.friends.errorAccepting'))
  }
}

const rejectFriendRequest = async (friendshipId: number) => {
  try {
    await $fetch(`/api/social/friendships/${friendshipId}`, {
      method: 'PATCH',
      body: { status: 'rejected' }
    })
    showToast('success', t('social.friends.requestRejected'))
    await fetchFriends()
  } catch (error) {
    console.error('Error rejecting friend request:', error)
    showToast('error', t('social.friends.errorRejecting'))
  }
}

const removeFriend = async (friendshipId: number) => {
  if (!confirm(t('social.friends.confirmRemove'))) return

  try {
    await $fetch(`/api/social/friendships/${friendshipId}`, {
      method: 'DELETE'
    })
    showToast('success', t('social.friends.friendRemoved'))
    await fetchFriends()
  } catch (error) {
    console.error('Error removing friend:', error)
    showToast('error', t('social.friends.errorRemoving'))
  }
}

const viewFriendProfile = (userId: number) => {
  navigateTo(`/profile/${userId}`)
}

// Helper methods
const getFriendAvatar = (friendship: any) => {
  const currentUserId = useAuthStore().user?.id
  return friendship.requesterId === currentUserId
    ? friendship.addressee.avatar
    : friendship.requester.avatar
}

const getFriendName = (friendship: any) => {
  const currentUserId = useAuthStore().user?.id
  const friend = friendship.requesterId === currentUserId
    ? friendship.addressee
    : friendship.requester
  return `${friend.firstName} ${friend.lastName}`
}

const getFriendUsername = (friendship: any) => {
  const currentUserId = useAuthStore().user?.id
  const friend = friendship.requesterId === currentUserId
    ? friendship.addressee
    : friendship.requester
  return friend.username
}

const getFriendId = (friendship: any) => {
  const currentUserId = useAuthStore().user?.id
  return friendship.requesterId === currentUserId
    ? friendship.addresseeId
    : friendship.requesterId
}

const getFriendshipType = (type: string) => {
  const types = {
    friend: t('social.friends.types.friend'),
    family: t('social.friends.types.family'),
    colleague: t('social.friends.types.colleague'),
    mentor: t('social.friends.types.mentor'),
    mentee: t('social.friends.types.mentee')
  }
  return types[type] || type
}

// Lifecycle
onMounted(() => {
  fetchFriends()
})
</script>

<style scoped>
.friends-list {
  @apply space-y-6;
}

.friends-header {
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
