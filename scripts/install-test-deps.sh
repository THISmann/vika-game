#!/bin/bash

# Script pour installer toutes les dépendances de test
# Usage: ./scripts/install-test-deps.sh

set -e

echo "📦 Installation des dépendances de test..."

# Installer à la racine
echo "📦 Installation à la racine..."
npm install

# Installer pour chaque service
services=("auth-service" "quiz-service" "game-service")

for service in "${services[@]}"; do
  if [ -d "node/$service" ]; then
    echo "📦 Installation pour $service..."
    cd "node/$service"
    
    # Vérifier si package.json existe
    if [ -f "package.json" ]; then
      # Installer les dépendances de dev si nécessaire
      if ! grep -q "jest" package.json && ! grep -q "supertest" package.json; then
        echo "  ➕ Ajout de jest et supertest..."
        npm install --save-dev jest supertest
      else
        npm install
      fi
    fi
    
    cd - > /dev/null
  fi
done

echo "✅ Installation terminée !"
echo ""
echo "Vous pouvez maintenant exécuter :"
echo "  npm run test:all          # Tous les tests"
echo "  npm run test:all:coverage  # Avec couverture"

