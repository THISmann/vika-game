<template>
  <div class="min-h-[60vh] flex items-center justify-center">
    <div
      class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
    >
      <div class="text-center">
        <div
          class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4"
        >
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 class="text-3xl font-extrabold text-gray-900 mb-2">Rejoindre une partie</h2>
        <p class="text-sm text-gray-600">Entrez le code de la partie et votre nom</p>
      </div>

      <form @submit.prevent="registerPlayer" class="mt-8 space-y-6">
        <!-- Code de la partie -->
        <div>
          <label for="game-code" class="block text-sm font-medium text-gray-700 mb-2">
            Code de la partie
          </label>
          <input
            id="game-code"
            v-model="gameCode"
            type="text"
            required
            maxlength="6"
            class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl font-mono tracking-widest uppercase"
            placeholder="ABC123"
            @input="gameCode = gameCode.toUpperCase()"
          />
          <p class="mt-2 text-xs text-gray-500">
            Demandez le code à l'administrateur de la partie
          </p>
        </div>

        <!-- Nom du joueur -->
        <div>
          <label for="player-name" class="block text-sm font-medium text-gray-700 mb-2">
            Nom du joueur
          </label>
          <input
            id="player-name"
            v-model="name"
            type="text"
            required
            class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Entrez votre nom"
            :disabled="verifyingCode || codeVerified"
          />
        </div>

        <!-- Étape 1: Vérification du code -->
        <div v-if="!codeVerified" class="space-y-4">
          <button
            type="button"
            @click="verifyGameCode"
            :disabled="!gameCode || gameCode.length < 3 || verifyingCode || loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="verifyingCode" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            {{ verifyingCode ? 'Vérification...' : 'Vérifier le code' }}
          </button>
        </div>

        <!-- Étape 2: Inscription -->
        <div v-else class="space-y-4">
          <div
            class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
          >
            ✅ Code valide ! Vous pouvez maintenant vous inscrire
          </div>

          <button
            type="submit"
            :disabled="!name || loading || gameStarted"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            {{ loading ? 'Inscription en cours...' : gameStarted ? 'Le jeu a déjà commencé' : 'S\'inscrire et rejoindre' }}
          </button>
        </div>

        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ error }}
        </div>

        <div
          v-if="success"
          class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ success }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { API_URLS } from '@/config/api'

export default {
  data() {
    return {
      gameCode: '',
      name: '',
      codeVerified: false,
      verifyingCode: false,
      gameStarted: false,
      loading: false,
      error: '',
      success: '',
    }
  },
  methods: {
    async verifyGameCode() {
      if (!this.gameCode || this.gameCode.length < 3) {
        this.error = 'Veuillez entrer un code valide (minimum 3 caractères)'
        return
      }

      this.verifyingCode = true
      this.error = ''

      try {
        const res = await axios.post(API_URLS.game.verifyCode, {
          code: this.gameCode.toUpperCase()
        })

        if (res.data.valid) {
          this.codeVerified = true
          this.gameStarted = res.data.isStarted
          if (this.gameStarted) {
            this.error = 'Le jeu a déjà commencé. Vous ne pouvez plus vous connecter.'
          }
        } else {
          this.error = 'Code invalide. Vérifiez le code et réessayez.'
        }
      } catch (err) {
        this.error = err.response?.data?.error || 'Erreur lors de la vérification du code'
      } finally {
        this.verifyingCode = false
      }
    },
    async registerPlayer() {
      if (!this.name) {
        this.error = 'Veuillez entrer un nom'
        return
      }

      if (!this.codeVerified) {
        this.error = 'Veuillez d\'abord vérifier le code de la partie'
        return
      }

      if (this.gameStarted) {
        this.error = 'Le jeu a déjà commencé. Vous ne pouvez plus vous connecter.'
        return
      }

      this.loading = true
      this.error = ''
      this.success = ''

      try {
        const res = await axios.post(API_URLS.auth.register, {
          name: this.name,
        })

        this.success = `Joueur "${this.name}" enregistré avec succès !`
        localStorage.setItem('playerId', res.data.id)
        localStorage.setItem('playerName', res.data.name)
        localStorage.setItem('gameCode', this.gameCode.toUpperCase())

        setTimeout(() => {
          this.$router.push('/player/quiz')
        }, 1500)
      } catch (err) {
        if (err.response && err.response.status === 409) {
          this.error = 'Ce nom est déjà pris, choisissez un autre nom'
        } else {
          this.error = 'Erreur serveur. Veuillez réessayer.'
        }
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
