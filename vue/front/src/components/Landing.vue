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
              <option value="no" class="bg-gray-800 text-white">🇳🇴 NO</option>
            </select>
            <div class="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg class="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- Login Button -->
          <router-link
            to="/auth/login"
            class="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base text-white hover:text-yellow-300 transition-all font-bold rounded-xl hover:bg-white/20 backdrop-blur-md whitespace-nowrap flex-shrink-0 border border-white/30 shadow-lg hover:shadow-xl"
          >
            {{ t('landing.login') }}
          </router-link>

          <!-- Sign Up Button -->
          <router-link
            to="/auth/signup"
            class="px-4 sm:px-5 md:px-7 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl text-xs sm:text-sm md:text-base whitespace-nowrap flex-shrink-0 border-2 border-yellow-300/50 drop-shadow-lg"
          >
            {{ t('landing.signup') }}
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 w-full flex-1 flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 min-h-0 mt-20 sm:mt-24 md:mt-32 lg:mt-40">
      <div class="w-full max-w-7xl mx-auto text-center flex flex-col items-center space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
        <!-- Title -->
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-tight text-orange-400 px-2 sm:px-4 break-words drop-shadow-2xl w-full">
          {{ t('landing.title') }}
        </h1>

        <!-- Subtitle -->
        <p class="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-100 max-w-3xl mx-auto px-4 break-words leading-relaxed font-medium drop-shadow-lg w-full">
          {{ t('landing.subtitle') }}
        </p>

        <!-- CTA Section - Enter Game Code -->
        <div class="w-full max-w-2xl mx-auto px-4">
          <div class="bg-gradient-to-br from-white/20 to-purple-900/40 backdrop-blur-md rounded-3xl border-2 border-white/30 p-6 sm:p-8 md:p-10 shadow-2xl">
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 sm:mb-6 text-center drop-shadow-lg">
              {{ t('landing.cta.title') }}
            </h2>
            <p class="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 text-center drop-shadow-lg">
              {{ t('landing.cta.subtitle') }}
            </p>
            
            <form @submit.prevent="handleGameCodeSubmit" class="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div class="flex-1">
                <input
                  v-model="gameCode"
                  type="text"
                  maxlength="6"
                  :placeholder="t('landing.cta.codePlaceholder')"
                  :class="['w-full px-6 sm:px-8 py-4 sm:py-5 md:py-6 bg-white/90 border-2 rounded-2xl text-center text-2xl sm:text-3xl md:text-4xl font-mono tracking-widest uppercase text-gray-900 focus:outline-none focus:ring-4 transition-all shadow-lg focus:shadow-xl', codeError ? 'border-red-400 focus:ring-red-400' : 'border-white/50 focus:ring-yellow-400 focus:border-yellow-400']"
                  @input="gameCode = gameCode.toUpperCase().replace(/[^A-Z0-9]/g, ''); codeError = ''"
                />
                <p v-if="codeError" class="mt-2 text-sm text-red-300 text-center drop-shadow-lg">{{ codeError }}</p>
              </div>
              <button
                type="submit"
                :disabled="!gameCode || gameCode.length < 3 || verifyingCode"
                class="px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 text-white rounded-2xl font-bold text-lg sm:text-xl md:text-2xl hover:from-yellow-500 hover:via-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-yellow-500/70 border-2 border-yellow-300/50 whitespace-nowrap relative"
              >
                <span v-if="verifyingCode" class="absolute left-0 inset-y-0 flex items-center pl-4">
                  <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ verifyingCode ? (t('landing.cta.verifying') || 'Vérification...') : t('landing.cta.joinButton') }}
              </button>
            </form>
          </div>
        </div>

        <!-- Secondary CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-2xl mx-auto px-4">
          <router-link
            to="/auth/signup"
            class="w-full sm:w-auto px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 bg-white/20 backdrop-blur-md text-white border-2 border-white/50 rounded-2xl font-bold text-lg sm:text-xl md:text-2xl hover:bg-white/30 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl whitespace-nowrap"
          >
            <span class="truncate drop-shadow-lg">{{ t('landing.createAccount') }}</span>
          </router-link>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8 max-w-6xl mx-auto w-full px-2 sm:px-4">
          <!-- Feature 1 -->
          <div class="flex flex-col items-center justify-start p-5 sm:p-6 md:p-7 lg:p-8 bg-gradient-to-br from-purple-800/60 to-indigo-900/60 backdrop-blur-md rounded-3xl border-2 border-white/30 transform hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 min-h-[200px] sm:min-h-[220px] md:min-h-[240px] shadow-xl">
            <div class="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-5 md:mb-6 filter drop-shadow-2xl flex-shrink-0">🏆</div>
            <h3 class="text-white font-extrabold text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 text-center leading-tight break-words drop-shadow-lg flex-grow-0">{{ t('landing.feature1.title') }}</h3>
            <p class="text-gray-100 text-xs sm:text-sm md:text-base text-center leading-relaxed break-words font-medium flex-grow">{{ t('landing.feature1.desc') }}</p>
          </div>

          <!-- Feature 2 -->
          <div class="flex flex-col items-center justify-start p-5 sm:p-6 md:p-7 lg:p-8 bg-gradient-to-br from-purple-800/60 to-indigo-900/60 backdrop-blur-md rounded-3xl border-2 border-white/30 transform hover:scale-110 hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 min-h-[200px] sm:min-h-[220px] md:min-h-[240px] shadow-xl">
            <div class="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-5 md:mb-6 text-yellow-300 filter drop-shadow-2xl flex-shrink-0">⚡</div>
            <h3 class="text-white font-extrabold text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 text-center leading-tight break-words drop-shadow-lg flex-grow-0">{{ t('landing.feature2.title') }}</h3>
            <p class="text-gray-100 text-xs sm:text-sm md:text-base text-center leading-relaxed break-words font-medium flex-grow">{{ t('landing.feature2.desc') }}</p>
          </div>

          <!-- Feature 3 -->
          <div class="flex flex-col items-center justify-start p-5 sm:p-6 md:p-7 lg:p-8 bg-gradient-to-br from-purple-800/60 to-indigo-900/60 backdrop-blur-md rounded-3xl border-2 border-white/30 transform hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 min-h-[200px] sm:min-h-[220px] md:min-h-[240px] shadow-xl">
            <div class="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-5 md:mb-6 text-blue-300 filter drop-shadow-2xl flex-shrink-0">🌐</div>
            <h3 class="text-white font-extrabold text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 text-center leading-tight break-words drop-shadow-lg flex-grow-0">{{ t('landing.feature3.title') }}</h3>
            <p class="text-gray-100 text-xs sm:text-sm md:text-base text-center leading-relaxed break-words font-medium flex-grow">{{ t('landing.feature3.desc') }}</p>
          </div>

          <!-- Feature 4 -->
          <div class="flex flex-col items-center justify-start p-5 sm:p-6 md:p-7 lg:p-8 bg-gradient-to-br from-purple-800/60 to-indigo-900/60 backdrop-blur-md rounded-3xl border-2 border-white/30 transform hover:scale-110 hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300 min-h-[200px] sm:min-h-[220px] md:min-h-[240px] shadow-xl">
            <div class="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-5 md:mb-6 text-red-300 filter drop-shadow-2xl flex-shrink-0">🎯</div>
            <h3 class="text-white font-extrabold text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 text-center leading-tight break-words drop-shadow-lg flex-grow-0">{{ t('landing.feature4.title') }}</h3>
            <p class="text-gray-100 text-xs sm:text-sm md:text-base text-center leading-relaxed break-words font-medium flex-grow">{{ t('landing.feature4.desc') }}</p>
          </div>
        </div>

        <!-- Platform Description Section -->
        <div class="w-full max-w-6xl mx-auto px-4 sm:px-6">
          <div class="bg-gradient-to-br from-white/10 to-purple-900/30 backdrop-blur-md rounded-3xl border-2 border-white/30 p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl">
            <!-- Title -->
            <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-yellow-400 mb-6 sm:mb-8 text-center drop-shadow-2xl">
              {{ t('landing.description.title') }}
            </h2>

            <!-- What is IntelectGame -->
            <p class="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-100 mb-8 sm:mb-10 md:mb-12 leading-relaxed text-center max-w-4xl mx-auto drop-shadow-lg">
              {{ t('landing.description.whatIs') }}
            </p>

            <!-- Who is it for -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10 md:mb-12">
              <!-- For Administrators -->
              <div class="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-sm rounded-2xl border-2 border-blue-400/30 p-5 sm:p-6 md:p-7 shadow-xl">
                <h3 class="text-xl sm:text-2xl md:text-3xl font-bold text-blue-300 mb-3 sm:mb-4 drop-shadow-lg">
                  {{ t('landing.description.forAdmins') }}
                </h3>
                <p class="text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed">
                  {{ t('landing.description.forAdminsDesc') }}
                </p>
              </div>

              <!-- For Participants -->
              <div class="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-2xl border-2 border-purple-400/30 p-5 sm:p-6 md:p-7 shadow-xl">
                <h3 class="text-xl sm:text-2xl md:text-3xl font-bold text-purple-300 mb-3 sm:mb-4 drop-shadow-lg">
                  {{ t('landing.description.forParticipants') }}
                </h3>
                <p class="text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed">
                  {{ t('landing.description.forParticipantsDesc') }}
                </p>
              </div>
            </div>

            <!-- Main Features -->
            <div class="mb-8 sm:mb-10 md:mb-12">
              <h3 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 text-center drop-shadow-lg">
                {{ t('landing.description.features.title') }}
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                <!-- Quick Registration -->
                <div class="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm rounded-xl border-2 border-green-400/30 p-4 sm:p-5 shadow-lg">
                  <h4 class="text-lg sm:text-xl font-bold text-green-300 mb-2 sm:mb-3 drop-shadow-lg">
                    {{ t('landing.description.features.quickRegistration') }}
                  </h4>
                  <p class="text-xs sm:text-sm md:text-base text-gray-200 leading-relaxed">
                    {{ t('landing.description.features.quickRegistrationDesc') }}
                  </p>
                </div>

                <!-- Real-Time -->
                <div class="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 backdrop-blur-sm rounded-xl border-2 border-yellow-400/30 p-4 sm:p-5 shadow-lg">
                  <h4 class="text-lg sm:text-xl font-bold text-yellow-300 mb-2 sm:mb-3 drop-shadow-lg">
                    {{ t('landing.description.features.realTime') }}
                  </h4>
                  <p class="text-xs sm:text-sm md:text-base text-gray-200 leading-relaxed">
                    {{ t('landing.description.features.realTimeDesc') }}
                  </p>
                </div>

                <!-- Leaderboard -->
                <div class="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm rounded-xl border-2 border-blue-400/30 p-4 sm:p-5 shadow-lg">
                  <h4 class="text-lg sm:text-xl font-bold text-blue-300 mb-2 sm:mb-3 drop-shadow-lg">
                    {{ t('landing.description.features.leaderboard') }}
                  </h4>
                  <p class="text-xs sm:text-sm md:text-base text-gray-200 leading-relaxed">
                    {{ t('landing.description.features.leaderboardDesc') }}
                  </p>
                </div>

                <!-- Results -->
                <div class="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-xl border-2 border-purple-400/30 p-4 sm:p-5 shadow-lg">
                  <h4 class="text-lg sm:text-xl font-bold text-purple-300 mb-2 sm:mb-3 drop-shadow-lg">
                    {{ t('landing.description.features.results') }}
                  </h4>
                  <p class="text-xs sm:text-sm md:text-base text-gray-200 leading-relaxed">
                    {{ t('landing.description.features.resultsDesc') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Platform Strengths -->
            <div class="mb-8 sm:mb-10 md:mb-12">
              <h3 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 text-center drop-shadow-lg">
                {{ t('landing.description.strengths.title') }}
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                <!-- Real-Time -->
                <div class="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 backdrop-blur-sm rounded-xl border-2 border-indigo-400/30 p-4 sm:p-5 shadow-lg">
                  <h4 class="text-lg sm:text-xl font-bold text-indigo-300 mb-2 sm:mb-3 drop-shadow-lg">
                    ⚡ {{ t('landing.description.strengths.realTime') }}
                  </h4>
                  <p class="text-xs sm:text-sm md:text-base text-gray-200 leading-relaxed">
                    {{ t('landing.description.strengths.realTimeDesc') }}
                  </p>
                </div>

                <!-- Cross-Platform -->
                <div class="bg-gradient-to-br from-teal-900/40 to-cyan-900/40 backdrop-blur-sm rounded-xl border-2 border-teal-400/30 p-4 sm:p-5 shadow-lg">
                  <h4 class="text-lg sm:text-xl font-bold text-teal-300 mb-2 sm:mb-3 drop-shadow-lg">
                    📱 {{ t('landing.description.strengths.crossPlatform') }}
                  </h4>
                  <p class="text-xs sm:text-sm md:text-base text-gray-200 leading-relaxed">
                    {{ t('landing.description.strengths.crossPlatformDesc') }}
                  </p>
                </div>

                <!-- Telegram -->
                <div class="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-sm rounded-xl border-2 border-blue-400/30 p-4 sm:p-5 shadow-lg">
                  <h4 class="text-lg sm:text-xl font-bold text-blue-300 mb-2 sm:mb-3 drop-shadow-lg">
                    🤖 {{ t('landing.description.strengths.telegram') }}
                  </h4>
                  <p class="text-xs sm:text-sm md:text-base text-gray-200 leading-relaxed">
                    {{ t('landing.description.strengths.telegramDesc') }}
                  </p>
                </div>

                <!-- Security -->
                <div class="bg-gradient-to-br from-red-900/40 to-pink-900/40 backdrop-blur-sm rounded-xl border-2 border-red-400/30 p-4 sm:p-5 shadow-lg">
                  <h4 class="text-lg sm:text-xl font-bold text-red-300 mb-2 sm:mb-3 drop-shadow-lg">
                    🔒 {{ t('landing.description.strengths.security') }}
                  </h4>
                  <p class="text-xs sm:text-sm md:text-base text-gray-200 leading-relaxed">
                    {{ t('landing.description.strengths.securityDesc') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Use Cases -->
            <div class="mb-8 sm:mb-10 md:mb-12">
              <h3 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 text-center drop-shadow-lg">
                {{ t('landing.description.useCases.title') }}
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                <!-- Education -->
                <div class="bg-gradient-to-br from-yellow-900/40 to-amber-900/40 backdrop-blur-sm rounded-xl border-2 border-yellow-400/30 p-4 sm:p-5 md:p-6 shadow-lg">
                  <h4 class="text-xl sm:text-2xl font-bold text-yellow-300 mb-3 sm:mb-4 drop-shadow-lg">
                    🎓 {{ t('landing.description.useCases.education') }}
                  </h4>
                  <p class="text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed">
                    {{ t('landing.description.useCases.educationDesc') }}
                  </p>
                </div>

                <!-- Business -->
                <div class="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-sm rounded-xl border-2 border-blue-400/30 p-4 sm:p-5 md:p-6 shadow-lg">
                  <h4 class="text-xl sm:text-2xl font-bold text-blue-300 mb-3 sm:mb-4 drop-shadow-lg">
                    🏢 {{ t('landing.description.useCases.business') }}
                  </h4>
                  <p class="text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed">
                    {{ t('landing.description.useCases.businessDesc') }}
                  </p>
                </div>

                <!-- Events -->
                <div class="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-xl border-2 border-purple-400/30 p-4 sm:p-5 md:p-6 shadow-lg">
                  <h4 class="text-xl sm:text-2xl font-bold text-purple-300 mb-3 sm:mb-4 drop-shadow-lg">
                    🎉 {{ t('landing.description.useCases.events') }}
                  </h4>
                  <p class="text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed">
                    {{ t('landing.description.useCases.eventsDesc') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Summary -->
            <div class="bg-gradient-to-br from-orange-900/40 to-yellow-900/40 backdrop-blur-sm rounded-2xl border-2 border-orange-400/30 p-5 sm:p-6 md:p-8 shadow-xl">
              <p class="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-100 leading-relaxed text-center drop-shadow-lg">
                {{ t('landing.description.summary') }}
              </p>
            </div>
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
            <label class="block text-gray-100 text-sm sm:text-base font-bold mb-2 sm:mb-3">{{ t('landing.email') }}</label>
            <input
              v-model="loginForm.email"
              type="email"
              required
              class="w-full px-4 py-3 sm:py-4 bg-gray-800/90 border-2 border-gray-600 rounded-xl text-white text-base focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-lg focus:shadow-xl placeholder-gray-500"
              :placeholder="t('landing.emailPlaceholder')"
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
        email: '',
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
    async handleGameCodeSubmit() {
      // Validation basique
      if (!this.gameCode || this.gameCode.length < 3) {
        this.codeError = this.t('landing.cta.codeTooShort') || 'Le code doit contenir au moins 3 caractères'
        return
      }

      this.verifyingCode = true
      this.codeError = ''

      try {
        // Vérifier le code via l'API avant de rediriger
        const res = await axios.post(API_URLS.game.verifyCode, {
          code: this.gameCode.toUpperCase()
        })

        if (res.data.valid) {
          // Code valide, rediriger vers la page de registration avec le code pré-rempli
          this.$router.push({
            path: '/player/register',
            query: { code: this.gameCode.toUpperCase() }
          })
        } else {
          // Code invalide
          this.codeError = this.t('landing.cta.invalidCode') || 'Code invalide. Veuillez vérifier le code de la partie.'
        }
      } catch (err) {
        // Erreur lors de la vérification
        this.codeError = err.response?.data?.error || this.t('landing.cta.verifyError') || 'Erreur lors de la vérification du code. Veuillez réessayer.'
      } finally {
        this.verifyingCode = false
      }
    },
    async handleLogin() {
      this.loginError = ''
      this.loginLoading = true

      try {
        // Use user login endpoint, not admin login
        const response = await axios.post(API_URLS.auth.userLogin, {
          email: this.loginForm.email,
          password: this.loginForm.password
        })

        if (response.data.token && response.data.user) {
          // Store token and user info
          localStorage.setItem('authToken', response.data.token)
          localStorage.setItem('userInfo', JSON.stringify(response.data.user))

          // Check user status and redirect accordingly
          if (response.data.user.status === 'pending') {
            this.$router.push('/auth/waiting-validation')
          } else if (response.data.user.status === 'approved') {
            this.$router.push('/user/dashboard')
          } else {
            this.loginError = this.t('landing.loginError') || 'Your account is not approved yet'
          }
        }
      } catch (error) {
        console.error('Login error:', error)
        this.loginError = error.response?.data?.error || this.t('landing.loginError') || 'Invalid credentials'
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
