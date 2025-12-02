#!/bin/bash

# Script de déploiement pour VM cloud.ru avec Minikube
# Usage: ./k8s/deploy-vm.sh [--rebuild] [--token TELEGRAM_TOKEN]

set -e

REBUILD=false
TELEGRAM_TOKEN=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --rebuild)
      REBUILD=true
      shift
      ;;
    --token)
      TELEGRAM_TOKEN="$2"
      shift 2
      ;;
    *)
      echo "Usage: $0 [--rebuild] [--token TELEGRAM_TOKEN]"
      exit 1
      ;;
  esac
done

echo "🚀 Déploiement de l'application sur VM cloud.ru..."

# Vérifier que Minikube est démarré
if ! minikube status &> /dev/null; then
    echo "❌ Minikube n'est pas démarré. Démarrage de Minikube..."
    minikube start --driver=docker
    echo "✅ Minikube démarré"
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

# Gestion du secret Telegram Bot
if ! kubectl get secret telegram-bot-secret -n intelectgame &> /dev/null; then
    if [ -z "$TELEGRAM_TOKEN" ]; then
        echo "🤖 Configuration du token Telegram Bot..."
        read -p "Entrez votre token Telegram Bot: " TELEGRAM_TOKEN
    fi
    
    if [ -n "$TELEGRAM_TOKEN" ]; then
        kubectl create secret generic telegram-bot-secret \
            --from-literal=TELEGRAM_BOT_TOKEN="$TELEGRAM_TOKEN" \
            -n intelectgame
        echo "✅ Secret Telegram Bot créé"
    else
        echo "⚠️  Secret Telegram Bot non créé. Le service telegram-bot ne fonctionnera pas."
    fi
else
    if [ -n "$TELEGRAM_TOKEN" ]; then
        echo "🔄 Mise à jour du secret Telegram Bot..."
        kubectl delete secret telegram-bot-secret -n intelectgame
        kubectl create secret generic telegram-bot-secret \
            --from-literal=TELEGRAM_BOT_TOKEN="$TELEGRAM_TOKEN" \
            -n intelectgame
        echo "✅ Secret Telegram Bot mis à jour"
    else
        echo "✅ Secret Telegram Bot existe déjà"
    fi
fi

# Construire les images si nécessaire
if [ "$REBUILD" = true ] || ! docker images | grep -q "thismann17/gamev2-auth-service"; then
    echo "🔨 Construction des images Docker..."
    
    echo "  📦 auth-service..."
    docker build -t thismann17/gamev2-auth-service:latest ./node/auth-service
    
    echo "  📦 quiz-service..."
    docker build -t thismann17/gamev2-quiz-service:latest ./node/quiz-service
    
    echo "  📦 game-service..."
    docker build -t thismann17/gamev2-game-service:latest ./node/game-service
    
    echo "  📦 telegram-bot..."
    docker build -t thismann17/gamev2-telegram-bot:latest ./node/telegram-bot
    
    echo "  📦 frontend..."
    docker build -t thismann17/gamev2-frontend:latest ./vue
    
    echo "✅ Toutes les images construites"
else
    echo "✅ Images Docker déjà présentes (utilisez --rebuild pour reconstruire)"
fi

# Créer une version modifiée du fichier avec imagePullPolicy: Never
echo "📝 Préparation de la configuration Kubernetes..."
cat k8s/all-services.yaml | sed 's/imagePullPolicy: Always/imagePullPolicy: Never/g' > /tmp/all-services-vm.yaml

# Déployer tous les services
echo "📦 Déploiement des services..."
kubectl apply -f /tmp/all-services-vm.yaml

# Attendre que les pods soient prêts
echo "⏳ Attente du démarrage des pods (timeout: 5 minutes)..."
kubectl wait --for=condition=ready pod --all -n intelectgame --timeout=300s || {
    echo "⚠️  Certains pods ne sont pas prêts. Vérification..."
    kubectl get pods -n intelectgame
}

# Afficher le statut
echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "📊 Statut des pods:"
kubectl get pods -n intelectgame

echo ""
echo "🌐 Services:"
kubectl get services -n intelectgame

# Obtenir l'IP de Minikube
MINIKUBE_IP=$(minikube ip)
NODEPORT=$(kubectl get service frontend -n intelectgame -o jsonpath='{.spec.ports[0].nodePort}')

echo ""
echo "🔗 Accès à l'application:"
echo "   Frontend: http://${MINIKUBE_IP}:${NODEPORT}"
echo ""
echo "   Pour exposer publiquement, configurez un reverse proxy ou utilisez:"
echo "   minikube tunnel"
echo ""
echo "📝 Commandes utiles:"
echo "   Voir les logs: kubectl logs -f <pod-name> -n intelectgame"
echo "   Redémarrer un service: kubectl rollout restart deployment/<service-name> -n intelectgame"
echo "   Supprimer le déploiement: kubectl delete -f /tmp/all-services-vm.yaml"
echo ""

# Option pour exposer via minikube tunnel
read -p "Voulez-vous démarrer minikube tunnel pour exposer les services? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Démarrage de minikube tunnel (Ctrl+C pour arrêter)..."
    minikube tunnel
fi

