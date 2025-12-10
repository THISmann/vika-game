<template>
  <nav class="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-lg border-b border-purple-700">
    <div class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
      <div class="flex justify-between items-center h-14 sm:h-16">
        <!-- Logo -->
        <div class="flex items-center space-x-1 sm:space-x-2">
          <router-link
            to="/player/register"
            class="text-xl sm:text-2xl font-bold text-white hover:text-yellow-300 transition-colors"
          >
            🎮 <span class="hidden xs:inline">Vika-Game</span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-2 lg:space-x-4">
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
          
          <!-- Language Selector Desktop -->
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

        <!-- Mobile Menu Button -->
        <div class="flex md:hidden items-center space-x-2">
          <!-- Language Selector Mobile (Icon only) -->
          <div class="relative" ref="languageMenuRefMobile">
            <button
              @click.stop="toggleLanguageMenu"
              class="px-2 py-2 rounded-lg text-white hover:bg-white/20 transition-all"
            >
              <span class="text-lg">🌐</span>
            </button>
            
            <!-- Language Dropdown Mobile -->
            <transition name="fade">
              <div
                v-if="showLanguageMenu"
                class="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-[9999]"
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

          <!-- Hamburger Menu Button -->
          <button
            @click="toggleMobileMenu"
            class="px-2 py-2 rounded-lg text-white hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Toggle menu"
          >
            <svg
              v-if="!showMobileMenu"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              v-else
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <transition name="slide-down">
        <div
          v-if="showMobileMenu"
          class="md:hidden border-t border-purple-700/50 py-3 sm:py-4"
        >
          <div class="flex flex-col space-y-2">
            <router-link
              to="/player/register"
              @click="closeMobileMenu"
              class="px-4 py-3 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-all active:bg-white/30"
              active-class="bg-white/30 font-bold"
            >
              {{ t('nav.register') }}
            </router-link>
            <router-link
              to="/player/quiz"
              @click="closeMobileMenu"
              class="px-4 py-3 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-all active:bg-white/30"
              active-class="bg-white/30 font-bold"
            >
              {{ t('nav.play') }}
            </router-link>
            <router-link
              to="/player/leaderboard"
              @click="closeMobileMenu"
              class="px-4 py-3 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-all active:bg-white/30"
              active-class="bg-white/30 font-bold"
            >
              {{ t('nav.leaderboard') }}
            </router-link>
          </div>
        </div>
      </transition>
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
    const showMobileMenu = ref(false)
    const languageMenuRef = ref(null)
    const languageMenuRefMobile = ref(null)
    
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
    
    const toggleMobileMenu = () => {
      showMobileMenu.value = !showMobileMenu.value
      // Fermer le menu de langue si ouvert
      if (showMobileMenu.value) {
        showLanguageMenu.value = false
      }
    }
    
    const closeMobileMenu = () => {
      showMobileMenu.value = false
    }
    
    // Fermer les menus en cliquant à l'extérieur
    const handleClickOutside = (event) => {
      if (languageMenuRef.value && !languageMenuRef.value.contains(event.target)) {
        showLanguageMenu.value = false
      }
      if (languageMenuRefMobile.value && !languageMenuRefMobile.value.contains(event.target)) {
        showLanguageMenu.value = false
      }
      // Fermer le menu mobile si on clique ailleurs (sauf sur le bouton hamburger)
      if (showMobileMenu.value && !event.target.closest('nav')) {
        showMobileMenu.value = false
      }
    }
    
    // Fermer le menu mobile lors du changement de route
    const handleRouteChange = () => {
      showMobileMenu.value = false
    }
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      // Écouter les changements de route
      window.addEventListener('popstate', handleRouteChange)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('popstate', handleRouteChange)
    })
    
    return {
      language,
      changeLanguage,
      t,
      availableLanguages,
      showLanguageMenu,
      showMobileMenu,
      getLanguageName,
      toggleLanguageMenu,
      selectLanguage,
      toggleMobileMenu,
      closeMobileMenu,
      languageMenuRef,
      languageMenuRefMobile
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

.slide-down-enter-active {
  transition: all 0.3s ease-out;
}

.slide-down-leave-active {
  transition: all 0.2s ease-in;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.slide-down-enter-to {
  opacity: 1;
  transform: translateY(0);
  max-height: 300px;
}

.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 300px;
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

/* Extra small screens */
@media (min-width: 475px) {
  .xs\:inline {
    display: inline;
  }
}
</style>



