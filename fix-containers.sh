#!/bin/bash
# Script pour résoudre l'erreur KeyError: 'ContainerConfig'

echo "🔧 Résolution de l'erreur KeyError: 'ContainerConfig'..."

# Arrêter les containers
echo "1. Arrêt des containers Traefik et Grafana..."
docker-compose stop traefik grafana

# Supprimer les containers orphelins
echo "2. Suppression des containers orphelins..."
docker rm -f $(docker ps -aq --filter name=traefik) 2>/dev/null || true
docker rm -f $(docker ps -aq --filter name=grafana) 2>/dev/null || true

# Recréer les containers
echo "3. Recréation des containers..."
docker-compose up -d traefik grafana

# Attendre que les containers démarrent
echo "4. Attente du démarrage des containers..."
sleep 8

# Vérifier le statut
echo "5. Vérification du statut..."
docker-compose ps traefik grafana

echo "✅ Terminé !"

