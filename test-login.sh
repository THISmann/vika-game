#!/bin/bash

echo "=== Test des credentials locaux ==="
echo ""

# Test 1: Admin Login (crée l'admin s'il n'existe pas)
echo "1. Test Admin Login (username: admin, password: admin)"
ADMIN_RES=$(curl -s -X POST http://localhost:3001/auth/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin"}')

if echo "$ADMIN_RES" | grep -q "token"; then
  echo "✅ Admin Login SUCCESS"
  echo "   Response: $(echo $ADMIN_RES | cut -c1-100)..."
else
  echo "❌ Admin Login FAILED"
  echo "   Response: $ADMIN_RES"
fi

echo ""

# Test 2: User Login (doit fonctionner après admin login)
echo "2. Test User Login (email: admin@vika-game.com, password: admin)"
USER_RES=$(curl -s -X POST http://localhost:3001/auth/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@vika-game.com","password":"admin"}')

if echo "$USER_RES" | grep -q "token"; then
  echo "✅ User Login SUCCESS"
  echo "   Response: $(echo $USER_RES | cut -c1-100)..."
else
  echo "❌ User Login FAILED"
  echo "   Response: $USER_RES"
fi

echo ""
echo "=== Résumé des credentials ==="
echo ""
echo "Pour User Login (http://localhost:5173/vika-game/user/login):"
echo "  Email: admin@vika-game.com"
echo "  Password: admin"
echo ""
echo "⚠️  IMPORTANT: L'admin doit d'abord exister dans la base."
echo "   Si la connexion échoue, essayez d'abord l'Admin Login:"
echo "   Username: admin"
echo "   Password: admin"



