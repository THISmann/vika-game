<template>
  <div class="min-h-screen max-w-4xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 lg:py-6">
    <!-- Waiting for game to start -->
    <div
      v-if="!gameStarted && !gameEnded"
      class="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl border-2 border-blue-100 p-6 sm:p-8 md:p-10 lg:p-12 text-center min-h-[70vh] flex flex-col items-center justify-center"
    >
      <div
        class="inline-block animate-spin rounded-full h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 border-4 sm:border-[5px] border-blue-600 mb-5 sm:mb-6 md:mb-8"
      ></div>
      <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 sm:mb-4 md:mb-5 px-3">{{ t('quiz.waiting') }}</h2>
      <p class="text-base sm:text-lg md:text-xl text-gray-600 px-4 max-w-md">
        {{ t('quiz.waitingDesc') }}
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-else-if="loading && !current"
      class="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl border-2 border-purple-100 p-8 sm:p-10 md:p-12 text-center min-h-[70vh] flex flex-col items-center justify-center"
    >
      <div
        class="inline-block animate-spin rounded-full h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 border-4 sm:border-[5px] border-purple-600 mb-5 sm:mb-6 md:mb-8"
      ></div>
      <p class="text-base sm:text-lg md:text-xl font-semibold text-gray-700">{{ t('quiz.loading') }}</p>
    </div>

    <!-- Quiz Question -->
    <div v-else-if="current && !gameEnded" class="space-y-3 sm:space-y-4 md:space-y-6 pb-4 sm:pb-6">
      <!-- Timer -->
      <div class="bg-gradient-to-r from-white to-blue-50 rounded-3xl shadow-2xl border-2 border-blue-200 p-4 sm:p-5 md:p-6 sticky top-0 z-10 backdrop-blur-md bg-white/98 mb-3 sm:mb-4">
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <span class="text-sm sm:text-base md:text-lg font-bold text-gray-800">
            {{ t('quiz.question') }} {{ currentQuestionIndex + 1 }}/{{ totalQuestions }}
          </span>
          <div class="flex items-center space-x-2 sm:space-x-3">
            <div
              class="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-4 sm:border-[6px] flex items-center justify-center font-extrabold text-xl sm:text-2xl md:text-3xl shadow-xl ring-4 ring-opacity-20"
              :class="{
                'border-green-500 text-green-600 ring-green-500': timeLeft > 10,
                'border-yellow-500 text-yellow-600 ring-yellow-500': timeLeft <= 10 && timeLeft > 5,
                'border-red-500 text-red-600 ring-red-500 animate-pulse': timeLeft <= 5,
              }"
            >
              {{ timeLeft }}
            </div>
          </div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 sm:h-3.5 md:h-4 shadow-inner">
          <div
            class="h-3 sm:h-3.5 md:h-4 rounded-full transition-all duration-1000 shadow-md"
            :class="{
              'bg-green-500': timeLeft > 10,
              'bg-yellow-500': timeLeft <= 10 && timeLeft > 5,
              'bg-red-500': timeLeft <= 5,
            }"
            :style="{ width: `${(timeLeft / questionDuration) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Question Card -->
      <div class="bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-2xl border-2 border-indigo-100 p-5 sm:p-6 md:p-7 lg:p-9">
        <div class="text-center mb-5 sm:mb-6 md:mb-7 lg:mb-9">
          <div
            class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 mb-4 sm:mb-5 md:mb-6 shadow-2xl ring-4 ring-purple-200"
          >
            <svg class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-5 md:mb-6 px-3 sm:px-4 leading-tight break-words">
            {{ current.question }}
          </h2>
        </div>

        <!-- Choices -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <button
            v-for="(choice, index) in current.choices"
            :key="choice"
            @click="answer(choice)"
            :disabled="answering || hasAnswered"
            class="group relative p-5 sm:p-6 md:p-7 lg:p-8 bg-gradient-to-br from-white to-gray-50 border-4 sm:border-[4px] rounded-2xl sm:rounded-3xl transition-all transform hover:scale-[1.03] active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[70px] sm:min-h-[80px] md:min-h-[90px] shadow-lg hover:shadow-2xl"
            style="touch-action: manipulation; -webkit-tap-highlight-color: transparent; user-select: none;"
            :class="{
              'border-gray-200 hover:border-blue-500 hover:shadow-lg': !hasAnswered,
              'border-green-500 bg-green-50': hasAnswered && choice === selectedAnswer,
              'border-gray-300': hasAnswered && choice !== selectedAnswer,
            }"
          >
            <div class="flex items-center justify-between gap-3 sm:gap-4 w-full">
              <span class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 break-words text-left flex-1 leading-snug">{{ choice }}</span>
              <div
                class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white border-4 sm:border-[4px] flex items-center justify-center transition-colors flex-shrink-0 shadow-lg ring-2 ring-gray-200"
                :class="{
                  'border-gray-300 group-hover:border-blue-500': !hasAnswered,
                  'border-green-500': hasAnswered && choice === selectedAnswer,
                  'border-gray-300': hasAnswered && choice !== selectedAnswer,
                }"
              >
                <span class="text-base sm:text-lg md:text-xl font-extrabold text-gray-800">{{
                  String.fromCharCode(65 + index)
                }}</span>
              </div>
            </div>
          </button>
        </div>

        <div v-if="hasAnswered" class="mt-5 sm:mt-6 md:mt-7 text-center p-4 sm:p-5 md:p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-3 sm:border-[3px] border-green-300 rounded-2xl shadow-lg">
          <p class="text-base sm:text-lg md:text-xl font-bold text-green-800">{{ t('quiz.answerRecorded') }}</p>
        </div>
      </div>

      <!-- Player Info -->
      <div class="bg-gradient-to-r from-white to-blue-50 rounded-3xl shadow-xl border-2 border-blue-200 p-4 sm:p-5 md:p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3 sm:space-x-4">
            <div
              class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg ring-4 ring-blue-200"
            >
              <span class="text-white font-extrabold text-base sm:text-lg md:text-xl">{{
                playerName ? playerName.charAt(0).toUpperCase() : '?'
              }}</span>
            </div>
            <div>
              <p class="text-sm text-gray-600">{{ t('quiz.player') }}</p>
              <p class="font-semibold text-gray-900">{{ playerName || t('quiz.anonymous') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Ended - Show Results -->
    <div v-else-if="gameEnded" class="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
      <div
        class="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-6"
      >
        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 class="text-4xl font-bold text-gray-900 mb-4">{{ t('quiz.gameEnded') }}</h2>
      <p class="text-gray-600 text-lg mb-8">
        {{ t('quiz.gameEndedDesc') }}
      </p>

      <!-- Results Summary -->
      <div v-if="results.length > 0" class="mt-8 space-y-4 max-w-2xl mx-auto">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">{{ t('quiz.resultsTitle') }}</h3>
        <div
          v-for="(result, index) in results"
          :key="index"
          class="bg-gray-50 rounded-lg p-4 text-left"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold text-gray-900">{{ t('quiz.question') }} {{ index + 1 }}</span>
            <span
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            >
              {{ result.isCorrect ? t('quiz.correctLabel') : t('quiz.incorrectLabel') }}
            </span>
          </div>
          <p class="text-sm text-gray-600">{{ t('quiz.yourAnswer') }}: {{ result.playerAnswer }}</p>
          <p class="text-sm text-gray-600">{{ t('quiz.correctAnswerLabel') }}: {{ result.correctAnswer }}</p>
        </div>
      </div>

      <div class="mt-8">
      <router-link
        to="/player/leaderboard"
        class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
      >
        {{ t('quiz.viewLeaderboard') }}
        <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </router-link>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="error"
      class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
    >
      {{ error }}
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { io } from 'socket.io-client'
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
      current: null,
      loading: true,
      answering: false,
      error: '',
      playerName: '',
      playerId: '',
      gameStarted: false,
      gameEnded: false,
      currentQuestionIndex: -1,
      totalQuestions: 0,
      timeLeft: 0,
      questionDuration: 30000,
      questionStartTime: null,
      timerInterval: null,
      gameStatePolling: null,
      hasAnswered: false,
      selectedAnswer: null,
      socket: null,
      results: []
    }
  },
  async created() {
    this.playerName = localStorage.getItem('playerName') || ''
    this.playerId = localStorage.getItem('playerId') || ''

    if (!this.playerId) {
      this.error = this.t('quiz.playerNotIdentified')
      setTimeout(() => {
        this.$router.push('/player/register')
      }, 2000)
      return
    }

    // Utiliser le socketService singleton pour réutiliser la même connexion
    this.socket = socketService.getSocket()
    const componentId = 'QuizPlay'
    
    // S'assurer que le socket est connecté et que le joueur est enregistré
    const ensurePlayerRegistered = async () => {
      // Attendre que la connexion soit établie
      if (!this.socket.connected) {
        console.log('⏳ Socket not connected, waiting for connection...')
        await new Promise((resolve) => {
          if (this.socket.connected) {
            resolve()
          } else {
            this.socket.once('connect', () => {
              console.log('✅ WebSocket connected, ready to register player')
              resolve()
            })
            // Timeout après 5 secondes
            setTimeout(() => {
              console.warn('⚠️ Socket connection timeout, continuing anyway...')
              resolve()
            }, 5000)
          }
        })
      }
      
      // Enregistrer le joueur
      console.log('📝 Registering player:', this.playerId)
      socketService.registerPlayer(this.playerId)
      
      // Attendre un peu pour que l'enregistrement soit traité
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Vérifier l'état du jeu immédiatement après l'enregistrement
      console.log('🔄 Checking game state after registration...')
      await this.loadGameState()
      
      // Si le jeu a déjà démarré, charger la question immédiatement
      if (this.gameStarted && !this.current) {
        console.log('🎮 Game already started, loading current question...')
        await this.loadCurrentQuestion()
        if (this.current) {
          this.startTimer()
        }
      }
    }
    
    // Exécuter l'enregistrement
    ensurePlayerRegistered().catch(err => {
      console.error('❌ Error ensuring player registration:', err)
    })
    
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected in QuizPlay:', this.socket.id)
    })
    
    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error)
    })
    
    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ WebSocket disconnected:', reason)
      // Ne pas rediriger automatiquement, la reconnexion se fera automatiquement
    })
    
    socketService.on('error', (data) => {
      console.error('❌ Socket error in QuizPlay:', data)
      // Si c'est une erreur de jeu déjà commencé, vérifier si le joueur était déjà enregistré
      if (data.code === 'GAME_ALREADY_STARTED') {
        // Le joueur était déjà enregistré, ne pas bloquer
        console.log('🔄 Game already started but player was registered, continuing...')
        // Ne pas afficher l'erreur, juste continuer
      } else {
        this.error = data.message || 'Erreur de connexion'
        // Ne pas rediriger automatiquement, laisser l'utilisateur continuer
      }
    }, componentId)

    // Écouter l'événement game:started via socketService ET directement sur le socket
    // Double écoute pour s'assurer de ne pas manquer l'événement
    const handleGameStartedEvent = async (data) => {
      console.log('🎮 Game started event received in QuizPlay:', data)
      console.log('🎮 Socket connected:', this.socket.connected, 'Socket ID:', this.socket.id)
      this.gameStarted = true
      this.loading = false
      // NE PAS arrêter le polling ici - il continuera pour charger la question et détecter les suivantes
      // Charger l'état du jeu et la question actuelle immédiatement
      try {
        await this.loadGameState()
        if (!this.current) {
          console.log('🔄 No current question after game:started, loading...')
          await this.loadCurrentQuestion()
        }
        if (this.current) {
          console.log('✅ Question loaded after game:started event')
          this.startTimer()
        } else {
          console.warn('⚠️ Game started but no question loaded, polling will retry...')
        }
      } catch (err) {
        console.error('❌ Error loading game state after game:started:', err)
        // Le polling continuera et réessayera
      }
    }
    
    socketService.on('game:started', handleGameStartedEvent, componentId)
    this.socket.on('game:started', handleGameStartedEvent)
    
    // Écouter tous les événements pour déboguer (si disponible)
    if (this.socket.onAny) {
      this.socket.onAny((eventName, ...args) => {
        console.log('📡 Socket event received in QuizPlay:', eventName, args)
      })
    }

    this.socket.on('game:ended', async () => {
      this.gameEnded = true
      await this.loadResults()
    })

    // Écouter l'événement question:next via socketService
    socketService.on('question:next', (data) => {
      console.log('❓ Question next received in QuizPlay (via socketService):', data)
      this.handleQuestionNext(data)
    }, componentId)
    
    // AUSSI écouter directement sur le socket pour s'assurer de ne pas manquer l'événement
    this.socket.on('question:next', (data) => {
      console.log('❓ Question next received in QuizPlay (direct socket):', data)
      this.handleQuestionNext(data)
    })

    // Charger l'état du jeu immédiatement (en plus de celui dans ensurePlayerRegistered)
    // Cela garantit qu'on a l'état le plus récent même si ensurePlayerRegistered a déjà chargé
    await this.loadGameState()
    
    // Si le jeu a déjà commencé, forcer le chargement de la question si elle n'est pas déjà chargée
    if (this.gameStarted && !this.current) {
      console.log('🔄 Game already started but no question, loading immediately...')
      await this.loadCurrentQuestion()
      // Si toujours pas de question après le chargement, réessayer une fois
      if (!this.current) {
        console.log('🔄 Still no question, retrying loadCurrentQuestion()...')
        await new Promise(resolve => setTimeout(resolve, 500)) // Attendre 500ms
        await this.loadCurrentQuestion()
      }
      if (this.current) {
        console.log('✅ Question loaded after retry, starting timer')
        this.startTimer()
      }
    }
    
    // Mettre à jour l'état de chargement
    if (this.gameStarted && this.current) {
      this.loading = false
      console.log('✅ Game started and question loaded on mount')
      // Démarrer le timer si on a une question
      if (this.questionStartTime) {
        this.startTimer()
      }
    } else if (this.gameStarted && !this.current) {
      // Le jeu a commencé mais on n'a pas encore la question, le polling va la charger
      this.loading = false
      console.log('⏳ Game started but waiting for question (polling will load it)...')
    } else {
      this.loading = false
      console.log('⏳ Waiting for game to start...')
    }
    
    // Polling périodique pour vérifier l'état du jeu (CRITIQUE: les événements Socket.io ne sont pas partagés entre pods Kubernetes)
    // Ce polling est essentiel car l'admin peut être sur un pod différent des joueurs
    // Le polling continue tant que le jeu n'est pas terminé ET qu'on n'a pas de question affichée
    this.gameStatePolling = setInterval(async () => {
      if (this.gameEnded) {
        // Arrêter le polling si le jeu est terminé
        if (this.gameStatePolling) {
          clearInterval(this.gameStatePolling)
          this.gameStatePolling = null
          console.log('✅ Polling stopped, game ended')
        }
        return
      }

      try {
        const wasGameStarted = this.gameStarted
        const hadCurrent = !!this.current
        const hadCurrentId = this.current?.id
        
        // Charger l'état du jeu (cela va aussi charger la question si nécessaire)
        await this.loadGameState()
        
        // FORCER le chargement de la question si le jeu a démarré mais qu'on n'a pas de question
        // Cela peut arriver si loadGameState() n'a pas réussi à charger la question
        if (this.gameStarted && !this.current) {
          console.log('🔄 Game started but no question after loadGameState(), forcing load...')
          await this.loadCurrentQuestion()
        }
        
        // Si le jeu vient de démarrer, s'assurer que la question est chargée
        if (this.gameStarted && !wasGameStarted) {
          console.log('🔄 Game started detected via polling, ensuring question is loaded...')
          if (!this.current) {
            await this.loadCurrentQuestion()
          }
        }
        
        // Si on a maintenant la question et qu'on ne l'avait pas avant, démarrer le timer
        if (this.current && !hadCurrent && this.gameStarted) {
          console.log('✅ Question loaded via polling, starting timer...')
          this.startTimer()
        }
        
        // Si l'ID de la question a changé, redémarrer le timer
        if (this.current && hadCurrentId && hadCurrentId !== this.current.id) {
          console.log('🔄 Question ID changed, restarting timer...')
          this.startTimer()
        }
        
        // Le polling continue pour détecter les nouvelles questions et les changements d'état
        // Il s'arrête seulement quand le jeu est terminé
      } catch (err) {
        console.error('❌ Error polling game state:', err)
        // Ne pas arrêter le polling en cas d'erreur, continuer à essayer
      }
    }, 3000) // Vérifier toutes les 3 secondes (réduit pour éviter le rate limiting, WebSocket est prioritaire)
  },
  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
    }
    if (this.gameStatePolling) {
      clearInterval(this.gameStatePolling)
    }
    // Nettoyer les listeners mais garder la connexion active pour les autres composants
    socketService.off('QuizPlay')
    // Ne pas déconnecter le socket car il est partagé
  },
  methods: {
    async handleGameStarted(data) {
      console.log('🎮 Handling game started event:', data)
      this.gameStarted = true
      this.loading = false
      // NE PAS arrêter le polling ici - il continuera pour charger la question et détecter les suivantes
      // Charger l'état du jeu et la question actuelle immédiatement
      try {
        await this.loadGameState()
        if (!this.current) {
          console.log('🔄 No current question after game:started, loading...')
          await this.loadCurrentQuestion()
        }
        if (this.current) {
          console.log('✅ Question loaded after game:started event')
          this.startTimer()
        } else {
          console.warn('⚠️ Game started but no question loaded, polling will retry...')
        }
      } catch (err) {
        console.error('❌ Error loading game state after game:started:', err)
        // Le polling continuera et réessayera
      }
    },
    handleQuestionNext(data) {
      console.log('❓ Handling question next event:', data)
      if (!data || !data.question) {
        console.error('❌ Invalid question:next data:', data)
        return
      }
      this.current = data.question
      this.currentQuestionIndex = data.questionIndex || 0
      this.totalQuestions = data.totalQuestions || 0
      this.questionStartTime = data.startTime
      this.questionDuration = data.duration || 30000
      this.hasAnswered = false
      this.selectedAnswer = null
      this.gameStarted = true
      this.loading = false
      // NE PAS arrêter le polling - il continuera pour détecter les questions suivantes
      this.startTimer()
      console.log('✅ Question displayed, timer started')
    },
    async loadGameState() {
      try {
        const res = await axios.get(API_URLS.game.state)
        const state = res.data
        
        const wasGameStarted = this.gameStarted
        const hadCurrentQuestionId = this.current?.id
        
        console.log('📊 loadGameState() - Current state:', {
          isStarted: state.isStarted,
          currentQuestionId: state.currentQuestionId,
          wasGameStarted,
          hasCurrent: !!this.current
        })
        
        this.gameStarted = state.isStarted
        this.currentQuestionIndex = state.currentQuestionIndex
        this.questionStartTime = state.questionStartTime
        this.questionDuration = state.questionDuration || 30000

        // Si le jeu a démarré et qu'il y a une question actuelle
        if (state.isStarted && state.currentQuestionId) {
          // FORCER le chargement si :
          // 1. On n'a pas de question actuelle
          // 2. Le jeu vient de démarrer (transition de false à true)
          // 3. L'ID de la question a changé (nouvelle question)
          const questionIdChanged = hadCurrentQuestionId && hadCurrentQuestionId !== state.currentQuestionId
          const shouldLoad = !this.current || !wasGameStarted || questionIdChanged
          
          if (shouldLoad) {
            console.log('🔄 Loading current question in loadGameState()', {
              reason: !this.current ? 'no current' : !wasGameStarted ? 'game just started' : 'question ID changed',
              currentQuestionId: state.currentQuestionId,
              hadCurrentId: hadCurrentQuestionId
            })
            await this.loadCurrentQuestion()
            // Si la question est chargée et que le jeu vient de démarrer, démarrer le timer
            if (this.current && !wasGameStarted) {
              console.log('✅ Game just started, question loaded, starting timer')
              this.startTimer()
            }
          }
        } else if (state.isStarted && !state.currentQuestionId) {
          // Le jeu a démarré mais pas encore de question (transition)
          console.log('ℹ️ Game started but no current question yet, waiting...')
          this.loading = false
        } else if (!state.isStarted) {
          // Le jeu n'a pas encore démarré
          console.log('⏳ Game not started yet, waiting...')
          this.loading = false
        }
      } catch (err) {
        console.error('❌ Erreur chargement état:', err)
        // Ne pas mettre gameStarted à false en cas d'erreur, garder l'état précédent
      }
    },
    
    async loadCurrentQuestion() {
      try {
        console.log('🔄 loadCurrentQuestion() called')
        const stateRes = await axios.get(API_URLS.game.state)
        const state = stateRes.data
        
        console.log('📊 Game state:', {
          isStarted: state.isStarted,
          currentQuestionId: state.currentQuestionId,
          currentQuestionIndex: state.currentQuestionIndex,
          questionStartTime: state.questionStartTime
        })
        
        if (state.isStarted && state.currentQuestionId) {
          // Charger la question actuelle
          try {
            const questionsRes = await axios.get(API_URLS.quiz.all)
            const question = questionsRes.data.find(q => q.id === state.currentQuestionId)
            
            if (question) {
              console.log('✅ Found question:', question.question)
              this.current = {
                id: question.id,
                question: question.question,
                choices: question.choices
              }
              this.totalQuestions = questionsRes.data.length
              this.currentQuestionIndex = state.currentQuestionIndex
              this.questionStartTime = state.questionStartTime
              this.questionDuration = state.questionDuration || 30000
              this.gameStarted = true
              this.loading = false
              
              // Toujours démarrer le timer (il calculera le temps restant même sans startTime)
              this.startTimer()
              console.log('✅ Current question loaded and timer started:', question.question, {
                startTime: this.questionStartTime,
                duration: this.questionDuration
              })
            } else {
              console.warn('⚠️ Question not found in quiz list:', state.currentQuestionId)
              // Ne pas mettre current à null, garder l'état précédent
            }
          } catch (quizErr) {
            console.error('❌ Error fetching questions:', quizErr)
            throw quizErr
          }
        } else {
          console.log('ℹ️ Game not started or no current question:', {
            isStarted: state.isStarted,
            currentQuestionId: state.currentQuestionId
          })
        }
      } catch (err) {
        console.error('❌ Erreur chargement question actuelle:', err)
        // Ne pas mettre current à null en cas d'erreur, garder l'état précédent
        // Le polling réessayera
      }
    },
    startTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
      }

      if (!this.questionStartTime) {
        return
      }

      const updateTimer = () => {
        const elapsed = Date.now() - this.questionStartTime
        this.timeLeft = Math.max(0, Math.ceil((this.questionDuration - elapsed) / 1000))

        if (this.timeLeft <= 0) {
          clearInterval(this.timerInterval)
          // Le serveur enverra automatiquement la question suivante
        }
      }

      updateTimer()
      this.timerInterval = setInterval(updateTimer, 100)
    },
    async answer(choice) {
      if (!this.current || this.hasAnswered) {
        return
      }

      this.answering = true
      this.error = ''
      this.selectedAnswer = choice

      try {
        const res = await axios.post(API_URLS.game.answer, {
          playerId: this.playerId,
          questionId: this.current.id,
          answer: choice,
        })

        if (res.data.alreadyAnswered) {
          this.hasAnswered = true
        } else {
          this.hasAnswered = true
        }
      } catch (err) {
        console.error('Erreur réponse:', err)
        if (err.response?.status === 400) {
          this.error = err.response.data.error || "Erreur lors de l'envoi de la réponse"
        } else {
        this.error = "Erreur lors de l'envoi de la réponse"
        }
      } finally {
        this.answering = false
      }
    },
    async loadResults() {
      try {
        const resultsRes = await axios.get(API_URLS.game.results)
        const allResults = resultsRes.data

        // Charger les questions pour obtenir les bonnes réponses
        const questionsRes = await axios.get(API_URLS.quiz.full)
        const questions = questionsRes.data

        // Construire les résultats pour ce joueur
        this.results = []
        for (const questionId in allResults) {
          const result = allResults[questionId]
          const playerResult = result.playerResults.find(pr => pr.playerId === this.playerId)
          
          if (playerResult) {
            this.results.push({
              questionId,
              playerAnswer: playerResult.answer,
              correctAnswer: result.correctAnswer,
              isCorrect: playerResult.isCorrect
            })
          }
        }
      } catch (err) {
        console.error('Erreur chargement résultats:', err)
      }
    }
  },
}
</script>
