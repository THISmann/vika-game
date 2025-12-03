# Correction des erreurs de build Docker

## Problèmes identifiés

### 1. Frontend : `crypto.hash is not a function`
**Cause** : Node.js 18 est trop ancien pour Vite 7 qui nécessite Node.js 20.19+ ou 22.12+

**Solution** : Le Dockerfile utilise déjà `node:20-alpine` ✅

### 2. Backend : `npm ci` échoue
**Cause** : `npm ci` nécessite un `package-lock.json` synchronisé avec `package.json`

**Solution** : Utiliser `npm install` au lieu de `npm ci` (déjà fait) ✅

## Vérification des Dockerfiles

Tous les Dockerfiles doivent être vérifiés avant de pousser sur GitHub :

### Frontend (`vue/Dockerfile`)
```dockerfile
FROM node:20-alpine AS build  # ✅ Correct
RUN npm install              # ✅ Correct
```

### Services Backend
Tous les services backend doivent utiliser :
```dockerfile
FROM node:18-alpine
RUN npm install --production --omit=dev  # ✅ Pas npm ci
```

## Actions à effectuer

### 1. Vérifier que tous les Dockerfiles sont corrects

```bash
# Vérifier le frontend
grep -E "FROM node|npm (ci|install)" vue/Dockerfile

# Vérifier les services backend
grep -E "FROM node|npm (ci|install)" node/*/Dockerfile
```

### 2. S'assurer que les fichiers sont synchronisés avec GitHub

```bash
# Vérifier les différences
git status
git diff HEAD -- node/*/Dockerfile vue/Dockerfile

# Si des modifications sont nécessaires, les commiter
git add node/*/Dockerfile vue/Dockerfile
git commit -m "fix: Update Dockerfiles to use npm install and Node.js 20 for frontend"
git push
```

### 3. Vérifier que package-lock.json est présent

```bash
# Vérifier que tous les package-lock.json existent
ls -la node/*/package-lock.json vue/front/package-lock.json

# Si certains manquent, les générer
cd node/auth-service && npm install && cd ../..
cd node/quiz-service && npm install && cd ../..
cd node/game-service && npm install && cd ../..
cd vue/front && npm install && cd ../..
```

## Résumé des Dockerfiles corrects

### Frontend (`vue/Dockerfile`)
- ✅ Utilise `node:20-alpine` (requis pour Vite 7)
- ✅ Utilise `npm install` (pas `npm ci`)

### Services Backend (`node/*/Dockerfile`)
- ✅ Utilisent `node:18-alpine` (suffisant pour les services backend)
- ✅ Utilisent `npm install --production --omit=dev` (pas `npm ci`)
- ✅ Créent les répertoires `data` si nécessaire

## Si les erreurs persistent

1. **Vider le cache GitHub Actions** :
   - Aller dans Actions → Votre workflow → Run workflow → Clear cache

2. **Vérifier que les fichiers sont bien poussés** :
   ```bash
   git log --oneline --all -- node/*/Dockerfile vue/Dockerfile
   ```

3. **Forcer un rebuild sans cache** :
   - Dans GitHub Actions, ajouter `no-cache: true` temporairement

