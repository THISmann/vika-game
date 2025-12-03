// socketService.js - Singleton pour gérer la connexion WebSocket partagée
import { io } from 'socket.io-client'
import { API_CONFIG } from '@/config/api'

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

    // Détecter si on est en production
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    
    // En production, utiliser l'URL de la page actuelle (via proxy Nginx)
    let wsUrl
    if (isProduction) {
      wsUrl = `${window.location.protocol}//${window.location.host}`
      console.log('🌐 Production mode - Using current page URL for WebSocket:', wsUrl)
    } else {
      wsUrl = API_CONFIG.GAME_SERVICE
      console.log('🏠 Development mode - Using API_CONFIG.GAME_SERVICE:', wsUrl)
    }

    console.log('🔌 Creating WebSocket connection:', wsUrl)

    this.socket = io(wsUrl, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity, // Réessayer indéfiniment
      forceNew: false,
      autoConnect: true,
      timeout: 20000
    })

    // Gestion des événements de connexion
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket.id)
      this.isConnecting = false
      
      // Réenregistrer le joueur si on a un playerId
      const playerId = localStorage.getItem('playerId')
      if (playerId) {
        console.log('🔄 Re-registering player after reconnect:', playerId)
        this.socket.emit('register', playerId)
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error)
      this.isConnecting = false
    })

    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ WebSocket disconnected:', reason)
      this.isConnecting = false
      
      // Si c'est une déconnexion involontaire, la reconnexion automatique se fera
      if (reason === 'io server disconnect') {
        // Le serveur a déconnecté, on peut se reconnecter
        console.log('🔄 Server disconnected, will reconnect automatically')
      }
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('✅ WebSocket reconnected after', attemptNumber, 'attempts')
      
      // Réenregistrer le joueur après reconnexion
      const playerId = localStorage.getItem('playerId')
      if (playerId) {
        console.log('🔄 Re-registering player after reconnect:', playerId)
        this.socket.emit('register', playerId)
      }
    })

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnection attempt:', attemptNumber)
    })

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error)
    })

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after all attempts')
    })

    return this.socket
  }

  // Enregistrer un joueur (sans créer de nouvelle connexion)
  registerPlayer(playerId) {
    if (!this.socket) {
      this.connect()
    }

    // Attendre que la connexion soit établie
    if (this.socket.connected) {
      console.log('📝 Registering player:', playerId)
      this.socket.emit('register', playerId)
    } else {
      // Attendre la connexion puis enregistrer
      this.socket.once('connect', () => {
        console.log('📝 Registering player after connection:', playerId)
        this.socket.emit('register', playerId)
      })
    }
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
      console.warn('⚠️ Cannot emit event, socket not connected:', event)
    }
  }

  // Déconnecter (seulement si nécessaire)
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket')
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

