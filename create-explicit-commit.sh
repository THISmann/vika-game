#!/bin/bash

# Script pour créer un commit explicite qui force la mise à jour sur GitHub
# Usage: ./create-explicit-commit.sh

set -e

echo "📝 Création d'un commit explicite pour forcer la mise à jour..."
echo ""

# Toucher tous les Dockerfiles pour forcer une mise à jour
touch node/auth-service/Dockerfile
touch node/quiz-service/Dockerfile
touch node/game-service/Dockerfile
touch node/telegram-bot/Dockerfile
touch vue/Dockerfile

# Ajouter tous les fichiers
git add node/*/Dockerfile vue/Dockerfile
git add node/*/data/*.json node/*/data/.gitkeep 2>/dev/null || true
git add .gitignore

# Vérifier s'il y a des changements
if git diff --cached --quiet; then
  echo "⚠️  Aucun changement détecté dans l'index"
  echo ""
  echo "Création d'un commit vide pour forcer la mise à jour..."
  # Créer un commit avec --allow-empty
  git commit --allow-empty -m "fix: Force update Dockerfiles and data files

- Ensure all Dockerfiles use npm install instead of npm ci
- Ensure frontend uses Node.js 20 for Vite 7 compatibility
- Track game data JSON files in Git
- Update .gitignore to allow data files

This commit forces GitHub Actions to rebuild with correct Dockerfiles."
else
  echo "✅ Changements détectés, création du commit..."
  git commit -m "fix: Update Dockerfiles and ensure data files are tracked

- Replace npm ci with npm install in all Dockerfiles (more flexible)
- Ensure frontend uses Node.js 20-alpine (required for Vite 7)
- Track game data JSON files (questions.json, users.json, gameState.json, scores.json)
- Add .gitkeep files to ensure data directories are versioned
- Update .gitignore to explicitly allow data/*.json files"
fi

echo ""
echo "✅ Commit créé!"
echo ""
echo "📊 Dernier commit:"
git log --oneline -1
echo ""
echo "🚀 Pour pousser sur GitHub:"
echo "   git push origin main"
echo ""
echo "⚠️  Après le push, GitHub Actions devrait utiliser les bons Dockerfiles"

