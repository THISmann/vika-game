<template>
  <div class="min-h-screen max-w-6xl mx-auto space-y-4 sm:space-y-5 md:space-y-6 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
    <!-- Header -->
    <div class="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-5 md:p-6">
      <div class="text-center mb-4 sm:mb-5 md:mb-6">
        <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">{{ t('admin.dashboard.title') }}</h1>
        <p class="text-sm sm:text-base md:text-lg text-gray-600 px-2">{{ t('admin.dashboard.subtitle') }}</p>
      </div>

      <!-- Game Code -->
      <div v-if="gameCode" class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-yellow-300">
        <div class="text-center">
          <div class="text-xs sm:text-sm text-gray-600 mb-2">{{ t('admin.dashboard.gameCode') }}</div>
          <div class="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-600 mb-2 font-mono tracking-wider">
            {{ gameCode }}
          </div>
          <div class="text-xs sm:text-sm text-gray-600 mb-4">
            {{ t('admin.dashboard.shareCode') }}
          </div>
          
          <!-- Boutons d'action -->
          <div class="flex flex-wrap justify-center gap-2 sm:gap-3">
            <!-- Bouton Copier -->
            <button
              @click="copyGameCode"
              class="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center space-x-1 sm:space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{{ copyButtonText || t('admin.dashboard.copyCode') }}</span>
            </button>

            <!-- Bouton Partager WhatsApp -->
            <button
              @click="shareOnWhatsApp"
              class="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-[#25D366] text-white rounded-lg hover:bg-[#20ba5a] transition-all transform hover:scale-105 flex items-center space-x-1 sm:space-x-2"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>WhatsApp</span>
            </button>

            <!-- Bouton Partager Telegram -->
            <button
              @click="shareOnTelegram"
              class="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-[#0088cc] text-white rounded-lg hover:bg-[#0077b5] transition-all transform hover:scale-105 flex items-center space-x-1 sm:space-x-2"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span>Telegram</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Game State Info -->
      <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 sm:p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div class="text-center">
            <div class="text-2xl sm:text-3xl font-bold text-purple-600">{{ gameState.connectedPlayersCount }}</div>
            <div class="text-xs sm:text-sm text-gray-600 mt-1">{{ t('admin.dashboard.connectedPlayers') }}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl sm:text-3xl font-bold" :class="gameState.isStarted ? 'text-green-600' : 'text-gray-400'">
              {{ gameState.isStarted ? t('admin.dashboard.statusInProgress') : t('admin.dashboard.statusWaiting') }}
            </div>
            <div class="text-xs sm:text-sm text-gray-600 mt-1">{{ t('admin.dashboard.gameStatus') }}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl sm:text-3xl font-bold text-indigo-600">
              {{ gameState.currentQuestionIndex + 1 }}/{{ totalQuestions }}
            </div>
            <div class="text-xs sm:text-sm text-gray-600 mt-1">{{ t('admin.dashboard.currentQuestion') }}</div>
          </div>
        </div>
        
        <!-- Liste des joueurs connectés -->
        <div v-if="connectedPlayers.length > 0" class="mt-4 pt-4 border-t border-purple-200">
          <div class="text-xs sm:text-sm font-semibold text-gray-700 mb-2">{{ t('admin.dashboard.connectedPlayersList') }}</div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="player in connectedPlayers"
              :key="player.id"
              class="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-white rounded-full border border-purple-200 shadow-sm"
            >
              <div class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold mr-1.5 sm:mr-2 flex-shrink-0">
                {{ player.name ? player.name.charAt(0).toUpperCase() : '?' }}
              </div>
              <span class="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[100px] sm:max-w-none">
                {{ player.name || t('admin.dashboard.anonymousPlayer') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Game Controls -->
      <div class="space-y-4 mb-4 sm:mb-6">
        <!-- Configuration du temps par question -->
        <div v-if="!gameState.isStarted" class="bg-blue-50 rounded-xl p-3 sm:p-4 border border-blue-200">
          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            {{ t('admin.dashboard.timePerQuestion') }}
          </label>
          <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <input
              v-model.number="questionDuration"
              type="number"
              min="5"
              max="300"
              class="w-full sm:w-32 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="30"
            />
            <span class="text-xs sm:text-sm text-gray-600">
              {{ t('admin.dashboard.timeMinMax') }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button
            @click="startGame"
            :disabled="gameState.isStarted || loading || totalQuestions === 0"
            class="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('admin.dashboard.startGame') }}
          </button>
          <button
            @click="nextQuestion"
            :disabled="!gameState.isStarted || loading"
            class="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('admin.dashboard.nextQuestion') }}
          </button>
          <button
            @click="endGame"
            :disabled="!gameState.isStarted || loading"
            class="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-lg hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('admin.dashboard.endGame') }}
          </button>
          <button
            @click="deleteGame"
            :disabled="loading"
            class="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium rounded-lg hover:from-red-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('admin.dashboard.deleteGame') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <div
        @click="$router.push('/admin/questions')"
        class="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 sm:p-6 text-white cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl"
      >
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <h3 class="text-xl sm:text-2xl font-bold">{{ t('admin.nav.questions') }}</h3>
          <svg class="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p class="text-purple-100">{{ t('admin.dashboard.manageQuestionsDesc') }}</p>
        <div class="mt-4 flex items-center text-sm font-medium">
          {{ t('admin.dashboard.manageQuestions') }}
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>

      <div
        @click="$router.push('/player/leaderboard')"
        class="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 sm:p-6 text-white cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl"
      >
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <h3 class="text-xl sm:text-2xl font-bold">Classement</h3>
          <svg class="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        </div>
        <p class="text-blue-100">{{ t('admin.dashboard.viewLeaderboardDesc') }}</p>
        <div class="mt-4 flex items-center text-sm font-medium">
          {{ t('admin.dashboard.viewLeaderboard') }}
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="message" class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
      {{ message }}
    </div>
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      {{ error }}
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { io } from 'socket.io-client'
import { API_URLS, API_CONFIG } from '@/config/api'
import { useI18n } from '@/composables/useI18n'

export default {
  setup() {
    const { t } = useI18n()
    return { t }
  },
  data() {
    return {
      gameState: {
        isStarted: false,
        currentQuestionIndex: -1,
        connectedPlayersCount: 0
      },
      gameCode: null,
      totalQuestions: 0,
      questionDuration: 30, // Temps par question en secondes (défaut: 30)
      loading: false,
      message: '',
      error: '',
      socket: null,
      copyButtonText: '',
      connectedPlayers: []
    }
  },
  async mounted() {
    await this.loadGameState()
    await this.loadQuestionsCount()
    await this.loadGameCode()
    
    // Connecter au WebSocket
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
    
    console.log('🔌 Admin connecting to WebSocket:', wsUrl, 'isProduction:', isProduction, 'hostname:', window.location.hostname, 'port:', window.location.port)
    
    this.socket = io(wsUrl, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      reconnection: true,
      forceNew: false,
      autoConnect: true
    })
    
    this.socket.on('connect', () => {
      console.log('✅ Admin WebSocket connected:', this.socket.id)
    })
    
    this.socket.on('connect_error', (error) => {
      console.error('❌ Admin WebSocket connection error:', error)
    })
    
    this.socket.on('players:count', (data) => {
      this.gameState.connectedPlayersCount = data.count
    })
    
    this.socket.on('game:started', () => {
      this.loadGameState()
    })
    
    this.socket.on('game:ended', () => {
      this.loadGameState()
      this.message = this.t('admin.dashboard.gameEnded')
      setTimeout(() => this.message = '', 5000)
    })
    
    this.socket.on('question:next', () => {
      this.loadGameState()
    })
    
    // Polling pour l'état du jeu
    setInterval(() => {
      this.loadGameState()
      this.loadConnectedPlayersCount()
      this.loadConnectedPlayers()
    }, 2000)
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect()
    }
  },
  methods: {
    async loadGameState() {
      try {
        const res = await axios.get(API_URLS.game.state)
        this.gameState = res.data
        this.gameCode = res.data.gameCode || null
      } catch (err) {
        console.error('Error loading game state:', err)
      }
    },
    async loadGameCode() {
      try {
        const res = await axios.get(API_URLS.game.code)
        this.gameCode = res.data.gameCode
      } catch (err) {
        console.error('Error loading game code:', err)
      }
    },
    async loadQuestionsCount() {
      try {
        const res = await axios.get(API_URLS.quiz.all)
        this.totalQuestions = res.data.length
      } catch (err) {
        console.error('Error loading questions count:', err)
      }
    },
    async loadConnectedPlayersCount() {
      try {
        const res = await axios.get(API_URLS.game.playersCount)
        this.gameState.connectedPlayersCount = res.data.count
      } catch (err) {
        console.error('Error loading players count:', err)
      }
    },
    async loadConnectedPlayers() {
      try {
        const res = await axios.get(API_URLS.game.players)
        this.connectedPlayers = res.data.players || []
        this.gameState.connectedPlayersCount = res.data.count || 0
      } catch (err) {
        console.error('Error loading connected players:', err)
      }
    },
    async startGame() {
      // Vérifier qu'il y a des questions avant de démarrer
      if (this.totalQuestions === 0) {
        this.error = this.t('admin.dashboard.noQuestions')
        return
      }

      // Valider le temps par question
      if (!this.questionDuration || this.questionDuration < 5 || this.questionDuration > 300) {
        this.error = this.t('admin.dashboard.timeMinMax')
        return
      }
      
      this.loading = true
      this.error = ''
      this.message = ''
      
      try {
        await axios.post(API_URLS.game.start, {
          questionDuration: this.questionDuration
        })
        this.message = `${this.t('admin.dashboard.startGame')} - ${this.questionDuration}s ${this.t('admin.dashboard.timePerQuestion')}`
        await this.loadGameState()
        await this.loadQuestionsCount()
        setTimeout(() => this.message = '', 3000)
      } catch (err) {
        this.error = err.response?.data?.error || 'Erreur lors du démarrage du jeu'
      } finally {
        this.loading = false
      }
    },
    async nextQuestion() {
      this.loading = true
      this.error = ''
      this.message = ''
      
      try {
        const res = await axios.post(API_URLS.game.next)
        if (res.data.finished) {
          this.message = 'Le jeu est terminé !'
        } else {
          this.message = this.t('admin.dashboard.nextQuestionShown')
        }
        await this.loadGameState()
        setTimeout(() => this.message = '', 3000)
      } catch (err) {
        this.error = err.response?.data?.error || this.t('admin.dashboard.nextQuestionError')
      } finally {
        this.loading = false
      }
    },
    async endGame() {
      if (!confirm(this.t('admin.dashboard.confirmEndGame'))) {
        return
      }
      
      this.loading = true
      this.error = ''
      this.message = ''
      
      try {
        await axios.post(API_URLS.game.end)
        this.message = this.t('admin.dashboard.gameEnded')
        await this.loadGameState()
        setTimeout(() => this.message = '', 3000)
      } catch (err) {
        this.error = err.response?.data?.error || 'Erreur lors de la fin du jeu'
      } finally {
        this.loading = false
      }
    },
    async deleteGame() {
      if (!confirm('Êtes-vous sûr de vouloir supprimer la partie ? Tous les scores seront réinitialisés.')) {
        return
      }
      
      this.loading = true
      this.error = ''
      this.message = ''
      
      try {
        await axios.delete(API_URLS.game.delete)
        this.message = this.t('admin.dashboard.gameDeleted')
        await this.loadGameState()
        setTimeout(() => this.message = '', 3000)
      } catch (err) {
        this.error = err.response?.data?.error || 'Erreur lors de la suppression de la partie'
      } finally {
        this.loading = false
      }
    },
    async copyGameCode() {
      try {
        await navigator.clipboard.writeText(this.gameCode)
        this.copyButtonText = '✓ Copié!'
        setTimeout(() => {
          this.copyButtonText = 'Copier le code'
        }, 2000)
      } catch (err) {
        // Fallback pour les navigateurs qui ne supportent pas clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = this.gameCode
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        this.copyButtonText = '✓ Copié!'
        setTimeout(() => {
          this.copyButtonText = 'Copier le code'
        }, 2000)
      }
    },
    shareOnWhatsApp() {
      const text = encodeURIComponent(`${this.t('admin.dashboard.shareCode')} Code: ${this.gameCode}`)
      window.open(`https://wa.me/?text=${text}`, '_blank', 'width=600,height=400')
    },
    shareOnTelegram() {
      const text = encodeURIComponent(`${this.t('admin.dashboard.shareCode')} Code: ${this.gameCode}`)
      const url = encodeURIComponent(window.location.origin)
      window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank', 'width=600,height=400')
    }
  }
}
</script>
