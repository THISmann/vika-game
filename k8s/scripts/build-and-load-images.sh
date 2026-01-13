#!/bin/bash

# Script pour construire les images Docker localement et les charger dans Minikube
# Usage: ./k8s/scripts/build-and-load-images.sh

set -e

echo "🔨 Construction et chargement des images Docker dans Minikube..."
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

step() {
    echo -e "${BLUE}📦 $1${NC}"
}

# Vérifier que Minikube est démarré
if ! minikube status &> /dev/null; then
    error "Minikube n'est pas démarré. Démarrez Minikube d'abord."
    exit 1
fi

# Configurer Docker pour utiliser le Docker de Minikube
step "Configuration de Docker pour utiliser Minikube..."
eval $(minikube -p minikube docker-env)

# Vérifier l'architecture
ARCH=$(uname -m)
info "Architecture détectée: $ARCH"

if [ "$ARCH" = "arm64" ]; then
    warn "Architecture ARM64 détectée (Mac M1/M2)"
    warn "Les images seront construites pour linux/amd64 avec émulation..."
    PLATFORM="linux/amd64"
    
    # Vérifier si buildx est disponible
    if ! docker buildx version &> /dev/null; then
        warn "Docker buildx non disponible, utilisation de docker build standard"
        USE_BUILDX=false
    else
        USE_BUILDX=true
        # Créer un builder multi-arch si nécessaire
        if ! docker buildx ls | grep -q "minikube-builder"; then
            info "Création d'un builder buildx pour Minikube..."
            docker buildx create --name minikube-builder --use --driver docker-container --bootstrap || {
                warn "Impossible de créer le builder buildx, utilisation de docker build standard"
                USE_BUILDX=false
            }
        fi
    fi
else
    PLATFORM="linux/amd64"
    USE_BUILDX=false
fi

info "Utilisation de la plateforme: $PLATFORM"
echo ""

# Fonction pour construire et charger une image
build_and_load() {
    local service=$1
    local dockerfile=$2
    local context=$3
    local image_name="gamev2-$service:local"
    
    step "Construction de l'image $service..."
    echo "   Dockerfile: $dockerfile"
    echo "   Context: $context"
    echo "   Image: $image_name"
    
    # Construire l'image avec la plateforme appropriée
    if [ "$ARCH" = "arm64" ] && [ "$USE_BUILDX" = true ]; then
        # Utiliser buildx pour construire pour amd64 sur arm64
        if DOCKER_BUILDKIT=1 docker buildx build \
            --platform $PLATFORM \
            --load \
            -f "$dockerfile" \
            -t "$image_name" \
            "$context" 2>&1 | tee /tmp/build-${service}.log; then
            info "✅ Image $service construite avec buildx"
            return 0
        else
            warn "Échec avec buildx, essai avec docker build standard..."
            USE_BUILDX=false
        fi
    fi
    
    # Construction standard
    if docker build \
        --platform $PLATFORM \
        -f "$dockerfile" \
        -t "$image_name" \
        "$context" 2>&1 | tee /tmp/build-${service}.log; then
        info "✅ Image $service construite"
        return 0
    else
        error "❌ Impossible de construire l'image $service"
        echo "Dernières lignes du log de build:"
        tail -20 /tmp/build-${service}.log || true
        return 1
    fi
}

# Construire les images une par une
info "Début de la construction des images..."
echo ""

# Auth Service
step "1/6 - Auth Service..."
if build_and_load "auth-service" "node/auth-service/Dockerfile" "node"; then
    info "✅ Auth Service construit avec succès"
else
    error "❌ Échec de la construction d'Auth Service"
    exit 1
fi
echo ""

# Quiz Service
step "2/6 - Quiz Service..."
if build_and_load "quiz-service" "node/quiz-service/Dockerfile" "node"; then
    info "✅ Quiz Service construit avec succès"
else
    error "❌ Échec de la construction de Quiz Service"
    exit 1
fi
echo ""

# Game Service
step "3/6 - Game Service..."
if build_and_load "game-service" "node/game-service/Dockerfile" "node"; then
    info "✅ Game Service construit avec succès"
else
    error "❌ Échec de la construction de Game Service"
    exit 1
fi
echo ""

# API Gateway
step "4/6 - API Gateway..."
if build_and_load "api-gateway" "node/api-gateway/Dockerfile" "node"; then
    info "✅ API Gateway construit avec succès"
else
    error "❌ Échec de la construction d'API Gateway"
    exit 1
fi
echo ""

# Telegram Bot
step "5/6 - Telegram Bot..."
if build_and_load "telegram-bot" "node/telegram-bot/Dockerfile" "node/telegram-bot"; then
    info "✅ Telegram Bot construit avec succès"
else
    warn "⚠️  Échec de la construction de Telegram Bot (optionnel)"
fi
echo ""

# Frontend
step "6/6 - Frontend..."
if build_and_load "frontend" "vue/Dockerfile" "vue"; then
    info "✅ Frontend construit avec succès"
else
    error "❌ Échec de la construction de Frontend"
    exit 1
fi
echo ""

# Nettoyer les logs temporaires
rm -f /tmp/build-*.log

# Mettre à jour les déploiements pour utiliser les images locales
step "Mise à jour des déploiements pour utiliser les images locales..."

# Mettre à jour chaque déploiement
kubectl set image deployment/auth-service auth-service=gamev2-auth-service:local -n intelectgame --record || warn "Impossible de mettre à jour auth-service"
kubectl set image deployment/quiz-service quiz-service=gamev2-quiz-service:local -n intelectgame --record || warn "Impossible de mettre à jour quiz-service"
kubectl set image deployment/game-service game-service=gamev2-game-service:local -n intelectgame --record || warn "Impossible de mettre à jour game-service"
kubectl set image deployment/api-gateway api-gateway=gamev2-api-gateway:local -n intelectgame --record || warn "Impossible de mettre à jour api-gateway"
kubectl set image deployment/telegram-bot telegram-bot=gamev2-telegram-bot:local -n intelectgame --record || warn "Impossible de mettre à jour telegram-bot"
kubectl set image deployment/frontend frontend=gamev2-frontend:local -n intelectgame --record || warn "Impossible de mettre à jour frontend"

info "✅ Images mises à jour dans les déploiements"
echo ""

# Redémarrer les déploiements pour forcer le redémarrage des pods
step "Redémarrage des déploiements..."
kubectl rollout restart deployment/auth-service -n intelectgame || true
kubectl rollout restart deployment/quiz-service -n intelectgame || true
kubectl rollout restart deployment/game-service -n intelectgame || true
kubectl rollout restart deployment/api-gateway -n intelectgame || true
kubectl rollout restart deployment/telegram-bot -n intelectgame || true
kubectl rollout restart deployment/frontend -n intelectgame || true

info "✅ Déploiements redémarrés"
echo ""

info "✅ Construction et chargement terminés!"
echo ""
echo "Les images ont été construites et chargées dans Minikube."
echo "Les déploiements sont en cours de redémarrage."
echo ""
echo "Pour vérifier le statut des pods:"
echo "  kubectl get pods -n intelectgame -w"
echo ""
echo "Pour voir les logs d'un service:"
echo "  kubectl logs -f deployment/auth-service -n intelectgame"
echo ""

