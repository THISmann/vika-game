#!/bin/bash

# Script pour corriger le conflit de port avec Nginx
# Usage: ./k8s/fix-nginx-port.sh

set -e

echo "🔧 Correction du conflit de port..."

# Supprimer l'ancien service frontend NodePort s'il existe
if kubectl get service frontend -n intelectgame &> /dev/null; then
    echo "🗑️  Suppression de l'ancien service frontend NodePort..."
    kubectl delete service frontend -n intelectgame
    echo "✅ Service frontend supprimé"
fi

# Supprimer l'ancien service nginx-proxy s'il existe
if kubectl get service nginx-proxy -n intelectgame &> /dev/null; then
    echo "🗑️  Suppression de l'ancien service nginx-proxy..."
    kubectl delete service nginx-proxy -n intelectgame
    echo "✅ Service nginx-proxy supprimé"
fi

# Redéployer le proxy Nginx avec le nouveau port
echo "🌐 Redéploiement du proxy Nginx..."
kubectl apply -f k8s/nginx-proxy-config.yaml

# Attendre que le service soit créé
sleep 2

# Obtenir le nouveau port
NODEPORT=$(kubectl get service nginx-proxy -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "30081")
VM_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "✅ Proxy Nginx redéployé!"
echo ""
echo "🔗 Accès à l'application:"
echo "   http://${VM_IP}:${NODEPORT}"
echo "   http://82.202.141.248:${NODEPORT}"
echo ""
echo "🔥 N'oubliez pas d'ouvrir le port dans le firewall:"
echo "   sudo ufw allow ${NODEPORT}/tcp"

