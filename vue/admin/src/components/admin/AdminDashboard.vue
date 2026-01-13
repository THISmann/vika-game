<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 flex-shrink-0">
      <div class="h-full flex flex-col">
        <!-- Sidebar Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">{{ t('admin.nav.navigation') }}</h2>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-3 py-4 space-y-1">
          <router-link
            to="/admin/dashboard"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="$route.path === '/admin/dashboard' 
              ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {{ t('admin.nav.dashboard') }}
          </router-link>

          <router-link
            to="/admin/users"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="$route.path === '/admin/users' 
              ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {{ t('admin.nav.users') }}
          </router-link>

          <router-link
            to="/admin/questions"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="$route.path === '/admin/questions' 
              ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ t('admin.nav.questions') }}
          </router-link>

          <router-link
            to="/admin/settings"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="$route.path === '/admin/settings' 
              ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ t('admin.nav.settings') }}
          </router-link>

          <router-link
            to="/admin/analytics"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="$route.path === '/admin/analytics' 
              ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {{ t('admin.nav.analytics') }}
          </router-link>
        </nav>

        <!-- Sidebar Footer -->
        <div class="px-6 py-4 border-t border-gray-200">
          <div class="text-xs text-gray-500">
            <div>{{ t('admin.nav.lastUpdated') }}</div>
            <div class="font-medium text-gray-700 mt-1">{{ lastUpdateTime }}</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Dashboard Header -->
      <div class="bg-white border-b border-gray-200 shadow-sm">
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">{{ t('admin.dashboard.title') }}</h1>
              <p class="mt-1 text-sm text-gray-500">{{ t('admin.dashboard.subtitle') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div class="flex-1 px-6 py-8 overflow-y-auto">
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
                <div class="flex items-center justify-center h-12 w-12 rounded-md text-white" :class="userStats.game.isGameStarted ? 'bg-green-500' : 'bg-gray-400'">
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
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useAdminStore } from '@/stores/admin'

export default {
  setup() {
    const { t } = useI18n()
    const adminStore = useAdminStore()
    
    onMounted(async () => {
      // Initialize socket connection
      adminStore.initSocket()
      // Load initial stats
      await adminStore.loadUserStats()
    })
    
    onUnmounted(() => {
      // Socket will be kept alive for other components
      // Only disconnect if leaving admin panel entirely
    })
    
    return {
      t,
      adminStore
    }
  },
  computed: {
    userStats() {
      return this.adminStore.userStats
    },
    error() {
      return this.adminStore.statsError
    },
    loading() {
      return this.adminStore.loadingStats
    },
    lastUpdateTime() {
      return this.adminStore.formattedLastUpdateTime
    }
  }
}
</script>
