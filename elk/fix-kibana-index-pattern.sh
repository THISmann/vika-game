#!/bin/bash

# Script pour diagnostiquer et corriger les problèmes d'index pattern dans Kibana
# Usage: ./elk/fix-kibana-index-pattern.sh

set -e

echo "🔍 Diagnostic des index patterns Kibana..."

# Vérifier qu'Elasticsearch est accessible
if ! curl -s http://localhost:9200/_cluster/health > /dev/null 2>&1; then
    echo "❌ Elasticsearch n'est pas accessible"
    exit 1
fi

# Vérifier les indices disponibles
echo ""
echo "📊 Indices disponibles :"
indices=$(curl -s 'http://localhost:9200/_cat/indices/gamev2-*?v' 2>/dev/null | head -5)
if [ -z "$indices" ]; then
    echo "   ⚠️  Aucun index gamev2 trouvé"
    echo "   Les logs n'ont peut-être pas encore été collectés"
else
    echo "$indices"
fi

# Vérifier le mapping d'un index récent
echo ""
echo "📋 Vérification du mapping (champs disponibles) :"
latest_index=$(curl -s 'http://localhost:9200/_cat/indices/gamev2-logs-*?v&s=index:desc' 2>/dev/null | head -1 | awk '{print $3}')
if [ -n "$latest_index" ]; then
    echo "   Index vérifié : $latest_index"
    
    # Vérifier le champ @timestamp
    timestamp_field=$(curl -s "http://localhost:9200/$latest_index/_mapping?pretty" 2>/dev/null | grep -A 5 "@timestamp" | grep "type" | head -1)
    if [ -n "$timestamp_field" ]; then
        echo "   ✅ Champ @timestamp trouvé : $timestamp_field"
    else
        echo "   ⚠️  Champ @timestamp non trouvé"
    fi
    
    # Vérifier les autres champs importants
    echo ""
    echo "   Champs importants disponibles :"
    curl -s "http://localhost:9200/$latest_index/_mapping?pretty" 2>/dev/null | grep -E '"container_name"|"log_level"|"critical_endpoint"|"endpoint_type"' | head -5 || echo "   ⚠️  Certains champs peuvent être manquants"
else
    echo "   ⚠️  Aucun index récent trouvé"
fi

# Vérifier un document exemple
echo ""
echo "📄 Exemple de document :"
if [ -n "$latest_index" ]; then
    sample_doc=$(curl -s "http://localhost:9200/$latest_index/_search?size=1&pretty" 2>/dev/null | grep -A 30 '"hits"' | head -30)
    if [ -n "$sample_doc" ]; then
        echo "$sample_doc" | head -20
    else
        echo "   ⚠️  Aucun document trouvé dans l'index"
    fi
fi

echo ""
echo "✅ Diagnostic terminé"
echo ""
echo "📋 Instructions pour corriger dans Kibana :"
echo ""
echo "1. Ouvrez Kibana : http://localhost:5601"
echo ""
echo "2. Allez dans Management → Stack Management → Index Patterns"
echo ""
echo "3. Si l'index pattern existe, cliquez dessus puis 'Edit'"
echo "   - Vérifiez que le Time field est '@timestamp'"
echo "   - Si '@timestamp' n'existe pas, essayez 'timestamp' ou un autre champ de date"
echo ""
echo "4. Si l'index pattern n'existe pas, créez-le :"
echo "   - Index pattern : gamev2-logs-*"
echo "   - Time field : @timestamp (ou le champ de date disponible)"
echo ""
echo "5. Si vous voyez toujours des erreurs :"
echo "   - Vérifiez que les champs utilisés existent dans vos logs"
echo "   - Utilisez Discover pour voir les champs disponibles"
echo "   - Redémarrez Kibana : docker-compose -f docker-compose.elk.yml restart kibana"
echo ""
echo "📖 Guide complet : elk/FIX_KIBANA_ERRORS.md"
echo ""

