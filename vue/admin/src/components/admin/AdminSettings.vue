<template>
  <div class="min-h-screen bg-gray-50 flex">
    <aside class="w-64 bg-white border-r border-gray-200 flex-shrink-0">
      <div class="h-full flex flex-col">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Navigation</h2>
        </div>
        <nav class="flex-1 px-3 py-4 space-y-1">
          <router-link to="/dashboard" class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="$route.path === '/dashboard' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'">
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Dashboard
          </router-link>
          <router-link to="/users" class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="$route.path === '/users' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'">
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Users
          </router-link>
          <router-link to="/questions" class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="$route.path === '/questions' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'">
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Questions
          </router-link>
          <router-link to="/settings" class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="$route.path === '/settings' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'">
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Settings
          </router-link>
          <router-link to="/analytics" class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="$route.path === '/analytics' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'">
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Analytics
          </router-link>
        </nav>
      </div>
    </aside>
    <div class="flex-1 flex flex-col min-w-0">
      <div class="bg-white border-b border-gray-200 shadow-sm">
        <div class="px-6 py-4">
          <h1 class="text-2xl font-semibold text-gray-900">{{ t('admin.settings.title') }}</h1>
          <p class="mt-1 text-sm text-gray-500">{{ t('admin.settings.subtitle') }}</p>
        </div>
      </div>
      <div class="flex-1 px-6 py-8">
        <div v-if="loadError" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ t('admin.settings.loadError') }}
        </div>
        <div v-if="saveError" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ t('admin.settings.saveError') }}
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-2">{{ t('admin.settings.autoApproveUsers') }}</h2>
          <p class="text-sm text-gray-600 mb-4">{{ t('admin.settings.autoApproveUsersDesc') }}</p>
          <div class="flex items-center gap-4">
            <button
              type="button"
              role="switch"
              :aria-checked="autoApproveUsers"
              :disabled="loading"
              @click="toggleAutoApprove"
              class="relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="autoApproveUsers ? 'bg-blue-600' : 'bg-gray-200'"
            >
              <span
                class="pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="autoApproveUsers ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
            <span class="text-sm font-medium text-gray-700">
              {{ autoApproveUsers ? t('admin.settings.autoApproveOn') : t('admin.settings.autoApproveOff') }}
            </span>
            <span v-if="loading" class="text-sm text-gray-500">...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { settingsService } from '@/services/api'

export default {
  name: 'AdminSettings',
  setup() {
    const { t } = useI18n()
    const autoApproveUsers = ref(false)
    const loading = ref(false)
    const loadError = ref('')
    const saveError = ref('')

    async function loadSettings() {
      loadError.value = ''
      loading.value = true
      try {
        autoApproveUsers.value = await settingsService.getAutoApproveUsers()
      } catch (err) {
        loadError.value = t('admin.settings.loadError')
        console.error('Settings load error:', err)
      } finally {
        loading.value = false
      }
    }

    async function toggleAutoApprove() {
      saveError.value = ''
      loading.value = true
      const next = !autoApproveUsers.value
      try {
        const value = await settingsService.setAutoApproveUsers(next)
        autoApproveUsers.value = value
      } catch (err) {
        saveError.value = t('admin.settings.saveError')
        console.error('Settings save error:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(loadSettings)

    return {
      t,
      autoApproveUsers,
      loading,
      loadError,
      saveError,
      toggleAutoApprove
    }
  }
}
</script>

