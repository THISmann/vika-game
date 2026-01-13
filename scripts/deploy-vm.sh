#!/bin/bash

# Script de déploiement sur VM avec Traefik
# Usage: ./scripts/deploy-vm.sh

set -e

VM_HOST="82.202.141.248"
VM_USER="user1"
VM_PATH="~/vika-game"
PROJECT_NAME="vika-game"

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

# Vérifier que nous sommes sur la branche main
step "Vérification de la branche Git..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    warn "Vous n'êtes pas sur la branche main (actuellement: $CURRENT_BRANCH)"
    read -p "Continuer quand même? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Déploiement annulé"
        exit 1
    fi
fi

# Push vers GitHub
step "Push des modifications vers GitHub..."
git push origin main || {
    error "Échec du push vers GitHub"
    exit 1
}
info "Modifications poussées vers GitHub"

# Connexion à la VM et déploiement
step "Connexion à la VM et déploiement..."
ssh ${VM_USER}@${VM_HOST} << 'ENDSSH'
set -e

PROJECT_PATH="~/vika-game"
PROJECT_NAME="vika-game"

echo "📦 === DÉPLOIEMENT SUR VM ==="
echo ""

# Aller dans le répertoire du projet ou le créer
if [ ! -d "$PROJECT_PATH" ]; then
    echo "📥 Clonage du repository depuis GitHub..."
    cd ~
    # Essayer d'abord avec SSH, puis HTTPS
    git clone git@github.com:THISmann/vika-game.git vika-game 2>/dev/null || \
    git clone https://github.com/THISmann/vika-game.git vika-game || {
        echo "❌ Échec du clonage du repository"
        exit 1
    }
    echo "✅ Repository cloné"
fi

# Aller dans le répertoire du projet
cd $PROJECT_PATH || {
    echo "❌ Répertoire $PROJECT_PATH introuvable"
    exit 1
}

# Vérifier si c'est un repo git, sinon initialiser
if [ ! -d ".git" ]; then
    echo "📥 Initialisation du repository Git..."
    git init
    git remote add origin https://github.com/THISmann/vika-game.git 2>/dev/null || \
    git remote set-url origin https://github.com/THISmann/vika-game.git
    echo "✅ Repository initialisé"
fi

# Pull des dernières modifications
echo "📥 Pull des dernières modifications depuis GitHub..."
git pull origin main || {
    echo "❌ Échec du pull depuis GitHub"
    exit 1
}
echo "✅ Code mis à jour"

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down || true

# Vérifier que Traefik est en cours d'exécution
echo "🔍 Vérification de Traefik..."
if ! docker ps | grep -q traefik; then
    echo "⚠️  Traefik n'est pas en cours d'exécution"
    echo "📝 Assurez-vous que Traefik est démarré pour gérer le routage"
    echo "   Traefik doit être accessible sur le port 80"
fi

# Démarrer les services
echo "🚀 Démarrage des services..."
docker-compose up -d --build

# Attendre que les services soient prêts
echo "⏳ Attente que les services soient prêts..."
sleep 10

# Vérifier le statut des conteneurs
echo "📊 Statut des conteneurs:"
docker-compose ps

# Vérifier la santé des services
echo ""
echo "🏥 Vérification de la santé des services..."
HEALTHY_SERVICES=0
TOTAL_SERVICES=0

for service in api-gateway auth quiz game frontend; do
    TOTAL_SERVICES=$((TOTAL_SERVICES + 1))
    if docker-compose ps | grep -q "${service}.*Up"; then
        echo "✅ $service: En cours d'exécution"
        HEALTHY_SERVICES=$((HEALTHY_SERVICES + 1))
    else
        echo "❌ $service: Non démarré"
    fi
done

echo ""
if [ $HEALTHY_SERVICES -eq $TOTAL_SERVICES ]; then
    echo "✅ Tous les services sont en cours d'exécution"
else
    echo "⚠️  Certains services ne sont pas démarrés ($HEALTHY_SERVICES/$TOTAL_SERVICES)"
fi

# Afficher les logs récents
echo ""
echo "📋 Logs récents (dernières 20 lignes):"
docker-compose logs --tail=20

echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "🌐 Application accessible sur:"
echo "   http://82.202.141.248/vika-game"
echo ""
echo "📊 Pour voir les logs en temps réel:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Pour arrêter les services:"
echo "   docker-compose down"

ENDSSH

if [ $? -eq 0 ]; then
    info "Déploiement réussi!"
    echo ""
    info "Application accessible sur: http://82.202.141.248/vika-game"
    echo ""
    step "Vérification de l'accessibilité..."
    sleep 5
    
    # Test de connexion
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://82.202.141.248/vika-game || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
        info "✅ Application accessible (HTTP $HTTP_CODE)"
    else
        warn "⚠️  Application peut ne pas être accessible (HTTP $HTTP_CODE)"
        warn "Vérifiez les logs sur la VM: ssh ${VM_USER}@${VM_HOST} 'cd ~/gameV2 && docker-compose logs'"
    fi
else
    error "Échec du déploiement"
    exit 1
fi

