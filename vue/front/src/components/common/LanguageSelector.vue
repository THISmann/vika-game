<template>
  <div class="relative" ref="languageMenuRef">
    <button
      @click.stop="toggleLanguageMenu"
      class="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 text-gray-700 hover:text-gray-900 transition-all transform hover:scale-105 flex items-center space-x-2 border border-gray-300 shadow-sm"
    >
      <span class="text-lg">🌐</span>
      <span class="hidden sm:inline">{{ getLanguageName(language) }}</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
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
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/composables/useI18n'

export default {
  name: 'LanguageSelector',
  setup() {
    const { language, changeLanguage, availableLanguages } = useI18n()
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
      availableLanguages,
      showLanguageMenu,
      languageMenuRef,
      getLanguageName,
      toggleLanguageMenu,
      selectLanguage
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

