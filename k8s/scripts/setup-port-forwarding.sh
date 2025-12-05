#!/bin/bash

# Script pour configurer le port forwarding depuis l'IP publique vers Minikube
# Usage: ./k8s/setup-port-forwarding.sh

set -e

echo "🔧 Configuration du port forwarding pour exposer l'application publiquement..."

# Vérifier que le service existe
if ! kubectl get service frontend -n intelectgame &> /dev/null; then
    echo "❌ Le service frontend n'existe pas. Déployez d'abord l'application."
    exit 1
fi

# Obtenir l'IP de Minikube
MINIKUBE_IP=$(minikube ip)
NODEPORT=$(kubectl get service frontend -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}')

if [ -z "$MINIKUBE_IP" ] || [ -z "$NODEPORT" ]; then
    echo "❌ Impossible de récupérer l'IP de Minikube ou le NodePort"
    exit 1
fi

echo "📊 Configuration:"
echo "   IP Minikube: ${MINIKUBE_IP}"
echo "   NodePort: ${NODEPORT}"
echo ""

# Option 1: Utiliser iptables pour le port forwarding
if command -v iptables &> /dev/null; then
    echo "🔧 Configuration du port forwarding avec iptables..."
    
    # Vérifier si la règle existe déjà
    if sudo iptables -t nat -C PREROUTING -p tcp --dport ${NODEPORT} -j DNAT --to-destination ${MINIKUBE_IP}:${NODEPORT} 2>/dev/null; then
        echo "✅ Règle iptables déjà configurée"
    else
        # Ajouter la règle de port forwarding
        sudo iptables -t nat -A PREROUTING -p tcp --dport ${NODEPORT} -j DNAT --to-destination ${MINIKUBE_IP}:${NODEPORT}
        sudo iptables -A FORWARD -p tcp -d ${MINIKUBE_IP} --dport ${NODEPORT} -j ACCEPT
        
        echo "✅ Règle iptables ajoutée"
        echo "⚠️  Pour rendre cette règle permanente, sauvegardez les règles iptables"
    fi
fi

# Option 2: Utiliser socat (alternative)
if ! command -v iptables &> /dev/null && command -v socat &> /dev/null; then
    echo "🔧 Utilisation de socat pour le port forwarding..."
    
    # Vérifier si socat tourne déjà
    if pgrep -f "socat.*${NODEPORT}" > /dev/null; then
        echo "✅ socat déjà en cours d'exécution"
    else
        echo "🚀 Démarrage de socat (en arrière-plan)..."
        nohup socat TCP-LISTEN:${NODEPORT},fork,reuseaddr TCP:${MINIKUBE_IP}:${NODEPORT} > /dev/null 2>&1 &
        echo "✅ socat démarré"
    fi
fi

# Option 3: Utiliser minikube tunnel (recommandé)
echo ""
echo "🌐 Option recommandée: minikube tunnel"
echo "   Cette option expose les services via LoadBalancer"
echo ""
read -p "Voulez-vous utiliser minikube tunnel? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Changer le service en LoadBalancer
    kubectl patch service frontend -n intelectgame -p '{"spec":{"type":"LoadBalancer"}}'
    
    echo "✅ Service configuré en LoadBalancer"
    echo "🚀 Démarrage de minikube tunnel..."
    echo "   L'application sera accessible via l'IP LoadBalancer"
    echo "   Appuyez sur Ctrl+C pour arrêter"
    echo ""
    
    minikube tunnel
fi

