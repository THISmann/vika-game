#!/bin/bash
# Script pour démarrer les services Docker sans BuildKit
# Utilise le build classique de Docker pour éviter les problèmes de "lease does not exist"

echo "🚀 Starting Docker services without BuildKit..."
DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker compose up -d --build "$@"




