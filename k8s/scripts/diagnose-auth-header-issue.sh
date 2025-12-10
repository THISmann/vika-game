#!/bin/bash

# Script pour diagnostiquer pourquoi le header Authorization n'est pas transmis
# Usage: ./k8s/scripts/diagnose-auth-header-issue.sh

set -e

NAMESPACE="intelectgame"

echo "🔍 Diagnostic du problème de transmission du header Authorization..."
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

echo "   Vérification de underscores_in_headers:"
kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- cat /etc/nginx/nginx.conf 2>/dev/null | \
  grep -E "underscores_in_headers" || echo "   ⚠️  underscores_in_headers non trouvé"

echo ""
echo "   Configuration pour /api/game:"
kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- cat /etc/nginx/nginx.conf 2>/dev/null | \
  sed -n '/location \/api\/game/,/location \/socket\.io/p' | \
  grep -E "Authorization|auth_header|proxy_pass_request_headers" || \
  echo "   ⚠️  Configuration Authorization non trouvée"

echo ""
echo "   Test de la configuration Nginx:"
kubectl exec -n "$NAMESPACE" "$NGINX_POD" -- nginx -t 2>&1 | head -5

# 2. Vérifier les logs Nginx (si disponibles)
echo ""
echo "📝 2. Derniers logs Nginx (recherche de 'authorization'):"
kubectl logs "$NGINX_POD" -n "$NAMESPACE" --tail=50 2>/dev/null | \
  grep -i "authorization" | tail -5 || \
  echo "   ℹ️  Aucun log contenant 'authorization' trouvé"

# 3. Vérifier les logs du game-service
echo ""
echo "📝 3. Derniers logs du game-service (recherche de 'AUTHENTICATION'):"
GAME_POD=$(kubectl get pods -n "$NAMESPACE" -l app=game-service -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$GAME_POD" ]; then
    echo "   Pod: $GAME_POD"
    kubectl logs "$GAME_POD" -n "$NAMESPACE" --tail=20 2>/dev/null | \
      grep -A 10 "AUTHENTICATION REQUEST" | tail -15 || \
      echo "   ℹ️  Aucun log d'authentification trouvé"
else
    echo "   ⚠️  Pod game-service non trouvé"
fi

# 4. Instructions pour vérifier depuis le navigateur
echo ""
echo "🌐 4. Vérification depuis le navigateur:"
echo "   Ouvrez la console du navigateur (F12) et vérifiez:"
echo "   1. Onglet Network → Faites une requête (ex: démarrer le jeu)"
echo "   2. Cliquez sur la requête POST /api/game/start"
echo "   3. Onglet Headers → Request Headers"
echo "   4. Vérifiez que 'Authorization: Bearer <token>' est présent"
echo ""

# 5. Test direct avec curl (si disponible)
echo "🧪 5. Test direct (si curl est disponible dans le pod):"
echo "   Pour tester depuis le pod Nginx:"
echo "   kubectl exec -n $NAMESPACE $NGINX_POD -- sh -c 'echo \"Authorization: Bearer test-token\" | curl -v -H @- http://game-service.intelectgame.svc.cluster.local:3003/game/state'"
echo ""

# 6. Vérifier la ConfigMap
echo "📋 6. Vérification de la ConfigMap:"
kubectl get configmap nginx-proxy-config -n "$NAMESPACE" -o yaml 2>/dev/null | \
  grep -A 3 "proxy_set_header Authorization" | head -10 || \
  echo "   ⚠️  Configuration Authorization non trouvée dans la ConfigMap"

echo ""
echo "✅ Diagnostic terminé"
echo ""
echo "💡 Solutions possibles:"
echo "   1. Vérifier que le frontend envoie bien le header (console navigateur)"
echo "   2. Vérifier que Nginx a bien redémarré: kubectl rollout status deployment/nginx-proxy -n $NAMESPACE"
echo "   3. Reconstruire Nginx si nécessaire: kubectl delete pod $NGINX_POD -n $NAMESPACE"
echo ""

