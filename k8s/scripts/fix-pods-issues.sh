#!/bin/bash

# Script pour corriger les problèmes des pods Kubernetes
# Usage: ./k8s/scripts/fix-pods-issues.sh

set -e

echo "🔧 Correction des problèmes de déploiement Kubernetes..."
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

info() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier que Minikube est démarré
if ! minikube status &> /dev/null; then
    warn "Minikube n'est pas démarré. Tentative de démarrage..."
    # Essayer de démarrer Minikube avec les meilleures options
    if command -v minikube &> /dev/null; then
        minikube start --driver=docker --container-runtime=docker \
            --image-mirror-country=fr \
            --image-repository='registry.aliyuncs.com/google_containers' \
            --kubernetes-version=stable || {
            warn "Échec du démarrage automatique. Veuillez démarrer Minikube manuellement avec:"
            echo "  ./k8s/scripts/start-minikube.sh"
            exit 1
        }
        info "Minikube démarré avec succès"
    else
        error "Minikube n'est pas installé ou n'est pas dans le PATH"
        exit 1
    fi
fi

# Vérifier le storage class pour Minikube
info "Vérification du storage class hostpath..."
if ! kubectl get storageclass hostpath &> /dev/null; then
    warn "Le storage class hostpath n'existe pas. Création..."
    cat <<EOF | kubectl apply -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: hostpath
provisioner: k8s.io/minikube-hostpath
volumeBindingMode: Immediate
EOF
    info "Storage class hostpath créé"
else
    info "Storage class hostpath existe déjà"
fi

echo ""

# Supprimer les anciens pods qui échouent
info "Suppression des anciens pods qui échouent..."
kubectl delete pods --field-selector=status.phase!=Running -n intelectgame --ignore-not-found=true || true
sleep 5

# Supprimer les anciens déploiements pour forcer la recréation
info "Suppression des anciens déploiements..."
kubectl delete deployment -n intelectgame --all --ignore-not-found=true || true
kubectl delete pvc -n intelectgame --all --ignore-not-found=true || true
sleep 5

echo ""

# Redéployer dans le bon ordre
info "Redéploiement des services dans le bon ordre..."

# 1. Dépendances de base
info "1. Déploiement de MongoDB..."
kubectl apply --validate=false -f k8s/mongodb-deployment.yaml

info "2. Déploiement de Redis..."
kubectl apply --validate=false -f k8s/redis-deployment.yaml

info "3. Déploiement de MinIO..."
kubectl apply --validate=false -f k8s/minio-deployment.yaml

# Attendre que les dépendances de base soient prêtes
echo ""
info "Attente que MongoDB, Redis et MinIO soient prêts..."
kubectl wait --for=condition=available --timeout=300s deployment/mongodb -n intelectgame || warn "MongoDB prend plus de temps que prévu"
kubectl wait --for=condition=available --timeout=180s deployment/redis -n intelectgame || warn "Redis prend plus de temps que prévu"
kubectl wait --for=condition=available --timeout=180s deployment/minio -n intelectgame || warn "MinIO prend plus de temps que prévu"

echo ""

# 2. Services backend
info "4. Déploiement de Auth Service..."
kubectl apply --validate=false -f k8s/auth-service-deployment.yaml

info "5. Déploiement de Quiz Service..."
kubectl apply --validate=false -f k8s/quiz-service-deployment.yaml

info "6. Déploiement de Game Service..."
kubectl apply --validate=false -f k8s/game-service-deployment.yaml

# Attendre un peu que les services backend démarrent
sleep 10

info "7. Déploiement de API Gateway..."
kubectl apply --validate=false -f k8s/api-gateway-deployment.yaml

info "8. Déploiement de Telegram Bot..."
kubectl apply --validate=false -f k8s/telegram-bot-deployment.yaml

info "9. Déploiement de Frontend..."
kubectl apply --validate=false -f k8s/frontend-deployment.yaml

echo ""
info "Attente que tous les services soient prêts..."
sleep 15

# Afficher le statut
echo ""
info "Statut des pods après correction:"
kubectl get pods -n intelectgame

echo ""
info "Vérification des événements récents:"
kubectl get events -n intelectgame --sort-by='.lastTimestamp' | tail -20

echo ""
info "✅ Correction terminée!"
echo ""
echo "Pour vérifier les logs d'un pod :"
echo "  kubectl logs <pod-name> -n intelectgame"
echo ""
echo "Pour décrire un pod :"
echo "  kubectl describe pod <pod-name> -n intelectgame"

