#!/bin/bash

# Script pour builder l'image API Gateway localement dans Minikube
# Usage: ./k8s/scripts/build-api-gateway-local.sh

set -e

echo "🔨 Construction de l'image API Gateway localement dans Minikube..."
echo ""

# 1. Vérifier que Minikube est démarré
if ! minikube status &>/dev/null; then
    echo "❌ Minikube n'est pas démarré !"
    echo "   Démarrez Minikube avec: minikube start"
    exit 1
fi

echo "✅ Minikube est actif"
echo ""

# 2. Configurer Docker pour utiliser le daemon Docker de Minikube
echo "1. Configuration de l'environnement Docker pour Minikube..."
eval $(minikube docker-env)

# 3. Builder l'image
echo ""
echo "2. Construction de l'image API Gateway..."
docker build -t thismann17/gamev2-api-gateway:latest ./node/api-gateway

# 4. Vérifier que l'image a été créée
echo ""
echo "3. Vérification de l'image..."
if docker images | grep -q "thismann17/gamev2-api-gateway"; then
    echo "   ✅ Image créée avec succès"
    docker images | grep "thismann17/gamev2-api-gateway"
else
    echo "   ❌ Erreur lors de la création de l'image"
    exit 1
fi

# 5. Mettre à jour le deployment pour utiliser l'image locale
echo ""
echo "4. Mise à jour du deployment pour utiliser l'image locale..."
kubectl set image deployment/api-gateway api-gateway=thismann17/gamev2-api-gateway:latest -n intelectgame

# 6. Attendre que le déploiement soit prêt
echo ""
echo "5. Attente que les pods redémarrent..."
kubectl rollout status deployment/api-gateway -n intelectgame --timeout=120s

# 7. Vérifier le statut
echo ""
echo "6. Statut des pods..."
kubectl get pods -n intelectgame -l app=api-gateway

echo ""
echo "✅ Image API Gateway construite et déployée avec succès !"
echo ""
echo "📋 Commandes utiles :"
echo "   - Voir les logs: kubectl logs -n intelectgame -l app=api-gateway -f"
echo "   - Tester: kubectl port-forward -n intelectgame service/api-gateway 3000:3000"
echo "   - Puis: curl http://localhost:3000/health"
echo ""

