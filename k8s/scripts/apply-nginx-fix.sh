#!/bin/bash

# Script rapide pour appliquer la correction Nginx
# Usage: ./k8s/scripts/apply-nginx-fix.sh

set -e

NAMESPACE="intelectgame"

echo "🔧 Application de la correction Nginx pour l'authentification..."
echo ""

# Appliquer la configuration
kubectl apply -f k8s/nginx-proxy-config.yaml

# Redémarrer Nginx
echo "🔄 Redémarrage de Nginx..."
kubectl rollout restart deployment/nginx-proxy -n "$NAMESPACE"

# Attendre que le pod soit prêt
echo "⏳ Attente que Nginx soit prêt..."
kubectl rollout status deployment/nginx-proxy -n "$NAMESPACE" --timeout=120s

echo ""
echo "✅ Correction appliquée !"
echo ""
echo "💡 Testez maintenant une action admin depuis le frontend."
echo "   Si le problème persiste, vérifiez les logs :"
echo "   kubectl logs -f -l app=nginx-proxy -n $NAMESPACE"
echo ""

