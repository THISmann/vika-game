<template>
  <div class="min-h-[60vh] flex items-center justify-center">
    <div
      class="max-w-md w-full space-y-8 bg-gradient-to-br from-white to-blue-50 p-8 rounded-3xl shadow-2xl border-2 border-blue-200"
    >
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-gray-900 mb-2">{{ t('admin.login.title') }}</h2>
        <p class="text-sm text-gray-600">{{ t('admin.login.subtitle') }}</p>
      </div>

      <form @submit.prevent="login" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('admin.login.username') }}
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-lg focus:shadow-xl"
              :placeholder="t('admin.login.usernamePlaceholder')"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="password" class="block text-sm font-medium text-gray-700">
                {{ t('admin.login.password') }}
              </label>
              <router-link
                to="/auth/forgot-password"
                class="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {{ t('admin.login.forgotPassword') || 'Mot de passe oublié?' }}
              </router-link>
            </div>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-lg focus:shadow-xl"
              :placeholder="t('admin.login.passwordPlaceholder')"
            />
          </div>
        </div>

        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl"
        >
          <span class="absolute left-0 inset-y-0 flex items-center pl-3">
            <svg class="h-5 w-5 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          {{ t('admin.login.submit') }}
        </button>
      </form>

      <!-- Sign-up Link -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          {{ t('admin.login.noAccount') || "Vous n'avez pas de compte?" }}
          <router-link
            to="/auth/signup"
            class="font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            {{ t('admin.login.signUp') || 'Créer un compte' }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from '@/composables/useI18n'

export default {
  setup() {
    const { t } = useI18n()
    return { t }
  },
  data() {
    return {
      username: '',
      password: '',
      error: '',
      loading: false,
    }
  },
  methods: {
    async login() {
      this.error = ''
      this.loading = true
      
      try {
        // Use user login endpoint
        const axios = (await import('axios')).default
        const { API_URLS } = await import('@/config/api')
        
        const response = await axios.post(API_URLS.auth.userLogin, {
          email: this.username, // Use email for user login
          password: this.password
        })

        if (response.data.token && response.data.user) {
          // Store token and user info
          localStorage.setItem('authToken', response.data.token)
          localStorage.setItem('userInfo', JSON.stringify(response.data.user))

          // Check user status
          if (response.data.user.status === 'pending') {
            this.$router.push('/auth/waiting-validation')
            return
          } else if (response.data.user.status === 'approved') {
            console.log('✅ Login successful, redirecting to dashboard')
            const redirect = this.$route.query.redirect || '/user/dashboard'
            this.$router.push(redirect)
            return
          } else {
            this.error = 'Your account is not approved yet'
            return
          }
        }
        
        throw new Error('No token received')
      } catch (err) {
        console.error('Login error:', err)
        this.error = err.response?.data?.error || this.t('admin.login.invalidCredentials') || 'Invalid credentials'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

