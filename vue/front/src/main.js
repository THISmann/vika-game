// Force viewport mobile dès le chargement (contourne cache / HTML obsolète)
(function () {
  if (typeof document === 'undefined' || !document.head) return
  var meta = document.querySelector('meta[name="viewport"]')
  var content = 'width=device-width, initial-scale=1.0, viewport-fit=cover'
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'viewport'
    document.head.appendChild(meta)
  }
  if (meta.getAttribute('content') !== content) {
    meta.setAttribute('content', content)
  }
})()

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
