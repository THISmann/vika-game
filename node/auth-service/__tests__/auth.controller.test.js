const request = require('supertest')
const express = require('express')
const authController = require('../controllers/auth.controller')

// Mock MongoDB/Mongoose
jest.mock('../config/database', () => ({
  connectDB: jest.fn(() => Promise.resolve())
}))

// Mock User model (Mongoose)
const mockUserInstance = {
  id: 'p1234567890',
  name: 'TestPlayer',
  score: 0,
  save: jest.fn().mockResolvedValue(true),
  toObject: jest.fn().mockReturnValue({
    id: 'p1234567890',
    name: 'TestPlayer',
    score: 0
  })
}

const mockUserModel = {
  findOne: jest.fn(),
  find: jest.fn()
}

// Mock User constructor
const MockUser = jest.fn().mockImplementation((data) => {
  return {
    ...data,
    save: jest.fn().mockResolvedValue({
      ...data,
      toObject: () => data
    }),
    toObject: () => data
  }
})

jest.mock('../models/User', () => {
  return jest.fn().mockImplementation((data) => {
    return {
      ...data,
      save: jest.fn().mockResolvedValue({
        ...data,
        toObject: () => data
      }),
      toObject: () => data
    }
  })
})

// Mock User static methods
const User = require('../models/User')
User.findOne = mockUserModel.findOne
User.find = mockUserModel.find

// Mock cache
jest.mock('../../shared/cache-utils', () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(true),
  del: jest.fn().mockResolvedValue(true),
  PREFIXES: {
    AUTH: 'auth:',
    PLAYER: 'player:',
    ALL_PLAYERS: 'players:all'
  },
  TTL: {
    PLAYER: 3600,
    PLAYERS_LIST: 300
  }
}))

// Mock token generator
jest.mock('../utils/token', () => ({
  generateToken: jest.fn((role) => `token-${role}-${Date.now()}`)
}))

const app = express()
app.use(express.json())
app.post('/auth/players/register', authController.registerPlayer)
app.get('/auth/players', authController.getAllPlayers)
app.get('/auth/players/:id', authController.getPlayer)
app.post('/auth/admin/login', authController.adminLogin)

describe('Auth Controller - Endpoints Critiques', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /auth/players/register', () => {
    it('devrait créer un nouveau joueur avec un nom valide', async () => {
      mockUserModel.findOne.mockResolvedValue(null)
      
      // Mock User constructor pour retourner une instance avec save
      const mockNewUser = {
        id: 'p' + Date.now(),
        name: 'TestPlayer',
        score: 0,
        save: jest.fn().mockResolvedValue({
          id: 'p123',
          name: 'TestPlayer',
          score: 0,
          toObject: () => ({ id: 'p123', name: 'TestPlayer', score: 0 })
        }),
        toObject: () => ({ id: 'p123', name: 'TestPlayer', score: 0 })
      }
      
      User.mockImplementation(() => mockNewUser)

      const response = await request(app)
        .post('/auth/players/register')
        .send({ name: 'TestPlayer' })
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('name', 'TestPlayer')
    })

    it('devrait rejeter un nom déjà utilisé (409)', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUserInstance)

      const response = await request(app)
        .post('/auth/players/register')
        .send({ name: 'TestPlayer' })
        .expect(409)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('already exists')
    })

    it('devrait rejeter un nom vide (400)', async () => {
      const response = await request(app)
        .post('/auth/players/register')
        .send({ name: '' })
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('devrait rejeter si le nom est manquant (400)', async () => {
      const response = await request(app)
        .post('/auth/players/register')
        .send({})
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /auth/players', () => {
    it('devrait retourner la liste de tous les joueurs', async () => {
      const mockPlayers = [
        { id: 'p1', name: 'Player1', score: 0, toObject: () => ({ id: 'p1', name: 'Player1', score: 0 }) },
        { id: 'p2', name: 'Player2', score: 0, toObject: () => ({ id: 'p2', name: 'Player2', score: 0 }) }
      ]

      mockUserModel.find.mockResolvedValue(mockPlayers)

      const response = await request(app)
        .get('/auth/players')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThanOrEqual(0)
    })

    it('devrait retourner un tableau vide si aucun joueur', async () => {
      mockUserModel.find.mockResolvedValue([])

      const response = await request(app)
        .get('/auth/players')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(0)
    })
  })

  describe('GET /auth/players/:id', () => {
    it('devrait retourner un joueur par ID', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUserInstance)

      const response = await request(app)
        .get('/auth/players/p1234567890')
        .expect(200)

      expect(response.body).toHaveProperty('id', 'p1234567890')
      expect(response.body).toHaveProperty('name', 'TestPlayer')
    })

    it('devrait retourner 404 si le joueur n\'existe pas', async () => {
      mockUserModel.findOne.mockResolvedValue(null)

      const response = await request(app)
        .get('/auth/players/nonexistent')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /auth/admin/login', () => {
    it('devrait authentifier un admin avec des identifiants valides', async () => {
      const response = await request(app)
        .post('/auth/admin/login')
        .send({ username: 'admin', password: 'admin' })
        .expect(200)

      expect(response.body).toHaveProperty('token')
      expect(typeof response.body.token).toBe('string')
    })

    it('devrait rejeter des identifiants invalides (401)', async () => {
      const response = await request(app)
        .post('/auth/admin/login')
        .send({ username: 'admin', password: 'wrong' })
        .expect(401)

      expect(response.body).toHaveProperty('error')
    })

    it('devrait rejeter si les identifiants sont manquants (401)', async () => {
      const response = await request(app)
        .post('/auth/admin/login')
        .send({})
        .expect(401)

      expect(response.body).toHaveProperty('error')
    })
  })
})
