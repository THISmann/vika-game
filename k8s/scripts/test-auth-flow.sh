#!/bin/bash

# Script pour tester le flux d'authentification complet
# Usage: ./k8s/scripts/test-auth-flow.sh

set -e

NAMESPACE="intelectgame"

echo "🧪 Test du flux d'authentification..."
echo ""

# 1. Obtenir un token
echo "📝 1. Test de connexion admin..."
AUTH_POD=$(kubectl get pods -n "$NAMESPACE" -l app=auth-service -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "$AUTH_POD" ]; then
    echo "❌ Pod auth-service non trouvé"
    exit 1
fi

echo "   Pod: $AUTH_POD"
echo "   Test de connexion..."

LOGIN_RESPONSE=$(kubectl exec -n "$NAMESPACE" "$AUTH_POD" -- curl -s -X POST http://localhost:3001/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' 2>/dev/null || echo "")

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "   ✅ Token obtenu: ${TOKEN:0:20}..."
else
    echo "   ❌ Échec de la connexion"
    echo "   Réponse: $LOGIN_RESPONSE"
    exit 1
fi

# 2. Tester avec le token directement sur game-service
echo ""
echo "🔍 2. Test direct sur game-service avec token..."
GAME_POD=$(kubectl get pods -n "$NAMESPACE" -l app=game-service -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "$GAME_POD" ]; then
    echo "❌ Pod game-service non trouvé"
    exit 1
fi

echo "   Pod: $GAME_POD"
echo "   Test de /game/start avec token..."

RESPONSE=$(kubectl exec -n "$NAMESPACE" "$GAME_POD" -- curl -s -X POST http://localhost:3003/game/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"questionDuration":30}' 2>/dev/null || echo "")

if echo "$RESPONSE" | grep -q "started\|error\|401\|403"; then
    echo "   Réponse: $RESPONSE"
    if echo "$RESPONSE" | grep -q "401\|403"; then
        echo "   ❌ Erreur d'authentification"
    else
        echo "   ✅ Requête acceptée (peut être une erreur de jeu, mais l'auth fonctionne)"
    fi
else
    echo "   ⚠️  Réponse inattendue: $RESPONSE"
fi

# 3. Tester via Nginx
echo ""
echo "🌐 3. Test via Nginx avec token..."
NGINX_POD=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$NGINX_POD" ]; then
    echo "   Pod: $NGINX_POD"
    echo "   Test de /api/game/state via Nginx..."
    
    RESPONSE=$(kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- curl -s -X GET http://localhost/api/game/state \
      -H "Host: 82.202.141.248" \
      -H "Authorization: Bearer $TOKEN" 2>/dev/null || echo "")
    
    if [ -n "$RESPONSE" ]; then
        echo "   ✅ Réponse reçue (code HTTP dans les logs)"
        echo "   Réponse: ${RESPONSE:0:100}..."
    else
        echo "   ⚠️  Aucune réponse"
    fi
fi

echo ""
echo "✅ Tests terminés"
echo ""
echo "💡 Si les tests directs fonctionnent mais pas via le navigateur:"
echo "   1. Vérifiez que le token est stocké dans localStorage"
echo "   2. Vérifiez que le frontend envoie bien le header Authorization"
echo "   3. Vérifiez les logs Nginx pour voir si le header est transmis"
echo ""

