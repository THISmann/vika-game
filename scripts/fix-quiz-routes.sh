#!/bin/bash

# Script pour corriger les routes quiz et redéployer
# Usage: ./fix-quiz-routes.sh

set -e

echo "🔧 Correction des routes quiz-service..."
echo ""

# 1. Vérifier que les changements sont commités
echo "=== 1. Vérification des fichiers ==="
if [ -f "node/quiz-service/routes/quiz.routes.js" ]; then
  echo "✅ Fichier quiz.routes.js existe"
  
  # Vérifier si la route /questions existe
  if grep -q 'router.get("/questions"' node/quiz-service/routes/quiz.routes.js; then
    echo "✅ Route /questions trouvée"
  else
    echo "❌ Route /questions non trouvée dans le fichier"
    exit 1
  fi
else
  echo "❌ Fichier quiz.routes.js non trouvé"
  exit 1
fi
echo ""

# 2. Instructions pour rebuild et push
echo "═══════════════════════════════════════════════════════════"
echo "📝 Instructions pour appliquer les corrections"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Sur votre machine locale, rebuild l'image Docker:"
echo "   cd node/quiz-service"
echo "   docker build -t thismann17/gamev2-quiz-service:latest ."
echo "   docker push thismann17/gamev2-quiz-service:latest"
echo ""
echo "2. Sur le serveur, redémarrer le service:"
echo "   kubectl rollout restart deployment/quiz-service -n intelectgame"
echo ""
echo "3. Vérifier que ça fonctionne:"
echo "   kubectl rollout status deployment/quiz-service -n intelectgame"
echo "   ./test-all-endpoints.sh http://82.202.141.248"
echo ""
echo "═══════════════════════════════════════════════════════════"

