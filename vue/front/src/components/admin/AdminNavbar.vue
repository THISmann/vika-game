<template>
  <nav class="bg-gradient-to-r from-purple-700 to-indigo-800 shadow-lg border-b border-purple-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-1">
          <router-link
            to="/admin/dashboard"
            class="text-2xl font-bold text-white hover:text-purple-200 transition-colors"
          >
            🎯 Admin Panel
          </router-link>
        </div>

        <div class="flex items-center space-x-4">
          <router-link
            to="/admin/dashboard"
            class="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-all"
            active-class="bg-white/30 font-bold"
          >
            Dashboard
          </router-link>
          <router-link
            to="/admin/questions"
            class="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-all"
            active-class="bg-white/30 font-bold"
          >
            Questions
          </router-link>
          <button
            @click="logout"
            class="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-red-600/30 transition-all"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'AdminNavbar',
  methods: {
    logout() {
      localStorage.removeItem('admin')
      this.$router.push('/admin/login')
    }
  }
}
</script>



