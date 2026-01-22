import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import socketService from './services/socketService'
import { debugSocket } from './utils/debugSocket'

// Exposer socketService et debugSocket globalement pour le debugging
if (typeof window !== 'undefined') {
  window.socketService = socketService
  window.debugSocket = debugSocket
  // console.log('🔧 Debug tools available: window.socketService, window.debugSocket()')
}

const pinia = createPinia()
createApp(App).use(pinia).use(router).mount('#app')
