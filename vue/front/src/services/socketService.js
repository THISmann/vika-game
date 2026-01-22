// socketService.js - Singleton pour gérer la connexion WebSocket partagée
import { io } from 'socket.io-client'
import { API_URLS } from '@/config/api'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnecting = false
    this.listeners = new Map() // Pour stocker les listeners par composant
  }

  // Obtenir ou créer la connexion WebSocket
  getSocket() {
    if (this.socket && this.socket.connected) {
      return this.socket
    }

    if (this.isConnecting) {
      // Attendre que la connexion soit établie
      return new Promise((resolve) => {
        const checkConnection = setInterval(() => {
          if (this.socket && this.socket.connected) {
            clearInterval(checkConnection)
            resolve(this.socket)
          }
        }, 100)
      })
    }

    return this.connect()
  }

  // Créer une nouvelle connexion WebSocket
  connect() {
    if (this.socket && this.socket.connected) {
      return this.socket
    }

    this.isConnecting = true

    // En développement Docker Compose, se connecter directement au game-service
    // L'API Gateway ne supporte pas les WebSockets, donc on ne peut pas l'utiliser
    const isLocalDev = typeof window !== 'undefined' && 
                      (window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.startsWith('192.168.') ||
                       window.location.hostname.startsWith('10.'))
    
    let wsUrl
    let socketPath = '/socket.io'
    
    if (isLocalDev) {
      // En développement local, se connecter directement au game-service
      // L'API Gateway (port 3000) ne supporte pas les WebSockets
      wsUrl = 'http://localhost:3003'
      socketPath = '/socket.io'
      // console.log('🏠 Development mode - Using WebSocket URL (direct to game-service):', wsUrl)
    } else {
      // En production, utiliser l'URL de base du navigateur (via proxy Nginx)
      wsUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : ''
      socketPath = '/socket.io' // En production, le proxy Nginx route /socket.io vers game-service
      // console.log('🌐 Production mode - Using WebSocket URL:', wsUrl)
    }

    // console.log('🔌 Creating WebSocket connection:', wsUrl)
    // console.log('🔌 Socket path:', socketPath)
    // console.log('🔌 Connection options:', {
      path: socketPath,
      transports: ['polling', 'websocket'],
      autoConnect: true,
      timeout: 20000
    })
    
    this.socket = io(wsUrl, {
      path: socketPath,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity, // Réessayer indéfiniment
      forceNew: false,
      autoConnect: true,
      timeout: 20000
    })

    // Logger immédiatement l'état du socket
    // console.log('🔌 Socket created, initial state:', {
      connected: this.socket.connected,
      disconnected: this.socket.disconnected,
      connecting: this.socket.connecting,
      id: this.socket.id
    })

    // Gestion des événements de connexion
    this.socket.on('connect', () => {
      // console.log('✅ WebSocket connected:', this.socket.id, 'Transport:', this.socket.io.engine.transport.name)
      this.isConnecting = false
      
      // Réenregistrer le joueur si on a un playerId
      const playerId = localStorage.getItem('playerId')
      if (playerId) {
        // console.log('🔄 Auto re-registering player after connect:', playerId)
        // Petit délai pour s'assurer que la connexion est stable
        setTimeout(() => {
          this.socket.emit('register', playerId)
        }, 100)
      }
    })

    this.socket.on('connect_error', (error) => {
      // Ignorer complètement l'erreur "server error" et "xhr poll error" qui sont souvent temporaires
      // Socket.io va réessayer automatiquement
      if (error && error.message && (
        error.message.includes('server error') || 
        error.message.includes('xhr poll error') ||
        error.message.includes('poll')
      )) {
        // Ne rien logger pour éviter le spam dans la console
        // La reconnexion automatique va gérer ça
        this.isConnecting = false
        return
      }
      // Logger seulement les autres erreurs critiques
      if (error && error.message) {
        // console.error('❌ WebSocket connection error:', error.message)
      }
      this.isConnecting = false
    })

    this.socket.on('disconnect', (reason) => {
      // console.warn('⚠️ WebSocket disconnected:', reason)
      this.isConnecting = false
      
      // Si c'est une déconnexion involontaire, la reconnexion automatique se fera
      if (reason === 'io server disconnect') {
        // Le serveur a déconnecté, on peut se reconnecter
        // console.log('🔄 Server disconnected, will reconnect automatically')
      }
    })

    this.socket.on('reconnect', (attemptNumber) => {
      // console.log('✅ WebSocket reconnected after', attemptNumber, 'attempts')
      
      // Réenregistrer le joueur après reconnexion
      const playerId = localStorage.getItem('playerId')
      if (playerId) {
        // console.log('🔄 Re-registering player after reconnect:', playerId)
        this.socket.emit('register', playerId)
      }
    })

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      // console.log('🔄 Reconnection attempt:', attemptNumber)
    })

    this.socket.on('reconnect_error', (error) => {
      // Ignorer les erreurs "server error" et "xhr poll error" lors de la reconnexion
      if (error && error.message && (
        error.message.includes('server error') || 
        error.message.includes('xhr poll error') ||
        error.message.includes('poll')
      )) {
        // Ne rien logger, la reconnexion continue automatiquement
        return
      }
      // Logger seulement les autres erreurs critiques
      if (error && error.message) {
        // console.error('❌ Reconnection error:', error.message)
      }
    })

    this.socket.on('reconnect_failed', () => {
      // Seulement logger si la reconnexion a vraiment échoué après tous les essais
      // console.error('❌ Reconnection failed after all attempts')
    })
    
    // Gérer les paquets d'erreur du serveur (après connexion)
    this.socket.on('error', (errorData) => {
      // Ignorer les erreurs GAME_ALREADY_STARTED qui sont normales dans certains cas
      if (errorData && errorData.code === 'GAME_ALREADY_STARTED') {
        // console.log('ℹ️ Game already started - player may need to reconnect')
        return
      }
      // Logger seulement les autres erreurs
      if (errorData && errorData.message) {
        // console.error('❌ WebSocket server error:', errorData.message)
      }
    })

    return this.socket
  }

  // Enregistrer un joueur (sans créer de nouvelle connexion)
  registerPlayer(playerId) {
    if (!playerId) {
      // console.error('🔵 [socketService] ❌ Cannot register player: playerId is required')
      return
    }

    // console.log('🔵 [socketService] registerPlayer called with playerId:', playerId)

    if (!this.socket) {
      // console.log('🔵 [socketService] No socket found, creating connection...')
      this.connect()
      // Après connect(), le socket peut ne pas être immédiatement disponible
      // On attend un peu puis on réessaye
      setTimeout(() => {
        if (this.socket && this.socket.connected) {
          // console.log('🔵 [socketService] Socket now connected, registering player:', playerId)
          this.socket.emit('register', playerId)
        }
      }, 500)
      return
    }

    // Si le socket est connecté, enregistrer immédiatement
    if (this.socket.connected) {
      // console.log('🔵 [socketService] Socket connected, registering player:', playerId, 'Socket ID:', this.socket.id)
      this.socket.emit('register', playerId)
      // console.log('🔵 [socketService] Register event emitted')
      return
    }

    // Si le socket est en train de se connecter, attendre
    if (this.socket.connecting) {
      // console.log('🔵 [socketService] Socket is connecting, will register after connection...')
      const connectHandler = () => {
        // console.log('🔵 [socketService] Socket connected (was connecting), registering player:', playerId, 'Socket ID:', this.socket.id)
        this.socket.emit('register', playerId)
        // console.log('🔵 [socketService] Register event emitted after connection')
        this.socket.off('connect', connectHandler) // Remove handler to avoid duplicates
      }
      this.socket.once('connect', connectHandler)
      return
    }

    // Si le socket est déconnecté, le reconnecter puis enregistrer
    if (this.socket.disconnected) {
      // console.log('🔵 [socketService] Socket disconnected, calling connect()...')
      this.socket.connect()
      const connectHandler = () => {
        // console.log('🔵 [socketService] Socket connected after reconnect, registering player:', playerId, 'Socket ID:', this.socket.id)
        this.socket.emit('register', playerId)
        // console.log('🔵 [socketService] Register event emitted after reconnect')
        this.socket.off('connect', connectHandler) // Remove handler to avoid duplicates
      }
      this.socket.once('connect', connectHandler)
      return
    }

    // Par défaut, attendre la connexion
    // console.log('🔵 [socketService] Waiting for socket connection to register player...')
    const connectHandler = () => {
      // console.log('🔵 [socketService] Socket connected (default handler), registering player:', playerId, 'Socket ID:', this.socket.id)
      this.socket.emit('register', playerId)
      // console.log('🔵 [socketService] Register event emitted after connection')
      this.socket.off('connect', connectHandler) // Remove handler to avoid duplicates
    }
    this.socket.once('connect', connectHandler)
  }

  // Ajouter un listener pour un composant
  on(event, callback, componentId) {
    if (!this.socket) {
      this.connect()
    }

    this.socket.on(event, callback)

    // Stocker le listener pour pouvoir le supprimer plus tard
    if (componentId) {
      if (!this.listeners.has(componentId)) {
        this.listeners.set(componentId, [])
      }
      this.listeners.get(componentId).push({ event, callback })
    }
  }

  // Supprimer les listeners d'un composant
  off(componentId) {
    if (this.listeners.has(componentId)) {
      const componentListeners = this.listeners.get(componentId)
      componentListeners.forEach(({ event, callback }) => {
        if (this.socket) {
          this.socket.off(event, callback)
        }
      })
      this.listeners.delete(componentId)
    }
  }

  // Émettre un événement
  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data)
    } else {
      // console.warn('⚠️ Cannot emit event, socket not connected:', event)
    }
  }

  // Déconnecter (seulement si nécessaire)
  disconnect() {
    if (this.socket) {
      // console.log('🔌 Disconnecting WebSocket')
      this.socket.disconnect()
      this.socket = null
      this.isConnecting = false
      this.listeners.clear()
    }
  }

  // Vérifier si connecté
  isConnected() {
    return this.socket && this.socket.connected
  }
}

// Export singleton
export default new SocketService()


