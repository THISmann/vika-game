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
      // Utiliser un middleware qui intercepte les requêtes avant Vite
      const handle = (req, res, next) => {
        // Si la requête est pour une route SPA (pas un fichier statique)
        if (req.url && 
            req.url.startsWith('/vika-admin/') && 
            // Exclure tous les fichiers statiques et assets Vite
            !req.url.match(/\.(js|mjs|ts|jsx|tsx|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|map|html|wasm)$/i) &&
            !req.url.startsWith('/vika-admin/@') && 
            !req.url.startsWith('/vika-admin/node_modules/') &&
            !req.url.startsWith('/vika-admin/src/') &&
            !req.url.startsWith('/vika-admin/api') &&
            !req.url.startsWith('/vika-admin/socket.io') &&
            !req.url.startsWith('/vika-admin/__') &&
            !req.url.startsWith('/vika-admin/assets/') &&
            !req.url.includes('?v=') && // Exclure les fichiers avec query params (assets Vite)
            !req.url.includes('&')) {
          // Servir index.html pour toutes les routes SPA
          req.url = '/vika-admin/index.html'
        }
        next()
      }
      // Ajouter le middleware au début de la chaîne
      if (Array.isArray(server.middlewares.stack)) {
        server.middlewares.stack.unshift({ route: '', handle })
      } else {
        server.middlewares.use(handle)
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
    // DevTools uniquement en développement (pas en production)
    ...(process.env.NODE_ENV !== 'production' ? [vueDevTools()] : []),
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
    hmr: process.env.VITE_HMR_HOST ? {
      // Si VITE_HMR_HOST est défini (production), l'utiliser
      host: process.env.VITE_HMR_HOST,
      port: 5174
    } : {
      // En local, ne pas définir le host pour que Vite utilise automatiquement window.location.hostname
      // Cela évite les erreurs de connexion WebSocket en local
      port: 5174
    },
    allowedHosts: [
      'vika-game.ru',
      'www.vika-game.ru',
      'localhost',
      '.localhost',
      '127.0.0.1',
      '172.19.0.15'
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

