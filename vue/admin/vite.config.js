import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// Plugin pour servir index.html pour toutes les routes SPA
const spaFallback = () => {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      // Utiliser un middleware avec une priorité élevée
      const originalUse = server.middlewares.use.bind(server.middlewares)
      server.middlewares.use = function(...args) {
        if (args.length === 1 && typeof args[0] === 'function') {
          // Middleware simple
          const middleware = args[0]
          return originalUse((req, res, next) => {
            // Intercepter les requêtes pour les routes SPA
            if (req.url && req.url.startsWith('/vika-admin/') && 
                !req.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|map|html)$/) &&
                !req.url.startsWith('/vika-admin/@') && 
                !req.url.startsWith('/vika-admin/api') &&
                !req.url.startsWith('/vika-admin/socket.io')) {
              req.url = '/vika-admin/index.html'
            }
            middleware(req, res, next)
          })
        }
        return originalUse(...args)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_URL || '/vika-admin/',
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    tailwindcss(),
    spaFallback(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5174, // Different port from front (5173)
    strictPort: false,
    hmr: {
      host: 'vika-game.ru',
      port: 5174
    },
    allowedHosts: [
      'vika-game.ru',
      'www.vika-game.ru',
      'localhost',
      '.localhost',
      '172.19.0.15'
    ],
    proxy: {
      '/api/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, ''),
      },
      '/api/quiz': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/quiz/, ''),
      },
      '/api/game': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/game/, ''),
        ws: true, // WebSocket support
      },
      // Proxy pour WebSocket direct (socket.io)
      '/socket.io': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        ws: true, // WebSocket support
      },
    },
  },
})

