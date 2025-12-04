<template>
  <nav class="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-lg border-b border-purple-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-1">
          <router-link
            to="/player/register"
            class="text-2xl font-bold text-white hover:text-yellow-300 transition-colors"
          >
            🎮 Vika-Game
          </router-link>
        </div>

        <div class="flex items-center space-x-2 sm:space-x-4">
          <router-link
            to="/player/register"
            class="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white hover:bg-white/20 transition-all transform hover:scale-105"
            active-class="bg-white/30 font-bold"
          >
            {{ t('nav.register') }}
          </router-link>
          <router-link
            to="/player/quiz"
            class="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white hover:bg-white/20 transition-all transform hover:scale-105"
            active-class="bg-white/30 font-bold"
          >
            {{ t('nav.play') }}
          </router-link>
          <router-link
            to="/player/leaderboard"
            class="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white hover:bg-white/20 transition-all transform hover:scale-105"
            active-class="bg-white/30 font-bold"
          >
            {{ t('nav.leaderboard') }}
          </router-link>
          
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
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/composables/useI18n'

export default {
  name: 'PlayerNavbar',
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
    
    // Fermer le menu en cliquant à l'extérieur
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



