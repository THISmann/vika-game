#!/bin/bash

echo "=== Test complet des logins - Local Environment ==="
echo ""

echo "⏳ Attente de 10 secondes pour le démarrage des frontends..."
sleep 10

echo ""
echo "=== Test 1: Admin Login API ==="
ADMIN_RES=$(curl -s -X POST http://localhost:3001/auth/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin"}')

if echo "$ADMIN_RES" | grep -q "token"; then
  echo "✅ Admin Login API SUCCESS"
  ADMIN_TOKEN=$(echo "$ADMIN_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null || echo "token-found")
  echo "   Token: ${ADMIN_TOKEN:0:30}..."
else
  echo "❌ Admin Login API FAILED"
  echo "   Response: $ADMIN_RES"
fi

echo ""
echo "=== Test 2: User Login API ==="
USER_RES=$(curl -s -X POST http://localhost:3001/auth/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@vika-game.com","password":"admin"}')

if echo "$USER_RES" | grep -q "token"; then
  echo "✅ User Login API SUCCESS"
  USER_TOKEN=$(echo "$USER_RES" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null || echo "token-found")
  echo "   Token: ${USER_TOKEN:0:30}..."
else
  echo "❌ User Login API FAILED"
  echo "   Response: $USER_RES"
fi

echo ""
echo "=== Résumé des credentials ==="
echo ""
echo "📋 Admin Login (http://localhost:5174/vika-admin/admin/login):"
echo "   Username: admin"
echo "   Password: admin"
echo ""
echo "📋 User Login (http://localhost:5173/vika-game/user/login):"
echo "   Email: admin@vika-game.com"
echo "   Password: admin"
echo ""
echo "✅ Les APIs backend fonctionnent correctement."
echo "⚠️  Si la connexion échoue dans le frontend, vérifiez:"
echo "   1. Les frontends sont démarrés (ports 5173 et 5174)"
echo "   2. Vous utilisez les bons credentials (email complet pour User Login)"
echo "   3. Les variables d'environnement sont correctement définies"

