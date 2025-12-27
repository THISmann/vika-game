<template>
  <div class="min-h-screen bg-gray-50 flex">
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
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">{{ t('admin.analytics.title') }}</h1>
              <p class="mt-1 text-sm text-gray-500">{{ t('admin.analytics.subtitle') }}</p>
            </div>
            <div class="flex items-center space-x-3">
              <!-- Period Selector -->
              <select
                v-model="selectedPeriod"
                @change="loadAnalytics"
                class="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">{{ t('admin.analytics.period.7') }}</option>
                <option value="30">{{ t('admin.analytics.period.30') }}</option>
                <option value="90">{{ t('admin.analytics.period.90') }}</option>
                <option value="365">{{ t('admin.analytics.period.365') }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 px-6 py-8 overflow-y-auto">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
            <p class="mt-4 text-sm text-gray-600">{{ t('admin.analytics.loading') }}</p>
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

        <!-- Analytics Content -->
        <div v-if="!loading && !error" class="space-y-6">
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5">
                  <dt class="text-sm font-medium text-gray-500 truncate">{{ t('admin.analytics.totalPlayers') }}</dt>
                  <dd class="text-2xl font-semibold text-gray-900">{{ summary.totalPlayers || 0 }}</dd>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5">
                  <dt class="text-sm font-medium text-gray-500 truncate">{{ t('admin.analytics.newUsers') }}</dt>
                  <dd class="text-2xl font-semibold text-gray-900">{{ summary.newUsers }}</dd>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5">
                  <dt class="text-sm font-medium text-gray-500 truncate">{{ t('admin.analytics.totalVisits') }}</dt>
                  <dd class="text-2xl font-semibold text-gray-900">{{ summary.totalVisits }}</dd>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5">
                  <dt class="text-sm font-medium text-gray-500 truncate">{{ t('admin.analytics.activeUsers') }}</dt>
                  <dd class="text-2xl font-semibold text-gray-900">{{ summary.activeUsers }}</dd>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- User Growth Chart -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">{{ t('admin.analytics.userGrowth') }}</h3>
              </div>
              <div class="h-80">
                <LineChart
                  v-if="userGrowthData"
                  :key="`userGrowth-${selectedPeriod}`"
                  :data="userGrowthData"
                  :options="chartOptions"
                />
              </div>
            </div>

            <!-- Site Visits Chart -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">{{ t('admin.analytics.siteVisits') }}</h3>
              </div>
              <div class="h-80">
                <BarChart
                  v-if="visitsData"
                  :key="`visits-${selectedPeriod}`"
                  :data="visitsData"
                  :options="chartOptions"
                />
              </div>
            </div>
          </div>

          <!-- Additional Charts -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- User Registrations by Period -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">{{ t('admin.analytics.userRegistrations') }}</h3>
              </div>
              <div class="h-80">
                <BarChart
                  v-if="registrationsData"
                  :key="`registrations-${selectedPeriod}`"
                  :data="registrationsData"
                  :options="chartOptions"
                />
              </div>
            </div>

            <!-- Daily Active Users -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">{{ t('admin.analytics.dailyActiveUsers') }}</h3>
              </div>
              <div class="h-80">
                <LineChart
                  v-if="dailyActiveUsersData"
                  :key="`dailyActive-${selectedPeriod}`"
                  :data="dailyActiveUsersData"
                  :options="chartOptions"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line as LineChart, Bar as BarChart } from 'vue-chartjs'
import { useAdminStore } from '@/stores/admin'
import { useI18n } from '@/composables/useI18n'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default {
  name: 'AdminAnalytics',
  components: {
    LineChart,
    BarChart
  },
  setup() {
    const adminStore = useAdminStore()
    const { t } = useI18n()
    return { adminStore, t }
  },
  data() {
    return {
      selectedPeriod: 30,
      userGrowthData: null,
      visitsData: null,
      registrationsData: null,
      dailyActiveUsersData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    }
  },
  async mounted() {
    if (!this.adminStore.isConnected) {
      this.adminStore.initSocket()
    }
    await this.adminStore.loadAnalytics(this.selectedPeriod)
    this.updateChartData()
  },
  methods: {
    async loadAnalytics() {
      await this.adminStore.loadAnalytics(this.selectedPeriod)
      this.updateChartData()
    },
    updateChartData() {
      const analyticsData = this.adminStore.analytics
      if (!analyticsData || !analyticsData.charts) {
        // Reset charts if no data
        this.userGrowthData = null
        this.visitsData = null
        this.registrationsData = null
        this.dailyActiveUsersData = null
        return
      }

      const charts = analyticsData.charts

      // Prepare chart data
      this.userGrowthData = {
        labels: charts.labels || [],
        datasets: [{
          label: 'Total Users',
          data: charts.userGrowth || [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      }

      this.visitsData = {
        labels: charts.labels || [],
        datasets: [{
          label: 'Visits',
          data: charts.visits || [],
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderColor: 'rgb(139, 92, 246)',
          borderWidth: 1
        }]
      }

      this.registrationsData = {
        labels: charts.labels || [],
        datasets: [{
          label: 'New Registrations',
          data: charts.registrations || [],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1
        }]
      }

      this.dailyActiveUsersData = {
        labels: charts.labels || [],
        datasets: [{
          label: 'Active Users',
          data: charts.activeUsers || [],
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.4,
          fill: true
        }]
      }
    }
  },
  computed: {
    loading() {
      return this.adminStore.loadingAnalytics
    },
    error() {
      return this.adminStore.analyticsError
    },
    summary() {
      return this.adminStore.analytics?.summary || {
        totalUsers: 0,
        totalPlayers: 0,
        newUsers: 0,
        totalVisits: 0,
        activeUsers: 0
      }
    }
  },
  watch: {
    selectedPeriod(newPeriod) {
      this.loadAnalytics()
    },
    // Watch for changes in analytics data from store
    'adminStore.analytics': {
      handler() {
        this.updateChartData()
      },
      deep: true
    }
  }
}
</script>
