#!/bin/bash

# Script de diagnostic pour l'accès à nginx-proxy
# Identifie pourquoi le port 30081 n'est pas accessible

set -e

NAMESPACE="intelectgame"
SERVICE_NAME="nginx-proxy"
NODEPORT="30081"

echo "🔍 Diagnostic de l'accès à nginx-proxy..."
echo ""

# 1. Vérifier les pods nginx-proxy
echo "1. Vérification des pods nginx-proxy..."
PODS=$(kubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME --no-headers 2>/dev/null | wc -l)
if [ "$PODS" -eq 0 ]; then
    echo "   ❌ Aucun pod nginx-proxy trouvé !"
    echo "   Solution: kubectl apply -f k8s/nginx-proxy-config.yaml -n $NAMESPACE"
    exit 1
else
    echo "   ✅ $PODS pod(s) trouvé(s)"
    kubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME
fi

echo ""

# 2. Vérifier le statut des pods
echo "2. Statut des pods..."
kubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME -o wide

READY_PODS=$(kubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME --no-headers 2>/dev/null | grep -c "Running" || echo "0")
if [ "$READY_PODS" -eq 0 ]; then
    echo "   ❌ Aucun pod en état Running !"
    echo "   Vérifiez les logs: kubectl logs -n $NAMESPACE -l app=$SERVICE_NAME"
    exit 1
fi

echo ""

# 3. Vérifier le service
echo "3. Vérification du service nginx-proxy..."
if ! kubectl get service $SERVICE_NAME -n $NAMESPACE &>/dev/null; then
    echo "   ❌ Service $SERVICE_NAME n'existe pas !"
    echo "   Solution: kubectl apply -f k8s/nginx-proxy-config.yaml -n $NAMESPACE"
    exit 1
fi

SERVICE_TYPE=$(kubectl get service $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.type}')
ACTUAL_NODEPORT=$(kubectl get service $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "N/A")

echo "   Type de service: $SERVICE_TYPE"
echo "   NodePort configuré: $ACTUAL_NODEPORT"

if [ "$SERVICE_TYPE" != "NodePort" ]; then
    echo "   ⚠️  Le service n'est pas de type NodePort !"
    echo "   Solution: Modifier le service pour utiliser NodePort"
fi

echo ""

# 4. Vérifier minikube tunnel
echo "4. Vérification de minikube tunnel..."
if pgrep -f "minikube tunnel" > /dev/null; then
    echo "   ✅ minikube tunnel est actif"
    TUNNEL_PID=$(pgrep -f "minikube tunnel")
    echo "   PID: $TUNNEL_PID"
else
    echo "   ⚠️  minikube tunnel n'est PAS actif"
    echo "   Solution: minikube tunnel (dans un terminal séparé)"
fi

echo ""

# 5. Obtenir l'IP de Minikube
echo "5. IP de Minikube..."
MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "N/A")
if [ "$MINIKUBE_IP" != "N/A" ]; then
    echo "   Minikube IP: $MINIKUBE_IP"
else
    echo "   ❌ Impossible d'obtenir l'IP de Minikube"
    echo "   Solution: minikube start"
    exit 1
fi

echo ""

# 6. Vérifier le firewall
echo "6. Vérification du firewall..."
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(sudo ufw status 2>/dev/null | head -1 || echo "inactive")
    echo "   Statut UFW: $UFW_STATUS"
    
    if echo "$UFW_STATUS" | grep -q "active"; then
        PORT_STATUS=$(sudo ufw status | grep "$NODEPORT" || echo "Port $NODEPORT non autorisé")
        if echo "$PORT_STATUS" | grep -q "$NODEPORT"; then
            echo "   ✅ Port $NODEPORT autorisé dans UFW"
        else
            echo "   ⚠️  Port $NODEPORT non autorisé dans UFW"
            echo "   Solution: sudo ufw allow $NODEPORT/tcp"
        fi
    else
        echo "   ℹ️  UFW est inactif (pas de blocage)"
    fi
else
    echo "   ℹ️  UFW non installé (vérifiez iptables si nécessaire)"
fi

echo ""

# 7. Test de connectivité depuis le pod
echo "7. Test de connectivité depuis le pod nginx-proxy..."
POD_NAME=$(kubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$POD_NAME" ]; then
    echo "   Test depuis le pod: $POD_NAME"
    TEST_RESULT=$(kubectl exec -n $NAMESPACE $POD_NAME -- wget -qO- --timeout=3 http://localhost:80 2>&1 | head -1 || echo "FAILED")
    if echo "$TEST_RESULT" | grep -q "html\|<!DOCTYPE"; then
        echo "   ✅ Nginx répond depuis le pod"
    else
        echo "   ⚠️  Nginx ne répond pas correctement depuis le pod"
        echo "   Résultat: $TEST_RESULT"
    fi
fi

echo ""

# 8. Test depuis l'intérieur du cluster
echo "8. Test depuis l'intérieur du cluster..."
if [ "$MINIKUBE_IP" != "N/A" ] && [ "$ACTUAL_NODEPORT" != "N/A" ]; then
    TEST_URL="http://$MINIKUBE_IP:$ACTUAL_NODEPORT"
    echo "   Test: $TEST_URL"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$TEST_URL" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
        echo "   ✅ Service accessible depuis l'intérieur (HTTP $HTTP_CODE)"
    else
        echo "   ❌ Service non accessible depuis l'intérieur (HTTP $HTTP_CODE)"
    fi
fi

echo ""

# 9. Test depuis l'extérieur (IP publique)
echo "9. Test depuis l'extérieur (IP publique)..."
VM_IP="82.202.141.248"
if [ "$ACTUAL_NODEPORT" != "N/A" ]; then
    TEST_URL="http://$VM_IP:$ACTUAL_NODEPORT"
    echo "   Test: $TEST_URL"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$TEST_URL" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
        echo "   ✅ Service accessible depuis l'extérieur (HTTP $HTTP_CODE)"
    else
        echo "   ❌ Service non accessible depuis l'extérieur (HTTP $HTTP_CODE)"
        echo "   Raison probable: minikube tunnel non actif ou firewall bloquant"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 RÉSUMÉ ET SOLUTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Solutions recommandées
echo "🔧 SOLUTIONS RECOMMANDÉES :"
echo ""

if ! pgrep -f "minikube tunnel" > /dev/null; then
    echo "1. Démarrer minikube tunnel (RECOMMANDÉ) :"
    echo "   minikube tunnel"
    echo "   (Laissez cette commande active dans un terminal séparé)"
    echo ""
fi

if command -v ufw &> /dev/null && sudo ufw status 2>/dev/null | grep -q "active"; then
    echo "2. Autoriser le port dans le firewall :"
    echo "   sudo ufw allow $ACTUAL_NODEPORT/tcp"
    echo "   sudo ufw reload"
    echo ""
fi

echo "3. Vérifier les logs nginx-proxy :"
echo "   kubectl logs -n $NAMESPACE -l app=$SERVICE_NAME --tail=50 -f"
echo ""

echo "4. Tester depuis l'intérieur du cluster :"
if [ "$MINIKUBE_IP" != "N/A" ] && [ "$ACTUAL_NODEPORT" != "N/A" ]; then
    echo "   curl http://$MINIKUBE_IP:$ACTUAL_NODEPORT"
fi
echo ""

echo "5. Si minikube tunnel est actif, tester depuis l'extérieur :"
if [ "$ACTUAL_NODEPORT" != "N/A" ]; then
    echo "   curl http://$VM_IP:$ACTUAL_NODEPORT"
fi
echo ""
