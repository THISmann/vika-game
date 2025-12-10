#!/bin/bash

# Script pour recréer complètement le déploiement Nginx
# Usage: ./k8s/scripts/recreate-nginx.sh

set -e

NAMESPACE="intelectgame"

echo "🔄 Recréation complète du déploiement Nginx..."
echo ""

# 1. Supprimer le deployment existant
echo "🗑️  1. Suppression du deployment existant..."
kubectl delete deployment nginx-proxy -n "$NAMESPACE" --ignore-not-found=true
kubectl delete service nginx-proxy -n "$NAMESPACE" --ignore-not-found=true

# 2. Supprimer les pods bloqués
echo ""
echo "🗑️  2. Suppression des pods bloqués..."
kubectl delete pods -n "$NAMESPACE" -l app=nginx-proxy --force --grace-period=0 --ignore-not-found=true

# 3. Attendre un peu
echo ""
echo "⏳ 3. Attente de 5 secondes..."
sleep 5

# 4. Recréer la ConfigMap (au cas où)
echo ""
echo "📝 4. Mise à jour de la ConfigMap..."
kubectl apply -f k8s/nginx-proxy-config.yaml

# 5. Vérifier que la ConfigMap est correcte
echo ""
echo "✅ 5. Vérification de la ConfigMap..."
if kubectl get configmap nginx-proxy-config -n "$NAMESPACE" &> /dev/null; then
    echo "   ✅ ConfigMap existe"
    
    # Vérifier le contenu
    CONFIG_SIZE=$(kubectl get configmap nginx-proxy-config -n "$NAMESPACE" -o jsonpath='{.data.nginx\.conf}' | wc -c)
    if [ "$CONFIG_SIZE" -gt 100 ]; then
        echo "   ✅ Configuration présente ($CONFIG_SIZE caractères)"
    else
        echo "   ⚠️  Configuration semble vide ou trop petite"
    fi
else
    echo "   ❌ ConfigMap n'existe pas"
    exit 1
fi

# 6. Recréer le deployment
echo ""
echo "🚀 6. Création du deployment..."
kubectl apply -f k8s/nginx-proxy-config.yaml

# 7. Attendre le démarrage
echo ""
echo "⏳ 7. Attente du démarrage (timeout: 120s)..."
if kubectl wait --for=condition=available --timeout=120s deployment/nginx-proxy -n "$NAMESPACE" 2>/dev/null; then
    echo "   ✅ Nginx démarré avec succès"
else
    echo "   ⚠️  Timeout - Vérification manuelle nécessaire"
fi

# 8. Vérifier l'état
echo ""
echo "📊 8. État final:"
kubectl get pods -n "$NAMESPACE" -l app=nginx-proxy
kubectl get service nginx-proxy -n "$NAMESPACE"

echo ""
echo "✅ Recréation terminée"
echo ""
echo "💡 Si le problème persiste:"
echo "   1. Vérifier les logs: kubectl logs -f -l app=nginx-proxy -n $NAMESPACE"
echo "   2. Vérifier les événements: kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | grep nginx"
echo "   3. Exécuter le diagnostic: ./k8s/scripts/diagnose-nginx.sh"
echo ""

