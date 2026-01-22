<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
    <!-- Language Selector - Top Right -->
    <div class="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
      <LanguageSelector />
    </div>
    
    <div class="max-w-lg w-full">
      <div class="bg-white rounded-3xl shadow-2xl border-2 border-blue-100 p-8 sm:p-10">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-600 mb-4 shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 class="text-3xl font-extrabold text-gray-900 mb-2">
            {{ t('auth.signup.title') || 'Créer un compte' }}
          </h2>
          <p class="text-sm text-gray-600">
            {{ t('auth.signup.subtitle') || 'Rejoignez-nous dès aujourd\'hui' }}
          </p>
        </div>

        <form class="space-y-5" @submit.prevent="handleSignup">
          <!-- Name Field -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('auth.signup.name') || 'Nom complet' }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="name"
                v-model="form.name"
                name="name"
                type="text"
                required
                class="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm focus:shadow-md"
                :placeholder="t('auth.signup.namePlaceholder') || 'Jean Dupont'"
              />
            </div>
          </div>

          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('auth.signup.email') || 'Email' }}
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
                :placeholder="t('auth.signup.emailPlaceholder') || 'votre@email.com'"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('auth.signup.password') || 'Mot de passe' }}
            </label>
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
                autocomplete="new-password"
                required
                class="block w-full pl-10 pr-12 py-3 border-2 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm focus:shadow-md"
                :class="passwordError ? 'border-red-500' : 'border-gray-300'"
                :placeholder="t('auth.signup.passwordPlaceholder') || 'Minimum 6 caractères'"
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
            <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
            <p v-else-if="form.password" class="mt-1 text-xs text-gray-500">{{ t('auth.signup.passwordHint') || 'Le mot de passe doit contenir au moins 6 caractères' }}</p>
          </div>

          <!-- Confirm Password Field -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('auth.signup.confirmPassword') || 'Confirmer le mot de passe' }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                name="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                class="block w-full pl-10 pr-12 py-3 border-2 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm focus:shadow-md"
                :class="confirmPasswordError ? 'border-red-500' : 'border-gray-300'"
                :placeholder="t('auth.signup.confirmPasswordPlaceholder') || 'Répétez votre mot de passe'"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg v-if="showConfirmPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.879 16.121A4.995 4.995 0 0112 15c1.921 0 3.536 1.367 3.918 3.107M21 12c-1.372 4.957-5.162 7.9-9.543 7.9a9.97 9.97 0 01-1.563-.029m5.858.908a3 3 0 114.243 4.243M9.879 16.121A4.995 4.995 0 0112 15c1.921 0 3.536 1.367 3.918 3.107M21 12c-1.372 4.957-5.162 7.9-9.543 7.9a9.97 9.97 0 01-1.563-.029" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-600">{{ confirmPasswordError }}</p>
          </div>

          <!-- Contact Field -->
          <div>
            <label for="contact" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('auth.signup.contact') || 'Contact' }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                id="contact"
                v-model="form.contact"
                name="contact"
                type="tel"
                required
                class="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm focus:shadow-md"
                :placeholder="t('auth.signup.contactPlaceholder') || '+33 6 12 34 56 78'"
              />
            </div>
          </div>

          <!-- Use Case Field -->
          <div>
            <label for="useCase" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('auth.signup.useCase') || 'Cas d\'utilisation' }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <select
                id="useCase"
                v-model="form.useCase"
                name="useCase"
                required
                class="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="">{{ t('auth.signup.useCasePlaceholder') || 'Sélectionnez un cas d\'utilisation' }}</option>
                <option value="education">{{ t('auth.signup.useCase.education') || 'Éducation' }}</option>
                <option value="corporate">{{ t('auth.signup.useCase.corporate') || 'Entreprise' }}</option>
                <option value="entertainment">{{ t('auth.signup.useCase.entertainment') || 'Divertissement' }}</option>
                <option value="events">{{ t('auth.signup.useCase.events') || 'Événements' }}</option>
                <option value="other">{{ t('auth.signup.useCase.other') || 'Autre' }}</option>
              </select>
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Country Field -->
          <div>
            <label for="country" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('auth.signup.country') || 'Pays' }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                id="country"
                v-model="form.country"
                name="country"
                type="text"
                required
                class="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm focus:shadow-md"
                :placeholder="t('auth.signup.countryPlaceholder') || 'France'"
              />
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
              :disabled="loading || !!passwordError || !!confirmPasswordError"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-700 hover:via-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ loading ? (t('auth.signup.loading') || 'Création...') : (t('auth.signup.submit') || 'Créer un compte') }}
            </button>
          </div>

          <!-- Login Link -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              {{ t('auth.signup.hasAccount') || 'Vous avez déjà un compte?' }}
              <router-link
                to="/auth/login"
                class="font-semibold text-blue-600 hover:text-blue-800 ml-1 transition-colors"
              >
                {{ t('auth.signup.login') || 'Se connecter' }}
              </router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { API_URLS } from '@/config/api'
import { useI18n } from '@/composables/useI18n'
import LanguageSelector from '@/components/common/LanguageSelector.vue'

export default {
  name: 'Signup',
  components: {
    LanguageSelector
  },
  setup() {
    const router = useRouter()
    const { t } = useI18n()
    const form = ref({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      contact: '',
      useCase: '',
      country: ''
    })
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const loading = ref(false)
    const error = ref('')

    const passwordError = computed(() => {
      if (!form.value.password) return ''
      if (form.value.password.length < 6) {
        return t('auth.signup.passwordTooShort')
      }
      return ''
    })

    const confirmPasswordError = computed(() => {
      if (!form.value.confirmPassword) return ''
      if (form.value.password !== form.value.confirmPassword) {
        return t('auth.signup.passwordsDoNotMatch')
      }
      return ''
    })

    const handleSignup = async () => {
      error.value = ''

      // Validate passwords match
      if (form.value.password !== form.value.confirmPassword) {
        error.value = t('auth.signup.passwordsDoNotMatch')
        return
      }

      if (form.value.password.length < 6) {
        error.value = t('auth.signup.passwordTooShort')
        return
      }

      loading.value = true

      try {
        const response = await axios.post(API_URLS.auth.register, {
          name: form.value.name,
          email: form.value.email,
          password: form.value.password,
          contact: form.value.contact,
          useCase: form.value.useCase,
          country: form.value.country
        })

        if (response.data) {
          // Redirect to waiting validation page
          router.push('/auth/waiting-validation')
        }
      } catch (err) {
        // console.error('Signup error:', err)
        error.value = err.response?.data?.error || t('auth.signup.error')
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
      passwordError,
      confirmPasswordError,
      handleSignup
    }
  }
}
</script>

