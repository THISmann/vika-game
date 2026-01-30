<template>
  <div class="min-h-[calc(100vh-3.5rem)] sm:min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-0 sm:py-6 md:py-8 px-0 sm:px-4 md:px-6 safe-area-inset">
    <!-- Étape 1: Entrer le code -->
    <div v-if="step === 1" class="w-full sm:max-w-md h-[calc(100vh-3.5rem)] sm:h-auto flex flex-col">
      <div class="bg-gradient-to-br from-white to-blue-50 rounded-none sm:rounded-2xl md:rounded-3xl shadow-none sm:shadow-xl md:shadow-2xl border-0 sm:border-2 border-blue-200 p-6 sm:p-8 md:p-10 flex-1 flex flex-col justify-center">
        <div class="text-center mb-6 sm:mb-8">
          <div class="mx-auto flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 mb-5 sm:mb-6 shadow-xl ring-4 ring-blue-200/50">
            <svg class="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 sm:mb-3 leading-tight">{{ t('register.enterCode') }}</h2>
          <p class="text-sm sm:text-base text-gray-600 leading-relaxed">{{ t('register.askCode') }}</p>
        </div>

        <div class="space-y-6 sm:space-y-7">
          <div>
            <label for="game-code" class="block text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">
              {{ t('register.gameCode') }}
            </label>
            <input
              id="game-code"
              v-model="gameCode"
              type="text"
              required
              maxlength="6"
              autofocus
              inputmode="text"
              autocapitalize="characters"
              autocomplete="off"
              spellcheck="false"
              class="appearance-none relative block w-full px-4 sm:px-6 py-4 sm:py-5 border-2 sm:border-[3px] border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-center text-2xl sm:text-3xl md:text-4xl font-mono tracking-[0.2em] sm:tracking-[0.3em] uppercase bg-white shadow-md focus:shadow-lg touch-manipulation"
              placeholder="ABC123"
              @input="gameCode = gameCode.toUpperCase().replace(/[^A-Z0-9]/g, '')"
            />
          </div>

          <div v-if="error" class="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm sm:text-base flex items-start space-x-2">
            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span>{{ error }}</span>
          </div>

          <button
            type="button"
            :disabled="!gameCode || gameCode.length < 3 || verifyingCode"
            @click.prevent="verifyGameCode"
            class="group relative w-full flex justify-center items-center py-4 sm:py-5 px-6 border border-transparent text-base sm:text-lg md:text-xl font-bold rounded-xl sm:rounded-2xl text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl min-h-[56px] sm:min-h-[64px] touch-manipulation"
            style="-webkit-tap-highlight-color: transparent;"
          >
            <span v-if="verifyingCode" class="absolute left-4 inset-y-0 flex items-center">
              <svg class="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            <span :class="{ 'opacity-0': verifyingCode }">{{ verifyingCode ? t('register.verifying') : t('register.verifyCode') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Étape 2: Entrer le nom (même structure que étape 1 pour mobile) -->
    <div v-else-if="step === 2" class="w-full sm:max-w-md h-[calc(100vh-3.5rem)] sm:h-auto flex flex-col min-h-0 overflow-y-auto sm:overflow-visible">
      <div class="bg-gradient-to-br from-white to-blue-50 rounded-none sm:rounded-2xl md:rounded-3xl shadow-none sm:shadow-xl md:shadow-2xl border-0 sm:border-2 border-blue-200 p-6 sm:p-8 md:p-10 flex-1 flex flex-col justify-start sm:justify-center min-h-0">
        <div class="text-center mb-6 sm:mb-8">
          <div class="mx-auto flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-5 sm:mb-6 shadow-xl ring-4 ring-green-200/50">
            <svg class="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div class="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            <span class="font-mono font-bold">{{ gameCode }}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 sm:mb-3 leading-tight">{{ t('register.enterName') }}</h2>
          <p class="text-sm sm:text-base text-gray-600 leading-relaxed">{{ t('register.nameHint') }}</p>
        </div>

        <form @submit.prevent="registerPlayer" class="space-y-6 sm:space-y-7">
          <div>
            <label for="player-name" class="block text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">
              {{ t('register.name') }}
            </label>
            <input
              id="player-name"
              v-model="name"
              type="text"
              required
              autofocus
              maxlength="20"
              inputmode="text"
              autocomplete="name"
              class="appearance-none relative block w-full px-4 sm:px-6 py-4 sm:py-5 border-2 sm:border-[3px] border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/50 focus:border-green-500 transition-all text-base sm:text-lg bg-white shadow-md focus:shadow-lg touch-manipulation"
              :placeholder="t('register.namePlaceholder') || 'Ex: Alice, Bob, SuperJoueur...'"
            />
            <p class="mt-2 text-xs sm:text-sm text-gray-500 flex items-center justify-between flex-wrap gap-1">
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ t('register.maxChars') }}
              </span>
              <span class="tabular-nums text-gray-600" :class="{ 'text-amber-600 font-medium': name.length >= 18 }" aria-live="polite">{{ name.length }} / 20</span>
            </p>
          </div>

          <div v-if="gameStarted" class="bg-yellow-50 border-2 border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl text-sm sm:text-base flex items-start space-x-2">
            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span>{{ t('register.gameStarted') || 'Le jeu a déjà commencé. Vous ne pourrez pas vous connecter.' }}</span>
          </div>

          <div v-if="error" class="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm sm:text-base flex items-start space-x-2">
            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span>{{ error }}</span>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              @click="step = 1"
              class="w-full sm:flex-1 py-4 sm:py-5 px-6 border-2 border-gray-300 text-gray-700 rounded-xl sm:rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-all font-semibold text-base sm:text-lg touch-manipulation min-h-[56px] sm:min-h-[64px]"
              style="-webkit-tap-highlight-color: transparent;"
            >
              <span class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                {{ t('common.back') }}
              </span>
            </button>
            <button
              type="submit"
              :disabled="!name || name.trim().length < 2 || loading || gameStarted"
              @click.prevent="registerPlayer"
              class="w-full sm:flex-1 group relative flex justify-center items-center py-4 sm:py-5 px-6 border border-transparent text-base sm:text-lg md:text-xl font-bold rounded-xl sm:rounded-2xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-green-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl min-h-[56px] sm:min-h-[64px] touch-manipulation"
              style="-webkit-tap-highlight-color: transparent;"
            >
              <span v-if="loading" class="absolute left-4 inset-y-0 flex items-center">
                <svg class="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              <span :class="{ 'opacity-0': loading }">{{ loading ? t('register.registering') : t('register.join') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Étape 3: En attente du démarrage -->
    <div v-else-if="step === 3" class="w-full sm:max-w-md h-[calc(100vh-3.5rem)] sm:h-auto flex flex-col">
      <div class="bg-white rounded-none sm:rounded-2xl md:rounded-3xl shadow-none sm:shadow-xl md:shadow-2xl border-0 sm:border-2 border-gray-200 p-6 sm:p-8 md:p-10 flex-1 flex flex-col justify-center">
        <!-- Party Information -->
        <div v-if="partyInfo" class="mb-6 sm:mb-8 text-center">
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">{{ partyInfo.name }}</h2>
          <p v-if="partyInfo.description" class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed px-2">{{ partyInfo.description }}</p>
          
          <!-- Image -->
          <div v-if="partyInfo.imageUrl" class="mb-4 sm:mb-6">
            <img 
              :src="getFileUrl(partyInfo.imageUrl)" 
              :alt="partyInfo.name" 
              class="w-full h-48 sm:h-56 md:h-64 object-cover rounded-xl sm:rounded-2xl shadow-lg"
              loading="lazy"
            />
          </div>
          
          <!-- Audio -->
          <div v-if="partyInfo.audioUrl" class="mb-4 sm:mb-6">
            <audio 
              :src="getFileUrl(partyInfo.audioUrl)" 
              controls 
              class="w-full rounded-xl shadow-sm"
              preload="metadata"
            ></audio>
          </div>
          
          <!-- Scheduled Time -->
          <div v-if="partyInfo.scheduledStartTime" class="mb-4 sm:mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <div class="flex items-center justify-center space-x-2 text-blue-800 mb-2">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-semibold text-sm sm:text-base">{{ t('register.partyScheduled') || 'Partie programmée' }}</span>
            </div>
            <p class="text-sm sm:text-base font-bold text-blue-900">{{ formatScheduledTime(partyInfo.scheduledStartTime) }}</p>
          </div>
        </div>
        
        <!-- Waiting Message -->
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-5 sm:mb-6 shadow-lg">
            <svg class="h-10 w-10 sm:h-12 sm:w-12 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">{{ t('register.waiting') }}</h2>
          <p class="text-sm sm:text-base text-gray-600 mb-2 leading-relaxed">
            {{ t('register.welcome') }}, <span class="font-bold text-blue-600">{{ name }}</span> !
          </p>
          <p class="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 leading-relaxed px-2">{{ t('register.waitingDesc') }}</p>
          <div class="mt-6">
            <div class="inline-flex items-center px-4 py-2.5 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold shadow-sm">
              <svg class="w-4 h-4 mr-2 animate-pulse flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
              <span class="font-mono">{{ gameCode }}</span>
            </div>
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
import { useI18n } from '@/composables/useI18n'

export default {
  setup() {
    const { t } = useI18n()
    return { t }
  },
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
      socket: null,
      partyInfo: null
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
          // Si c'est une partie, stocker les informations
          if (res.data.isParty && res.data.party) {
            this.partyInfo = res.data.party
          }
          // Si le jeu a commencé, afficher un message mais permettre quand même l'inscription
          // Le joueur pourra se connecter s'il était déjà enregistré
          if (this.gameStarted) {
            this.error = this.t('register.gameStarted')
            // Permettre quand même de continuer
          }
          // Passer à l'étape 2
          this.step = 2
        } else {
          this.error = this.t('register.invalidCode')
        }
      } catch (err) {
        this.error = err.response?.data?.error || this.t('register.error')
      } finally {
        this.verifyingCode = false
      }
    },
    async registerPlayer() {
      if (!this.name || this.name.trim().length < 2) {
        this.error = this.t('register.nameRequired')
        return
      }

      if (!this.codeVerified) {
        this.error = this.t('register.verifyFirst')
        return
      }

      if (this.gameStarted) {
        this.error = this.t('register.gameStarted')
        return
      }

      this.loading = true
      this.error = ''

      try {
        const res = await axios.post(API_URLS.auth.registerPlayer, {
          name: this.name.trim(),
          gameCode: this.gameCode.toUpperCase()
        })

        localStorage.setItem('playerId', res.data.id)
        localStorage.setItem('playerName', res.data.name)
        localStorage.setItem('gameCode', this.gameCode.toUpperCase())

        // Passer à l'étape 3 (attente)
        this.step = 3

        // Utiliser le socketService singleton pour réutiliser la même connexion
        this.socket = socketService.getSocket()
        const componentId = 'PlayerRegister'
        
        // console.log('📝 Player registered via API, playerId:', res.data.id)
          // console.log('📝 Socket state:', {
          //   connected: this.socket.connected,
          //   disconnected: this.socket.disconnected,
          //   id: this.socket.id,
          //   url: API_URLS.ws.game
          // })
        
        // Enregistrer le joueur via socketService qui gère automatiquement la connexion
        // console.log('🔵 [PlayerRegister] About to register player on socket:', res.data.id)
        // console.log('🔵 [PlayerRegister] Socket state before register:', {
        //   connected: this.socket.connected,
        //   disconnected: this.socket.disconnected,
        //   connecting: this.socket.connecting,
        //   id: this.socket.id
        // })
        socketService.registerPlayer(res.data.id)
        // console.log('🔵 [PlayerRegister] registerPlayer called (socketService handles connection automatically)')

        // Écouter le démarrage du jeu
        socketService.on('game:started', (data) => {
          // console.log('🎮 Game started event received in PlayerRegister:', data)
          // Rediriger vers le quiz immédiatement (sans délai pour éviter de manquer la question)
          this.$router.push('/player/quiz').catch(err => {
            // Ignorer l'erreur de navigation si on est déjà sur la route
            if (err.name !== 'NavigationDuplicated') {
              // console.error('Navigation error:', err)
            }
          })
        }, componentId)

        socketService.on('question:next', (data) => {
          // console.log('❓ Question next event received in PlayerRegister:', data)
          // Rediriger vers le quiz immédiatement si une question arrive
          // Le composant QuizPlay chargera la question via le polling ou recevra l'événement
          this.$router.push('/player/quiz').catch(err => {
            // Ignorer l'erreur de navigation si on est déjà sur la route
            if (err.name !== 'NavigationDuplicated') {
              // console.error('Navigation error:', err)
            }
          })
        }, componentId)

        socketService.on('error', (data) => {
          // console.error('❌ Socket error:', data)
          // Si c'est une erreur de jeu déjà commencé, ne pas bloquer si le joueur était déjà enregistré
          if (data.code === 'GAME_ALREADY_STARTED') {
            // Vérifier si le joueur était déjà enregistré avant le démarrage
            // Si oui, permettre la reconnexion
            const wasRegistered = localStorage.getItem('playerId') === res.data.id
            if (wasRegistered) {
              // console.log('🔄 Player was already registered, allowing reconnection')
              // Ne pas afficher l'erreur, juste rediriger vers le quiz
        setTimeout(() => {
          this.$router.push('/player/quiz')
              }, 100)
            } else {
              this.error = this.t('register.gameStarted')
              this.step = 2 // Go back to name step
            }
          } else {
            this.error = data.message || this.t('register.connectionError')
            this.step = 2 // Go back to name step on error
          }
        }, componentId)

      } catch (err) {
        if (err.response && err.response.status === 409) {
          this.error = this.t('register.nameTaken')
        } else {
          this.error = this.t('register.serverError')
        }
        this.step = 2
      } finally {
        this.loading = false
      }
    },
    getFileUrl(url) {
      if (!url) return ''
      // Si l'URL est déjà complète, la retourner telle quelle
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
      }
      // Sinon, construire l'URL complète
      const baseUrl = API_CONFIG.GAME_SERVICE.replace('/game', '')
      return `${baseUrl}${url}`
    },
    formatScheduledTime(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const lang = localStorage.getItem('gameLanguage') || 'fr'
      return date.toLocaleString(lang === 'fr' ? 'fr-FR' : lang === 'ru' ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },
}
</script>

<style scoped>
/* Safe area support for iPhone notch and home indicator */
.safe-area-inset {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Touch-friendly improvements */
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
}

/* Prevent text selection on buttons */
button {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Improve input focus on mobile */
input:focus {
  font-size: 16px; /* Prevents zoom on iOS */
}

/* Smooth transitions for better UX */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Mobile fullscreen - no padding on mobile */
@media (max-width: 640px) {
  .min-h-screen {
    padding: 0 !important;
  }
  
  /* Ensure card takes full screen on mobile */
  .flex.flex-col {
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height for mobile browsers */
  }
}

/* Landscape orientation adjustments for tablets (only for larger screens) */
@media (orientation: landscape) and (max-height: 600px) and (min-width: 641px) {
  .min-h-screen {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
}
</style>
