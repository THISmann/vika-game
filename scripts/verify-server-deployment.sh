#!/bin/bash

# Script de vérification du déploiement sur le serveur en ligne
# Usage: ./scripts/verify-server-deployment.sh

set -e

echo "=========================================="
echo "🔍 Vérification du déploiement serveur"
echo "=========================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour afficher les erreurs
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction pour afficher les avertissements
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Vérifier que nous sommes dans le bon répertoire
if [ ! -f "docker-compose.yml" ]; then
    error "docker-compose.yml non trouvé. Assurez-vous d'être dans le répertoire ~/vika-game"
    exit 1
fi

success "Répertoire correct détecté"

# 2. Vérifier le statut Git
echo ""
echo "📦 Vérification Git..."
if git status &>/dev/null; then
    CURRENT_BRANCH=$(git branch --show-current)
    echo "   Branche actuelle: $CURRENT_BRANCH"
    
    # Vérifier si des modifications locales existent
    if [ -n "$(git status --porcelain)" ]; then
        warning "Des modifications locales non commitées détectées"
        git status --short
    else
        success "Aucune modification locale"
    fi
    
    # Vérifier si à jour avec origin
    git fetch origin &>/dev/null || warning "Impossible de récupérer les dernières modifications"
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")
    
    if [ -n "$REMOTE" ] && [ "$LOCAL" != "$REMOTE" ]; then
        warning "La branche locale n'est pas à jour avec origin"
        echo "   Local:  $LOCAL"
        echo "   Remote: $REMOTE"
        echo ""
        echo "   Pour mettre à jour: git pull origin main"
    else
        success "Branche à jour avec origin"
    fi
else
    error "Ce n'est pas un dépôt Git"
fi

# 3. Vérifier Docker et Docker Compose
echo ""
echo "🐳 Vérification Docker..."
if command -v docker &> /dev/null; then
    success "Docker installé: $(docker --version)"
else
    error "Docker non installé"
    exit 1
fi

if command -v docker-compose &> /dev/null; then
    success "Docker Compose installé: $(docker-compose --version)"
else
    error "Docker Compose non installé"
    exit 1
fi

# 4. Vérifier l'état des conteneurs
echo ""
echo "📊 État des conteneurs..."
docker-compose ps

# Compter les conteneurs
TOTAL=$(docker-compose ps -q | wc -l)
RUNNING=$(docker-compose ps | grep -c "Up" || echo "0")

echo ""
if [ "$RUNNING" -eq "$TOTAL" ] && [ "$TOTAL" -gt 0 ]; then
    success "$RUNNING/$TOTAL conteneurs en cours d'exécution"
else
    warning "$RUNNING/$TOTAL conteneurs en cours d'exécution"
fi

# 5. Vérifier les logs des conteneurs principaux
echo ""
echo "📋 Vérification des logs (dernières 20 lignes)..."
echo ""

# Frontend
echo "--- Frontend ---"
if docker-compose logs --tail=5 frontend 2>&1 | grep -q "error\|Error\|ERROR"; then
    error "Erreurs détectées dans les logs frontend"
    docker-compose logs --tail=10 frontend | grep -i error || true
else
    success "Frontend: Pas d'erreurs récentes"
fi

# API Gateway
echo ""
echo "--- API Gateway ---"
if docker-compose logs --tail=5 api-gateway 2>&1 | grep -q "error\|Error\|ERROR"; then
    error "Erreurs détectées dans les logs api-gateway"
    docker-compose logs --tail=10 api-gateway | grep -i error || true
else
    success "API Gateway: Pas d'erreurs récentes"
fi

# Game Service
echo ""
echo "--- Game Service ---"
if docker-compose logs --tail=5 game 2>&1 | grep -q "error\|Error\|ERROR"; then
    error "Erreurs détectées dans les logs game"
    docker-compose logs --tail=10 game | grep -i error || true
else
    success "Game Service: Pas d'erreurs récentes"
fi

# Traefik
echo ""
echo "--- Traefik ---"
if docker-compose logs --tail=5 traefik 2>&1 | grep -q "error\|Error\|ERROR"; then
    error "Erreurs détectées dans les logs traefik"
    docker-compose logs --tail=10 traefik | grep -i error || true
else
    success "Traefik: Pas d'erreurs récentes"
fi

# Grafana
echo ""
echo "--- Grafana ---"
if docker-compose logs --tail=5 grafana 2>&1 | grep -q "error\|Error\|ERROR"; then
    error "Erreurs détectées dans les logs grafana"
    docker-compose logs --tail=10 grafana | grep -i error || true
else
    success "Grafana: Pas d'erreurs récentes"
fi

# 6. Vérifier les routes Traefik pour Grafana
echo ""
echo "🔗 Vérification des routes Traefik pour Grafana..."

# Obtenir l'IP du serveur
SERVER_IP=$(hostname -I | awk '{print $1}' || echo "82.202.141.248")

# Vérifier /api-gateway-monitoring
echo ""
echo "   Test: http://$SERVER_IP/api-gateway-monitoring"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_IP/api-gateway-monitoring" || echo "000")
if [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "302" ]; then
    success "Route /api-gateway-monitoring: Redirection OK (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "200" ]; then
    success "Route /api-gateway-monitoring: Accessible (HTTP $HTTP_CODE)"
else
    error "Route /api-gateway-monitoring: Échec (HTTP $HTTP_CODE)"
fi

# Vérifier /container-monitoring
echo ""
echo "   Test: http://$SERVER_IP/container-monitoring"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_IP/container-monitoring" || echo "000")
if [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "302" ]; then
    success "Route /container-monitoring: Redirection OK (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "200" ]; then
    success "Route /container-monitoring: Accessible (HTTP $HTTP_CODE)"
else
    error "Route /container-monitoring: Échec (HTTP $HTTP_CODE)"
fi

# 7. Vérifier l'accessibilité de la page d'accueil
echo ""
echo "🌐 Vérification de l'accessibilité web..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_IP/vika-game/" || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    success "Page d'accueil accessible (HTTP $HTTP_CODE)"
else
    error "Page d'accueil inaccessible (HTTP $HTTP_CODE)"
fi

# 8. Vérifier les services critiques
echo ""
echo "🔧 Vérification des services critiques..."

# MongoDB
if docker-compose exec -T mongodb mongosh --quiet --eval "db.runCommand({ ping: 1 }).ok" &>/dev/null; then
    success "MongoDB: Accessible"
else
    error "MongoDB: Inaccessible"
fi

# Redis
if docker-compose exec -T redis redis-cli ping &>/dev/null; then
    success "Redis: Accessible"
else
    error "Redis: Inaccessible"
fi

# API Gateway Health
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/health" || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    success "API Gateway Health: OK (HTTP $HTTP_CODE)"
else
    warning "API Gateway Health: Non accessible (HTTP $HTTP_CODE)"
fi

# 9. Résumé
echo ""
echo "=========================================="
echo "📊 Résumé de la vérification"
echo "=========================================="
echo ""
echo "Pour relancer les services:"
echo "  docker-compose down"
echo "  docker-compose up -d --build"
echo ""
echo "Pour voir les logs en temps réel:"
echo "  docker-compose logs -f [service-name]"
echo ""
echo "Pour vérifier les routes Traefik:"
echo "  http://$SERVER_IP:8080/dashboard/"
echo ""

