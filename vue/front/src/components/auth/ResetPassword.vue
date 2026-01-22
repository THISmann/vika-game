<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
    <!-- Language Selector - Top Right -->
    <div class="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
      <LanguageSelector />
    </div>
    
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ t('auth.resetPassword.title') }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ t('auth.resetPassword.subtitle') }}
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleResetPassword">
        <div class="space-y-4">
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700">{{ t('auth.resetPassword.newPassword') }}</label>
            <div class="mt-1 relative">
              <input
                id="newPassword"
                v-model="form.newPassword"
                name="newPassword"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                :placeholder="t('auth.resetPassword.newPasswordPlaceholder')"
                :class="{ 'border-red-500': passwordError }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg v-if="showPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 1 114.243 4.243M9.879 16.121A4.995 4.995 0 0112 15c1.921 0 3.536 1.367 3.918 3.107M21 12c-1.372 4.957-5.162 7.9-9.543 7.9a9.97 9.97 0 01-1.563-.029m5.858.908a3 3 1 114.243 4.243M9.879 16.121A4.995 4.995 0 0112 15c1.921 0 3.536 1.367 3.918 3.107M21 12c-1.372 4.957-5.162 7.9-9.543 7.9a9.97 9.97 0 01-1.563-.029" />
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">{{ t('auth.resetPassword.confirmPassword') }}</label>
            <div class="mt-1 relative">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                name="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                :placeholder="t('auth.resetPassword.confirmPasswordPlaceholder')"
                :class="{ 'border-red-500': confirmPasswordError }"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg v-if="showConfirmPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 1 114.243 4.243M9.879 16.121A4.995 4.995 0 0112 15c1.921 0 3.536 1.367 3.918 3.107M21 12c-1.372 4.957-5.162 7.9-9.543 7.9a9.97 9.97 0 01-1.563-.029m5.858.908a3 3 1 114.243 4.243M9.879 16.121A4.995 4.995 0 0112 15c1.921 0 3.536 1.367 3.918 3.107M21 12c-1.372 4.957-5.162 7.9-9.543 7.9a9.97 9.97 0 01-1.563-.029" />
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-600">{{ confirmPasswordError }}</p>
          </div>
        </div>

        <div v-if="error" class="rounded-md bg-red-50 p-4">
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

        <div v-if="success" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-green-800">{{ success }}</p>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !!passwordError || !!confirmPasswordError"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? t('auth.resetPassword.loading') : t('auth.resetPassword.submit') }}
          </button>
        </div>

        <div class="text-center text-sm">
          <router-link
            to="/auth/login"
            class="font-medium text-blue-600 hover:text-blue-500"
          >
            {{ t('auth.resetPassword.backToLogin') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { API_URLS } from '@/config/api'
import { useI18n } from '@/composables/useI18n'
import LanguageSelector from '@/components/common/LanguageSelector.vue'

export default {
  name: 'ResetPassword',
  components: {
    LanguageSelector
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { t } = useI18n()
    const form = ref({
      newPassword: '',
      confirmPassword: ''
    })
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const loading = ref(false)
    const error = ref('')
    const success = ref('')
    const token = ref('')

    onMounted(() => {
      token.value = route.query.token || ''
      if (!token.value) {
        error.value = t('auth.resetPassword.invalidToken')
      }
    })

    const passwordError = computed(() => {
      if (!form.value.newPassword) return ''
      if (form.value.newPassword.length < 6) {
        return t('auth.resetPassword.passwordTooShort')
      }
      return ''
    })

    const confirmPasswordError = computed(() => {
      if (!form.value.confirmPassword) return ''
      if (form.value.newPassword !== form.value.confirmPassword) {
        return t('auth.resetPassword.passwordsDoNotMatch')
      }
      return ''
    })

    const handleResetPassword = async () => {
      error.value = ''
      success.value = ''

      if (!token.value) {
        error.value = t('auth.resetPassword.invalidToken')
        return
      }

      if (form.value.newPassword !== form.value.confirmPassword) {
        error.value = t('auth.resetPassword.passwordsDoNotMatch')
        return
      }

      if (form.value.newPassword.length < 6) {
        error.value = t('auth.resetPassword.passwordTooShort')
        return
      }

      loading.value = true

      try {
        const response = await axios.post(API_URLS.auth.resetPassword, {
          token: token.value,
          newPassword: form.value.newPassword
        })

        success.value = response.data.message || t('auth.resetPassword.success')
        
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } catch (err) {
        // console.error('Reset password error:', err)
        error.value = err.response?.data?.error || t('auth.resetPassword.error')
      } finally {
        loading.value = false
      }
    }

    return {
      t,
      form,
      showPassword,
      showConfirmPassword,
      loading,
      error,
      success,
      token,
      passwordError,
      confirmPasswordError,
      handleResetPassword
    }
  }
}
</script>

