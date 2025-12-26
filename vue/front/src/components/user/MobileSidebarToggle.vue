<template>
  <button
    @click="toggleMobileSidebar"
    class="md:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path v-if="!isOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
  
  <!-- Mobile Sidebar Overlay -->
  <div
    v-if="isOpen"
    class="md:hidden fixed inset-0 bg-black/50 z-40"
    @click="closeMobileSidebar"
  ></div>
  
  <!-- Mobile Sidebar -->
  <aside
    v-if="isOpen"
    class="md:hidden fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 text-white z-50 shadow-2xl transform transition-transform duration-300"
  >
    <UserSidebar @close="closeMobileSidebar" />
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

