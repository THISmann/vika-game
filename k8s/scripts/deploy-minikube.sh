#!/bin/bash

# Script pour déployer l'application complète sur Minikube avec toutes les modifications
# Usage: ./k8s/scripts/deploy-minikube.sh

set -e

echo "🚀 Déploiement de l'application IntelectGame sur Minikube..."
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
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
    warn "Minikube n'est pas démarré. Démarrage de Minikube..."
    # Démarrer Minikube avec des options pour éviter les problèmes de réseau
    # Utiliser --image-mirror-country pour utiliser des mirrors régionaux
    # --skip-image-download évite de télécharger les images du registry.k8s.io qui échoue souvent
    minikube start --driver=docker --container-runtime=docker \
        --image-mirror-country=fr \
        --image-repository='registry.aliyuncs.com/google_containers' \
        --kubernetes-version=stable || {
        warn "Première tentative échouée, essai avec des options alternatives..."
        # Essayer sans spécifier de version Kubernetes
        minikube start --driver=docker --container-runtime=docker \
            --image-mirror-country=fr \
            --image-repository='registry.aliyuncs.com/google_containers' || {
            warn "Essai avec registry local..."
            # Dernière tentative : utiliser le registry local ou ignorer les erreurs de registry
            minikube start --driver=docker --container-runtime=docker \
                --skip-image-download \
                --kubernetes-version=stable || {
                error "Impossible de démarrer Minikube"
                warn "Vérifiez votre connexion Internet et les paramètres de proxy"
                exit 1
            }
        }
    }
    info "Minikube démarré"
else
    info "Minikube est déjà démarré"
    # Mettre à jour le contexte même si Minikube est déjà démarré
    minikube update-context || true
fi

# Vérifier la connexion à l'API Kubernetes
info "Vérification de la connexion à Kubernetes..."
if ! kubectl cluster-info &> /dev/null; then
    warn "Problème de connexion à Kubernetes, tentative de réparation..."
    minikube update-context || {
        error "Impossible de se connecter à Kubernetes"
        exit 1
    }
fi
info "Connexion Kubernetes OK"

# Vérifier que kubectl est disponible
if ! command -v kubectl &> /dev/null; then
    error "kubectl n'est pas installé"
    exit 1
fi

# Créer le namespace
info "Création du namespace 'intelectgame'..."
kubectl create namespace intelectgame --dry-run=client -o yaml | kubectl apply -f -
info "Namespace créé"

# Déployer MongoDB en premier
info "Déploiement de MongoDB..."
if [ -f "k8s/mongodb-deployment.yaml" ]; then
  # Utiliser --validate=false pour éviter les problèmes de timeout OpenAPI
  kubectl apply --validate=false -f k8s/mongodb-deployment.yaml || {
    warn "Erreur lors du déploiement de MongoDB, réessai sans validation..."
    kubectl apply --validate=false --force -f k8s/mongodb-deployment.yaml
  }
  echo "⏳ Attente que MongoDB soit prêt..."
  kubectl wait --for=condition=available --timeout=300s deployment/mongodb -n intelectgame || {
    warn "MongoDB prend plus de temps que prévu"
  }
  info "MongoDB déployé"
else
  warn "Fichier mongodb-deployment.yaml non trouvé"
fi
echo ""

# Déployer Redis
info "Déploiement de Redis..."
if [ -f "k8s/redis-deployment.yaml" ]; then
  # Utiliser --validate=false pour éviter les problèmes de timeout OpenAPI
  kubectl apply --validate=false -f k8s/redis-deployment.yaml || {
    warn "Erreur lors du déploiement de Redis, réessai sans validation..."
    kubectl apply --validate=false --force -f k8s/redis-deployment.yaml
  }
  echo "⏳ Attente que Redis soit prêt..."
  kubectl wait --for=condition=available --timeout=120s deployment/redis -n intelectgame || {
    warn "Redis prend plus de temps que prévu"
  }
  info "Redis déployé"
else
  warn "Fichier redis-deployment.yaml non trouvé"
fi
echo ""

# Déployer MinIO
info "Déploiement de MinIO..."
if [ -f "k8s/minio-deployment.yaml" ]; then
  # Utiliser --validate=false pour éviter les problèmes de timeout OpenAPI
  kubectl apply --validate=false -f k8s/minio-deployment.yaml || {
    warn "Erreur lors du déploiement de MinIO, réessai sans validation..."
    kubectl apply --validate=false --force -f k8s/minio-deployment.yaml
  }
  echo "⏳ Attente que MinIO soit prêt..."
  kubectl wait --for=condition=available --timeout=120s deployment/minio -n intelectgame || {
    warn "MinIO prend plus de temps que prévu"
  }
  info "MinIO déployé"
else
  warn "Fichier minio-deployment.yaml non trouvé"
fi
echo ""

# Déployer le ConfigMap
info "Déploiement du ConfigMap..."
if [ -f "k8s/configmap.yaml" ]; then
  kubectl apply --validate=false -f k8s/configmap.yaml || {
    warn "Erreur lors du déploiement du ConfigMap, réessai sans validation..."
    kubectl apply --validate=false --force -f k8s/configmap.yaml
  }
  info "ConfigMap déployé"
else
  warn "Fichier configmap.yaml non trouvé"
fi
echo ""

# Demander le token Telegram si nécessaire
if ! kubectl get secret telegram-bot-secret -n intelectgame &> /dev/null; then
    warn "Configuration du token Telegram Bot..."
    read -p "Entrez votre token Telegram Bot (ou appuyez sur Entrée pour ignorer): " TELEGRAM_TOKEN
    
    if [ -n "$TELEGRAM_TOKEN" ]; then
        kubectl create secret generic telegram-bot-secret \
            --from-literal=TELEGRAM_BOT_TOKEN="$TELEGRAM_TOKEN" \
            -n intelectgame \
            --dry-run=client -o yaml | kubectl apply -f -
        info "Secret Telegram Bot créé"
    else
        warn "Token Telegram non fourni, le bot ne sera pas configuré"
    fi
    echo ""
fi

# Déployer les services backend
info "Déploiement des services backend..."

# Auth Service
if [ -f "k8s/auth-service-deployment.yaml" ]; then
  kubectl apply --validate=false -f k8s/auth-service-deployment.yaml || {
    kubectl apply --validate=false --force -f k8s/auth-service-deployment.yaml
  }
  info "Auth Service déployé"
else
  warn "Fichier auth-service-deployment.yaml non trouvé"
fi

# Quiz Service
if [ -f "k8s/quiz-service-deployment.yaml" ]; then
  kubectl apply --validate=false -f k8s/quiz-service-deployment.yaml || {
    kubectl apply --validate=false --force -f k8s/quiz-service-deployment.yaml
  }
  info "Quiz Service déployé"
else
  warn "Fichier quiz-service-deployment.yaml non trouvé"
fi

# Game Service
if [ -f "k8s/game-service-deployment.yaml" ]; then
  kubectl apply --validate=false -f k8s/game-service-deployment.yaml || {
    kubectl apply --validate=false --force -f k8s/game-service-deployment.yaml
  }
  info "Game Service déployé"
else
  warn "Fichier game-service-deployment.yaml non trouvé"
fi

# API Gateway
if [ -f "k8s/api-gateway-deployment.yaml" ]; then
  kubectl apply --validate=false -f k8s/api-gateway-deployment.yaml || {
    kubectl apply --validate=false --force -f k8s/api-gateway-deployment.yaml
  }
  info "API Gateway déployé"
else
  warn "Fichier api-gateway-deployment.yaml non trouvé"
fi

# Telegram Bot (si le secret existe)
if kubectl get secret telegram-bot-secret -n intelectgame &> /dev/null; then
  if [ -f "k8s/telegram-bot-deployment.yaml" ]; then
    kubectl apply --validate=false -f k8s/telegram-bot-deployment.yaml || {
      kubectl apply --validate=false --force -f k8s/telegram-bot-deployment.yaml
    }
    info "Telegram Bot déployé"
  else
    warn "Fichier telegram-bot-deployment.yaml non trouvé"
  fi
else
  warn "Telegram Bot non déployé (secret manquant)"
fi

echo ""
info "Attente que les services backend soient prêts..."
sleep 10

# Déployer les frontends
info "Déploiement des frontends..."

# Frontend (User)
if [ -f "k8s/frontend-deployment.yaml" ]; then
  kubectl apply --validate=false -f k8s/frontend-deployment.yaml || {
    kubectl apply --validate=false --force -f k8s/frontend-deployment.yaml
  }
  info "Frontend (User) déployé"
else
  warn "Fichier frontend-deployment.yaml non trouvé"
fi

# Admin Frontend (si existe)
if [ -f "k8s/admin-frontend-deployment.yaml" ]; then
  kubectl apply --validate=false -f k8s/admin-frontend-deployment.yaml || {
    kubectl apply --validate=false --force -f k8s/admin-frontend-deployment.yaml
  }
  info "Admin Frontend déployé"
else
  warn "Fichier admin-frontend-deployment.yaml non trouvé (optionnel)"
fi

echo ""

# Déployer le monitoring
info "Déploiement du monitoring..."

# Prometheus
if [ -f "k8s/monitoring/prometheus-deployment.yaml" ]; then
  kubectl apply --validate=false -f k8s/monitoring/prometheus-deployment.yaml || {
    kubectl apply --validate=false --force -f k8s/monitoring/prometheus-deployment.yaml
  }
  info "Prometheus déployé"
else
  warn "Fichier prometheus-deployment.yaml non trouvé"
fi

# cAdvisor
if [ -f "k8s/monitoring/cadvisor-deployment.yaml" ]; then
  kubectl apply --validate=false -f k8s/monitoring/cadvisor-deployment.yaml || {
    kubectl apply --validate=false --force -f k8s/monitoring/cadvisor-deployment.yaml
  }
  info "cAdvisor déployé"
else
  warn "Fichier cadvisor-deployment.yaml non trouvé"
fi

# Node Exporter
if [ -f "k8s/monitoring/node-exporter-deployment.yaml" ]; then
  kubectl apply --validate=false -f k8s/monitoring/node-exporter-deployment.yaml || {
    kubectl apply --validate=false --force -f k8s/monitoring/node-exporter-deployment.yaml
  }
  info "Node Exporter déployé"
else
  warn "Fichier node-exporter-deployment.yaml non trouvé"
fi

# Grafana
if [ -f "k8s/monitoring/grafana-deployment-updated.yaml" ]; then
  kubectl apply --validate=false -f k8s/monitoring/grafana-deployment-updated.yaml || {
    kubectl apply --validate=false --force -f k8s/monitoring/grafana-deployment-updated.yaml
  }
  info "Grafana déployé"
else
  warn "Fichier grafana-deployment-updated.yaml non trouvé"
fi

echo ""

# Attendre que tous les pods soient prêts
info "Attente que tous les pods soient prêts..."
kubectl wait --for=condition=available --timeout=300s deployment/mongodb -n intelectgame || warn "MongoDB prend plus de temps que prévu"
kubectl wait --for=condition=available --timeout=300s deployment/redis -n intelectgame || warn "Redis prend plus de temps que prévu"
kubectl wait --for=condition=available --timeout=300s deployment/minio -n intelectgame || warn "MinIO prend plus de temps que prévu"
kubectl wait --for=condition=available --timeout=300s deployment/auth-service -n intelectgame || warn "Auth Service prend plus de temps que prévu"
kubectl wait --for=condition=available --timeout=300s deployment/quiz-service -n intelectgame || warn "Quiz Service prend plus de temps que prévu"
kubectl wait --for=condition=available --timeout=300s deployment/game-service -n intelectgame || warn "Game Service prend plus de temps que prévu"
kubectl wait --for=condition=available --timeout=300s deployment/api-gateway -n intelectgame || warn "API Gateway prend plus de temps que prévu"
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n intelectgame || warn "Frontend prend plus de temps que prévu"
kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n intelectgame || warn "Prometheus prend plus de temps que prévu"
kubectl wait --for=condition=available --timeout=300s deployment/grafana -n intelectgame || warn "Grafana prend plus de temps que prévu"
kubectl wait --for=condition=available --timeout=300s deployment/cadvisor -n intelectgame || warn "cAdvisor prend plus de temps que prévu"
kubectl wait --for=condition=available --timeout=300s deployment/node-exporter -n intelectgame || warn "Node Exporter prend plus de temps que prévu"

echo ""

# Afficher le statut des pods
info "Statut des pods:"
kubectl get pods -n intelectgame

echo ""
info "Déploiement terminé!"
echo ""
echo "Pour accéder aux services:"
echo "  - Frontend (User): kubectl port-forward -n intelectgame svc/frontend 5173:5173"
echo "  - Admin Frontend: kubectl port-forward -n intelectgame svc/admin-frontend 5174:5174"
echo "  - API Gateway: kubectl port-forward -n intelectgame svc/api-gateway 3000:3000"
echo "  - Grafana: kubectl port-forward -n intelectgame svc/grafana 3005:3000"
echo "  - Prometheus: kubectl port-forward -n intelectgame svc/prometheus 9090:9090"
echo "  - MinIO Console: kubectl port-forward -n intelectgame svc/minio-console 9001:9001"
echo ""
echo "Ou utilisez minikube service pour exposer les services:"
echo "  - minikube service frontend -n intelectgame"
echo "  - minikube service api-gateway -n intelectgame"
echo ""

