#!/bin/bash

# Script pour rebuild complètement l'API Gateway avec le code corrigé
# Usage: ./k8s/scripts/rebuild-api-gateway.sh

set -e

NAMESPACE="intelectgame"

echo "🔨 Rebuild complet de l'API Gateway..."
echo ""

# 1. Vérifier que Minikube est démarré
if ! minikube status &>/dev/null; then
    echo "❌ Minikube n'est pas démarré !"
    echo "   Démarrez Minikube avec: minikube start"
    exit 1
fi

echo "✅ Minikube est actif"
echo ""

# 2. Supprimer les anciens pods pour forcer le redéploiement
echo "1. Suppression des pods existants..."
kubectl delete pods -n $NAMESPACE -l app=api-gateway --force --grace-period=0 2>/dev/null || echo "   Aucun pod à supprimer"
sleep 2

# 3. Supprimer l'ancienne image pour forcer le rebuild
echo ""
echo "2. Suppression de l'ancienne image locale..."
eval $(minikube docker-env)
docker rmi thismann17/gamev2-api-gateway:latest 2>/dev/null || echo "   Image non trouvée (normal si première fois)"
sleep 1

# 4. Builder la nouvelle image avec le code corrigé
echo ""
echo "3. Construction de la nouvelle image avec le code corrigé..."
docker build --no-cache -t thismann17/gamev2-api-gateway:latest ./node/api-gateway

# 5. Vérifier que l'image a été créée
echo ""
echo "4. Vérification de l'image..."
if docker images | grep -q "thismann17/gamev2-api-gateway"; then
    echo "   ✅ Image créée avec succès"
    docker images | grep "thismann17/gamev2-api-gateway"
else
    echo "   ❌ Erreur lors de la création de l'image"
    exit 1
fi

# 6. Appliquer le deployment
echo ""
echo "5. Application du deployment..."
kubectl apply -f k8s/api-gateway-deployment.yaml

# 7. Attendre que les pods démarrent
echo ""
echo "6. Attente que les pods démarrent (90 secondes)..."
sleep 5
kubectl wait --for=condition=ready pod -l app=api-gateway -n $NAMESPACE --timeout=90s || {
    echo "   ⚠️  Timeout, vérification de l'état..."
    kubectl get pods -n $NAMESPACE -l app=api-gateway
}

# 8. Vérifier les logs
echo ""
echo "7. Vérification des logs..."
POD_NAME=$(kubectl get pods -n $NAMESPACE -l app=api-gateway -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$POD_NAME" ]; then
    echo "   Logs de $POD_NAME (dernières 15 lignes) :"
    kubectl logs -n $NAMESPACE $POD_NAME --tail=15
    echo ""
    
    # Vérifier s'il y a des erreurs
    if kubectl logs -n $NAMESPACE $POD_NAME 2>&1 | grep -q "Error\|error\|Cannot find module"; then
        echo "   ⚠️  Des erreurs ont été détectées dans les logs"
        echo "   Voir les logs complets avec: kubectl logs -n $NAMESPACE $POD_NAME"
    else
        echo "   ✅ Aucune erreur détectée dans les logs"
    fi
else
    echo "   ❌ Aucun pod trouvé"
fi

# 9. Test de santé
echo ""
echo "8. Test de santé..."
if [ -n "$POD_NAME" ]; then
    HEALTH=$(kubectl exec -n $NAMESPACE $POD_NAME -- wget -qO- --timeout=5 http://localhost:3000/health 2>/dev/null || echo "FAILED")
    if echo "$HEALTH" | grep -q "ok"; then
        echo "   ✅ API Gateway est en bonne santé"
        echo "   Réponse: $HEALTH"
    else
        echo "   ⚠️  API Gateway ne répond pas correctement"
        echo "   Réponse: $HEALTH"
    fi
fi

# 10. Statut final
echo ""
echo "9. Statut final des pods..."
kubectl get pods -n $NAMESPACE -l app=api-gateway

echo ""
echo "✅ Rebuild terminé !"
echo ""
echo "📋 Commandes utiles :"
echo "   - Voir les logs: kubectl logs -n $NAMESPACE -l app=api-gateway -f"
echo "   - Voir l'état: kubectl get pods -n $NAMESPACE -l app=api-gateway"
echo "   - Tester: kubectl port-forward -n $NAMESPACE service/api-gateway 3000:3000"
echo "   - Puis: curl http://localhost:3000/health"
echo ""

