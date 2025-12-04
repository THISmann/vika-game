<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
      <div class="text-center">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4"
        >
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ t('leaderboard.title') }}</h1>
        <p class="text-gray-600">{{ t('leaderboard.subtitle') }}</p>
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
          v-for="(player, index) in leaderboard"
          :key="player.playerId || index"
          class="p-5 sm:p-6 md:p-7 lg:p-8 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all active:scale-[0.98]"
          style="touch-action: manipulation;"
          :class="{
            'bg-gradient-to-r from-yellow-50 to-orange-50': index === 0,
            'bg-gradient-to-r from-gray-50 to-slate-50': index === 1,
            'bg-gradient-to-r from-amber-50 to-yellow-50': index === 2,
          }"
        >
          <div class="flex items-center justify-between gap-3 sm:gap-4 md:gap-5">
            <div class="flex items-center space-x-3 sm:space-x-4 md:space-x-5 flex-1 min-w-0">
              <!-- Rank -->
              <div
                class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-extrabold text-lg sm:text-xl md:text-2xl shadow-xl ring-4"
                :class="{
                  'bg-gradient-to-br from-yellow-400 to-orange-500 text-white ring-yellow-300': index === 0,
                  'bg-gradient-to-br from-gray-300 to-gray-400 text-white ring-gray-200': index === 1,
                  'bg-gradient-to-br from-amber-400 to-yellow-500 text-white ring-amber-300': index === 2,
                  'bg-gradient-to-br from-blue-200 to-purple-200 text-gray-700 ring-blue-100': index > 2,
                }"
              >
                <span v-if="index === 0">🥇</span>
                <span v-else-if="index === 1">🥈</span>
                <span v-else-if="index === 2">🥉</span>
                <span v-else>{{ index + 1 }}</span>
              </div>

              <!-- Player Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-3 sm:space-x-4 md:space-x-5">
                  <div
                    class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-extrabold text-white text-base sm:text-lg md:text-xl shadow-xl ring-4"
                    :class="{
                      'bg-gradient-to-br from-yellow-400 to-orange-500 ring-yellow-300': index === 0,
                      'bg-gradient-to-br from-gray-400 to-gray-500 ring-gray-200': index === 1,
                      'bg-gradient-to-br from-amber-400 to-yellow-500 ring-amber-300': index === 2,
                      'bg-gradient-to-br from-blue-500 to-purple-600 ring-blue-200': index > 2,
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
                      'text-yellow-600': index === 0,
                      'text-gray-600': index === 1,
                      'text-amber-600': index === 2,
                      'text-blue-600': index > 2,
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
    </div>

    <!-- Actions -->
    <div class="mt-5 sm:mt-6 md:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
      <router-link
        to="/player/quiz"
        class="px-5 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 text-center shadow-lg hover:shadow-xl min-h-[56px] sm:min-h-[60px] flex items-center justify-center"
        style="touch-action: manipulation;"
      >
        {{ t('leaderboard.replay') }}
      </router-link>
      <router-link
        to="/player/register"
        class="px-5 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl bg-white border-3 sm:border-[3px] border-gray-300 text-gray-700 font-semibold rounded-xl sm:rounded-2xl hover:bg-gray-50 transition-all text-center shadow-md hover:shadow-lg active:scale-95 min-h-[56px] sm:min-h-[60px] flex items-center justify-center"
        style="touch-action: manipulation;"
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
    }
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
    // Détecter si on est en production (pas localhost)
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    
    // En production, utiliser exactement la même URL que la page actuelle (qui passe par le proxy Nginx)
    let wsUrl
    if (isProduction) {
      wsUrl = `${window.location.protocol}//${window.location.host}`
      console.log('🌐 Production mode - Using current page URL for WebSocket:', wsUrl)
    } else {
      wsUrl = API_CONFIG.GAME_SERVICE
      console.log('🏠 Development mode - Using API_CONFIG.GAME_SERVICE:', wsUrl)
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
