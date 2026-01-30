<template>
  <div class="flex min-h-screen">
    <UserSidebar />
    <div class="flex-1 ml-20 md:ml-64 min-h-screen w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-5 lg:px-6 py-4 sm:py-3 md:py-4 lg:py-6 transition-all duration-300 mt-16 pt-4 sm:pt-6 pb-6 md:pb-6 overflow-x-hidden" :class="sidebarCollapsed ? 'md:ml-20' : ''">
    <!-- Header -->
    <div class="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-none sm:rounded-2xl md:rounded-3xl shadow-none sm:shadow-xl border-0 sm:border-2 border-yellow-200/80 p-3 sm:p-4 md:p-5 lg:p-6 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
      <div class="text-center">
        <div
          class="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-3 sm:mb-4 shadow-lg ring-4 ring-yellow-200"
        >
          <svg class="w-6 h-6 sm:w-7 sm:w-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 px-2">{{ t('leaderboard.title') }}</h1>
        <p class="text-sm sm:text-base md:text-lg text-gray-600 px-2">{{ t('leaderboard.subtitle') }}</p>
      </div>
    </div>

    <!-- Leaderboard List -->
    <div class="bg-gradient-to-br from-white via-gray-50/80 to-blue-50/50 rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl border-0 sm:border-2 border-gray-200 overflow-hidden mx-1 sm:mx-0 md:mx-0 w-full max-w-full">
      <!-- Loading State -->
      <div v-if="loading" class="p-10 sm:p-12 md:p-16 text-center">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-4 sm:border-[5px] border-blue-600 mb-5 sm:mb-6"
        ></div>
        <p class="text-base sm:text-lg md:text-xl font-semibold text-gray-700">{{ t('leaderboard.loading') }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="paginatedLeaderboard.length === 0" class="p-10 sm:p-12 md:p-16 text-center">
        <svg
          class="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
        <p class="text-gray-600">{{ t('leaderboard.empty') }}</p>
      </div>

      <!-- Leaderboard Table -->
      <div v-else class="divide-y divide-gray-200 px-3 sm:px-4 md:px-5 py-2 sm:py-3 overflow-x-hidden">
        <div
          v-for="(entry, index) in paginatedLeaderboard"
          :key="entry.playerId || entry.id"
          class="p-3 sm:p-5 md:p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 min-w-0"
          :class="{
            'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400': getGlobalIndex(index) === 0,
            'bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-400': getGlobalIndex(index) === 1,
            'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400': getGlobalIndex(index) === 2,
          }"
        >
          <div class="flex items-center justify-between gap-2 sm:gap-4 min-w-0">
            <div class="flex items-center space-x-2 sm:space-x-4 md:space-x-5 flex-1 min-w-0 overflow-hidden">
              <!-- Rank -->
              <div
                class="flex-shrink-0 w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg md:text-xl shadow-lg"
                :class="{
                  'bg-gradient-to-br from-yellow-400 to-orange-500 text-white': getGlobalIndex(index) === 0,
                  'bg-gradient-to-br from-gray-400 to-slate-500 text-white': getGlobalIndex(index) === 1,
                  'bg-gradient-to-br from-orange-400 to-amber-500 text-white': getGlobalIndex(index) === 2,
                  'bg-gradient-to-br from-blue-400 to-purple-500 text-white': getGlobalIndex(index) > 2,
                }"
              >
                {{ getGlobalIndex(index) + 1 }}
              </div>

              <!-- Player Info -->
              <div class="flex-1 min-w-0 overflow-hidden">
                <div class="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
                  <h3 class="text-sm sm:text-lg md:text-xl font-bold text-gray-900 truncate">
                    {{ entry.playerName || entry.name || 'Anonymous' }}
                  </h3>
                  <span
                    v-if="getGlobalIndex(index) < 3"
                    class="flex-shrink-0 text-base sm:text-xl md:text-2xl"
                    :title="getMedalTitle(getGlobalIndex(index))"
                  >
                    {{ getMedalEmoji(getGlobalIndex(index)) }}
                  </span>
                </div>
                <p class="text-xs sm:text-sm md:text-base text-gray-600 mt-0.5 truncate">
                  {{ t('leaderboard.playerId') }}: {{ entry.playerId || entry.id }}
                </p>
              </div>
            </div>

            <!-- Score: compact on mobile so it doesn't overflow -->
            <div class="flex-shrink-0 ml-2 sm:ml-4">
              <div
                class="px-2 py-1.5 sm:px-5 sm:py-3 md:px-6 rounded-lg sm:rounded-2xl font-bold text-xs sm:text-lg md:text-xl shadow-lg whitespace-nowrap"
                :class="{
                  'bg-gradient-to-br from-yellow-400 to-orange-500 text-white': getGlobalIndex(index) === 0,
                  'bg-gradient-to-br from-gray-400 to-slate-500 text-white': getGlobalIndex(index) === 1,
                  'bg-gradient-to-br from-orange-400 to-amber-500 text-white': getGlobalIndex(index) === 2,
                  'bg-gradient-to-br from-blue-500 to-purple-600 text-white': getGlobalIndex(index) > 2,
                }"
              >
                {{ entry.score || 0 }} <span class="hidden sm:inline">{{ t('leaderboard.points') }}</span><span class="sm:hidden">{{ t('leaderboard.pointsShort') || 'pt' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="border-t-2 border-gray-200 bg-gray-50 px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-sm text-gray-700">
          {{ t('leaderboard.showing') || 'Showing' }} {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, leaderboard.length) }} {{ t('leaderboard.of') || 'of' }} {{ leaderboard.length }} {{ t('leaderboard.entries') || 'entries' }}
        </div>
        
        <div class="flex items-center space-x-2">
          <!-- Previous Button -->
          <button
            @click="previousPage"
            :disabled="!hasPreviousPage"
            class="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {{ t('leaderboard.previous') || 'Previous' }}
          </button>

          <!-- Page Numbers -->
          <div class="flex items-center space-x-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="{
                'bg-blue-600 text-white': page === currentPage,
                'bg-white text-gray-700 hover:bg-gray-50': page !== currentPage
              }"
              class="px-3 sm:px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg transition-all min-w-[40px]"
            >
              {{ page }}
            </button>
          </div>

          <!-- Next Button -->
          <button
            @click="nextPage"
            :disabled="!hasNextPage"
            class="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {{ t('leaderboard.next') || 'Next' }}
          </button>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useLeaderboardStore } from '@/stores/leaderboard'
import UserSidebar from './UserSidebar.vue'

export default {
  name: 'UserLeaderboard',
  components: {
    UserSidebar
  },
  setup() {
    const { t } = useI18n()
    const store = useLeaderboardStore()

    const getMedalEmoji = (index) => {
      const medals = ['🥇', '🥈', '🥉']
      return medals[index] || ''
    }

    const getMedalTitle = (index) => {
      const titles = [
        t('leaderboard.firstPlace') || 'First Place',
        t('leaderboard.secondPlace') || 'Second Place',
        t('leaderboard.thirdPlace') || 'Third Place',
      ]
      return titles[index] || ''
    }

    const getGlobalIndex = (localIndex) => {
      return (store.currentPage - 1) * store.itemsPerPage + localIndex
    }
    
    const sidebarCollapsed = ref(false)
    
    // Check sidebar state periodically
    const checkSidebarState = () => {
      const savedState = localStorage.getItem('sidebarCollapsed')
      sidebarCollapsed.value = savedState === 'true'
    }

    // Computed for visible pages (show max 5 page numbers)
    const visiblePages = computed(() => {
      const total = store.totalPages
      const current = store.currentPage
      const maxVisible = 5
      
      if (total <= maxVisible) {
        return Array.from({ length: total }, (_, i) => i + 1)
      }
      
      let start = Math.max(1, current - Math.floor(maxVisible / 2))
      let end = Math.min(total, start + maxVisible - 1)
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    })

    onMounted(async () => {
      checkSidebarState()
      // Check periodically for changes (every 100ms)
      const interval = setInterval(checkSidebarState, 100)
      window.sidebarCheckInterval = interval
      
      // Load initial data
      await store.loadLeaderboard()
      
      // Setup socket listeners for real-time updates
      store.setupSocketListeners()
    })

    onUnmounted(() => {
      // Cleanup socket listeners
      store.removeSocketListeners()
      
      // Clear sidebar check interval
      if (window.sidebarCheckInterval) {
        clearInterval(window.sidebarCheckInterval)
      }
    })

    return {
      t,
      // Store state
      loading: computed(() => store.loading),
      paginatedLeaderboard: computed(() => store.paginatedLeaderboard),
      leaderboard: computed(() => store.leaderboard),
      currentPage: computed(() => store.currentPage),
      itemsPerPage: computed(() => store.itemsPerPage),
      totalPages: computed(() => store.totalPages),
      hasNextPage: computed(() => store.hasNextPage),
      hasPreviousPage: computed(() => store.hasPreviousPage),
      visiblePages,
      // Methods
      getMedalEmoji,
      getMedalTitle,
      getGlobalIndex,
      nextPage: () => store.nextPage(),
      previousPage: () => store.previousPage(),
      goToPage: (page) => store.goToPage(page),
      sidebarCollapsed
    }
  },
}
</script>

