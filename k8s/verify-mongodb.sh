#!/bin/bash

# Script pour vérifier que MongoDB fonctionne correctement
# Usage: ./k8s/verify-mongodb.sh

set -e

echo "🔍 Vérification de MongoDB..."
echo ""

# Vérifier que le pod MongoDB est en cours d'exécution
echo "=== 1. Statut du pod MongoDB ==="
POD_STATUS=$(kubectl get pods -n intelectgame -l app=mongodb -o jsonpath='{.items[0].status.phase}' 2>/dev/null || echo "NOT_FOUND")

if [ "$POD_STATUS" = "Running" ]; then
  echo "✅ Pod MongoDB est en cours d'exécution"
elif [ "$POD_STATUS" = "NOT_FOUND" ]; then
  echo "❌ Pod MongoDB non trouvé. Déployez-le avec: ./k8s/deploy-mongodb.sh"
  exit 1
else
  echo "⚠️  Pod MongoDB est dans l'état: $POD_STATUS"
  echo "   Vérifiez les logs: kubectl logs -n intelectgame -l app=mongodb"
fi
echo ""

# Vérifier que le service MongoDB existe
echo "=== 2. Service MongoDB ==="
if kubectl get svc -n intelectgame mongodb &>/dev/null; then
  echo "✅ Service MongoDB existe"
  kubectl get svc -n intelectgame mongodb
else
  echo "❌ Service MongoDB n'existe pas"
  exit 1
fi
echo ""

# Vérifier que le PVC existe
echo "=== 3. PersistentVolumeClaim ==="
if kubectl get pvc -n intelectgame mongodb-pvc &>/dev/null; then
  echo "✅ PersistentVolumeClaim existe"
  kubectl get pvc -n intelectgame mongodb-pvc
else
  echo "⚠️  PersistentVolumeClaim n'existe pas (les données ne seront pas persistantes)"
fi
echo ""

# Tester la connexion MongoDB
echo "=== 4. Test de connexion MongoDB ==="
POD_NAME=$(kubectl get pods -n intelectgame -l app=mongodb -o jsonpath='{.items[0].metadata.name}')

if [ -n "$POD_NAME" ]; then
  echo "   Test de connexion depuis le pod..."
  if kubectl exec -n intelectgame "$POD_NAME" -- mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
    echo "✅ MongoDB répond correctement"
  else
    echo "⚠️  Impossible de se connecter à MongoDB"
    echo "   Vérifiez les logs: kubectl logs -n intelectgame $POD_NAME"
  fi
else
  echo "⚠️  Pod MongoDB non trouvé"
fi
echo ""

# Vérifier que la base de données existe
echo "=== 5. Vérification de la base de données ==="
if kubectl exec -n intelectgame "$POD_NAME" -- mongosh intelectgame --eval "db.getName()" &>/dev/null; then
  echo "✅ Base de données 'intelectgame' est accessible"
  
  # Lister les collections
  echo "   Collections existantes:"
  kubectl exec -n intelectgame "$POD_NAME" -- mongosh intelectgame --eval "db.getCollectionNames()" 2>/dev/null | grep -E "\[|users|questions|gamestate|scores" || echo "   (Aucune collection pour l'instant)"
else
  echo "⚠️  Impossible d'accéder à la base de données"
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✅ Vérification terminée!"
echo ""
echo "📝 Pour tester manuellement:"
echo "   kubectl exec -it -n intelectgame $POD_NAME -- mongosh intelectgame"
echo ""
echo "📝 Pour voir les logs:"
echo "   kubectl logs -n intelectgame $POD_NAME"
echo "═══════════════════════════════════════════════════════════"

