#!/bin/bash

# Script pour démarrer Minikube avec des solutions aux problèmes de réseau
# Usage: ./k8s/scripts/start-minikube.sh

set -e

echo "🚀 Démarrage de Minikube avec configuration réseau optimisée..."
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

# Vérifier si Minikube est déjà démarré
if minikube status &> /dev/null; then
    info "Minikube est déjà démarré"
    minikube status
    exit 0
fi

# Fonction pour essayer de démarrer Minikube avec différentes options
try_start_minikube() {
    local method=$1
    shift
    
    warn "Tentative de démarrage avec: $method"
    
    case $method in
        "aliyun")
            minikube start --driver=docker --container-runtime=docker \
                --image-mirror-country=fr \
                --image-repository='registry.aliyuncs.com/google_containers' \
                --kubernetes-version=stable \
                "$@"
            ;;
        "gcr")
            minikube start --driver=docker --container-runtime=docker \
                --image-mirror-country=us \
                --image-repository='gcr.io/google-containers' \
                --kubernetes-version=stable \
                "$@"
            ;;
        "skip")
            minikube start --driver=docker --container-runtime=docker \
                --skip-image-download \
                --kubernetes-version=stable \
                "$@"
            ;;
        "basic")
            minikube start --driver=docker --container-runtime=docker \
                --kubernetes-version=stable \
                "$@"
            ;;
        *)
            error "Méthode inconnue: $method"
            return 1
            ;;
    esac
}

# Essayer différentes méthodes
info "Tentative 1: Utilisation du registry Aliyun (recommandé pour éviter les problèmes de connexion)..."
if try_start_minikube "aliyun"; then
    info "✅ Minikube démarré avec succès en utilisant le registry Aliyun"
    minikube status
    exit 0
fi

warn "La première tentative a échoué"
echo ""

info "Tentative 2: Utilisation du registry GCR standard..."
if try_start_minikube "gcr"; then
    info "✅ Minikube démarré avec succès en utilisant le registry GCR"
    minikube status
    exit 0
fi

warn "La deuxième tentative a échoué"
echo ""

info "Tentative 3: Démarrage sans téléchargement d'images (skip-image-download)..."
if try_start_minikube "skip"; then
    info "✅ Minikube démarré avec succès (images non téléchargées)"
    warn "Note: Vous devrez peut-être télécharger les images manuellement si nécessaire"
    minikube status
    exit 0
fi

warn "La troisième tentative a échoué"
echo ""

info "Tentative 4: Démarrage basique..."
if try_start_minikube "basic"; then
    info "✅ Minikube démarré avec succès (méthode basique)"
    minikube status
    exit 0
fi

# Si toutes les tentatives échouent
error "❌ Impossible de démarrer Minikube avec toutes les méthodes essayées"
echo ""
warn "Solutions alternatives:"
echo "  1. Vérifiez votre connexion Internet"
echo "  2. Configurez un proxy si nécessaire:"
echo "     export HTTP_PROXY=http://proxy:port"
echo "     export HTTPS_PROXY=http://proxy:port"
echo "     export NO_PROXY=localhost,127.0.0.1,10.96.0.0/12,192.168.99.0/24"
echo ""
echo "  3. Ou utilisez Docker Desktop avec Kubernetes activé"
echo "  4. Ou utilisez un VPN pour contourner les restrictions réseau"
echo ""
echo "  5. Essayez de démarrer Minikube manuellement avec:"
echo "     minikube start --driver=docker --image-repository='registry.aliyuncs.com/google_containers'"
echo ""

exit 1

