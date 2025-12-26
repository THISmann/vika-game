<template>
  <div class="min-h-screen max-w-4xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 lg:py-6">
    <!-- Header -->
    <div class="bg-gradient-to-br from-white to-yellow-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-yellow-200 p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6">
      <div class="text-center">
        <div
          class="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-3 sm:mb-4 shadow-lg ring-4 ring-yellow-200"
        >
          <svg class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div class="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border-2 border-gray-200 overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="p-10 sm:p-12 md:p-16 text-center">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-4 sm:border-[5px] border-blue-600 mb-5 sm:mb-6"
        ></div>
        <p class="text-base sm:text-lg md:text-xl font-semibold text-gray-700">{{ t('leaderboard.loading') }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="leaderboard.length === 0" class="p-10 sm:p-12 md:p-16 text-center">
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

      <!-- Leaderboard Items -->
      <div v-else class="divide-y-2 divide-gray-200">
        <div
          v-for="(player, index) in paginatedLeaderboard"
          :key="player.playerId || index"
          class="p-5 sm:p-6 md:p-7 lg:p-8 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all active:scale-[0.98]"
          style="touch-action: manipulation;"
          :class="{
            'bg-gradient-to-r from-yellow-50 to-orange-50': (startIndex + index) === 0,
            'bg-gradient-to-r from-gray-50 to-slate-50': (startIndex + index) === 1,
            'bg-gradient-to-r from-amber-50 to-yellow-50': (startIndex + index) === 2,
          }"
        >
          <div class="flex items-center justify-between gap-3 sm:gap-4 md:gap-5">
            <div class="flex items-center space-x-3 sm:space-x-4 md:space-x-5 flex-1 min-w-0">
              <!-- Rank -->
              <div
                class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-extrabold text-lg sm:text-xl md:text-2xl shadow-xl ring-4"
                :class="{
                  'bg-gradient-to-br from-yellow-400 to-orange-500 text-white ring-yellow-300': (startIndex + index) === 0,
                  'bg-gradient-to-br from-gray-300 to-gray-400 text-white ring-gray-200': (startIndex + index) === 1,
                  'bg-gradient-to-br from-amber-400 to-yellow-500 text-white ring-amber-300': (startIndex + index) === 2,
                  'bg-gradient-to-br from-blue-200 to-purple-200 text-gray-700 ring-blue-100': (startIndex + index) > 2,
                }"
              >
                <span v-if="(startIndex + index) === 0">🥇</span>
                <span v-else-if="(startIndex + index) === 1">🥈</span>
                <span v-else-if="(startIndex + index) === 2">🥉</span>
                <span v-else>{{ startIndex + index + 1 }}</span>
              </div>

              <!-- Player Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-3 sm:space-x-4 md:space-x-5">
                  <div
                    class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-extrabold text-white text-base sm:text-lg md:text-xl shadow-xl ring-4"
                    :class="{
                      'bg-gradient-to-br from-yellow-400 to-orange-500 ring-yellow-300': (startIndex + index) === 0,
                      'bg-gradient-to-br from-gray-400 to-gray-500 ring-gray-200': (startIndex + index) === 1,
                      'bg-gradient-to-br from-amber-400 to-yellow-500 ring-amber-300': (startIndex + index) === 2,
                      'bg-gradient-to-br from-blue-500 to-purple-600 ring-blue-200': (startIndex + index) > 2,
                    }"
                  >
                    {{ player.playerName ? player.playerName.charAt(0).toUpperCase() : '?' }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-extrabold text-gray-900 text-lg sm:text-xl md:text-2xl truncate">
                      {{ player.playerName || t('leaderboard.anonymous') }}
                    </p>
                    <p class="text-xs sm:text-sm md:text-base text-gray-500 truncate hidden sm:block">
                      {{ player.playerId }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Score -->
              <div class="text-right flex-shrink-0">
                <div class="flex items-center space-x-2">
                  <span
                    class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold"
                    :class="{
                      'text-yellow-600': (startIndex + index) === 0,
                      'text-gray-600': (startIndex + index) === 1,
                      'text-amber-600': (startIndex + index) === 2,
                      'text-blue-600': (startIndex + index) > 2,
                    }"
                  >
                    {{ player.score }}
                  </span>
                  <span class="text-sm sm:text-base md:text-lg font-bold text-gray-600">{{ t('leaderboard.pts') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="border-t-2 border-gray-200 bg-gray-50 px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-sm sm:text-base text-gray-600">
          {{ formatPaginationText(startIndex + 1, Math.min(endIndex, totalItems), totalItems) }}
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            :class="{
              'opacity-50 cursor-not-allowed': currentPage === 1,
              'hover:bg-gray-200': currentPage > 1
            }"
            class="px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg transition-all disabled:cursor-not-allowed"
            style="touch-action: manipulation;"
          >
            {{ t('leaderboard.pagination.previous') }}
          </button>
          
          <div class="flex items-center gap-1 sm:gap-2">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="{
                'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600': page === currentPage,
                'bg-white text-gray-700 border-gray-300 hover:bg-gray-50': page !== currentPage
              }"
              class="w-8 sm:w-10 h-8 sm:h-10 text-sm sm:text-base font-semibold border-2 rounded-lg transition-all"
              style="touch-action: manipulation;"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            :class="{
              'opacity-50 cursor-not-allowed': currentPage === totalPages,
              'hover:bg-gray-200': currentPage < totalPages
            }"
            class="px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg transition-all disabled:cursor-not-allowed"
            style="touch-action: manipulation;"
          >
            {{ t('leaderboard.pagination.next') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-4 sm:mt-5 md:mt-6 lg:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
      <router-link
        to="/player/quiz"
        class="w-full sm:w-auto px-5 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 text-center shadow-lg hover:shadow-xl min-h-[56px] sm:min-h-[60px] flex items-center justify-center"
        style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
      >
        {{ t('leaderboard.replay') }}
      </router-link>
      <router-link
        to="/player/register"
        class="w-full sm:w-auto px-5 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl bg-white border-3 sm:border-[3px] border-gray-300 text-gray-700 font-semibold rounded-xl sm:rounded-2xl hover:bg-gray-50 transition-all text-center shadow-md hover:shadow-lg active:scale-95 min-h-[56px] sm:min-h-[60px] flex items-center justify-center"
        style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
      >
        {{ t('leaderboard.newPlayer') }}
      </router-link>
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client'
import axios from 'axios'
import { API_URLS, API_CONFIG } from '@/config/api'
import { useI18n } from '@/composables/useI18n'

export default {
  setup() {
    const { t } = useI18n()
    return { t }
  },
  data() {
    return {
      leaderboard: [],
      socket: null,
      loading: true,
      currentPage: 1,
      itemsPerPage: 5,
    }
  },
  computed: {
    totalItems() {
      return this.leaderboard.length
    },
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage)
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage
    },
    endIndex() {
      return this.startIndex + this.itemsPerPage
    },
    paginatedLeaderboard() {
      return this.leaderboard.slice(this.startIndex, this.endIndex)
    },
    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    },
  },
  methods: {
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        // Scroll to top of leaderboard
        this.$nextTick(() => {
          const leaderboardElement = document.querySelector('.bg-gradient-to-br.from-white.to-gray-50')
          if (leaderboardElement) {
            leaderboardElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        })
      }
    },
    formatPaginationText(start, end, total) {
      const text = this.t('leaderboard.pagination.showing')
      return text
        .replace('{start}', start)
        .replace('{end}', end)
        .replace('{total}', total)
        .replace('{to}', end)
    },
  },
  async mounted() {
    // --- 1. Load initial leaderboard from API
    try {
      const res = await axios.get(API_URLS.game.leaderboard)
      console.log('📊 Raw leaderboard response:', res.data)
      
      // S'assurer que les données sont un tableau
      let data = res.data
      if (!Array.isArray(data)) {
        console.warn('⚠️ Leaderboard response is not an array:', typeof data)
        data = []
      }
      
      // Filtrer et mapper les données
      this.leaderboard = data
        .filter(item => item && (item.playerId || item._id))
        .map(item => ({
          playerId: item.playerId || item._id || 'unknown',
          playerName: item.playerName || item.name || this.t('leaderboard.anonymous'),
          score: item.score || 0
        }))
      
      // Trier par score décroissant
      this.leaderboard.sort((a, b) => (b.score || 0) - (a.score || 0))
      console.log(`✅ Leaderboard loaded: ${this.leaderboard.length} players`, this.leaderboard)
    } catch (err) {
      console.error('❌ Erreur chargement leaderboard:', err)
      this.leaderboard = []
    } finally {
      this.loading = false
    }

    // --- 2. Connect to Socket.IO
    // IMPORTANT: Les WebSockets doivent TOUJOURS se connecter directement au game-service
    // L'API Gateway ne gère pas les WebSockets
    // Utiliser API_URLS.ws.game qui pointe toujours vers le game-service directement
    const wsUrl = API_URLS.ws.game
    
    // Détecter si on est en production
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    
    if (isProduction) {
      console.log('🌐 Production mode - Using WebSocket URL:', wsUrl)
    } else {
      console.log('🏠 Development mode - Using WebSocket URL (direct to game-service):', wsUrl)
    }
    
    this.socket = io(wsUrl, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      reconnection: true,
      forceNew: false,
      autoConnect: true
    })

    // Optional: register player socket
    const playerId = localStorage.getItem('playerId')
    if (playerId) {
      this.socket.emit('register', playerId)
    }

    // --- 3. Listen for score updates
    this.socket.on('score:update', (data) => {
      const entry = this.leaderboard.find((p) => p.playerId === data.playerId)
      if (entry) {
        entry.score = data.score || 0
      } else {
        this.leaderboard.push({
          playerId: data.playerId,
          playerName: data.playerName || this.t('leaderboard.anonymous'),
          score: data.score || 0,
        })
      }

      // Sort descending
      this.leaderboard.sort((a, b) => (b.score || 0) - (a.score || 0))
    })

    // Optional: listen to leaderboard broadcast
    this.socket.on('leaderboard:update', (scores) => {
      this.leaderboard = Array.isArray(scores) ? scores : []
      this.leaderboard.sort((a, b) => (b.score || 0) - (a.score || 0))
    })
    
    // Polling périodique pour mettre à jour le leaderboard
    setInterval(async () => {
      try {
        const res = await axios.get(API_URLS.game.leaderboard)
        this.leaderboard = Array.isArray(res.data) ? res.data : []
        this.leaderboard.sort((a, b) => (b.score || 0) - (a.score || 0))
      } catch (err) {
        console.error('❌ Erreur polling leaderboard:', err)
      }
    }, 3000) // Toutes les 3 secondes
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect()
    }
  },
}
</script>
