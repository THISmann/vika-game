#!/bin/bash

# Script pour construire les images Docker localement et les charger dans Minikube

set -e

echo "🐳 Construction des images Docker locales..."
echo ""

# 1. Configurer Docker pour utiliser le daemon de Minikube
echo "📦 Configuration de Docker pour Minikube..."
eval $(minikube docker-env)

# 2. Construire les images
echo ""
echo "🔨 Construction des images..."

# Auth Service
echo "📦 Building auth-service..."
cd node
docker build -t gamev2-auth-service:local -f auth-service/Dockerfile .
cd ..

# Quiz Service
echo "📦 Building quiz-service..."
cd node
docker build -t gamev2-quiz-service:local -f quiz-service/Dockerfile .
cd ..

# Game Service
echo "📦 Building game-service..."
cd node
docker build -t gamev2-game-service:local -f game-service/Dockerfile .
cd ..

# Frontend
echo "📦 Building frontend..."
cd vue
docker build -t gamev2-frontend:local -f Dockerfile .
cd ..

# Telegram Bot
echo "📦 Building telegram-bot..."
cd node/telegram-bot
docker build -t gamev2-telegram-bot:local -f Dockerfile .
cd ../..

echo ""
echo "✅ Toutes les images ont été construites et chargées dans Minikube!"
echo ""
echo "💡 Pour vérifier les images:"
echo "   eval \$(minikube docker-env)"
echo "   docker images | grep gamev2"

