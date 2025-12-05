#!/bin/bash

# Script pour diagnostiquer l'erreur 500 sur /api/quiz/create
# Usage: ./diagnose-quiz-error.sh [base_url]

set -e

BASE_URL="${1:-http://82.202.141.248}"
API_BASE="${BASE_URL}/api"
NAMESPACE="intelectgame"

echo "🔍 Diagnostic de l'erreur 500 sur /api/quiz/create"
echo "📍 URL: $BASE_URL"
echo ""

# 1. Vérifier que le service quiz-service existe
echo "=== 1. Vérification du service quiz-service ==="
if kubectl get deployment -n "$NAMESPACE" quiz-service &>/dev/null; then
  echo "✅ Service quiz-service existe"
else
  echo "❌ Service quiz-service non trouvé"
  exit 1
fi
echo ""

# 2. Vérifier les pods
echo "=== 2. Statut des pods quiz-service ==="
kubectl get pods -n "$NAMESPACE" -l app=quiz-service
echo ""

# 3. Vérifier les logs récents
echo "=== 3. Derniers logs (erreurs) ==="
PODS=$(kubectl get pods -n "$NAMESPACE" -l app=quiz-service -o jsonpath='{.items[*].metadata.name}' 2>/dev/null)
if [ -z "$PODS" ]; then
  echo "❌ Aucun pod trouvé"
  exit 1
fi

for pod in $PODS; do
  echo "── Pod: $pod ──"
  kubectl logs -n "$NAMESPACE" "$pod" --tail=50 | grep -i "error\|exception\|fail" | tail -10 || echo "   Aucune erreur récente"
  echo ""
done

# 4. Vérifier la connexion MongoDB
echo "=== 4. Connexion MongoDB ==="
for pod in $PODS; do
  echo "── Pod: $pod ──"
  MONGODB_LOGS=$(kubectl logs -n "$NAMESPACE" "$pod" --tail=100 | grep -i "mongodb\|mongoose" | tail -5)
  if [ -n "$MONGODB_LOGS" ]; then
    echo "$MONGODB_LOGS"
  else
    echo "   ⚠️  Aucun log MongoDB trouvé"
  fi
  echo ""
done

# 5. Vérifier les variables d'environnement
echo "=== 5. Variables d'environnement ==="
for pod in $PODS; do
  echo "── Pod: $pod ──"
  echo "   MONGODB_URI:"
  kubectl exec -n "$NAMESPACE" "$pod" -- env | grep MONGODB_URI || echo "   ❌ MONGODB_URI non trouvé"
  echo ""
done

# 6. Tester la connexion MongoDB depuis le pod
echo "=== 6. Test de connexion MongoDB depuis le pod ==="
FIRST_POD=$(echo $PODS | awk '{print $1}')
echo "── Test depuis pod: $FIRST_POD ──"

# Vérifier si mongosh est disponible
if kubectl exec -n "$NAMESPACE" "$FIRST_POD" -- which mongosh &>/dev/null; then
  echo "   ✅ mongosh disponible"
  MONGODB_URI=$(kubectl exec -n "$NAMESPACE" "$FIRST_POD" -- env | grep MONGODB_URI | cut -d= -f2)
  if [ -n "$MONGODB_URI" ]; then
    echo "   Test de connexion à: $MONGODB_URI"
    kubectl exec -n "$NAMESPACE" "$FIRST_POD" -- mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')" 2>&1 || echo "   ❌ Échec de connexion"
  fi
else
  echo "   ⚠️  mongosh non disponible dans le pod"
fi
echo ""

# 7. Tester l'endpoint directement
echo "=== 7. Test de l'endpoint /api/quiz/create ==="
TEST_DATA='{"question":"Diagnostic Test '$(date +%s)'","choices":["A","B","C","D"],"answer":"A"}'
echo "   Requête: POST $API_BASE/quiz/create"
echo "   Data: $TEST_DATA"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_BASE/quiz/create" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" 2>&1 || echo -e "\nHTTP_CODE:000")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "   Status: $HTTP_CODE"
echo "   Réponse:"
if [ -n "$BODY" ]; then
  echo "$BODY" | head -20
else
  echo "   (vide)"
fi
echo ""

# 8. Vérifier le ConfigMap
echo "=== 8. Configuration (ConfigMap) ==="
if kubectl get configmap -n "$NAMESPACE" app-config &>/dev/null; then
  echo "✅ ConfigMap app-config existe"
  echo "   MONGODB_URI:"
  kubectl get configmap -n "$NAMESPACE" app-config -o jsonpath='{.data.MONGODB_URI}' || echo "   ❌ Non trouvé"
  echo ""
else
  echo "❌ ConfigMap app-config non trouvé"
fi

# 9. Vérifier MongoDB
echo "=== 9. Vérification de MongoDB ==="
if kubectl get deployment -n "$NAMESPACE" mongodb &>/dev/null; then
  echo "✅ MongoDB est déployé"
  MONGODB_PODS=$(kubectl get pods -n "$NAMESPACE" -l app=mongodb -o jsonpath='{.items[*].metadata.name}' 2>/dev/null)
  if [ -n "$MONGODB_PODS" ]; then
    for mongo_pod in $MONGODB_PODS; do
      STATUS=$(kubectl get pod -n "$NAMESPACE" "$mongo_pod" -o jsonpath='{.status.phase}')
      echo "   Pod MongoDB: $mongo_pod - Status: $STATUS"
    done
  else
    echo "   ⚠️  Aucun pod MongoDB trouvé"
  fi
else
  echo "❌ MongoDB n'est pas déployé"
fi
echo ""

# 10. Recommandations
echo "═══════════════════════════════════════════════════════════"
echo "💡 Recommandations"
echo "═══════════════════════════════════════════════════════════"

if [ "$HTTP_CODE" != "200" ]; then
  echo ""
  echo "🔧 Actions à effectuer:"
  echo ""
  echo "1. Vérifier les logs complets:"
  echo "   kubectl logs -n $NAMESPACE deployment/quiz-service --tail=100"
  echo ""
  echo "2. Vérifier que MongoDB est accessible:"
  echo "   kubectl exec -it -n $NAMESPACE deployment/quiz-service -- sh"
  echo "   # Dans le pod:"
  echo "   echo \$MONGODB_URI"
  echo ""
  echo "3. Redémarrer le service:"
  echo "   kubectl rollout restart deployment/quiz-service -n $NAMESPACE"
  echo ""
  echo "4. Vérifier les événements:"
  echo "   kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | grep quiz-service"
fi

