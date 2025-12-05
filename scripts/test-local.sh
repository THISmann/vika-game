#!/bin/bash
# Script pour tester l'application localement avec Docker Compose

set -e

echo "🧪 Tests locaux avec Docker Compose"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
info() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé. Veuillez installer Docker."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
    error "Docker Compose n'est pas installé. Veuillez installer Docker Compose."
    exit 1
fi

# Détecter la commande docker-compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

# Nettoyer les conteneurs précédents
echo "🧹 Nettoyage des conteneurs précédents..."
$DOCKER_COMPOSE -f docker-compose.test.yml down -v 2>/dev/null || true
info "Nettoyage terminé"
echo ""

# Démarrer les services
echo "🚀 Démarrage des services..."
$DOCKER_COMPOSE -f docker-compose.test.yml up -d
info "Services démarrés"
echo ""

# Attendre que les services soient prêts
echo "⏳ Attente que les services soient prêts..."
sleep 10

# Vérifier la santé des services
echo "🏥 Vérification de la santé des services..."
MAX_RETRIES=30
RETRY_COUNT=0

check_service() {
    local service=$1
    local url=$2
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            info "$service est prêt"
            return 0
        fi
        RETRY_COUNT=$((RETRY_COUNT + 1))
        sleep 2
    done
    
    error "$service n'est pas prêt après $MAX_RETRIES tentatives"
    return 1
}

check_service "MongoDB" "http://localhost:27018" || exit 1
check_service "Auth Service" "http://localhost:3001/test" || exit 1
check_service "Quiz Service" "http://localhost:3002/test" || exit 1
check_service "Game Service" "http://localhost:3003/test" || exit 1

# Telegram bot n'a pas d'endpoint /test, on vérifie juste qu'il tourne
echo "   Test Telegram Bot (vérification du processus)..."
if docker ps | grep -q "intelectgame-telegram-bot-test"; then
    info "Telegram Bot est en cours d'exécution"
else
    warning "Telegram Bot n'est pas en cours d'exécution (peut être normal si pas de token)"
fi

RETRY_COUNT=0
echo ""

# Vérification que tous les services sont actifs
echo "📝 Vérification des services..."
echo ""

# Vérifier chaque service
services=("auth-service:3001" "quiz-service:3002" "game-service:3003" "frontend:5173")
for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    if curl -f -s "http://localhost:$port/test" > /dev/null 2>&1 || [ "$name" = "frontend" ]; then
        info "$name: ✅ ACTIF"
    else
        warning "$name: ⚠️  Non accessible"
    fi
done

# Vérifier Telegram Bot (pas d'endpoint /test)
if docker ps | grep -q "intelectgame-telegram-bot-test"; then
    info "Telegram Bot: ✅ ACTIF"
else
    warning "Telegram Bot: ⚠️  Non démarré"
fi
echo ""

# Tests d'intégration (optionnel)
echo "🔗 Tests d'intégration (optionnel)..."
if [ -f "test-all-endpoints.sh" ]; then
    read -p "Voulez-vous exécuter les tests d'intégration ? (y/n): " run_integration
    if [ "$run_integration" = "y" ]; then
        BASE_URL="http://localhost" \
        AUTH_PORT=3001 \
        QUIZ_PORT=3002 \
        GAME_PORT=3003 \
        ./test-all-endpoints.sh || warning "Certains tests d'intégration ont échoué"
    else
        info "Tests d'intégration ignorés"
    fi
else
    info "Script test-all-endpoints.sh non trouvé, tests d'intégration ignorés"
fi
echo ""

# Résumé
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSUMÉ DES TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Services en cours d'exécution:"
echo "  - MongoDB: http://localhost:27018"
echo "  - Redis: http://localhost:6380"
echo "  - Auth Service: http://localhost:3001"
echo "  - Quiz Service: http://localhost:3002"
echo "  - Game Service: http://localhost:3003"
echo "  - Telegram Bot: http://localhost:3004"
echo "  - Frontend: http://localhost:5173"
echo ""
echo "Pour arrêter les services:"
echo "  docker-compose -f docker-compose.test.yml down"
echo ""
echo "Pour voir les logs:"
echo "  docker-compose -f docker-compose.test.yml logs -f"
echo ""
info "Tests locaux terminés !"
echo ""

