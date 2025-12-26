<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Dashboard Header -->
    <div class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">{{ t('admin.dashboard.title') }}</h1>
            <p class="mt-1 text-sm text-gray-500">{{ t('admin.dashboard.subtitle') }}</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <div class="text-xs text-gray-500">Last updated</div>
              <div class="text-sm font-medium text-gray-900">{{ lastUpdateTime }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading && !userStats" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
          <p class="mt-4 text-sm text-gray-600">{{ t('admin.dashboard.loadingStats') }}</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Metrics Grid -->
      <div v-if="userStats" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <!-- Total Users -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">{{ t('admin.dashboard.totalUsers') }}</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{{ userStats.total || 0 }}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <!-- Pending Users -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">{{ t('admin.dashboard.pendingUsers') }}</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{{ userStats.pending || 0 }}</div>
                  <span v-if="userStats && userStats.total > 0" class="ml-2 text-sm text-gray-500">
                    ({{ Math.round((userStats.pending / userStats.total) * 100) }}%)
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <!-- Approved Users -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">{{ t('admin.dashboard.approvedUsers') }}</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{{ userStats.approved || 0 }}</div>
                  <span v-if="userStats && userStats.total > 0" class="ml-2 text-sm text-gray-500">
                    ({{ Math.round((userStats.approved / userStats.total) * 100) }}%)
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <!-- Rejected Users -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">{{ t('admin.dashboard.rejectedUsers') }}</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{{ userStats.rejected || 0 }}</div>
                  <span v-if="userStats && userStats.total > 0" class="ml-2 text-sm text-gray-500">
                    ({{ Math.round((userStats.rejected / userStats.total) * 100) }}%)
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Metrics -->
      <div v-if="userStats" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <!-- Blocked Users -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-gray-500 text-white">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">{{ t('admin.dashboard.blockedUsers') }}</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{{ userStats.blocked || 0 }}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <!-- Connected Players -->
        <div v-if="userStats.game" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">{{ t('admin.dashboard.connectedPlayers') }}</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{{ userStats.game.connectedPlayers || 0 }}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <!-- Game Status -->
        <div v-if="userStats.game" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-md" :class="userStats.game.isGameStarted ? 'bg-green-500' : 'bg-gray-400'" class="text-white">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">{{ t('admin.dashboard.gameStatus') }}</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold" :class="userStats.game.isGameStarted ? 'text-green-600' : 'text-gray-600'">
                    {{ userStats.game.isGameStarted ? t('admin.dashboard.gameActive') : t('admin.dashboard.gameInactive') }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Registrations -->
      <div v-if="userStats && userStats.recentRegistrations !== undefined" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">{{ t('admin.dashboard.recentRegistrations') }}</h3>
        </div>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dd class="flex items-baseline">
                <div class="text-3xl font-semibold text-gray-900">{{ userStats.recentRegistrations || 0 }}</div>
                <span class="ml-2 text-sm text-gray-500">last 7 days</span>
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <!-- Status Distribution Chart -->
      <div v-if="userStats && userStats.total > 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">User Status Distribution</h3>
        <div class="space-y-4">
          <!-- Pending -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">{{ t('admin.dashboard.pendingUsers') }}</span>
              <span class="text-sm text-gray-500">{{ userStats.pending || 0 }} ({{ Math.round((userStats.pending / userStats.total) * 100) }}%)</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-yellow-500 h-2 rounded-full" :style="{ width: `${(userStats.pending / userStats.total) * 100}%` }"></div>
            </div>
          </div>
          <!-- Approved -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">{{ t('admin.dashboard.approvedUsers') }}</span>
              <span class="text-sm text-gray-500">{{ userStats.approved || 0 }} ({{ Math.round((userStats.approved / userStats.total) * 100) }}%)</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full" :style="{ width: `${(userStats.approved / userStats.total) * 100}%` }"></div>
            </div>
          </div>
          <!-- Rejected -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">{{ t('admin.dashboard.rejectedUsers') }}</span>
              <span class="text-sm text-gray-500">{{ userStats.rejected || 0 }} ({{ Math.round((userStats.rejected / userStats.total) * 100) }}%)</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-red-500 h-2 rounded-full" :style="{ width: `${(userStats.rejected / userStats.total) * 100}%` }"></div>
            </div>
          </div>
          <!-- Blocked -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">{{ t('admin.dashboard.blockedUsers') }}</span>
              <span class="text-sm text-gray-500">{{ userStats.blocked || 0 }} ({{ Math.round((userStats.blocked / userStats.total) * 100) }}%)</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-gray-500 h-2 rounded-full" :style="{ width: `${(userStats.blocked / userStats.total) * 100}%` }"></div>
            </div>
          </div>
        </div>
      </div>
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
      loading: false,
      lastUpdateTime: '--:--'
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
        this.updateLastUpdateTime()
      } catch (err) {
        console.error('Error loading user stats:', err)
        this.error = err.response?.data?.error || this.t('admin.dashboard.loadError')
      } finally {
        this.loading = false
      }
    },
    updateLastUpdateTime() {
      const now = new Date()
      this.lastUpdateTime = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    }
  }
}
</script>
