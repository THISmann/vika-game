#!/bin/bash

# Script pour tester si Nginx transmet le header Authorization
# Usage: ./k8s/scripts/test-nginx-header-transmission.sh

set -e

NAMESPACE="intelectgame"

echo "🧪 Test de transmission du header Authorization par Nginx..."
echo ""

# 1. Obtenir un token
echo "📝 1. Obtention d'un token..."
AUTH_POD=$(kubectl get pods -n "$NAMESPACE" -l app=auth-service -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "$AUTH_POD" ]; then
    echo "❌ Pod auth-service non trouvé"
    exit 1
fi

# Utiliser node pour faire la requête (curl n'est pas disponible)
echo "   Test de connexion via node..."
LOGIN_SCRIPT="
const http = require('http');
const data = JSON.stringify({username: 'admin', password: 'admin'});
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/auth/admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};
const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    const response = JSON.parse(body);
    if (response.token) {
      console.log(response.token);
    } else {
      console.error('No token received');
      process.exit(1);
    }
  });
});
req.on('error', (e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
req.write(data);
req.end();
"

TOKEN=$(kubectl exec -n "$NAMESPACE" "$AUTH_POD" -- node -e "$LOGIN_SCRIPT" 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
    echo "   ⚠️  Impossible d'obtenir un token automatiquement"
    echo "   Veuillez vous connecter manuellement et utiliser le token depuis localStorage"
    echo ""
    read -p "Entrez votre token (ou appuyez sur Entrée pour utiliser 'test-token'): " MANUAL_TOKEN
    TOKEN=${MANUAL_TOKEN:-"test-token"}
else
    echo "   ✅ Token obtenu: ${TOKEN:0:20}..."
fi

# 2. Tester directement sur game-service
echo ""
echo "🔍 2. Test direct sur game-service (sans Nginx)..."
GAME_POD=$(kubectl get pods -n "$NAMESPACE" -l app=game-service -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$GAME_POD" ]; then
    echo "   Pod: $GAME_POD"
    echo "   Test de /game/state avec token..."
    
    TEST_SCRIPT="
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: 3003,
      path: '/game/state',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer $TOKEN'
      }
    };
    const req = http.request(options, (res) => {
      console.log('Status:', res.statusCode);
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 401) {
          console.log('Response:', body.substring(0, 100));
        }
      });
    });
    req.on('error', (e) => {
      console.error('Error:', e.message);
    });
    req.end();
    "
    
    kubectl exec -n "$NAMESPACE" "$GAME_POD" -- node -e "$TEST_SCRIPT" 2>&1 | head -5
fi

# 3. Vérifier la configuration Nginx
echo ""
echo "📋 3. Vérification de la configuration Nginx..."
NGINX_POD=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$NGINX_POD" ]; then
    echo "   Pod: $NGINX_POD"
    echo ""
    echo "   Configuration pour /api/game:"
    kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- cat /etc/nginx/nginx.conf 2>/dev/null | \
      sed -n '/location \/api\/game/,/location \/socket\.io/p' | \
      grep -E "Authorization|auth|proxy_pass_request_headers|underscores" || \
      echo "   ⚠️  Configuration Authorization non trouvée"
    
    echo ""
    echo "   Vérification de underscores_in_headers:"
    kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- cat /etc/nginx/nginx.conf 2>/dev/null | \
      grep "underscores_in_headers" || echo "   ⚠️  underscores_in_headers non trouvé"
fi

echo ""
echo "✅ Test terminé"
echo ""
echo "💡 Si le test direct fonctionne mais pas via Nginx, le problème vient de Nginx"
echo "   Vérifiez que la configuration est bien appliquée et que Nginx a redémarré"
echo ""

