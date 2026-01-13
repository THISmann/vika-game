#!/bin/bash

# Script pour configurer Traefik sur la VM
# Usage: ./scripts/configure-traefik-vm.sh

set -e

VM_HOST="82.202.141.248"
VM_USER="user1"

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

SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=10"

step "=== CONFIGURATION TRAEFIK SUR LA VM ==="
echo ""

# 1. Arrêter les pods Minikube
step "1. Arrêt des pods Minikube..."
ssh $SSH_OPTS $VM_USER@$VM_HOST << 'ENDSSH'
set -e

echo "=== Arrêt des pods Minikube ==="
kubectl delete namespace intelectgame 2>/dev/null && echo "✅ Namespace intelectgame supprimé" || echo "⚠️  Namespace intelectgame non trouvé ou déjà supprimé"

echo ""
echo "=== Vérification après suppression ==="
kubectl get pods -A 2>/dev/null | grep -i 'intellect\|intelect' || echo "✅ Aucun pod intellect trouvé"
ENDSSH

info "Pods Minikube arrêtés"

# 2. Configurer Traefik dans docker-compose.yml
step "2. Configuration de Traefik dans docker-compose.yml..."
ssh $SSH_OPTS $VM_USER@$VM_HOST << 'ENDSSH'
set -e

cd ~

echo "=== Configuration Traefik ==="

# Sauvegarder le docker-compose.yml original
cp docker-compose.yml docker-compose.yml.backup

# Ajouter Traefik au docker-compose.yml si pas déjà présent
if ! grep -q "traefik:" docker-compose.yml; then
    echo "📝 Ajout de Traefik au docker-compose.yml..."
    
    # Créer un fichier temporaire avec Traefik
    cat >> docker-compose.yml << 'TRAEFIK_EOF'

  # Traefik Reverse Proxy
  traefik:
    image: traefik:v3.0
    container_name: intelectgame-traefik
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - app-network
TRAEFIK_EOF
    echo "✅ Traefik ajouté au docker-compose.yml"
else
    echo "✅ Traefik déjà présent dans docker-compose.yml"
fi

# Ajouter les labels Traefik à api-gateway
echo "📝 Configuration des labels Traefik pour api-gateway..."
if grep -q "api-gateway:" docker-compose.yml && ! grep -q "traefik.enable=true" docker-compose.yml; then
    # Ajouter les labels après la section ports de api-gateway
    sed -i '/api-gateway:/,/networks:/ {
        /ports:/a\
    labels:\
      - "traefik.enable=true"\
      - "traefik.http.routers.api-gateway.rule=PathPrefix(\`/vika-game\`) || PathPrefix(\`/\`)"\
      - "traefik.http.routers.api-gateway.entrypoints=web"\
      - "traefik.http.services.api-gateway.loadbalancer.server.port=3000"\
      - "traefik.http.middlewares.strip-prefix.stripprefix.prefixes=/vika-game"\
      - "traefik.http.routers.api-gateway.middlewares=strip-prefix"
    }' docker-compose.yml || echo "⚠️  Impossible d'ajouter les labels automatiquement"
fi

echo "✅ Configuration Traefik terminée"
ENDSSH

info "Traefik configuré dans docker-compose.yml"

# 3. Redémarrer les services
step "3. Redémarrage des services avec Traefik..."
ssh $SSH_OPTS $VM_USER@$VM_HOST << 'ENDSSH'
set -e

cd ~

echo "=== Redémarrage des services ==="
docker-compose down 2>/dev/null || true
docker-compose up -d

echo ""
echo "✅ Services redémarrés"
echo ""
echo "📋 Conteneurs en cours d'exécution:"
docker ps | grep -E "traefik|api-gateway"

echo ""
echo "📊 Status docker-compose:"
docker-compose ps | head -15
ENDSSH

info "Services redémarrés avec Traefik"

echo ""
info "=== ✅ CONFIGURATION TRAEFIK TERMINÉE ==="
echo ""
echo "🌐 ACCÈS:"
echo "   Jeu: http://$VM_HOST/vika-game"
echo "   Dashboard Traefik: http://$VM_HOST:8080"
echo ""
echo "📋 Commandes utiles:"
echo "   ssh $VM_USER@$VM_HOST 'cd ~ && docker-compose logs -f traefik'"
echo "   ssh $VM_USER@$VM_HOST 'cd ~ && docker-compose ps'"

