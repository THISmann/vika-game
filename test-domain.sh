#!/bin/bash

# Script de test pour vérifier la configuration du domaine vika-game.ru

echo "🔍 Test de configuration du domaine vika-game.ru"
echo "================================================"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DOMAIN="vika-game.ru"
IP="82.202.141.248"

echo "1. Vérification DNS..."
echo "---------------------"
DNS_RESULT=$(dig +short $DOMAIN @8.8.8.8 | head -1)
if [ "$DNS_RESULT" = "$IP" ]; then
    echo -e "${GREEN}✅ DNS correct: $DOMAIN → $IP${NC}"
else
    echo -e "${RED}❌ DNS incorrect: $DOMAIN → $DNS_RESULT (attendu: $IP)${NC}"
    echo -e "${YELLOW}⚠️  Le DNS doit pointer vers $IP${NC}"
fi
echo ""

echo "2. Test de connectivité HTTP (port 80)..."
echo "-----------------------------------------"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://$DOMAIN/ 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ HTTP accessible (code: $HTTP_CODE)${NC}"
elif [ "$HTTP_CODE" = "000" ]; then
    echo -e "${RED}❌ HTTP non accessible (timeout ou erreur de connexion)${NC}"
    echo -e "${YELLOW}⚠️  Vérifiez que le port 80 est ouvert sur le serveur${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP retourne le code: $HTTP_CODE${NC}"
fi
echo ""

echo "3. Test de connectivité HTTPS (port 443)..."
echo "------------------------------------------"
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -k https://$DOMAIN/ 2>/dev/null || echo "000")
if [ "$HTTPS_CODE" = "301" ] || [ "$HTTPS_CODE" = "302" ] || [ "$HTTPS_CODE" = "200" ]; then
    echo -e "${GREEN}✅ HTTPS accessible (code: $HTTPS_CODE)${NC}"
elif [ "$HTTPS_CODE" = "000" ]; then
    echo -e "${RED}❌ HTTPS non accessible (timeout ou erreur de connexion)${NC}"
    echo -e "${YELLOW}⚠️  Vérifiez que le port 443 est ouvert sur le serveur${NC}"
else
    echo -e "${YELLOW}⚠️  HTTPS retourne le code: $HTTPS_CODE${NC}"
fi
echo ""

echo "4. Test de redirection HTTP → HTTPS..."
echo "--------------------------------------"
REDIRECT_URL=$(curl -s -o /dev/null -w "%{redirect_url}" --max-time 5 http://$DOMAIN/ 2>/dev/null || echo "")
if [[ "$REDIRECT_URL" == *"https://"* ]]; then
    echo -e "${GREEN}✅ Redirection HTTP → HTTPS fonctionne${NC}"
    echo "   URL de redirection: $REDIRECT_URL"
else
    echo -e "${YELLOW}⚠️  Pas de redirection détectée${NC}"
fi
echo ""

echo "5. Test des routes principales..."
echo "----------------------------------"
echo "Test: https://$DOMAIN/vika-game"
FRONTEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -k https://$DOMAIN/vika-game 2>/dev/null || echo "000")
if [ "$FRONTEND_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Frontend accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend retourne le code: $FRONTEND_CODE${NC}"
fi

echo "Test: https://$DOMAIN/dashboard/"
DASHBOARD_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -k https://$DOMAIN/dashboard/ 2>/dev/null || echo "000")
if [ "$DASHBOARD_CODE" = "200" ] || [ "$DASHBOARD_CODE" = "401" ]; then
    echo -e "${GREEN}✅ Traefik Dashboard accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Traefik Dashboard retourne le code: $DASHBOARD_CODE${NC}"
fi

echo "Test: https://$DOMAIN/vika-game/api/health"
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -k https://$DOMAIN/vika-game/api/health 2>/dev/null || echo "000")
if [ "$API_CODE" = "200" ] || [ "$API_CODE" = "404" ]; then
    echo -e "${GREEN}✅ API Gateway accessible${NC}"
else
    echo -e "${YELLOW}⚠️  API Gateway retourne le code: $API_CODE${NC}"
fi
echo ""

echo "6. Vérification du certificat SSL..."
echo "------------------------------------"
CERT_INFO=$(echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -subject -dates 2>/dev/null)
if [ -n "$CERT_INFO" ]; then
    echo -e "${GREEN}✅ Certificat SSL présent${NC}"
    echo "$CERT_INFO"
else
    echo -e "${RED}❌ Certificat SSL non trouvé${NC}"
    echo -e "${YELLOW}⚠️  Let's Encrypt n'a peut-être pas encore généré le certificat${NC}"
fi
echo ""

echo "================================================"
echo "📋 Résumé des actions à effectuer:"
echo ""
echo "Si le DNS ne pointe pas vers $IP:"
echo "  1. Connectez-vous à votre registrar (ex: reg.ru)"
echo "  2. Allez dans 'Gestion DNS'"
echo "  3. Ajoutez un enregistrement A: @ → $IP"
echo "  4. Attendez la propagation (15 min - 48h)"
echo ""
echo "Si les ports 80/443 ne sont pas accessibles:"
echo "  1. Vérifiez le firewall sur le serveur"
echo "  2. Ouvrez les ports 80 et 443"
echo ""
echo "Si Traefik ne démarre pas:"
echo "  1. Vérifiez les logs: docker-compose logs traefik"
echo "  2. Vérifiez que le dossier letsencrypt existe: mkdir -p letsencrypt && chmod 700 letsencrypt"
echo ""
echo "Pour redémarrer les services:"
echo "  docker-compose down && docker-compose up -d"
echo ""
