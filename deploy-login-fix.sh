#!/bin/bash

# Script de déploiement pour corriger le problème de login
# Usage: ./deploy-login-fix.sh

set -e

echo "🚀 Déploiement des corrections pour le problème de login..."

# Se connecter au serveur et déployer
ssh user1@82.202.141.248 << 'EOF'
set -e

echo "📥 Récupération des dernières modifications..."
cd ~/vika-game
git pull origin main || echo "⚠️ Git pull failed, continuing..."

echo "🔨 Reconstruction des conteneurs..."
cd ~/vika-game
docker-compose build api-gateway auth

echo "🔄 Redémarrage des services..."
docker-compose up -d api-gateway auth

echo "⏳ Attente de la stabilisation des services..."
sleep 10

echo "✅ Vérification de l'état des services..."
docker-compose ps api-gateway auth

echo "📋 Logs récents de l'API Gateway:"
docker-compose logs --tail=20 api-gateway

echo "📋 Logs récents du service Auth:"
docker-compose logs --tail=20 auth

echo "✅ Déploiement terminé!"
echo ""
echo "🧪 Testez maintenant:"
echo "   curl -X POST http://vika-game.ru/api/auth/users/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"admin@vika-game.com\",\"password\":\"admin\"}'"
EOF

echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "🧪 Testez le login sur: http://vika-game.ru/auth/login"
echo "   Email: admin@vika-game.com"
echo "   Password: admin"
