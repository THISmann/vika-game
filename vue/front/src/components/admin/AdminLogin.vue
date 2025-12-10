<template>
  <div class="min-h-[60vh] flex items-center justify-center">
    <div
      class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
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
              class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              :placeholder="t('admin.login.usernamePlaceholder')"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('admin.login.password') }}
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
        const { authService } = await import('@/services/api')
        const token = await authService.login(this.username, this.password)
        
        // Attendre un peu pour que le localStorage soit bien mis à jour
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Vérifier que le token est bien stocké avant de rediriger
        const storedToken = localStorage.getItem('adminToken')
        if (!storedToken) {
          throw new Error('Token not stored after login')
        }
        
        console.log('✅ Login successful, redirecting to dashboard')
        
        // Rediriger vers la route demandée ou le dashboard
        const redirect = this.$route.query.redirect || '/admin/dashboard'
        this.$router.push(redirect)
      } catch (err) {
        console.error('Login error:', err)
        this.error = err.response?.data?.error || this.t('admin.login.invalidCredentials')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
