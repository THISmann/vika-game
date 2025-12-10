#!/bin/bash

# Script pour démarrer tous les services backend
# Usage: ./scripts/start-all-services.sh

set -e

echo "🚀 Démarrage de tous les services backend..."
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour démarrer un service
start_service() {
  local service=$1
  local port=$2
  local service_path="node/$service"
  
  if [ ! -d "$service_path" ]; then
    echo "⚠️  Service $service non trouvé, ignoré"
    return 0
  fi

  echo -e "${BLUE}📦 Démarrage de $service (port $port)...${NC}"
  cd "$service_path"

  if [ ! -f "package.json" ]; then
    echo "⚠️  package.json non trouvé pour $service"
    cd - > /dev/null
    return 0
  fi

  # Installer les dépendances si nécessaire
  if [ ! -d "node_modules" ]; then
    echo "📥 Installation des dépendances pour $service..."
    npm install --silent
  fi

  # Démarrer le service en arrière-plan
  npm start > "/tmp/${service}.log" 2>&1 &
  local pid=$!
  echo -e "${GREEN}✅ $service démarré (PID: $pid)${NC}"
  echo "   Logs: /tmp/${service}.log"
  echo "   URL: http://localhost:$port"
  echo ""
  
  cd - > /dev/null
}

# Démarrer les services
start_service "auth-service" "3001"
sleep 2

start_service "quiz-service" "3002"
sleep 2

start_service "game-service" "3003"
sleep 2

echo -e "${GREEN}🎉 Tous les services sont démarrés !${NC}"
echo ""
echo "Services disponibles :"
echo "  - Auth Service: http://localhost:3001"
echo "  - Quiz Service: http://localhost:3002"
echo "  - Game Service: http://localhost:3003"
echo ""
echo "Pour arrêter les services, utilisez :"
echo "  pkill -f 'node.*server.js'"
echo ""
echo "Ou arrêtez-les individuellement :"
echo "  kill <PID>"

