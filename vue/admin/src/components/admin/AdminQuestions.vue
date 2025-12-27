<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar (same as dashboard) -->
    <aside class="w-64 bg-white border-r border-gray-200 flex-shrink-0">
      <div class="h-full flex flex-col">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Navigation</h2>
        </div>
        <nav class="flex-1 px-3 py-4 space-y-1">
          <router-link to="/admin/dashboard" class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="$route.path === '/admin/dashboard' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'">
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Dashboard
          </router-link>
          <router-link to="/admin/users" class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="$route.path === '/admin/users' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'">
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Users
          </router-link>
          <router-link to="/admin/questions" class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="$route.path === '/admin/questions' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'">
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Questions
          </router-link>
          <router-link to="/admin/settings" class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="$route.path === '/admin/settings' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'">
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Settings
          </router-link>
          <router-link to="/admin/analytics" class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="$route.path === '/admin/analytics' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'">
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Analytics
          </router-link>
        </nav>
      </div>
    </aside>
    <div class="flex-1 flex flex-col min-w-0">
      <div class="bg-white border-b border-gray-200 shadow-sm">
        <div class="px-6 py-4">
          <h1 class="text-2xl font-semibold text-gray-900">{{ t('admin.questions.title') }}</h1>
          <p class="mt-1 text-sm text-gray-500">{{ t('admin.questions.subtitle') }}</p>
        </div>
      </div>
      <div class="flex-1 px-6 py-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p class="text-gray-600">{{ t('admin.questions.comingSoon') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from '@/composables/useI18n'

export default {
  name: 'AdminQuestions',
  setup() {
    const { t } = useI18n()
    return { t }
  }
}
</script>

