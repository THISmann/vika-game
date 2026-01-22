# Correction de l'Erreur MIME Type sur Admin Frontend

## 🔍 Problème Identifié

L'erreur suivante apparaissait dans la console du navigateur :

```
Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html". Strict MIME type checking is enforced for module scripts per HTML spec.
```

Cette erreur se produisait pour :
- `/vika-admin/node_modules/@vue/devtools-kit/dist/index.js`
- `/vika-admin/src/main.js`
- Et d'autres modules JavaScript

## 🔧 Cause du Problème

Le plugin SPA fallback que nous avions créé pour servir `index.html` pour les routes SPA interceptait **trop** de requêtes, y compris les fichiers JavaScript. Quand le navigateur demandait un fichier `.js`, le plugin le redirigeait vers `index.html`, ce qui retournait du HTML avec le type MIME `text/html` au lieu du JavaScript attendu.

## ✅ Solution Appliquée

Le plugin SPA fallback a été amélioré pour exclure correctement tous les fichiers statiques et assets :

### Exclusions Ajoutées :

1. **Extensions de fichiers supplémentaires** :
   - `.mjs`, `.ts`, `.jsx`, `.tsx` (modules TypeScript et JavaScript modernes)
   - Matching case-insensitive (`/i` flag)

2. **Chemins exclus** :
   - `/vika-admin/node_modules/` - Tous les modules npm
   - `/vika-admin/src/` - Fichiers source
   - `/vika-admin/assets/` - Assets statiques

3. **Query parameters** :
   - Fichiers avec `?v=` (assets Vite avec versioning)
   - Fichiers avec `&` (query params multiples)

### Code Corrigé :

```javascript
const handle = (req, res, next) => {
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
      !req.url.includes('?v=') && // Exclure les fichiers avec query params
      !req.url.includes('&')) {
    // Servir index.html pour toutes les routes SPA
    req.url = '/vika-admin/index.html'
  }
  next()
}
```

## ✅ Résultat

- ✅ Les fichiers JavaScript sont maintenant servis avec le bon Content-Type (`text/javascript`)
- ✅ Les modules Vite fonctionnent correctement
- ✅ Les routes SPA continuent de fonctionner (servent `index.html`)
- ✅ Aucune erreur MIME type dans la console

## 🧪 Tests Effectués

- ✅ `/vika-admin/node_modules/@vue/devtools-kit/dist/index.js` → `200 OK` avec `Content-Type: text/javascript`
- ✅ `/vika-admin/src/main.js` → Sert correctement le JavaScript
- ✅ `/vika-admin/login` → Sert `index.html` (route SPA)
- ✅ `/vika-admin/dashboard` → Sert `index.html` (route SPA)

## 📝 Notes

Le plugin SPA fallback doit être très précis dans ses exclusions pour ne pas intercepter les assets. Vite utilise des chemins spéciaux comme `/@id/`, `/@vite/`, etc., qui sont déjà exclus, mais il faut aussi exclure les chemins standards comme `node_modules/` et `src/`.
