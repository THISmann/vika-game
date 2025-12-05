#!/bin/bash

# Script pour ajouter tous les package-lock.json à Git
# Usage: ./add-package-lock-files.sh

set -e

echo "📦 Ajout des package-lock.json à Git..."
echo ""

# Vérifier que tous les package-lock.json existent
echo "=== 1. Vérification des package-lock.json ==="
SERVICES=("auth-service" "quiz-service" "game-service" "telegram-bot")

for service in "${SERVICES[@]}"; do
    if [ -f "node/$service/package-lock.json" ]; then
        SIZE=$(ls -lh "node/$service/package-lock.json" | awk '{print $5}')
        echo "✅ node/$service/package-lock.json ($SIZE)"
    else
        echo "❌ node/$service/package-lock.json non trouvé"
        echo "   Génération..."
        cd "node/$service" && npm install --package-lock-only && cd - > /dev/null
        echo "   ✅ Créé"
    fi
done
echo ""

# Vérifier le frontend aussi
if [ -f "vue/front/package-lock.json" ]; then
    SIZE=$(ls -lh "vue/front/package-lock.json" | awk '{print $5}')
    echo "✅ vue/front/package-lock.json ($SIZE)"
else
    echo "⚠️  vue/front/package-lock.json non trouvé (optionnel pour le build)"
fi
echo ""

# Ajouter tous les package-lock.json
echo "=== 2. Ajout à Git ==="
git add node/auth-service/package-lock.json
git add node/quiz-service/package-lock.json
git add node/game-service/package-lock.json
git add node/telegram-bot/package-lock.json
git add vue/front/package-lock.json 2>/dev/null || echo "⚠️  vue/front/package-lock.json non ajouté (optionnel)"

# Ajouter les Dockerfiles mis à jour
echo "Ajout des Dockerfiles mis à jour..."
git add node/*/Dockerfile

# Ajouter .gitignore mis à jour
echo "Ajout de .gitignore mis à jour..."
git add .gitignore

echo "✅ Tous les fichiers ajoutés"
echo ""

# Vérifier le statut
echo "=== 3. Statut Git ==="
git status --short node/*/package-lock.json node/*/Dockerfile .gitignore | head -20
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✅ Fichiers prêts!"
echo ""
echo "📝 Pour créer le commit:"
echo ""
echo "   git commit -m 'fix: Add package-lock.json files and update Dockerfiles to use npm ci'"
echo ""
echo "   git push origin main"
echo ""
echo "⚠️  Après le push, GitHub Actions pourra utiliser npm ci avec succès"
echo "═══════════════════════════════════════════════════════════"

