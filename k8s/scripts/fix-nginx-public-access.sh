#!/bin/bash

# Script pour corriger l'accès public à nginx-proxy
# Active minikube tunnel et configure le firewall si nécessaire

set -e

NAMESPACE="intelectgame"
SERVICE_NAME="nginx-proxy"
NODEPORT="30081"

echo "🔧 Correction de l'accès public à nginx-proxy..."
echo ""

# 1. Vérifier que le service existe
if ! kubectl get service $SERVICE_NAME -n $NAMESPACE &>/dev/null; then
    echo "❌ Service $SERVICE_NAME n'existe pas !"
    echo "   Solution: kubectl apply -f k8s/nginx-proxy-config.yaml -n $NAMESPACE"
    exit 1
fi

# 2. Vérifier minikube tunnel
echo "1. Vérification de minikube tunnel..."
if pgrep -f "minikube tunnel" > /dev/null; then
    echo "   ✅ minikube tunnel est déjà actif"
    TUNNEL_PID=$(pgrep -f "minikube tunnel")
    echo "   PID: $TUNNEL_PID"
else
    echo "   ⚠️  minikube tunnel n'est pas actif"
    echo ""
    echo "   Pour démarrer minikube tunnel, exécutez dans un terminal séparé :"
    echo "   minikube tunnel"
    echo ""
    read -p "Voulez-vous démarrer minikube tunnel maintenant ? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "   🚀 Démarrage de minikube tunnel en arrière-plan..."
        nohup minikube tunnel > /tmp/minikube-tunnel.log 2>&1 &
        TUNNEL_PID=$!
        echo "   ✅ minikube tunnel démarré (PID: $TUNNEL_PID)"
        echo "   Logs: tail -f /tmp/minikube-tunnel.log"
        sleep 3
    else
        echo "   ⚠️  minikube tunnel n'a pas été démarré"
        echo "   Vous devrez le démarrer manuellement : minikube tunnel"
    fi
fi

echo ""

# 3. Configurer le firewall
echo "2. Configuration du firewall..."
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(sudo ufw status 2>/dev/null | head -1 || echo "inactive")
    if echo "$UFW_STATUS" | grep -q "active"; then
        PORT_STATUS=$(sudo ufw status | grep "$NODEPORT" || echo "")
        if [ -z "$PORT_STATUS" ]; then
            echo "   ⚠️  Port $NODEPORT non autorisé dans UFW"
            read -p "   Autoriser le port $NODEPORT dans UFW ? (y/N): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                sudo ufw allow $NODEPORT/tcp
                sudo ufw reload
                echo "   ✅ Port $NODEPORT autorisé dans UFW"
            fi
        else
            echo "   ✅ Port $NODEPORT déjà autorisé dans UFW"
        fi
    else
        echo "   ℹ️  UFW est inactif (pas de configuration nécessaire)"
    fi
else
    echo "   ℹ️  UFW non installé (vérifiez iptables si nécessaire)"
fi

echo ""

# 4. Vérifier les pods
echo "3. Vérification des pods nginx-proxy..."
READY_PODS=$(kubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME --no-headers 2>/dev/null | grep -c "Running" || echo "0")
if [ "$READY_PODS" -eq 0 ]; then
    echo "   ⚠️  Aucun pod en état Running !"
    echo "   Redémarrage du deployment..."
    kubectl rollout restart deployment/$SERVICE_NAME -n $NAMESPACE
    kubectl rollout status deployment/$SERVICE_NAME -n $NAMESPACE --timeout=60s
fi

echo ""

# 5. Obtenir les informations de connexion
MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "N/A")
VM_IP="82.202.141.248"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Configuration terminée !"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 ACCÈS À L'APPLICATION :"
echo ""
if [ "$MINIKUBE_IP" != "N/A" ]; then
    echo "   Depuis l'intérieur du cluster :"
    echo "   http://$MINIKUBE_IP:$NODEPORT"
    echo ""
fi

if pgrep -f "minikube tunnel" > /dev/null; then
    echo "   Depuis l'extérieur (minikube tunnel actif) :"
    echo "   http://$VM_IP:$NODEPORT"
    echo ""
else
    echo "   ⚠️  Pour accéder depuis l'extérieur, démarrez minikube tunnel :"
    echo "   minikube tunnel"
    echo ""
fi

echo "🧪 TESTS :"
echo ""
echo "   # Test depuis l'intérieur"
if [ "$MINIKUBE_IP" != "N/A" ]; then
    echo "   curl http://$MINIKUBE_IP:$NODEPORT"
fi
echo ""
if pgrep -f "minikube tunnel" > /dev/null; then
    echo "   # Test depuis l'extérieur"
    echo "   curl http://$VM_IP:$NODEPORT"
fi
echo ""
echo "📋 LOGS :"
echo "   kubectl logs -n $NAMESPACE -l app=$SERVICE_NAME --tail=50 -f"
echo ""

