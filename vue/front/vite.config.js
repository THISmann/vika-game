import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_URL || '/',
  plugins: [
    vue(),
    vueJsx(),
    // DevTools uniquement en développement (pas en production)
    ...(process.env.NODE_ENV !== 'production' ? [vueDevTools()] : []),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'vika-game.ru',
      'www.vika-game.ru',
      'localhost',
      '.localhost'
    ],
    proxy: {
      '/api/auth': {
        target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/auth'),
      },
      '/api/quiz': {
        target: process.env.QUIZ_SERVICE_URL || 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/quiz/, '/quiz'),
      },
      // Proxy pour Socket.IO via /api/game/socket.io (doit être avant /api/game)
      '/api/game/socket.io': {
        target: process.env.GAME_SERVICE_URL || 'http://localhost:3003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/game\/socket\.io/, '/socket.io'),
        ws: true, // WebSocket support
      },
      '/api/game': {
        target: process.env.GAME_SERVICE_URL || 'http://localhost:3003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/game/, '/game'),
        ws: true, // WebSocket support
      },
      // Proxy pour WebSocket direct (socket.io)
      '/socket.io': {
        target: process.env.GAME_SERVICE_URL || 'http://localhost:3003',
        changeOrigin: true,
        ws: true, // WebSocket support
      },
    },
  },
})
