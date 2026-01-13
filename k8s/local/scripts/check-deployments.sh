#!/bin/bash

# Script pour vérifier l'état des déploiements

NAMESPACE="intelectgame"

echo "🔍 Vérification des déploiements dans $NAMESPACE..."
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Release Helm:"
helm list -n $NAMESPACE
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Deployments:"
kubectl get deployments -n $NAMESPACE
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔌 Services:"
kubectl get services -n $NAMESPACE
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Pods:"
kubectl get pods -n $NAMESPACE
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 ConfigMap et Secrets:"
kubectl get configmap,secret -n $NAMESPACE
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "❌ Événements récents:"
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -10
echo ""


