#!/bin/bash

echo "=== Test complet des deux logins ==="
echo ""

echo "1. Test Admin Login API (username: admin, password: admin)"
ADMIN_RES=$(curl -s -X POST http://localhost:3001/auth/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin"}')

if echo "$ADMIN_RES" | grep -q "token"; then
  echo "✅ Admin Login API SUCCESS"
  echo "   Token: $(echo $ADMIN_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4 | cut -c1-30)..."
else
  echo "❌ Admin Login API FAILED"
  echo "   Response: $ADMIN_RES"
fi

echo ""

echo "2. Test User Login API avec email (email: admin@vika-game.com, password: admin)"
USER_RES_EMAIL=$(curl -s -X POST http://localhost:3001/auth/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@vika-game.com","password":"admin"}')

if echo "$USER_RES_EMAIL" | grep -q "token"; then
  echo "✅ User Login API avec email SUCCESS"
  echo "   Token: $(echo $USER_RES_EMAIL | grep -o '"token":"[^"]*' | cut -d'"' -f4 | cut -c1-30)..."
else
  echo "❌ User Login API avec email FAILED"
  echo "   Response: $USER_RES_EMAIL"
fi

echo ""

echo "3. Test User Login API avec username incorrect (email: admin, password: admin)"
USER_RES_USERNAME=$(curl -s -X POST http://localhost:3001/auth/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin","password":"admin"}')

if echo "$USER_RES_USERNAME" | grep -q "token"; then
  echo "✅ User Login API avec username SUCCESS (inattendu)"
else
  echo "❌ User Login API avec username FAILED (attendu)"
  echo "   Response: $USER_RES_USERNAME"
fi

echo ""
echo "=== Résumé ==="
echo ""
echo "✅ Admin Login (http://localhost:5174/vika-admin/admin/login):"
echo "   Username: admin"
echo "   Password: admin"
echo ""
echo "✅ User Login (http://localhost:5173/vika-game/user/login):"
echo "   Email: admin@vika-game.com"
echo "   Password: admin"
echo ""
echo "⚠️  IMPORTANT: Le User Login nécessite l'EMAIL complet (admin@vika-game.com), pas juste 'admin'"

