<template>
  <button
    @click="toggleMobileSidebar"
    class="md:hidden fixed top-0 left-0 z-[61] h-14 w-14 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:opacity-90 transition-all"
    aria-label="Menu"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path v-if="!isOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
  
  <!-- Overlay: séparation visuelle du contenu, fermeture au tap -->
  <div
    v-if="isOpen"
    class="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px] transition-opacity duration-300"
    @click="closeMobileSidebar"
    aria-hidden="true"
  ></div>
  
  <!-- Mobile Sidebar: plus fine, pas collée au contenu (ombre + bordure droite), présente sur toutes les pages user -->
  <aside
    v-if="isOpen"
    class="md:hidden fixed left-0 top-0 h-full w-20 bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 text-white z-50 flex flex-col border-r border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.25)] transform transition-transform duration-300 ease-out"
  >
    <UserSidebar :mobile="true" @close="closeMobileSidebar" />
  </aside>
</template>

<script>
import { ref } from 'vue'
import UserSidebar from './UserSidebar.vue'

export default {
  name: 'MobileSidebarToggle',
  components: {
    UserSidebar
  },
  setup() {
    const isOpen = ref(false)
    
    const toggleMobileSidebar = () => {
      isOpen.value = !isOpen.value
    }
    
    const closeMobileSidebar = () => {
      isOpen.value = false
    }
    
    return {
      isOpen,
      toggleMobileSidebar,
      closeMobileSidebar
    }
  }
}
</script>

