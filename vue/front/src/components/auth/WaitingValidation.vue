<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
    <!-- Language Selector - Top Right -->
    <div class="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
      <LanguageSelector />
    </div>
    
    <div class="max-w-md w-full space-y-8 text-center">
      <div>
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
          <svg class="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ t('auth.waitingValidation.title') }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ t('auth.waitingValidation.subtitle') }}
        </p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-center mb-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p class="text-gray-700 mb-4">
          {{ t('auth.waitingValidation.message') }}
        </p>
        <p class="text-sm text-gray-500">
          {{ t('auth.waitingValidation.note') }}
        </p>
      </div>

      <div class="text-center">
        <button
          @click="checkStatus"
          :disabled="checking"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="checking" class="mr-2">
            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ checking ? t('auth.waitingValidation.checking') : t('auth.waitingValidation.checkStatus') }}
        </button>
      </div>

      <div v-if="error" class="rounded-md bg-red-50 p-4">
        <p class="text-sm font-medium text-red-800">{{ error }}</p>
      </div>

      <div class="text-center text-sm">
        <button
          @click="logout"
          class="font-medium text-gray-600 hover:text-gray-900"
        >
          {{ t('auth.waitingValidation.logout') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { API_URLS } from '@/config/api'
import { useI18n } from '@/composables/useI18n'
import LanguageSelector from '@/components/common/LanguageSelector.vue'

export default {
  name: 'WaitingValidation',
  components: {
    LanguageSelector
  },
  setup() {
    const router = useRouter()
    const { t } = useI18n()
    const checking = ref(false)
    const error = ref('')

    const checkStatus = async () => {
      checking.value = true
      error.value = ''
      try {
        // Rediriger vers la page de connexion pour que l'utilisateur se reconnecte
        // et obtienne un éventuel nouveau statut (approuvé ou non)
        localStorage.removeItem('authToken')
        localStorage.removeItem('userInfo')
        router.push('/auth/login')
      } finally {
        checking.value = false
      }
    }

    const logout = () => {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userInfo')
      router.push('/auth/login')
    }

    return {
      t,
      checking,
      error,
      checkStatus,
      logout
    }
  }
}
</script>

