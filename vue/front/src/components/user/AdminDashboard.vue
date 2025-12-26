<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <UserSidebar />
    
    <!-- Main Content -->
    <div class="flex-1 ml-0 md:ml-64 min-h-screen max-w-6xl mx-auto space-y-4 sm:space-y-5 md:space-y-6 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 transition-all duration-300 mt-16 pt-6">
    <!-- Header -->
    <div class="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl border-2 border-blue-200 p-4 sm:p-5 md:p-6">
      <div class="text-center mb-4 sm:mb-5 md:mb-6">
        <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">{{ t('admin.dashboard.title') }}</h1>
        <p class="text-sm sm:text-base md:text-lg text-gray-600 px-2">{{ t('admin.dashboard.subtitle') }}</p>
        
        <!-- User Info -->
        <div v-if="currentUser" class="mt-4 sm:mt-6 inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/80 rounded-xl border-2 border-blue-300 shadow-lg">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg mr-3">
            {{ currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U' }}
          </div>
          <div class="text-left">
            <div class="text-xs sm:text-sm text-gray-600">{{ currentUser.role === 'admin' ? 'Administrateur' : 'Utilisateur' }}</div>
            <div class="text-sm sm:text-base md:text-lg font-bold text-gray-900">{{ currentUser.name || currentUser.email || 'User' }}</div>
          </div>
        </div>
      </div>

      <!-- Game Code -->
      <div v-if="gameCode" class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-yellow-300">
        <div class="text-center">
          <div class="text-xs sm:text-sm text-gray-600 mb-2">{{ t('admin.dashboard.gameCode') }}</div>
          <div class="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-600 mb-2 font-mono tracking-wider">
            {{ gameCode }}
          </div>
          <div class="text-xs sm:text-sm text-gray-600 mb-4">
            {{ t('admin.dashboard.shareCode') }}
          </div>
          
          <!-- Afficher la date planifiée si elle existe -->
          <div v-if="gameState.scheduledStartTime && !gameState.isStarted" class="mt-4 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div class="text-xs sm:text-sm font-semibold text-blue-800 mb-1">
              {{ t('admin.dashboard.gameScheduled') || 'Jeu planifié' }}
            </div>
            <div class="text-sm sm:text-base font-bold text-blue-600">
              {{ formatScheduledTime(gameState.scheduledStartTime) }}
            </div>
          </div>
          
          <!-- Boutons d'action -->
          <div class="flex flex-wrap justify-center gap-2 sm:gap-3">
            <!-- Bouton Copier -->
            <button
              @click="copyGameCode"
              class="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{{ copyButtonText || t('admin.dashboard.copyCode') }}</span>
            </button>

            <!-- Bouton Partager WhatsApp -->
            <button
              @click="shareOnWhatsApp"
              class="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#20ba5a] transition-all transform hover:scale-105 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>WhatsApp</span>
            </button>

            <!-- Bouton Partager Telegram -->
            <button
              @click="shareOnTelegram"
              class="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-[#0088cc] text-white rounded-xl font-bold hover:bg-[#0077b5] transition-all transform hover:scale-105 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span>Telegram</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Game State Info -->
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-4 sm:p-6 mb-6 border-2 border-blue-200 shadow-xl">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div class="text-center">
            <div class="text-2xl sm:text-3xl font-bold text-purple-600">{{ gameState.connectedPlayersCount }}</div>
            <div class="text-xs sm:text-sm text-gray-600 mt-1">{{ t('admin.dashboard.connectedPlayers') }}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl sm:text-3xl font-bold" :class="gameState.isStarted ? 'text-green-600' : 'text-gray-400'">
              {{ gameState.isStarted ? t('admin.dashboard.statusInProgress') : t('admin.dashboard.statusWaiting') }}
            </div>
            <div class="text-xs sm:text-sm text-gray-600 mt-1">{{ t('admin.dashboard.gameStatus') }}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl sm:text-3xl font-bold text-indigo-600">
              {{ gameState.currentQuestionIndex + 1 }}/{{ totalQuestions }}
            </div>
            <div class="text-xs sm:text-sm text-gray-600 mt-1">{{ t('admin.dashboard.currentQuestion') }}</div>
          </div>
        </div>
        
        <!-- Liste des joueurs connectés -->
        <div v-if="connectedPlayers.length > 0" class="mt-4 pt-4 border-t border-purple-200">
          <div class="text-xs sm:text-sm font-semibold text-gray-700 mb-2">{{ t('admin.dashboard.connectedPlayersList') }}</div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="player in connectedPlayers"
              :key="player.id"
              class="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-white rounded-full border border-purple-200 shadow-sm"
            >
              <div class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold mr-1.5 sm:mr-2 flex-shrink-0">
                {{ player.name ? player.name.charAt(0).toUpperCase() : '?' }}
              </div>
              <span class="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[100px] sm:max-w-none">
                {{ player.name || t('admin.dashboard.anonymousPlayer') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Game Controls -->
      <div class="space-y-4 mb-4 sm:mb-6">
        <!-- Configuration du temps par question -->
        <div v-if="!gameState.isStarted" class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-3 sm:p-4 border-2 border-blue-200 shadow-lg space-y-4">
          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            {{ t('admin.dashboard.timePerQuestion') }}
          </label>
          <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <input
              v-model.number="questionDuration"
              type="number"
              min="5"
              max="300"
              class="w-full sm:w-32 px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 shadow-lg focus:shadow-xl"
              placeholder="30"
            />
            <span class="text-xs sm:text-sm text-gray-600">
              {{ t('admin.dashboard.timeMinMax') }}
            </span>
          </div>
          
          <!-- Option de planification -->
          <div class="flex items-center space-x-3 pt-2 border-t border-blue-200">
            <input
              id="scheduleGame"
              v-model="scheduleMode"
              type="checkbox"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="scheduleGame" class="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
              {{ t('admin.dashboard.scheduleGame') || 'Planifier le lancement' }}
            </label>
          </div>
          
          <!-- Champ date/heure si planifié -->
          <div v-if="scheduleMode" class="pt-2">
            <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              {{ t('admin.dashboard.scheduledTime') || 'Date et heure de lancement' }}
            </label>
            <input
              v-model="scheduledDateTime"
              type="datetime-local"
              :min="minDateTime"
              class="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 shadow-lg focus:shadow-xl"
            />
            <p v-if="scheduledDateTime" class="mt-2 text-xs text-gray-600">
              {{ t('admin.dashboard.gameWillStartAt') || 'Le jeu démarrera le' }}: 
              <strong>{{ formatScheduledTime(scheduledDateTime) }}</strong>
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button
            @click="startGame"
            :disabled="gameState.isStarted || loading || totalQuestions === 0 || (scheduleMode && !scheduledDateTime)"
            class="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl"
          >
            {{ scheduleMode ? (t('admin.dashboard.scheduleGameButton') || 'Planifier le jeu') : t('admin.dashboard.startGame') }}
          </button>
          <button
            @click="nextQuestion"
            :disabled="!gameState.isStarted || loading"
            class="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl"
          >
            {{ t('admin.dashboard.nextQuestion') }}
          </button>
          <button
            @click="endGame"
            :disabled="!gameState.isStarted || loading"
            class="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl"
          >
            {{ t('admin.dashboard.endGame') }}
          </button>
          <button
            @click="deleteGame"
            :disabled="loading"
            class="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl"
          >
            {{ t('admin.dashboard.deleteGame') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <div
        @click="$router.push('/user/questions')"
        class="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-4 sm:p-6 text-white cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl border-2 border-blue-400 shadow-xl"
      >
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <h3 class="text-xl sm:text-2xl font-bold">{{ t('admin.nav.questions') }}</h3>
          <svg class="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p class="text-purple-100">{{ t('admin.dashboard.manageQuestionsDesc') }}</p>
        <div class="mt-4 flex items-center text-sm font-medium">
          {{ t('admin.dashboard.manageQuestions') }}
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>

      <div
        @click="$router.push('/user/leaderboard')"
        class="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-4 sm:p-6 text-white cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl border-2 border-blue-400 shadow-xl"
      >
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <h3 class="text-xl sm:text-2xl font-bold">Classement</h3>
          <svg class="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        </div>
        <p class="text-blue-100">{{ t('admin.dashboard.viewLeaderboardDesc') }}</p>
        <div class="mt-4 flex items-center text-sm font-medium">
          {{ t('admin.dashboard.viewLeaderboard') }}
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="message" class="bg-blue-50 border-2 border-blue-200 text-blue-700 px-4 py-3 rounded-xl shadow-lg">
      {{ message }}
    </div>
    <div v-if="error" class="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg">
      {{ error }}
    </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useGameStore } from '@/stores/game'
import { useQuestionsStore } from '@/stores/questions'
import UserSidebar from './UserSidebar.vue'
import MobileSidebarToggle from './MobileSidebarToggle.vue'

export default {
  components: {
    UserSidebar,
    MobileSidebarToggle
  },
  setup() {
    const { t } = useI18n()
    const gameStore = useGameStore()
    const questionsStore = useQuestionsStore()
    const questionDuration = ref(30)
    const copyButtonText = ref('')
    const scheduleMode = ref(false)
    const scheduledDateTime = ref('')
    
    // Calculer la date/heure minimale (maintenant)
    const minDateTime = computed(() => {
      const now = new Date()
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
      return now.toISOString().slice(0, 16)
    })
    
    // Formater la date planifiée pour l'affichage
    const formatScheduledTime = (dateTimeString) => {
      if (!dateTimeString) return ''
      const date = new Date(dateTimeString)
      return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const currentUser = computed(() => {
      try {
        const userInfoStr = localStorage.getItem('userInfo')
        if (userInfoStr) {
          return JSON.parse(userInfoStr)
        }
      } catch (error) {
        console.error('Error parsing user info:', error)
      }
      return null
    })

    const gameState = computed(() => gameStore.gameState)
    const gameCode = computed(() => gameStore.gameCode)
    const totalQuestions = computed(() => questionsStore.questionsCount)
    const connectedPlayers = computed(() => gameStore.connectedPlayers)
    const loading = computed(() => gameStore.loading || questionsStore.loading)
    const message = computed(() => gameStore.message)
    const error = computed(() => gameStore.error || questionsStore.error)

    onMounted(async () => {
      // Load initial data
      await Promise.all([
        questionsStore.loadQuestions(),
        gameStore.loadGameState(),
        gameStore.loadGameCode(),
        gameStore.loadConnectedPlayers()
      ])
      
      // Setup socket listeners for real-time updates
      gameStore.setupSocketListeners()
    })

    onUnmounted(() => {
      // Cleanup socket listeners
      gameStore.removeSocketListeners()
    })

    const startGame = async () => {
      if (totalQuestions.value === 0) {
        gameStore.error = t('admin.dashboard.noQuestions')
        return
      }

      if (!questionDuration.value || questionDuration.value < 5 || questionDuration.value > 300) {
        gameStore.error = t('admin.dashboard.timeMinMax')
        return
      }
      
      // Si mode planifié, vérifier que la date est valide
      if (scheduleMode.value) {
        if (!scheduledDateTime.value) {
          gameStore.error = t('admin.dashboard.scheduledTimeRequired') || 'Veuillez sélectionner une date et heure'
          return
        }
        
        const scheduledDate = new Date(scheduledDateTime.value)
        const now = new Date()
        
        if (scheduledDate <= now) {
          gameStore.error = t('admin.dashboard.scheduledTimeMustBeFuture') || 'La date doit être dans le futur'
          return
        }
      }
      
      try {
        const scheduledStartTime = scheduleMode.value && scheduledDateTime.value 
          ? new Date(scheduledDateTime.value).toISOString() 
          : null
        
        await gameStore.startGame(questionDuration.value, scheduledStartTime)
        
        // Réinitialiser le formulaire après succès
        if (scheduleMode.value) {
          scheduleMode.value = false
          scheduledDateTime.value = ''
        }
      } catch (err) {
        // Error is already set in the store
      }
    }

    const nextQuestion = async () => {
      try {
        await gameStore.nextQuestion()
      } catch (err) {
        // Error is already set in the store
      }
    }

    const endGame = async () => {
      if (!confirm(t('admin.dashboard.confirmEndGame'))) {
        return
      }
      try {
        await gameStore.endGame()
      } catch (err) {
        // Error is already set in the store
      }
    }

    const deleteGame = async () => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer la partie ? Tous les scores seront réinitialisés.')) {
        return
      }
      try {
        await gameStore.deleteGame()
      } catch (err) {
        // Error is already set in the store
      }
    }

    const copyGameCode = async () => {
      try {
        await navigator.clipboard.writeText(gameCode.value)
        copyButtonText.value = t('admin.dashboard.codeCopied')
        setTimeout(() => {
          copyButtonText.value = ''
        }, 2000)
      } catch (err) {
        const textArea = document.createElement('textarea')
        textArea.value = gameCode.value
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        copyButtonText.value = t('admin.dashboard.codeCopied')
        setTimeout(() => {
          copyButtonText.value = ''
        }, 2000)
      }
    }

    const shareOnWhatsApp = () => {
      const text = encodeURIComponent(`${t('admin.dashboard.shareCode')} Code: ${gameCode.value}`)
      window.open(`https://wa.me/?text=${text}`, '_blank', 'width=600,height=400')
    }

    const shareOnTelegram = () => {
      const text = encodeURIComponent(`${t('admin.dashboard.shareCode')} Code: ${gameCode.value}`)
      const url = encodeURIComponent(window.location.origin)
      window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank', 'width=600,height=400')
    }

    return {
      t,
      currentUser,
      gameState,
      gameCode,
      totalQuestions,
      connectedPlayers,
      loading,
      message,
      error,
      questionDuration,
      copyButtonText,
      startGame,
      nextQuestion,
      endGame,
      deleteGame,
      copyGameCode,
      shareOnWhatsApp,
      shareOnTelegram,
      scheduleMode,
      scheduledDateTime,
      minDateTime,
      formatScheduledTime
    }
  },
}
</script>

