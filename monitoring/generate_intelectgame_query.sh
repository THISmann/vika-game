#!/bin/bash
# Script to generate PromQL query for IntelectGame containers only

# Get all IntelectGame container IDs
IDS=$(docker ps --format "{{.Names}}" | grep intelectgame | while read name; do
    id=$(docker inspect "$name" --format '{{.Id}}')
    echo "/docker/$id"
done)

# Convert to regex pattern
PATTERN=$(echo "$IDS" | python3 -c "
import sys
ids = [line.strip().replace('/', '\\/') for line in sys.stdin if line.strip()]
if ids:
    print('|'.join(ids))
else:
    print('')
")

if [ -z "$PATTERN" ]; then
    echo "No IntelectGame containers found"
    exit 1
fi

# Generate queries
echo "# Active Containers Count"
echo "count(container_last_seen{id=~\"($PATTERN)\"})"
echo ""
echo "# Container List"
echo "container_last_seen{id=~\"($PATTERN)\"}"
echo ""
echo "# CPU Usage"
echo "rate(container_cpu_usage_seconds_total{id=~\"($PATTERN)\"}[5m]) * 100"
echo ""
echo "# Memory Usage"
echo "container_memory_usage_bytes{id=~\"($PATTERN)\"}"

