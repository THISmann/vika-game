<template>
  <div id="app" :class="appClass">
    <!-- User Navbar -->
    <UserNavbar v-if="isUserRoute" />
    
    <!-- Player Navbar -->
    <PlayerNavbar v-if="isPlayerRoute && !isLandingPage" />
    
    <!-- No navbar for landing page -->
    
    <main :class="mainClass">
      <router-view />
    </main>
  </div>
</template>

<script>
import PlayerNavbar from './components/player/PlayerNavbar.vue'
import UserNavbar from './components/user/AdminNavbar.vue'

export default {
  name: 'App',
  components: {
    PlayerNavbar,
    UserNavbar
  },
  computed: {
    isLandingPage() {
      return this.$route.path === '/'
    },
    isPlayerRoute() {
      return this.$route.path.startsWith('/player') && this.$route.path !== '/'
    },
    isUserRoute() {
      return this.$route.path.startsWith('/user') && !this.$route.path.startsWith('/user/login')
    },
    appClass() {
      if (this.isLandingPage) {
        return 'w-full h-screen overflow-hidden' // Full screen for landing page only
      }
      return 'min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'
    },
    mainClass() {
      if (this.isLandingPage) {
        return 'w-full h-full' // Full screen for landing page only
      }
      if (this.isUserRoute) {
        return '' // User routes handle their own layout
      }
      return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
    }
  }
}
</script>
