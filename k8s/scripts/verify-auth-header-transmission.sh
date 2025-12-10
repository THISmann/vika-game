#!/bin/bash

# Script pour vérifier que le header Authorization est transmis correctement
# Usage: ./k8s/scripts/verify-auth-header-transmission.sh

set -e

NAMESPACE="intelectgame"

echo "🔍 Vérification de la transmission du header Authorization..."
echo ""

# 1. Vérifier la configuration Nginx
echo "📋 1. Vérification de la configuration Nginx..."
NGINX_POD=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "$NGINX_POD" ]; then
    echo "❌ Pod Nginx non trouvé"
    exit 1
fi

echo "   Pod: $NGINX_POD"
echo ""

echo "   ✅ underscores_in_headers:"
kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- cat /etc/nginx/nginx.conf 2>/dev/null | \
  grep -q "underscores_in_headers on" && echo "      Activé" || echo "      ❌ Non activé"

echo ""
echo "   ✅ proxy_set_header Authorization dans /api/game:"
kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- cat /etc/nginx/nginx.conf 2>/dev/null | \
  grep -A 10 "location /api/game" | \
  grep -q "proxy_set_header Authorization" && echo "      Présent" || echo "      ❌ Absent"

echo ""
echo "   ✅ proxy_pass_request_headers dans /api/game:"
kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- cat /etc/nginx/nginx.conf 2>/dev/null | \
  grep -A 10 "location /api/game" | \
  grep -q "proxy_pass_request_headers on" && echo "      Activé" || echo "      ❌ Non activé"

# 2. Vérifier que Nginx a bien redémarré
echo ""
echo "📅 2. Vérification de l'âge du pod Nginx..."
NGINX_AGE=$(kubectl get pod "$NGINX_POD" -n "$NAMESPACE" -o jsonpath='{.status.startTime}' 2>/dev/null || echo "")
if [ -n "$NGINX_AGE" ]; then
    echo "   Pod démarré à: $NGINX_AGE"
    echo "   💡 Si le pod est ancien, redémarrez-le: kubectl rollout restart deployment/nginx-proxy -n $NAMESPACE"
else
    echo "   ⚠️  Impossible de déterminer l'âge du pod"
fi

# 3. Instructions pour vérifier depuis le navigateur
echo ""
echo "🌐 3. Vérification depuis le navigateur:"
echo "   Ouvrez la console du navigateur (F12) et vérifiez:"
echo "   1. Onglet Network → Faites une requête (ex: démarrer le jeu)"
echo "   2. Cliquez sur la requête POST /api/game/start"
echo "   3. Onglet Headers → Request Headers"
echo "   4. Vérifiez que 'Authorization: Bearer <token>' est présent"
echo ""

# 4. Vérifier les logs du game-service
echo "📝 4. Derniers logs du game-service (recherche de 'AUTHENTICATION'):"
GAME_POD=$(kubectl get pods -n "$NAMESPACE" -l app=game-service -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$GAME_POD" ]; then
    echo "   Pod: $GAME_POD"
    echo ""
    echo "   Dernière requête d'authentification:"
    kubectl logs "$GAME_POD" -n "$NAMESPACE" --tail=50 2>/dev/null | \
      grep -A 15 "AUTHENTICATION REQUEST" | tail -20 || \
      echo "   ℹ️  Aucun log d'authentification trouvé (faites une requête depuis le navigateur)"
else
    echo "   ⚠️  Pod game-service non trouvé"
fi

echo ""
echo "✅ Vérification terminée"
echo ""
echo "💡 Si le header est toujours MISSING:"
echo "   1. Vérifiez que le frontend envoie bien le header (console navigateur)"
echo "   2. Redémarrez Nginx: kubectl rollout restart deployment/nginx-proxy -n $NAMESPACE"
echo "   3. Vérifiez que la ConfigMap est bien appliquée: kubectl get configmap nginx-proxy-config -n $NAMESPACE -o yaml"
echo ""

