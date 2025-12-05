#!/bin/bash

# Script pour diagnostiquer et corriger les problèmes d'accès au proxy Nginx
# Usage: ./k8s/diagnose-nginx-access.sh

set -e

echo "🔍 Diagnostic de l'accès au proxy Nginx..."
echo ""

# 1. Vérifier le service
echo "=== 1. État du service ==="
kubectl get service nginx-proxy -n intelectgame
echo ""

# 2. Vérifier les endpoints
echo "=== 2. Endpoints du service ==="
kubectl get endpoints nginx-proxy -n intelectgame
echo ""

# 3. Vérifier le pod
echo "=== 3. État du pod ==="
kubectl get pods -n intelectgame | grep nginx-proxy
echo ""

# 4. Obtenir le NodePort
NODEPORT=$(kubectl get service nginx-proxy -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "N/A")
echo "=== 4. NodePort détecté: $NODEPORT ==="
echo ""

# 5. Obtenir l'IP de Minikube
MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "N/A")
echo "=== 5. IP de Minikube: $MINIKUBE_IP ==="
echo ""

# 6. Obtenir l'IP publique de la VM
VM_IP=$(hostname -I | awk '{print $1}' || ip a | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d/ -f1 | head -1)
echo "=== 6. IP publique de la VM: $VM_IP ==="
echo ""

# 7. Vérifier le firewall
echo "=== 7. Règles du firewall pour le port $NODEPORT ==="
if command -v ufw &> /dev/null; then
    sudo ufw status | grep "$NODEPORT" || echo "⚠️  Port $NODEPORT non trouvé dans les règles ufw"
else
    echo "ℹ️  ufw non installé, vérifiez manuellement le firewall"
fi
echo ""

# 8. Test depuis l'intérieur du cluster
echo "=== 8. Test depuis l'intérieur du cluster ==="
kubectl run test-nginx-curl --rm -i --restart=Never --image=curlimages/curl:latest -- \
    curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://nginx-proxy.intelectgame.svc.cluster.local || \
    echo "❌ Test échoué"
echo ""

# 9. Test depuis Minikube
if [ "$MINIKUBE_IP" != "N/A" ]; then
    echo "=== 9. Test depuis Minikube ($MINIKUBE_IP:$NODEPORT) ==="
    curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" "http://$MINIKUBE_IP:$NODEPORT" || \
        echo "❌ Test échoué (normal si Minikube n'est pas accessible depuis cette machine)"
    echo ""
fi

# 10. Vérifier si minikube tunnel est nécessaire
echo "=== 10. Solution recommandée ==="
echo ""
echo "Pour exposer le service publiquement, vous avez deux options:"
echo ""
echo "Option 1: Utiliser minikube tunnel (recommandé pour VM)"
echo "  sudo minikube tunnel"
echo "  # (Laissez cette commande tourner dans un terminal séparé)"
echo ""
echo "Option 2: Configurer le firewall et utiliser l'IP de Minikube"
echo "  sudo ufw allow $NODEPORT/tcp"
echo "  # Accéder via: http://$MINIKUBE_IP:$NODEPORT"
echo ""
echo "Option 3: Utiliser l'IP publique de la VM (si minikube tunnel est actif)"
echo "  sudo ufw allow $NODEPORT/tcp"
echo "  # Accéder via: http://$VM_IP:$NODEPORT"
echo ""

