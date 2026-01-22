#!/bin/bash

echo "=== Test d'accessibilité de vika-game.ru ==="
echo ""

echo "1. Test DNS:"
dig vika-game.ru @8.8.8.8 +short
echo ""

echo "2. Test connexion TCP sur le port 80:"
timeout 5 bash -c 'cat < /dev/null > /dev/tcp/vika-game.ru/80' 2>&1 && echo "✅ Port 80 accessible" || echo "❌ Port 80 non accessible"
echo ""

echo "3. Test HTTP avec curl:"
curl -I --max-time 10 http://vika-game.ru/ 2>&1 | head -5
echo ""

echo "4. Test avec User-Agent de navigateur:"
curl -I --max-time 10 -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" http://vika-game.ru/ 2>&1 | head -5
echo ""

echo "5. Test depuis le serveur (localhost):"
ssh user1@82.202.141.248 "curl -I http://localhost/ 2>&1 | head -3"
echo ""

echo "=== Fin des tests ==="
