<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Admin Navbar -->
    <AdminNavbar v-if="isAdmin" />
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
  </div>
</template>

<script>
import AdminNavbar from './components/admin/AdminNavbar.vue'

export default {
  name: 'App',
  components: {
    AdminNavbar
  },
  computed: {
    isAdmin() {
      return localStorage.getItem('admin') === '1'
    }
  }
}
</script>

