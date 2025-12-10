#!/bin/bash

# Script pour tester la configuration Nginx avant de la déployer
# Usage: ./k8s/scripts/test-nginx-config.sh

set -e

echo "🧪 Test de la configuration Nginx..."
echo ""

# Extraire la configuration depuis le fichier YAML
CONFIG_FILE="k8s/nginx-proxy-config.yaml"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Fichier $CONFIG_FILE non trouvé"
    exit 1
fi

# Extraire la configuration Nginx du YAML
echo "📝 Extraction de la configuration..."
NGINX_CONFIG=$(grep -A 1000 "nginx.conf: |" "$CONFIG_FILE" | sed '1d' | sed 's/^    //')

# Créer un fichier temporaire
TEMP_FILE=$(mktemp)
echo "$NGINX_CONFIG" > "$TEMP_FILE"

# Tester avec un conteneur Docker temporaire
echo "🔍 Test de la syntaxe Nginx..."
if docker run --rm -v "$TEMP_FILE:/tmp/nginx.conf:ro" nginx:alpine nginx -t -c /tmp/nginx.conf 2>&1; then
    echo ""
    echo "✅ Configuration Nginx valide !"
    rm -f "$TEMP_FILE"
    exit 0
else
    echo ""
    echo "❌ Configuration Nginx invalide"
    echo ""
    echo "📋 Configuration testée:"
    echo "$NGINX_CONFIG" | head -50
    rm -f "$TEMP_FILE"
    exit 1
fi

