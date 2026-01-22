import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io } from 'socket.io-client'
import apiClient from '@/services/api'
import { API_URLS, API_CONFIG } from '@/config/api'

export const useAdminStore = defineStore('admin', () => {
  // Socket connection
  const socket = ref(null)
  const isConnected = ref(false)
  
  // Dashboard stats
  const userStats = ref(null)
  const loadingStats = ref(false)
  const statsError = ref(null)
  const lastUpdateTime = ref(null)
  
  // Users list
  const users = ref([])
  const loadingUsers = ref(false)
  const usersError = ref(null)
  const usersPagination = ref(null)
  const usersFilters = ref({
    search: '',
    status: '',
    role: ''
  })
  
  // Analytics
  const analytics = ref(null)
  const loadingAnalytics = ref(false)
  const analyticsError = ref(null)
  const selectedPeriod = ref(30)
  
  // Initialize socket connection
  const initSocket = () => {
    if (socket.value && socket.value.connected) {
      return socket.value
    }
    
    // Determine WebSocket URL
    let wsUrl = API_URLS.ws.game || 'http://localhost:3003'
    
    const isLocalDev = typeof window !== 'undefined' && 
                      (window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.startsWith('192.168.') ||
                       window.location.hostname.startsWith('10.'))
    
    if (isLocalDev && typeof window !== 'undefined') {
      wsUrl = `${window.location.protocol}//${window.location.host}`
    }
    
    const socketPath = (isLocalDev && typeof window !== 'undefined' && window.location.port === '5174') 
      ? '/api/game/socket.io' 
      : '/socket.io'
    
    // console.log('🔌 Admin: Connecting to WebSocket:', wsUrl, 'path:', socketPath)
    
    socket.value = io(wsUrl, {
      path: socketPath,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      autoConnect: true,
      timeout: 20000
    })
    
    socket.value.on('connect', () => {
      // console.log('✅ Admin: WebSocket connected')
      isConnected.value = true
      
      // Request initial data
      loadUserStats()
    })
    
    socket.value.on('disconnect', () => {
      // console.warn('⚠️ Admin: WebSocket disconnected')
      isConnected.value = false
    })
    
    socket.value.on('connect_error', (error) => {
      // Ignore "server error" which is often temporary during connection
      if (error.message && error.message.includes('server error')) {
        // console.warn('⚠️ Admin: WebSocket connection error (temporary):', error.message)
        // Will retry automatically
        return
      }
      // console.error('❌ Admin: WebSocket connection error:', error.message)
      isConnected.value = false
    })
    
    socket.value.on('error', (error) => {
      // Handle errors after connection
      if (error && error.message && !error.message.includes('server error')) {
        // console.error('❌ Admin: WebSocket error:', error.message)
      }
    })
    
    // Listen for admin-specific events
    socket.value.on('admin:stats:update', (data) => {
      // console.log('📊 Admin: Stats updated via socket', data)
      userStats.value = data
      lastUpdateTime.value = new Date()
    })
    
    socket.value.on('admin:users:update', (data) => {
      // console.log('👥 Admin: Users updated via socket', data)
      if (data.users) {
        users.value = data.users
      }
      if (data.pagination) {
        usersPagination.value = data.pagination
      }
    })
    
    socket.value.on('admin:user:created', (user) => {
      // console.log('➕ Admin: New user created', user)
      // Add to users list if it matches current filters
      if (shouldIncludeUser(user)) {
        users.value.push(user)
        // Update pagination total
        if (usersPagination.value) {
          usersPagination.value.total += 1
        }
      }
      // Update stats
      loadUserStats()
    })
    
    socket.value.on('admin:user:updated', (user) => {
      // console.log('🔄 Admin: User updated', user)
      const index = users.value.findIndex(u => u.id === user.id)
      if (index !== -1) {
        users.value[index] = user
      }
      // Update stats
      loadUserStats()
    })
    
    socket.value.on('admin:user:deleted', (userId) => {
      // console.log('🗑️ Admin: User deleted', userId)
      users.value = users.value.filter(u => u.id !== userId)
      // Update pagination total
      if (usersPagination.value) {
        usersPagination.value.total = Math.max(0, usersPagination.value.total - 1)
      }
      // Update stats
      loadUserStats()
    })
    
    socket.value.on('admin:analytics:update', (data) => {
      // console.log('📈 Admin: Analytics updated via socket', data)
      analytics.value = data
    })
    
    return socket.value
  }
  
  // Helper to check if user should be included based on filters
  const shouldIncludeUser = (user) => {
    if (usersFilters.value.search) {
      const search = usersFilters.value.search.toLowerCase()
      const matchesSearch = 
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.id?.toLowerCase().includes(search)
      if (!matchesSearch) return false
    }
    
    if (usersFilters.value.status && user.status !== usersFilters.value.status) {
      return false
    }
    
    if (usersFilters.value.role && user.role !== usersFilters.value.role) {
      return false
    }
    
    return true
  }
  
  // Load user stats
  const loadUserStats = async () => {
    try {
      loadingStats.value = true
      statsError.value = null
      const res = await apiClient.get(API_URLS.auth.usersStats)
      userStats.value = res.data
      lastUpdateTime.value = new Date()
    } catch (err) {
      // console.error('Error loading user stats:', err)
      statsError.value = err.response?.data?.error || 'Failed to load user stats'
    } finally {
      loadingStats.value = false
    }
  }
  
  // Load users
  const loadUsers = async (page = null) => {
    try {
      loadingUsers.value = true
      usersError.value = null
      
      const params = new URLSearchParams()
      if (usersFilters.value.search) params.append('search', usersFilters.value.search)
      if (usersFilters.value.status) params.append('status', usersFilters.value.status)
      if (usersFilters.value.role) params.append('role', usersFilters.value.role)
      params.append('page', page || usersPagination.value?.page || 1)
      params.append('limit', '20')
      
      const url = `${API_URLS.auth.users}?${params.toString()}`
      const res = await apiClient.get(url)
      
      users.value = res.data.users || []
      usersPagination.value = res.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 }
    } catch (err) {
      // console.error('Error loading users:', err)
      usersError.value = err.response?.data?.error || 'Failed to load users'
    } finally {
      loadingUsers.value = false
    }
  }
  
  // Load analytics
  const loadAnalytics = async (period = null) => {
    try {
      loadingAnalytics.value = true
      analyticsError.value = null
      
      const periodToUse = period || selectedPeriod.value
      const res = await apiClient.get(API_URLS.auth.analytics(periodToUse))
      analytics.value = res.data
      selectedPeriod.value = periodToUse
    } catch (err) {
      // console.error('Error loading analytics:', err)
      analyticsError.value = err.response?.data?.error || 'Failed to load analytics'
    } finally {
      loadingAnalytics.value = false
    }
  }
  
  // Update user filters
  const updateUsersFilters = (filters) => {
    usersFilters.value = { ...usersFilters.value, ...filters }
    loadUsers(1) // Reset to page 1
  }
  
  // Disconnect socket
  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
    }
  }
  
  // Computed properties
  const formattedLastUpdateTime = computed(() => {
    if (!lastUpdateTime.value) return '--:--'
    return lastUpdateTime.value.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  })
  
  return {
    // State
    socket,
    isConnected,
    userStats,
    loadingStats,
    statsError,
    lastUpdateTime,
    users,
    loadingUsers,
    usersError,
    usersPagination,
    usersFilters,
    analytics,
    loadingAnalytics,
    analyticsError,
    selectedPeriod,
    
    // Computed
    formattedLastUpdateTime,
    
    // Actions
    initSocket,
    loadUserStats,
    loadUsers,
    loadAnalytics,
    updateUsersFilters,
    disconnect
  }
})

