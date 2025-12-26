#!/bin/bash

# Script pour supprimer complètement ELK du cluster Kubernetes

set -e

ELK_NAMESPACE="elk"

echo "🗑️  Suppression complète d'ELK du cluster..."
echo ""

# 1. Supprimer le release Helm
echo "--- 1. Suppression du release Helm ELK ---"
if helm list -n $ELK_NAMESPACE | grep -q elk; then
  helm delete elk -n $ELK_NAMESPACE 2>/dev/null && echo "✅ Release Helm ELK supprimée" || echo "⚠️  Erreur lors de la suppression"
else
  echo "ℹ️  Aucun release Helm ELK trouvé"
fi
echo ""

# 2. Supprimer le namespace (supprime toutes les ressources)
echo "--- 2. Suppression du namespace elk ---"
if kubectl get namespace $ELK_NAMESPACE &> /dev/null; then
  kubectl delete namespace $ELK_NAMESPACE --timeout=60s && echo "✅ Namespace elk supprimé" || echo "⚠️  Erreur lors de la suppression (peut prendre du temps)"
else
  echo "ℹ️  Namespace elk n'existe pas"
fi
echo ""

# 3. Vérifier qu'il n'y a plus de ressources ELK
echo "--- 3. Vérification finale ---"
if kubectl get namespace $ELK_NAMESPACE &> /dev/null; then
  echo "⚠️  Le namespace elk existe encore. Ressources restantes:"
  kubectl get all -n $ELK_NAMESPACE
  echo ""
  echo "💡 Pour forcer la suppression:"
  echo "   kubectl delete namespace elk --force --grace-period=0"
else
  echo "✅ Namespace elk complètement supprimé"
fi
echo ""

echo "✅ Nettoyage terminé!"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Utiliser la stack Loki + Prometheus + Grafana"
echo "   2. Déployer: ./k8s/local/scripts/deploy-loki-stack.sh"
echo "   3. Accéder: ./k8s/local/scripts/access-all-dashboards.sh"

