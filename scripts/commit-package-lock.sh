#!/bin/bash

# Script pour créer le commit final avec tous les package-lock.json
# Usage: ./commit-package-lock.sh

set -e

echo "📝 Création du commit final..."
echo ""

# Vérifier que tous les fichiers sont ajoutés
echo "=== Fichiers à commiter ==="
git status --short node/*/package-lock.json node/*/Dockerfile .gitignore

echo ""
read -p "Voulez-vous créer le commit maintenant? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "fix: Add package-lock.json files and update Dockerfiles to use npm ci

- Add package-lock.json for all micro-services (auth, quiz, game, telegram-bot)
- Update Dockerfiles to use 'npm ci --omit=dev' instead of 'npm install'
- Update .gitignore to explicitly allow package-lock.json files
- This ensures reproducible builds in GitHub Actions

All services now have:
- package-lock.json for dependency locking
- npm ci for clean, reproducible installs
- Consistent build process across all services"
    
    echo ""
    echo "✅ Commit créé!"
    echo ""
    echo "📊 Dernier commit:"
    git log --oneline -1
    echo ""
    echo "🚀 Pour pousser sur GitHub:"
    echo "   git push origin main"
else
    echo "❌ Commit annulé"
    echo ""
    echo "📝 Pour créer le commit manuellement:"
    echo "   git commit -m 'fix: Add package-lock.json files and update Dockerfiles'"
fi

