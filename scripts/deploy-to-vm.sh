#!/bin/bash

# Script pour déployer le projet sur la VM avec docker-compose
# Usage: ./scripts/deploy-to-vm.sh [ssh-key-path]
# 
# Si vous avez une clé SSH configurée:
#   ./scripts/deploy-to-vm.sh ~/.ssh/id_rsa
#
# Sinon, le script demandera le mot de passe SSH

set -e

VM_HOST="82.202.141.248"
VM_USER="user1"
PROJECT_DIR="gameV2"
SSH_KEY="${1:-}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Construction des options SSH
SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=10"
if [ -n "$SSH_KEY" ] && [ -f "$SSH_KEY" ]; then
    SSH_OPTS="$SSH_OPTS -i $SSH_KEY"
    info "Utilisation de la clé SSH: $SSH_KEY"
fi

step "=== DÉPLOIEMENT SUR LA VM ==="
echo ""

# Test de connexion
step "1. Test de connexion SSH..."
if ssh $SSH_OPTS $VM_USER@$VM_HOST "echo 'Connexion SSH réussie'" > /dev/null 2>&1; then
    info "Connexion SSH réussie"
else
    error "Échec de la connexion SSH"
    error "Vérifiez:"
    error "  - Que la VM est accessible (ping $VM_HOST)"
    error "  - Que l'utilisateur $VM_USER existe"
    error "  - Que vous avez les permissions SSH"
    error "  - Que vous avez fourni la clé SSH si nécessaire"
    exit 1
fi

# Supprimer tous les conteneurs
step "2. Suppression de tous les conteneurs sur la VM..."
ssh $SSH_OPTS $VM_USER@$VM_HOST << 'ENDSSH'
set -e

echo "📁 Répertoire actuel: $(pwd)"

# Arrêter tous les conteneurs
echo "🛑 Arrêt des conteneurs..."
docker stop $(docker ps -aq) 2>/dev/null || echo "  Aucun conteneur à arrêter"

# Supprimer tous les conteneurs
echo "🗑️  Suppression des conteneurs..."
docker rm $(docker ps -aq) 2>/dev/null || echo "  Aucun conteneur à supprimer"

# Nettoyage optionnel (volumes orphelins)
echo "🧹 Nettoyage des volumes orphelins..."
docker volume prune -f 2>/dev/null || true

echo "✅ Tous les conteneurs supprimés"
ENDSSH

info "Conteneurs supprimés"

# Vérifier si docker-compose.yml existe localement
step "3. Vérification du fichier docker-compose.yml..."
if [ ! -f "docker-compose.yml" ]; then
    error "Fichier docker-compose.yml non trouvé dans le répertoire actuel"
    error "Assurez-vous d'exécuter ce script depuis la racine du projet"
    exit 1
fi
info "docker-compose.yml trouvé"

# Copier les fichiers nécessaires sur la VM
step "4. Copie des fichiers du projet sur la VM..."
ssh $SSH_OPTS $VM_USER@$VM_HOST "mkdir -p ~/$PROJECT_DIR" || true

# Créer un tar avec les fichiers essentiels
step "5. Création de l'archive du projet..."
tar -czf /tmp/project-deploy.tar.gz \
    docker-compose.yml \
    .env \
    node/ \
    vue/ \
    k8s/ \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='build' 2>/dev/null || tar -czf /tmp/project-deploy.tar.gz docker-compose.yml 2>/dev/null

info "Archive créée: /tmp/project-deploy.tar.gz"

# Copier l'archive sur la VM
step "6. Copie de l'archive sur la VM..."
scp $SSH_OPTS /tmp/project-deploy.tar.gz $VM_USER@$VM_HOST:~/$PROJECT_DIR/ 2>/dev/null || {
    warn "Échec de la copie via scp, tentative alternative..."
    ssh $SSH_OPTS $VM_USER@$VM_HOST "cat > ~/$PROJECT_DIR/project-deploy.tar.gz" < /tmp/project-deploy.tar.gz
}

info "Archive copiée sur la VM"

# Extraire et déployer sur la VM
step "7. Extraction et déploiement sur la VM..."
ssh $SSH_OPTS $VM_USER@$VM_HOST << ENDSSH
set -e

cd ~/$PROJECT_DIR || mkdir -p ~/$PROJECT_DIR && cd ~/$PROJECT_DIR

# Extraire l'archive
echo "📦 Extraction de l'archive..."
tar -xzf project-deploy.tar.gz 2>/dev/null || {
    echo "⚠️  Archive non trouvée, utilisation des fichiers existants"
}

# Vérifier que docker-compose est installé
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ docker-compose non trouvé"
    echo "Installation de docker-compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Vérifier que docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker non trouvé"
    echo "Veuillez installer Docker sur la VM"
    exit 1
fi

# Déployer avec docker-compose
echo "🚀 Déploiement avec docker-compose..."
if command -v docker-compose &> /dev/null; then
    docker-compose down 2>/dev/null || true
    docker-compose up -d --build
elif docker compose version &> /dev/null; then
    docker compose down 2>/dev/null || true
    docker compose up -d --build
else
    echo "❌ docker-compose non disponible"
    exit 1
fi

echo "✅ Déploiement terminé"

# Afficher les conteneurs en cours d'exécution
echo ""
echo "📋 Conteneurs en cours d'exécution:"
docker ps

ENDSSH

info "Déploiement terminé sur la VM"

# Nettoyer l'archive locale
rm -f /tmp/project-deploy.tar.gz

echo ""
info "=== ✅ DÉPLOIEMENT RÉUSSI ==="
echo ""
echo "🌐 VM: $VM_USER@$VM_HOST"
echo "📁 Répertoire: ~/$PROJECT_DIR"
echo ""
echo "📋 Commandes utiles:"
echo "   ssh $VM_USER@$VM_HOST 'cd ~/$PROJECT_DIR && docker-compose ps'"
echo "   ssh $VM_USER@$VM_HOST 'cd ~/$PROJECT_DIR && docker-compose logs -f'"
echo "   ssh $VM_USER@$VM_HOST 'cd ~/$PROJECT_DIR && docker-compose down'"

