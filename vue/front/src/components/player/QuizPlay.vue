<template>
  <div class="max-w-4xl mx-auto">
    <!-- Waiting for game to start -->
    <div
      v-if="!gameStarted && !gameEnded"
      class="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center"
    >
      <div
        class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"
      ></div>
      <h2 class="text-2xl font-bold text-gray-900 mb-4">⏳ En attente du début du jeu</h2>
      <p class="text-gray-600 text-lg">
        L'administrateur va bientôt démarrer le jeu...
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-else-if="loading && !current"
      class="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center"
    >
      <div
        class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"
      ></div>
      <p class="text-gray-600 text-lg">Chargement...</p>
    </div>

    <!-- Quiz Question -->
    <div v-else-if="current && !gameEnded" class="space-y-6">
      <!-- Timer -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">
            Question {{ currentQuestionIndex + 1 }} sur {{ totalQuestions }}
          </span>
          <div class="flex items-center space-x-2">
            <div
              class="w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-lg"
              :class="{
                'border-green-500 text-green-600': timeLeft > 10,
                'border-yellow-500 text-yellow-600': timeLeft <= 10 && timeLeft > 5,
                'border-red-500 text-red-600': timeLeft <= 5,
              }"
            >
              {{ timeLeft }}
            </div>
          </div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all duration-1000"
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
      <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4"
          >
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            {{ current.question }}
          </h2>
        </div>

        <!-- Choices -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            v-for="(choice, index) in current.choices"
            :key="choice"
            @click="answer(choice)"
            :disabled="answering || hasAnswered"
            class="group relative p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            :class="{
              'border-gray-200 hover:border-blue-500 hover:shadow-lg': !hasAnswered,
              'border-green-500 bg-green-50': hasAnswered && choice === selectedAnswer,
              'border-gray-300': hasAnswered && choice !== selectedAnswer,
            }"
          >
            <div class="flex items-center justify-between">
              <span class="text-lg font-medium text-gray-900">{{ choice }}</span>
              <div
                class="w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center transition-colors"
                :class="{
                  'border-gray-300 group-hover:border-blue-500': !hasAnswered,
                  'border-green-500': hasAnswered && choice === selectedAnswer,
                  'border-gray-300': hasAnswered && choice !== selectedAnswer,
                }"
              >
                <span class="text-sm font-bold text-gray-600">{{
                  String.fromCharCode(65 + index)
                }}</span>
              </div>
            </div>
          </button>
        </div>

        <div v-if="hasAnswered" class="mt-4 text-center">
          <p class="text-sm text-gray-600">Réponse enregistrée. En attente de la question suivante...</p>
        </div>
      </div>

      <!-- Player Info -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            >
              <span class="text-white font-bold">{{
                playerName ? playerName.charAt(0).toUpperCase() : '?'
              }}</span>
            </div>
            <div>
              <p class="text-sm text-gray-600">Joueur</p>
              <p class="font-semibold text-gray-900">{{ playerName || 'Anonyme' }}</p>
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
      <h2 class="text-4xl font-bold text-gray-900 mb-4">🎉 Quiz terminé !</h2>
      <p class="text-gray-600 text-lg mb-8">
        Félicitations ! Le jeu est terminé. Consultez vos résultats ci-dessous.
      </p>

      <!-- Results Summary -->
      <div v-if="results.length > 0" class="mt-8 space-y-4 max-w-2xl mx-auto">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Résultats des questions</h3>
        <div
          v-for="(result, index) in results"
          :key="index"
          class="bg-gray-50 rounded-lg p-4 text-left"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold text-gray-900">Question {{ index + 1 }}</span>
            <span
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            >
              {{ result.isCorrect ? '✓ Correct' : '✗ Incorrect' }}
            </span>
          </div>
          <p class="text-sm text-gray-600">Votre réponse: {{ result.playerAnswer }}</p>
          <p class="text-sm text-gray-600">Bonne réponse: {{ result.correctAnswer }}</p>
        </div>
      </div>

      <div class="mt-8">
        <router-link
          to="/player/leaderboard"
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
        >
          Voir le classement
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

export default {
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
      this.error = 'Joueur non identifié. Veuillez vous réinscrire.'
      setTimeout(() => {
        this.$router.push('/player/register')
      }, 2000)
      return
    }

    // Connecter au WebSocket
    this.socket = io('http://localhost:3003')
    
    // Enregistrer le joueur
    this.socket.emit('register', this.playerId)
    
    this.socket.on('error', (data) => {
      this.error = data.message
      setTimeout(() => {
        this.$router.push('/player/register')
      }, 3000)
    })

    this.socket.on('game:started', () => {
      this.gameStarted = true
      this.loadGameState()
    })

    this.socket.on('game:ended', async () => {
      this.gameEnded = true
      await this.loadResults()
    })

    this.socket.on('question:next', (data) => {
      this.current = data.question
      this.currentQuestionIndex = data.questionIndex
      this.totalQuestions = data.totalQuestions
      this.questionStartTime = data.startTime
      this.questionDuration = data.duration
      this.hasAnswered = false
      this.selectedAnswer = null
      this.startTimer()
    })

    await this.loadGameState()
    this.loading = false
  },
  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
    }
    if (this.socket) {
      this.socket.disconnect()
    }
  },
  methods: {
    async loadGameState() {
      try {
        const res = await axios.get('http://localhost:3003/game/state')
        const state = res.data
        
        this.gameStarted = state.isStarted
        this.currentQuestionIndex = state.currentQuestionIndex
        this.questionStartTime = state.questionStartTime
        this.questionDuration = state.questionDuration || 30000

        if (state.isStarted && state.currentQuestionId) {
          // Charger la question actuelle
          const questionsRes = await axios.get('http://localhost:3002/quiz/all')
          const question = questionsRes.data.find(q => q.id === state.currentQuestionId)
          if (question) {
            this.current = {
              id: question.id,
              question: question.question,
              choices: question.choices
            }
            this.totalQuestions = questionsRes.data.length
            this.startTimer()
          }
        }
      } catch (err) {
        console.error('Erreur chargement état:', err)
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
        const res = await axios.post('http://localhost:3003/game/answer', {
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
        const resultsRes = await axios.get('http://localhost:3003/game/results')
        const allResults = resultsRes.data

        // Charger les questions pour obtenir les bonnes réponses
        const questionsRes = await axios.get('http://localhost:3002/quiz/full')
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
