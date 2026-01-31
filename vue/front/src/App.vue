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
    isAuthRoute() {
      return this.$route.path.startsWith('/auth/')
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
      if (this.isAuthRoute) {
        return 'min-h-screen w-full overflow-x-hidden bg-indigo-950' // Dark background for auth pages (login, signup) - no white margins
      }
      return 'min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'
    },
    mainClass() {
      if (this.isLandingPage) {
        return 'w-full h-full' // Full screen for landing page only
      }
      if (this.isAuthRoute) {
        return 'w-full min-h-screen' // Auth pages handle their own full-bleed layout
      }
      if (this.isUserRoute) {
        return '' // User routes handle their own layout
      }
      // Player routes: small top gap under navbar on mobile/tablet, normal spacing on larger screens
      return 'px-0 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-8 pb-0 sm:pb-8'
    }
  }
}
</script>
