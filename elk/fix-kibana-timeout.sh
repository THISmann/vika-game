#!/bin/bash

# Script pour corriger les problèmes de timeout Kibana
# Usage: ./elk/fix-kibana-timeout.sh

set -e

echo "🔧 Correction des problèmes de timeout Kibana..."

# Arrêter les services
echo "⏹️  Arrêt des services ELK..."
docker-compose -f docker-compose.elk.yml stop kibana logstash

# Attendre qu'Elasticsearch soit complètement prêt
echo "⏳ Attente qu'Elasticsearch soit complètement prêt..."
timeout=300
elapsed=0
while [ $elapsed -lt $timeout ]; do
    health=$(curl -s http://localhost:9200/_cluster/health?pretty 2>/dev/null | grep -o '"status" : "[^"]*"' | cut -d'"' -f4)
    if [ "$health" = "green" ] || [ "$health" = "yellow" ]; then
        echo "✅ Elasticsearch est prêt (status: $health)"
        break
    fi
    echo "   En attente... ($elapsed/$timeout secondes) - Status: $health"
    sleep 10
    elapsed=$((elapsed + 10))
done

# Vérifier que les indices Kibana existent
echo "📋 Vérification des indices Kibana..."
indices=$(curl -s http://localhost:9200/_cat/indices/.kibana* 2>/dev/null | wc -l)
if [ "$indices" -eq 0 ]; then
    echo "⚠️  Les indices Kibana n'existent pas encore. Ils seront créés au démarrage."
else
    echo "✅ Indices Kibana trouvés: $indices"
fi

# Redémarrer Kibana
echo "🚀 Redémarrage de Kibana..."
docker-compose -f docker-compose.elk.yml up -d kibana

# Attendre que Kibana soit prêt
echo "⏳ Attente que Kibana soit prêt..."
timeout=300
elapsed=0
while [ $elapsed -lt $timeout ]; do
    if curl -s http://localhost:5601/api/status > /dev/null 2>&1; then
        status=$(curl -s http://localhost:5601/api/status 2>/dev/null | grep -o '"overall"[^,]*' | cut -d'"' -f4 || echo "unknown")
        if [ "$status" = "available" ] || [ "$status" = "degraded" ]; then
            echo "✅ Kibana est accessible (status: $status)"
            break
        fi
    fi
    echo "   En attente... ($elapsed/$timeout secondes)"
    sleep 10
    elapsed=$((elapsed + 10))
done

# Redémarrer Logstash
echo "🚀 Redémarrage de Logstash..."
docker-compose -f docker-compose.elk.yml up -d logstash

echo ""
echo "✅ Correction terminée !"
echo ""
echo "📊 Statut des services :"
docker-compose -f docker-compose.elk.yml ps
echo ""
echo "🌐 Accès à Kibana : http://localhost:5601"
echo ""
echo "📝 Pour voir les logs :"
echo "   docker-compose -f docker-compose.elk.yml logs -f kibana"
echo ""

