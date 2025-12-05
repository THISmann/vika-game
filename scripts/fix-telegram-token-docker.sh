#!/bin/bash

# Script pour corriger le problème du token Telegram dans Docker Compose

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔧 Correction du Token Telegram pour Docker Compose"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ENV_FILE="node/telegram-bot/.env"

# Vérifier si le fichier .env existe et contient le token
if [ -f "$ENV_FILE" ]; then
    if grep -q "TELEGRAM_BOT_TOKEN" "$ENV_FILE" && ! grep -q "TELEGRAM_BOT_TOKEN=$" "$ENV_FILE" && ! grep -q "TELEGRAM_BOT_TOKEN=your_bot_token" "$ENV_FILE"; then
        token=$(grep "TELEGRAM_BOT_TOKEN" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ')
        if [ -n "$token" ] && [ "$token" != "" ]; then
            echo -e "${GREEN}✅ Token trouvé dans $ENV_FILE${NC}"
            echo -e "${BLUE}Token (masqué) : ${token:0:10}...${NC}"
            echo ""
            echo "Le token est déjà configuré. Vérifions que Docker Compose peut le lire..."
            echo ""
        else
            echo -e "${RED}❌ Token vide dans $ENV_FILE${NC}"
            echo ""
            read -p "Voulez-vous configurer le token maintenant ? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                ./scripts/setup-telegram-token.sh
                exit 0
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  Token non configuré dans $ENV_FILE${NC}"
        echo ""
        read -p "Voulez-vous configurer le token maintenant ? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ./scripts/setup-telegram-token.sh
            exit 0
        fi
    fi
else
    echo -e "${RED}❌ Fichier $ENV_FILE n'existe pas${NC}"
    echo ""
    read -p "Voulez-vous créer le fichier et configurer le token ? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./scripts/setup-telegram-token.sh
        exit 0
    else
        echo -e "${RED}❌ Impossible de continuer sans token${NC}"
        exit 1
    fi
fi

# Vérifier que le fichier .env est bien formaté
echo -e "${BLUE}📋 Vérification du format du fichier .env...${NC}"
if ! grep -q "^TELEGRAM_BOT_TOKEN=" "$ENV_FILE"; then
    echo -e "${RED}❌ Format incorrect dans $ENV_FILE${NC}"
    echo "   Le fichier doit contenir : TELEGRAM_BOT_TOKEN=votre_token"
    exit 1
fi

# Vérifier que le token n'est pas un placeholder
if grep -q "TELEGRAM_BOT_TOKEN=your_bot_token" "$ENV_FILE" || grep -q "TELEGRAM_BOT_TOKEN=votre_token" "$ENV_FILE"; then
    echo -e "${RED}❌ Token placeholder détecté${NC}"
    echo "   Veuillez remplacer le placeholder par votre vrai token"
    exit 1
fi

echo -e "${GREEN}✅ Format correct${NC}"
echo ""

# Redémarrer le conteneur telegram-bot
echo -e "${BLUE}🔄 Redémarrage du conteneur telegram-bot...${NC}"
docker-compose stop telegram-bot 2>/dev/null
docker-compose up -d telegram-bot

echo ""
echo -e "${BLUE}⏳ Attente du démarrage (5 secondes)...${NC}"
sleep 5

# Vérifier les logs
echo ""
echo -e "${BLUE}📋 Vérification des logs...${NC}"
logs=$(docker-compose logs --tail=20 telegram-bot 2>&1)

if echo "$logs" | grep -q "TELEGRAM_BOT_TOKEN is required"; then
    echo -e "${RED}❌ Le token n'est toujours pas détecté${NC}"
    echo ""
    echo "Solutions possibles :"
    echo "1. Vérifiez que le fichier $ENV_FILE contient bien le token"
    echo "2. Vérifiez que le token n'a pas d'espaces ou de caractères spéciaux"
    echo "3. Essayez de redémarrer Docker Compose complètement :"
    echo "   docker-compose down"
    echo "   docker-compose up -d"
    exit 1
elif echo "$logs" | grep -q "✅ Token valide\|Bot créé\|Telegram bot is running"; then
    echo -e "${GREEN}✅ Telegram bot démarré avec succès !${NC}"
    echo ""
    echo "Logs récents :"
    echo "$logs" | tail -5
else
    echo -e "${YELLOW}⚠️  Statut incertain, vérifiez les logs :${NC}"
    echo "$logs" | tail -10
fi

echo ""
echo -e "${GREEN}✅ Correction terminée !${NC}"
echo ""
echo "Pour voir les logs en temps réel :"
echo "  docker-compose logs -f telegram-bot"

