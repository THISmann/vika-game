<template>
  <div class="flex min-h-screen">
    <!-- Mobile Sidebar Toggle -->
    <MobileSidebarToggle />
    
    <!-- Sidebar -->
    <UserSidebar />
    
    <!-- Main Content -->
    <div class="flex-1 ml-0 md:ml-64 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 transition-all duration-300 mt-16 pt-6">
      <!-- Header -->
      <div class="mb-6 sm:mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {{ t('parties.title') || 'Mes Parties' }}
            </h1>
            <p class="text-gray-600">
              {{ t('parties.subtitle') || 'Créez et gérez vos parties de jeu' }}
            </p>
          </div>
          <button
            @click="showCreateModal = true"
            class="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>{{ t('parties.create') || 'Créer une partie' }}</span>
          </button>
        </div>
      </div>

      <!-- Parties List -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 mb-4"></div>
        <p class="text-gray-600">{{ t('parties.loading') || 'Chargement...' }}</p>
      </div>

      <div v-else-if="parties.length === 0" class="text-center py-12 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
        <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-gray-600 mb-4">{{ t('parties.noParties') || 'Aucune partie créée' }}</p>
        <button
          @click="showCreateModal = true"
          class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          {{ t('parties.createFirst') || 'Créer votre première partie' }}
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div
          v-for="party in parties"
          :key="party.id"
          class="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl transition-all transform hover:scale-105"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-1">{{ party.name }}</h3>
              <p v-if="party.description" class="text-sm text-gray-600 mb-2">{{ party.description }}</p>
            </div>
            <span
              class="px-3 py-1 text-xs font-semibold rounded-full"
              :class="{
                'bg-gray-100 text-gray-800': party.status === 'draft',
                'bg-blue-100 text-blue-800': party.status === 'scheduled',
                'bg-green-100 text-green-800': party.status === 'active',
                'bg-purple-100 text-purple-800': party.status === 'completed',
                'bg-red-100 text-red-800': party.status === 'cancelled'
              }"
            >
              {{ getStatusLabel(party.status) }}
            </span>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex items-center text-sm text-gray-600">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ party.questionIds?.length || 0 }} {{ t('parties.questions') || 'questions' }}
            </div>
            <div v-if="party.gameCode" class="flex items-center text-sm text-gray-600">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Code: <span class="font-mono font-bold">{{ party.gameCode }}</span>
            </div>
            <div v-if="party.scheduledStartTime" class="flex items-center text-sm text-gray-600">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ formatDate(party.scheduledStartTime) }}
            </div>
          </div>

          <div class="flex space-x-2">
            <button
              @click="editParty(party)"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
            >
              {{ t('parties.edit') || 'Modifier' }}
            </button>
            <button
              @click="deleteParty(party.id)"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-medium"
            >
              {{ t('parties.delete') || 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div
        v-if="showCreateModal || editingParty"
        class="fixed top-16 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[70] p-4"
        :class="sidebarCollapsed ? 'left-16 md:left-20' : 'left-0 md:left-64'"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6 sm:p-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
                {{ editingParty ? (t('parties.edit') || 'Modifier la partie') : (t('parties.create') || 'Créer une partie') }}
              </h2>
              <button
                @click="closeModal"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="saveParty" class="space-y-6">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('parties.name') || 'Nom de la partie' }} *
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500"
                  :placeholder="t('parties.namePlaceholder') || 'Ex: Quiz de Noël 2024'"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('parties.description') || 'Description' }}
                </label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500"
                  :placeholder="t('parties.descriptionPlaceholder') || 'Description de la partie...'"
                ></textarea>
              </div>

              <!-- Questions Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('parties.selectQuestions') || 'Sélectionner les questions' }} *
                </label>
                <div class="border-2 border-gray-300 rounded-xl p-4 max-h-64 overflow-y-auto">
                  <div v-if="availableQuestions.length === 0" class="text-center text-gray-500 py-4">
                    {{ t('parties.noQuestions') || 'Aucune question disponible. Créez d\'abord des questions.' }}
                  </div>
                  <div v-else class="space-y-2">
                    <label
                      v-for="question in availableQuestions"
                      :key="question.id"
                      class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-2"
                      :class="form.questionIds.includes(question.id) ? 'border-blue-500 bg-blue-50' : 'border-transparent'"
                    >
                      <input
                        type="checkbox"
                        :value="question.id"
                        v-model="form.questionIds"
                        class="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div class="flex-1">
                        <div class="font-medium text-gray-900">{{ question.question }}</div>
                        <div class="text-sm text-gray-600 mt-1">
                          {{ question.choices?.length || 0 }} {{ t('parties.choices') || 'choix' }}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                <p class="mt-2 text-sm text-gray-600">
                  {{ t('parties.selectedQuestions') || 'Sélectionnées' }}: {{ form.questionIds.length }}
                </p>
              </div>

              <!-- Scheduled Time -->
              <div>
                <label class="flex items-center space-x-2 mb-2">
                  <input
                    v-model="form.schedule"
                    type="checkbox"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium text-gray-700">
                    {{ t('parties.scheduleLaunch') || 'Planifier le lancement' }}
                  </span>
                </label>
                <input
                  v-if="form.schedule"
                  v-model="form.scheduledStartTime"
                  type="datetime-local"
                  :min="minDateTime"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 mt-2"
                />
              </div>

              <!-- Question Duration -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('parties.questionDuration') || 'Durée par question (secondes)' }}
                </label>
                <input
                  v-model.number="form.questionDuration"
                  type="number"
                  min="5"
                  max="300"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500"
                />
                <p class="mt-1 text-xs text-gray-500">
                  {{ t('parties.durationHint') || 'Entre 5 et 300 secondes (défaut: 30)' }}
                </p>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p class="text-sm text-red-800">{{ error }}</p>
              </div>

              <!-- Actions -->
              <div class="flex space-x-4 pt-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                  {{ t('parties.cancel') || 'Annuler' }}
                </button>
                <button
                  type="submit"
                  :disabled="loading || form.questionIds.length === 0"
                  class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ loading ? (t('parties.saving') || 'Enregistrement...') : (t('parties.save') || 'Enregistrer') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import UserSidebar from './UserSidebar.vue'
import MobileSidebarToggle from './MobileSidebarToggle.vue'
import apiClient from '@/services/api'
import { API_URLS } from '@/config/api'

export default {
  name: 'GameParties',
  components: {
    UserSidebar,
    MobileSidebarToggle
  },
  setup() {
    const { t } = useI18n()
    const parties = ref([])
    const availableQuestions = ref([])
    const loading = ref(false)
    const error = ref('')
    const showCreateModal = ref(false)
    const editingParty = ref(null)
    const sidebarCollapsed = ref(false)
    
    // Check sidebar state periodically
    const checkSidebarState = () => {
      const savedState = localStorage.getItem('sidebarCollapsed')
      sidebarCollapsed.value = savedState === 'true'
    }
    
    let sidebarCheckInterval = null
    
    onMounted(async () => {
      checkSidebarState()
      // Check periodically for changes
      sidebarCheckInterval = setInterval(checkSidebarState, 100)
      await Promise.all([loadParties(), loadQuestions()])
    })
    
    onUnmounted(() => {
      if (sidebarCheckInterval) {
        clearInterval(sidebarCheckInterval)
      }
    })

    const form = ref({
      name: '',
      description: '',
      questionIds: [],
      schedule: false,
      scheduledStartTime: '',
      questionDuration: 30
    })

    const minDateTime = computed(() => {
      const now = new Date()
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
      return now.toISOString().slice(0, 16)
    })

    const getStatusLabel = (status) => {
      const labels = {
        draft: t('parties.status.draft') || 'Brouillon',
        scheduled: t('parties.status.scheduled') || 'Planifiée',
        active: t('parties.status.active') || 'Active',
        completed: t('parties.status.completed') || 'Terminée',
        cancelled: t('parties.status.cancelled') || 'Annulée'
      }
      return labels[status] || status
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      const lang = localStorage.getItem('gameLanguage') || 'fr'
      return date.toLocaleString(lang === 'fr' ? 'fr-FR' : lang === 'ru' ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const loadParties = async () => {
      loading.value = true
      error.value = ''
      try {
        const response = await apiClient.get(API_URLS.game.userParties)
        parties.value = response.data || []
      } catch (err) {
        console.error('Error loading parties:', err)
        error.value = err.response?.data?.error || t('parties.loadError') || 'Erreur lors du chargement'
      } finally {
        loading.value = false
      }
    }

    const loadQuestions = async () => {
      try {
        const response = await apiClient.get(API_URLS.quiz.userQuestions)
        availableQuestions.value = response.data || []
      } catch (err) {
        console.error('Error loading questions:', err)
      }
    }

    const saveParty = async () => {
      if (form.value.questionIds.length === 0) {
        error.value = t('parties.noQuestionsSelected') || 'Veuillez sélectionner au moins une question'
        return
      }

      loading.value = true
      error.value = ''

      try {
        const partyData = {
          name: form.value.name,
          description: form.value.description,
          questionIds: form.value.questionIds,
          questionDuration: form.value.questionDuration * 1000, // Convert to milliseconds
          scheduledStartTime: form.value.schedule && form.value.scheduledStartTime
            ? new Date(form.value.scheduledStartTime).toISOString()
            : null
        }

        if (editingParty.value) {
          await apiClient.put(API_URLS.game.updateParty(editingParty.value.id), partyData)
        } else {
          await apiClient.post(API_URLS.game.createParty, partyData)
        }

        await loadParties()
        closeModal()
      } catch (err) {
        console.error('Error saving party:', err)
        error.value = err.response?.data?.error || t('parties.saveError') || 'Erreur lors de l\'enregistrement'
      } finally {
        loading.value = false
      }
    }

    const editParty = (party) => {
      editingParty.value = party
      form.value = {
        name: party.name,
        description: party.description || '',
        questionIds: party.questionIds || [],
        schedule: !!party.scheduledStartTime,
        scheduledStartTime: party.scheduledStartTime
          ? new Date(party.scheduledStartTime).toISOString().slice(0, 16)
          : '',
        questionDuration: (party.questionDuration || 30000) / 1000 // Convert to seconds
      }
      showCreateModal.value = true
    }

    const deleteParty = async (partyId) => {
      if (!confirm(t('parties.confirmDelete') || 'Êtes-vous sûr de vouloir supprimer cette partie ?')) {
        return
      }

      try {
        await apiClient.delete(API_URLS.game.deleteParty(partyId))
        await loadParties()
      } catch (err) {
        console.error('Error deleting party:', err)
        error.value = err.response?.data?.error || t('parties.deleteError') || 'Erreur lors de la suppression'
      }
    }

    const closeModal = () => {
      showCreateModal.value = false
      editingParty.value = null
      form.value = {
        name: '',
        description: '',
        questionIds: [],
        schedule: false,
        scheduledStartTime: '',
        questionDuration: 30
      }
      error.value = ''
    }


    return {
      t,
      parties,
      availableQuestions,
      loading,
      error,
      showCreateModal,
      editingParty,
      form,
      minDateTime,
      sidebarCollapsed,
      getStatusLabel,
      formatDate,
      saveParty,
      editParty,
      deleteParty,
      closeModal
    }
  }
}
</script>

