#!/bin/bash

# Script pour déployer avec des images locales (pour ARM64/AMD64)
# Usage: ./k8s/deploy-local.sh

set -e

echo "🚀 Déploiement avec images locales..."

# Vérifier que Minikube est démarré
if ! minikube status &> /dev/null; then
    echo "❌ Minikube n'est pas démarré. Démarrage de Minikube..."
    minikube start --driver=docker
fi

# Activer le Docker daemon de Minikube
echo "🐳 Configuration du Docker daemon de Minikube..."
eval $(minikube docker-env)

# Créer le namespace
echo "📦 Création du namespace..."
kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: intelectgame
EOF

# Demander le token Telegram
if ! kubectl get secret telegram-bot-secret -n intelectgame &> /dev/null; then
    echo "🤖 Configuration du token Telegram Bot..."
    read -p "Entrez votre token Telegram Bot (ou appuyez sur Entrée pour ignorer): " TELEGRAM_TOKEN
    
    if [ -n "$TELEGRAM_TOKEN" ]; then
        kubectl create secret generic telegram-bot-secret \
            --from-literal=TELEGRAM_BOT_TOKEN="$TELEGRAM_TOKEN" \
            -n intelectgame \
            --dry-run=client -o yaml | kubectl apply -f -
        echo "✅ Secret Telegram Bot créé"
    fi
fi

# Construire les images localement
echo "🔨 Construction des images Docker..."
echo "  - auth-service..."
docker build -t thismann17/gamev2-auth-service:latest ./node/auth-service

echo "  - quiz-service..."
docker build -t thismann17/gamev2-quiz-service:latest ./node/quiz-service

echo "  - game-service..."
docker build -t thismann17/gamev2-game-service:latest ./node/game-service

echo "  - telegram-bot..."
docker build -t thismann17/gamev2-telegram-bot:latest ./node/telegram-bot

echo "  - frontend..."
docker build -t thismann17/gamev2-frontend:latest ./vue

# Créer une version modifiée du fichier avec imagePullPolicy: Never
echo "📝 Création de la configuration avec images locales..."
cat k8s/all-services.yaml | sed 's/imagePullPolicy: Always/imagePullPolicy: Never/g' > /tmp/all-services-local.yaml

# Déployer
echo "📦 Déploiement des services..."
kubectl apply -f /tmp/all-services-local.yaml

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

echo ""
echo "🔗 Accès à l'application:"
echo "   Frontend: http://$(minikube ip):30080"
echo ""
echo "Pour voir les logs:"
echo "   kubectl logs -f <pod-name> -n intelectgame"

