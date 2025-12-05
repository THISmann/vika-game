# Instructions pour corriger les erreurs de build GitHub Actions

## Problèmes identifiés

1. ❌ GitHub Actions utilise `npm ci --only=production` (échoue si package-lock.json manque)
2. ❌ Frontend utilise Node.js 18 (trop ancien pour Vite 7)
3. ❌ Fichiers JSON de données non trackés

## ✅ Solutions appliquées localement

Tous les Dockerfiles locaux sont maintenant corrects :
- ✅ Backend : `npm install --production --omit=dev` (au lieu de `npm ci`)
- ✅ Frontend : `node:20-alpine` (au lieu de `node:18-alpine`)
- ✅ Fichiers JSON : Trackés par Git
- ✅ .gitignore : Autorise les fichiers `data/*.json`

## 🚀 Actions à effectuer

### Option 1 : Pousser les commits existants

Si vous avez déjà créé des commits (comme indiqué par les scripts) :

```bash
git push origin main
```

### Option 2 : Vérifier et pousser manuellement

```bash
# 1. Vérifier que tous les Dockerfiles sont corrects
./verify-dockerfiles.sh

# 2. Vérifier le statut
git status

# 3. Si des fichiers JSON ne sont pas trackés, les ajouter
git add node/*/data/*.json node/*/data/.gitkeep

# 4. Vérifier que les Dockerfiles sont dans le dernier commit
git show HEAD --name-only | grep Dockerfile

# 5. Pousser
git push origin main
```

### Option 3 : Forcer la mise à jour (si nécessaire)

Si GitHub Actions utilise encore l'ancienne version après le push :

```bash
# Toucher tous les Dockerfiles pour forcer une mise à jour
touch node/*/Dockerfile vue/Dockerfile

# Ajouter et commiter
git add node/*/Dockerfile vue/Dockerfile
git commit -m "fix: Force Dockerfile update for GitHub Actions"
git push origin main
```

## 📋 Vérification après le push

1. **Sur GitHub** :
   - Allez dans votre repo
   - Vérifiez le contenu de `node/auth-service/Dockerfile` dans la branche `main`
   - Il doit contenir : `RUN npm install --production --omit=dev`

2. **Dans GitHub Actions** :
   - Allez dans Actions
   - Vérifiez le dernier workflow run
   - Les builds devraient maintenant réussir

3. **Si les erreurs persistent** :
   - Videz le cache GitHub Actions
   - Vérifiez que vous poussez sur la bonne branche (`main` ou `master`)

## 🔍 Vérification des fichiers JSON

Pour vérifier que les fichiers JSON sont bien trackés :

```bash
# Vérifier qu'ils sont dans Git
git ls-files node/*/data/*.json

# Devrait afficher :
# node/auth-service/data/users.json
# node/game-service/data/gameState.json
# node/game-service/data/scores.json
# node/quiz-service/data/questions.json
```

## 📝 Résumé des fichiers à pousser

- ✅ `node/auth-service/Dockerfile`
- ✅ `node/quiz-service/Dockerfile`
- ✅ `node/game-service/Dockerfile`
- ✅ `node/telegram-bot/Dockerfile`
- ✅ `vue/Dockerfile`
- ✅ `node/*/data/*.json` (fichiers de données)
- ✅ `node/*/data/.gitkeep` (pour garantir les dossiers)
- ✅ `.gitignore` (mise à jour pour autoriser les JSON)

## ⚠️ Important

Après avoir poussé sur GitHub, **attendez que GitHub Actions termine le build**. Si les erreurs persistent :
1. Vérifiez que les fichiers sur GitHub sont corrects
2. Videz le cache GitHub Actions
3. Relancez le workflow manuellement

