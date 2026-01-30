<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 relative overflow-y-auto py-12 px-4 sm:px-6 lg:px-8">
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div class="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>

    <header class="relative z-10 w-full flex-shrink-0 mb-6 sm:mb-8">
      <div class="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 sm:gap-3">
          <router-link
            to="/"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 border border-white/30 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {{ t('common.home') || 'Accueil' }}
          </router-link>
          <button
            type="button"
            @click="router.back()"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 border border-white/30 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ t('common.back') || 'Retour' }}
          </button>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center transform rotate-12 shadow-lg flex-shrink-0">
            <span class="text-2xl sm:text-3xl">🎮</span>
          </div>
          <h1 class="text-lg sm:text-xl font-bold text-white whitespace-nowrap drop-shadow-lg">Vika-Game</h1>
        </div>
        <div class="flex-shrink-0">
          <LanguageSelector />
        </div>
      </div>
    </header>

    <div class="relative z-10 max-w-lg w-full mx-auto flex-1 flex items-start justify-center py-4">
      <div class="w-full bg-gradient-to-br from-white/15 to-purple-900/40 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white/30 p-8 sm:p-10">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4 shadow-lg ring-4 ring-yellow-200/50">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 class="text-3xl font-extrabold text-white mb-2 drop-shadow-lg">
            {{ t('auth.signup.title') || 'Créer un compte' }}
          </h2>
          <p class="text-sm text-gray-200">
            {{ t('auth.signup.subtitle') || 'Rejoignez-nous dès aujourd\'hui' }}
          </p>
        </div>

        <!-- Message compte approuvé (activation automatique) -->
        <div v-if="signupSuccessApproved" class="space-y-6 text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20">
            <svg class="h-10 w-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-white">{{ t('auth.signup.approvedTitle') || 'Compte approuvé' }}</h3>
          <p class="text-gray-200">{{ t('auth.signup.approvedMessage') || 'Votre compte a été créé et activé. Vous pouvez vous connecter.' }}</p>
          <router-link
            to="/auth/login"
            class="inline-flex items-center justify-center w-full px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 hover:from-yellow-500 hover:via-orange-600 hover:to-orange-700 transition-all shadow-xl"
          >
            {{ t('auth.signup.goToLogin') || 'Se connecter' }}
          </router-link>
        </div>

        <form v-else class="space-y-5" @submit.prevent="handleSignup">
          <!-- Name Field -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-200 mb-2">
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
                class="block w-full pl-10 pr-3 py-3 bg-gray-800/90 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg"
                :placeholder="t('auth.signup.namePlaceholder') || 'Jean Dupont'"
              />
            </div>
          </div>

          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-200 mb-2">
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
                class="block w-full pl-10 pr-3 py-3 bg-gray-800/90 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg"
                :placeholder="t('auth.signup.emailPlaceholder') || 'votre@email.com'"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-200 mb-2">
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
                class="block w-full pl-10 pr-12 py-3 bg-gray-800/90 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg"
                :class="passwordError ? 'border-red-500' : 'border-gray-600'"
                :placeholder="t('auth.signup.passwordPlaceholder') || 'Minimum 6 caractères'"
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
            <p v-if="passwordError" class="mt-1 text-sm text-red-300">{{ passwordError }}</p>
            <p v-else-if="form.password" class="mt-1 text-xs text-gray-400">{{ t('auth.signup.passwordHint') || 'Le mot de passe doit contenir au moins 6 caractères' }}</p>
          </div>

          <!-- Confirm Password Field -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-200 mb-2">
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
                class="block w-full pl-10 pr-12 py-3 bg-gray-800/90 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg"
                :class="confirmPasswordError ? 'border-red-500' : 'border-gray-600'"
                :placeholder="t('auth.signup.confirmPasswordPlaceholder') || 'Répétez votre mot de passe'"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
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
            <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-300">{{ confirmPasswordError }}</p>
          </div>

          <!-- Contact Field -->
          <div>
            <label for="contact" class="block text-sm font-medium text-gray-200 mb-2">
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
                class="block w-full pl-10 pr-3 py-3 bg-gray-800/90 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg"
                :placeholder="t('auth.signup.contactPlaceholder') || '+33 6 12 34 56 78'"
              />
            </div>
          </div>

          <!-- Use Case Field -->
          <div>
            <label for="useCase" class="block text-sm font-medium text-gray-200 mb-2">
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
                class="block w-full pl-10 pr-3 py-3 bg-gray-800/90 border-2 border-gray-600 rounded-xl text-white shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all appearance-none"
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
            <label for="country" class="block text-sm font-medium text-gray-200 mb-2">
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
                class="block w-full pl-10 pr-3 py-3 bg-gray-800/90 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg"
                :placeholder="t('auth.signup.countryPlaceholder') || 'France'"
              />
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="rounded-xl bg-red-500/20 border-2 border-red-500/50 text-red-200 px-4 py-3 text-sm font-medium">
            {{ error }}
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="loading || !!passwordError || !!confirmPasswordError"
              class="relative w-full flex justify-center py-3 px-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 hover:from-yellow-500 hover:via-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl border-2 border-yellow-300/50"
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
            <p class="text-sm text-gray-300">
              {{ t('auth.signup.hasAccount') || 'Vous avez déjà un compte?' }}
              <router-link
                to="/auth/login"
                class="font-semibold text-yellow-300 hover:text-yellow-200 ml-1 transition-colors"
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
    const signupSuccessApproved = ref(false)

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
          const status = response.data.status
          if (status === 'approved') {
            signupSuccessApproved.value = true
          } else {
            router.push('/auth/waiting-validation')
          }
        }
      } catch (err) {
        // console.error('Signup error:', err)
        error.value = err.response?.data?.error || t('auth.signup.error')
      } finally {
        loading.value = false
      }
    }

    return {
      router,
      t,
      form,
      showPassword,
      showConfirmPassword,
      loading,
      error,
      signupSuccessApproved,
      passwordError,
      confirmPasswordError,
      handleSignup
    }
  }
}
</script>

