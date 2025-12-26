import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API_URLS } from '@/config/api'
import apiClient from '@/services/api'
import socketService from '@/services/socketService'

export const useLeaderboardStore = defineStore('leaderboard', () => {
  // State
  const leaderboard = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentPage = ref(1)
  const itemsPerPage = ref(5)

  // Getters
  const totalPages = computed(() => {
    return Math.ceil(leaderboard.value.length / itemsPerPage.value)
  })

  const paginatedLeaderboard = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return leaderboard.value.slice(start, end)
  })

  const hasNextPage = computed(() => {
    return currentPage.value < totalPages.value
  })

  const hasPreviousPage = computed(() => {
    return currentPage.value > 1
  })

  // Actions
  async function loadLeaderboard() {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiClient.get(API_URLS.game.leaderboard)
      let data = response.data || []
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        data = []
      }
      
      // Map and sort leaderboard
      leaderboard.value = data
        .filter(item => item && (item.playerId || item._id || item.id))
        .map(item => ({
          playerId: item.playerId || item._id || item.id || 'unknown',
          playerName: item.playerName || item.name || 'Anonymous',
          score: item.score || 0
        }))
        .sort((a, b) => (b.score || 0) - (a.score || 0))
      
      // Reset to first page if current page is out of bounds
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = 1
      }
      
      console.log('✅ Leaderboard loaded:', leaderboard.value.length, 'entries')
    } catch (err) {
      console.error('Error loading leaderboard:', err)
      error.value = err.response?.data?.error || err.message || 'Failed to load leaderboard'
      leaderboard.value = []
    } finally {
      loading.value = false
    }
  }

  function updateLeaderboardFromSocket(scores) {
    if (!Array.isArray(scores)) {
      console.warn('⚠️ Invalid leaderboard data from socket:', scores)
      return
    }

    // Map and sort leaderboard
    leaderboard.value = scores
      .filter(item => item && (item.playerId || item._id || item.id))
      .map(item => ({
        playerId: item.playerId || item._id || item.id || 'unknown',
        playerName: item.playerName || item.name || 'Anonymous',
        score: item.score || 0
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
    
    // Reset to first page if current page is out of bounds
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = 1
    }
    
    console.log('✅ Leaderboard updated from socket:', leaderboard.value.length, 'entries')
  }

  function setupSocketListeners() {
    // Ensure socket is connected
    const socket = socketService.connect()
    
    const trySetup = (sock) => {
      if (!sock) {
        console.warn('⚠️ Socket not available')
        return
      }
      
      if (sock.connected) {
        setupListener(sock)
      } else {
        // Socket exists but not connected, wait for connection
        sock.once('connect', () => {
          setupListener(sock)
        })
      }
    }
    
    if (socket instanceof Promise) {
      socket.then(sock => {
        trySetup(sock)
      }).catch(err => {
        console.error('Error getting socket:', err)
      })
    } else {
      trySetup(socket)
    }
  }

  function setupListener(socket) {
    if (!socket || !socket.on) {
      console.warn('⚠️ Invalid socket instance')
      return
    }

    // Remove existing listener if any
    socket.off('leaderboard:update', handleLeaderboardUpdate)

    // Listen for leaderboard updates
    socket.on('leaderboard:update', handleLeaderboardUpdate)

    console.log('✅ Socket listeners set up for leaderboard')
  }

  function handleLeaderboardUpdate(scores) {
    console.log('📢 Received leaderboard:update event:', scores)
    updateLeaderboardFromSocket(scores)
  }

  function removeSocketListeners() {
    const socketOrPromise = socketService.getSocket()
    
    if (socketOrPromise instanceof Promise) {
      socketOrPromise.then(socket => {
        if (socket && socket.off) {
          socket.off('leaderboard:update', handleLeaderboardUpdate)
        }
      })
    } else if (socketOrPromise && socketOrPromise.off) {
      socketOrPromise.off('leaderboard:update', handleLeaderboardUpdate)
    }
    
    console.log('✅ Socket listeners removed for leaderboard')
  }

  function nextPage() {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }

  function previousPage() {
    if (hasPreviousPage.value) {
      currentPage.value--
    }
  }

  function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  function setItemsPerPage(count) {
    itemsPerPage.value = count
    currentPage.value = 1 // Reset to first page
  }

  return {
    // State
    leaderboard,
    loading,
    error,
    currentPage,
    itemsPerPage,
    
    // Getters
    totalPages,
    paginatedLeaderboard,
    hasNextPage,
    hasPreviousPage,
    
    // Actions
    loadLeaderboard,
    updateLeaderboardFromSocket,
    setupSocketListeners,
    removeSocketListeners,
    nextPage,
    previousPage,
    goToPage,
    setItemsPerPage
  }
})

