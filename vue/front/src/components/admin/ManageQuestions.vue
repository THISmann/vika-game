<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('admin.questions.title') }}</h1>
      <p class="text-gray-600">{{ t('admin.questions.subtitle') }}</p>
    </div>

    <!-- Add Question Form -->
    <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('admin.questions.addTitle') }}</h2>

      <form @submit.prevent="addQuestion" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> {{ t('admin.questions.question') }} </label>
          <textarea
            v-model="question"
            rows="3"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            :placeholder="t('admin.questions.choicesPlaceholder')"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> {{ t('admin.questions.correctAnswer') }} </label>
          <input
            v-model="answer"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
          class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {{ t('admin.questions.addButton') }}
        </button>
      </form>
    </div>

    <!-- Questions List -->
    <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
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
</template>

<script>
import axios from 'axios'
import { API_URLS } from '@/config/api'
import { useI18n } from '@/composables/useI18n'

export default {
  setup() {
    const { t } = useI18n()
    return { t }
  },
  data() {
    return {
      questions: [],
      question: '',
      choicesRaw: '',
      answer: '',
      loading: true,
      error: '',
      success: false,
    }
  },
  async created() {
    await this.loadQuestions()
  },
  methods: {
    async loadQuestions() {
      try {
        this.loading = true
        const res = await axios.get(API_URLS.quiz.all)
        this.questions = res.data
      } catch (err) {
        this.error = this.t('admin.questions.loadError')
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async addQuestion() {
      this.error = ''
      this.success = false

      if (!this.question || !this.choicesRaw || !this.answer) {
        this.error = this.t('admin.questions.allFieldsRequired')
        return
      }

      const choices = this.choicesRaw
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c)

      if (choices.length < 2) {
        this.error = this.t('admin.questions.minChoices')
        return
      }

      try {
        await axios.post(API_URLS.quiz.create, {
          question: this.question,
          choices,
          answer: this.answer,
        })

        // Reset form
        this.question = ''
        this.choicesRaw = ''
        this.answer = ''
        this.success = true

        // Reload questions
        await this.loadQuestions()

        // Hide success message after 3 seconds
        setTimeout(() => {
          this.success = false
        }, 3000)
      } catch (err) {
        this.error = this.t('admin.questions.addError')
        console.error(err)
      }
    },
    async deleteQuestion(id) {
      if (!confirm(this.t('admin.questions.confirmDelete'))) {
        return
      }

      try {
        await axios.delete(API_URLS.quiz.delete(id))
        this.questions = this.questions.filter((q) => q.id !== id)
      } catch (err) {
        this.error = this.t('admin.questions.deleteError')
        console.error(err)
      }
    },
  },
}
</script>
