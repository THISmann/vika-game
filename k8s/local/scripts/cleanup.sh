#!/bin/bash

# Script pour nettoyer le déploiement local

set -e

echo "🧹 Nettoyage du déploiement local..."
echo ""

read -p "Êtes-vous sûr de vouloir supprimer tous les déploiements? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "❌ Nettoyage annulé."
  exit 0
fi

# Supprimer les releases Helm
echo ""
echo "🗑️  Suppression des releases Helm..."
helm uninstall app -n intelectgame 2>/dev/null || true
helm uninstall nginx-ingress -n nginx-ingress 2>/dev/null || true
helm uninstall monitoring -n monitoring 2>/dev/null || true
helm uninstall database -n database 2>/dev/null || true

# Supprimer les namespaces (optionnel)
read -p "Supprimer les namespaces? (y/n): " DELETE_NS
if [ "$DELETE_NS" = "y" ] || [ "$DELETE_NS" = "Y" ]; then
  echo ""
  echo "🗑️  Suppression des namespaces..."
  kubectl delete namespace intelectgame 2>/dev/null || true
  kubectl delete namespace nginx-ingress 2>/dev/null || true
  kubectl delete namespace monitoring 2>/dev/null || true
  kubectl delete namespace database 2>/dev/null || true
fi

echo ""
echo "✅ Nettoyage terminé!"


