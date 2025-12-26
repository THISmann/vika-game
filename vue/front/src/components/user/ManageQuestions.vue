<template>
  <div class="flex min-h-screen">
    <!-- Mobile Sidebar Toggle -->
    <MobileSidebarToggle />
    
    <!-- Sidebar -->
    <UserSidebar />
    
    <!-- Main Content -->
    <div class="flex-1 ml-0 md:ml-64 max-w-6xl mx-auto space-y-6 px-4 sm:px-6 py-4 sm:py-6 transition-all duration-300 mt-16 pt-6">
    <!-- Header -->
    <div class="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl border-2 border-blue-200 p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('admin.questions.title') }}</h1>
      <p class="text-gray-600">{{ t('admin.questions.subtitle') }}</p>
    </div>

    <!-- Add Question Form -->
    <div class="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl border-2 border-blue-200 p-6">
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
          <input
            v-model="choicesRaw"
            type="text"
            required
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-lg focus:shadow-xl"
            :placeholder="t('admin.questions.choicesPlaceholder')"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> {{ t('admin.questions.correctAnswer') }} </label>
          <input
            v-model="answer"
            type="text"
            required
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-lg focus:shadow-xl"
            :placeholder="t('admin.questions.correctAnswerPlaceholder')"
          />
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
    <div class="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl border-2 border-blue-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">
          {{ t('admin.questions.listTitle') }} ({{ questions.length }})
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

      <div v-else class="space-y-4">
        <div
          v-for="q in questions"
          :key="q.id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                {{ q.question }}
              </h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <span
                  v-for="choice in q.choices"
                  :key="choice"
                  class="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-700"
                >
                  {{ choice }}
                </span>
              </div>
            </div>
            <button
              @click="deleteQuestion(q.id)"
              class="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              :title="t('admin.questions.delete')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
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
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useQuestionsStore } from '@/stores/questions'
import UserSidebar from './UserSidebar.vue'
import MobileSidebarToggle from './MobileSidebarToggle.vue'

export default {
  name: 'ManageQuestions',
  components: {
    UserSidebar,
    MobileSidebarToggle
  },
  setup() {
    const { t } = useI18n()
    const questionsStore = useQuestionsStore()
    
    const question = ref('')
    const choicesRaw = ref('')
    const answer = ref('')
    const success = ref(false)

    const questions = computed(() => questionsStore.questions)
    const loading = computed(() => questionsStore.loading)
    const error = computed(() => questionsStore.error)

    onMounted(async () => {
      // Load questions from store
      await questionsStore.loadQuestions()
    })

    const addQuestion = async () => {
      questionsStore.clearError()
      success.value = false

      if (!question.value || !choicesRaw.value || !answer.value) {
        questionsStore.error = t('admin.questions.allFieldsRequired')
        return
      }

      const choices = choicesRaw.value
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c)

      if (choices.length < 2) {
        questionsStore.error = t('admin.questions.minChoices')
        return
      }

      try {
        await questionsStore.createQuestion({
          question: question.value,
          choices,
          answer: answer.value,
        })

        question.value = ''
        choicesRaw.value = ''
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
      choicesRaw,
      answer,
      success,
      addQuestion,
      deleteQuestion
    }
  },
}
</script>

