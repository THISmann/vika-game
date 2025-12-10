/**
 * Tests d'intégration pour les endpoints critiques
 * Ces tests vérifient que les services fonctionnent ensemble
 * 
 * Prérequis: Les services doivent être démarrés
 * - Auth Service: http://localhost:3001
 * - Quiz Service: http://localhost:3002
 * - Game Service: http://localhost:3003
 */

const axios = require('axios')
const io = require('socket.io-client')

const AUTH_SERVICE = 'http://localhost:3001'
const QUIZ_SERVICE = 'http://localhost:3002'
const GAME_SERVICE = 'http://localhost:3003'

// Helper pour attendre que les services soient disponibles
async function waitForService(url, timeout = 10000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      await axios.get(`${url}/test`)
      return true
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  return false
}

describe('Tests d\'Intégration - Endpoints Critiques', () => {
  let playerId
  let questionId
  let gameCode

  beforeAll(async () => {
    // Attendre que les services soient disponibles
    console.log('⏳ Attente des services...')
    const servicesReady = await Promise.all([
      waitForService(AUTH_SERVICE),
      waitForService(QUIZ_SERVICE),
      waitForService(GAME_SERVICE)
    ])

    if (!servicesReady.every(ready => ready)) {
      throw new Error('Les services ne sont pas disponibles. Assurez-vous qu\'ils sont démarrés.')
    }
    console.log('✅ Tous les services sont disponibles')
  }, 30000)

  describe('Auth Service', () => {
    it('devrait créer un joueur', async () => {
      const response = await axios.post(`${AUTH_SERVICE}/auth/players/register`, {
        name: `TestPlayer_${Date.now()}`
      })

      expect(response.status).toBe(201)
      expect(response.data).toHaveProperty('id')
      expect(response.data).toHaveProperty('name')
      playerId = response.data.id
    })

    it('devrait récupérer la liste des joueurs', async () => {
      const response = await axios.get(`${AUTH_SERVICE}/auth/players`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
      expect(response.data.length).toBeGreaterThan(0)
    })

    it('devrait récupérer un joueur par ID', async () => {
      if (!playerId) {
        const createResponse = await axios.post(`${AUTH_SERVICE}/auth/players/register`, {
          name: `TestPlayer_${Date.now()}`
        })
        playerId = createResponse.data.id
      }

      const response = await axios.get(`${AUTH_SERVICE}/auth/players/${playerId}`)

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('id', playerId)
    })
  })

  describe('Quiz Service', () => {
    it('devrait récupérer toutes les questions (sans réponses)', async () => {
      const response = await axios.get(`${QUIZ_SERVICE}/quiz/all`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
      
      if (response.data.length > 0) {
        expect(response.data[0]).toHaveProperty('id')
        expect(response.data[0]).toHaveProperty('question')
        expect(response.data[0]).toHaveProperty('choices')
        expect(response.data[0]).not.toHaveProperty('answer')
        questionId = response.data[0].id
      }
    })

    it('devrait récupérer toutes les questions (avec réponses)', async () => {
      const response = await axios.get(`${QUIZ_SERVICE}/quiz/full`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
      
      if (response.data.length > 0) {
        expect(response.data[0]).toHaveProperty('answer')
      }
    })

    it('devrait créer une question', async () => {
      const response = await axios.post(`${QUIZ_SERVICE}/quiz/create`, {
        question: `Test Question ${Date.now()}?`,
        choices: ['Option A', 'Option B', 'Option C'],
        answer: 'Option A'
      })

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('id')
      expect(response.data).toHaveProperty('question')
      questionId = response.data.id
    })
  })

  describe('Game Service', () => {
    it('devrait récupérer le code de jeu', async () => {
      const response = await axios.get(`${GAME_SERVICE}/game/code`)

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('gameCode')
      gameCode = response.data.gameCode
    })

    it('devrait vérifier un code de jeu', async () => {
      if (!gameCode) {
        const codeResponse = await axios.get(`${GAME_SERVICE}/game/code`)
        gameCode = codeResponse.data.gameCode
      }

      const response = await axios.post(`${GAME_SERVICE}/game/verify-code`, {
        code: gameCode
      })

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('valid', true)
    })

    it('devrait récupérer l\'état du jeu', async () => {
      const response = await axios.get(`${GAME_SERVICE}/game/state`)

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('isStarted')
      expect(response.data).toHaveProperty('currentQuestionIndex')
      expect(response.data).toHaveProperty('connectedPlayersCount')
    })

    it('devrait récupérer le classement', async () => {
      const response = await axios.get(`${GAME_SERVICE}/game/leaderboard`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('devrait récupérer le score d\'un joueur', async () => {
      if (!playerId) {
        const createResponse = await axios.post(`${AUTH_SERVICE}/auth/players/register`, {
          name: `TestPlayer_${Date.now()}`
        })
        playerId = createResponse.data.id
      }

      const response = await axios.get(`${GAME_SERVICE}/game/score/${playerId}`)

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('playerId', playerId)
      expect(response.data).toHaveProperty('score')
    })
  })

  describe('WebSocket Integration', () => {
    it('devrait se connecter et enregistrer un joueur', (done) => {
      if (!playerId) {
        done(new Error('playerId non défini'))
        return
      }

      const socket = io(GAME_SERVICE, {
        path: '/socket.io',
        transports: ['polling'],
        timeout: 5000
      })

      let codeReceived = false
      let countReceived = false

      const checkDone = () => {
        if (codeReceived && countReceived) {
          socket.disconnect()
          done()
        }
      }

      socket.on('connect', () => {
        socket.emit('register', playerId)
      })

      socket.on('game:code', (data) => {
        expect(data).toHaveProperty('gameCode')
        codeReceived = true
        checkDone()
      })

      socket.on('players:count', (data) => {
        expect(data).toHaveProperty('count')
        countReceived = true
        checkDone()
      })

      socket.on('connect_error', (error) => {
        socket.disconnect()
        done(error)
      })

      // Timeout de sécurité
      setTimeout(() => {
        if (!codeReceived || !countReceived) {
          socket.disconnect()
          done(new Error('Timeout: événements non reçus'))
        }
      }, 10000)
    })
  })

  describe('Flux Complet', () => {
    it('devrait permettre le flux complet: inscription → connexion → jeu', async () => {
      // 1. Créer un joueur
      const playerResponse = await axios.post(`${AUTH_SERVICE}/auth/players/register`, {
        name: `E2E_Test_${Date.now()}`
      })
      const testPlayerId = playerResponse.data.id
      expect(testPlayerId).toBeDefined()

      // 2. Obtenir le code de jeu
      const codeResponse = await axios.get(`${GAME_SERVICE}/game/code`)
      const testGameCode = codeResponse.data.gameCode
      expect(testGameCode).toBeDefined()

      // 3. Vérifier le code
      const verifyResponse = await axios.post(`${GAME_SERVICE}/game/verify-code`, {
        code: testGameCode
      })
      expect(verifyResponse.data.valid).toBe(true)

      // 4. Se connecter au WebSocket
      const socket = await new Promise((resolve, reject) => {
        const s = io(GAME_SERVICE, {
          path: '/socket.io',
          transports: ['polling'],
          timeout: 5000
        })

        s.on('connect', () => resolve(s))
        s.on('connect_error', reject)

        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      })

      // 5. Enregistrer le joueur
      const gameCodeReceived = await new Promise((resolve, reject) => {
        socket.on('game:code', (data) => {
          resolve(data.gameCode)
        })
        socket.emit('register', testPlayerId)
        setTimeout(() => reject(new Error('game:code timeout')), 5000)
      })

      expect(gameCodeReceived).toBe(testGameCode)

      // 6. Vérifier que le joueur est dans la liste
      const playersResponse = await axios.get(`${GAME_SERVICE}/game/players`)
      const playerFound = playersResponse.data.players.some(p => p.id === testPlayerId)
      expect(playerFound).toBe(true)

      socket.disconnect()
    }, 30000)
  })
})

