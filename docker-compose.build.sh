#!/bin/bash
# Script pour builder les images Docker sans BuildKit
# Utilise le build classique de Docker pour éviter les problèmes de "lease does not exist"

echo "🔨 Building Docker images without BuildKit..."
DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker compose build "$@"







