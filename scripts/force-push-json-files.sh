#!/bin/bash

# Script pour forcer l'inclusion des fichiers JSON dans Git et les pousser
# Usage: ./force-push-json-files.sh

set -e

echo "🚀 Forcer l'inclusion des fichiers JSON dans Git..."
echo ""

# 1. Vérifier que tous les fichiers existent
echo "=== 1. Vérification des fichiers ==="
JSON_FILES=(
  "node/auth-service/data/users.json"
  "node/quiz-service/data/questions.json"
  "node/game-service/data/gameState.json"
  "node/game-service/data/scores.json"
)

for file in "${JSON_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file non trouvé - création..."
    mkdir -p "$(dirname "$file")"
    if [[ "$file" == *"users.json" ]]; then
      echo "[]" > "$file"
    elif [[ "$file" == *"questions.json" ]]; then
      echo "[]" > "$file"
    elif [[ "$file" == *"gameState.json" ]]; then
      echo '{"isStarted":false,"currentQuestionIndex":-1,"gameCode":null}' > "$file"
    elif [[ "$file" == *"scores.json" ]]; then
      echo "[]" > "$file"
    fi
    echo "✅ Créé: $file"
  fi
done
echo ""

# 2. Forcer l'ajout avec -f (force)
echo "=== 2. Ajout forcé des fichiers ==="
git add -f node/auth-service/data/users.json
git add -f node/quiz-service/data/questions.json
git add -f node/game-service/data/gameState.json
git add -f node/game-service/data/scores.json
git add -f node/*/data/.gitkeep 2>/dev/null || true
git add -f .gitignore

echo "✅ Tous les fichiers ajoutés avec force"
echo ""

# 3. Vérifier le statut
echo "=== 3. Statut Git ==="
git status --short node/*/data/*.json node/*/data/.gitkeep .gitignore 2>&1

echo ""

# 4. Créer un commit si nécessaire
if ! git diff --cached --quiet 2>/dev/null; then
  echo "=== 4. Création du commit ==="
  git commit -m "fix: Force include JSON data files in Git

- Force add all game data JSON files (users, questions, gameState, scores)
- Ensure .gitignore properly allows data/*.json files
- Add .gitkeep files to ensure data directories exist

These files contain important game data and must be versioned."
  
  echo "✅ Commit créé"
else
  echo "=== 4. Vérification ==="
  echo "ℹ️  Aucun changement dans l'index"
  echo ""
  echo "Vérification que les fichiers sont dans les commits récents..."
  for file in "${JSON_FILES[@]}"; do
    if git log --oneline -5 -- "$file" | head -1; then
      echo "  ✅ $file est dans l'historique Git"
    else
      echo "  ❌ $file n'est pas dans l'historique Git"
    fi
  done
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Préparation terminée!"
echo ""
echo "📊 Dernier commit:"
git log --oneline -1
echo ""
echo "🚀 Pour pousser sur GitHub:"
echo "   git push origin main"
echo ""
echo "📝 Pour vérifier que les fichiers seront poussés:"
echo "   git log --oneline -1 --name-only | grep json"
echo "═══════════════════════════════════════════════════════════"

