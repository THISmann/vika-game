#!/bin/bash

# Script pour corriger les problèmes du quiz-service
# Usage: ./k8s/fix-quiz-service.sh

set -e

echo "🔧 Correction du quiz-service..."
echo ""

# 1. Vérifier les logs pour voir l'erreur exacte
echo "=== 1. Logs du quiz-service (dernières erreurs) ==="
kubectl logs -n intelectgame deployment/quiz-service --tail=30 | grep -i "error\|exception\|enoent" || echo "Aucune erreur récente"
echo ""

# 2. Vérifier si le répertoire data existe
echo "=== 2. Vérification du répertoire /app/data ==="
POD_NAME=$(kubectl get pods -n intelectgame -l app=quiz-service -o jsonpath='{.items[0].metadata.name}')
echo "Pod: $POD_NAME"
kubectl exec -n intelectgame $POD_NAME -- ls -la /app/data 2>&1 || echo "Répertoire non accessible"
echo ""

# 3. Vérifier si le fichier questions.json existe
echo "=== 3. Vérification du fichier questions.json ==="
kubectl exec -n intelectgame $POD_NAME -- test -f /app/data/questions.json && echo "✅ Fichier existe" || echo "❌ Fichier n'existe pas"
kubectl exec -n intelectgame $POD_NAME -- cat /app/data/questions.json 2>&1 | head -5 || echo "Impossible de lire le fichier"
echo ""

# 4. Créer le fichier s'il n'existe pas
echo "=== 4. Création/Initialisation du fichier questions.json ==="
kubectl exec -n intelectgame $POD_NAME -- sh -c "
  if [ ! -f /app/data/questions.json ]; then
    echo 'Création du fichier questions.json...'
    echo '[]' > /app/data/questions.json
    echo '✅ Fichier créé'
  else
    echo '✅ Fichier existe déjà'
  fi
  chmod 666 /app/data/questions.json
  ls -la /app/data/questions.json
"
echo ""

# 5. Vérifier les permissions
echo "=== 5. Vérification des permissions ==="
kubectl exec -n intelectgame $POD_NAME -- ls -la /app/data/
echo ""

# 6. Tester l'API directement
echo "=== 6. Test de l'API /quiz/all ==="
QUIZ_IP=$(kubectl get svc quiz-service -n intelectgame -o jsonpath='{.spec.clusterIP}')
QUIZ_PORT=$(kubectl get svc quiz-service -n intelectgame -o jsonpath='{.spec.ports[0].port}')
kubectl exec -n intelectgame deployment/nginx-proxy -- wget -qO- --timeout=3 "http://${QUIZ_IP}:${QUIZ_PORT}/quiz/all" 2>&1 | head -10 || echo "ÉCHEC"
echo ""

# 7. Redémarrer le pod si nécessaire
echo "=== 7. Redémarrage du pod quiz-service ==="
read -p "Voulez-vous redémarrer le pod quiz-service? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    kubectl rollout restart deployment/quiz-service -n intelectgame
    echo "⏳ Attente du redémarrage..."
    sleep 10
    kubectl wait --for=condition=ready pod -l app=quiz-service -n intelectgame --timeout=60s || echo "⚠️  Timeout"
    echo "✅ Pod redémarré"
fi
echo ""

echo "✅ Correction terminée!"
echo ""
echo "📝 Testez maintenant l'API depuis le frontend"

