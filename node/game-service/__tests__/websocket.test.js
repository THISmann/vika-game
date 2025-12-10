const io = require('socket.io-client')
const http = require('http')
const { Server } = require('socket.io')
const gameState = require('../gameState')

// Mock dependencies
jest.mock('../config/database', () => ({
  connectDB: jest.fn(() => Promise.resolve())
}))

jest.mock('../shared/redis-client', () => ({
  connect: jest.fn(() => Promise.resolve())
}))

jest.mock('../models/Score', () => {
  return {
    findOne: jest.fn(),
    create: jest.fn()
  }
})

jest.mock('axios', () => ({
  get: jest.fn()
}))

const axios = require('axios')

describe('WebSocket - Tests d\'Intégration', () => {
  let server
  let ioServer
  let clientSocket
  const PORT = 3999

  beforeAll((done) => {
    // Create HTTP server
    server = http.createServer()
    
    // Create Socket.io server
    ioServer = new Server(server, {
      path: '/socket.io',
      transports: ['polling', 'websocket']
    })

    // Setup socket handlers (simplified version)
    ioServer.on('connection', (socket) => {
      socket.on('register', async (playerId) => {
        const state = await gameState.getState()
        if (!state.connectedPlayers.includes(playerId)) {
          await gameState.addConnectedPlayer(playerId)
        }
        const count = await gameState.getConnectedPlayersCount()
        ioServer.emit('players:count', { count })
        socket.emit('game:code', { gameCode: state.gameCode || 'TEST123' })
      })
    })

    server.listen(PORT, () => {
      done()
    })
  })

  afterAll((done) => {
    ioServer.close()
    server.close()
    done()
  })

  afterEach((done) => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect()
    }
    done()
  })

  describe('Connexion WebSocket', () => {
    it('devrait se connecter au serveur', (done) => {
      clientSocket = io(`http://localhost:${PORT}`, {
        path: '/socket.io',
        transports: ['polling']
      })

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true)
        expect(clientSocket.id).toBeDefined()
        done()
      })

      clientSocket.on('connect_error', (error) => {
        done(error)
      })
    })
  })

  describe('Événement register', () => {
    it('devrait enregistrer un joueur et recevoir game:code', (done) => {
      clientSocket = io(`http://localhost:${PORT}`, {
        path: '/socket.io',
        transports: ['polling']
      })

      clientSocket.on('connect', () => {
        clientSocket.emit('register', 'test-player-123')
      })

      clientSocket.on('game:code', (data) => {
        expect(data).toHaveProperty('gameCode')
        expect(typeof data.gameCode).toBe('string')
        done()
      })

      clientSocket.on('connect_error', (error) => {
        done(error)
      })
    })

    it('devrait recevoir players:count après enregistrement', (done) => {
      clientSocket = io(`http://localhost:${PORT}`, {
        path: '/socket.io',
        transports: ['polling']
      })

      let codeReceived = false
      let countReceived = false

      const checkDone = () => {
        if (codeReceived && countReceived) {
          done()
        }
      }

      clientSocket.on('connect', () => {
        clientSocket.emit('register', 'test-player-456')
      })

      clientSocket.on('game:code', () => {
        codeReceived = true
        checkDone()
      })

      clientSocket.on('players:count', (data) => {
        expect(data).toHaveProperty('count')
        expect(typeof data.count).toBe('number')
        countReceived = true
        checkDone()
      })

      clientSocket.on('connect_error', (error) => {
        done(error)
      })
    })
  })

  describe('Gestion des erreurs', () => {
    it('devrait gérer la déconnexion proprement', (done) => {
      clientSocket = io(`http://localhost:${PORT}`, {
        path: '/socket.io',
        transports: ['polling']
      })

      clientSocket.on('connect', () => {
        clientSocket.disconnect()
      })

      clientSocket.on('disconnect', () => {
        expect(clientSocket.connected).toBe(false)
        done()
      })
    })
  })
})

