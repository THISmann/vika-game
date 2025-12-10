import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import socketService from './services/socketService'
import { debugSocket } from './utils/debugSocket'

// Exposer socketService et debugSocket globalement pour le debugging
if (typeof window !== 'undefined') {
  window.socketService = socketService
  window.debugSocket = debugSocket
  console.log('🔧 Debug tools available: window.socketService, window.debugSocket()')
}

createApp(App).use(router).mount('#app')
