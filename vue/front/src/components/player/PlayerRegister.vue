<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-4 sm:py-8 md:py-12 px-4 sm:px-6">
    <!-- Étape 1: Entrer le code -->
    <div v-if="step === 1" class="max-w-md w-full">
      <div class="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-8">
        <div class="text-center mb-8">
          <div class="mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 sm:mb-6 animate-pulse">
            <svg class="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Entrer le code de la partie</h2>
          <p class="text-xs sm:text-sm text-gray-600">Demandez le code à l'administrateur</p>
        </div>

        <div class="space-y-6">
          <div>
            <label for="game-code" class="block text-sm font-medium text-gray-700 mb-3">
              Code de la partie
            </label>
            <input
              id="game-code"
              v-model="gameCode"
              type="text"
              required
              maxlength="6"
              autofocus
              class="appearance-none relative block w-full px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-2xl sm:text-3xl font-mono tracking-widest uppercase bg-gray-50"
              placeholder="ABC123"
              @input="gameCode = gameCode.toUpperCase().replace(/[^A-Z0-9]/g, '')"
            />
          </div>

          <div v-if="error" class="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {{ error }}
          </div>

          <button
            type="button"
            :disabled="!gameCode || gameCode.length < 3 || verifyingCode"
            @click="verifyGameCode"
            @touchstart.prevent
            class="group relative w-full flex justify-center py-4 px-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg touch-manipulation"
            style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
          >
            <span v-if="verifyingCode" class="absolute left-0 inset-y-0 flex items-center pl-4">
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ verifyingCode ? 'Vérification...' : 'Vérifier le code' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Étape 2: Entrer le nom -->
    <div v-else-if="step === 2" class="max-w-md w-full">
      <div class="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-8">
        <div class="text-center mb-6 sm:mb-8">
          <div class="mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4 sm:mb-6">
            <svg class="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
          <div class="mb-4">
            <div class="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Code vérifié: {{ gameCode }}
            </div>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Choisissez votre nom</h2>
          <p class="text-xs sm:text-sm text-gray-600">Comment voulez-vous être appelé ?</p>
        </div>

        <form @submit.prevent="registerPlayer" class="space-y-4 sm:space-y-6">
        <div>
            <label for="player-name" class="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
              Votre nom de joueur
          </label>
          <input
            id="player-name"
            v-model="name"
            type="text"
            required
              autofocus
              maxlength="20"
              class="appearance-none relative block w-full px-4 py-3 sm:py-4 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-base sm:text-lg bg-gray-50"
              placeholder="Ex: Alice, Bob, SuperJoueur..."
            />
            <p class="mt-2 text-xs text-gray-500">Maximum 20 caractères</p>
          </div>

          <div v-if="gameStarted" class="bg-yellow-50 border-2 border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
            ⚠️ Le jeu a déjà commencé. Vous ne pourrez pas vous connecter.
        </div>

          <div v-if="error" class="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ error }}
        </div>

          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              @click="step = 1"
              class="w-full sm:flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all font-medium text-sm sm:text-base"
            >
              ← Retour
            </button>
        <button
          type="submit"
              :disabled="!name || name.trim().length < 2 || loading || gameStarted"
              @click.prevent="registerPlayer"
              @touchstart.prevent
              class="w-full sm:flex-1 group relative flex justify-center py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg sm:rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg touch-manipulation"
              style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
        >
              <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-4">
            <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
              {{ loading ? 'Inscription...' : 'Rejoindre la partie' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Étape 3: En attente du démarrage -->
    <div v-else-if="step === 3" class="max-w-md w-full">
      <div class="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-8 text-center">
        <div class="mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 sm:mb-6">
          <svg class="h-8 w-8 sm:h-10 sm:w-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">⏳ En attente du démarrage</h2>
        <p class="text-sm sm:text-base text-gray-600 mb-2">Bienvenue, <span class="font-bold text-blue-600">{{ name }}</span> !</p>
        <p class="text-xs sm:text-sm text-gray-600">L'administrateur va bientôt démarrer la partie...</p>
        <div class="mt-6">
          <div class="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm">
            <svg class="w-4 h-4 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
            Code: {{ gameCode }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { API_URLS, API_CONFIG } from '@/config/api'
import socketService from '@/services/socketService'

export default {
  data() {
    return {
      step: 1, // 1: code, 2: nom, 3: attente
      gameCode: '',
      name: '',
      codeVerified: false,
      verifyingCode: false,
      gameStarted: false,
      loading: false,
      error: '',
      socket: null
    }
  },
  mounted() {
    // Vérifier si on a déjà un code dans l'URL ou localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const codeFromUrl = urlParams.get('code')
    if (codeFromUrl) {
      this.gameCode = codeFromUrl.toUpperCase()
    }
  },
  beforeUnmount() {
    // Nettoyer les listeners mais garder la connexion active pour les autres composants
    socketService.off('PlayerRegister')
    // Ne pas déconnecter le socket car il est partagé avec QuizPlay
  },
  methods: {
    async verifyGameCode() {
      if (!this.gameCode || this.gameCode.length < 3) {
        this.error = 'Veuillez entrer un code valide (minimum 3 caractères)'
        return
      }

      this.verifyingCode = true
      this.error = ''

      try {
        const res = await axios.post(API_URLS.game.verifyCode, {
          code: this.gameCode.toUpperCase()
        })

        if (res.data.valid) {
          this.codeVerified = true
          this.gameStarted = res.data.isStarted
          // Si le jeu a commencé, afficher un message mais permettre quand même l'inscription
          // Le joueur pourra se connecter s'il était déjà enregistré
          if (this.gameStarted) {
            this.error = 'Le jeu a déjà commencé. Vous pouvez vous inscrire mais vous ne pourrez rejoindre que si vous étiez déjà enregistré.'
            // Permettre quand même de continuer
          }
          // Passer à l'étape 2
          this.step = 2
        } else {
          this.error = 'Code invalide. Vérifiez le code et réessayez.'
        }
      } catch (err) {
        this.error = err.response?.data?.error || 'Erreur lors de la vérification du code'
      } finally {
        this.verifyingCode = false
      }
    },
    async registerPlayer() {
      if (!this.name || this.name.trim().length < 2) {
        this.error = 'Veuillez entrer un nom valide (minimum 2 caractères)'
        return
      }

      if (!this.codeVerified) {
        this.error = 'Veuillez d\'abord vérifier le code de la partie'
        return
      }

      if (this.gameStarted) {
        this.error = 'Le jeu a déjà commencé. Vous ne pouvez plus vous connecter.'
        return
      }

      this.loading = true
      this.error = ''

      try {
        const res = await axios.post(API_URLS.auth.register, {
          name: this.name.trim(),
        })

        localStorage.setItem('playerId', res.data.id)
        localStorage.setItem('playerName', res.data.name)
        localStorage.setItem('gameCode', this.gameCode.toUpperCase())

        // Passer à l'étape 3 (attente)
        this.step = 3

        // Utiliser le socketService singleton pour réutiliser la même connexion
        this.socket = socketService.getSocket()
        const componentId = 'PlayerRegister'
        
        // Enregistrer le joueur via le service
        socketService.registerPlayer(res.data.id)
        
        // Attendre que la connexion soit établie si nécessaire
        if (!this.socket.connected) {
          this.socket.once('connect', () => {
            console.log('✅ WebSocket connected, registering player:', res.data.id)
            socketService.registerPlayer(res.data.id)
          })
        }

        // Écouter le démarrage du jeu
        socketService.on('game:started', (data) => {
          console.log('🎮 Game started event received in PlayerRegister:', data)
          // Rediriger vers le quiz immédiatement
          setTimeout(() => {
            this.$router.push('/player/quiz')
          }, 100)
        }, componentId)

        socketService.on('question:next', (data) => {
          console.log('❓ Question next event received in PlayerRegister:', data)
          // Rediriger vers le quiz si une question arrive
          setTimeout(() => {
            this.$router.push('/player/quiz')
          }, 100)
        }, componentId)

        socketService.on('error', (data) => {
          console.error('❌ Socket error:', data)
          // Si c'est une erreur de jeu déjà commencé, ne pas bloquer si le joueur était déjà enregistré
          if (data.code === 'GAME_ALREADY_STARTED') {
            // Vérifier si le joueur était déjà enregistré avant le démarrage
            // Si oui, permettre la reconnexion
            const wasRegistered = localStorage.getItem('playerId') === res.data.id
            if (wasRegistered) {
              console.log('🔄 Player was already registered, allowing reconnection')
              // Ne pas afficher l'erreur, juste rediriger vers le quiz
              setTimeout(() => {
                this.$router.push('/player/quiz')
              }, 100)
            } else {
              this.error = 'Le jeu a déjà commencé. Vous ne pouvez plus vous connecter.'
              this.step = 2 // Go back to name step
            }
          } else {
            this.error = data.message || 'Erreur de connexion'
            this.step = 2 // Go back to name step on error
          }
        }, componentId)

      } catch (err) {
        if (err.response && err.response.status === 409) {
          this.error = 'Ce nom est déjà pris, choisissez un autre nom'
        } else {
          this.error = 'Erreur serveur. Veuillez réessayer.'
        }
        this.step = 2
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
