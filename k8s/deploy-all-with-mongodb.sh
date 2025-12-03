#!/bin/bash

# Script pour déployer toute l'application avec MongoDB sur Minikube
# Usage: ./k8s/deploy-all-with-mongodb.sh

set -e

echo "🚀 Déploiement complet de l'application avec MongoDB..."
echo ""

# Vérifier que Minikube est démarré
if ! minikube status &>/dev/null; then
  echo "❌ Minikube n'est pas démarré. Démarrage de Minikube..."
  minikube start
fi

echo "✅ Minikube est démarré"
echo ""

# Étape 1: Créer le namespace
echo "📦 Étape 1: Création du namespace..."
kubectl create namespace intelectgame 2>/dev/null || echo "   Namespace existe déjà"
echo ""

# Étape 2: Déployer MongoDB
echo "🐳 Étape 2: Déploiement de MongoDB..."
if [ -f "k8s/mongodb-deployment.yaml" ]; then
  kubectl apply -f k8s/mongodb-deployment.yaml
  
  echo "⏳ Attente que MongoDB soit prêt..."
  kubectl wait --for=condition=available --timeout=300s deployment/mongodb -n intelectgame || {
    echo "⚠️  MongoDB prend plus de temps que prévu"
    echo "   Vérifiez les logs: kubectl logs -n intelectgame deployment/mongodb"
  }
  echo "✅ MongoDB est prêt"
else
  echo "❌ Fichier mongodb-deployment.yaml non trouvé"
  exit 1
fi
echo ""

# Étape 3: Configurer les secrets et ConfigMaps
echo "🔐 Étape 3: Configuration des secrets et ConfigMaps..."

# Secret Telegram Bot (optionnel)
if ! kubectl get secret telegram-bot-secret -n intelectgame &>/dev/null; then
  echo "   Configuration du token Telegram Bot (optionnel)..."
  read -p "   Entrez votre token Telegram Bot (ou appuyez sur Entrée pour ignorer): " TELEGRAM_TOKEN
  
  if [ -n "$TELEGRAM_TOKEN" ]; then
    kubectl create secret generic telegram-bot-secret \
      --from-literal=TELEGRAM_BOT_TOKEN="$TELEGRAM_TOKEN" \
      -n intelectgame
    echo "   ✅ Secret Telegram Bot créé"
  else
    echo "   ⚠️  Telegram Bot ignoré"
  fi
else
  echo "   ✅ Secret Telegram Bot existe déjà"
fi

# ConfigMap pour les variables d'environnement
if ! kubectl get configmap app-config -n intelectgame &>/dev/null; then
  echo "   Création du ConfigMap app-config..."
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
  echo "   ✅ ConfigMap créé"
else
  echo "   ✅ ConfigMap existe déjà"
  
  # Vérifier que MONGODB_URI est présent
  if ! kubectl get configmap app-config -n intelectgame -o jsonpath='{.data.MONGODB_URI}' &>/dev/null; then
    echo "   Mise à jour du ConfigMap avec MONGODB_URI..."
    kubectl patch configmap app-config -n intelectgame --type merge -p '{"data":{"MONGODB_URI":"mongodb://mongodb:27017/intelectgame"}}'
    echo "   ✅ MONGODB_URI ajouté"
  fi
fi
echo ""

# Étape 4: Déployer les micro-services
echo "🚀 Étape 4: Déploiement des micro-services..."
if [ -f "k8s/all-services.yaml" ]; then
  kubectl apply -f k8s/all-services.yaml
  echo "✅ Services déployés"
else
  echo "❌ Fichier all-services.yaml non trouvé"
  exit 1
fi
echo ""

# Étape 5: Attendre que tous les services soient prêts
echo "⏳ Étape 5: Attente que tous les services soient prêts..."
SERVICES=("auth-service" "quiz-service" "game-service" "frontend")

for service in "${SERVICES[@]}"; do
  if kubectl get deployment -n intelectgame "$service" &>/dev/null; then
    echo "   Attente de $service..."
    kubectl wait --for=condition=available --timeout=180s deployment/"$service" -n intelectgame || {
      echo "   ⚠️  $service prend plus de temps que prévu"
    }
  fi
done
echo ""

# Étape 6: Vérifier MongoDB
echo "🔍 Étape 6: Vérification de MongoDB..."
if kubectl get pods -n intelectgame -l app=mongodb | grep -q Running; then
  echo "✅ MongoDB est en cours d'exécution"
  
  # Tester la connexion
  POD_NAME=$(kubectl get pods -n intelectgame -l app=mongodb -o jsonpath='{.items[0].metadata.name}')
  if kubectl exec -n intelectgame "$POD_NAME" -- mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
    echo "✅ MongoDB répond correctement"
  else
    echo "⚠️  MongoDB ne répond pas (peut prendre quelques secondes)"
  fi
else
  echo "❌ MongoDB n'est pas en cours d'exécution"
fi
echo ""

# Résumé
echo "═══════════════════════════════════════════════════════════"
echo "✅ Déploiement terminé!"
echo ""
echo "📊 Statut des services:"
kubectl get pods -n intelectgame
echo ""
echo "🔗 Services:"
kubectl get svc -n intelectgame
echo ""
echo "💾 MongoDB:"
kubectl get pvc -n intelectgame mongodb-pvc 2>/dev/null || echo "   PVC non trouvé"
echo ""
echo "🔍 Pour vérifier MongoDB:"
echo "   ./k8s/verify-mongodb.sh"
echo ""
echo "📝 Pour voir les logs d'un service:"
echo "   kubectl logs -n intelectgame deployment/auth-service"
echo "   kubectl logs -n intelectgame deployment/quiz-service"
echo "   kubectl logs -n intelectgame deployment/game-service"
echo "   kubectl logs -n intelectgame deployment/mongodb"
echo ""
echo "🌐 Pour accéder à l'application:"
echo "   minikube service frontend -n intelectgame"
echo "═══════════════════════════════════════════════════════════"

