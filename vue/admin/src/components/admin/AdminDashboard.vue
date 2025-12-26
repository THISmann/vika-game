<template>
  <div class="min-h-screen max-w-6xl mx-auto space-y-4 sm:space-y-5 md:space-y-6 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
    <!-- Header -->
    <div class="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl border-2 border-blue-200 p-4 sm:p-5 md:p-6">
      <div class="text-center mb-4 sm:mb-5 md:mb-6">
        <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">{{ t('admin.dashboard.title') }}</h1>
        <p class="text-sm sm:text-base md:text-lg text-gray-600 px-2">{{ t('admin.dashboard.subtitle') }}</p>
      </div>

      <!-- User Statistics -->
      <div v-if="userStats" class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-indigo-200 shadow-xl">
        <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-4">{{ t('admin.dashboard.userStats') }}</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          <div class="text-center bg-white rounded-xl p-3 shadow-md">
            <div class="text-2xl sm:text-3xl font-bold text-indigo-600">{{ userStats.total || 0 }}</div>
            <div class="text-xs sm:text-sm text-gray-600 mt-1">{{ t('admin.dashboard.totalUsers') }}</div>
          </div>
          <div class="text-center bg-white rounded-xl p-3 shadow-md">
            <div class="text-2xl sm:text-3xl font-bold text-yellow-600">{{ userStats.pending || 0 }}</div>
            <div class="text-xs sm:text-sm text-gray-600 mt-1">{{ t('admin.dashboard.pendingUsers') }}</div>
          </div>
          <div class="text-center bg-white rounded-xl p-3 shadow-md">
            <div class="text-2xl sm:text-3xl font-bold text-green-600">{{ userStats.approved || 0 }}</div>
            <div class="text-xs sm:text-sm text-gray-600 mt-1">{{ t('admin.dashboard.approvedUsers') }}</div>
          </div>
          <div class="text-center bg-white rounded-xl p-3 shadow-md">
            <div class="text-2xl sm:text-3xl font-bold text-red-600">{{ userStats.rejected || 0 }}</div>
            <div class="text-xs sm:text-sm text-gray-600 mt-1">{{ t('admin.dashboard.rejectedUsers') }}</div>
          </div>
          <div class="text-center bg-white rounded-xl p-3 shadow-md">
            <div class="text-2xl sm:text-3xl font-bold text-gray-600">{{ userStats.blocked || 0 }}</div>
            <div class="text-xs sm:text-sm text-gray-600 mt-1">{{ t('admin.dashboard.blockedUsers') }}</div>
          </div>
        </div>
        <div v-if="userStats.game" class="mt-4 pt-4 border-t border-indigo-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="text-center bg-white rounded-xl p-3 shadow-md">
            <div class="text-xl sm:text-2xl font-bold text-blue-600">{{ userStats.game.connectedPlayers || 0 }}</div>
            <div class="text-xs sm:text-sm text-gray-600 mt-1">{{ t('admin.dashboard.connectedPlayers') }}</div>
          </div>
          <div class="text-center bg-white rounded-xl p-3 shadow-md">
            <div class="text-xl sm:text-2xl font-bold" :class="userStats.game.isGameStarted ? 'text-green-600' : 'text-gray-400'">
              {{ userStats.game.isGameStarted ? t('admin.dashboard.gameActive') : t('admin.dashboard.gameInactive') }}
            </div>
            <div class="text-xs sm:text-sm text-gray-600 mt-1">{{ t('admin.dashboard.gameStatus') }}</div>
          </div>
        </div>
        <div v-if="userStats.recentRegistrations !== undefined" class="mt-4 pt-4 border-t border-indigo-200">
          <div class="text-center bg-white rounded-xl p-3 shadow-md">
            <div class="text-xl sm:text-2xl font-bold text-purple-600">{{ userStats.recentRegistrations || 0 }}</div>
            <div class="text-xs sm:text-sm text-gray-600 mt-1">{{ t('admin.dashboard.recentRegistrations') }}</div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-else class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600 font-semibold">{{ t('admin.dashboard.loadingStats') }}</p>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="error" class="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { useI18n } from '@/composables/useI18n'
import apiClient from '@/services/api'
import { API_URLS } from '@/config/api'

export default {
  setup() {
    const { t } = useI18n()
    return { t }
  },
  data() {
    return {
      userStats: null,
      error: null,
      loading: false
    }
  },
  async mounted() {
    await this.loadUserStats()
    
    // Refresh stats every 5 seconds
    setInterval(() => {
      this.loadUserStats()
    }, 5000)
  },
  methods: {
    async loadUserStats() {
      try {
        this.loading = true
        this.error = null
        const res = await apiClient.get(API_URLS.auth.usersStats)
        this.userStats = res.data
      } catch (err) {
        console.error('Error loading user stats:', err)
        this.error = err.response?.data?.error || t('admin.dashboard.loadError')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
