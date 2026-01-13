<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Admin Navbar (only for login page) -->
    <AdminNavbar v-if="isAdmin && $route.path !== '/admin/login'" />
    
    <main>
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

