const request = require('supertest')
const express = require('express')
const gameRoutes = require('../routes/game.routes')
const gameState = require('../gameState')

// Mock dependencies
jest.mock('../config/database', () => ({
  connectDB: jest.fn(() => Promise.resolve())
}))

jest.mock('../shared/redis-client', () => ({
  connect: jest.fn(() => Promise.resolve())
}))

jest.mock('../shared/cache-utils', () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(true),
  del: jest.fn().mockResolvedValue(true),
  PREFIXES: {
    SCORE: 'score:',
    LEADERBOARD: 'leaderboard:',
    GAME: 'game:'
  },
  TTL: {
    SCORE: 3600,
    LEADERBOARD: 300
  }
}))

// Mock axios for external service calls
jest.mock('axios')
const axios = require('axios')

// Mock Score model
const mockScore = {
  playerId: 'p123',
  playerName: 'TestPlayer',
  score: 5,
  save: jest.fn().mockResolvedValue(true),
  toObject: jest.fn().mockReturnValue({
    playerId: 'p123',
    playerName: 'TestPlayer',
    score: 5
  })
}

jest.mock('../models/Score', () => {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteMany: jest.fn()
  }
})

const Score = require('../models/Score')

const app = express()
app.use(express.json())
app.use('/game', (req, res, next) => {
  // Mock io for WebSocket
  req.io = {
    emit: jest.fn(),
    sockets: {
      sockets: {
        size: 0
      }
    }
  }
  next()
}, gameRoutes)

describe('Game Controller - Tests d\'Intégration', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    // Reset game state
    await gameState.resetGame()
  })

  describe('POST /game/answer', () => {
    it('devrait accepter une réponse et calculer le score', async () => {
      // Setup mocks
      const mockPlayer = { id: 'p123', name: 'TestPlayer' }
      const mockQuestion = {
        id: 'q123',
        question: 'Test?',
        choices: ['A', 'B', 'C'],
        answer: 'A'
      }

      axios.get
        .mockResolvedValueOnce({ data: [mockPlayer] }) // auth service
        .mockResolvedValueOnce({ data: [mockQuestion] }) // quiz service

      Score.findOne = jest.fn().mockResolvedValue(null)
      Score.findOneAndUpdate = jest.fn().mockResolvedValue(mockScore)

      // Start game first
      await gameState.startGame()
      await gameState.setCurrentQuestion('q123', 30000)

      const response = await request(app)
        .post('/game/answer')
        .send({
          playerId: 'p123',
          questionId: 'q123',
          answer: 'A'
        })
        .expect(200)

      expect(response.body).toHaveProperty('correct', true)
      expect(response.body).toHaveProperty('answered', true)
      expect(response.body).toHaveProperty('playerName', 'TestPlayer')
    })

    it('devrait rejeter une réponse si le jeu n\'a pas commencé', async () => {
      const response = await request(app)
        .post('/game/answer')
        .send({
          playerId: 'p123',
          questionId: 'q123',
          answer: 'A'
        })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('pas encore commencé')
    })

    it('devrait rejeter une réponse à une question inactive', async () => {
      await gameState.startGame()
      await gameState.setCurrentQuestion('q456', 30000)

      const response = await request(app)
        .post('/game/answer')
        .send({
          playerId: 'p123',
          questionId: 'q123', // Wrong question ID
          answer: 'A'
        })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('plus active')
    })
  })

  describe('GET /game/leaderboard', () => {
    it('devrait retourner le classement trié par score', async () => {
      const mockScores = [
        { playerId: 'p1', playerName: 'Player1', score: 10 },
        { playerId: 'p2', playerName: 'Player2', score: 5 },
        { playerId: 'p3', playerName: 'Player3', score: 8 }
      ]

      Score.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockScores)
      })

      const response = await request(app)
        .get('/game/leaderboard')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(3)
      // Vérifier que c'est trié par score décroissant
      expect(response.body[0].score).toBeGreaterThanOrEqual(response.body[1].score)
    })

    it('devrait retourner un tableau vide si aucun score', async () => {
      Score.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      })

      const response = await request(app)
        .get('/game/leaderboard')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(0)
    })
  })

  describe('GET /game/score/:playerId', () => {
    it('devrait retourner le score d\'un joueur', async () => {
      Score.findOne = jest.fn().mockResolvedValue(mockScore)

      const response = await request(app)
        .get('/game/score/p123')
        .expect(200)

      expect(response.body).toHaveProperty('playerId', 'p123')
      expect(response.body).toHaveProperty('score', 5)
      expect(response.body).toHaveProperty('playerName', 'TestPlayer')
    })

    it('devrait retourner un score de 0 si le joueur n\'a pas de score', async () => {
      Score.findOne = jest.fn().mockResolvedValue(null)

      const response = await request(app)
        .get('/game/score/p123')
        .expect(200)

      expect(response.body).toHaveProperty('playerId', 'p123')
      expect(response.body).toHaveProperty('score', 0)
    })
  })

  describe('POST /game/start', () => {
    it('devrait démarrer le jeu avec des questions disponibles', async () => {
      const mockQuestions = [
        { id: 'q1', question: 'Q1?', choices: ['A', 'B'], answer: 'A' },
        { id: 'q2', question: 'Q2?', choices: ['A', 'B'], answer: 'B' }
      ]

      axios.get = jest.fn().mockResolvedValue({ data: mockQuestions })

      const response = await request(app)
        .post('/game/start')
        .send({ questionDuration: 30 })
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('state')
      expect(response.body.state.isStarted).toBe(true)
    })

    it('devrait rejeter le démarrage si aucune question disponible', async () => {
      axios.get = jest.fn().mockResolvedValue({ data: [] })

      const response = await request(app)
        .post('/game/start')
        .send({ questionDuration: 30 })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Aucune question')
    })
  })

  describe('GET /game/state', () => {
    it('devrait retourner l\'état actuel du jeu', async () => {
      await gameState.startGame()

      const response = await request(app)
        .get('/game/state')
        .expect(200)

      expect(response.body).toHaveProperty('isStarted')
      expect(response.body).toHaveProperty('currentQuestionIndex')
      expect(response.body).toHaveProperty('connectedPlayersCount')
    })
  })

  describe('POST /game/verify-code', () => {
    it('devrait valider un code de jeu correct', async () => {
      const state = await gameState.getState()
      const gameCode = state.gameCode || 'ABC123'
      await gameState.setState({ gameCode })

      const response = await request(app)
        .post('/game/verify-code')
        .send({ code: gameCode })
        .expect(200)

      expect(response.body).toHaveProperty('valid', true)
      expect(response.body).toHaveProperty('gameCode', gameCode)
    })

    it('devrait rejeter un code de jeu incorrect', async () => {
      await gameState.setState({ gameCode: 'ABC123' })

      const response = await request(app)
        .post('/game/verify-code')
        .send({ code: 'WRONG' })
        .expect(200)

      expect(response.body).toHaveProperty('valid', false)
    })
  })
})

