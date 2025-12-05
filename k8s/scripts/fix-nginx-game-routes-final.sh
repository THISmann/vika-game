#!/bin/bash

# Script pour corriger définitivement les routes /api/game dans Nginx
# Usage: ./k8s/scripts/fix-nginx-game-routes-final.sh

set -e

NAMESPACE="intelectgame"

echo "🔧 Correction définitive des routes /api/game dans Nginx..."
echo ""

# 1. Appliquer la configuration corrigée
echo "1. Application de la configuration Nginx corrigée..."
kubectl apply -f k8s/nginx-proxy-config.yaml -n $NAMESPACE

# 2. Redémarrer le deployment nginx-proxy
echo ""
echo "2. Redémarrage du deployment nginx-proxy..."
kubectl rollout restart deployment/nginx-proxy -n $NAMESPACE

# 3. Attendre que le pod soit prêt
echo ""
echo "3. Attente que nginx-proxy redémarre..."
kubectl rollout status deployment/nginx-proxy -n $NAMESPACE --timeout=60s

# 4. Vérifier les pods
echo ""
echo "4. Vérification des pods nginx-proxy..."
kubectl get pods -n $NAMESPACE -l app=nginx-proxy

# 5. Tester depuis l'intérieur du cluster
echo ""
echo "5. Test de routage depuis l'intérieur du cluster..."
POD_NAME=$(kubectl get pods -n $NAMESPACE -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$POD_NAME" ]; then
    echo "   Test depuis le pod: $POD_NAME"
    
    # Tester /api/game/state
    echo "   Test 1: /api/game/state"
    RESULT1=$(kubectl exec -n $NAMESPACE $POD_NAME -- wget -qO- --timeout=5 http://localhost/api/game/state 2>&1 | head -5 || echo "FAILED")
    if echo "$RESULT1" | grep -q "isStarted\|currentQuestionIndex\|gameCode"; then
        echo "   ✅ /api/game/state fonctionne"
    else
        echo "   ❌ /api/game/state échoue: $RESULT1"
    fi
    
    # Tester /api/game/players
    echo "   Test 2: /api/game/players"
    RESULT2=$(kubectl exec -n $NAMESPACE $POD_NAME -- wget -qO- --timeout=5 http://localhost/api/game/players 2>&1 | head -5 || echo "FAILED")
    if echo "$RESULT2" | grep -q "\[\]\|playerId\|playerName"; then
        echo "   ✅ /api/game/players fonctionne"
    else
        echo "   ❌ /api/game/players échoue: $RESULT2"
    fi
    
    # Tester /api/game/players/count
    echo "   Test 3: /api/game/players/count"
    RESULT3=$(kubectl exec -n $NAMESPACE $POD_NAME -- wget -qO- --timeout=5 http://localhost/api/game/players/count 2>&1 | head -5 || echo "FAILED")
    if echo "$RESULT3" | grep -q "count"; then
        echo "   ✅ /api/game/players/count fonctionne"
    else
        echo "   ❌ /api/game/players/count échoue: $RESULT3"
    fi
else
    echo "   ❌ Aucun pod nginx-proxy trouvé"
fi

echo ""
echo "✅ Correction appliquée !"
echo ""
echo "🧪 TESTS À EFFECTUER :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Depuis votre navigateur ou curl :"
echo ""
echo "  curl http://82.202.141.248:30081/api/game/state"
echo "  curl http://82.202.141.248:30081/api/game/players"
echo "  curl http://82.202.141.248:30081/api/game/players/count"
echo ""
echo "Ces commandes devraient retourner du JSON au lieu de 404."
echo ""
echo "📋 Pour voir les logs Nginx :"
echo "  kubectl logs -n $NAMESPACE -l app=nginx-proxy --tail=50 -f"
echo ""

