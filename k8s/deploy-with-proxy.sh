#!/bin/bash

# Script pour déployer avec le proxy Nginx
# Usage: ./k8s/deploy-with-proxy.sh

set -e

echo "🚀 Déploiement avec proxy Nginx..."

# Vérifier que Minikube est démarré
if ! minikube status &> /dev/null; then
    echo "❌ Minikube n'est pas démarré. Démarrage de Minikube..."
    minikube start --driver=docker
fi

# Activer le Docker daemon de Minikube
eval $(minikube docker-env)

# Créer le namespace
kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: intelectgame
EOF

# Gestion du secret Telegram Bot
if ! kubectl get secret telegram-bot-secret -n intelectgame &> /dev/null; then
    echo "🤖 Configuration du token Telegram Bot..."
    read -p "Entrez votre token Telegram Bot: " TELEGRAM_TOKEN
    
    if [ -n "$TELEGRAM_TOKEN" ]; then
        kubectl create secret generic telegram-bot-secret \
            --from-literal=TELEGRAM_BOT_TOKEN="$TELEGRAM_TOKEN" \
            -n intelectgame
        echo "✅ Secret Telegram Bot créé"
    fi
fi

# Construire les images
echo "🔨 Construction des images Docker..."
docker build -t thismann17/gamev2-auth-service:latest ./node/auth-service
docker build -t thismann17/gamev2-quiz-service:latest ./node/quiz-service
docker build -t thismann17/gamev2-game-service:latest ./node/game-service
docker build -t thismann17/gamev2-telegram-bot:latest ./node/telegram-bot
docker build -t thismann17/gamev2-frontend:latest ./vue

# Créer la configuration avec imagePullPolicy: Never
cat k8s/all-services.yaml | sed 's/imagePullPolicy: Always/imagePullPolicy: Never/g' > /tmp/all-services-vm.yaml

# Déployer le proxy Nginx
echo "🌐 Déploiement du proxy Nginx..."
kubectl apply -f k8s/nginx-proxy-config.yaml

# Déployer tous les services
echo "📦 Déploiement des services..."
kubectl apply -f /tmp/all-services-vm.yaml

# Attendre que les pods soient prêts
echo "⏳ Attente du démarrage des pods..."
kubectl wait --for=condition=ready pod --all -n intelectgame --timeout=300s || true

# Afficher le statut
echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "📊 Statut des pods:"
kubectl get pods -n intelectgame

echo ""
echo "🌐 Services:"
kubectl get services -n intelectgame

# Obtenir l'IP et le port
MINIKUBE_IP=$(minikube ip)
NODEPORT=$(kubectl get service nginx-proxy -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "30080")
VM_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "🔗 Accès à l'application:"
echo "   Via proxy Nginx: http://${VM_IP}:${NODEPORT}"
echo "   Via Minikube IP: http://${MINIKUBE_IP}:${NODEPORT}"
echo ""
echo "📝 Les APIs sont accessibles via:"
echo "   - http://${VM_IP}:${NODEPORT}/api/auth"
echo "   - http://${VM_IP}:${NODEPORT}/api/quiz"
echo "   - http://${VM_IP}:${NODEPORT}/api/game"

