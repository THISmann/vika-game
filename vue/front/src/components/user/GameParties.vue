<template>
  <div class="flex min-h-screen">
    <!-- Mobile Sidebar Toggle -->
    <MobileSidebarToggle />
    
    <!-- Sidebar -->
    <UserSidebar />
    
    <!-- Main Content -->
    <div class="flex-1 ml-0 md:ml-64 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 transition-all duration-300 mt-16 pt-6">
      <!-- Header -->
      <div class="mb-6 sm:mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {{ t('parties.title') || 'Mes Parties' }}
            </h1>
            <p class="text-gray-600">
              {{ t('parties.subtitle') || 'Créez et gérez vos parties de jeu' }}
            </p>
          </div>
          <button
            @click="showCreateModal = true"
            class="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>{{ t('parties.create') || 'Créer une partie' }}</span>
          </button>
        </div>
      </div>

      <!-- Parties List -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 mb-4"></div>
        <p class="text-gray-600">{{ t('parties.loading') || 'Chargement...' }}</p>
      </div>

      <div v-else-if="parties.length === 0" class="text-center py-12 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
        <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-gray-600 mb-4">{{ t('parties.noParties') || 'Aucune partie créée' }}</p>
        <button
          @click="showCreateModal = true"
          class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          {{ t('parties.createFirst') || 'Créer votre première partie' }}
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div
          v-for="party in parties"
          :key="party.id"
          class="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl transition-all transform hover:scale-105"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-1">{{ party.name }}</h3>
              <p v-if="party.description" class="text-sm text-gray-600 mb-2">{{ party.description }}</p>
            </div>
            <span
              class="px-3 py-1 text-xs font-semibold rounded-full"
              :class="{
                'bg-gray-100 text-gray-800': party.status === 'draft',
                'bg-blue-100 text-blue-800': party.status === 'scheduled',
                'bg-green-100 text-green-800': party.status === 'active',
                'bg-purple-100 text-purple-800': party.status === 'completed',
                'bg-red-100 text-red-800': party.status === 'cancelled'
              }"
            >
              {{ getStatusLabel(party.status) }}
            </span>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex items-center text-sm text-gray-600">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ party.questionIds?.length || 0 }} {{ t('parties.questions') || 'questions' }}
            </div>
            <div v-if="party.gameCode" class="flex items-center text-sm text-gray-600">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Code: <span class="font-mono font-bold">{{ party.gameCode }}</span>
            </div>
            <div v-if="party.scheduledStartTime" class="flex items-center text-sm text-gray-600">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ formatDate(party.scheduledStartTime) }}
            </div>
            <div v-if="party.status === 'active' && party.gameCode && playerCounts[party.id] !== undefined" class="flex items-center text-sm text-gray-600">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {{ playerCounts[party.id] }} {{ playerCounts[party.id] === 1 ? (t('parties.player') || 'joueur') : (t('parties.players') || 'joueurs') }}
            </div>
          </div>

          <!-- Actions buttons with icons only -->
          <div class="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200">
            <button
              @click="viewParty(party)"
              class="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
              :title="t('parties.view') || 'Voir'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              @click="editParty(party)"
              class="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
              :title="t('parties.edit') || 'Modifier'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              v-if="party.status === 'active' || party.status === 'scheduled'"
              @click="deactivateParty(party.id)"
              class="p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-all"
              :title="t('parties.deactivate') || 'Désactiver'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </button>
            <button
              @click="deleteParty(party.id)"
              class="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
              :title="t('parties.delete') || 'Supprimer'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- View Party Modal -->
      <div
        v-if="viewingParty"
        class="fixed top-16 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[70] p-4"
        :class="sidebarCollapsed ? 'left-16 md:left-20' : 'left-0 md:left-64'"
        @click.self="closeViewModal"
      >
        <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6 sm:p-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
                {{ t('parties.viewParty') || 'Détails de la partie' }}
              </h2>
              <button
                @click="closeViewModal"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div v-if="partyDetailsLoading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 mb-4"></div>
              <p class="text-gray-600">{{ t('parties.loadingDetails') || 'Chargement des détails...' }}</p>
            </div>

            <div v-else-if="partyDetails" class="space-y-4">
              <div>
                <p class="text-sm font-medium text-gray-700">{{ t('parties.name') || 'Nom' }}</p>
                <p class="text-lg text-gray-900 font-semibold">{{ partyDetails.name }}</p>
              </div>
              <div v-if="partyDetails.description">
                <p class="text-sm font-medium text-gray-700">{{ t('parties.description') || 'Description' }}</p>
                <p class="text-gray-800">{{ partyDetails.description }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">{{ t('parties.status') || 'Statut' }}</p>
                <p class="text-gray-800">{{ getStatusLabel(partyDetails.status) }}</p>
              </div>
              <div v-if="partyDetails.gameCode">
                <p class="text-sm font-medium text-gray-700">{{ t('parties.gameCode') || 'Code de jeu' }}</p>
                <p class="text-lg text-gray-900 font-mono font-bold">{{ partyDetails.gameCode }}</p>
              </div>
              <div v-if="partyDetails.scheduledStartTime">
                <p class="text-sm font-medium text-gray-700">{{ t('parties.scheduledTime') || 'Heure programmée' }}</p>
                <p class="text-gray-800">{{ formatDate(partyDetails.scheduledStartTime) }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">{{ t('parties.questionDuration') || 'Durée par question' }}</p>
                <p class="text-gray-800">{{ (partyDetails.questionDuration || 30000) / 1000 }} {{ t('parties.seconds') || 'secondes' }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">{{ t('parties.totalQuestions') || 'Nombre de questions' }}</p>
                <p class="text-gray-800">{{ partyDetails.questionIds?.length || 0 }}</p>
              </div>
              <div v-if="connectedPlayersCount !== null">
                <p class="text-sm font-medium text-gray-700">{{ t('parties.connectedPlayers') || 'Joueurs connectés' }}</p>
                <p class="text-lg text-gray-900 font-semibold">{{ connectedPlayersCount }}</p>
              </div>
              <div v-if="partyDetails.imageUrl">
                <p class="text-sm font-medium text-gray-700">{{ t('parties.image') || 'Image' }}</p>
                <img :src="getFileUrl(partyDetails.imageUrl)" alt="Party Image" class="mt-2 max-w-full h-auto rounded-lg" />
              </div>
              <div v-if="partyDetails.audioUrl">
                <p class="text-sm font-medium text-gray-700">{{ t('parties.audio') || 'Audio' }}</p>
                <audio :src="getFileUrl(partyDetails.audioUrl)" controls class="mt-2 w-full"></audio>
              </div>
            </div>
            <div v-else class="text-center py-8 text-red-600">
              <p>{{ t('parties.errorLoadingDetails') || 'Erreur lors du chargement des détails de la partie.' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div
        v-if="showCreateModal || editingParty"
        class="fixed top-16 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[70] p-4"
        :class="sidebarCollapsed ? 'left-16 md:left-20' : 'left-0 md:left-64'"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6 sm:p-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
                {{ editingParty ? (t('parties.edit') || 'Modifier la partie') : (t('parties.create') || 'Créer une partie') }}
              </h2>
              <button
                @click="closeModal"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="saveParty" class="space-y-6">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('parties.name') || 'Nom de la partie' }} *
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500"
                  :placeholder="t('parties.namePlaceholder') || 'Ex: Quiz de Noël 2024'"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('parties.description') || 'Description' }}
                </label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500"
                  :placeholder="t('parties.descriptionPlaceholder') || 'Description de la partie...'"
                ></textarea>
              </div>

              <!-- Image Upload -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('parties.image') || 'Image (optionnel)' }}
                </label>
                <div class="flex items-center space-x-4">
                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/*"
                    @change="handleImageUpload"
                    class="hidden"
                  />
                  <button
                    type="button"
                    @click="imageInput?.click()"
                    class="px-4 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium"
                  >
                    {{ form.imageUrl ? t('parties.changeImage') || 'Changer l\'image' : t('parties.selectImage') || 'Sélectionner une image' }}
                  </button>
                  <div v-if="form.imageUrl" class="flex-1">
                    <img :src="getFileUrl(form.imageUrl)" alt="Preview" class="h-20 w-20 object-cover rounded-lg" />
                    <button
                      type="button"
                      @click="form.imageUrl = null"
                      class="mt-2 text-xs text-red-600 hover:text-red-800"
                    >
                      {{ t('parties.removeImage') || 'Supprimer' }}
                    </button>
                  </div>
                  <div v-if="uploadingImage" class="text-sm text-gray-600">
                    {{ t('parties.uploading') || 'Upload en cours...' }}
                  </div>
                </div>
              </div>

              <!-- Audio Upload -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('parties.audio') || 'Audio (optionnel)' }}
                </label>
                <div class="flex items-center space-x-4">
                  <input
                    ref="audioInput"
                    type="file"
                    accept="audio/*"
                    @change="handleAudioUpload"
                    class="hidden"
                  />
                  <button
                    type="button"
                    @click="audioInput?.click()"
                    class="px-4 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium"
                  >
                    {{ form.audioUrl ? t('parties.changeAudio') || 'Changer l\'audio' : t('parties.selectAudio') || 'Sélectionner un fichier audio' }}
                  </button>
                  <div v-if="form.audioUrl" class="flex-1">
                    <audio :src="getFileUrl(form.audioUrl)" controls class="w-full max-w-xs"></audio>
                    <button
                      type="button"
                      @click="form.audioUrl = null"
                      class="mt-2 text-xs text-red-600 hover:text-red-800"
                    >
                      {{ t('parties.removeAudio') || 'Supprimer' }}
                    </button>
                  </div>
                  <div v-if="uploadingAudio" class="text-sm text-gray-600">
                    {{ t('parties.uploading') || 'Upload en cours...' }}
                  </div>
                </div>
              </div>

              <!-- Questions Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('parties.selectQuestions') || 'Sélectionner les questions' }} *
                </label>
                <div v-if="availableQuestions.length === 0" class="border-2 border-orange-300 bg-orange-50 rounded-xl p-4 mb-2">
                  <div class="text-center text-orange-700 py-2">
                    <svg class="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p class="font-medium">{{ t('parties.noQuestions') || 'Aucune question disponible' }}</p>
                    <p class="text-sm mt-1 mb-3">{{ t('parties.createQuestionsFirst') || 'Créez d\'abord des questions dans la section Questions.' }}</p>
                    <button
                      @click="showCreateQuestionModal = true"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
                    >
                      {{ t('parties.createQuestion') || '+ Créer une question' }}
                    </button>
                  </div>
                </div>
                <div class="border-2 border-gray-300 rounded-xl p-4 max-h-64 overflow-y-auto" :class="availableQuestions.length === 0 || (editingParty && editingParty.status === 'active') ? 'opacity-50' : ''">
                  <div v-if="availableQuestions.length === 0" class="text-center text-gray-500 py-4">
                    {{ t('parties.noQuestions') || 'Aucune question disponible. Créez d\'abord des questions.' }}
                  </div>
                  <div v-else class="space-y-2">
                    <label
                      v-for="question in availableQuestions"
                      :key="question.id"
                      class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-2"
                      :class="form.questionIds.includes(question.id) ? 'border-blue-500 bg-blue-50' : 'border-transparent', (editingParty && editingParty.status === 'active') ? 'cursor-not-allowed' : ''"
                    >
                      <input
                        type="checkbox"
                        :value="question.id"
                        v-model="form.questionIds"
                        :disabled="editingParty && editingParty.status === 'active'"
                        class="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                      />
                      <div class="flex-1">
                        <div class="font-medium text-gray-900 break-words">
                          <span v-if="question.question && question.question.trim()">
                            {{ question.question }}
                          </span>
                          <span v-else class="text-orange-600 italic">
                            ⚠️ Question sans texte (ID: {{ question.id }})
                          </span>
                        </div>
                        <div class="text-sm text-gray-600 mt-1">
                          <span v-if="question.choices && question.choices.length > 0" class="text-green-600 font-medium">
                            ✓ {{ question.choices.length }} {{ question.choices.length === 1 ? 'choix' : 'choix' }}
                          </span>
                          <span v-else class="text-orange-600 font-medium">
                            ⚠️ Aucun choix disponible
                          </span>
                        </div>
                        <div v-if="question.category" class="text-xs text-gray-500 mt-1">
                          Catégorie: {{ question.category }}
                        </div>
                        <div v-if="question.difficulty" class="text-xs text-gray-500 mt-1">
                          Difficulté: {{ question.difficulty }}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                <p class="mt-2 text-sm text-gray-600">
                  {{ t('parties.selectedQuestions') || 'Sélectionnées' }}: {{ form.questionIds.length }}
                </p>
              </div>

              <!-- Scheduled Time -->
              <div>
                <label class="flex items-center space-x-2 mb-2">
                  <input
                    v-model="form.schedule"
                    type="checkbox"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium text-gray-700">
                    {{ t('parties.scheduleLaunch') || 'Planifier le lancement' }}
                  </span>
                </label>
                <input
                  v-if="form.schedule"
                  v-model="form.scheduledStartTime"
                  type="datetime-local"
                  :min="minDateTime"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 mt-2"
                />
              </div>

              <!-- Question Duration -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('parties.questionDuration') || 'Durée par question (secondes)' }}
                </label>
                <input
                  v-model.number="form.questionDuration"
                  type="number"
                  min="5"
                  max="300"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500"
                />
                <p class="mt-1 text-xs text-gray-500">
                  {{ t('parties.durationHint') || 'Entre 5 et 300 secondes (défaut: 30)' }}
                </p>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p class="text-sm text-red-800">{{ error }}</p>
              </div>

              <!-- Actions -->
              <div class="flex space-x-4 pt-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                  {{ t('parties.cancel') || 'Annuler' }}
                </button>
                <button
                  type="submit"
                  :disabled="loading || form.questionIds.length === 0"
                  class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ loading ? (t('parties.saving') || 'Enregistrement...') : (t('parties.save') || 'Enregistrer') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Question Modal -->
    <div
      v-if="showCreateQuestionModal"
      class="fixed top-16 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[80] p-4"
      :class="sidebarCollapsed ? 'left-16 md:left-20' : 'left-0 md:left-64'"
      @click.self="closeCreateQuestionModal"
    >
      <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 sm:p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
              {{ t('parties.createQuestion') || 'Créer une question' }}
            </h2>
            <button
              @click="closeCreateQuestionModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="createQuestion" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('parties.questionText') || 'Question' }} *
              </label>
              <textarea
                v-model="newQuestionForm.question"
                rows="3"
                required
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500"
                :placeholder="t('parties.questionPlaceholder') || 'Entrez votre question...'"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('parties.choices') || 'Choix' }} * (séparés par des virgules)
              </label>
              <textarea
                v-model="newQuestionForm.choices"
                rows="4"
                required
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500"
                :placeholder="t('parties.choicesPlaceholder') || 'Choix 1, Choix 2, Choix 3, Choix 4'"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">{{ t('parties.choicesHint') || 'Séparez les choix par des virgules ou des retours à la ligne' }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('parties.correctAnswer') || 'Bonne réponse' }} *
              </label>
              <input
                v-model="newQuestionForm.answer"
                type="text"
                required
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500"
                :placeholder="t('parties.answerPlaceholder') || 'Entrez la bonne réponse...'"
              />
            </div>

            <div v-if="error" class="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {{ error }}
            </div>

            <div class="flex space-x-4 pt-4">
              <button
                type="button"
                @click="closeCreateQuestionModal"
                class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                {{ t('parties.cancel') || 'Annuler' }}
              </button>
              <button
                type="submit"
                :disabled="creatingQuestion || !newQuestionForm.question || !newQuestionForm.choices || !newQuestionForm.answer"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ creatingQuestion ? (t('parties.creating') || 'Création...') : (t('parties.create') || 'Créer') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import UserSidebar from './UserSidebar.vue'
import MobileSidebarToggle from './MobileSidebarToggle.vue'
import apiClient, { quizService } from '@/services/api'
import { API_URLS, API_CONFIG } from '@/config/api'
import socketService from '@/services/socketService'

export default {
  name: 'GameParties',
  components: {
    UserSidebar,
    MobileSidebarToggle
  },
  setup() {
    const { t } = useI18n()
    const parties = ref([])
    const availableQuestions = ref([])
    const loading = ref(false)
    const error = ref('')
    const showCreateModal = ref(false)
    const editingParty = ref(null)
    const viewingParty = ref(null)
    const partyDetails = ref(null)
    const partyDetailsLoading = ref(false)
    const connectedPlayersCount = ref(null)
    const playerCounts = ref({}) // Store player counts per party
    const sidebarCollapsed = ref(false)
    const showCreateQuestionModal = ref(false)
    const newQuestionForm = ref({
      question: '',
      choices: '',
      answer: ''
    })
    const creatingQuestion = ref(false)

    const form = ref({
      name: '',
      description: '',
      questionIds: [],
      schedule: false,
      scheduledStartTime: '',
      questionDuration: 30,
      imageUrl: null,
      audioUrl: null
    })
    
    const uploadingImage = ref(false)
    const uploadingAudio = ref(false)
    const imageInput = ref(null)
    const audioInput = ref(null)
    
    const getFileUrl = (url) => {
      if (!url) return ''
      // Si l'URL est déjà complète, la retourner telle quelle
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
      }
      // Sinon, construire l'URL complète
      const baseUrl = API_CONFIG.GAME_SERVICE.replace('/game', '')
      return `${baseUrl}${url}`
    }
    
    const handleImageUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      uploadingImage.value = true
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await apiClient.post(API_URLS.game.uploadImage, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        form.value.imageUrl = response.data.url
      } catch (err) {
        // console.error('Error uploading image:', err)
        error.value = err.response?.data?.error || t('parties.uploadError') || 'Erreur lors de l\'upload de l\'image'
      } finally {
        uploadingImage.value = false
      }
    }
    
    const handleAudioUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      uploadingAudio.value = true
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await apiClient.post(API_URLS.game.uploadAudio, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        form.value.audioUrl = response.data.url
      } catch (err) {
        // console.error('Error uploading audio:', err)
        error.value = err.response?.data?.error || t('parties.uploadError') || 'Erreur lors de l\'upload de l\'audio'
      } finally {
        uploadingAudio.value = false
      }
    }

    const minDateTime = computed(() => {
      const now = new Date()
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
      return now.toISOString().slice(0, 16)
    })

    const getStatusLabel = (status) => {
      const labels = {
        draft: t('parties.status.draft') || 'Brouillon',
        scheduled: t('parties.status.scheduled') || 'Planifiée',
        active: t('parties.status.active') || 'Active',
        completed: t('parties.status.completed') || 'Terminée',
        cancelled: t('parties.status.cancelled') || 'Annulée'
      }
      return labels[status] || status
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      const lang = localStorage.getItem('gameLanguage') || 'fr'
      return date.toLocaleString(lang === 'fr' ? 'fr-FR' : lang === 'ru' ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const loadParties = async () => {
      loading.value = true
      error.value = ''
      try {
        const response = await apiClient.get(API_URLS.game.userParties)
        parties.value = response.data || []
        
        // Charger le comptage des joueurs pour chaque partie active
        await loadPlayerCounts()
      } catch (err) {
        // console.error('Error loading parties:', err)
        error.value = err.response?.data?.error || t('parties.loadError') || 'Erreur lors du chargement'
      } finally {
        loading.value = false
      }
    }
    
    const loadPlayerCounts = async () => {
      // Charger le comptage pour chaque partie active avec un gameCode
      for (const party of parties.value) {
        if (party.status === 'active' && party.gameCode) {
          try {
            // Vérifier que le gameCode correspond au gameState actuel
            const stateRes = await apiClient.get(API_URLS.game.state)
            if (stateRes.data.gameCode === party.gameCode) {
              const playersRes = await apiClient.get(API_URLS.game.players)
              playerCounts.value[party.id] = playersRes.data.count || 0
            } else {
              playerCounts.value[party.id] = 0
            }
          } catch (err) {
            // console.error(`Error loading player count for party ${party.id}:`, err)
            playerCounts.value[party.id] = 0
          }
        } else {
          playerCounts.value[party.id] = 0
        }
      }
    }

    const loadQuestions = async () => {
      try {
        // console.log('📋 [GameParties] Loading questions from:', API_URLS.quiz.all)
        const response = await apiClient.get(API_URLS.quiz.all)
        availableQuestions.value = response.data || []
        // console.log('✅ [GameParties] Loaded', availableQuestions.value.length, 'questions')
      } catch (err) {
        // console.error('❌ [GameParties] Error loading questions:', err)
        availableQuestions.value = []
      }
    }

    const saveParty = async () => {
      if (form.value.questionIds.length === 0) {
        error.value = t('parties.noQuestionsSelected') || 'Veuillez sélectionner au moins une question'
        return
      }

      loading.value = true
      error.value = ''

      try {
        // Si on édite une partie active, on ne peut modifier que description, imageUrl, audioUrl
        const isEditingActiveParty = editingParty.value && editingParty.value.status === 'active'
        
        let partyData
        if (isEditingActiveParty) {
          // Pour une partie active, n'envoyer que les champs autorisés
          partyData = {
            description: form.value.description,
            imageUrl: form.value.imageUrl || null,
            audioUrl: form.value.audioUrl || null
          }
        } else {
          // Pour une partie non-active ou nouvelle, envoyer tous les champs
          partyData = {
          name: form.value.name,
          description: form.value.description,
          questionIds: form.value.questionIds,
          questionDuration: form.value.questionDuration * 1000, // Convert to milliseconds
          imageUrl: form.value.imageUrl || null,
          audioUrl: form.value.audioUrl || null
        }

          // Gérer scheduledStartTime : toujours l'envoyer si on édite une partie
        if (editingParty.value) {
            // Si on édite, toujours envoyer scheduledStartTime (même si null pour supprimer)
            if (form.value.schedule && form.value.scheduledStartTime) {
              // Convertir la date locale (format datetime-local) en ISO string
              // form.value.scheduledStartTime est au format "YYYY-MM-DDTHH:mm" (datetime-local)
              try {
                const dateStr = form.value.scheduledStartTime.trim()
                // Créer une date à partir de la string datetime-local
                const date = new Date(dateStr)
                if (isNaN(date.getTime())) {
                  // console.error('❌ [GameParties] Invalid date format:', dateStr)
                  throw new Error('Invalid date format')
                }
                partyData.scheduledStartTime = date.toISOString()
                // console.log('📅 [GameParties] Updating scheduledStartTime:', {
                  formValue: form.value.scheduledStartTime,
                  converted: partyData.scheduledStartTime
                })
              } catch (error) {
                // console.error('❌ [GameParties] Error converting scheduledStartTime:', error)
                // Essayer avec la valeur originale
                partyData.scheduledStartTime = new Date(form.value.scheduledStartTime).toISOString()
              }
            } else {
              // Si la case est décochée ou vide, envoyer null pour supprimer la date
              partyData.scheduledStartTime = null
              // console.log('📅 [GameParties] Removing scheduledStartTime (schedule unchecked)')
            }
          } else {
            // Si c'est une nouvelle partie, envoyer seulement si schedule est coché
            if (form.value.schedule && form.value.scheduledStartTime) {
              partyData.scheduledStartTime = new Date(form.value.scheduledStartTime).toISOString()
            }
            // Sinon, ne pas envoyer scheduledStartTime (undefined) pour ne pas le définir
          }
        }

        if (editingParty.value) {
          const updatedParty = await apiClient.put(API_URLS.game.updateParty(editingParty.value.id), partyData)
          // Mettre à jour la partie dans la liste locale avec les données retournées
          const index = parties.value.findIndex(p => p.id === editingParty.value.id)
          if (index !== -1 && updatedParty.data) {
            parties.value[index] = updatedParty.data
          }
        } else {
          await apiClient.post(API_URLS.game.createParty, partyData)
        }

        // Recharger la liste complète pour s'assurer que tout est à jour
        await loadParties()
        closeModal()
      } catch (err) {
        // console.error('Error saving party:', err)
        error.value = err.response?.data?.error || t('parties.saveError') || 'Erreur lors de l\'enregistrement'
      } finally {
        loading.value = false
      }
    }

    const editParty = (party) => {
      editingParty.value = party
      form.value = {
        name: party.name,
        description: party.description || '',
        questionIds: party.questionIds || [],
        schedule: !!party.scheduledStartTime,
        scheduledStartTime: party.scheduledStartTime
          ? new Date(party.scheduledStartTime).toISOString().slice(0, 16)
          : '',
        questionDuration: (party.questionDuration || 30000) / 1000, // Convert to seconds
        imageUrl: party.imageUrl || null,
        audioUrl: party.audioUrl || null
      }
      showCreateModal.value = true
    }

    const deactivateParty = async (partyId) => {
      if (!confirm(t('parties.confirmDeactivate') || 'Êtes-vous sûr de vouloir désactiver cette partie ?')) {
        return
      }

      try {
        // console.log('🛑 [GameParties] Deactivating party:', partyId)
        const updatedParty = await apiClient.put(API_URLS.game.updateParty(partyId), {
          status: 'cancelled'
        })
        // console.log('✅ [GameParties] Party deactivated:', updatedParty.data)
        await loadParties()
      } catch (err) {
        // console.error('❌ [GameParties] Error deactivating party:', err)
        error.value = err.response?.data?.error || t('parties.deactivateError') || 'Erreur lors de la désactivation'
      }
    }

    const deleteParty = async (partyId) => {
      if (!confirm(t('parties.confirmDelete') || 'Êtes-vous sûr de vouloir supprimer cette partie ?')) {
        return
      }

      try {
        await apiClient.delete(API_URLS.game.deleteParty(partyId))
        await loadParties()
      } catch (err) {
        // console.error('Error deleting party:', err)
        error.value = err.response?.data?.error || t('parties.deleteError') || 'Erreur lors de la suppression'
      }
    }

    const viewParty = async (party) => {
      viewingParty.value = party
      partyDetails.value = null
      connectedPlayersCount.value = null
      partyDetailsLoading.value = true

      try {
        // Charger les détails de la partie
        try {
          const partyRes = await apiClient.get(API_URLS.game.getParty(party.id))
          partyDetails.value = partyRes.data
        } catch (partyErr) {
          // console.error('Error loading party details, using cached party:', partyErr)
          partyDetails.value = party
        }

        // Charger le nombre de joueurs connectés si la partie est active et a un gameCode
        if (partyDetails.value.status === 'active' && partyDetails.value.gameCode) {
          try {
            const stateRes = await apiClient.get(API_URLS.game.state)
            if (stateRes.data.gameCode === partyDetails.value.gameCode) {
              const playersRes = await apiClient.get(API_URLS.game.players)
              connectedPlayersCount.value = playersRes.data.count || 0
            } else {
              connectedPlayersCount.value = 0
            }
          } catch (playersErr) {
            // console.error('Error loading connected players:', playersErr)
            connectedPlayersCount.value = 0
          }
        } else {
          connectedPlayersCount.value = 0
        }
      } catch (err) {
        // console.error('Error loading party details:', err)
        partyDetails.value = party
      } finally {
        partyDetailsLoading.value = false
      }
    }

    const closeViewModal = () => {
      viewingParty.value = null
      partyDetails.value = null
      connectedPlayersCount.value = null
    }

    const closeModal = () => {
      showCreateModal.value = false
      editingParty.value = null
      form.value = {
        name: '',
        description: '',
        questionIds: [],
        schedule: false,
        scheduledStartTime: '',
        questionDuration: 30,
        imageUrl: null,
        audioUrl: null
      }
      error.value = ''
    }

    const createQuestion = async () => {
      if (!newQuestionForm.value.question || !newQuestionForm.value.choices || !newQuestionForm.value.answer) {
        error.value = t('parties.allFieldsRequired') || 'Tous les champs sont requis'
        return
      }

      creatingQuestion.value = true
      error.value = ''

      try {
        // Parser les choix (séparés par des virgules ou des lignes)
        const choices = newQuestionForm.value.choices
          .split(/[,\n]/)
          .map(c => c.trim())
          .filter(c => c.length > 0)

        if (choices.length < 2) {
          error.value = t('parties.minTwoChoices') || 'Au moins 2 choix sont requis'
          creatingQuestion.value = false
          return
        }

        const questionData = {
          question: newQuestionForm.value.question.trim(),
          choices: choices,
          answer: newQuestionForm.value.answer.trim()
        }

        // console.log('➕ [GameParties] Creating question:', questionData)
        await quizService.createQuestion(questionData)
        
        // Recharger les questions
        await loadQuestions()
        
        // Réinitialiser le formulaire
        newQuestionForm.value = {
          question: '',
          choices: '',
          answer: ''
        }
        showCreateQuestionModal.value = false
        
        // console.log('✅ [GameParties] Question created successfully')
      } catch (err) {
        // console.error('❌ [GameParties] Error creating question:', err)
        error.value = err.response?.data?.error || t('parties.createQuestionError') || 'Erreur lors de la création de la question'
      } finally {
        creatingQuestion.value = false
      }
    }

    const closeCreateQuestionModal = () => {
      showCreateQuestionModal.value = false
      newQuestionForm.value = {
        question: '',
        choices: '',
        answer: ''
      }
      error.value = ''
    }
    
    // Check sidebar state periodically
    const checkSidebarState = () => {
      const savedState = localStorage.getItem('sidebarCollapsed')
      sidebarCollapsed.value = savedState === 'true'
    }
    
    let sidebarCheckInterval = null
    
    let countInterval = null
    
    onMounted(async () => {
      checkSidebarState()
      // Check periodically for changes
      sidebarCheckInterval = setInterval(checkSidebarState, 100)
      await Promise.all([loadParties(), loadQuestions()])
      
      // Écouter les événements WebSocket pour mettre à jour le comptage en temps réel
      socketService.on('players:count', async (data) => {
        // Récupérer le gameCode actuel depuis le gameState
        try {
          const stateRes = await apiClient.get(API_URLS.game.state)
          const currentGameCode = stateRes.data.gameCode
          
          if (currentGameCode) {
            // Mettre à jour le comptage pour toutes les parties actives avec ce gameCode
            for (const party of parties.value) {
              if (party.status === 'active' && party.gameCode === currentGameCode) {
                playerCounts.value[party.id] = data.count || 0
              }
            }
          }
        } catch (err) {
          // console.error('Error updating player count from WebSocket:', err)
        }
      }, 'GameParties')
      
      // Recharger le comptage périodiquement (toutes les 5 secondes)
      countInterval = setInterval(async () => {
        await loadPlayerCounts()
      }, 5000)
    })
    
    onUnmounted(() => {
      if (sidebarCheckInterval) {
        clearInterval(sidebarCheckInterval)
      }
      if (countInterval) {
        clearInterval(countInterval)
      }
      socketService.off('GameParties')
    })

    return {
      t,
      parties,
      availableQuestions,
      loading,
      error,
      showCreateModal,
      editingParty,
      viewingParty,
      partyDetails,
      partyDetailsLoading,
      connectedPlayersCount,
      playerCounts,
      form,
      minDateTime,
      sidebarCollapsed,
      uploadingImage,
      uploadingAudio,
      imageInput,
      audioInput,
      getStatusLabel,
      formatDate,
      getFileUrl,
      handleImageUpload,
      handleAudioUpload,
      saveParty,
      editParty,
      deleteParty,
      deactivateParty,
      viewParty,
      closeViewModal,
      closeModal,
      showCreateQuestionModal,
      newQuestionForm,
      creatingQuestion,
      createQuestion,
      closeCreateQuestionModal
    }
  }
}
</script>

