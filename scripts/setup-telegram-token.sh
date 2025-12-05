#!/bin/bash

# Script pour configurer le token Telegram Bot pour Docker Compose

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🤖 Configuration du Token Telegram Bot"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ENV_FILE="node/telegram-bot/.env"

# Vérifier si le token est déjà défini
if [ -f "$ENV_FILE" ] && grep -q "TELEGRAM_BOT_TOKEN" "$ENV_FILE"; then
    echo -e "${YELLOW}⚠️  Un fichier .env existe déjà${NC}"
    current_token=$(grep "TELEGRAM_BOT_TOKEN" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    if [ -n "$current_token" ]; then
        echo -e "${BLUE}Token actuel : ${current_token:0:10}...${NC}"
        read -p "Voulez-vous le remplacer ? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${GREEN}✅ Token conservé${NC}"
            exit 0
        fi
    fi
fi

# Demander le token
echo -e "${BLUE}Entrez votre token Telegram Bot :${NC}"
echo "   (Vous pouvez l'obtenir depuis @BotFather sur Telegram)"
read -p "Token: " token

if [ -z "$token" ]; then
    echo -e "${RED}❌ Token vide, annulation${NC}"
    exit 1
fi

# Nettoyer le token (supprimer les espaces)
token=$(echo "$token" | tr -d '[:space:]')

# Créer le fichier .env
mkdir -p "$(dirname "$ENV_FILE")"
cat > "$ENV_FILE" << EOF
TELEGRAM_BOT_TOKEN=${token}
AUTH_SERVICE_URL=http://auth:3001
QUIZ_SERVICE_URL=http://quiz:3002
GAME_SERVICE_URL=http://game:3003
GAME_WS_URL=http://game:3003
EOF

echo ""
echo -e "${GREEN}✅ Token configuré dans ${ENV_FILE}${NC}"
echo ""

# Vérifier si Docker Compose est actif
if docker-compose ps telegram-bot 2>/dev/null | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  Le conteneur telegram-bot est actif${NC}"
    read -p "Voulez-vous le redémarrer pour appliquer le nouveau token ? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🔄 Redémarrage du telegram-bot...${NC}"
        docker-compose restart telegram-bot
        echo -e "${GREEN}✅ Telegram bot redémarré${NC}"
        echo ""
        echo "Vérifiez les logs :"
        echo "  docker-compose logs -f telegram-bot"
    fi
else
    echo -e "${BLUE}💡 Pour démarrer le telegram-bot :${NC}"
    echo "   docker-compose up -d telegram-bot"
fi

echo ""
echo -e "${GREEN}✅ Configuration terminée !${NC}"

