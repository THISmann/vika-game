#!/bin/bash

# Script pour diagnostiquer et corriger les problèmes d'API
# Usage: ./k8s/fix-api-routes.sh

set -e

echo "🔍 Diagnostic des problèmes d'API..."
echo ""

# 1. Vérifier les logs du quiz-service
echo "=== 1. Logs du quiz-service (dernières 50 lignes) ==="
kubectl logs -n intelectgame deployment/quiz-service --tail=50
echo ""

# 2. Vérifier la configuration Nginx actuelle
echo "=== 2. Configuration Nginx pour /api/quiz ==="
kubectl exec -n intelectgame deployment/nginx-proxy -- cat /etc/nginx/nginx.conf | grep -A 10 "location /api/quiz"
echo ""

# 3. Tester la connectivité directe au quiz-service
echo "=== 3. Test de connectivité au quiz-service ==="
QUIZ_IP=$(kubectl get svc quiz-service -n intelectgame -o jsonpath='{.spec.clusterIP}')
QUIZ_PORT=$(kubectl get svc quiz-service -n intelectgame -o jsonpath='{.spec.ports[0].port}')
echo "Quiz Service IP: $QUIZ_IP:$QUIZ_PORT"
kubectl exec -n intelectgame deployment/nginx-proxy -- wget -qO- --timeout=3 "http://${QUIZ_IP}:${QUIZ_PORT}/quiz/all" 2>&1 | head -10 || echo "ÉCHEC"
echo ""

# 4. Vérifier les endpoints
echo "=== 4. Endpoints du quiz-service ==="
kubectl get endpoints quiz-service -n intelectgame
echo ""

# 5. Vérifier les pods
echo "=== 5. État des pods quiz-service ==="
kubectl get pods -n intelectgame | grep quiz-service
echo ""

# 6. Tester depuis le pod Nginx avec la route complète
echo "=== 6. Test de la route /quiz/create ==="
kubectl exec -n intelectgame deployment/nginx-proxy -- sh -c "echo 'POST /quiz/create' | nc ${QUIZ_IP} ${QUIZ_PORT}" || echo "Test échoué"
echo ""

echo "✅ Diagnostic terminé!"
echo ""
echo "📝 Prochaines étapes:"
echo "1. Vérifiez les logs du quiz-service pour voir l'erreur exacte"
echo "2. Vérifiez que le fichier de questions est accessible en écriture"
echo "3. Vérifiez la configuration Nginx"

