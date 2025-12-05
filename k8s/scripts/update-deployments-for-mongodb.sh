#!/bin/bash

# Script pour mettre à jour les déploiements existants pour utiliser MongoDB
# Usage: ./k8s/update-deployments-for-mongodb.sh

set -e

echo "🔄 Mise à jour des déploiements pour utiliser MongoDB..."
echo ""

# Vérifier que MongoDB est déployé
if ! kubectl get deployment -n intelectgame mongodb &>/dev/null; then
  echo "❌ MongoDB n'est pas déployé. Déployez-le d'abord avec:"
  echo "   ./k8s/deploy-mongodb.sh"
  exit 1
fi

echo "✅ MongoDB est déployé"
echo ""

# Vérifier que le ConfigMap existe
if ! kubectl get configmap -n intelectgame app-config &>/dev/null; then
  echo "📝 Création du ConfigMap app-config..."
  kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: intelectgame
data:
  MONGODB_URI: "mongodb://mongodb:27017/intelectgame"
  AUTH_SERVICE_URL: "http://auth-service:3001"
  QUIZ_SERVICE_URL: "http://quiz-service:3002"
  GAME_SERVICE_URL: "http://game-service:3003"
  NODE_ENV: "production"
EOF
  echo "✅ ConfigMap créé"
else
  echo "✅ ConfigMap existe déjà"
  
  # Vérifier que MONGODB_URI est présent
  if kubectl get configmap -n intelectgame app-config -o jsonpath='{.data.MONGODB_URI}' &>/dev/null; then
    echo "✅ MONGODB_URI est configuré"
  else
    echo "📝 Ajout de MONGODB_URI au ConfigMap..."
    kubectl patch configmap -n intelectgame app-config --type merge -p '{"data":{"MONGODB_URI":"mongodb://mongodb:27017/intelectgame"}}'
    echo "✅ MONGODB_URI ajouté"
  fi
fi
echo ""

# Redémarrer les déploiements pour qu'ils utilisent MongoDB
echo "🔄 Redémarrage des services pour utiliser MongoDB..."
SERVICES=("auth-service" "quiz-service" "game-service")

for service in "${SERVICES[@]}"; do
  if kubectl get deployment -n intelectgame "$service" &>/dev/null; then
    echo "   Redémarrage de $service..."
    kubectl rollout restart deployment/"$service" -n intelectgame
    echo "   ✅ $service redémarré"
  else
    echo "   ⚠️  $service n'est pas déployé"
  fi
done

echo ""
echo "⏳ Attente que les services redémarrent..."
sleep 5

for service in "${SERVICES[@]}"; do
  if kubectl get deployment -n intelectgame "$service" &>/dev/null; then
    echo "   Vérification de $service..."
    kubectl rollout status deployment/"$service" -n intelectgame --timeout=120s || echo "   ⚠️  $service prend plus de temps"
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Mise à jour terminée!"
echo ""
echo "📝 Vérifiez que les services se connectent à MongoDB:"
echo "   kubectl logs -n intelectgame deployment/auth-service | grep MongoDB"
echo "   kubectl logs -n intelectgame deployment/quiz-service | grep MongoDB"
echo "   kubectl logs -n intelectgame deployment/game-service | grep MongoDB"
echo ""
echo "🔍 Pour vérifier MongoDB:"
echo "   ./k8s/verify-mongodb.sh"
echo "═══════════════════════════════════════════════════════════"

