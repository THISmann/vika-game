#!/bin/bash

# Script pour déployer l'application sur Minikube
# Usage: ./k8s/deploy.sh

set -e

echo "🚀 Déploiement de l'application sur Minikube..."

# Vérifier que Minikube est démarré
if ! minikube status &> /dev/null; then
    echo "❌ Minikube n'est pas démarré. Démarrage de Minikube..."
    minikube start
fi

# Vérifier que le namespace existe
echo "📦 Création du namespace..."
kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: intelectgame
EOF

# Déployer MongoDB en premier
echo "🐳 Déploiement de MongoDB..."
if [ -f "k8s/mongodb-deployment.yaml" ]; then
  kubectl apply -f k8s/mongodb-deployment.yaml
  echo "⏳ Attente que MongoDB soit prêt..."
  kubectl wait --for=condition=available --timeout=300s deployment/mongodb -n intelectgame || {
    echo "⚠️  MongoDB prend plus de temps que prévu"
  }
  echo "✅ MongoDB déployé"
else
  echo "⚠️  Fichier mongodb-deployment.yaml non trouvé, MongoDB ne sera pas déployé"
fi
echo ""

# Demander le token Telegram si nécessaire
if ! kubectl get secret telegram-bot-secret -n intelectgame &> /dev/null; then
    echo "🤖 Configuration du token Telegram Bot..."
    read -p "Entrez votre token Telegram Bot (ou appuyez sur Entrée pour ignorer): " TELEGRAM_TOKEN
    
    if [ -n "$TELEGRAM_TOKEN" ]; then
        kubectl create secret generic telegram-bot-secret \
            --from-literal=TELEGRAM_BOT_TOKEN="$TELEGRAM_TOKEN" \
            -n intelectgame \
            --dry-run=client -o yaml | kubectl apply -f -
        echo "✅ Secret Telegram Bot créé"
    else
        echo "⚠️  Secret Telegram Bot non créé. Vous devrez le créer manuellement."
    fi
fi

# Déployer tous les services
echo "📦 Déploiement des services..."
kubectl apply -f k8s/all-services.yaml

# Attendre que les pods soient prêts
echo "⏳ Attente du démarrage des pods..."
kubectl wait --for=condition=ready pod --all -n intelectgame --timeout=300s

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
echo "Pour voir les logs d'un service:"
echo "   kubectl logs -f <pod-name> -n intelectgame"
echo ""
echo "Pour supprimer le déploiement:"
echo "   kubectl delete -f k8s/all-services.yaml"

