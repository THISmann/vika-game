<template>
  <div class="relative" ref="languageMenuRef">
    <button
      @click.stop="toggleLanguageMenu"
      class="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 text-gray-700 hover:text-gray-900 transition-all transform hover:scale-105 flex items-center space-x-1.5 border border-gray-300 shadow-sm"
    >
      <span class="text-base">{{ getLanguageFlag(language) }}</span>
      <span class="text-xs font-medium uppercase">{{ language }}</span>
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <!-- Language Dropdown - Teleport to body so it appears above forms -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="showLanguageMenu"
          ref="dropdownRef"
          class="fixed bg-white rounded-lg shadow-2xl border border-gray-200 py-1 min-w-[72px] z-[99999]"
          :style="dropdownStyle"
          @click.stop
        >
          <button
            v-for="lang in availableLanguages"
            :key="lang"
            @click="selectLanguage(lang)"
            class="w-full px-3 py-1.5 text-left text-sm hover:bg-blue-50 transition-colors flex items-center gap-2"
            :class="{ 'bg-blue-100 font-semibold': language === lang }"
          >
            <span class="text-base">{{ getLanguageFlag(lang) }}</span>
            <span class="text-xs font-medium uppercase">{{ lang }}</span>
            <span v-if="language === lang" class="text-blue-600 ml-auto text-xs">✓</span>
          </button>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/composables/useI18n'

export default {
  name: 'LanguageSelector',
  setup() {
    const { language, changeLanguage, availableLanguages } = useI18n()
    const showLanguageMenu = ref(false)
    const languageMenuRef = ref(null)
    const dropdownRef = ref(null)
    const dropdownPosition = ref({ top: 0, left: 0, right: 0 })
    
    const getLanguageFlag = (lang) => {
      const flags = { fr: '🇫🇷', en: '🇬🇧', ru: '🇷🇺', no: '🇳🇴' }
      return flags[lang] || '🌐'
    }
    
    const updateDropdownPosition = () => {
      if (languageMenuRef.value && showLanguageMenu.value) {
        const rect = languageMenuRef.value.getBoundingClientRect()
        dropdownPosition.value = {
          top: rect.bottom + 4,
          right: window.innerWidth - rect.right
        }
      }
    }
    
    const dropdownStyle = computed(() => ({
      top: `${dropdownPosition.value.top}px`,
      right: `${dropdownPosition.value.right}px`,
      left: 'auto'
    }))
    
    const toggleLanguageMenu = () => {
      showLanguageMenu.value = !showLanguageMenu.value
      if (showLanguageMenu.value) {
        setTimeout(updateDropdownPosition, 0)
      }
    }
    
    const selectLanguage = (lang) => {
      changeLanguage(lang)
      showLanguageMenu.value = false
    }
    
    const handleClickOutside = (event) => {
      if (
        languageMenuRef.value && !languageMenuRef.value.contains(event.target) &&
        dropdownRef.value && !dropdownRef.value.contains(event.target)
      ) {
        showLanguageMenu.value = false
      }
    }
    
    watch(showLanguageMenu, (val) => {
      if (val) {
        setTimeout(updateDropdownPosition, 0)
      }
    })
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      window.addEventListener('scroll', updateDropdownPosition, true)
      window.addEventListener('resize', updateDropdownPosition)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('scroll', updateDropdownPosition, true)
      window.removeEventListener('resize', updateDropdownPosition)
    })
    
    return {
      language,
      availableLanguages,
      showLanguageMenu,
      languageMenuRef,
      dropdownRef,
      dropdownPosition,
      dropdownStyle,
      getLanguageFlag,
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

