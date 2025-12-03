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
        <h1 class="text-4xl font-bold text-gray-900 mb-2">🏆 Classement</h1>
        <p class="text-gray-600">Les meilleurs joueurs en temps réel</p>
      </div>
    </div>

    <!-- Leaderboard List -->
    <div class="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="p-8 sm:p-12 text-center">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"
        ></div>
        <p class="text-sm sm:text-base text-gray-600">Chargement du classement...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="leaderboard.length === 0" class="p-8 sm:p-12 text-center">
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
        <p class="text-gray-600">Aucun joueur pour le moment</p>
      </div>

      <!-- Leaderboard Items -->
      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="(player, index) in leaderboard"
          :key="player.playerId || index"
          class="p-3 sm:p-4 md:p-6 hover:bg-gray-50 transition-colors"
          :class="{
            'bg-gradient-to-r from-yellow-50 to-orange-50': index === 0,
            'bg-gradient-to-r from-gray-50 to-slate-50': index === 1,
            'bg-gradient-to-r from-amber-50 to-yellow-50': index === 2,
          }"
        >
          <div class="flex items-center justify-between gap-2 sm:gap-4">
            <div class="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 min-w-0">
              <!-- Rank -->
              <div
                class="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base md:text-lg"
                :class="{
                  'bg-gradient-to-br from-yellow-400 to-orange-500 text-white': index === 0,
                  'bg-gradient-to-br from-gray-300 to-gray-400 text-white': index === 1,
                  'bg-gradient-to-br from-amber-400 to-yellow-500 text-white': index === 2,
                  'bg-gray-200 text-gray-700': index > 2,
                }"
              >
                <span v-if="index === 0">🥇</span>
                <span v-else-if="index === 1">🥈</span>
                <span v-else-if="index === 2">🥉</span>
                <span v-else>{{ index + 1 }}</span>
              </div>

              <!-- Player Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 sm:space-x-3">
                  <div
                    class="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-white text-xs sm:text-sm md:text-base"
                    :class="{
                      'bg-gradient-to-br from-yellow-400 to-orange-500': index === 0,
                      'bg-gradient-to-br from-gray-400 to-gray-500': index === 1,
                      'bg-gradient-to-br from-amber-400 to-yellow-500': index === 2,
                      'bg-gradient-to-br from-blue-500 to-purple-600': index > 2,
                    }"
                  >
                    {{ player.playerName ? player.playerName.charAt(0).toUpperCase() : '?' }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-gray-900 text-sm sm:text-base md:text-lg truncate">
                      {{ player.playerName || 'Joueur anonyme' }}
                    </p>
                    <p class="text-xs sm:text-sm text-gray-500 truncate hidden sm:block">
                      {{ player.playerId }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Score -->
              <div class="text-right flex-shrink-0">
                <div class="flex items-center space-x-1">
                  <span
                    class="text-lg sm:text-xl md:text-2xl font-bold"
                    :class="{
                      'text-yellow-600': index === 0,
                      'text-gray-600': index === 1,
                      'text-amber-600': index === 2,
                      'text-blue-600': index > 2,
                    }"
                  >
                    {{ player.score }}
                  </span>
                  <span class="text-gray-500 text-xs sm:text-sm">pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
      <router-link
        to="/player/quiz"
        class="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 text-center"
      >
        Rejouer
      </router-link>
      <router-link
        to="/player/register"
        class="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all text-center"
      >
        Nouveau joueur
      </router-link>
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client'
import axios from 'axios'
import { API_URLS, API_CONFIG } from '@/config/api'

export default {
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
      // S'assurer que les données sont un tableau
      this.leaderboard = Array.isArray(res.data) ? res.data : []
      // Trier par score décroissant
      this.leaderboard.sort((a, b) => (b.score || 0) - (a.score || 0))
      console.log('✅ Leaderboard loaded:', this.leaderboard)
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
          playerName: data.playerName || 'Joueur anonyme',
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
