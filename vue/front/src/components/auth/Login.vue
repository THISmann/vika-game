<template>
  <div class="min-h-screen w-full flex flex-col bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 relative overflow-x-hidden overflow-y-auto py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
    <!-- Animated background (same as Landing) -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div class="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>

    <!-- Header (same style as Landing) -->
    <header class="relative z-10 w-full flex-shrink-0 mb-6 sm:mb-8">
      <div class="max-w-7xl mx-auto px-1 sm:px-4 flex items-center justify-between gap-2">
        <router-link to="/" class="flex items-center gap-2 flex-shrink-0">
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center transform rotate-12 shadow-lg">
            <span class="text-2xl sm:text-3xl">🎮</span>
          </div>
          <h1 class="text-lg sm:text-xl font-bold text-white whitespace-nowrap drop-shadow-lg">Vika-Game</h1>
        </router-link>
        <div class="flex-shrink-0">
          <LanguageSelector />
        </div>
      </div>
    </header>

    <div class="relative z-10 max-w-md w-full mx-auto flex-1 flex items-center justify-center px-2 sm:px-0">
      <div class="w-full bg-gradient-to-br from-white/15 to-purple-900/40 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white/30 p-8 sm:p-10">
        <!-- Card header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4 shadow-lg ring-4 ring-yellow-200/50">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 class="text-3xl font-extrabold text-white mb-2 drop-shadow-lg">
            {{ t('auth.login.title') || 'Connexion' }}
          </h2>
          <p class="text-sm text-gray-200">
            {{ t('auth.login.subtitle') || 'Connectez-vous à votre compte' }}
          </p>
        </div>

        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-200 mb-2">
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
                class="block w-full pl-10 pr-3 py-3 bg-gray-800/90 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg"
                :placeholder="t('auth.login.emailPlaceholder') || 'votre@email.com'"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label for="password" class="block text-sm font-medium text-gray-200">
                {{ t('auth.login.password') || 'Mot de passe' }}
              </label>
              <router-link
                to="/auth/forgot-password"
                class="text-sm font-medium text-yellow-300 hover:text-yellow-200 transition-colors"
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
                class="block w-full pl-10 pr-12 py-3 bg-gray-800/90 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg"
                :placeholder="t('auth.login.passwordPlaceholder') || 'Entrez votre mot de passe'"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
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

          <div v-if="error" class="rounded-xl bg-red-500/20 border-2 border-red-500/50 text-red-200 px-4 py-3 text-sm font-medium">
            {{ error }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="relative w-full flex justify-center py-3 px-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 hover:from-yellow-500 hover:via-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl border-2 border-yellow-300/50"
            >
              <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-4">
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ loading ? (t('auth.login.loading') || 'Connexion...') : (t('auth.login.submit') || 'Se connecter') }}
            </button>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-300">
              {{ t('auth.login.noAccount') || "Vous n'avez pas de compte?" }}
              <router-link
                to="/auth/signup"
                class="font-semibold text-yellow-300 hover:text-yellow-200 ml-1 transition-colors"
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
        // console.error('Login error:', err)
        error.value = err.response?.data?.error || t('auth.login.error')
      } finally {
        loading.value = false
      }
    }

    return {
      router,
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

