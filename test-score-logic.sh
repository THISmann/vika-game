#!/bin/bash

# Script de test complet pour la logique de comptage de points
# Ce script teste toute la chaîne : réponse -> sauvegarde -> calcul -> score

BASE_URL="${1:-http://localhost:3003}"
echo "🧪 Test de la logique de comptage de points"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Base URL: $BASE_URL"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour tester une étape
test_step() {
    local step_name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="$4"
    
    echo -e "${YELLOW}📋 Test: $step_name${NC}"
    echo "   URL: $url"
    echo "   Method: $method"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" "$url")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "   ${GREEN}✅ SUCCESS (HTTP $http_code)${NC}"
        echo "   Response: $body" | head -c 200
        echo ""
        echo "$body"
        return 0
    else
        echo -e "   ${RED}❌ FAILED (HTTP $http_code)${NC}"
        echo "   Response: $body"
        return 1
    fi
}

# Étape 1: Vérifier l'état du jeu
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ÉTAPE 1: Vérifier l'état du jeu"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_step "Get game state" "$BASE_URL/game/state"
GAME_STATE=$(echo "$body" | jq -r '.' 2>/dev/null || echo "$body")
echo ""

# Étape 2: Vérifier les joueurs disponibles
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ÉTAPE 2: Vérifier les joueurs disponibles"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_step "Get players" "http://localhost:3001/auth/players"
PLAYERS=$(echo "$body" | jq -r '.' 2>/dev/null || echo "$body")
FIRST_PLAYER_ID=$(echo "$PLAYERS" | jq -r '.[0].id' 2>/dev/null || echo "")
FIRST_PLAYER_NAME=$(echo "$PLAYERS" | jq -r '.[0].name' 2>/dev/null || echo "")
echo "   First player: $FIRST_PLAYER_NAME ($FIRST_PLAYER_ID)"
echo ""

# Étape 3: Vérifier les questions disponibles
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ÉTAPE 3: Vérifier les questions disponibles"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_step "Get questions" "http://localhost:3002/quiz/full"
QUESTIONS=$(echo "$body" | jq -r '.' 2>/dev/null || echo "$body")
FIRST_QUESTION_ID=$(echo "$QUESTIONS" | jq -r '.[0].id' 2>/dev/null || echo "")
FIRST_QUESTION_ANSWER=$(echo "$QUESTIONS" | jq -r '.[0].answer' 2>/dev/null || echo "")
echo "   First question ID: $FIRST_QUESTION_ID"
echo "   First question answer: $FIRST_QUESTION_ANSWER"
echo ""

# Étape 4: Vérifier le score actuel du joueur
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ÉTAPE 4: Vérifier le score actuel du joueur"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -n "$FIRST_PLAYER_ID" ]; then
    test_step "Get player score" "$BASE_URL/game/score/$FIRST_PLAYER_ID"
    CURRENT_SCORE=$(echo "$body" | jq -r '.score' 2>/dev/null || echo "0")
    echo "   Current score: $CURRENT_SCORE"
else
    echo -e "   ${RED}❌ No player ID available${NC}"
fi
echo ""

# Étape 5: Vérifier le leaderboard actuel
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ÉTAPE 5: Vérifier le leaderboard actuel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_step "Get leaderboard" "$BASE_URL/game/leaderboard"
LEADERBOARD=$(echo "$body" | jq -r '.' 2>/dev/null || echo "$body")
echo ""

# Étape 6: Envoyer une réponse (si le jeu est démarré)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ÉTAPE 6: Envoyer une réponse"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -n "$FIRST_PLAYER_ID" ] && [ -n "$FIRST_QUESTION_ID" ] && [ -n "$FIRST_QUESTION_ANSWER" ]; then
    ANSWER_DATA=$(jq -n \
        --arg playerId "$FIRST_PLAYER_ID" \
        --arg questionId "$FIRST_QUESTION_ID" \
        --arg answer "$FIRST_QUESTION_ANSWER" \
        '{playerId: $playerId, questionId: $questionId, answer: $answer}')
    
    test_step "Answer question (correct answer)" "$BASE_URL/game/answer" "POST" "$ANSWER_DATA"
else
    echo -e "   ${YELLOW}⚠️ Missing required data (playerId, questionId, or answer)${NC}"
fi
echo ""

# Étape 7: Vérifier que la réponse a été sauvegardée dans gameState
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ÉTAPE 7: Vérifier l'état du jeu après réponse"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_step "Get game state (after answer)" "$BASE_URL/game/state"
GAME_STATE_AFTER=$(echo "$body" | jq -r '.' 2>/dev/null || echo "$body")
ANSWERS=$(echo "$GAME_STATE_AFTER" | jq -r '.answers' 2>/dev/null || echo "{}")
echo "   Answers in gameState: $ANSWERS"
echo ""

# Étape 8: Vérifier le score après réponse (devrait toujours être 0 car pas encore calculé)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ÉTAPE 8: Vérifier le score après réponse (avant calcul)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -n "$FIRST_PLAYER_ID" ]; then
    test_step "Get player score (after answer, before calculation)" "$BASE_URL/game/score/$FIRST_PLAYER_ID"
    SCORE_AFTER_ANSWER=$(echo "$body" | jq -r '.score' 2>/dev/null || echo "0")
    echo "   Score after answer (before calculation): $SCORE_AFTER_ANSWER"
    echo "   Expected: 0 (score not calculated yet)"
else
    echo -e "   ${RED}❌ No player ID available${NC}"
fi
echo ""

# Étape 9: Simuler le calcul des résultats (appeler nextQuestion pour déclencher calculateQuestionResults)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ÉTAPE 9: Simuler le calcul des résultats (nextQuestion)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}⚠️ Note: Cette étape nécessite que le jeu soit démarré${NC}"
test_step "Next question (triggers score calculation)" "$BASE_URL/game/next" "POST" "{}"
echo ""

# Étape 10: Vérifier le score après calcul
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ÉTAPE 10: Vérifier le score après calcul"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -n "$FIRST_PLAYER_ID" ]; then
    sleep 2  # Attendre un peu pour que le calcul soit terminé
    test_step "Get player score (after calculation)" "$BASE_URL/game/score/$FIRST_PLAYER_ID"
    SCORE_AFTER_CALC=$(echo "$body" | jq -r '.score' 2>/dev/null || echo "0")
    echo "   Score after calculation: $SCORE_AFTER_CALC"
    if [ "$SCORE_AFTER_CALC" != "0" ] && [ "$SCORE_AFTER_CALC" != "null" ]; then
        echo -e "   ${GREEN}✅ Score updated correctly!${NC}"
    else
        echo -e "   ${RED}❌ Score is still 0 - calculation may have failed${NC}"
    fi
else
    echo -e "   ${RED}❌ No player ID available${NC}"
fi
echo ""

# Étape 11: Vérifier le leaderboard final
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ÉTAPE 11: Vérifier le leaderboard final"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_step "Get leaderboard (final)" "$BASE_URL/game/leaderboard"
FINAL_LEADERBOARD=$(echo "$body" | jq -r '.' 2>/dev/null || echo "$body")
echo ""

# Résumé
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSUMÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Player ID: $FIRST_PLAYER_ID"
echo "Player Name: $FIRST_PLAYER_NAME"
echo "Question ID: $FIRST_QUESTION_ID"
echo "Correct Answer: $FIRST_QUESTION_ANSWER"
echo "Score initial: $CURRENT_SCORE"
echo "Score après réponse: $SCORE_AFTER_ANSWER"
echo "Score après calcul: $SCORE_AFTER_CALC"
echo ""
if [ "$SCORE_AFTER_CALC" != "0" ] && [ "$SCORE_AFTER_CALC" != "null" ] && [ -n "$SCORE_AFTER_CALC" ]; then
    echo -e "${GREEN}✅ Le système de comptage de points fonctionne !${NC}"
else
    echo -e "${RED}❌ Le système de comptage de points ne fonctionne pas correctement${NC}"
    echo ""
    echo "Points à vérifier :"
    echo "1. Le jeu est-il démarré ? (isStarted: true)"
    echo "2. La réponse a-t-elle été sauvegardée dans gameState.answers ?"
    echo "3. calculateQuestionResults() est-elle appelée ?"
    echo "4. updateScore() est-elle appelée avec le bon delta ?"
    echo "5. Le score est-il bien sauvegardé dans MongoDB ?"
fi
echo ""

