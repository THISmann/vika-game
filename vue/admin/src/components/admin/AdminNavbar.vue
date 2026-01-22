<template>
  <nav class="bg-white border-b border-gray-200 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <router-link
            to="/dashboard"
            class="flex items-center space-x-2 text-gray-900 hover:text-gray-700"
          >
            <svg class="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span class="text-lg font-semibold">Admin Panel</span>
          </router-link>
        </div>

        <div class="flex items-center space-x-4">
          <router-link
            to="/dashboard"
            class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="$route.path === '/dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'"
          >
            {{ t('admin.nav.dashboard') }}
          </router-link>
          
          <!-- Language Selector -->
          <div class="relative" ref="languageMenuRef">
            <button
              @click.stop="toggleLanguageMenu"
              class="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-1"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span class="hidden sm:inline">{{ getLanguageName(language) }}</span>
            </button>
            
            <!-- Language Dropdown -->
            <transition name="fade">
              <div
                v-if="showLanguageMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                @click.stop
              >
                <button
                  v-for="lang in availableLanguages"
                  :key="lang"
                  @click="selectLanguage(lang)"
                  class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between"
                  :class="{ 'bg-gray-50 font-medium': language === lang }"
                >
                  <span>{{ getLanguageName(lang) }}</span>
                  <span v-if="language === lang" class="text-blue-600">✓</span>
                </button>
              </div>
            </transition>
          </div>
          
          <button
            @click="logout"
            class="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-1"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{{ t('admin.nav.logout') }}</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/composables/useI18n'

export default {
  name: 'AdminNavbar',
  setup() {
    const { language, changeLanguage, t, availableLanguages } = useI18n()
    const showLanguageMenu = ref(false)
    const languageMenuRef = ref(null)
    
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
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
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
      languageMenuRef
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('admin')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
