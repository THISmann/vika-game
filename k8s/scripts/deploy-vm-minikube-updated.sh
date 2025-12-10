#!/bin/bash

# Script de déploiement mis à jour pour Minikube sur VM
# Inclut toutes les modifications récentes (sécurité, endpoints publics, etc.)
# Usage: ./k8s/scripts/deploy-vm-minikube-updated.sh

set -e

echo "🚀 Déploiement de l'application GameV2 sur Minikube (VM)"
echo "=================================================="
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
info() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier que Minikube est démarré
echo "📋 Vérification de Minikube..."
if ! minikube status &> /dev/null; then
    warn "Minikube n'est pas démarré. Démarrage de Minikube..."
    minikube start
    info "Minikube démarré"
else
    info "Minikube est déjà démarré"
fi

# Vérifier que kubectl est configuré
if ! kubectl cluster-info &> /dev/null; then
    error "kubectl n'est pas configuré correctement"
    exit 1
fi

# Créer le namespace
echo ""
echo "📦 Création du namespace 'intelectgame'..."
kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: intelectgame
EOF
info "Namespace créé"

# Déployer Redis en premier (nécessaire pour tous les services)
echo ""
echo "🔴 Déploiement de Redis..."
if [ -f "k8s/redis-deployment.yaml" ]; then
    kubectl apply -f k8s/redis-deployment.yaml
    echo "⏳ Attente que Redis soit prêt..."
    kubectl wait --for=condition=available --timeout=120s deployment/redis -n intelectgame || {
        warn "Redis prend plus de temps que prévu, mais continue..."
    }
    info "Redis déployé"
else
    warn "Fichier redis-deployment.yaml non trouvé"
fi

# Déployer MongoDB
echo ""
echo "🐳 Déploiement de MongoDB..."
if [ -f "k8s/mongodb-deployment.yaml" ]; then
    kubectl apply -f k8s/mongodb-deployment.yaml
    echo "⏳ Attente que MongoDB soit prêt..."
    kubectl wait --for=condition=available --timeout=300s deployment/mongodb -n intelectgame || {
        warn "MongoDB prend plus de temps que prévu, mais continue..."
    }
    info "MongoDB déployé"
else
    warn "Fichier mongodb-deployment.yaml non trouvé"
fi

# Créer le ConfigMap
echo ""
echo "⚙️  Création du ConfigMap..."
kubectl apply -f k8s/configmap.yaml
info "ConfigMap créé"

# Configurer le secret Telegram Bot
echo ""
if ! kubectl get secret telegram-bot-secret -n intelectgame &> /dev/null; then
    echo "🤖 Configuration du token Telegram Bot..."
    read -p "Entrez votre token Telegram Bot (ou appuyez sur Entrée pour ignorer): " TELEGRAM_TOKEN
    
    if [ -n "$TELEGRAM_TOKEN" ]; then
        kubectl create secret generic telegram-bot-secret \
            --from-literal=TELEGRAM_BOT_TOKEN="$TELEGRAM_TOKEN" \
            -n intelectgame \
            --dry-run=client -o yaml | kubectl apply -f -
        info "Secret Telegram Bot créé"
    else
        warn "Secret Telegram Bot non créé. Vous devrez le créer manuellement si nécessaire."
        echo "   Commande: kubectl create secret generic telegram-bot-secret --from-literal=TELEGRAM_BOT_TOKEN=<TOKEN> -n intelectgame"
    fi
else
    info "Secret Telegram Bot existe déjà"
fi

# Déployer l'API Gateway
echo ""
echo "🚪 Déploiement de l'API Gateway..."
if [ -f "k8s/api-gateway-deployment.yaml" ]; then
    kubectl apply -f k8s/api-gateway-deployment.yaml
    info "API Gateway déployé"
else
    warn "Fichier api-gateway-deployment.yaml non trouvé"
fi

# Déployer les services backend (dans l'ordre de dépendance)
echo ""
echo "🔧 Déploiement des services backend..."

# Auth Service (premier, car les autres en dépendent)
echo "  - Auth Service..."
kubectl apply -f k8s/auth-service-deployment.yaml

# Quiz Service (dépend de Auth Service)
echo "  - Quiz Service..."
kubectl apply -f k8s/quiz-service-deployment.yaml

# Game Service (dépend de Auth et Quiz)
echo "  - Game Service..."
kubectl apply -f k8s/game-service-deployment.yaml

# Telegram Bot (optionnel)
echo "  - Telegram Bot..."
if [ -f "k8s/telegram-bot-deployment.yaml" ]; then
    kubectl apply -f k8s/telegram-bot-deployment.yaml
fi

info "Services backend déployés"

# Déployer le frontend
echo ""
echo "🎨 Déploiement du frontend..."
kubectl apply -f k8s/frontend-deployment.yaml
info "Frontend déployé"

# Attendre que les pods soient prêts
echo ""
echo "⏳ Attente du démarrage des pods (peut prendre 2-3 minutes)..."
kubectl wait --for=condition=ready pod --all -n intelectgame --timeout=600s || {
    warn "Certains pods ne sont pas encore prêts, mais le déploiement continue..."
}

# Afficher le statut
echo ""
echo "=================================================="
echo "✅ Déploiement terminé!"
echo "=================================================="
echo ""

echo "📊 Statut des pods:"
kubectl get pods -n intelectgame

echo ""
echo "🌐 Services:"
kubectl get services -n intelectgame

echo ""
echo "🔗 Accès à l'application:"
MINIKUBE_IP=$(minikube ip)
echo "   Frontend: http://${MINIKUBE_IP}:30080"
echo "   API Gateway: http://${MINIKUBE_IP}:30000 (si NodePort configuré)"
echo ""

# Vérifier les pods en erreur
echo "🔍 Vérification des pods en erreur..."
ERROR_PODS=$(kubectl get pods -n intelectgame --field-selector=status.phase!=Running,status.phase!=Succeeded -o jsonpath='{.items[*].metadata.name}' 2>/dev/null || echo "")
if [ -n "$ERROR_PODS" ]; then
    warn "Certains pods sont en erreur:"
    for pod in $ERROR_PODS; do
        echo "   - $pod"
        kubectl describe pod "$pod" -n intelectgame | grep -A 5 "Events:" || true
    done
else
    info "Tous les pods sont en cours d'exécution"
fi

echo ""
echo "📝 Commandes utiles:"
echo "   Voir les logs d'un service:"
echo "     kubectl logs -f <pod-name> -n intelectgame"
echo ""
echo "   Redémarrer un service:"
echo "     kubectl rollout restart deployment/<service-name> -n intelectgame"
echo ""
echo "   Supprimer le déploiement:"
echo "     kubectl delete -f k8s/all-services.yaml"
echo "     kubectl delete namespace intelectgame"
echo ""
echo "   Accéder à l'application:"
echo "     minikube service frontend -n intelectgame"
echo ""

# Vérifier que l'API Gateway est accessible
echo "🔍 Vérification de l'API Gateway..."
if kubectl get service api-gateway -n intelectgame &> /dev/null; then
    info "API Gateway service trouvé"
    # Essayer de faire un curl vers l'API Gateway
    API_GATEWAY_POD=$(kubectl get pods -n intelectgame -l app=api-gateway -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    if [ -n "$API_GATEWAY_POD" ]; then
        if kubectl exec -n intelectgame "$API_GATEWAY_POD" -- curl -s http://localhost:3000/health &> /dev/null; then
            info "API Gateway répond correctement"
        else
            warn "API Gateway ne répond pas encore (peut prendre quelques secondes)"
        fi
    fi
fi

echo ""
info "Déploiement terminé avec succès!"
echo ""
echo "📖 Pour plus d'informations, consultez:"
echo "   - k8s/README.md"
echo "   - k8s/docs/VM_DEPLOYMENT.md"
echo ""

