#!/bin/bash

# Script pour résoudre le problème d'accès public
# Usage: ./k8s/fix-public-access.sh

set -e

echo "🔧 Correction de l'accès public à l'application..."

# Obtenir l'IP de Minikube
MINIKUBE_IP=$(minikube ip)
NODEPORT=$(kubectl get service frontend -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "30080")
VM_IP=$(hostname -I | awk '{print $1}')

echo "📊 Configuration actuelle:"
echo "   IP Minikube: ${MINIKUBE_IP}"
echo "   IP VM: ${VM_IP}"
echo "   NodePort: ${NODEPORT}"
echo ""

# Solution 1: Utiliser minikube tunnel (le plus simple)
echo "🌐 Solution 1: minikube tunnel (Recommandé)"
echo "   Cette solution expose les services via LoadBalancer"
echo ""
read -p "Utiliser minikube tunnel? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    # Changer le service en LoadBalancer
    kubectl patch service frontend -n intelectgame -p '{"spec":{"type":"LoadBalancer"}}' 2>/dev/null || true
    
    echo "✅ Service configuré en LoadBalancer"
    echo "🚀 Démarrage de minikube tunnel..."
    echo "   L'application sera accessible via l'IP publique de la VM"
    echo "   Appuyez sur Ctrl+C pour arrêter"
    echo ""
    
    # Démarrer minikube tunnel en arrière-plan
    nohup minikube tunnel > /tmp/minikube-tunnel.log 2>&1 &
    TUNNEL_PID=$!
    
    echo "✅ minikube tunnel démarré (PID: ${TUNNEL_PID})"
    echo "   Logs: /tmp/minikube-tunnel.log"
    
    # Attendre que l'IP LoadBalancer soit assignée
    echo "⏳ Attente de l'assignation de l'IP LoadBalancer..."
    sleep 5
    
    LOADBALANCER_IP=$(kubectl get service frontend -n intelectgame -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    
    if [ -n "$LOADBALANCER_IP" ]; then
        echo "✅ IP LoadBalancer assignée: ${LOADBALANCER_IP}"
        echo "🔗 Accès: http://${LOADBALANCER_IP}"
    else
        echo "⚠️  L'IP LoadBalancer n'est pas encore assignée"
        echo "   Vérifiez avec: kubectl get service frontend -n intelectgame"
    fi
    
    echo ""
    echo "Pour arrêter minikube tunnel: kill ${TUNNEL_PID}"
    exit 0
fi

# Solution 2: Nginx reverse proxy
echo ""
echo "🌐 Solution 2: Nginx reverse proxy"
echo "   Cette solution configure Nginx pour proxy vers Minikube"
echo ""
read -p "Configurer Nginx? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./k8s/setup-nginx-proxy.sh
    exit 0
fi

# Solution 3: Port forwarding avec iptables
echo ""
echo "🔧 Solution 3: Port forwarding avec iptables"
if command -v iptables &> /dev/null; then
    read -p "Configurer le port forwarding? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./k8s/setup-port-forwarding.sh
        exit 0
    fi
fi

echo ""
echo "❌ Aucune solution configurée"
echo ""
echo "Options disponibles:"
echo "1. minikube tunnel: ./k8s/fix-public-access.sh (choisir option 1)"
echo "2. Nginx proxy: ./k8s/setup-nginx-proxy.sh"
echo "3. Port forwarding: ./k8s/setup-port-forwarding.sh"

