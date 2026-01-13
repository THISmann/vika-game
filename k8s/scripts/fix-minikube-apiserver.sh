#!/bin/bash

# Script pour corriger le problème d'apiserver Minikube qui ne démarre pas
# Ce problème est souvent causé par l'impossibilité de télécharger des images depuis registry.k8s.io
# Usage: ./k8s/scripts/fix-minikube-apiserver.sh

set -e

echo "🔧 Correction du problème d'apiserver Minikube..."
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Vérifier si l'apiserver est en cours d'exécution
check_apiserver() {
    kubectl cluster-info &> /dev/null 2>&1
}

if check_apiserver; then
    info "L'API Kubernetes fonctionne correctement, aucune correction nécessaire"
    minikube status
    exit 0
fi

warn "L'API Kubernetes ne répond pas. Correction en cours..."

# Vérifier le statut de Minikube
if minikube status &> /dev/null; then
    STATUS=$(minikube status 2>/dev/null | grep -i apiserver || echo "")
    if echo "$STATUS" | grep -q "Running"; then
        info "L'apiserver semble démarré, attente de la disponibilité..."
        for i in {1..30}; do
            if check_apiserver; then
                info "✅ L'API Kubernetes est maintenant disponible"
                minikube status
                exit 0
            fi
            sleep 2
        done
    fi
fi

warn "L'apiserver ne démarre pas. Redémarrage de Minikube avec --skip-image-download..."

# Arrêter Minikube
info "Arrêt de Minikube..."
minikube stop 2>/dev/null || true

# Démarrer Minikube sans télécharger les images (utilise le cache)
info "Redémarrage de Minikube sans télécharger les images (utilise le cache)..."
minikube start --driver=docker --skip-image-download 2>&1 | grep -v "Failing to connect to https://registry.k8s.io/" || {
    warn "Le redémarrage a généré des warnings mais continue..."
}

# Attendre que l'apiserver démarre
info "Attente que l'API Kubernetes soit prête..."
for i in {1..60}; do
    if check_apiserver; then
        info "✅ L'API Kubernetes est maintenant disponible"
        echo ""
        info "Statut de Minikube:"
        minikube status
        echo ""
        info "✅ Correction réussie! Vous pouvez maintenant déployer l'application"
        exit 0
    fi
    if [ $((i % 10)) -eq 0 ]; then
        warn "Attente... ($i/60 secondes)"
    fi
    sleep 1
done

# Si ça ne fonctionne toujours pas, supprimer et recréer
error "L'apiserver ne démarre toujours pas. Suppression et recréation de Minikube..."

warn "⚠️  Cette opération va supprimer le cluster Minikube actuel"
read -p "Voulez-vous continuer? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    warn "Opération annulée"
    exit 1
fi

info "Suppression du cluster Minikube..."
minikube delete || true

info "Création d'un nouveau cluster Minikube..."
minikube start --driver=docker --skip-image-download --kubernetes-version=stable 2>&1 | grep -v "Failing to connect to https://registry.k8s.io/" || true

# Attendre que l'apiserver démarre
info "Attente que l'API Kubernetes soit prête..."
for i in {1..60}; do
    if check_apiserver; then
        info "✅ L'API Kubernetes est maintenant disponible"
        echo ""
        info "Statut de Minikube:"
        minikube status
        echo ""
        info "✅ Minikube est maintenant prêt pour le déploiement"
        exit 0
    fi
    if [ $((i % 10)) -eq 0 ]; then
        warn "Attente... ($i/60 secondes)"
    fi
    sleep 1
done

error "❌ Impossible de démarrer l'API Kubernetes après toutes les tentatives"
warn "Solutions alternatives:"
warn "  1. Vérifiez votre connexion Internet"
warn "  2. Configurez un proxy si nécessaire"
warn "  3. Utilisez Docker Desktop avec Kubernetes"
warn "  4. Essayez de redémarrer Docker: systemctl restart docker (Linux) ou redémarrer Docker Desktop (Mac/Windows)"

exit 1

