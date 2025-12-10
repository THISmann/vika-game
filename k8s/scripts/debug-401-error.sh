#!/bin/bash

# Script pour déboguer l'erreur 401
# Usage: ./k8s/scripts/debug-401-error.sh

set -e

NAMESPACE="intelectgame"

echo "🐛 Débogage de l'erreur 401 Unauthorized..."
echo ""

# 1. Vérifier les services
echo "📊 1. État des services:"
kubectl get pods -n "$NAMESPACE" -l 'app in (nginx-proxy,game-service,auth-service)'

# 2. Vérifier la configuration Nginx
echo ""
echo "📝 2. Configuration Nginx pour Authorization:"
NGINX_POD=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$NGINX_POD" ]; then
    echo "   Pod: $NGINX_POD"
    echo ""
    echo "   Configuration /api/game:"
    kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- cat /etc/nginx/nginx.conf 2>/dev/null | \
      sed -n '/location \/api\/game/,/location \/socket\.io/p' | \
      grep -E "Authorization|proxy_pass_request_headers" || echo "   ⚠️  Configuration Authorization non trouvée"
else
    echo "   ❌ Pod Nginx non trouvé"
fi

# 3. Vérifier les logs du game-service
echo ""
echo "📋 3. Logs récents du game-service (chercher les erreurs 401):"
GAME_POD=$(kubectl get pods -n "$NAMESPACE" -l app=game-service -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$GAME_POD" ]; then
    echo "   Pod: $GAME_POD"
    echo ""
    echo "   Dernières lignes avec 'AUTHENTICATION' ou '401':"
    kubectl logs "$GAME_POD" -n "$NAMESPACE" --tail=100 2>/dev/null | \
      grep -E "AUTHENTICATION|Authorization|401|No authorization" | tail -5 || \
      echo "   Aucun log d'authentification trouvé (normal si aucune requête récente)"
    
    echo ""
    echo "   Tous les logs récents (dernières 20 lignes):"
    kubectl logs "$GAME_POD" -n "$NAMESPACE" --tail=20 2>/dev/null
else
    echo "   ❌ Pod game-service non trouvé"
fi

# 4. Vérifier les logs Nginx
echo ""
echo "📋 4. Logs récents de Nginx:"
if [ -n "$NGINX_POD" ]; then
    echo "   Dernières requêtes vers /api/game:"
    kubectl logs "$NGINX_POD" -n "$NAMESPACE" --tail=30 2>/dev/null | \
      grep "/api/game" | tail -5 || echo "   Aucune requête récente"
fi

# 5. Instructions pour le frontend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 Instructions pour déboguer depuis le navigateur:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Ouvrez la console du navigateur (F12)"
echo ""
echo "2. Vérifiez que le token existe:"
echo "   localStorage.getItem('adminToken')"
echo ""
echo "3. Si le token n'existe pas, reconnectez-vous:"
echo "   - Allez sur http://82.202.141.248/admin/login"
echo "   - Connectez-vous avec admin/admin"
echo ""
echo "4. Ouvrez l'onglet Network (F12 > Network)"
echo ""
echo "5. Faites une action admin (ex: démarrer le jeu)"
echo ""
echo "6. Cliquez sur la requête 'POST /api/game/start'"
echo ""
echo "7. Vérifiez dans 'Request Headers' que 'Authorization: Bearer ...' est présent"
echo ""
echo "8. Si le header n'est pas présent, le problème vient du frontend"
echo "   Si le header est présent mais vous avez toujours 401, le problème vient de Nginx ou du backend"
echo ""

