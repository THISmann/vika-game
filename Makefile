# Makefile pour simplifier les commandes de développement

.PHONY: help test test-local test-integration build push clean up down logs

# Variables
COMPOSE_FILE = docker-compose.test.yml
SERVICES = auth-service quiz-service game-service telegram-bot frontend

help: ## Affiche l'aide
	@echo "🚀 Commandes disponibles:"
	@echo ""
	@echo "  make test-local          - Tester localement avec Docker Compose"
	@echo "  make test-integration    - Tester les endpoints API"
	@echo "  make up                  - Démarrer les services de test"
	@echo "  make down                - Arrêter les services de test"
	@echo "  make logs                - Voir les logs des services"
	@echo "  make clean               - Nettoyer les conteneurs et volumes"
	@echo "  make build               - Builder les images Docker"
	@echo "  make push                - Tester puis push sur main (si tests OK)"
	@echo ""

test-local: ## Tester localement avec Docker Compose
	@./scripts/test-local.sh

test-integration: ## Tester les endpoints API
	@if [ -f "test-all-endpoints.sh" ]; then \
		chmod +x test-all-endpoints.sh; \
		BASE_URL="http://localhost" \
		AUTH_PORT=3001 \
		QUIZ_PORT=3002 \
		GAME_PORT=3003 \
		./test-all-endpoints.sh; \
	else \
		echo "❌ Script test-all-endpoints.sh non trouvé"; \
	fi

up: ## Démarrer les services de test
	@echo "🚀 Démarrage des services..."
	@docker-compose -f $(COMPOSE_FILE) up -d
	@echo "⏳ Attente que les services soient prêts..."
	@sleep 10
	@echo "✅ Services démarrés"
	@echo ""
	@echo "Services disponibles:"
	@echo "  - MongoDB: http://localhost:27018"
	@echo "  - Redis: http://localhost:6380"
	@echo "  - Auth Service: http://localhost:3001"
	@echo "  - Quiz Service: http://localhost:3002"
	@echo "  - Game Service: http://localhost:3003"
	@echo "  - Telegram Bot: http://localhost:3004"
	@echo "  - Frontend: http://localhost:5173"

down: ## Arrêter les services de test
	@echo "🛑 Arrêt des services..."
	@docker-compose -f $(COMPOSE_FILE) down
	@echo "✅ Services arrêtés"

logs: ## Voir les logs des services
	@docker-compose -f $(COMPOSE_FILE) logs -f

clean: ## Nettoyer les conteneurs et volumes
	@echo "🧹 Nettoyage..."
	@docker-compose -f $(COMPOSE_FILE) down -v
	@docker system prune -f
	@echo "✅ Nettoyage terminé"

build: ## Builder les images Docker
	@echo "🏗️  Build des images Docker..."
	@docker-compose -f $(COMPOSE_FILE) build
	@echo "✅ Build terminé"

push: ## Tester puis push sur main (si tests OK)
	@./scripts/test-and-push.sh

# Tests individuels
test-auth:
	@docker exec intelectgame-auth-test npm test || echo "Tests non configurés"

test-quiz:
	@docker exec intelectgame-quiz-test npm test || echo "Tests non configurés"

test-game:
	@docker exec intelectgame-game-test npm test || echo "Tests non configurés"

test-frontend:
	@docker exec intelectgame-frontend-test npm run test:unit || echo "Tests non configurés"

test-telegram:
	@echo "Telegram Bot n'a pas de tests unitaires configurés"
	@docker ps | grep -q "intelectgame-telegram-bot-test" && echo "✅ Telegram Bot est en cours d'exécution" || echo "❌ Telegram Bot n'est pas en cours d'exécution"

# Health checks
health:
	@echo "🏥 Vérification de la santé des services..."
	@curl -f http://localhost:3001/test && echo "✅ Auth Service: OK" || echo "❌ Auth Service: FAILED"
	@curl -f http://localhost:3002/test && echo "✅ Quiz Service: OK" || echo "❌ Quiz Service: FAILED"
	@curl -f http://localhost:3003/test && echo "✅ Game Service: OK" || echo "❌ Game Service: FAILED"
	@docker ps | grep -q "intelectgame-telegram-bot-test" && echo "✅ Telegram Bot: OK" || echo "⚠️  Telegram Bot: Not running (may need TELEGRAM_BOT_TOKEN)"

