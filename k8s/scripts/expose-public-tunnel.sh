#!/bin/bash

# Script pour exposer le proxy Nginx publiquement via minikube tunnel
# Usage: ./k8s/expose-public-tunnel.sh

set -e

echo "🌐 Configuration de l'accès public au proxy Nginx..."
echo ""

# Vérifier que minikube est démarré
if ! minikube status &> /dev/null; then
    echo "❌ Minikube n'est pas démarré. Démarrez-le avec: minikube start"
    exit 1
fi

# Obtenir le NodePort
NODEPORT=$(kubectl get service nginx-proxy -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)
if [ -z "$NODEPORT" ]; then
    echo "❌ Service nginx-proxy non trouvé. Déployez-le d'abord avec: ./k8s/redeploy-nginx.sh"
    exit 1
fi

echo "✅ NodePort détecté: $NODEPORT"
echo ""

# Vérifier si minikube tunnel est déjà en cours d'exécution
if pgrep -f "minikube tunnel" > /dev/null; then
    echo "ℹ️  minikube tunnel est déjà en cours d'exécution"
    echo ""
else
    echo "⚠️  minikube tunnel n'est pas en cours d'exécution"
    echo ""
    echo "Pour exposer le service publiquement, exécutez dans un terminal séparé:"
    echo "  sudo minikube tunnel"
    echo ""
    echo "OU utilisez cette commande en arrière-plan:"
    echo "  sudo nohup minikube tunnel > /tmp/minikube-tunnel.log 2>&1 &"
    echo ""
    read -p "Voulez-vous démarrer minikube tunnel maintenant? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Démarrage de minikube tunnel en arrière-plan..."
        sudo nohup minikube tunnel > /tmp/minikube-tunnel.log 2>&1 &
        echo "✅ minikube tunnel démarré (PID: $!)"
        echo "📝 Logs disponibles dans: /tmp/minikube-tunnel.log"
        sleep 3
    fi
fi

# Obtenir l'IP publique de la VM
VM_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || \
        ip a | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d/ -f1 | head -1)

# Vérifier le firewall
echo "🔥 Vérification du firewall..."
if command -v ufw &> /dev/null; then
    if sudo ufw status | grep -q "$NODEPORT/tcp"; then
        echo "✅ Port $NODEPORT déjà ouvert dans le firewall"
    else
        echo "🔓 Ouverture du port $NODEPORT dans le firewall..."
        sudo ufw allow $NODEPORT/tcp
        echo "✅ Port $NODEPORT ouvert"
    fi
else
    echo "⚠️  ufw non installé, configurez manuellement le firewall pour le port $NODEPORT"
fi
echo ""

# Attendre que le service soit accessible
echo "⏳ Attente que le service soit accessible..."
sleep 5

# Test de connectivité
echo "🧪 Test de connectivité..."
if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://localhost:$NODEPORT" | grep -q "200\|301\|302"; then
    echo "✅ Service accessible localement"
else
    echo "⚠️  Service non accessible localement (peut être normal si minikube tunnel n'est pas actif)"
fi
echo ""

# Afficher les informations d'accès
echo "═══════════════════════════════════════════════════════════"
echo "✅ Configuration terminée!"
echo ""
echo "🔗 Accès à l'application:"
if [ -n "$VM_IP" ]; then
    echo "   http://$VM_IP:$NODEPORT"
fi
echo "   http://82.202.141.248:$NODEPORT"
echo ""
echo "📝 Pour vérifier que minikube tunnel fonctionne:"
echo "   sudo cat /tmp/minikube-tunnel.log"
echo ""
echo "📝 Pour arrêter minikube tunnel:"
echo "   sudo pkill -f 'minikube tunnel'"
echo ""
echo "📝 Pour voir les logs en temps réel:"
echo "   sudo tail -f /tmp/minikube-tunnel.log"
echo "═══════════════════════════════════════════════════════════"

