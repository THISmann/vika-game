#!/bin/bash

# Script pour forcer le redémarrage de Nginx en cas de blocage
# Usage: ./k8s/scripts/force-restart-nginx.sh

set -e

NAMESPACE="intelectgame"

echo "🔄 Forçage du redémarrage de Nginx..."
echo ""

# 1. Supprimer le pod bloqué
echo "🗑️  1. Suppression du pod Nginx bloqué..."
NGINX_POD=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$NGINX_POD" ]; then
    echo "   Suppression du pod: $NGINX_POD"
    kubectl delete pod "$NGINX_POD" -n "$NAMESPACE" --force --grace-period=0 2>/dev/null || true
    echo "   ✅ Pod supprimé"
else
    echo "   ⚠️  Aucun pod Nginx trouvé"
fi

# 2. Attendre un peu
echo ""
echo "⏳ 2. Attente de 5 secondes..."
sleep 5

# 3. Vérifier le nouveau pod
echo ""
echo "🔍 3. Vérification du nouveau pod..."
NEW_POD=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$NEW_POD" ]; then
    echo "   Nouveau pod: $NEW_POD"
    echo "   Statut:"
    kubectl get pod "$NEW_POD" -n "$NAMESPACE" -o wide
    
    echo ""
    echo "📝 Logs du nouveau pod:"
    kubectl logs "$NEW_POD" -n "$NAMESPACE" --tail=20 || echo "   Logs non disponibles encore"
else
    echo "   ⚠️  Aucun nouveau pod créé"
    echo "   Vérification du deployment..."
    kubectl get deployment nginx-proxy -n "$NAMESPACE"
fi

echo ""
echo "✅ Redémarrage forcé terminé"
echo ""
echo "💡 Si le problème persiste, exécutez:"
echo "   ./k8s/scripts/diagnose-nginx.sh"
echo ""

