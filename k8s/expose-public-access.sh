#!/bin/bash

# Script pour exposer l'application publiquement
# Usage: ./k8s/expose-public-access.sh

set -e

echo "🌐 Configuration de l'accès public à l'application..."
echo ""

# 1. Vérifier que minikube tunnel est actif
echo "=== 1. Vérification de minikube tunnel ==="
if pgrep -f "minikube tunnel" > /dev/null; then
    TUNNEL_PID=$(pgrep -f "minikube tunnel")
    echo "✅ minikube tunnel est actif (PID: $TUNNEL_PID)"
else
    echo "⚠️  minikube tunnel n'est pas actif"
    echo ""
    echo "Démarrage de minikube tunnel..."
    sudo nohup minikube tunnel > /tmp/minikube-tunnel.log 2>&1 &
    sleep 5
    if pgrep -f "minikube tunnel" > /dev/null; then
        echo "✅ minikube tunnel démarré"
    else
        echo "❌ Impossible de démarrer minikube tunnel"
        echo "Essayez manuellement: sudo minikube tunnel"
    fi
fi
echo ""

# 2. Obtenir le NodePort
NODEPORT=$(kubectl get service nginx-proxy -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)
if [ -z "$NODEPORT" ]; then
    echo "❌ Service nginx-proxy non trouvé"
    exit 1
fi
echo "✅ NodePort détecté: $NODEPORT"
echo ""

# 3. Vérifier le firewall
echo "=== 2. Vérification du firewall ==="
if command -v ufw &> /dev/null; then
    if sudo ufw status | grep -q "$NODEPORT/tcp"; then
        echo "✅ Port $NODEPORT déjà ouvert dans le firewall"
    else
        echo "🔓 Ouverture du port $NODEPORT dans le firewall..."
        sudo ufw allow $NODEPORT/tcp
        echo "✅ Port $NODEPORT ouvert"
    fi
else
    echo "⚠️  ufw non installé"
    echo "   Configurez manuellement le firewall pour le port $NODEPORT"
fi
echo ""

# 4. Obtenir les adresses IP
MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "N/A")
VM_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || \
        ip a | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d/ -f1 | head -1)

echo "=== 3. Adresses d'accès ==="
echo "IP de Minikube: $MINIKUBE_IP"
echo "IP publique de la VM: $VM_IP"
echo ""

# 5. Test de connectivité
echo "=== 4. Test de connectivité ==="
echo "Test via IP Minikube..."
HTTP_CODE_MINIKUBE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://$MINIKUBE_IP:$NODEPORT" 2>/dev/null || echo "000")
if [ "$HTTP_CODE_MINIKUBE" = "200" ] || [ "$HTTP_CODE_MINIKUBE" = "301" ] || [ "$HTTP_CODE_MINIKUBE" = "302" ]; then
    echo "✅ Accessible via IP Minikube (Code: $HTTP_CODE_MINIKUBE)"
else
    echo "❌ Non accessible via IP Minikube (Code: $HTTP_CODE_MINIKUBE)"
fi

if [ -n "$VM_IP" ] && [ "$VM_IP" != "N/A" ]; then
    echo "Test via IP publique..."
    HTTP_CODE_PUBLIC=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://$VM_IP:$NODEPORT" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE_PUBLIC" = "200" ] || [ "$HTTP_CODE_PUBLIC" = "301" ] || [ "$HTTP_CODE_PUBLIC" = "302" ]; then
        echo "✅ Accessible via IP publique (Code: $HTTP_CODE_PUBLIC)"
    else
        echo "❌ Non accessible via IP publique (Code: $HTTP_CODE_PUBLIC)"
    fi
fi
echo ""

# 6. Vérifier les routes de minikube tunnel
echo "=== 5. Vérification des routes ==="
if command -v ip &> /dev/null; then
    echo "Routes configurées par minikube tunnel:"
    ip route | grep "192.168.49" || echo "Aucune route trouvée"
fi
echo ""

# 7. Instructions finales
echo "═══════════════════════════════════════════════════════════"
echo "✅ Configuration terminée!"
echo ""
echo "🔗 Accès à l'application:"
if [ "$HTTP_CODE_MINIKUBE" = "200" ] || [ "$HTTP_CODE_MINIKUBE" = "301" ] || [ "$HTTP_CODE_MINIKUBE" = "302" ]; then
    echo "   ✅ http://$MINIKUBE_IP:$NODEPORT"
fi
if [ -n "$VM_IP" ] && [ "$VM_IP" != "N/A" ]; then
    if [ "$HTTP_CODE_PUBLIC" = "200" ] || [ "$HTTP_CODE_PUBLIC" = "301" ] || [ "$HTTP_CODE_PUBLIC" = "302" ]; then
        echo "   ✅ http://$VM_IP:$NODEPORT"
        echo "   ✅ http://82.202.141.248:$NODEPORT"
    else
        echo "   ⚠️  http://$VM_IP:$NODEPORT (non accessible - voir ci-dessous)"
    fi
fi
echo ""

if [ "$HTTP_CODE_PUBLIC" != "200" ] && [ "$HTTP_CODE_PUBLIC" != "301" ] && [ "$HTTP_CODE_PUBLIC" != "302" ]; then
    echo "⚠️  L'accès public ne fonctionne pas. Solutions possibles:"
    echo ""
    echo "1. Vérifier que minikube tunnel est actif:"
    echo "   pgrep -f 'minikube tunnel'"
    echo "   sudo tail -f /tmp/minikube-tunnel.log"
    echo ""
    echo "2. Vérifier le firewall du provider cloud (cloud.ru):"
    echo "   Le port $NODEPORT doit être ouvert dans le firewall du cloud"
    echo ""
    echo "3. Utiliser un LoadBalancer au lieu de NodePort:"
    echo "   kubectl patch service nginx-proxy -n intelectgame -p '{\"spec\":{\"type\":\"LoadBalancer\"}}'"
    echo ""
    echo "4. Utiliser un reverse proxy externe (Nginx, Traefik, etc.)"
fi
echo ""
echo "📝 Pour voir les logs de minikube tunnel:"
echo "   sudo tail -f /tmp/minikube-tunnel.log"
echo "═══════════════════════════════════════════════════════════"

