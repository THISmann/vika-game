#!/bin/bash

# Script final pour pousser toutes les corrections sur GitHub
# Usage: ./push-all-fixes.sh

set -e

echo "🚀 Préparation finale pour GitHub..."
echo ""

# 1. Vérifier que tous les fichiers sont corrects
echo "=== 1. Vérification finale ==="
./verify-dockerfiles.sh
echo ""

# 2. Ajouter tous les fichiers avec force
echo "=== 2. Ajout des fichiers ==="

# Dockerfiles
echo "Ajout des Dockerfiles..."
git add -f node/auth-service/Dockerfile
git add -f node/quiz-service/Dockerfile
git add -f node/game-service/Dockerfile
git add -f node/telegram-bot/Dockerfile
git add -f vue/Dockerfile

# Fichiers JSON
echo "Ajout des fichiers JSON..."
git add -f node/auth-service/data/users.json 2>/dev/null && echo "  ✅ users.json" || echo "  ⚠️  users.json non trouvé"
git add -f node/quiz-service/data/questions.json 2>/dev/null && echo "  ✅ questions.json" || echo "  ⚠️  questions.json non trouvé"
git add -f node/game-service/data/gameState.json 2>/dev/null && echo "  ✅ gameState.json" || echo "  ⚠️  gameState.json non trouvé"
git add -f node/game-service/data/scores.json 2>/dev/null && echo "  ✅ scores.json" || echo "  ⚠️  scores.json non trouvé"

# Fichiers .gitkeep
echo "Ajout des fichiers .gitkeep..."
git add -f node/auth-service/data/.gitkeep 2>/dev/null && echo "  ✅ auth-service/.gitkeep" || echo "  ⚠️  auth-service/.gitkeep non trouvé"
git add -f node/quiz-service/data/.gitkeep 2>/dev/null && echo "  ✅ quiz-service/.gitkeep" || echo "  ⚠️  quiz-service/.gitkeep non trouvé"
git add -f node/game-service/data/.gitkeep 2>/dev/null && echo "  ✅ game-service/.gitkeep" || echo "  ⚠️  game-service/.gitkeep non trouvé"

# .gitignore
echo "Ajout de .gitignore..."
git add -f .gitignore && echo "  ✅ .gitignore" || echo "  ⚠️  .gitignore non trouvé"

echo "✅ Tous les fichiers ajoutés"
echo ""

# 3. Afficher le statut
echo "=== 3. Statut Git ==="
git status --short | head -20
echo ""

# 4. Créer le commit
echo "=== 4. Création du commit ==="
if git diff --cached --quiet; then
  echo "⚠️  Aucun changement dans l'index"
  echo "Création d'un commit vide pour forcer la mise à jour..."
  git commit --allow-empty -m "fix: Force update - Dockerfiles and data files

This commit ensures GitHub Actions uses the correct Dockerfiles:
- All backend services use 'npm install' instead of 'npm ci'
- Frontend uses Node.js 20-alpine for Vite 7 compatibility
- Game data JSON files are tracked in Git
- .gitignore allows data/*.json files"
else
  echo "✅ Changements détectés, création du commit..."
  git commit -m "fix: Update Dockerfiles and track game data files

- Replace npm ci with npm install in all Dockerfiles (more flexible)
- Frontend: Use Node.js 20-alpine (required for Vite 7)
- Backend: Use npm install --production --omit=dev
- Track game data JSON files (questions.json, users.json, gameState.json, scores.json)
- Add .gitkeep files to ensure data directories are versioned
- Update .gitignore to explicitly allow data/*.json files"
fi

echo ""
echo "✅ Commit créé!"
echo ""

# 5. Afficher les instructions finales
echo "═══════════════════════════════════════════════════════════"
echo "📊 Dernier commit:"
git log --oneline -1
echo ""
echo "🚀 Pour pousser sur GitHub, exécutez:"
echo ""
echo "   git push origin main"
echo ""
echo "⚠️  IMPORTANT:"
echo "   1. Après le push, GitHub Actions devrait utiliser les bons Dockerfiles"
echo "   2. Les builds devraient réussir sans erreur npm ci"
echo "   3. Les fichiers JSON seront disponibles dans le repo"
echo ""
echo "📝 Si les erreurs persistent:"
echo "   - Videz le cache GitHub Actions"
echo "   - Vérifiez que les fichiers sur GitHub sont corrects"
echo "═══════════════════════════════════════════════════════════"

