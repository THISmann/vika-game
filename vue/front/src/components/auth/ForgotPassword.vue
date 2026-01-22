<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
    <!-- Language Selector - Top Right -->
    <div class="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
      <LanguageSelector />
    </div>
    
    <div class="max-w-md w-full">
      <div class="bg-white rounded-3xl shadow-2xl border-2 border-blue-100 p-8 sm:p-10">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 mb-4 shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 class="text-3xl font-extrabold text-gray-900 mb-2">
            {{ t('auth.forgotPassword.title') || 'Mot de passe oublié' }}
          </h2>
          <p class="text-sm text-gray-600">
            {{ t('auth.forgotPassword.subtitle') || 'Entrez votre email pour recevoir un lien de réinitialisation' }}
          </p>
        </div>

        <form class="space-y-6" @submit.prevent="handleForgotPassword">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('auth.forgotPassword.email') || 'Adresse email' }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                v-model="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm focus:shadow-md"
                :placeholder="t('auth.forgotPassword.emailPlaceholder') || 'votre@email.com'"
              />
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="rounded-xl bg-green-50 border-2 border-green-200 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3 flex-1">
                <p class="text-sm font-medium text-green-800">{{ success }}</p>
                <p v-if="resetToken" class="mt-2 text-xs text-green-700">
                  {{ t('auth.forgotPassword.devToken') || 'Token de développement' }}: 
                  <code class="bg-green-100 px-2 py-1 rounded font-mono text-xs">{{ resetToken }}</code>
                </p>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="rounded-xl bg-red-50 border-2 border-red-200 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-red-800">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ loading ? (t('auth.forgotPassword.loading') || 'Envoi...') : (t('auth.forgotPassword.submit') || 'Envoyer le lien de réinitialisation') }}
            </button>
          </div>

          <!-- Back to Login Link -->
          <div class="text-center">
            <router-link
              to="/auth/login"
              class="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {{ t('auth.forgotPassword.backToLogin') || 'Retour à la connexion' }}
            </router-link>
          </div>
        </form>
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
  name: 'ForgotPassword',
  components: {
    LanguageSelector
  },
  setup() {
    const router = useRouter()
    const { t } = useI18n()
    const email = ref('')
    const loading = ref(false)
    const error = ref('')
    const success = ref('')
    const resetToken = ref('')

    const handleForgotPassword = async () => {
      error.value = ''
      success.value = ''
      resetToken.value = ''
      loading.value = true

      try {
        const response = await axios.post(API_URLS.auth.forgotPassword, {
          email: email.value
        })

        success.value = response.data.message || t('auth.forgotPassword.success')
        resetToken.value = response.data.resetToken // Only in development

        // If token is provided (development), redirect to reset page
        if (resetToken.value) {
          setTimeout(() => {
            router.push(`/auth/reset-password?token=${resetToken.value}`)
          }, 2000)
        }
      } catch (err) {
        // console.error('Forgot password error:', err)
        error.value = err.response?.data?.error || t('auth.forgotPassword.error')
      } finally {
        loading.value = false
      }
    }

    return {
      t,
      email,
      loading,
      error,
      success,
      resetToken,
      handleForgotPassword
    }
  }
}
</script>

