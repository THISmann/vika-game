<template>
  <div class="flex min-h-screen">
    <!-- Mobile Sidebar Toggle -->
    <MobileSidebarToggle />
    
    <!-- Sidebar -->
    <UserSidebar />
    
    <!-- Main Content -->
    <div class="flex-1 ml-0 md:ml-64 min-h-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 transition-all duration-300 mt-16 pt-6">
      <div class="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-6 sm:p-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          {{ t('settings.title') || 'Paramètres' }}
        </h1>
        
        <div class="space-y-6">
          <div class="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">
              {{ t('settings.profile') || 'Profil' }}
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('settings.name') || 'Nom' }}
                </label>
                <input
                  v-model="userInfo.name"
                  type="text"
                  disabled
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('settings.email') || 'Email' }}
                </label>
                <input
                  v-model="userInfo.email"
                  type="email"
                  disabled
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                />
              </div>
            </div>
          </div>

          <div class="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">
              {{ t('settings.preferences') || 'Préférences' }}
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('settings.language') || 'Langue' }}
                </label>
                <select
                  v-model="selectedLanguage"
                  @change="changeLanguage"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import UserSidebar from './UserSidebar.vue'
import MobileSidebarToggle from './MobileSidebarToggle.vue'

export default {
  name: 'UserSettings',
  components: {
    UserSidebar,
    MobileSidebarToggle
  },
  setup() {
    const { t, language, changeLanguage: changeI18nLanguage } = useI18n()
    const selectedLanguage = ref(language.value)

    const userInfo = computed(() => {
      try {
        const userInfoStr = localStorage.getItem('userInfo')
        if (userInfoStr) {
          return JSON.parse(userInfoStr)
        }
      } catch (error) {
        // console.error('Error parsing user info:', error)
      }
      return { name: '', email: '' }
    })

    const changeLanguage = (event) => {
      const lang = event.target.value
      selectedLanguage.value = lang
      changeI18nLanguage(lang)
    }

    onMounted(() => {
      selectedLanguage.value = language.value
    })

    return {
      t,
      userInfo,
      selectedLanguage,
      changeLanguage
    }
  }
}
</script>

