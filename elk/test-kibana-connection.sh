#!/bin/bash

# Script pour tester la connexion Kibana et vérifier les index patterns
# Usage: ./elk/test-kibana-connection.sh

set -e

echo "🔍 Test de connexion Kibana..."

# Vérifier que Kibana est accessible
if ! curl -s http://localhost:5601/api/status > /dev/null 2>&1; then
    echo "❌ Kibana n'est pas accessible sur http://localhost:5601"
    echo "   Démarrez Kibana : docker-compose -f docker-compose.elk.yml up -d kibana"
    exit 1
fi

echo "✅ Kibana est accessible"

# Vérifier qu'Elasticsearch est accessible
if ! curl -s http://localhost:9200/_cluster/health > /dev/null 2>&1; then
    echo "❌ Elasticsearch n'est pas accessible"
    exit 1
fi

echo "✅ Elasticsearch est accessible"

# Vérifier les indices
echo ""
echo "📊 Indices disponibles :"
latest_index=$(curl -s 'http://localhost:9200/_cat/indices/gamev2-logs-*?v&s=index:desc' 2>/dev/null | head -1 | awk '{print $3}')
if [ -n "$latest_index" ]; then
    echo "   ✅ Dernier index : $latest_index"
    
    # Vérifier le champ @timestamp
    echo ""
    echo "📋 Vérification du champ @timestamp :"
    timestamp_check=$(curl -s "http://localhost:9200/$latest_index/_mapping?pretty" 2>/dev/null | grep -A 2 '"@timestamp"' | grep '"type"' | head -1)
    if [ -n "$timestamp_check" ]; then
        echo "   ✅ $timestamp_check"
    else
        echo "   ⚠️  Champ @timestamp non trouvé dans le mapping"
    fi
    
    # Compter les documents
    doc_count=$(curl -s "http://localhost:9200/$latest_index/_count" 2>/dev/null | grep -o '"count":[0-9]*' | cut -d: -f2)
    echo "   📄 Documents dans l'index : $doc_count"
else
    echo "   ⚠️  Aucun index gamev2-logs-* trouvé"
fi

# Vérifier un document exemple
echo ""
echo "📄 Exemple de document (premiers champs) :"
if [ -n "$latest_index" ]; then
    sample_fields=$(curl -s "http://localhost:9200/$latest_index/_search?size=1&_source=@timestamp,message,container_name,log_level&pretty" 2>/dev/null | grep -E '"@timestamp"|"message"|"container_name"|"log_level"' | head -5)
    if [ -n "$sample_fields" ]; then
        echo "$sample_fields"
    else
        echo "   ⚠️  Impossible de récupérer un document exemple"
    fi
fi

echo ""
echo "✅ Tests terminés"
echo ""
echo "🌐 Accès à Kibana : http://localhost:5601"
echo ""
echo "📋 Pour créer un index pattern :"
echo "   1. Management → Stack Management → Index Patterns"
echo "   2. Create index pattern : gamev2-logs-*"
echo "   3. Time field : @timestamp"
echo ""
echo "📖 Guide détaillé : elk/create-index-pattern-step-by-step.md"
echo ""

