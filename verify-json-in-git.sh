#!/bin/bash

# Script pour vérifier que les fichiers JSON sont bien dans Git
# Usage: ./verify-json-in-git.sh

set -e

echo "🔍 Vérification que les fichiers JSON sont dans Git..."
echo ""

JSON_FILES=(
  "node/auth-service/data/users.json"
  "node/quiz-service/data/questions.json"
  "node/game-service/data/gameState.json"
  "node/game-service/data/scores.json"
)

echo "=== 1. Vérification dans l'arbre Git (HEAD) ==="
for file in "${JSON_FILES[@]}"; do
  if git ls-tree -r HEAD --name-only | grep -q "^$file$"; then
    echo "✅ Dans HEAD: $file"
    # Afficher quelques lignes du contenu
    echo "   Contenu (premières lignes):"
    git show HEAD:"$file" 2>/dev/null | head -3 | sed 's/^/   /' || echo "   (impossible de lire)"
  else
    echo "❌ PAS dans HEAD: $file"
  fi
done
echo ""

echo "=== 2. Vérification dans l'historique Git ==="
for file in "${JSON_FILES[@]}"; do
  COMMIT=$(git log --oneline --all -- "$file" | head -1)
  if [ -n "$COMMIT" ]; then
    echo "✅ Trouvé dans: $COMMIT - $file"
  else
    echo "❌ Jamais commité: $file"
  fi
done
echo ""

echo "=== 3. Vérification du tracking ==="
for file in "${JSON_FILES[@]}"; do
  if git ls-files --error-unmatch "$file" &>/dev/null; then
    echo "✅ Tracké: $file"
  else
    echo "❌ Non tracké: $file"
  fi
done
echo ""

echo "=== 4. Vérification du .gitignore ==="
for file in "${JSON_FILES[@]}"; do
  if git check-ignore -q "$file"; then
    echo "❌ Ignoré: $file"
    git check-ignore -v "$file"
  else
    echo "✅ Non ignoré: $file"
  fi
done
echo ""

echo "=== 5. Taille des fichiers ==="
for file in "${JSON_FILES[@]}"; do
  if [ -f "$file" ]; then
    SIZE=$(wc -c < "$file")
    echo "   $file: $SIZE bytes"
  fi
done
echo ""

echo "=== 6. Action recommandée ==="
MISSING_IN_HEAD=0
for file in "${JSON_FILES[@]}"; do
  if ! git ls-tree -r HEAD --name-only | grep -q "^$file$"; then
    ((MISSING_IN_HEAD++))
  fi
done

if [ $MISSING_IN_HEAD -gt 0 ]; then
  echo "⚠️  $MISSING_IN_HEAD fichier(s) manquant(s) dans HEAD"
  echo ""
  echo "📝 Pour les ajouter:"
  echo "   git add -f node/*/data/*.json"
  echo "   git commit -m 'fix: Add JSON data files to make them visible'"
  echo "   git push origin main"
else
  echo "✅ Tous les fichiers sont dans HEAD"
  echo ""
  echo "📝 Pour pousser sur GitHub:"
  echo "   git push origin main"
  echo ""
  echo "ℹ️  Si les fichiers ne sont pas visibles sur GitHub après le push,"
  echo "   vérifiez qu'ils ont suffisamment de contenu (au moins 50 bytes)"
fi

