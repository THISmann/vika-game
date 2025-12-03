<template>
  <nav class="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-lg border-b border-purple-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-1">
          <router-link
            to="/player/register"
            class="text-2xl font-bold text-white hover:text-yellow-300 transition-colors"
          >
            🎮 Vika-Game
          </router-link>
        </div>

        <div class="flex items-center space-x-4">
          <router-link
            to="/player/register"
            class="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-all transform hover:scale-105"
            active-class="bg-white/30 font-bold"
          >
            S'inscrire
          </router-link>
          <router-link
            to="/player/quiz"
            class="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-all transform hover:scale-105"
            active-class="bg-white/30 font-bold"
          >
            🎯 Jouer
          </router-link>
          <router-link
            to="/player/leaderboard"
            class="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-all transform hover:scale-105"
            active-class="bg-white/30 font-bold"
          >
            🏆 Classement
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'PlayerNavbar'
}
</script>



