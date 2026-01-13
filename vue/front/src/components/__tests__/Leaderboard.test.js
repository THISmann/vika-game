import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Leaderboard from '../player/Leaderboard.vue'
import axios from 'axios'
import { io } from 'socket.io-client'

// Mock axios
vi.mock('axios')
vi.mock('socket.io-client')

describe('Leaderboard', () => {
  let wrapper

  beforeEach(() => {
    // Mock localStorage
    localStorage.setItem('playerId', 'test-player-1')

    // Mock axios
    axios.get = vi.fn().mockResolvedValue({
      data: [
        { playerId: 'p1', playerName: 'Player 1', score: 10 },
        { playerId: 'p2', playerName: 'Player 2', score: 8 },
        { playerId: 'p3', playerName: 'Player 3', score: 5 }
      ]
    })

    // Mock socket
    const mockSocket = {
      emit: vi.fn(),
      on: vi.fn(),
      disconnect: vi.fn()
    }
    io.mockReturnValue(mockSocket)
  })

  it('should display loading state initially', () => {
    wrapper = mount(Leaderboard, {
      global: {
        stubs: ['router-link', 'router-view']
      }
    })

    expect(wrapper.text()).toContain('Chargement')
  })

  it('should load and display leaderboard', async () => {
    wrapper = mount(Leaderboard, {
      global: {
        stubs: ['router-link', 'router-view']
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3003/game/leaderboard')
    expect(wrapper.text()).toContain('Player 1')
    expect(wrapper.text()).toContain('Player 2')
  })

  it('should display empty state when no players', async () => {
    axios.get.mockResolvedValueOnce({ data: [] })

    wrapper = mount(Leaderboard, {
      global: {
        stubs: ['router-link', 'router-view']
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.text()).toContain('Aucun joueur')
  })

  it('should update leaderboard on socket event', async () => {
    const mockSocket = {
      emit: vi.fn(),
      on: vi.fn((event, callback) => {
        if (event === 'leaderboard:update') {
          setTimeout(() => {
            callback([
              { playerId: 'p1', playerName: 'Player 1', score: 15 },
              { playerId: 'p2', playerName: 'Player 2', score: 10 }
            ])
          }, 100)
        }
      }),
      disconnect: vi.fn()
    }
    io.mockReturnValue(mockSocket)

    wrapper = mount(Leaderboard, {
      global: {
        stubs: ['router-link', 'router-view']
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 200))

    expect(mockSocket.on).toHaveBeenCalledWith('leaderboard:update', expect.any(Function))
  })

  it('should disconnect socket on unmount', () => {
    const mockSocket = {
      emit: vi.fn(),
      on: vi.fn(),
      disconnect: vi.fn()
    }
    io.mockReturnValue(mockSocket)

    wrapper = mount(Leaderboard, {
      global: {
        stubs: ['router-link', 'router-view']
      }
    })

    wrapper.unmount()

    expect(mockSocket.disconnect).toHaveBeenCalled()
  })
})









