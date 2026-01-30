<template>
  <!-- Hidden on mobile (max-md:hidden + hidden md:block); only visible on md+ or inside MobileSidebarToggle overlay -->
  <aside 
    class="hidden md:block max-md:!hidden bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 text-white min-h-screen fixed left-0 top-0 z-50 shadow-2xl transition-all duration-300"
    :class="isCollapsed ? 'w-20' : 'w-64'"
  >
    <div class="flex flex-col h-full">
      <!-- Logo/Header -->
      <div class="p-2 sm:p-4 md:p-6 border-b border-white/20 relative">
        <div class="flex items-center justify-center md:space-x-3" :class="{ 'md:justify-start': !isCollapsed }">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            🎮
          </div>
          <div v-if="!isCollapsed" class="flex-1 min-w-0 ml-3 hidden md:block">
            <h2 class="text-lg font-bold truncate">{{ t('sidebar.appName') || 'Vika-Game' }}</h2>
            <p class="text-xs text-blue-200 truncate">{{ t('sidebar.dashboard') || 'Dashboard' }}</p>
          </div>
        </div>
        <!-- Toggle Button - Only on desktop -->
        <button
          @click="toggleSidebar"
          class="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all z-50 hidden md:flex"
          :class="{ 'rotate-180': isCollapsed }"
        >
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-2 sm:p-4 space-y-2 overflow-y-auto">
        <router-link
          to="/user/dashboard"
          @click="mobile && emit('close')"
          class="flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all hover:bg-white/10 group"
          :class="{ 
            'bg-white/20 font-semibold': $route.path === '/user/dashboard',
            'justify-center': isCollapsed || !isCollapsed
          }"
          :title="(isCollapsed || !isCollapsed) ? (t('sidebar.dashboard') || 'Dashboard') : ''"
        >
          <svg class="w-6 h-6 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span v-if="!isCollapsed" class="truncate hidden md:inline">{{ t('sidebar.dashboard') || 'Dashboard' }}</span>
        </router-link>

        <router-link
          to="/user/parties"
          @click="mobile && emit('close')"
          class="flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all hover:bg-white/10 group"
          :class="{ 
            'bg-white/20 font-semibold': $route.path === '/user/parties',
            'justify-center': isCollapsed || !isCollapsed
          }"
          :title="(isCollapsed || !isCollapsed) ? (t('sidebar.parties') || 'Parties') : ''"
        >
          <svg class="w-6 h-6 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span v-if="!isCollapsed" class="truncate hidden md:inline">{{ t('sidebar.parties') || 'Parties' }}</span>
        </router-link>

        <router-link
          to="/user/questions"
          @click="mobile && emit('close')"
          class="flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all hover:bg-white/10 group"
          :class="{ 
            'bg-white/20 font-semibold': $route.path === '/user/questions',
            'justify-center': isCollapsed || !isCollapsed
          }"
          :title="(isCollapsed || !isCollapsed) ? (t('sidebar.questions') || 'Questions') : ''"
        >
          <svg class="w-6 h-6 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span v-if="!isCollapsed" class="truncate hidden md:inline">{{ t('sidebar.questions') || 'Questions' }}</span>
        </router-link>

        <router-link
          to="/user/leaderboard"
          @click="mobile && emit('close')"
          class="flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all hover:bg-white/10 group"
          :class="{ 
            'bg-white/20 font-semibold': $route.path === '/user/leaderboard',
            'justify-center': isCollapsed || !isCollapsed
          }"
          :title="(isCollapsed || !isCollapsed) ? (t('sidebar.leaderboard') || 'Classement') : ''"
        >
          <svg class="w-6 h-6 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span v-if="!isCollapsed" class="truncate hidden md:inline">{{ t('sidebar.leaderboard') || 'Classement' }}</span>
        </router-link>

        <router-link
          to="/user/settings"
          @click="mobile && emit('close')"
          class="flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all hover:bg-white/10 group"
          :class="{ 
            'bg-white/20 font-semibold': $route.path === '/user/settings',
            'justify-center': isCollapsed || !isCollapsed
          }"
          :title="(isCollapsed || !isCollapsed) ? (t('sidebar.settings') || 'Paramètres') : ''"
        >
          <svg class="w-6 h-6 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span v-if="!isCollapsed" class="truncate hidden md:inline">{{ t('sidebar.settings') || 'Paramètres' }}</span>
        </router-link>
      </nav>

      <!-- User Info & Logout -->
      <div class="p-2 sm:p-4 border-t border-white/20">
        <div v-if="currentUser && !isCollapsed" class="mb-4 p-3 bg-white/10 rounded-xl hidden md:block">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              {{ currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U' }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold truncate">{{ currentUser.name || currentUser.email || 'User' }}</div>
              <div class="text-xs text-blue-200 truncate">{{ currentUser.email || '' }}</div>
            </div>
          </div>
        </div>
        <div v-else-if="currentUser" class="mb-4 flex justify-center">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold" :title="currentUser.name || currentUser.email || 'User'">
            {{ currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U' }}
          </div>
        </div>
        <button
          @click="logout"
          class="w-full flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-red-600 hover:bg-red-700 transition-all"
          :class="{ 'md:justify-center': isCollapsed }"
          :title="(isCollapsed || !isCollapsed) ? (t('sidebar.logout') || 'Déconnexion') : ''"
        >
          <svg class="w-6 h-6 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span v-if="!isCollapsed" class="truncate hidden md:inline">{{ t('sidebar.logout') || 'Déconnexion' }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'

export default {
  name: 'UserSidebar',
  props: {
    mobile: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const router = useRouter()
    const { t } = useI18n()
    const isCollapsed = ref(false)

    // Load collapsed state from localStorage
    onMounted(() => {
      const savedState = localStorage.getItem('sidebarCollapsed')
      if (savedState !== null) {
        isCollapsed.value = savedState === 'true'
      }
    })

    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value
      localStorage.setItem('sidebarCollapsed', isCollapsed.value.toString())
    }

    const currentUser = computed(() => {
      try {
        const userInfoStr = localStorage.getItem('userInfo')
        if (userInfoStr) {
          return JSON.parse(userInfoStr)
        }
      } catch (error) {
        // console.error('Error parsing user info:', error)
      }
      return null
    })

    const logout = () => {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userInfo')
      router.push('/user/login')
    }

    return {
      t,
      currentUser,
      logout,
      isCollapsed,
      toggleSidebar,
      emit
    }
  }
}
</script>

<style scoped>
/* Smooth scrolling for overflow */
nav {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

nav::-webkit-scrollbar {
  width: 6px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}
</style>

