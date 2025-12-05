#!/bin/bash

# Script pour installer Nginx comme reverse proxy externe
# Usage: ./k8s/setup-nginx-reverse-proxy.sh

set -e

echo "🌐 Installation de Nginx comme reverse proxy..."
echo ""

# 1. Vérifier que Nginx n'est pas déjà installé
if command -v nginx &> /dev/null; then
    echo "ℹ️  Nginx est déjà installé"
    read -p "Voulez-vous continuer et reconfigurer? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# 2. Installer Nginx
echo "=== 1. Installation de Nginx ==="
if ! command -v nginx &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y nginx
    echo "✅ Nginx installé"
else
    echo "✅ Nginx déjà installé"
fi
echo ""

# 3. Obtenir l'IP de Minikube et le NodePort
MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "192.168.49.2")
NODEPORT=$(kubectl get service nginx-proxy -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "30081")
VM_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "82.202.141.248")

echo "=== 2. Configuration ==="
echo "IP Minikube: $MINIKUBE_IP"
echo "NodePort: $NODEPORT"
echo "IP publique VM: $VM_IP"
echo ""

# 4. Créer la configuration Nginx
echo "=== 3. Création de la configuration Nginx ==="

sudo tee /etc/nginx/sites-available/intelectgame <<EOF
server {
    listen 80;
    server_name ${VM_IP} 82.202.141.248 _;

    # Logs
    access_log /var/log/nginx/intelectgame-access.log;
    error_log /var/log/nginx/intelectgame-error.log;

    # Frontend et API
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

echo "✅ Configuration créée"
echo ""

# 5. Activer le site
echo "=== 4. Activation du site ==="
sudo ln -sf /etc/nginx/sites-available/intelectgame /etc/nginx/sites-enabled/
echo "✅ Site activé"
echo ""

# 6. Désactiver le site par défaut si nécessaire
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "⚠️  Désactivation du site par défaut..."
    sudo rm /etc/nginx/sites-enabled/default
    echo "✅ Site par défaut désactivé"
fi
echo ""

# 7. Tester la configuration
echo "=== 5. Test de la configuration ==="
if sudo nginx -t; then
    echo "✅ Configuration valide"
else
    echo "❌ Erreur dans la configuration"
    exit 1
fi
echo ""

# 8. Redémarrer Nginx
echo "=== 6. Redémarrage de Nginx ==="
sudo systemctl restart nginx
sudo systemctl enable nginx
echo "✅ Nginx redémarré et activé au démarrage"
echo ""

# 9. Configurer le firewall
echo "=== 7. Configuration du firewall ==="
if command -v ufw &> /dev/null; then
    if sudo ufw status | grep -q "80/tcp"; then
        echo "✅ Port 80 déjà ouvert"
    else
        echo "🔓 Ouverture du port 80..."
        sudo ufw allow 80/tcp
        echo "✅ Port 80 ouvert"
    fi
else
    echo "⚠️  ufw non installé, configurez manuellement le firewall pour le port 80"
fi
echo ""

# 10. Test final
echo "=== 8. Test final ==="
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://localhost" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✅ Nginx fonctionne! Code HTTP: $HTTP_CODE"
else
    echo "⚠️  Code HTTP: $HTTP_CODE"
    echo "   Vérifiez les logs: sudo tail -f /var/log/nginx/intelectgame-error.log"
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✅ Installation terminée!"
echo ""
echo "🔗 Accès à l'application:"
echo "   http://${VM_IP}"
echo "   http://82.202.141.248"
echo ""
echo "📝 Commandes utiles:"
echo "   Voir les logs: sudo tail -f /var/log/nginx/intelectgame-error.log"
echo "   Redémarrer: sudo systemctl restart nginx"
echo "   Tester la config: sudo nginx -t"
echo ""
echo "⚠️  IMPORTANT: Ouvrez le port 80 dans le firewall de cloud.ru!"
echo "═══════════════════════════════════════════════════════════"

