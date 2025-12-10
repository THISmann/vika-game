#!/bin/bash

# Script pour appliquer la correction DNS de Nginx
# Usage: ./k8s/scripts/apply-nginx-dns-fix.sh

set -e

NAMESPACE="intelectgame"

echo "🔧 Application de la correction DNS pour Nginx..."
echo ""

# 1. Appliquer la configuration corrigée
echo "📝 1. Application de la configuration..."
kubectl apply -f k8s/nginx-proxy-config.yaml

# 2. Redémarrer Nginx pour appliquer les changements
echo ""
echo "🔄 2. Redémarrage de Nginx..."
kubectl rollout restart deployment/nginx-proxy -n "$NAMESPACE"

# 3. Attendre que le pod soit prêt
echo ""
echo "⏳ 3. Attente que Nginx soit prêt..."
if kubectl rollout status deployment/nginx-proxy -n "$NAMESPACE" --timeout=60s 2>/dev/null; then
    echo "   ✅ Nginx redémarré avec succès"
else
    echo "   ⚠️  Timeout - Vérification manuelle nécessaire"
fi

# 4. Vérifier l'état
echo ""
echo "📊 4. État du pod Nginx:"
kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy

echo ""
echo "✅ Correction appliquée"
echo ""
echo "💡 Testez maintenant une requête vers /api/game"
echo "   Les erreurs 'could not be resolved' devraient être résolues"
echo ""

