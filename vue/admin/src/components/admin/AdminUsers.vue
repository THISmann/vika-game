<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
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
          <router-link to="/admin/analytics" class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="$route.path === '/admin/analytics' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'">
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Analytics
          </router-link>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <div class="bg-white border-b border-gray-200 shadow-sm">
        <div class="px-6 py-4">
          <h1 class="text-2xl font-semibold text-gray-900">{{ t('admin.users.title') }}</h1>
          <p class="mt-1 text-sm text-gray-500">{{ t('admin.users.subtitle') }}</p>
        </div>
      </div>

      <div class="flex-1 px-6 py-8 overflow-y-auto">
        <!-- Filters and Search -->
        <div class="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Search -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('admin.users.searchPlaceholder') }}</label>
              <input
                v-model="filters.search"
                @input="adminStore.updateUsersFilters({ search: filters.search })"
                type="text"
                :placeholder="t('admin.users.searchPlaceholder')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('admin.users.status') }}</label>
              <select
                v-model="filters.status"
                @change="adminStore.updateUsersFilters({ status: filters.status })"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{{ t('admin.users.allStatus') }}</option>
                <option value="pending">{{ t('admin.users.pending') }}</option>
                <option value="approved">{{ t('admin.users.approved') }}</option>
                <option value="rejected">{{ t('admin.users.rejected') }}</option>
                <option value="blocked">{{ t('admin.users.blocked') }}</option>
              </select>
            </div>

            <!-- Role Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                v-model="filters.role"
                @change="adminStore.updateUsersFilters({ role: filters.role })"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
            <p class="mt-4 text-sm text-gray-600">{{ t('admin.users.loading') }}</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!loading && !error && users.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ filters.search || filters.status || filters.role 
              ? 'Try adjusting your filters to see more results.' 
              : 'There are no users (with role "user" or "admin") in the system yet. Users will appear here once they register.' }}
          </p>
        </div>

        <!-- Users Table -->
        <div v-if="!loading && !error && users.length > 0" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('admin.users.name') }}</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('admin.users.email') }}</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('admin.users.status') }}</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('admin.users.createdAt') }}</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('admin.users.actions') }}</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                    <div class="text-sm text-gray-500">{{ user.id }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ user.email || '-' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center space-x-2">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="{
                          'bg-blue-100 text-blue-800': user.role === 'user',
                          'bg-purple-100 text-purple-800': user.role === 'admin',
                          'bg-gray-100 text-gray-800': !user.role || user.role === 'player'
                        }">
                        {{ user.role || 'player' }}
                      </span>
                      <select
                        @change="changeUserRole(user.id, $event.target.value, $event)"
                        :value="user.role || 'player'"
                        class="text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Change role"
                      >
                        <option value="player">Player</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="{
                        'bg-yellow-100 text-yellow-800': user.status === 'pending',
                        'bg-green-100 text-green-800': user.status === 'approved',
                        'bg-red-100 text-red-800': user.status === 'rejected',
                        'bg-gray-100 text-gray-800': user.status === 'blocked'
                      }">
                      {{ user.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(user.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-2">
                      <button
                        @click="viewActivities(user)"
                        class="text-blue-600 hover:text-blue-900"
                        title="View Activities"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        v-if="user.status === 'pending'"
                        @click="approveUser(user.id)"
                        class="text-green-600 hover:text-green-900"
                        title="Approve"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        v-if="user.status === 'approved'"
                        @click="blockUser(user.id)"
                        class="text-red-600 hover:text-red-900"
                        title="Block"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                      <button
                        v-if="user.status === 'blocked'"
                        @click="unblockUser(user.id)"
                        class="text-green-600 hover:text-green-900"
                        title="Unblock"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <button
                        v-if="user.status === 'pending'"
                        @click="rejectUser(user.id)"
                        class="text-red-600 hover:text-red-900"
                        title="Reject"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="adminStore.usersPagination && adminStore.usersPagination.pages > 1" class="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                @click="changePage(adminStore.usersPagination.page - 1)"
                :disabled="adminStore.usersPagination.page === 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {{ t('admin.users.previous') }}
              </button>
              <button
                    @click="changePage(adminStore.usersPagination.page + 1)"
                    :disabled="adminStore.usersPagination.page === adminStore.usersPagination.pages"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {{ t('admin.users.next') }}
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing <span class="font-medium">{{ (adminStore.usersPagination.page - 1) * adminStore.usersPagination.limit + 1 }}</span>
                  to <span class="font-medium">{{ Math.min(adminStore.usersPagination.page * adminStore.usersPagination.limit, adminStore.usersPagination.total) }}</span>
                  of <span class="font-medium">{{ adminStore.usersPagination.total }}</span> results
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    @click="changePage(adminStore.usersPagination.page - 1)"
                    :disabled="adminStore.usersPagination.page === 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {{ t('admin.users.previous') }}
                  </button>
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="changePage(page)"
                    :class="[
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                      page === adminStore.usersPagination.page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    ]"
                  >
                    {{ page }}
                  </button>
                  <button
                    @click="changePage(adminStore.usersPagination.page + 1)"
                    :disabled="adminStore.usersPagination.page === adminStore.usersPagination.pages"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {{ t('admin.users.next') }}
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="showConfirmModal = false">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">{{ confirmModal.title }}</h3>
          <button @click="showConfirmModal = false" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="mb-4">
          <p class="text-sm text-gray-500">{{ confirmModal.message }}</p>
          <div v-if="confirmModal.needReason" class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Reason (optional)</label>
            <textarea
              v-model="confirmModal.reason"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter reason..."
            ></textarea>
          </div>
        </div>
        <div class="flex items-center justify-end space-x-3">
          <button
            @click="showConfirmModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {{ t('admin.users.cancel') }}
          </button>
          <button
            @click="executeConfirmAction"
            :class="[
              'px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
              confirmModal.type === 'approve' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
              confirmModal.type === 'reject' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
              confirmModal.type === 'block' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
              'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            ]"
          >
            {{ confirmModal.confirmText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Activities Modal -->
    <div v-if="showActivitiesModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="showActivitiesModal = false">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">User Activities: {{ selectedUser?.name }}</h3>
          <button @click="showActivitiesModal = false" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="activitiesLoading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
        </div>
        <div v-else-if="activities.length === 0" class="text-center py-8 text-gray-500">
          No activities found
        </div>
        <div v-else class="space-y-3 max-h-96 overflow-y-auto">
          <div v-for="(activity, index) in activities" :key="index" class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div class="flex-shrink-0">
              <div class="h-8 w-8 rounded-full flex items-center justify-center"
                :class="{
                  'bg-blue-100 text-blue-600': activity.type === 'registration',
                  'bg-green-100 text-green-600': activity.type === 'login',
                  'bg-yellow-100 text-yellow-600': activity.type === 'status_change'
                }">
                <svg v-if="activity.type === 'registration'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <svg v-else-if="activity.type === 'login'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">{{ activity.description }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(activity.date) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useI18n } from '@/composables/useI18n'
import apiClient from '@/services/api'
import { API_URLS } from '@/config/api'

export default {
  name: 'AdminUsers',
  setup() {
    const adminStore = useAdminStore()
    const { t } = useI18n()
    
    // Initialize socket if not already done
    onMounted(() => {
      if (!adminStore.isConnected) {
        adminStore.initSocket()
      }
      adminStore.loadUsers()
    })
    
    // Watch for filter changes
    watch(() => adminStore.usersFilters, () => {
      adminStore.loadUsers(1)
    }, { deep: true })
    
    const users = computed(() => adminStore.users)
    const loading = computed(() => adminStore.loadingUsers)
    const error = computed(() => adminStore.usersError)
    const pagination = computed(() => adminStore.usersPagination)
    const filters = computed({
      get: () => adminStore.usersFilters,
      set: (value) => adminStore.updateUsersFilters(value)
    })
    
    const showActivitiesModal = ref(false)
    const selectedUser = ref(null)
    const activities = ref([])
    const activitiesLoading = ref(false)
    
    // Confirmation modal state
    const showConfirmModal = ref(false)
    const confirmModal = ref({
      title: '',
      message: '',
      type: '', // 'approve', 'reject', 'block', 'unblock'
      confirmText: 'Confirm',
      needReason: false,
      reason: '',
      action: null,
      userId: null
    })

    const loadUsers = async () => {
      await adminStore.loadUsers()
    }

    const changePage = (page) => {
      adminStore.loadUsers(page)
    }

    const visiblePages = computed(() => {
      if (!adminStore.usersPagination) return []
      const pages = []
      const total = adminStore.usersPagination.pages
      const current = adminStore.usersPagination.page
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i)
      } else {
        if (current <= 3) {
          for (let i = 1; i <= 5; i++) pages.push(i)
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 2) {
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) pages.push(i)
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) pages.push(i)
          pages.push('...')
          pages.push(total)
        }
      }
      return pages.filter(p => p !== '...' || pages.indexOf(p) === 0 || pages.indexOf(p) === pages.length - 1)
    })

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const showConfirm = (type, userId, userName) => {
      const configs = {
        approve: {
          title: 'Approve User',
          message: `Are you sure you want to approve "${userName}"? This will allow them to access the platform.`,
          type: 'approve',
          confirmText: 'Approve',
          needReason: false
        },
        reject: {
          title: 'Reject User',
          message: `Are you sure you want to reject "${userName}"? This will prevent them from accessing the platform.`,
          type: 'reject',
          confirmText: 'Reject',
          needReason: true
        },
        block: {
          title: 'Block User',
          message: `Are you sure you want to block "${userName}"? This will prevent them from accessing the platform.`,
          type: 'block',
          confirmText: 'Block',
          needReason: false
        },
        unblock: {
          title: 'Unblock User',
          message: `Are you sure you want to unblock "${userName}"? This will restore their access to the platform.`,
          type: 'unblock',
          confirmText: 'Unblock',
          needReason: false
        }
      }
      
      const config = configs[type]
      if (!config) return
      
      confirmModal.value = {
        ...config,
        reason: '',
        userId: userId,
        action: type
      }
      showConfirmModal.value = true
    }

    const executeConfirmAction = async () => {
      if (!confirmModal.value.userId) return
      
      const { userId, action, reason } = confirmModal.value
      showConfirmModal.value = false
      
      try {
        switch (action) {
          case 'approve':
            await apiClient.put(API_URLS.auth.approveUser(userId))
            break
          case 'reject':
            await apiClient.put(API_URLS.auth.rejectUser(userId), { reason: reason || '' })
            break
          case 'block':
            await apiClient.put(API_URLS.auth.blockUser(userId))
            break
          case 'unblock':
            await apiClient.put(API_URLS.auth.unblockUser(userId))
            break
        }
        await adminStore.loadUsers()
        await adminStore.loadUserStats()
      } catch (err) {
        console.error(`Error ${action}ing user:`, err)
        alert(err.response?.data?.error || `Failed to ${action} user`)
      }
    }

    const approveUser = (userId) => {
      const user = adminStore.users.find(u => u.id === userId)
      showConfirm('approve', userId, user?.name || 'this user')
    }

    const rejectUser = (userId) => {
      const user = adminStore.users.find(u => u.id === userId)
      showConfirm('reject', userId, user?.name || 'this user')
    }

    const blockUser = (userId) => {
      const user = adminStore.users.find(u => u.id === userId)
      showConfirm('block', userId, user?.name || 'this user')
    }

    const unblockUser = (userId) => {
      const user = adminStore.users.find(u => u.id === userId)
      showConfirm('unblock', userId, user?.name || 'this user')
    }

    const changeUserRole = async (userId, newRole, event) => {
      const user = adminStore.users.find(u => u.id === userId)
      if (!user) return

      const oldRole = user.role || 'player'
      
      // Confirmation
      if (!confirm(`Are you sure you want to change "${user.name}" role from "${oldRole}" to "${newRole}"?`)) {
        // Reset select to old value
        if (event?.target) {
          event.target.value = oldRole
        }
        return
      }

      try {
        await apiClient.put(API_URLS.auth.updateUserRole(userId), { role: newRole })
        await adminStore.loadUsers()
      } catch (err) {
        console.error('Error changing user role:', err)
        alert(err.response?.data?.error || 'Failed to change user role')
        // Reset select to old value
        if (event?.target) {
          event.target.value = oldRole
        }
      }
    }

    const viewActivities = async (user) => {
      selectedUser.value = user
      showActivitiesModal.value = true
      activitiesLoading.value = true
      activities.value = []

      try {
        const res = await apiClient.get(API_URLS.auth.getUserActivities(user.id))
        activities.value = res.data.activities || []
      } catch (err) {
        console.error('Error loading activities:', err)
        alert(err.response?.data?.error || 'Failed to load activities')
      } finally {
        activitiesLoading.value = false
      }
    }

    return {
      adminStore,
      t,
      users,
      loading,
      error,
      pagination,
      filters,
      showActivitiesModal,
      selectedUser,
      activities,
      activitiesLoading,
      showConfirmModal,
      confirmModal,
      loadUsers,
      changePage,
      visiblePages,
      formatDate,
      approveUser,
      rejectUser,
      blockUser,
      unblockUser,
      changeUserRole,
      viewActivities,
      executeConfirmAction
    }
  }
}
</script>
