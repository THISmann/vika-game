/**
 * Utilitaires de debug pour les WebSockets
 * À utiliser dans la console du navigateur pour diagnostiquer les problèmes
 */

export function debugSocket() {
  const socketService = window.socketService || (() => {
    // Essayer d'importer dynamiquement
    try {
      return require('@/services/socketService').default
    } catch (e) {
      console.error('Cannot access socketService:', e)
      return null
    }
  })()

  if (!socketService) {
    console.error('❌ socketService not found')
    return
  }

  const socket = socketService.getSocket()
  
  console.log('\n🔍 ========== SOCKET DEBUG INFO ==========')
  console.log('Socket:', socket)
  console.log('Connected:', socket?.connected)
  console.log('Disconnected:', socket?.disconnected)
  console.log('Connecting:', socket?.connecting)
  console.log('Socket ID:', socket?.id)
  console.log('Transport:', socket?.io?.engine?.transport?.name)
  console.log('URL:', socket?.io?.uri)
  console.log('Player ID (localStorage):', localStorage.getItem('playerId'))
  console.log('Player Name (localStorage):', localStorage.getItem('playerName'))
  console.log('Game Code (localStorage):', localStorage.getItem('gameCode'))
  
  // Écouter tous les événements pour debug
  if (socket) {
    const events = ['connect', 'disconnect', 'connect_error', 'error', 'game:code', 'game:started', 'question:next', 'players:count', 'score:update', 'leaderboard:update']
    events.forEach(event => {
      socket.on(event, (data) => {
        console.log(`📡 Event received: ${event}`, data)
      })
    })
    console.log('✅ Listening to all socket events')
  }
  
  console.log('========================================\n')
  
  return {
    socket,
    socketService,
    registerPlayer: (playerId) => {
      console.log('📝 Manually registering player:', playerId)
      socketService.registerPlayer(playerId)
    },
    connect: () => {
      console.log('🔌 Manually connecting socket...')
      socketService.connect()
    },
    disconnect: () => {
      console.log('🔌 Manually disconnecting socket...')
      socketService.disconnect()
    }
  }
}

// Exposer globalement pour utilisation dans la console
if (typeof window !== 'undefined') {
  window.debugSocket = debugSocket
}

