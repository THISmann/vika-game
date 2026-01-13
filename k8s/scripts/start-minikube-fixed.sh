#!/bin/bash

# Script pour démarrer Minikube en ignorant le warning sur registry.k8s.io
# Ce warning est non-bloquant et peut être ignoré en toute sécurité
# Usage: ./k8s/scripts/start-minikube-fixed.sh

set -e

echo "🚀 Démarrage de Minikube (en ignorant le warning registry.k8s.io)..."
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

# Fonction pour démarrer Minikube en ignorant les warnings non-bloquants
start_minikube_ignore_warnings() {
    warn "Démarrage de Minikube (le warning sur registry.k8s.io peut apparaître mais n'est pas bloquant)..."
    
    # Capturer la sortie mais ignorer le code de sortie si c'est juste le warning
    local output=$(mktemp)
    local exit_code=0
    
    # Démarrer Minikube et capturer la sortie
    minikube start --driver=docker --container-runtime=docker \
        --image-mirror-country=fr \
        --image-repository='registry.aliyuncs.com/google_containers' \
        --kubernetes-version=stable 2>&1 | tee "$output" || exit_code=$?
    
    # Filtrer les warnings non-critiques de la sortie
    if grep -q "Failing to connect to https://registry.k8s.io/" "$output"; then
        echo ""
        warn "⚠️  Avertissement détecté: Failing to connect to https://registry.k8s.io/"
        info "ℹ️  Ce warning est NON-BLOQUANT et peut être ignoré en toute sécurité"
        info "ℹ️  Minikube fonctionnera normalement malgré ce warning"
        echo ""
    fi
    
    rm -f "$output"
    
    # Vérifier si Minikube a réellement démarré
    sleep 5
    if minikube status &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Démarrer Minikube
if start_minikube_ignore_warnings; then
    # Vérifier que l'apiserver est vraiment prêt
    info "Vérification que l'API Kubernetes est prête..."
    for i in {1..30}; do
        if kubectl cluster-info &> /dev/null 2>&1; then
            echo ""
            info "✅ Minikube a démarré avec succès et l'API Kubernetes est prête!"
            echo ""
            info "Statut de Minikube:"
            minikube status
            echo ""
            info "✅ Vous pouvez maintenant déployer l'application avec:"
            echo "   ./k8s/scripts/deploy-minikube.sh"
            exit 0
        fi
        sleep 1
    done
    
    warn "Minikube a démarré mais l'API Kubernetes prend plus de temps..."
    warn "Lancement du script de correction de l'apiserver..."
    if [ -f "k8s/scripts/fix-minikube-apiserver.sh" ]; then
        bash k8s/scripts/fix-minikube-apiserver.sh
    else
        warn "Script de correction non trouvé. Essayez manuellement:"
        warn "  minikube stop"
        warn "  minikube start --driver=docker --skip-image-download"
        exit 1
    fi
else
    warn "Le démarrage a pris plus de temps que prévu..."
    
    # Vérifier une dernière fois
    sleep 5
    if kubectl cluster-info &> /dev/null 2>&1; then
        info "✅ Minikube a finalement démarré et l'API Kubernetes est prête!"
        minikube status
        exit 0
    else
        error "❌ Minikube n'a pas démarré correctement ou l'apiserver ne répond pas"
        echo ""
        warn "Utilisez le script de correction:"
        echo "  ./k8s/scripts/fix-minikube-apiserver.sh"
        echo ""
        warn "Ou redémarrez manuellement avec:"
        echo "  minikube stop"
        echo "  minikube start --driver=docker --skip-image-download"
        exit 1
    fi
fi

