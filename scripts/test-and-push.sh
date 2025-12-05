#!/bin/bash
# Script pour tester localement puis push sur main si les tests passent

set -e

echo "🚀 Pipeline de test et déploiement"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

step() {
    echo -e "${BLUE}📋 $1${NC}"
}

# Vérifier que nous ne sommes pas déjà sur main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    error "Vous êtes sur la branche $CURRENT_BRANCH. Créez une branche de feature d'abord."
    echo ""
    echo "Exemple:"
    echo "  git checkout -b feature/my-feature"
    exit 1
fi

info "Branche actuelle: $CURRENT_BRANCH"
echo ""

# Vérifier que le repo est propre
if ! git diff-index --quiet HEAD --; then
    error "Vous avez des modifications non commitées. Committez ou stashez d'abord."
    exit 1
fi

# Vérifier que la branche est à jour avec main
step "Vérification que la branche est à jour avec main..."
git fetch origin main:main 2>/dev/null || true
if [ "$(git rev-list --count HEAD..main)" -gt 0 ]; then
    warning "Votre branche est en retard sur main. Voulez-vous rebase ? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        git rebase main
        info "Rebase terminé"
    fi
fi
echo ""

# Exécuter les tests locaux
step "Exécution des tests locaux..."
if ./scripts/test-local.sh; then
    info "Tests locaux: ✅ PASSÉ"
else
    error "Tests locaux: ❌ ÉCHOUÉ"
    echo ""
    echo "Corrigez les erreurs avant de continuer."
    exit 1
fi
echo ""

# Demander confirmation pour push
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
warning "Tous les tests sont passés !"
echo ""
echo "Options:"
echo "  1. Push sur la branche actuelle ($CURRENT_BRANCH)"
echo "  2. Créer une Pull Request vers main"
echo "  3. Merge et push direct sur main (non recommandé)"
echo "  4. Annuler"
echo ""
read -p "Choisissez une option (1-4): " choice

case $choice in
    1)
        step "Push sur $CURRENT_BRANCH..."
        git push origin "$CURRENT_BRANCH"
        info "Push terminé sur $CURRENT_BRANCH"
        echo ""
        echo "💡 Créez une Pull Request pour merger vers main"
        ;;
    2)
        step "Création d'une Pull Request..."
        if command -v gh &> /dev/null; then
            gh pr create --title "Feature: $CURRENT_BRANCH" --body "Tests locaux passés ✅" --base main
            info "Pull Request créée"
        else
            warning "GitHub CLI (gh) n'est pas installé"
            echo "Créez manuellement une PR: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/compare/main...$CURRENT_BRANCH"
        fi
        ;;
    3)
        warning "Vous allez merger directement sur main. Êtes-vous sûr ? (yes/no)"
        read -r confirm
        if [ "$confirm" = "yes" ]; then
            step "Checkout main..."
            git checkout main
            step "Merge de $CURRENT_BRANCH..."
            git merge "$CURRENT_BRANCH" --no-ff -m "Merge $CURRENT_BRANCH: Tests passés ✅"
            step "Push sur main..."
            git push origin main
            info "Merge et push sur main terminés"
        else
            info "Opération annulée"
        fi
        ;;
    4)
        info "Opération annulée"
        exit 0
        ;;
    *)
        error "Option invalide"
        exit 1
        ;;
esac

echo ""
info "Pipeline terminé avec succès ! 🎉"

