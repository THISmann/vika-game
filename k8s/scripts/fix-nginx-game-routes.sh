#!/bin/bash

# Script pour corriger les routes /api/game dans Nginx
# Ce script applique la configuration corrigée et redémarre nginx-proxy

set -e

echo "🔧 Correction des routes /api/game dans Nginx..."
echo ""

# Vérifier que nous sommes dans le bon namespace
NAMESPACE="intelectgame"

echo "1. Application de la configuration Nginx corrigée..."
kubectl apply -f k8s/nginx-proxy-config.yaml -n $NAMESPACE

echo ""
echo "2. Redémarrage du deployment nginx-proxy..."
kubectl rollout restart deployment/nginx-proxy -n $NAMESPACE

echo ""
echo "3. Attente que le pod soit prêt..."
kubectl rollout status deployment/nginx-proxy -n $NAMESPACE --timeout=60s

echo ""
echo "4. Vérification des pods nginx-proxy..."
kubectl get pods -n $NAMESPACE -l app=nginx-proxy

echo ""
echo "✅ Configuration appliquée !"
echo ""
echo "🧪 TESTS À EFFECTUER :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Depuis votre machine locale (ou depuis la VM) :"
echo ""
echo "  curl http://82.202.141.248:30081/api/game/state"
echo "  curl http://82.202.141.248:30081/api/game/players/count"
echo "  curl http://82.202.141.248:30081/api/game/players"
echo ""
echo "Ces commandes devraient retourner du JSON au lieu de 404."
echo ""
echo "📋 Pour voir les logs Nginx :"
echo "  kubectl logs -n $NAMESPACE -l app=nginx-proxy --tail=50 -f"
echo ""
