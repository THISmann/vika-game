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

# Détecter l'adresse IP du service DNS de Kubernetes et mettre à jour le ConfigMap si nécessaire
echo "🔍 Détection de l'adresse IP du service DNS..."
DNS_IP=$(kubectl get svc -n kube-system -o jsonpath='{.items[?(@.metadata.name=="kube-dns")].spec.clusterIP}' 2>/dev/null || \
         kubectl get svc -n kube-system -o jsonpath='{.items[?(@.metadata.name=="coredns")].spec.clusterIP}' 2>/dev/null || \
         echo "")

if [ -z "$DNS_IP" ]; then
    # Essayer de trouver n'importe quel service DNS
    DNS_IP=$(kubectl get svc -n kube-system | grep -E 'kube-dns|coredns' | awk '{print $3}' | head -1)
fi

if [ -n "$DNS_IP" ] && [ "$DNS_IP" != "10.96.0.10" ]; then
    echo "📝 Mise à jour du ConfigMap avec l'adresse IP détectée: $DNS_IP"
    # Mettre à jour le ConfigMap avec la bonne adresse IP
    kubectl get configmap nginx-proxy-config -n intelectgame -o yaml | \
        sed "s/resolver [0-9.]*;/resolver $DNS_IP;/" | \
        kubectl apply -f -
    echo "✅ ConfigMap mis à jour, redémarrage du pod..."
    kubectl rollout restart deployment/nginx-proxy -n intelectgame
else
    echo "ℹ️  Utilisation de l'adresse IP par défaut: 10.96.0.10"
    echo "   Si Nginx ne démarre pas, vérifiez l'adresse IP du service DNS avec:"
    echo "   kubectl get svc -n kube-system | grep -E 'kube-dns|coredns'"
fi

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

