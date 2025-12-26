#!/bin/bash

# Script pour déployer l'application en local avec Helm

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HELM_DIR="$SCRIPT_DIR/../helm"

echo "🚀 Déploiement local avec Helm..."
echo ""

# 1. Vérifier que Minikube est démarré
if ! minikube status &> /dev/null; then
  echo "❌ Minikube n'est pas démarré. Lancez d'abord: ./setup-minikube.sh"
  exit 1
fi

# 2. Configurer Docker pour Minikube
echo "🐳 Configuration de Docker pour Minikube..."
eval $(minikube docker-env)

# 3. Construire les images locales
echo ""
echo "🔨 Construction des images Docker locales..."
"$SCRIPT_DIR/build-local-images.sh"

# 4. Déployer les services dans l'ordre
echo ""
echo "📦 Déploiement des services avec Helm..."

# Database
echo ""
echo "--- 1. Déploiement Database ---"
helm upgrade --install database "$HELM_DIR/database" \
  --namespace database \
  --create-namespace \
  --wait \
  --timeout 5m

# Monitoring
echo ""
echo "--- 2. Déploiement Monitoring ---"
helm upgrade --install monitoring "$HELM_DIR/monitoring" \
  --namespace monitoring \
  --create-namespace \
  --wait \
  --timeout 5m

# Nginx Ingress
echo ""
echo "--- 3. Déploiement Nginx Ingress ---"
# Vérifier et débloquer si nécessaire
if helm list -n nginx-ingress | grep -q "nginx-ingress"; then
  STATUS=$(helm status nginx-ingress -n nginx-ingress -o json 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo "")
  if [ "$STATUS" = "pending-install" ] || [ "$STATUS" = "pending-upgrade" ]; then
    echo "⚠️  Release nginx-ingress bloquée. Déblocage..."
    "$SCRIPT_DIR/force-unlock-helm.sh" nginx-ingress nginx-ingress
  fi
fi
helm upgrade --install nginx-ingress "$HELM_DIR/nginx-ingress" \
  --namespace nginx-ingress \
  --create-namespace \
  --wait \
  --timeout 5m

# ELK
echo ""
echo "--- 4. Déploiement ELK Stack ---"
helm upgrade --install elk "$HELM_DIR/elk" \
  --namespace elk \
  --create-namespace \
  --wait \
  --timeout 10m

# Application
echo ""
echo "--- 5. Déploiement Application ---"
# Nettoyer les ressources existantes non gérées par Helm
echo "🧹 Nettoyage des ressources existantes..."

# Fonction pour vérifier et supprimer une ressource
check_and_delete_resource() {
  local kind=$1
  local name=$2
  
  if kubectl get $kind $name -n $NAMESPACE &> /dev/null; then
    MANAGED_BY=$(kubectl get $kind $name -n $NAMESPACE -o jsonpath='{.metadata.labels.app\.kubernetes\.io/managed-by}' 2>/dev/null || echo "none")
    if [ "$MANAGED_BY" != "Helm" ]; then
      echo "   🗑️  Suppression de $kind/$name (non géré par Helm)..."
      kubectl delete $kind $name -n $NAMESPACE
      echo "   ✅ $kind/$name supprimé"
      return 0
    else
      echo "   ✅ $kind/$name déjà géré par Helm"
      return 1
    fi
  else
    echo "   ✅ $kind/$name n'existe pas"
    return 1
  fi
}

# Liste des ressources à vérifier
RESOURCES=(
  "configmap:app-config"
  "secret:telegram-bot-secret"
  "service:auth-service"
  "service:quiz-service"
  "service:game-service"
  "service:frontend"
  "service:telegram-bot"
  "deployment:auth-service"
  "deployment:quiz-service"
  "deployment:game-service"
  "deployment:frontend"
  "deployment:telegram-bot"
)

for resource in "${RESOURCES[@]}"; do
  IFS=':' read -r kind name <<< "$resource"
  check_and_delete_resource "$kind" "$name"
done

echo ""

helm upgrade --install app "$HELM_DIR/app" \
  --namespace intelectgame \
  --create-namespace \
  --wait \
  --timeout 5m

# 5. Afficher le statut
echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "📊 Statut des pods:"
kubectl get pods --all-namespaces

echo ""
echo "💡 Commandes utiles:"
echo "   - Voir les services: kubectl get svc --all-namespaces"
echo "   - Accéder au dashboard: minikube dashboard"
echo "   - Voir les logs: kubectl logs -n <namespace> <pod-name>"
echo "   - Port forward: kubectl port-forward -n <namespace> <pod-name> <local-port>:<pod-port>"

