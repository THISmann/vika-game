import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import QuizPlay from '../player/QuizPlay.vue'
import axios from 'axios'
import { io } from 'socket.io-client'

// Mock axios
vi.mock('axios')
vi.mock('socket.io-client')

describe('QuizPlay', () => {
  let wrapper

  beforeEach(() => {
    // Mock localStorage
    localStorage.setItem('playerId', 'test-player-1')
    localStorage.setItem('playerName', 'Test Player')

    // Mock axios
    axios.get = vi.fn()
    axios.post = vi.fn()

    // Mock socket
    const mockSocket = {
      emit: vi.fn(),
      on: vi.fn(),
      disconnect: vi.fn()
    }
    io.mockReturnValue(mockSocket)
  })

  it('should display loading state initially', () => {
    axios.get.mockResolvedValue({ data: [] })
    
    wrapper = mount(QuizPlay, {
      global: {
        stubs: ['router-link', 'router-view']
      }
    })

    expect(wrapper.text()).toContain('Chargement')
  })

  it('should display waiting message when game not started', async () => {
    axios.get.mockResolvedValue({ 
      data: {
        isStarted: false,
        currentQuestionIndex: -1
      }
    })

    wrapper = mount(QuizPlay, {
      global: {
        stubs: ['router-link', 'router-view']
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('En attente du début du jeu')
  })

  it('should display question when game started', async () => {
    axios.get
      .mockResolvedValueOnce({ 
        data: {
          isStarted: true,
          currentQuestionIndex: 0,
          currentQuestionId: 'q1',
          questionStartTime: Date.now(),
          questionDuration: 30000
        }
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'q1',
            question: 'Test question?',
            choices: ['A', 'B', 'C', 'D'],
            answer: 'A'
          }
        ]
      })

    wrapper = mount(QuizPlay, {
      global: {
        stubs: ['router-link', 'router-view']
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.text()).toContain('Test question?')
  })

  it('should handle answer submission', async () => {
    axios.get
      .mockResolvedValueOnce({ 
        data: {
          isStarted: true,
          currentQuestionIndex: 0,
          currentQuestionId: 'q1',
          questionStartTime: Date.now(),
          questionDuration: 30000
        }
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'q1',
            question: 'Test question?',
            choices: ['A', 'B', 'C', 'D'],
            answer: 'A'
          }
        ]
      })

    axios.post.mockResolvedValue({
      data: {
        answered: true,
        message: 'Réponse enregistrée'
      }
    })

    wrapper = mount(QuizPlay, {
      global: {
        stubs: ['router-link', 'router-view']
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    const buttons = wrapper.findAll('button')
    const answerButton = buttons.find(btn => btn.text().includes('A'))
    
    if (answerButton) {
      await answerButton.trigger('click')
      await wrapper.vm.$nextTick()

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3003/game/answer',
        expect.objectContaining({
          playerId: 'test-player-1',
          questionId: 'q1',
          answer: expect.any(String)
        })
      )
    }
  })

  it('should redirect to register if no playerId', async () => {
    localStorage.removeItem('playerId')
    
    const mockRouter = {
      push: vi.fn()
    }

    wrapper = mount(QuizPlay, {
      global: {
        stubs: ['router-link', 'router-view'],
        mocks: {
          $router: mockRouter
        }
      }
    })

    await new Promise(resolve => setTimeout(resolve, 2500))
    expect(mockRouter.push).toHaveBeenCalledWith('/player/register')
  })
})





