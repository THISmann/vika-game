<template>
  <div class="min-h-screen max-w-7xl mx-auto space-y-4 sm:space-y-5 md:space-y-6 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
    <!-- Header -->
    <div class="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl border-2 border-blue-200 p-4 sm:p-5 md:p-6">
      <div class="text-center mb-4 sm:mb-5 md:mb-6">
        <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
          {{ t('admin.users.title') }}
        </h1>
        <p class="text-sm sm:text-base md:text-lg text-gray-600 px-2">
          {{ t('admin.users.subtitle') }}
        </p>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
        <select
          v-model="statusFilter"
          @change="loadUsers"
          class="px-4 py-2 rounded-xl border-2 border-gray-300 bg-white text-gray-700 font-semibold focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 shadow-lg"
        >
          <option value="">{{ t('admin.users.allStatus') }}</option>
          <option value="pending">{{ t('admin.users.pending') }}</option>
          <option value="approved">{{ t('admin.users.approved') }}</option>
          <option value="rejected">{{ t('admin.users.rejected') }}</option>
          <option value="blocked">{{ t('admin.users.blocked') }}</option>
        </select>

        <input
          v-model="searchQuery"
          @input="debounceSearch"
          type="text"
          :placeholder="t('admin.users.searchPlaceholder')"
          class="flex-1 min-w-[200px] px-4 py-2 rounded-xl border-2 border-gray-300 bg-white text-gray-700 focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 shadow-lg"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      <p class="mt-4 text-gray-600 font-semibold">{{ t('admin.users.loading') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border-2 border-red-300 rounded-xl p-4 sm:p-6 text-red-700 font-semibold">
      {{ error }}
    </div>

    <!-- Users Table -->
    <div v-else class="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <tr>
              <th class="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider">
                {{ t('admin.users.id') }}
              </th>
              <th class="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider">
                {{ t('admin.users.name') }}
              </th>
              <th class="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider">
                {{ t('admin.users.email') }}
              </th>
              <th class="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider">
                {{ t('admin.users.status') }}
              </th>
              <th class="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider">
                {{ t('admin.users.createdAt') }}
              </th>
              <th class="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider">
                {{ t('admin.users.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                {{ user.id }}
              </td>
              <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {{ user.name }}
              </td>
              <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-600">
                {{ user.email || '-' }}
              </td>
              <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                <span
                  :class="{
                    'bg-yellow-100 text-yellow-800': user.status === 'pending',
                    'bg-green-100 text-green-800': user.status === 'approved',
                    'bg-red-100 text-red-800': user.status === 'rejected',
                    'bg-gray-100 text-gray-800': user.status === 'blocked'
                  }"
                  class="px-2 py-1 rounded-lg text-xs font-bold uppercase"
                >
                  {{ t(`admin.users.${user.status}`) }}
                </span>
              </td>
              <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-600">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-if="user.status === 'pending'"
                    @click="approveUser(user.id)"
                    class="px-3 py-1 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-xs"
                  >
                    {{ t('admin.users.approve') }}
                  </button>
                  <button
                    v-if="user.status === 'pending'"
                    @click="showRejectModal(user)"
                    class="px-3 py-1 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-xs"
                  >
                    {{ t('admin.users.reject') }}
                  </button>
                  <button
                    v-if="user.status === 'approved'"
                    @click="blockUser(user.id)"
                    class="px-3 py-1 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors text-xs"
                  >
                    {{ t('admin.users.block') }}
                  </button>
                  <button
                    v-if="user.status === 'blocked'"
                    @click="unblockUser(user.id)"
                    class="px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-xs"
                  >
                    {{ t('admin.users.unblock') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.pages > 1" class="bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-700 font-semibold">
          {{ t('admin.users.showing', { from: pagination.page * pagination.limit - pagination.limit + 1, to: Math.min(pagination.page * pagination.limit, pagination.total), total: pagination.total }) }}
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-3 py-1 bg-white border-2 border-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            {{ t('admin.users.previous') }}
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.pages"
            class="px-3 py-1 bg-white border-2 border-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            {{ t('admin.users.next') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div
      v-if="showRejectReasonModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showRejectReasonModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-4">{{ t('admin.users.rejectUser') }}</h3>
        <textarea
          v-model="rejectReason"
          :placeholder="t('admin.users.rejectReasonPlaceholder')"
          class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-red-500/50 focus:border-red-500 mb-4"
          rows="4"
        ></textarea>
        <div class="flex gap-3">
          <button
            @click="confirmReject"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            {{ t('admin.users.confirmReject') }}
          </button>
          <button
            @click="showRejectReasonModal = false"
            class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-400 transition-colors"
          >
            {{ t('admin.users.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import apiClient from '@/services/api'
import { API_URLS } from '@/config/api'

export default {
  name: 'AdminUserManagement',
  setup() {
    const { t } = useI18n()
    const users = ref([])
    const loading = ref(false)
    const error = ref(null)
    const statusFilter = ref('')
    const searchQuery = ref('')
    const pagination = ref(null)
    const showRejectReasonModal = ref(false)
    const rejectReason = ref('')
    const userToReject = ref(null)
    let searchTimeout = null

    const loadUsers = async () => {
      loading.value = true
      error.value = null
      try {
        const params = new URLSearchParams()
        if (statusFilter.value) params.append('status', statusFilter.value)
        if (searchQuery.value) params.append('search', searchQuery.value)
        params.append('page', pagination.value?.page || 1)
        params.append('limit', '20')

        const response = await apiClient.get(`${API_URLS.auth.users}?${params.toString()}`)
        users.value = response.data.users
        pagination.value = response.data.pagination
      } catch (err) {
        error.value = err.response?.data?.error || t('admin.users.loadError')
        // console.error('Error loading users:', err)
      } finally {
        loading.value = false
      }
    }

    const debounceSearch = () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        loadUsers()
      }, 500)
    }

    const changePage = (page) => {
      if (pagination.value) {
        pagination.value.page = page
        loadUsers()
      }
    }

    const approveUser = async (userId) => {
      try {
        await apiClient.put(API_URLS.auth.approveUser(userId))
        await loadUsers()
      } catch (err) {
        error.value = err.response?.data?.error || t('admin.users.approveError')
        // console.error('Error approving user:', err)
      }
    }

    const showRejectModal = (user) => {
      userToReject.value = user
      rejectReason.value = ''
      showRejectReasonModal.value = true
    }

    const confirmReject = async () => {
      if (!userToReject.value) return
      try {
        await apiClient.put(API_URLS.auth.rejectUser(userToReject.value.id), {
          reason: rejectReason.value
        })
        showRejectReasonModal.value = false
        userToReject.value = null
        await loadUsers()
      } catch (err) {
        error.value = err.response?.data?.error || t('admin.users.rejectError')
        // console.error('Error rejecting user:', err)
      }
    }

    const blockUser = async (userId) => {
      try {
        await apiClient.put(API_URLS.auth.blockUser(userId))
        await loadUsers()
      } catch (err) {
        error.value = err.response?.data?.error || t('admin.users.blockError')
        // console.error('Error blocking user:', err)
      }
    }

    const unblockUser = async (userId) => {
      try {
        await apiClient.put(API_URLS.auth.unblockUser(userId))
        await loadUsers()
      } catch (err) {
        error.value = err.response?.data?.error || t('admin.users.unblockError')
        // console.error('Error unblocking user:', err)
      }
    }

    const formatDate = (date) => {
      if (!date) return '-'
      return new Date(date).toLocaleDateString()
    }

    onMounted(() => {
      loadUsers()
    })

    return {
      t,
      users,
      loading,
      error,
      statusFilter,
      searchQuery,
      pagination,
      showRejectReasonModal,
      rejectReason,
      loadUsers,
      debounceSearch,
      changePage,
      approveUser,
      showRejectModal,
      confirmReject,
      blockUser,
      unblockUser,
      formatDate
    }
  }
}
</script>

