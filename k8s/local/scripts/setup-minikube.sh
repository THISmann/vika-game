#!/bin/bash

# Script pour configurer Minikube pour le déploiement local

set -e

echo "🚀 Configuration de Minikube pour le déploiement local..."
echo ""

# 1. Vérifier que Minikube est installé
if ! command -v minikube &> /dev/null; then
  echo "❌ Minikube n'est pas installé. Installez-le d'abord."
  exit 1
fi

# 2. Démarrer Minikube si ce n'est pas déjà fait
if ! minikube status &> /dev/null; then
  echo "📦 Démarrage de Minikube..."
  minikube start --driver=docker --memory=4096 --cpus=4
else
  echo "✅ Minikube est déjà démarré"
fi

# 3. Configurer Docker pour utiliser le daemon de Minikube
echo ""
echo "🐳 Configuration de Docker pour utiliser le daemon Minikube..."
eval $(minikube docker-env)

# 4. Vérifier que Helm est installé
if ! command -v helm &> /dev/null; then
  echo "❌ Helm n'est pas installé. Installation..."
  curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi

# 5. Ajouter les repos Helm nécessaires
echo ""
echo "📦 Ajout des repos Helm..."
helm repo add bitnami https://charts.bitnami.com/bitnami || true
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx || true
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts || true
helm repo add grafana https://grafana.github.io/helm-charts || true
helm repo update

# 6. Créer les namespaces
echo ""
echo "📁 Création des namespaces..."
kubectl create namespace database --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace nginx-ingress --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace intelectgame --dry-run=client -o yaml | kubectl apply -f -

# 7. Afficher les namespaces créés
echo ""
echo "✅ Namespaces créés:"
kubectl get namespaces | grep -E "(database|monitoring|nginx-ingress|intelectgame)"

echo ""
echo "✅ Configuration Minikube terminée!"
echo ""
echo "💡 Commandes utiles:"
echo "   - Voir les pods: kubectl get pods --all-namespaces"
echo "   - Accéder au dashboard: minikube dashboard"
echo "   - Utiliser Docker local: eval \$(minikube docker-env)"
echo "   - Arrêter Minikube: minikube stop"


