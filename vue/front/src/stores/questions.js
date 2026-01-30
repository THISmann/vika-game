import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API_URLS } from '@/config/api'
import apiClient, { quizService } from '@/services/api'

export const useQuestionsStore = defineStore('questions', () => {
  // State
  const questions = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const questionsCount = computed(() => questions.value.length)
  const hasQuestions = computed(() => questions.value.length > 0)

  // Actions
  async function loadQuestions() {
    loading.value = true
    error.value = null
    
    try {
      const res = await apiClient.get(API_URLS.quiz.userQuestions)
      questions.value = res.data || []
      // console.log('✅ Questions loaded:', questions.value.length, 'questions')
    } catch (err) {
      // console.error('Error loading questions:', err)
      error.value = err.response?.data?.error || err.message || 'Failed to load questions'
      questions.value = []
    } finally {
      loading.value = false
    }
  }

  async function createQuestion(questionData) {
    loading.value = true
    error.value = null
    
    try {
      const newQuestion = await quizService.createQuestion(questionData)
      // Reload questions to get the updated list
      await loadQuestions()
      return newQuestion
    } catch (err) {
      // console.error('Error creating question:', err)
      error.value = err.response?.data?.error || err.message || 'Failed to create question'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateQuestion(id, questionData) {
    loading.value = true
    error.value = null
    
    try {
      const updatedQuestion = await quizService.updateQuestion(id, questionData)
      // Reload questions to get the updated list
      await loadQuestions()
      return updatedQuestion
    } catch (err) {
      // console.error('Error updating question:', err)
      error.value = err.response?.data?.error || err.message || 'Failed to update question'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteQuestion(id) {
    loading.value = true
    error.value = null
    
    try {
      await quizService.deleteQuestion(id)
      // Remove from local state immediately for better UX
      questions.value = questions.value.filter(q => q.id !== id)
      // Also reload to ensure consistency
      await loadQuestions()
    } catch (err) {
      // console.error('Error deleting question:', err)
      error.value = err.response?.data?.error || err.message || 'Failed to delete question'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    questions,
    loading,
    error,
    
    // Getters
    questionsCount,
    hasQuestions,
    
    // Actions
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    clearError
  }
})

