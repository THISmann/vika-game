#!/bin/bash

# Script pour configurer Nginx comme reverse proxy
# Usage: ./k8s/setup-nginx-proxy.sh

set -e

echo "🌐 Configuration de Nginx comme reverse proxy..."

# Vérifier que le service existe
if ! kubectl get service frontend -n intelectgame &> /dev/null; then
    echo "❌ Le service frontend n'existe pas. Déployez d'abord l'application."
    exit 1
fi

# Vérifier que Nginx est installé
if ! command -v nginx &> /dev/null; then
    echo "📦 Installation de Nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

# Obtenir l'IP de Minikube
MINIKUBE_IP=$(minikube ip)
NODEPORT=$(kubectl get service frontend -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}')

if [ -z "$MINIKUBE_IP" ] || [ -z "$NODEPORT" ]; then
    echo "❌ Impossible de récupérer l'IP de Minikube ou le NodePort"
    exit 1
fi

# Obtenir l'IP publique de la VM
VM_IP=$(hostname -I | awk '{print $1}')

echo "📊 Configuration:"
echo "   IP Minikube: ${MINIKUBE_IP}"
echo "   NodePort: ${NODEPORT}"
echo "   IP VM: ${VM_IP}"
echo ""

# Créer la configuration Nginx
NGINX_CONFIG="/etc/nginx/sites-available/intelectgame"
NGINX_ENABLED="/etc/nginx/sites-enabled/intelectgame"

echo "📝 Création de la configuration Nginx..."

sudo tee ${NGINX_CONFIG} > /dev/null <<EOF
server {
    listen 80;
    server_name ${VM_IP} _;

    # Logs
    access_log /var/log/nginx/intelectgame-access.log;
    error_log /var/log/nginx/intelectgame-error.log;

    # Frontend
    location / {
        proxy_pass http://${MINIKUBE_IP}:${NODEPORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Activer la configuration
if [ -L "${NGINX_ENABLED}" ]; then
    sudo rm ${NGINX_ENABLED}
fi
sudo ln -s ${NGINX_CONFIG} ${NGINX_ENABLED}

# Tester la configuration
echo "🔍 Test de la configuration Nginx..."
if sudo nginx -t; then
    echo "✅ Configuration valide"
    
    # Recharger Nginx
    sudo systemctl reload nginx
    echo "✅ Nginx rechargé"
    
    # Vérifier le statut
    if sudo systemctl is-active --quiet nginx; then
        echo "✅ Nginx est actif"
    else
        echo "⚠️  Démarrage de Nginx..."
        sudo systemctl start nginx
    fi
else
    echo "❌ Erreur dans la configuration Nginx"
    exit 1
fi

# Configurer le firewall
if command -v ufw &> /dev/null; then
    echo "🔥 Configuration du firewall (ufw)..."
    sudo ufw allow 80/tcp
    sudo ufw allow 'Nginx Full'
    echo "✅ Port 80 ouvert dans le firewall"
elif command -v firewall-cmd &> /dev/null; then
    echo "🔥 Configuration du firewall (firewalld)..."
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --reload
    echo "✅ Service HTTP ouvert dans le firewall"
fi

echo ""
echo "✅ Configuration terminée!"
echo ""
echo "🔗 Accès à l'application:"
echo "   http://${VM_IP}"
echo "   http://82.202.141.248"
echo ""
echo "📝 Pour configurer un domaine, modifiez:"
echo "   ${NGINX_CONFIG}"
echo "   Et changez 'server_name' avec votre domaine"

