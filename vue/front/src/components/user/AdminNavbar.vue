<template>
  <!-- Mobile: navbar après la sidebar (left-20) ; desktop: left-64 ou left-20 si collapse -->
  <nav class="bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 shadow-lg border-b border-purple-700 fixed top-0 z-[60] transition-all duration-300 left-20 md:left-64 right-0" :class="{ 'md:left-20': sidebarCollapsed }">
    <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
      <div class="flex justify-between items-center h-14 sm:h-16 min-h-14">
        <div class="flex items-center min-w-0 flex-1">
          <router-link
            to="/user/dashboard"
            class="text-lg sm:text-xl md:text-2xl font-bold text-white hover:text-purple-200 transition-colors truncate"
          >
            🎯 {{ t('sidebar.dashboard') || 'User Panel' }}
          </router-link>
        </div>

        <div class="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
          <!-- User Name -->
          <div class="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-white/10 border border-white/20 flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="hidden sm:inline">{{ userName }}</span>
          </div>
          
          <!-- Language Selector -->
          <div class="relative ml-2 sm:ml-4" ref="languageMenuRef">
            <button
              @click.stop="toggleLanguageMenu"
              class="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white hover:bg-white/20 transition-all transform hover:scale-105 flex items-center space-x-1 sm:space-x-2"
            >
              <span>🌐</span>
              <span class="hidden sm:inline">{{ getLanguageName(language) }}</span>
            </button>
            
            <!-- Language Dropdown -->
            <transition name="fade">
              <div
                v-if="showLanguageMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-[9999]"
                @click.stop
              >
                <button
                  v-for="lang in availableLanguages"
                  :key="lang"
                  @click="selectLanguage(lang)"
                  class="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors flex items-center justify-between"
                  :class="{ 'bg-blue-100 font-semibold': language === lang }"
                >
                  <span>{{ getLanguageName(lang) }}</span>
                  <span v-if="language === lang" class="text-blue-600 font-bold">✓</span>
                </button>
              </div>
            </transition>
          </div>
          
          <button
            @click="logout"
            class="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white hover:bg-red-600/30 transition-all"
          >
            {{ t('admin.nav.logout') }}
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/composables/useI18n'

export default {
  name: 'AdminNavbar',
  setup() {
    const { language, changeLanguage, t, availableLanguages } = useI18n()
    const showLanguageMenu = ref(false)
    const languageMenuRef = ref(null)
    const sidebarCollapsed = ref(false)
    
    // Get user name from localStorage
    const userName = computed(() => {
      try {
        const userInfoStr = localStorage.getItem('userInfo')
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr)
          return userInfo.name || userInfo.email || 'User'
        }
      } catch (error) {
        // console.error('Error parsing user info:', error)
      }
      return 'User'
    })
    
    const getLanguageName = (lang) => {
      const names = {
        fr: 'Français',
        en: 'English',
        ru: 'Русский'
      }
      return names[lang] || lang
    }
    
    const toggleLanguageMenu = () => {
      showLanguageMenu.value = !showLanguageMenu.value
    }
    
    const selectLanguage = (lang) => {
      changeLanguage(lang)
      showLanguageMenu.value = false
    }
    
    const handleClickOutside = (event) => {
      if (languageMenuRef.value && !languageMenuRef.value.contains(event.target)) {
        showLanguageMenu.value = false
      }
    }
    
    // Listen for sidebar collapse state changes
    const checkSidebarState = () => {
      const savedState = localStorage.getItem('sidebarCollapsed')
      sidebarCollapsed.value = savedState === 'true'
    }
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      checkSidebarState()
      // Check periodically for changes (every 100ms)
      const interval = setInterval(checkSidebarState, 100)
      // Store interval to clear it on unmount
      window.sidebarCheckInterval = interval
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      if (window.sidebarCheckInterval) {
        clearInterval(window.sidebarCheckInterval)
      }
    })
    
    return {
      language,
      changeLanguage,
      t,
      availableLanguages,
      showLanguageMenu,
      getLanguageName,
      toggleLanguageMenu,
      selectLanguage,
      languageMenuRef,
      userName,
      sidebarCollapsed
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userInfo')
      this.$router.push('/user/login')
    }
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

