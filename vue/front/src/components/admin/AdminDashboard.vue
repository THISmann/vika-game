<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <div class="text-center mb-6">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">🎯 Dashboard Administrateur</h1>
        <p class="text-gray-600">Gérez votre jeu de questions-réponses</p>
      </div>

      <!-- Game State Info -->
      <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600">{{ connectedPlayersCount }}</div>
            <div class="text-sm text-gray-600 mt-1">Joueurs connectés</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold" :class="gameState.isStarted ? 'text-green-600' : 'text-gray-400'">
              {{ gameState.isStarted ? 'En cours' : 'En attente' }}
            </div>
            <div class="text-sm text-gray-600 mt-1">Statut du jeu</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-indigo-600">
              {{ gameState.currentQuestionIndex + 1 }}/{{ totalQuestions }}
            </div>
            <div class="text-sm text-gray-600 mt-1">Question actuelle</div>
          </div>
        </div>
      </div>

      <!-- Game Controls -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          @click="startGame"
          :disabled="gameState.isStarted || loading"
          class="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ▶️ Démarrer le jeu
        </button>
        <button
          @click="nextQuestion"
          :disabled="!gameState.isStarted || loading"
          class="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ➡️ Question suivante
        </button>
        <button
          @click="endGame"
          :disabled="!gameState.isStarted || loading"
          class="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-lg hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⏹️ Terminer le jeu
        </button>
        <button
          @click="deleteGame"
          :disabled="loading"
          class="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium rounded-lg hover:from-red-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🗑️ Supprimer la partie
        </button>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        @click="$router.push('/admin/questions')"
        class="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-2xl font-bold">Questions</h3>
          <svg class="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p class="text-purple-100">Ajoutez, modifiez ou supprimez des questions</p>
        <div class="mt-4 flex items-center text-sm font-medium">
          Gérer les questions
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
        class="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-2xl font-bold">Classement</h3>
          <svg class="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        </div>
        <p class="text-blue-100">Consultez le classement des joueurs</p>
        <div class="mt-4 flex items-center text-sm font-medium">
          Voir le classement
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

export default {
  data() {
    return {
      gameState: {
        isStarted: false,
        currentQuestionIndex: -1,
        connectedPlayersCount: 0
      },
      totalQuestions: 0,
      loading: false,
      message: '',
      error: '',
      socket: null
    }
  },
  async mounted() {
    await this.loadGameState()
    await this.loadQuestionsCount()
    
    // Connecter au WebSocket
    this.socket = io('http://localhost:3003')
    
    this.socket.on('players:count', (data) => {
      this.gameState.connectedPlayersCount = data.count
    })
    
    this.socket.on('game:started', () => {
      this.loadGameState()
    })
    
    this.socket.on('game:ended', () => {
      this.loadGameState()
      this.message = 'Le jeu est terminé'
      setTimeout(() => this.message = '', 5000)
    })
    
    this.socket.on('question:next', () => {
      this.loadGameState()
    })
    
    // Polling pour l'état du jeu
    setInterval(() => {
      this.loadGameState()
      this.loadConnectedPlayersCount()
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
        const res = await axios.get('http://localhost:3003/game/state')
        this.gameState = res.data
      } catch (err) {
        console.error('Error loading game state:', err)
      }
    },
    async loadQuestionsCount() {
      try {
        const res = await axios.get('http://localhost:3002/quiz/all')
        this.totalQuestions = res.data.length
      } catch (err) {
        console.error('Error loading questions count:', err)
      }
    },
    async loadConnectedPlayersCount() {
      try {
        const res = await axios.get('http://localhost:3003/game/players/count')
        this.gameState.connectedPlayersCount = res.data.count
      } catch (err) {
        console.error('Error loading players count:', err)
      }
    },
    async startGame() {
      this.loading = true
      this.error = ''
      this.message = ''
      
      try {
        await axios.post('http://localhost:3003/game/start')
        this.message = 'Jeu démarré avec succès !'
        await this.loadGameState()
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
        const res = await axios.post('http://localhost:3003/game/next')
        if (res.data.finished) {
          this.message = 'Le jeu est terminé !'
        } else {
          this.message = 'Question suivante affichée'
        }
        await this.loadGameState()
        setTimeout(() => this.message = '', 3000)
      } catch (err) {
        this.error = err.response?.data?.error || 'Erreur lors du passage à la question suivante'
      } finally {
        this.loading = false
      }
    },
    async endGame() {
      if (!confirm('Êtes-vous sûr de vouloir terminer le jeu ?')) {
        return
      }
      
      this.loading = true
      this.error = ''
      this.message = ''
      
      try {
        await axios.post('http://localhost:3003/game/end')
        this.message = 'Jeu terminé avec succès !'
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
        await axios.delete('http://localhost:3003/game/delete')
        this.message = 'Partie supprimée avec succès !'
        await this.loadGameState()
        setTimeout(() => this.message = '', 3000)
      } catch (err) {
        this.error = err.response?.data?.error || 'Erreur lors de la suppression de la partie'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
