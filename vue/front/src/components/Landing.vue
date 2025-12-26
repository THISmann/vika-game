<template>
  <div class="w-full h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 relative overflow-y-auto flex flex-col p-4 sm:p-6 lg:p-8">
    <!-- Animated Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div class="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>

    <!-- Header -->
    <header class="relative z-10 w-full flex-shrink-0 mb-4 sm:mb-6">
      <div class="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between gap-2 sm:gap-4">
        <!-- Logo -->
        <div class="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center transform rotate-12 shadow-lg">
            <span class="text-2xl sm:text-3xl">🎮</span>
          </div>
          <h1 class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white whitespace-nowrap drop-shadow-lg">Vika-Game</h1>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0 min-w-0">
          <!-- Language Selector -->
          <div class="relative flex-shrink-0">
            <select
              v-model="currentLang"
              @change="handleLanguageChange"
              class="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base bg-white/20 backdrop-blur-sm text-white border border-white/50 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer appearance-none pr-6 sm:pr-8 hover:bg-white/30 transition-all whitespace-nowrap"
            >
              <option value="fr" class="bg-gray-800 text-white">🇫🇷 FR</option>
              <option value="en" class="bg-gray-800 text-white">🇬🇧 EN</option>
              <option value="ru" class="bg-gray-800 text-white">🇷🇺 RU</option>
            </select>
            <div class="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg class="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- Login Button -->
          <button
            @click="showLogin = true"
            class="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base text-white hover:text-yellow-300 transition-all font-bold rounded-xl hover:bg-white/20 backdrop-blur-md whitespace-nowrap flex-shrink-0 border border-white/30 shadow-lg hover:shadow-xl"
          >
            {{ t('landing.login') }}
          </button>

          <!-- Sign Up Button -->
          <button
            @click="showSignup = true"
            class="px-4 sm:px-5 md:px-7 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl text-xs sm:text-sm md:text-base whitespace-nowrap flex-shrink-0 border-2 border-yellow-300/50 drop-shadow-lg"
          >
            {{ t('landing.signup') }}
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 min-h-0 mt-20 sm:mt-24 md:mt-32 lg:mt-40">
      <div class="w-full max-w-7xl mx-auto text-center flex flex-col items-center justify-center space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
        <!-- Title -->
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-tight text-orange-400 px-2 sm:px-4 break-words drop-shadow-2xl mb-4 sm:mb-6">
          {{ t('landing.title') }}
        </h1>

        <!-- Subtitle -->
        <p class="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-100 max-w-3xl mx-auto px-4 break-words leading-relaxed font-medium drop-shadow-lg">
          {{ t('landing.subtitle') }}
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 my-8 sm:my-10 md:my-12 w-full max-w-2xl mx-auto px-4">
          <router-link
            to="/player/register"
            class="group w-full sm:w-auto px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 text-white rounded-2xl font-bold text-lg sm:text-xl md:text-2xl hover:from-yellow-500 hover:via-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-2xl hover:shadow-yellow-500/70 flex items-center justify-center space-x-3 whitespace-nowrap border-2 border-yellow-300/50"
          >
            <span class="truncate drop-shadow-lg">{{ t('landing.playNow') }}</span>
            <svg class="w-6 h-6 sm:w-7 sm:h-7 transform group-hover:translate-x-1 transition-transform flex-shrink-0 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </router-link>

          <button
            @click="showSignup = true"
            class="w-full sm:w-auto px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 bg-white/20 backdrop-blur-md text-white border-3 border-white rounded-2xl font-bold text-lg sm:text-xl md:text-2xl hover:bg-white/30 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl whitespace-nowrap"
          >
            <span class="truncate drop-shadow-lg">{{ t('landing.createAccount') }}</span>
          </button>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8 max-w-6xl mx-auto w-full mt-10 sm:mt-14 md:mt-20 px-2 sm:px-4">
          <!-- Feature 1 -->
          <div class="flex flex-col items-center p-5 sm:p-6 md:p-7 lg:p-8 bg-gradient-to-br from-purple-800/60 to-indigo-900/60 backdrop-blur-md rounded-3xl border-2 border-white/30 transform hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 min-h-[200px] sm:min-h-[220px] md:min-h-[240px] shadow-xl">
            <div class="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-5 md:mb-6 filter drop-shadow-2xl flex-shrink-0">🏆</div>
            <h3 class="text-white font-extrabold text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 text-center leading-tight break-words drop-shadow-lg">{{ t('landing.feature1.title') }}</h3>
            <p class="text-gray-100 text-xs sm:text-sm md:text-base text-center leading-relaxed break-words font-medium">{{ t('landing.feature1.desc') }}</p>
          </div>

          <!-- Feature 2 -->
          <div class="flex flex-col items-center p-5 sm:p-6 md:p-7 lg:p-8 bg-gradient-to-br from-purple-800/60 to-indigo-900/60 backdrop-blur-md rounded-3xl border-2 border-white/30 transform hover:scale-110 hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 min-h-[200px] sm:min-h-[220px] md:min-h-[240px] shadow-xl">
            <div class="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-5 md:mb-6 text-yellow-300 filter drop-shadow-2xl flex-shrink-0">⚡</div>
            <h3 class="text-white font-extrabold text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 text-center leading-tight break-words drop-shadow-lg">{{ t('landing.feature2.title') }}</h3>
            <p class="text-gray-100 text-xs sm:text-sm md:text-base text-center leading-relaxed break-words font-medium">{{ t('landing.feature2.desc') }}</p>
          </div>

          <!-- Feature 3 -->
          <div class="flex flex-col items-center p-5 sm:p-6 md:p-7 lg:p-8 bg-gradient-to-br from-purple-800/60 to-indigo-900/60 backdrop-blur-md rounded-3xl border-2 border-white/30 transform hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 min-h-[200px] sm:min-h-[220px] md:min-h-[240px] shadow-xl">
            <div class="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-5 md:mb-6 text-blue-300 filter drop-shadow-2xl flex-shrink-0">🌐</div>
            <h3 class="text-white font-extrabold text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 text-center leading-tight break-words drop-shadow-lg">{{ t('landing.feature3.title') }}</h3>
            <p class="text-gray-100 text-xs sm:text-sm md:text-base text-center leading-relaxed break-words font-medium">{{ t('landing.feature3.desc') }}</p>
          </div>

          <!-- Feature 4 -->
          <div class="flex flex-col items-center p-5 sm:p-6 md:p-7 lg:p-8 bg-gradient-to-br from-purple-800/60 to-indigo-900/60 backdrop-blur-md rounded-3xl border-2 border-white/30 transform hover:scale-110 hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300 min-h-[200px] sm:min-h-[220px] md:min-h-[240px] shadow-xl">
            <div class="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-5 md:mb-6 text-red-300 filter drop-shadow-2xl flex-shrink-0">🎯</div>
            <h3 class="text-white font-extrabold text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 text-center leading-tight break-words drop-shadow-lg">{{ t('landing.feature4.title') }}</h3>
            <p class="text-gray-100 text-xs sm:text-sm md:text-base text-center leading-relaxed break-words font-medium">{{ t('landing.feature4.desc') }}</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Login Modal -->
    <div
      v-if="showLogin"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="showLogin = false"
    >
      <div class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border-2 border-purple-500/50">
        <div class="flex items-center justify-between mb-6 sm:mb-8">
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">{{ t('landing.loginTitle') }}</h2>
          <button
            @click="showLogin = false"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5 sm:space-y-6">
          <div>
            <label class="block text-gray-100 text-sm sm:text-base font-bold mb-2 sm:mb-3">{{ t('landing.username') }}</label>
            <input
              v-model="loginForm.username"
              type="text"
              required
              class="w-full px-4 py-3 sm:py-4 bg-gray-800/90 border-2 border-gray-600 rounded-xl text-white text-base focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg focus:shadow-xl placeholder-gray-500"
              :placeholder="t('landing.usernamePlaceholder')"
            />
          </div>

          <div>
            <label class="block text-gray-100 text-sm sm:text-base font-bold mb-2 sm:mb-3">{{ t('landing.password') }}</label>
            <input
              v-model="loginForm.password"
              type="password"
              required
              class="w-full px-4 py-3 sm:py-4 bg-gray-800/90 border-2 border-gray-600 rounded-xl text-white text-base focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg focus:shadow-xl placeholder-gray-500"
              :placeholder="t('landing.passwordPlaceholder')"
            />
          </div>

          <div v-if="loginError" class="bg-red-500/20 border-2 border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm sm:text-base font-semibold shadow-lg">{{ loginError }}</div>

          <button
            type="submit"
            :disabled="loginLoading"
            class="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-xl font-bold text-base sm:text-lg hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl border-2 border-purple-400/50"
          >
            <span v-if="loginLoading">{{ t('landing.loading') }}</span>
            <span v-else>{{ t('landing.loginButton') }}</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Signup Modal -->
    <div
      v-if="showSignup"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      @click.self="showSignup = false"
    >
      <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-purple-500/30 my-8 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl sm:text-3xl font-bold text-white">{{ t('landing.signupTitle') }}</h2>
          <button
            @click="showSignup = false"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSignup" class="space-y-5 sm:space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label class="block text-gray-100 text-sm sm:text-base font-bold mb-2 sm:mb-3">{{ t('landing.name') }}</label>
              <input
                v-model="signupForm.name"
                type="text"
                required
                class="w-full px-4 py-3 sm:py-4 bg-gray-800/90 border-2 border-gray-600 rounded-xl text-white text-base focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg focus:shadow-xl placeholder-gray-500"
                :placeholder="t('landing.namePlaceholder')"
              />
            </div>

            <div>
              <label class="block text-gray-100 text-sm sm:text-base font-bold mb-2 sm:mb-3">{{ t('landing.email') }}</label>
              <input
                v-model="signupForm.email"
                type="email"
                required
                class="w-full px-4 py-3 sm:py-4 bg-gray-800/90 border-2 border-gray-600 rounded-xl text-white text-base focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg focus:shadow-xl placeholder-gray-500"
                :placeholder="t('landing.emailPlaceholder')"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label class="block text-gray-100 text-sm sm:text-base font-bold mb-2 sm:mb-3">{{ t('landing.password') }}</label>
              <input
                v-model="signupForm.password"
                type="password"
                required
                minlength="6"
                class="w-full px-4 py-3 sm:py-4 bg-gray-800/90 border-2 border-gray-600 rounded-xl text-white text-base focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg focus:shadow-xl placeholder-gray-500"
                :placeholder="t('landing.passwordPlaceholder')"
              />
            </div>

            <div>
              <label class="block text-gray-100 text-sm sm:text-base font-bold mb-2 sm:mb-3">{{ t('landing.contact') }}</label>
              <input
                v-model="signupForm.contact"
                type="tel"
                required
                class="w-full px-4 py-3 sm:py-4 bg-gray-800/90 border-2 border-gray-600 rounded-xl text-white text-base focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg focus:shadow-xl placeholder-gray-500"
                :placeholder="t('landing.contactPlaceholder')"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label class="block text-gray-100 text-sm sm:text-base font-bold mb-2 sm:mb-3">{{ t('landing.useCase') }}</label>
              <select
                v-model="signupForm.useCase"
                required
                class="w-full px-4 py-3 sm:py-4 bg-gray-800/90 border-2 border-gray-600 rounded-xl text-white text-base focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg focus:shadow-xl"
              >
                <option value="" class="bg-gray-800 text-gray-300">{{ t('landing.useCasePlaceholder') }}</option>
                <option value="education" class="bg-gray-800 text-white">{{ t('landing.useCase.education') }}</option>
                <option value="corporate" class="bg-gray-800 text-white">{{ t('landing.useCase.corporate') }}</option>
                <option value="entertainment" class="bg-gray-800 text-white">{{ t('landing.useCase.entertainment') }}</option>
                <option value="events" class="bg-gray-800 text-white">{{ t('landing.useCase.events') }}</option>
                <option value="other" class="bg-gray-800 text-white">{{ t('landing.useCase.other') }}</option>
              </select>
            </div>

            <div>
              <label class="block text-gray-100 text-sm sm:text-base font-bold mb-2 sm:mb-3">{{ t('landing.country') }}</label>
              <select
                v-model="signupForm.country"
                required
                class="w-full px-4 py-3 sm:py-4 bg-gray-800/90 border-2 border-gray-600 rounded-xl text-white text-base focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg focus:shadow-xl"
              >
                <option value="" class="bg-gray-800 text-gray-300">{{ t('landing.countryPlaceholder') }}</option>
                <option v-for="country in countries" :key="country.code" :value="country.code" class="bg-gray-800 text-white">
                  {{ country.name }}
                </option>
              </select>
            </div>
          </div>

          <div v-if="signupError" class="bg-red-500/20 border-2 border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm sm:text-base font-semibold shadow-lg">{{ signupError }}</div>
          <div v-if="signupSuccess" class="bg-green-500/20 border-2 border-green-500/50 text-green-200 px-4 py-3 rounded-xl text-sm sm:text-base font-semibold shadow-lg">{{ t('landing.signupSuccess') }}</div>

          <button
            type="submit"
            :disabled="signupLoading"
            class="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-xl font-bold text-base sm:text-lg hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl border-2 border-purple-400/50"
          >
            <span v-if="signupLoading">{{ t('landing.loading') }}</span>
            <span v-else>{{ t('landing.signupButton') }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from '@/composables/useI18n'
import axios from 'axios'
import { API_URLS } from '@/config/api'

export default {
  setup() {
    const { t, changeLanguage } = useI18n()
    return { t, changeLanguage }
  },
  data() {
    return {
      currentLang: localStorage.getItem('gameLanguage') || 'fr',
      showLogin: false,
      showSignup: false,
      loginForm: {
        username: '',
        password: ''
      },
      signupForm: {
        name: '',
        email: '',
        password: '',
        contact: '',
        useCase: '',
        country: ''
      },
      loginLoading: false,
      signupLoading: false,
      loginError: '',
      signupError: '',
      signupSuccess: false,
      countries: [
        { code: 'FR', name: 'France' },
        { code: 'US', name: 'United States' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'DE', name: 'Germany' },
        { code: 'ES', name: 'Spain' },
        { code: 'IT', name: 'Italy' },
        { code: 'CA', name: 'Canada' },
        { code: 'AU', name: 'Australia' },
        { code: 'BE', name: 'Belgium' },
        { code: 'CH', name: 'Switzerland' },
        { code: 'NL', name: 'Netherlands' },
        { code: 'PT', name: 'Portugal' },
        { code: 'RU', name: 'Russia' },
        { code: 'CN', name: 'China' },
        { code: 'JP', name: 'Japan' },
        { code: 'BR', name: 'Brazil' },
        { code: 'MX', name: 'Mexico' },
        { code: 'IN', name: 'India' },
        { code: 'KR', name: 'South Korea' },
        { code: 'SG', name: 'Singapore' },
        { code: 'AE', name: 'United Arab Emirates' },
        { code: 'ZA', name: 'South Africa' },
        { code: 'NZ', name: 'New Zealand' },
        { code: 'SE', name: 'Sweden' },
        { code: 'NO', name: 'Norway' },
        { code: 'DK', name: 'Denmark' },
        { code: 'FI', name: 'Finland' },
        { code: 'PL', name: 'Poland' },
        { code: 'GR', name: 'Greece' },
        { code: 'IE', name: 'Ireland' }
      ]
    }
  },
  methods: {
    handleLanguageChange(event) {
      const lang = event.target.value
      this.currentLang = lang
      this.changeLanguage(lang)
      localStorage.setItem('gameLanguage', lang)
    },
    async handleLogin() {
      this.loginError = ''
      this.loginLoading = true

      try {
        const response = await axios.post(API_URLS.auth.login, {
          username: this.loginForm.username,
          password: this.loginForm.password
        })

        if (response.data.token) {
          localStorage.setItem('adminToken', response.data.token)
          this.$router.push('/admin/dashboard')
        }
      } catch (error) {
        this.loginError = error.response?.data?.error || this.t('landing.loginError')
      } finally {
        this.loginLoading = false
      }
    },
    async handleSignup() {
      this.signupError = ''
      this.signupSuccess = false
      this.signupLoading = true

      try {
        const response = await axios.post(API_URLS.auth.register, {
          name: this.signupForm.name,
          email: this.signupForm.email,
          password: this.signupForm.password,
          contact: this.signupForm.contact,
          useCase: this.signupForm.useCase,
          country: this.signupForm.country
        })

        if (response.data) {
          localStorage.setItem('userInfo', JSON.stringify({
            ...response.data,
            email: this.signupForm.email,
            contact: this.signupForm.contact,
            useCase: this.signupForm.useCase,
            country: this.signupForm.country
          }))
        }

        this.signupSuccess = true
        setTimeout(() => {
          this.showSignup = false
          this.$router.push('/player/register')
        }, 2000)
      } catch (error) {
        this.signupError = error.response?.data?.error || this.t('landing.signupError')
      } finally {
        this.signupLoading = false
      }
    }
  }
}
</script>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
