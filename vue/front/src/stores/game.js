import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API_URLS } from '@/config/api'
import apiClient, { gameService } from '@/services/api'
import socketService from '@/services/socketService'

export const useGameStore = defineStore('game', () => {
  // State
  const gameState = ref({
    isStarted: false,
    currentQuestionIndex: -1,
    currentQuestionId: null,
    connectedPlayersCount: 0
  })
  const gameCode = ref(null)
  const totalQuestions = ref(0)
  const connectedPlayers = ref([])
  const loading = ref(false)
  const error = ref(null)
  const message = ref('')

  // Getters
  const isGameActive = computed(() => gameState.value.isStarted)
  const currentQuestionNumber = computed(() => gameState.value.currentQuestionIndex + 1)

  // Actions
  async function loadGameState() {
    try {
      const res = await apiClient.get(API_URLS.game.state)
      gameState.value = {
        isStarted: res.data.isStarted || false,
        currentQuestionIndex: res.data.currentQuestionIndex || -1,
        currentQuestionId: res.data.currentQuestionId || null,
        connectedPlayersCount: res.data.connectedPlayersCount || 0,
        scheduledStartTime: res.data.scheduledStartTime || null
      }
      gameCode.value = res.data.gameCode || null
    } catch (err) {
      // console.error('Error loading game state:', err)
      error.value = err.response?.data?.error || err.message || 'Failed to load game state'
    }
  }

  async function loadGameCode() {
    try {
      const res = await apiClient.get(API_URLS.game.code)
      gameCode.value = res.data.gameCode
    } catch (err) {
      // console.error('Error loading game code:', err)
    }
  }

  async function loadQuestionsCount() {
    try {
      const res = await apiClient.get(API_URLS.quiz.all)
      totalQuestions.value = res.data.length || 0
    } catch (err) {
      // console.error('Error loading questions count:', err)
    }
  }

  function setTotalQuestions(count) {
    totalQuestions.value = count
  }

  async function loadConnectedPlayersCount() {
    try {
      const res = await apiClient.get(API_URLS.game.playersCount)
      gameState.value.connectedPlayersCount = res.data.count || 0
    } catch (err) {
      // console.error('Error loading players count:', err)
    }
  }

  async function loadConnectedPlayers() {
    try {
      // console.log('🟣 [game store] Loading connected players from:', API_URLS.game.players)
      const res = await apiClient.get(API_URLS.game.players)
      // console.log('🟣 [game store] Response received:', {
      //   players: res.data.players,
      //   count: res.data.count,
      //   fullResponse: res.data
      // })
      connectedPlayers.value = res.data.players || []
      gameState.value.connectedPlayersCount = res.data.count || 0
      // console.log('🟣 [game store] Connected players updated:', {
      //   connectedPlayers: connectedPlayers.value,
      //   count: gameState.value.connectedPlayersCount
      // })
    } catch (err) {
      // console.error('🟣 [game store] ❌ Error loading connected players:', err)
      // console.error('🟣 [game store] Error details:', err.response?.data || err.message)
    }
  }

  async function startGame(questionDuration = 30, scheduledStartTime = null) {
    loading.value = true
    error.value = null
    message.value = ''
    
    try {
      const result = await gameService.startGame(questionDuration, scheduledStartTime)
      if (scheduledStartTime) {
        message.value = `Game scheduled for ${new Date(scheduledStartTime).toLocaleString()}`
      } else {
        message.value = `Game started - ${questionDuration}s per question`
      }
      await loadGameState()
      await loadQuestionsCount()
      setTimeout(() => {
        message.value = ''
      }, 5000)
    } catch (err) {
      // console.error('❌ Error starting game:', err)
      if (err.response?.status === 401) {
        error.value = 'Session expired. Please reconnect.'
      } else {
        error.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Error starting game'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  async function nextQuestion() {
    loading.value = true
    error.value = null
    message.value = ''
    
    try {
      const res = await gameService.nextQuestion()
      if (res.finished) {
        message.value = 'Game finished!'
      } else {
        message.value = 'Next question shown'
      }
      await loadGameState()
      setTimeout(() => {
        message.value = ''
      }, 3000)
    } catch (err) {
      error.value = err.response?.data?.error || err.message || 'Error showing next question'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function endGame() {
    loading.value = true
    error.value = null
    message.value = ''
    
    try {
      await gameService.endGame()
      message.value = 'Game ended'
      await loadGameState()
      setTimeout(() => {
        message.value = ''
      }, 3000)
    } catch (err) {
      error.value = err.response?.data?.error || err.message || 'Error ending game'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteGame() {
    loading.value = true
    error.value = null
    message.value = ''
    
    try {
      await gameService.deleteGame()
      message.value = 'Game deleted'
      await loadGameState()
      setTimeout(() => {
        message.value = ''
      }, 3000)
    } catch (err) {
      error.value = err.response?.data?.error || err.message || 'Error deleting game'
      throw err
    } finally {
      loading.value = false
    }
  }

  function updateGameStateFromSocket(data) {
    if (data) {
      if (data.isStarted !== undefined) {
        gameState.value.isStarted = data.isStarted
      }
      if (data.currentQuestionIndex !== undefined) {
        gameState.value.currentQuestionIndex = data.currentQuestionIndex
      }
      if (data.currentQuestionId !== undefined) {
        gameState.value.currentQuestionId = data.currentQuestionId
      }
      if (data.gameCode !== undefined) {
        gameCode.value = data.gameCode
      }
    }
  }

  function updatePlayersCountFromSocket(count) {
    if (count !== undefined) {
      gameState.value.connectedPlayersCount = count
      // Also reload players list
      loadConnectedPlayers()
    }
  }

  function setupSocketListeners() {
    // Ensure socket is connected
    const socket = socketService.connect()
    
    const trySetup = (sock) => {
      if (!sock) {
        // console.warn('⚠️ Socket not available for game store')
        return
      }
      
      const setupListener = (s) => {
        if (!s || !s.on) return

        // Remove existing listeners
        s.off('players:count', handlePlayersCount)
        s.off('game:started', handleGameStarted)
        s.off('game:ended', handleGameEnded)
        s.off('question:next', handleQuestionNext)
        s.off('game:code', handleGameCode)

        // Add new listeners
        s.on('players:count', handlePlayersCount)
        s.on('game:started', handleGameStarted)
        s.on('game:ended', handleGameEnded)
        s.on('question:next', handleQuestionNext)
        s.on('game:code', handleGameCode)

        // console.log('✅ Socket listeners set up for game store')
      }

      if (sock.connected) {
        setupListener(sock)
      } else {
        sock.once('connect', () => {
          setupListener(sock)
        })
      }
    }
    
    if (socket instanceof Promise) {
      socket.then(sock => {
        trySetup(sock)
      }).catch(err => {
        // console.error('Error getting socket for game store:', err)
      })
    } else {
      trySetup(socket)
    }
  }

  function handlePlayersCount(data) {
    // console.log('🟣 [game store] 📊 Received players:count event:', data)
    // console.log('🟣 [game store] Current connectedPlayers before update:', connectedPlayers.value)
    updatePlayersCountFromSocket(data.count)
    // console.log('🟣 [game store] ConnectedPlayers after update:', connectedPlayers.value)
  }

  function handleGameStarted(data) {
    // console.log('🎮 Game store received game:started event:', data)
    loadGameState()
  }

  function handleGameEnded() {
    // console.log('🏁 Game store received game:ended event')
    loadGameState()
    message.value = 'Game ended'
    setTimeout(() => {
      message.value = ''
    }, 5000)
  }

  function handleQuestionNext() {
    // console.log('❓ Game store received question:next event')
    loadGameState()
  }

  function handleGameCode(data) {
    // console.log('🎯 Game store received game:code event:', data)
    if (data && data.gameCode) {
      gameCode.value = data.gameCode
    }
  }

  function removeSocketListeners() {
    const socketOrPromise = socketService.getSocket()
    
    const removeFromSocket = (sock) => {
      if (sock && sock.off) {
        sock.off('players:count', handlePlayersCount)
        sock.off('game:started', handleGameStarted)
        sock.off('game:ended', handleGameEnded)
        sock.off('question:next', handleQuestionNext)
        sock.off('game:code', handleGameCode)
      }
    }
    
    if (socketOrPromise instanceof Promise) {
      socketOrPromise.then(sock => {
        removeFromSocket(sock)
      })
    } else if (socketOrPromise) {
      removeFromSocket(socketOrPromise)
    }
    
    // console.log('✅ Socket listeners removed for game store')
  }

  function clearMessage() {
    message.value = ''
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    gameState,
    gameCode,
    totalQuestions,
    connectedPlayers,
    loading,
    error,
    message,
    
    // Getters
    isGameActive,
    currentQuestionNumber,
    
    // Actions
    loadGameState,
    loadGameCode,
    loadQuestionsCount,
    setTotalQuestions,
    loadConnectedPlayersCount,
    loadConnectedPlayers,
    startGame,
    nextQuestion,
    endGame,
    deleteGame,
    updateGameStateFromSocket,
    updatePlayersCountFromSocket,
    setupSocketListeners,
    removeSocketListeners,
    clearMessage,
    clearError
  }
})

