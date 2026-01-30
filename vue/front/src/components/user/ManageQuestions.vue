<template>
  <div class="flex min-h-screen">
    <UserSidebar />
    <div class="flex-1 ml-20 md:ml-64 max-w-6xl mx-auto space-y-3 sm:space-y-4 md:space-y-6 px-4 sm:px-3 md:px-6 py-4 sm:py-3 md:py-6 transition-all duration-300 mt-16 pt-4 sm:pt-6 pb-6 md:pb-6" :class="sidebarCollapsed ? 'md:ml-20' : ''">
    <!-- Header -->
    <div class="bg-gradient-to-br from-white to-blue-50 rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl border-0 sm:border-2 border-blue-200 p-4 sm:p-5 md:p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('admin.questions.title') }}</h1>
      <p class="text-gray-600">{{ t('admin.questions.subtitle') }}</p>
    </div>

    <!-- Add Question Form -->
    <div class="bg-gradient-to-br from-white to-blue-50 rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl border-0 sm:border-2 border-blue-200 p-4 sm:p-5 md:p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('admin.questions.addTitle') }}</h2>

      <form @submit.prevent="addQuestion" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> {{ t('admin.questions.question') }} </label>
          <textarea
            v-model="question"
            rows="3"
            required
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-lg focus:shadow-xl"
            :placeholder="t('admin.questions.questionPlaceholder')"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('admin.questions.choices') }}
          </label>
          <div class="space-y-3">
            <div
              v-for="(choice, index) in choiceItems"
              :key="index"
              class="flex items-center gap-2 sm:gap-3"
            >
              <input
                v-model="choiceItems[index]"
                type="text"
                class="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                :placeholder="t('admin.questions.choicePlaceholder') || `Option ${index + 1}`"
              />
              <button
                v-if="choiceItems.length > 2"
                type="button"
                @click="removeChoice(index)"
                class="flex-shrink-0 p-2.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                :title="t('admin.questions.removeChoice') || 'Supprimer'"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              @click="addChoice"
              class="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all font-medium"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ t('admin.questions.addChoice') || 'Ajouter une option' }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> {{ t('admin.questions.correctAnswer') }} </label>
          <select
            v-model="answer"
            required
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-lg focus:shadow-xl appearance-none cursor-pointer"
          >
            <option value="" disabled>{{ t('admin.questions.correctAnswerPlaceholder') || 'Choisir la bonne réponse' }}</option>
            <option
              v-for="c in validChoices"
              :key="c"
              :value="c"
            >
              {{ c }}
            </option>
          </select>
        </div>

        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ error }}
        </div>

        <div
          v-if="success"
          class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ t('admin.questions.addSuccess') }}
        </div>

        <button
          type="submit"
          class="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-bold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl"
        >
          {{ t('admin.questions.addButton') }}
        </button>
      </form>
    </div>

    <!-- Questions List -->
    <div class="bg-gradient-to-br from-white to-blue-50 rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl border-0 sm:border-2 border-blue-200 p-4 sm:p-5 md:p-6">
      <!-- Title: clearer hierarchy, more spacing on mobile -->
      <div class="flex items-center justify-between mb-5 sm:mb-6 pb-3 border-b-2 border-gray-200/80">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          {{ t('admin.questions.listTitle') }} <span class="text-blue-600 font-extrabold">({{ questions.length }})</span>
        </h2>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"
        ></div>
        <p class="mt-2 text-gray-600">{{ t('admin.questions.loading') }}</p>
      </div>

      <div v-else-if="questions.length === 0" class="text-center py-12 text-gray-500">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
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
        <p class="mt-2">{{ t('admin.questions.empty') }}</p>
      </div>

      <!-- List: more spacing, clearer cards, touch-friendly -->
      <div v-else class="space-y-5 sm:space-y-6 md:space-y-6 px-1 sm:px-0 pb-2">
        <div
          v-for="(q, index) in questions"
          :key="q.id"
          class="border-2 border-gray-200 rounded-2xl p-4 sm:p-5 bg-white shadow-md hover:shadow-lg hover:border-blue-200/80 transition-all duration-200"
        >
          <div class="flex items-start justify-between gap-3 sm:gap-4">
            <div class="flex-1 min-w-0">
              <!-- Question: number + text, stronger hierarchy -->
              <div class="flex gap-3 sm:gap-4 mb-4">
                <span
                  class="flex-shrink-0 w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-base sm:text-base font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md ring-2 ring-blue-200/50"
                >
                  {{ index + 1 }}
                </span>
                <h3 class="text-lg sm:text-lg font-semibold text-gray-900 leading-relaxed break-words pt-1">
                  {{ q.question }}
                </h3>
              </div>

              <!-- Choices: section label more visible -->
              <div class="mt-4 pt-3 border-t border-gray-100">
                <p class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span class="w-1 h-4 rounded-full bg-blue-500"></span>
                  {{ t('admin.questions.choices') }}
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-3">
                  <div
                    v-for="choice in q.choices"
                    :key="choice"
                    class="min-h-[44px] flex items-center rounded-xl px-4 py-3 text-sm sm:text-sm font-medium transition-all duration-150"
                    :class="choice === q.answer
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 shadow-sm ring-2 ring-green-200/60'
                      : 'bg-gray-50 border border-gray-200 text-gray-700'"
                  >
                    <span class="flex-1 break-words">{{ choice }}</span>
                    <span
                      v-if="choice === q.answer"
                      class="flex-shrink-0 ml-2 inline-flex items-center gap-1 rounded-full bg-green-500 text-white text-xs font-bold px-2 py-0.5"
                    >
                      ✓ {{ t('admin.questions.correctShort') || 'OK' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Delete: 44px target, tap feedback -->
            <button
              @click="deleteQuestion(q.id)"
              type="button"
              class="flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-red-600 bg-red-50/80 hover:bg-red-100 active:scale-95 active:bg-red-200/80 transition-all duration-150 touch-manipulation"
              :title="t('admin.questions.delete')"
              :aria-label="t('admin.questions.delete')"
            >
              <svg class="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useQuestionsStore } from '@/stores/questions'
import UserSidebar from './UserSidebar.vue'

export default {
  name: 'ManageQuestions',
  components: {
    UserSidebar
  },
  setup() {
    const { t } = useI18n()
    const questionsStore = useQuestionsStore()
    const sidebarCollapsed = ref(false)
    
    // Check sidebar state periodically
    const checkSidebarState = () => {
      const savedState = localStorage.getItem('sidebarCollapsed')
      sidebarCollapsed.value = savedState === 'true'
    }
    
    const question = ref('')
    const choiceItems = ref(['', ''])
    const answer = ref('')
    const success = ref(false)

    const validChoices = computed(() =>
      choiceItems.value.map((c) => c.trim()).filter(Boolean)
    )

    const addChoice = () => {
      choiceItems.value.push('')
    }
    const removeChoice = (index) => {
      if (choiceItems.value.length > 2) {
        choiceItems.value.splice(index, 1)
        if (answer.value && !choiceItems.value.includes(answer.value)) {
          answer.value = ''
        }
      }
    }

    const questions = computed(() => questionsStore.questions)
    const loading = computed(() => questionsStore.loading)
    const error = computed(() => questionsStore.error)

    onMounted(async () => {
      checkSidebarState()
      // Check periodically for changes (every 100ms)
      const interval = setInterval(checkSidebarState, 100)
      window.sidebarCheckInterval = interval
      
      // Load questions from store
      await questionsStore.loadQuestions()
    })
    
    onUnmounted(() => {
      if (window.sidebarCheckInterval) {
        clearInterval(window.sidebarCheckInterval)
      }
    })

    const addQuestion = async () => {
      questionsStore.clearError()
      success.value = false

      const choices = validChoices.value
      if (!question.value || choices.length < 2 || !answer.value) {
        questionsStore.error = t('admin.questions.allFieldsRequired')
        return
      }
      if (!choices.includes(answer.value)) {
        questionsStore.error = t('admin.questions.correctAnswerMustBeChoice') || 'La bonne réponse doit être une des options.'
        return
      }

      try {
        await questionsStore.createQuestion({
          question: question.value,
          choices,
          answer: answer.value,
        })

        question.value = ''
        choiceItems.value = ['', '']
        answer.value = ''
        success.value = true

        setTimeout(() => {
          success.value = false
        }, 3000)
      } catch (err) {
        // Error is already set in the store
      }
    }

    const deleteQuestion = async (id) => {
      if (!confirm(t('admin.questions.confirmDelete'))) {
        return
      }

      try {
        await questionsStore.deleteQuestion(id)
      } catch (err) {
        // Error is already set in the store
      }
    }

    return {
      t,
      questions,
      loading,
      error,
      question,
      choiceItems,
      validChoices,
      answer,
      success,
      addChoice,
      removeChoice,
      addQuestion,
      deleteQuestion,
      sidebarCollapsed
    }
  },
}
</script>

