#!/bin/bash
# Sur le serveur : évite l'erreur KeyError 'ContainerConfig' de docker-compose 1.29
# en supprimant les conteneurs frontend avant de les recréer.
# Usage (sur le serveur, dans le dossier vika-game) :
#   git pull origin main
#   ./scripts/update-frontends-on-server.sh

set -e

echo "Removing existing frontend containers (avoids ContainerConfig bug)..."
docker rm -f intelectgame-frontend intelectgame-admin-frontend 2>/dev/null || true

echo "Creating frontend and admin-frontend with current docker-compose..."
docker-compose up -d --build --no-deps frontend admin-frontend

echo "Done. Frontends will rebuild and serve (check logs: docker-compose logs -f frontend admin-frontend)."
