<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Player Navbar -->
    <PlayerNavbar v-if="isPlayerRoute" />
    
    <!-- Admin Navbar -->
    <AdminNavbar v-else-if="isAdminRoute && isAdmin" />
    
    <!-- No navbar for admin login -->
    
    <main :class="mainClass">
      <router-view />
    </main>
  </div>
</template>

<script>
import PlayerNavbar from './components/player/PlayerNavbar.vue'
import AdminNavbar from './components/admin/AdminNavbar.vue'

export default {
  name: 'App',
  components: {
    PlayerNavbar,
    AdminNavbar
  },
  computed: {
    isAdmin() {
      return localStorage.getItem('admin') === '1'
    },
    isPlayerRoute() {
      return this.$route.path.startsWith('/player') || this.$route.path === '/'
    },
    isAdminRoute() {
      return this.$route.path.startsWith('/admin')
    },
    mainClass() {
      if (this.isAdminRoute && this.isAdmin) {
        return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
      }
      return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
    }
  }
}
</script>
