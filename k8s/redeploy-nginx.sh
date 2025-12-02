#!/bin/bash

# Script pour redéployer Nginx avec la configuration simplifiée
# Usage: ./k8s/redeploy-nginx.sh

set -e

echo "🔧 Redéploiement du proxy Nginx avec configuration simplifiée..."

# Supprimer le déploiement actuel
if kubectl get deployment nginx-proxy -n intelectgame &> /dev/null; then
    echo "🗑️  Suppression de l'ancien déploiement nginx-proxy..."
    kubectl delete deployment nginx-proxy -n intelectgame
    echo "✅ Déploiement supprimé"
fi

# Supprimer le service s'il existe
if kubectl get service nginx-proxy -n intelectgame &> /dev/null; then
    echo "🗑️  Suppression de l'ancien service nginx-proxy..."
    kubectl delete service nginx-proxy -n intelectgame
    echo "✅ Service supprimé"
fi

# Attendre que les ressources soient supprimées
echo "⏳ Attente de la suppression complète..."
sleep 3

# Redéployer avec la configuration simplifiée
echo "🌐 Déploiement de la nouvelle configuration..."
kubectl apply -f k8s/nginx-proxy-simple.yaml

# Attendre que le pod démarre
echo "⏳ Attente du démarrage du pod..."
sleep 5

# Vérifier le statut
echo ""
echo "📊 Statut du déploiement:"
kubectl get pods -n intelectgame | grep nginx-proxy || echo "Aucun pod nginx-proxy trouvé"

# Obtenir le NodePort
NODEPORT=$(kubectl get service nginx-proxy -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "30081")

echo ""
echo "✅ Redéploiement terminé!"
echo ""
echo "🔗 Accès à l'application:"
echo "   http://82.202.141.248:${NODEPORT}"
echo ""
echo "📝 Pour voir les logs:"
echo "   kubectl logs -f deployment/nginx-proxy -n intelectgame"
echo ""
echo "🔥 N'oubliez pas d'ouvrir le port dans le firewall:"
echo "   sudo ufw allow ${NODEPORT}/tcp"

