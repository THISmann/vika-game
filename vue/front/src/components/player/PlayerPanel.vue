<template>
  <div class="min-h-screen max-w-4xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 lg:py-6">
    <!-- Header -->
    <div class="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl border-2 border-blue-200 p-4 sm:p-5 md:p-6 lg:p-8 mb-4 sm:mb-5 md:mb-6">
      <div class="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div class="flex items-center space-x-3 sm:space-x-4">
          <div class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg ring-4 ring-blue-200">
            <span class="text-white font-extrabold text-lg sm:text-xl md:text-2xl">
              {{ player?.name ? player.name.charAt(0).toUpperCase() : '?' }}
            </span>
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">
              {{ t('panel.title') }} — {{ player?.name || t('panel.anonymous') }}
            </h2>
            <p class="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
              {{ t('panel.subtitle') }}
            </p>
          </div>
        </div>
        
        <!-- Score Display -->
        <div class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 shadow-xl">
          <div class="text-center">
            <p class="text-xs sm:text-sm md:text-base font-medium text-white/90 mb-1">{{ t('panel.score') }}</p>
            <p class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">{{ score }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Load Questions Button -->
    <div class="mb-4 sm:mb-5 md:mb-6">
      <button
        @click="loadQuestions"
        :disabled="loading"
        class="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl font-bold rounded-2xl sm:rounded-3xl text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl min-h-[56px] sm:min-h-[64px] flex items-center justify-center"
        style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
      >
        <span v-if="loading" class="flex items-center space-x-2">
          <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ t('panel.loading') }}</span>
        </span>
        <span v-else>{{ t('panel.loadQuestions') }}</span>
      </button>
    </div>

    <!-- Questions List -->
    <div v-if="questions.length" class="space-y-3 sm:space-y-4 md:space-y-5">
      <div
        v-for="q in questions"
        :key="q.id"
        class="bg-gradient-to-br from-white to-indigo-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-indigo-100 p-4 sm:p-5 md:p-6 lg:p-8"
      >
        <div class="mb-4 sm:mb-5 md:mb-6">
          <h3 class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-3 sm:mb-4 break-words">
            {{ q.question }}
          </h3>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button
            v-for="(choice, index) in q.choices"
            :key="choice"
            @click="answer(q.id, choice)"
            :disabled="answering"
            class="group relative p-4 sm:p-5 md:p-6 bg-gradient-to-br from-white to-gray-50 border-3 sm:border-[3px] rounded-xl sm:rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[60px] sm:min-h-[70px] md:min-h-[80px] shadow-lg hover:shadow-xl border-gray-200 hover:border-blue-500"
            style="touch-action: manipulation; -webkit-tap-highlight-color: transparent; user-select: none;"
          >
            <div class="flex items-center justify-between gap-3 w-full">
              <span class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 break-words text-left flex-1 leading-snug">
                {{ choice }}
              </span>
              <div class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white border-3 sm:border-[3px] border-gray-300 group-hover:border-blue-500 flex items-center justify-center transition-colors flex-shrink-0 shadow-lg ring-2 ring-gray-200">
                <span class="text-sm sm:text-base md:text-lg font-extrabold text-gray-800">
                  {{ String.fromCharCode(65 + index) }}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="bg-white rounded-2xl sm:rounded-3xl shadow-xl border-2 border-gray-200 p-8 sm:p-10 md:p-12 text-center">
      <svg
        class="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="text-base sm:text-lg md:text-xl text-gray-600">{{ t('panel.noQuestions') }}</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 sm:mt-5 md:mt-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 sm:px-5 md:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base">
      {{ error }}
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { API_URLS } from '@/config/api'
import socketService from '@/services/socketService'
import { useI18n } from '@/composables/useI18n'

export default {
  props: ['player'],
  setup() {
    const { t } = useI18n()
    return { t }
  },
  data() {
    return {
      questions: [],
      score: 0,
      loading: false,
      answering: false,
      error: ''
    }
  },
  async created() {
    // Utiliser le socketService singleton
    const socket = socketService.getSocket()
    const componentId = 'PlayerPanel'
    
    // Enregistrer le joueur
    if (this.player?.id) {
      socketService.registerPlayer(this.player.id)
    }
    
    // Écouter les mises à jour de score
    socketService.on('score:update', (payload) => {
      if (payload.playerId === this.player?.id) {
        this.score = payload.score || 0
      }
    }, componentId)
    
    socketService.on('leaderboard:update', (payload) => {
      // Émettre l'événement au parent si nécessaire
      this.$emit('leaderboard:update', payload)
    }, componentId)

    // Charger le score initial
    if (this.player?.id) {
      try {
        const res = await axios.get(API_URLS.game.score(this.player.id))
        if (res.data) {
          this.score = res.data.score || 0
        }
      } catch (err) {
        console.error('Error loading initial score:', err)
      }
    }
  },
  beforeUnmount() {
    // Nettoyer les listeners mais garder la connexion active
    socketService.off('PlayerPanel')
  },
  methods: {
    async loadQuestions() {
      this.loading = true
      this.error = ''
      
      try {
        const res = await axios.get(API_URLS.quiz.all)
        if (res && res.data) {
          this.questions = res.data
        }
      } catch (err) {
        console.error('Error loading questions:', err)
        this.error = this.t('panel.loadError')
      } finally {
        this.loading = false
      }
    },
    async answer(questionId, choice) {
      if (!this.player?.id) {
        this.error = this.t('panel.playerRequired')
        return
      }

      this.answering = true
      this.error = ''

      try {
        const res = await axios.post(API_URLS.game.answer, {
          playerId: this.player.id,
          questionId,
          answer: choice,
        })

        if (res && res.data) {
          this.score = res.data.score ?? this.score
          if (res.data.correct) {
            // Optionnel: afficher un message de succès
            // Vous pouvez remplacer alert par une notification toast
            console.log('✅ Correct answer!')
          } else {
            console.log('❌ Wrong answer. Correct was:', res.data.correctAnswer)
          }
        }
      } catch (err) {
        console.error('Error submitting answer:', err)
        this.error = err.response?.data?.error || this.t('panel.answerError')
      } finally {
        this.answering = false
      }
    },
  },
}
</script>
