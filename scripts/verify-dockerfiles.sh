#!/bin/bash

# Script pour vérifier que tous les Dockerfiles sont corrects
# Usage: ./verify-dockerfiles.sh

set -e

echo "🔍 Vérification des Dockerfiles..."
echo ""

ERRORS=0

# Fonction pour vérifier un Dockerfile
check_dockerfile() {
    local file=$1
    local expected_node=$2
    local expected_cmd=$3
    local description=$4
    
    echo "=== Vérification: $file ($description) ==="
    
    if [ ! -f "$file" ]; then
        echo "❌ Fichier non trouvé: $file"
        ((ERRORS++))
        return
    fi
    
    # Vérifier la version de Node.js
    if grep -q "FROM node:$expected_node" "$file"; then
        echo "✅ Version Node.js correcte: $expected_node"
    else
        echo "❌ Version Node.js incorrecte (attendu: $expected_node)"
        echo "   Trouvé: $(grep 'FROM node' "$file")"
        ((ERRORS++))
    fi
    
    # Vérifier la commande npm
    if grep -q "$expected_cmd" "$file"; then
        echo "✅ Commande npm correcte: $expected_cmd"
    else
        echo "❌ Commande npm incorrecte (attendu: $expected_cmd)"
        echo "   Trouvé: $(grep 'RUN npm' "$file")"
        ((ERRORS++))
    fi
    
    # Vérifier qu'on n'utilise pas npm ci dans les commandes RUN
    if grep "^RUN.*npm ci" "$file" > /dev/null; then
        echo "❌ Utilise 'npm ci' dans une commande RUN (devrait utiliser 'npm install')"
        ((ERRORS++))
    else
        echo "✅ N'utilise pas 'npm ci' dans les commandes RUN"
    fi
    
    echo ""
}

# Vérifier les services backend
check_dockerfile "node/auth-service/Dockerfile" "18-alpine" "npm install --production --omit=dev" "Auth Service"
check_dockerfile "node/quiz-service/Dockerfile" "18-alpine" "npm install --production --omit=dev" "Quiz Service"
check_dockerfile "node/game-service/Dockerfile" "18-alpine" "npm install --production --omit=dev" "Game Service"
check_dockerfile "node/telegram-bot/Dockerfile" "18-alpine" "npm install --production --omit=dev" "Telegram Bot"

# Vérifier le frontend
check_dockerfile "vue/Dockerfile" "20-alpine" "npm install" "Frontend"

# Résumé
echo "═══════════════════════════════════════════════════════════"
if [ $ERRORS -eq 0 ]; then
    echo "✅ Tous les Dockerfiles sont corrects!"
    echo ""
    echo "📝 Prochaines étapes:"
    echo "   1. Vérifier que les fichiers sont bien dans Git:"
    echo "      git status node/*/Dockerfile vue/Dockerfile"
    echo ""
    echo "   2. Si des modifications sont nécessaires:"
    echo "      git add node/*/Dockerfile vue/Dockerfile"
    echo "      git commit -m 'fix: Update Dockerfiles'"
    echo "      git push"
    exit 0
else
    echo "❌ $ERRORS erreur(s) trouvée(s)"
    echo ""
    echo "📝 Corrigez les erreurs ci-dessus avant de pousser sur GitHub"
    exit 1
fi

