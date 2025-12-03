#!/bin/bash

# Script pour initialiser le fichier questions.json dans tous les pods quiz-service
# Usage: ./k8s/init-quiz-questions.sh

set -e

echo "🔧 Initialisation du fichier questions.json..."
echo ""

# Obtenir tous les pods quiz-service
PODS=$(kubectl get pods -n intelectgame -l app=quiz-service -o jsonpath='{.items[*].metadata.name}')

if [ -z "$PODS" ]; then
    echo "❌ Aucun pod quiz-service trouvé"
    exit 1
fi

for POD in $PODS; do
    echo "=== Traitement du pod: $POD ==="
    
    # Créer le répertoire s'il n'existe pas
    kubectl exec -n intelectgame $POD -- sh -c "
        mkdir -p /app/data
        if [ ! -f /app/data/questions.json ]; then
            echo '[]' > /app/data/questions.json
            echo '✅ Fichier questions.json créé'
        else
            echo 'ℹ️  Fichier questions.json existe déjà'
        fi
        chmod 666 /app/data/questions.json
        ls -la /app/data/questions.json
    " || echo "❌ Erreur lors de l'initialisation du pod $POD"
    echo ""
done

echo "✅ Initialisation terminée!"
echo ""
echo "📝 Les questions devraient maintenant être accessibles"
echo "   Testez: curl http://192.168.49.2:30081/api/quiz/all"

