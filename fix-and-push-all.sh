#!/bin/bash

# Script pour corriger et pousser tous les fichiers nécessaires
# Usage: ./fix-and-push-all.sh

set -e

echo "🔧 Correction et préparation des fichiers pour Git..."
echo ""

# 1. Vérifier que tous les Dockerfiles utilisent npm install
echo "=== 1. Vérification des Dockerfiles ==="
DOCKERFILES=(
  "node/auth-service/Dockerfile"
  "node/quiz-service/Dockerfile"
  "node/game-service/Dockerfile"
  "node/telegram-bot/Dockerfile"
  "vue/Dockerfile"
)

FIXED=0
for dockerfile in "${DOCKERFILES[@]}"; do
  if grep -q "^RUN.*npm ci" "$dockerfile" 2>/dev/null; then
    echo "⚠️  Correction nécessaire: $dockerfile"
    # Remplacer npm ci par npm install
    if [[ "$dockerfile" == "vue/Dockerfile" ]]; then
      sed -i.bak 's/^RUN npm ci/RUN npm install/g' "$dockerfile"
      sed -i.bak 's/^RUN npm ci --only=production/RUN npm install/g' "$dockerfile"
    else
      sed -i.bak 's/^RUN npm ci --only=production/RUN npm install --production --omit=dev/g' "$dockerfile"
      sed -i.bak 's/^RUN npm ci/RUN npm install --production --omit=dev/g' "$dockerfile"
    fi
    rm -f "${dockerfile}.bak"
    echo "✅ Corrigé: $dockerfile"
    ((FIXED++))
  else
    echo "✅ OK: $dockerfile"
  fi
done

if [ $FIXED -gt 0 ]; then
  echo ""
  echo "📝 $FIXED Dockerfile(s) corrigé(s)"
fi
echo ""

# 2. Vérifier que les fichiers JSON sont trackés
echo "=== 2. Vérification des fichiers JSON ==="
JSON_FILES=(
  "node/auth-service/data/users.json"
  "node/quiz-service/data/questions.json"
  "node/game-service/data/gameState.json"
  "node/game-service/data/scores.json"
)

MISSING=0
for json_file in "${JSON_FILES[@]}"; do
  if [ -f "$json_file" ]; then
    if git ls-files --error-unmatch "$json_file" &>/dev/null; then
      echo "✅ Tracké: $json_file"
    else
      echo "⚠️  Non tracké: $json_file"
      git add "$json_file"
      ((MISSING++))
    fi
  else
    echo "ℹ️  N'existe pas: $json_file (sera créé au runtime)"
  fi
done

# Ajouter les fichiers .gitkeep
GITKEEP_FILES=(
  "node/auth-service/data/.gitkeep"
  "node/quiz-service/data/.gitkeep"
  "node/game-service/data/.gitkeep"
)

for gitkeep in "${GITKEEP_FILES[@]}"; do
  if [ -f "$gitkeep" ]; then
    if ! git ls-files --error-unmatch "$gitkeep" &>/dev/null; then
      echo "⚠️  Ajout de: $gitkeep"
      git add "$gitkeep"
      ((MISSING++))
    fi
  fi
done

if [ $MISSING -gt 0 ]; then
  echo ""
  echo "📝 $MISSING fichier(s) JSON ajouté(s) à Git"
fi
echo ""

# 3. Vérifier le statut Git
echo "=== 3. Statut Git ==="
git status --short node/*/Dockerfile vue/Dockerfile node/*/data/*.json node/*/data/.gitkeep 2>&1 | head -20

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Vérification terminée!"
echo ""
echo "📝 Fichiers prêts à être commités:"
echo ""

# Afficher les fichiers modifiés/ajoutés
MODIFIED=$(git status --short node/*/Dockerfile vue/Dockerfile node/*/data/*.json node/*/data/.gitkeep 2>&1 | wc -l)
if [ "$MODIFIED" -gt 0 ]; then
  git status --short node/*/Dockerfile vue/Dockerfile node/*/data/*.json node/*/data/.gitkeep 2>&1
  echo ""
  echo "🚀 Pour pousser les modifications:"
  echo ""
  echo "   git add node/*/Dockerfile vue/Dockerfile node/*/data/*.json node/*/data/.gitkeep"
  echo "   git commit -m 'fix: Update Dockerfiles and add game data files'"
  echo "   git push"
else
  echo "   Aucune modification détectée"
  echo ""
  echo "ℹ️  Si les erreurs persistent sur GitHub Actions, vérifiez que:"
  echo "   1. Les fichiers sont bien poussés: git push"
  echo "   2. Le cache GitHub Actions est vidé"
fi
echo "═══════════════════════════════════════════════════════════"

