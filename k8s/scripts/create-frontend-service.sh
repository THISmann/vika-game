#!/bin/bash

# Script pour créer le service frontend manquant
# Usage: ./k8s/create-frontend-service.sh

set -e

echo "🔧 Création du service frontend..."
echo ""

# Vérifier si le service existe déjà
if kubectl get service frontend -n intelectgame &> /dev/null; then
    echo "ℹ️  Le service frontend existe déjà"
    kubectl get service frontend -n intelectgame
    exit 0
fi

# Vérifier que le déploiement frontend existe
if ! kubectl get deployment frontend -n intelectgame &> /dev/null; then
    echo "❌ Le déploiement frontend n'existe pas!"
    echo "Déployez d'abord le frontend avec: kubectl apply -f k8s/frontend-deployment.yaml"
    exit 1
fi

echo "✅ Déploiement frontend trouvé"
echo ""

# Créer le service frontend
echo "📝 Création du service frontend..."

cat > /tmp/frontend-service.yaml <<EOF
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: intelectgame
  labels:
    app: frontend
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 5173
    protocol: TCP
  selector:
    app: frontend
EOF

kubectl apply -f /tmp/frontend-service.yaml
echo "✅ Service frontend créé"
echo ""

# Vérifier que le service est créé
echo "=== Vérification ==="
kubectl get service frontend -n intelectgame
echo ""

# Obtenir le ClusterIP
FRONTEND_IP=$(kubectl get service frontend -n intelectgame -o jsonpath='{.spec.clusterIP}')
echo "✅ Service frontend créé avec ClusterIP: $FRONTEND_IP"
echo ""
echo "Vous pouvez maintenant exécuter: ./k8s/final-fix-nginx.sh"

