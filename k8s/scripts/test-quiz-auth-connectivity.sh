#!/bin/bash

# Script pour tester la connectivité entre quiz-service et auth-service

NAMESPACE="intelectgame"
QUIZ_SERVICE_LABEL="quiz-service"
AUTH_SERVICE_LABEL="auth-service"

echo "🔬 Test de connectivité quiz-service → auth-service"
echo ""

# 1. Vérifier que les pods sont en cours d'exécution
echo "--- 1. Vérification des pods ---"
QUIZ_POD=$(kubectl get pods -n $NAMESPACE -l app=$QUIZ_SERVICE_LABEL -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
AUTH_POD=$(kubectl get pods -n $NAMESPACE -l app=$AUTH_SERVICE_LABEL -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [ -z "$QUIZ_POD" ]; then
  echo "❌ Aucun pod quiz-service trouvé."
  exit 1
fi

if [ -z "$AUTH_POD" ]; then
  echo "❌ Aucun pod auth-service trouvé."
  exit 1
fi

echo "✅ Pod quiz-service: $QUIZ_POD"
echo "✅ Pod auth-service: $AUTH_POD"
echo ""

# 2. Vérifier les variables d'environnement
echo "--- 2. Variables d'environnement du quiz-service ---"
echo "AUTH_SERVICE_URL:"
kubectl exec -n $NAMESPACE $QUIZ_POD -- env | grep AUTH_SERVICE_URL
echo ""

# 3. Tester la connectivité réseau
echo "--- 3. Test de connectivité réseau ---"
echo "Test 1: Ping auth-service depuis quiz-service"
kubectl exec -n $NAMESPACE $QUIZ_POD -- ping -c 2 auth-service 2>&1 | head -n 5
echo ""

echo "Test 2: Test endpoint /auth/test"
kubectl exec -n $NAMESPACE $QUIZ_POD -- wget -qO- --timeout=10 http://auth-service:3001/auth/test 2>&1
echo ""
echo ""

# 4. Tester l'endpoint verify-token avec un token de test
echo "--- 4. Test de l'endpoint /auth/verify-token ---"
# Générer un token de test (admin-timestamp)
TEST_TOKEN=$(echo -n "admin-$(date +%s)000" | base64)
echo "Token de test: $TEST_TOKEN"
echo ""

echo "Test sans header Authorization (devrait échouer):"
kubectl exec -n $NAMESPACE $QUIZ_POD -- wget -qO- --timeout=10 http://auth-service:3001/auth/verify-token 2>&1 | head -n 5
echo ""

echo "Test avec header Authorization (devrait réussir si le token est valide):"
kubectl exec -n $NAMESPACE $QUIZ_POD -- wget -qO- --timeout=10 --header="Authorization: Bearer $TEST_TOKEN" http://auth-service:3001/auth/verify-token 2>&1
echo ""
echo ""

# 5. Vérifier les logs du quiz-service pour les erreurs d'authentification
echo "--- 5. Dernières erreurs d'authentification dans quiz-service ---"
kubectl logs $QUIZ_POD -n $NAMESPACE --tail=100 | grep -A 10 "AUTH SERVICE ERROR" | tail -n 30
echo ""

# 6. Vérifier les logs de l'auth-service
echo "--- 6. Derniers logs de l'auth-service ---"
kubectl logs $AUTH_POD -n $NAMESPACE --tail=50 | grep -E "(verify-token|verifyToken|Auth service)" | tail -n 20
echo ""

# 7. Vérifier le service Kubernetes
echo "--- 7. Service Kubernetes auth-service ---"
kubectl get svc -n $NAMESPACE auth-service
echo ""

# 8. Vérifier la résolution DNS
echo "--- 8. Test de résolution DNS ---"
kubectl exec -n $NAMESPACE $QUIZ_POD -- nslookup auth-service 2>&1 | head -n 10
echo ""

echo "✅ Tests terminés."
echo ""
echo "💡 Si les tests échouent:"
echo "   1. Vérifiez que l'auth-service est en cours d'exécution"
echo "   2. Vérifiez que le service Kubernetes auth-service existe"
echo "   3. Vérifiez que AUTH_SERVICE_URL est correctement configuré"
echo "   4. Vérifiez les logs de l'auth-service pour les erreurs"

