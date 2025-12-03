#!/bin/bash

# Script pour forcer la mise à jour de tous les fichiers sur GitHub
# Usage: ./force-push-fixes.sh

set -e

echo "🚀 Préparation des fichiers pour GitHub..."
echo ""

# 1. S'assurer que tous les Dockerfiles sont corrects
echo "=== 1. Vérification et correction des Dockerfiles ==="

# Auth Service
if ! grep -q "^RUN npm install --production --omit=dev" node/auth-service/Dockerfile; then
  echo "Correction de node/auth-service/Dockerfile..."
  sed -i.bak 's/^RUN npm ci --only=production/RUN npm install --production --omit=dev/g' node/auth-service/Dockerfile 2>/dev/null || true
  rm -f node/auth-service/Dockerfile.bak
fi

# Quiz Service
if ! grep -q "^RUN npm install --production --omit=dev" node/quiz-service/Dockerfile; then
  echo "Correction de node/quiz-service/Dockerfile..."
  sed -i.bak 's/^RUN npm ci --only=production/RUN npm install --production --omit=dev/g' node/quiz-service/Dockerfile 2>/dev/null || true
  rm -f node/quiz-service/Dockerfile.bak
fi

# Game Service
if ! grep -q "^RUN npm install --production --omit=dev" node/game-service/Dockerfile; then
  echo "Correction de node/game-service/Dockerfile..."
  sed -i.bak 's/^RUN npm ci --only=production/RUN npm install --production --omit=dev/g' node/game-service/Dockerfile 2>/dev/null || true
  rm -f node/game-service/Dockerfile.bak
fi

# Telegram Bot
if ! grep -q "^RUN npm install --production --omit=dev" node/telegram-bot/Dockerfile; then
  echo "Correction de node/telegram-bot/Dockerfile..."
  sed -i.bak 's/^RUN npm ci --only=production/RUN npm install --production --omit=dev/g' node/telegram-bot/Dockerfile 2>/dev/null || true
  rm -f node/telegram-bot/Dockerfile.bak
fi

# Frontend
if ! grep -q "^RUN npm install" vue/Dockerfile || grep -q "^FROM node:18" vue/Dockerfile; then
  echo "Correction de vue/Dockerfile..."
  # S'assurer qu'il utilise node:20
  sed -i.bak 's/^FROM node:18-alpine/FROM node:20-alpine/g' vue/Dockerfile 2>/dev/null || true
  sed -i.bak 's/^RUN npm ci/RUN npm install/g' vue/Dockerfile 2>/dev/null || true
  rm -f vue/Dockerfile.bak
fi

echo "✅ Tous les Dockerfiles vérifiés"
echo ""

# 2. Ajouter tous les fichiers nécessaires
echo "=== 2. Ajout des fichiers à Git ==="

# Dockerfiles
git add node/auth-service/Dockerfile
git add node/quiz-service/Dockerfile
git add node/game-service/Dockerfile
git add node/telegram-bot/Dockerfile
git add vue/Dockerfile

# Fichiers JSON de données
git add node/auth-service/data/users.json 2>/dev/null || echo "⚠️  users.json non trouvé (sera créé au runtime)"
git add node/quiz-service/data/questions.json 2>/dev/null || echo "⚠️  questions.json non trouvé (sera créé au runtime)"
git add node/game-service/data/gameState.json 2>/dev/null || echo "⚠️  gameState.json non trouvé (sera créé au runtime)"
git add node/game-service/data/scores.json 2>/dev/null || echo "⚠️  scores.json non trouvé (sera créé au runtime)"

# Fichiers .gitkeep
git add node/auth-service/data/.gitkeep 2>/dev/null || true
git add node/quiz-service/data/.gitkeep 2>/dev/null || true
git add node/game-service/data/.gitkeep 2>/dev/null || true

# .gitignore
git add .gitignore

echo "✅ Fichiers ajoutés"
echo ""

# 3. Vérifier le statut
echo "=== 3. Statut des fichiers ==="
git status --short node/*/Dockerfile vue/Dockerfile node/*/data/ .gitignore 2>&1 | head -20

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Fichiers prêts!"
echo ""
echo "📝 Pour créer le commit et pousser:"
echo ""
echo "   git commit -m 'fix: Update Dockerfiles to use npm install and ensure data files are tracked'"
echo ""
echo "   git push origin main"
echo ""
echo "⚠️  IMPORTANT: Après le push, les builds GitHub Actions devraient fonctionner"
echo "═══════════════════════════════════════════════════════════"

