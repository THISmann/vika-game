#!/bin/bash

# Script pour exposer l'application publiquement sur la VM
# Configure un service NodePort et affiche les informations de connexion
# Usage: ./k8s/expose-public.sh

set -e

echo "🌐 Configuration de l'exposition publique..."

# Vérifier que les services sont déployés
if ! kubectl get service frontend -n intelectgame &> /dev/null; then
    echo "❌ Les services ne sont pas déployés. Exécutez d'abord ./k8s/deploy-vm.sh"
    exit 1
fi

# Obtenir l'IP publique de la VM
VM_IP=$(hostname -I | awk '{print $1}')
if [ -z "$VM_IP" ]; then
    VM_IP=$(ip a | grep -oP 'inet \K[\d.]+' | grep -v '127.0.0.1' | head -1)
fi

# Obtenir l'IP de Minikube
MINIKUBE_IP=$(minikube ip)

# Obtenir le NodePort (depuis nginx-proxy ou frontend)
NODEPORT=$(kubectl get service nginx-proxy -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || \
           kubectl get service frontend -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || \
           echo "30081")

echo ""
echo "📊 Informations de connexion:"
echo "   IP de la VM: ${VM_IP}"
echo "   IP de Minikube: ${MINIKUBE_IP}"
echo "   NodePort: ${NODEPORT}"
echo ""
echo "🔗 URLs d'accès:"
echo "   Frontend (via VM IP): http://${VM_IP}:${NODEPORT}"
echo "   Frontend (via Minikube IP): http://${MINIKUBE_IP}:${NODEPORT}"
echo ""

# Vérifier si le firewall doit être configuré
if command -v ufw &> /dev/null; then
    echo "🔥 Configuration du firewall (ufw)..."
    sudo ufw allow ${NODEPORT}/tcp
    echo "✅ Port ${NODEPORT} ouvert dans le firewall"
elif command -v firewall-cmd &> /dev/null; then
    echo "🔥 Configuration du firewall (firewalld)..."
    sudo firewall-cmd --permanent --add-port=${NODEPORT}/tcp
    sudo firewall-cmd --reload
    echo "✅ Port ${NODEPORT} ouvert dans le firewall"
else
    echo "⚠️  Aucun gestionnaire de firewall détecté. Assurez-vous que le port ${NODEPORT} est ouvert."
fi

echo ""
echo "📝 Pour exposer via un reverse proxy (nginx), créez une configuration:"
echo ""
cat <<EOF
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://${MINIKUBE_IP}:${NODEPORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

echo ""
echo "✅ Configuration terminée!"

