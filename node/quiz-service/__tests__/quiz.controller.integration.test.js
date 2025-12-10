const request = require('supertest')
const express = require('express')
const quizRoutes = require('../routes/quiz.routes')

// Mock MongoDB
jest.mock('../config/database', () => ({
  connectDB: jest.fn(() => Promise.resolve())
}))

// Mock Question model
const mockQuestion = {
  id: 'q1234567890',
  question: 'What is the capital of France?',
  choices: ['Paris', 'London', 'Berlin', 'Madrid'],
  answer: 'Paris',
  save: jest.fn().mockResolvedValue(true),
  toObject: jest.fn().mockReturnValue({
    id: 'q1234567890',
    question: 'What is the capital of France?',
    choices: ['Paris', 'London', 'Berlin', 'Madrid'],
    answer: 'Paris'
  })
}

jest.mock('../models/Question', () => {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
  }
})

const Question = require('../models/Question')

const app = express()
app.use(express.json())
app.use('/quiz', quizRoutes)

describe('Quiz Controller - Tests d\'Intégration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /quiz/all', () => {
    it('devrait retourner toutes les questions sans les réponses', async () => {
      const mockQuestions = [
        {
          id: 'q1',
          question: 'Q1?',
          choices: ['A', 'B'],
          toObject: () => ({ id: 'q1', question: 'Q1?', choices: ['A', 'B'] })
        },
        {
          id: 'q2',
          question: 'Q2?',
          choices: ['C', 'D'],
          toObject: () => ({ id: 'q2', question: 'Q2?', choices: ['C', 'D'] })
        }
      ]

      Question.find = jest.fn().mockReturnValue({
        map: jest.fn().mockReturnValue(mockQuestions.map(q => q.toObject()))
      })

      const response = await request(app)
        .get('/quiz/all')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(2)
      // Vérifier qu'il n'y a pas de champ 'answer'
      response.body.forEach(q => {
        expect(q).not.toHaveProperty('answer')
      })
    })
  })

  describe('GET /quiz/full', () => {
    it('devrait retourner toutes les questions avec les réponses', async () => {
      const mockQuestions = [
        {
          id: 'q1',
          question: 'Q1?',
          choices: ['A', 'B'],
          answer: 'A',
          toObject: () => ({ id: 'q1', question: 'Q1?', choices: ['A', 'B'], answer: 'A' })
        }
      ]

      Question.find = jest.fn().mockReturnValue({
        map: jest.fn().mockReturnValue(mockQuestions.map(q => q.toObject()))
      })

      const response = await request(app)
        .get('/quiz/full')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body[0]).toHaveProperty('answer')
    })
  })

  describe('POST /quiz/create', () => {
    it('devrait créer une nouvelle question', async () => {
      Question.findOne = jest.fn().mockResolvedValue(null)
      Question.create = jest.fn().mockResolvedValue(mockQuestion)

      const response = await request(app)
        .post('/quiz/create')
        .send({
          question: 'What is the capital of France?',
          choices: ['Paris', 'London', 'Berlin', 'Madrid'],
          answer: 'Paris'
        })
        .expect(200)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('question')
      expect(response.body).toHaveProperty('choices')
      expect(response.body).toHaveProperty('answer')
    })

    it('devrait rejeter une question avec des champs manquants', async () => {
      const response = await request(app)
        .post('/quiz/create')
        .send({
          question: 'Test?',
          // Missing choices and answer
        })
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('devrait rejeter une question avec moins de 2 choix', async () => {
      const response = await request(app)
        .post('/quiz/create')
        .send({
          question: 'Test?',
          choices: ['A'], // Only 1 choice
          answer: 'A'
        })
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /quiz/:id', () => {
    it('devrait mettre à jour une question existante', async () => {
      Question.findById = jest.fn().mockResolvedValue(mockQuestion)
      Question.findByIdAndUpdate = jest.fn().mockResolvedValue({
        ...mockQuestion,
        question: 'Updated question?'
      })

      const response = await request(app)
        .put('/quiz/q1234567890')
        .send({
          question: 'Updated question?',
          choices: ['A', 'B'],
          answer: 'A'
        })
        .expect(200)

      expect(response.body).toHaveProperty('question', 'Updated question?')
    })

    it('devrait retourner 404 si la question n\'existe pas', async () => {
      Question.findById = jest.fn().mockResolvedValue(null)

      const response = await request(app)
        .put('/quiz/nonexistent')
        .send({
          question: 'Test?',
          choices: ['A', 'B'],
          answer: 'A'
        })
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('DELETE /quiz/:id', () => {
    it('devrait supprimer une question existante', async () => {
      Question.findByIdAndDelete = jest.fn().mockResolvedValue(mockQuestion)

      const response = await request(app)
        .delete('/quiz/q1234567890')
        .expect(200)

      expect(response.body).toHaveProperty('message')
    })

    it('devrait retourner 404 si la question n\'existe pas', async () => {
      Question.findByIdAndDelete = jest.fn().mockResolvedValue(null)

      const response = await request(app)
        .delete('/quiz/nonexistent')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })
  })
})

