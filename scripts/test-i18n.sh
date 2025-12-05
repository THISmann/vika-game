#!/bin/bash

# Script de test pour l'internationalisation
# Ce script vérifie que tous les fichiers nécessaires sont présents

echo "🧪 Test de l'Internationalisation (i18n)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
PASSED=0
FAILED=0

# Fonction pour vérifier un fichier
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌${NC} $1 (manquant)"
        ((FAILED++))
        return 1
    fi
}

# Fonction pour vérifier une clé de traduction
check_translation_key() {
    local file=$1
    local key=$2
    
    if grep -q "'$key'" "$file" || grep -q "\"$key\"" "$file"; then
        echo -e "   ${GREEN}✓${NC} $key"
        return 0
    else
        echo -e "   ${RED}✗${NC} $key (manquant)"
        return 1
    fi
}

echo "📁 Vérification des fichiers..."
echo ""

# Vérifier les fichiers principaux
check_file "vue/front/src/composables/useI18n.js"
check_file "vue/front/src/components/player/PlayerNavbar.vue"
check_file "vue/front/src/components/player/PlayerRegister.vue"
check_file "vue/front/src/components/player/QuizPlay.vue"
check_file "vue/front/src/components/player/Leaderboard.vue"
check_file "TEST_I18N.md"

echo ""
echo "🔍 Vérification des clés de traduction..."
echo ""

I18N_FILE="vue/front/src/composables/useI18n.js"

if [ -f "$I18N_FILE" ]; then
    echo "Vérification des clés essentielles dans useI18n.js:"
    
    # Clés de navigation
    check_translation_key "$I18N_FILE" "nav.register"
    check_translation_key "$I18N_FILE" "nav.play"
    check_translation_key "$I18N_FILE" "nav.leaderboard"
    
    # Clés d'inscription
    check_translation_key "$I18N_FILE" "register.enterCode"
    check_translation_key "$I18N_FILE" "register.verifyCode"
    check_translation_key "$I18N_FILE" "register.join"
    
    # Clés de quiz
    check_translation_key "$I18N_FILE" "quiz.waiting"
    check_translation_key "$I18N_FILE" "quiz.loading"
    check_translation_key "$I18N_FILE" "quiz.question"
    check_translation_key "$I18N_FILE" "quiz.gameEnded"
    
    # Clés de leaderboard
    check_translation_key "$I18N_FILE" "leaderboard.title"
    check_translation_key "$I18N_FILE" "leaderboard.subtitle"
    check_translation_key "$I18N_FILE" "leaderboard.loading"
fi

echo ""
echo "🌐 Vérification des langues..."
echo ""

if [ -f "$I18N_FILE" ]; then
    if grep -q "fr:" "$I18N_FILE"; then
        echo -e "${GREEN}✅${NC} Français (fr) présent"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} Français (fr) manquant"
        ((FAILED++))
    fi
    
    if grep -q "en:" "$I18N_FILE"; then
        echo -e "${GREEN}✅${NC} English (en) présent"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} English (en) manquant"
        ((FAILED++))
    fi
    
    if grep -q "ru:" "$I18N_FILE"; then
        echo -e "${GREEN}✅${NC} Русский (ru) présent"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} Русский (ru) manquant"
        ((FAILED++))
    fi
fi

echo ""
echo "📝 Vérification de l'utilisation dans les composants..."
echo ""

# Vérifier que les composants utilisent useI18n
if grep -q "useI18n" "vue/front/src/components/player/PlayerNavbar.vue"; then
    echo -e "${GREEN}✅${NC} PlayerNavbar utilise useI18n"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} PlayerNavbar n'utilise pas useI18n"
    ((FAILED++))
fi

if grep -q "useI18n" "vue/front/src/components/player/PlayerRegister.vue"; then
    echo -e "${GREEN}✅${NC} PlayerRegister utilise useI18n"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} PlayerRegister n'utilise pas useI18n"
    ((FAILED++))
fi

if grep -q "useI18n" "vue/front/src/components/player/QuizPlay.vue"; then
    echo -e "${GREEN}✅${NC} QuizPlay utilise useI18n"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} QuizPlay n'utilise pas useI18n"
    ((FAILED++))
fi

if grep -q "useI18n" "vue/front/src/components/player/Leaderboard.vue"; then
    echo -e "${GREEN}✅${NC} Leaderboard utilise useI18n"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Leaderboard n'utilise pas useI18n"
    ((FAILED++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSULTATS :"
echo -e "   ${GREEN}✅ Réussis : $PASSED${NC}"
echo -e "   ${RED}❌ Échoués : $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Tous les tests sont passés !${NC}"
    echo ""
    echo "📋 PROCHAINES ÉTAPES :"
    echo "   1. Démarrer l'application : npm run dev (ou déployer)"
    echo "   2. Ouvrir l'interface joueur dans le navigateur"
    echo "   3. Tester le sélecteur de langue (🌐) dans la navbar"
    echo "   4. Changer entre les 3 langues et vérifier les traductions"
    echo "   5. Vérifier la persistance (rafraîchir la page)"
    echo ""
    echo "📖 Consulter TEST_I18N.md pour le guide complet de test"
    exit 0
else
    echo -e "${RED}⚠️  Certains tests ont échoué. Veuillez corriger les erreurs.${NC}"
    exit 1
fi

