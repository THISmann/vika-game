#!/bin/bash

# Script pour afficher le statut de l'application
# Usage: ./k8s/status.sh

echo "📊 Statut de l'application IntelectGame"
echo "======================================"
echo ""

# Vérifier que le namespace existe
if ! kubectl get namespace intelectgame &> /dev/null; then
    echo "❌ Le namespace 'intelectgame' n'existe pas."
    echo "   Exécutez ./k8s/deploy-vm.sh pour déployer l'application"
    exit 1
fi

echo "📦 Pods:"
kubectl get pods -n intelectgame
echo ""

echo "🌐 Services:"
kubectl get services -n intelectgame
echo ""

echo "📋 ConfigMaps:"
kubectl get configmaps -n intelectgame
echo ""

echo "🔐 Secrets:"
kubectl get secrets -n intelectgame
echo ""

# Obtenir les URLs d'accès
MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "N/A")
NODEPORT=$(kubectl get service frontend -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "N/A")
VM_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || ip a | grep -oP 'inet \K[\d.]+' | grep -v '127.0.0.1' | head -1 || echo "N/A")

echo "🔗 Accès à l'application:"
if [ "$NODEPORT" != "N/A" ] && [ "$MINIKUBE_IP" != "N/A" ]; then
    echo "   Frontend: http://${MINIKUBE_IP}:${NODEPORT}"
    if [ "$VM_IP" != "N/A" ] && [ "$VM_IP" != "$MINIKUBE_IP" ]; then
        echo "   Frontend (via VM IP): http://${VM_IP}:${NODEPORT}"
    fi
else
    echo "   Frontend: Non disponible"
fi
echo ""

# Vérifier les pods en erreur
ERROR_PODS=$(kubectl get pods -n intelectgame --field-selector=status.phase!=Running,status.phase!=Succeeded --no-headers 2>/dev/null | wc -l)
if [ "$ERROR_PODS" -gt 0 ]; then
    echo "⚠️  Pods en erreur:"
    kubectl get pods -n intelectgame --field-selector=status.phase!=Running,status.phase!=Succeeded
    echo ""
    echo "Pour voir les logs d'un pod:"
    echo "   kubectl logs <pod-name> -n intelectgame"
fi

