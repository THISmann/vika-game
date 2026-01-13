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
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 class="text-3xl font-extrabold text-gray-900 mb-2">
            {{ t('auth.login.title') || 'Connexion' }}
          </h2>
          <p class="text-sm text-gray-600">
            {{ t('auth.login.subtitle') || 'Connectez-vous à votre compte' }}
          </p>
        </div>

        <form class="space-y-6" @submit.prevent="handleLogin">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('auth.login.email') || 'Email' }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm focus:shadow-md"
                :placeholder="t('auth.login.emailPlaceholder') || 'votre@email.com'"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label for="password" class="block text-sm font-medium text-gray-700">
                {{ t('auth.login.password') || 'Mot de passe' }}
              </label>
              <router-link
                to="/auth/forgot-password"
                class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                {{ t('auth.login.forgotPassword') || 'Mot de passe oublié?' }}
              </router-link>
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                v-model="form.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="block w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm focus:shadow-md"
                :placeholder="t('auth.login.passwordPlaceholder') || 'Entrez votre mot de passe'"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg v-if="showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.879 16.121A4.995 4.995 0 0112 15c1.921 0 3.536 1.367 3.918 3.107M21 12c-1.372 4.957-5.162 7.9-9.543 7.9a9.97 9.97 0 01-1.563-.029m5.858.908a3 3 0 114.243 4.243M9.879 16.121A4.995 4.995 0 0112 15c1.921 0 3.536 1.367 3.918 3.107M21 12c-1.372 4.957-5.162 7.9-9.543 7.9a9.97 9.97 0 01-1.563-.029" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
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
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ loading ? (t('auth.login.loading') || 'Connexion...') : (t('auth.login.submit') || 'Se connecter') }}
            </button>
          </div>

          <!-- Sign-up Link -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              {{ t('auth.login.noAccount') || "Vous n'avez pas de compte?" }}
              <router-link
                to="/auth/signup"
                class="font-semibold text-blue-600 hover:text-blue-800 ml-1 transition-colors"
              >
                {{ t('auth.login.signUp') || 'Créer un compte' }}
              </router-link>
            </p>
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
  name: 'Login',
  components: {
    LanguageSelector
  },
  setup() {
    const router = useRouter()
    const { t } = useI18n()
    const form = ref({
      email: '',
      password: ''
    })
    const showPassword = ref(false)
    const loading = ref(false)
    const error = ref('')

    const handleLogin = async () => {
      error.value = ''
      loading.value = true

      try {
        const response = await axios.post(API_URLS.auth.userLogin, {
          email: form.value.email,
          password: form.value.password
        })

        if (response.data.token && response.data.user) {
          // Store token and user info
          localStorage.setItem('authToken', response.data.token)
          localStorage.setItem('userInfo', JSON.stringify(response.data.user))

          // Check user status
          if (response.data.user.status === 'pending') {
            router.push('/auth/waiting-validation')
          } else if (response.data.user.status === 'approved') {
            router.push('/user/dashboard')
          } else {
            error.value = t('auth.login.accountNotApproved')
          }
        }
      } catch (err) {
        console.error('Login error:', err)
        error.value = err.response?.data?.error || t('auth.login.error')
      } finally {
        loading.value = false
      }
    }

    return {
      t,
      form,
      showPassword,
      loading,
      error,
      handleLogin
    }
  }
}
</script>

