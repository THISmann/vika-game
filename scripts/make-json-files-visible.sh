#!/bin/bash

# Script pour rendre les fichiers JSON visibles sur GitHub
# Usage: ./make-json-files-visible.sh

set -e

echo "🔍 Rendre les fichiers JSON visibles sur GitHub..."
echo ""

# 1. Vérifier que les fichiers existent et ont du contenu
echo "=== 1. Vérification des fichiers JSON ==="
JSON_FILES=(
  "node/auth-service/data/users.json"
  "node/quiz-service/data/questions.json"
  "node/game-service/data/gameState.json"
  "node/game-service/data/scores.json"
)

for file in "${JSON_FILES[@]}"; do
  if [ -f "$file" ]; then
    SIZE=$(wc -c < "$file")
    LINES=$(wc -l < "$file")
    echo "✅ $file ($SIZE bytes, $LINES lignes)"
    
    # Vérifier que le fichier n'est pas vide
    if [ "$SIZE" -lt 10 ]; then
      echo "⚠️  Fichier très petit, ajout de contenu minimal..."
      if [[ "$file" == *"users.json" ]]; then
        echo '[]' > "$file"
      elif [[ "$file" == *"questions.json" ]]; then
        echo '[]' > "$file"
      elif [[ "$file" == *"gameState.json" ]]; then
        echo '{"isStarted":false,"currentQuestionIndex":-1}' > "$file"
      elif [[ "$file" == *"scores.json" ]]; then
        echo '[]' > "$file"
      fi
    fi
  else
    echo "❌ $file non trouvé - création..."
    mkdir -p "$(dirname "$file")"
    if [[ "$file" == *"users.json" ]]; then
      echo '[]' > "$file"
    elif [[ "$file" == *"questions.json" ]]; then
      echo '[]' > "$file"
    elif [[ "$file" == *"gameState.json" ]]; then
      echo '{"isStarted":false,"currentQuestionIndex":-1}' > "$file"
    elif [[ "$file" == *"scores.json" ]]; then
      echo '[]' > "$file"
    fi
    echo "✅ Créé: $file"
  fi
done
echo ""

# 2. Vérifier le .gitignore
echo "=== 2. Vérification du .gitignore ==="
if grep -q "^# !node/auth-service/data/\*\.json$" .gitignore; then
  echo "⚠️  Les exceptions sont commentées dans .gitignore"
  echo "📝 Décommentage des exceptions..."
  sed -i.bak 's/^# !node\/\([^/]*\)\/data\/\(.*\)$/!node\/\1\/data\/\2/' .gitignore
  echo "✅ .gitignore corrigé"
elif grep -q "^!node/auth-service/data/\*\.json$" .gitignore; then
  echo "✅ .gitignore correct (exceptions actives)"
else
  echo "⚠️  Problème avec .gitignore, correction..."
  # Ajouter les exceptions si elles n'existent pas
  cat >> .gitignore << 'EOF'

# IMPORTANT: Game data JSON files must be tracked
!node/auth-service/data/
!node/auth-service/data/*.json
!node/auth-service/data/.gitkeep
!node/quiz-service/data/
!node/quiz-service/data/*.json
!node/quiz-service/data/.gitkeep
!node/game-service/data/
!node/game-service/data/*.json
!node/game-service/data/.gitkeep
EOF
  echo "✅ Exceptions ajoutées au .gitignore"
fi
echo ""

# 3. Forcer l'ajout de tous les fichiers
echo "=== 3. Ajout forcé des fichiers ==="
git add -f .gitignore
git add -f node/auth-service/data/users.json
git add -f node/quiz-service/data/questions.json
git add -f node/game-service/data/gameState.json
git add -f node/game-service/data/scores.json
git add -f node/*/data/.gitkeep 2>/dev/null || true

echo "✅ Tous les fichiers ajoutés avec force"
echo ""

# 4. Vérifier le statut
echo "=== 4. Statut Git ==="
git status --short node/*/data/*.json node/*/data/.gitkeep .gitignore 2>&1 | head -15

echo ""

# 5. Vérifier que les fichiers ne sont pas ignorés
echo "=== 5. Vérification que les fichiers ne sont pas ignorés ==="
ALL_OK=true
for file in "${JSON_FILES[@]}"; do
  if git check-ignore -q "$file"; then
    echo "❌ Ignoré: $file"
    git check-ignore -v "$file"
    ALL_OK=false
  else
    echo "✅ Non ignoré: $file"
  fi
done

if [ "$ALL_OK" = false ]; then
  echo ""
  echo "⚠️  Certains fichiers sont encore ignorés!"
  echo "📝 Vérifiez le .gitignore et réessayez"
  exit 1
fi
echo ""

# 6. Créer un commit explicite
echo "=== 6. Création du commit ==="
if ! git diff --cached --quiet 2>/dev/null; then
  git commit -m "fix: Make JSON data files visible on GitHub

- Uncomment .gitignore exceptions for data/*.json files
- Force add all JSON data files to ensure they are tracked
- Ensure files have sufficient content to be visible on GitHub

Files included:
- node/auth-service/data/users.json
- node/quiz-service/data/questions.json
- node/game-service/data/gameState.json
- node/game-service/data/scores.json

These files contain important game data and must be versioned and visible."
  
  echo "✅ Commit créé"
else
  echo "ℹ️  Aucun changement à commiter"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Fichiers JSON prêts à être poussés!"
echo ""
echo "📊 Dernier commit:"
git log --oneline -1
echo ""
echo "📝 Fichiers dans le commit:"
git show HEAD --name-only --pretty=format:"" | grep -E "(data/|\.gitignore)" | head -10
echo ""
echo "🚀 Pour pousser sur GitHub:"
echo "   git push origin main"
echo ""
echo "✅ Après le push, les fichiers seront visibles sur GitHub dans:"
echo "   - node/auth-service/data/users.json"
echo "   - node/quiz-service/data/questions.json"
echo "   - node/game-service/data/gameState.json"
echo "   - node/game-service/data/scores.json"
echo "═══════════════════════════════════════════════════════════"

