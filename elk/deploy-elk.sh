#!/bin/bash

# Script de déploiement du stack ELK avec Docker Compose
# Usage: ./elk/deploy-elk.sh

set -e

echo "🚀 Déploiement du stack ELK (Elasticsearch, Logstash, Kibana) avec Docker Compose..."

# Vérifier que Docker est disponible
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier que les fichiers de configuration existent
if [ ! -f "elk/logstash/config/logstash.yml" ]; then
    echo "❌ Fichier elk/logstash/config/logstash.yml introuvable"
    exit 1
fi

if [ ! -f "elk/logstash/pipeline/logstash.conf" ]; then
    echo "❌ Fichier elk/logstash/pipeline/logstash.conf introuvable"
    exit 1
fi

if [ ! -f "elk/filebeat/filebeat.yml" ]; then
    echo "❌ Fichier elk/filebeat/filebeat.yml introuvable"
    exit 1
fi

# Démarrer les services
echo "📦 Démarrage des services ELK..."
docker-compose -f docker-compose.elk.yml up -d

# Attendre qu'Elasticsearch soit prêt
echo "⏳ Attente qu'Elasticsearch soit prêt (peut prendre 2-3 minutes)..."
timeout=300
elapsed=0
while [ $elapsed -lt $timeout ]; do
    if curl -s http://localhost:9200/_cluster/health > /dev/null 2>&1; then
        echo "✅ Elasticsearch est prêt !"
        break
    fi
    echo "   En attente... ($elapsed/$timeout secondes)"
    sleep 10
    elapsed=$((elapsed + 10))
done

if [ $elapsed -ge $timeout ]; then
    echo "⚠️  Elasticsearch n'est pas encore prêt après $timeout secondes"
    echo "   Vérifiez les logs : docker-compose -f docker-compose.elk.yml logs elasticsearch"
fi

# Attendre que Kibana soit prêt
echo "⏳ Attente que Kibana soit prêt..."
timeout=180
elapsed=0
while [ $elapsed -lt $timeout ]; do
    if curl -s http://localhost:5601/api/status > /dev/null 2>&1; then
        echo "✅ Kibana est prêt !"
        break
    fi
    echo "   En attente... ($elapsed/$timeout secondes)"
    sleep 10
    elapsed=$((elapsed + 10))
done

# Afficher le statut
echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "📊 Statut des conteneurs :"
docker-compose -f docker-compose.elk.yml ps

echo ""
echo "🌐 Accès aux services :"
echo "   - Elasticsearch: http://localhost:9200"
echo "   - Kibana: http://localhost:5601"
echo ""
echo "📝 Pour voir les logs :"
echo "   docker-compose -f docker-compose.elk.yml logs -f elasticsearch"
echo "   docker-compose -f docker-compose.elk.yml logs -f logstash"
echo "   docker-compose -f docker-compose.elk.yml logs -f kibana"
echo "   docker-compose -f docker-compose.elk.yml logs -f filebeat"
echo ""
echo "🔍 Pour vérifier les indices Elasticsearch :"
echo "   curl http://localhost:9200/_cat/indices?v"
echo ""
echo "🛑 Pour arrêter les services :"
echo "   docker-compose -f docker-compose.elk.yml down"
echo ""

