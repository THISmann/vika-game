#!/bin/bash

# Script pour exécuter tous les tests des microservices
# Usage: ./scripts/test-all-services.sh [--coverage] [--watch]

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Options
COVERAGE=false
WATCH=false

# Parse arguments
for arg in "$@"; do
  case $arg in
    --coverage)
      COVERAGE=true
      shift
      ;;
    --watch)
      WATCH=true
      shift
      ;;
    *)
      echo "Unknown option: $arg"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🧪 ========== TESTS DES MICROSERVICES ==========${NC}\n"

# Fonction pour exécuter les tests d'un service
run_service_tests() {
  local service=$1
  local service_path="node/$service"
  
  if [ ! -d "$service_path" ]; then
    echo -e "${YELLOW}⚠️  Service $service non trouvé, ignoré${NC}"
    return 0
  fi

  echo -e "${BLUE}📦 Test du service: $service${NC}"
  cd "$service_path"

  if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}⚠️  package.json non trouvé pour $service${NC}"
    cd - > /dev/null
    return 0
  fi

  # Vérifier si jest est installé
  if ! grep -q "jest" package.json; then
    echo -e "${YELLOW}⚠️  Jest non configuré pour $service${NC}"
    cd - > /dev/null
    return 0
  fi

  # Installer les dépendances si nécessaire
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installation des dépendances pour $service...${NC}"
    npm install --silent
  fi

  # Exécuter les tests
  local test_cmd="npm test"
  if [ "$WATCH" = true ]; then
    test_cmd="npm run test:watch"
  fi

  if [ "$COVERAGE" = true ]; then
    test_cmd="npm test -- --coverage"
  fi

  echo -e "${BLUE}▶️  Exécution: $test_cmd${NC}"
  
  if eval "$test_cmd"; then
    echo -e "${GREEN}✅ Tests de $service réussis${NC}\n"
    cd - > /dev/null
    return 0
  else
    echo -e "${RED}❌ Tests de $service échoués${NC}\n"
    cd - > /dev/null
    return 1
  fi
}

# Fonction pour exécuter les tests du frontend
run_frontend_tests() {
  local frontend_path="vue/front"
  
  if [ ! -d "$frontend_path" ]; then
    echo -e "${YELLOW}⚠️  Frontend non trouvé${NC}"
    return 0
  fi

  echo -e "${BLUE}📦 Test du frontend${NC}"
  cd "$frontend_path"

  if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}⚠️  package.json non trouvé pour le frontend${NC}"
    cd - > /dev/null
    return 0
  fi

  # Installer les dépendances si nécessaire
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installation des dépendances pour le frontend...${NC}"
    npm install --silent
  fi

  # Exécuter les tests
  local test_cmd="npm run test:unit"
  if [ "$WATCH" = true ]; then
    test_cmd="npm run test:unit -- --watch"
  fi

  if [ "$COVERAGE" = true ]; then
    test_cmd="npm run test:unit -- --coverage"
  fi

  echo -e "${BLUE}▶️  Exécution: $test_cmd${NC}"
  
  if eval "$test_cmd"; then
    echo -e "${GREEN}✅ Tests du frontend réussis${NC}\n"
    cd - > /dev/null
    return 0
  else
    echo -e "${RED}❌ Tests du frontend échoués${NC}\n"
    cd - > /dev/null
    return 1
  fi
}

# Compteurs
PASSED=0
FAILED=0

# Exécuter les tests pour chaque service
echo -e "${BLUE}🔍 Recherche des services...${NC}\n"

# Auth Service
if run_service_tests "auth-service"; then
  ((PASSED++))
else
  ((FAILED++))
fi

# Quiz Service
if run_service_tests "quiz-service"; then
  ((PASSED++))
else
  ((FAILED++))
fi

# Game Service
if run_service_tests "game-service"; then
  ((PASSED++))
else
  ((FAILED++))
fi

# Frontend
if run_frontend_tests; then
  ((PASSED++))
else
  ((FAILED++))
fi

# Résumé
echo -e "${BLUE}📊 ========== RÉSUMÉ ==========${NC}"
echo -e "${GREEN}✅ Réussis: $PASSED${NC}"
echo -e "${RED}❌ Échoués: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
  echo -e "\n${GREEN}🎉 Tous les tests sont passés !${NC}"
  exit 0
else
  echo -e "\n${RED}💥 Certains tests ont échoué${NC}"
  exit 1
fi

