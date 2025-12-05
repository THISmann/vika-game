#!/bin/bash

# Script pour diagnostiquer et corriger le problème des fichiers JSON non poussés
# Usage: ./fix-json-files-git.sh

set -e

echo "🔍 Diagnostic des fichiers JSON dans Git..."
echo ""

# 1. Vérifier que les fichiers existent
echo "=== 1. Vérification de l'existence des fichiers ==="
JSON_FILES=(
  "node/auth-service/data/users.json"
  "node/quiz-service/data/questions.json"
  "node/game-service/data/gameState.json"
  "node/game-service/data/scores.json"
)

for file in "${JSON_FILES[@]}"; do
  if [ -f "$file" ]; then
    SIZE=$(ls -lh "$file" | awk '{print $5}')
    echo "✅ $file ($SIZE)"
  else
    echo "❌ $file non trouvé"
  fi
done
echo ""

# 2. Vérifier si les fichiers sont trackés par Git
echo "=== 2. Vérification du tracking Git ==="
for file in "${JSON_FILES[@]}"; do
  if git ls-files --error-unmatch "$file" &>/dev/null; then
    echo "✅ Tracké: $file"
  else
    echo "❌ Non tracké: $file"
  fi
done
echo ""

# 3. Vérifier si les fichiers sont ignorés par .gitignore
echo "=== 3. Vérification du .gitignore ==="
for file in "${JSON_FILES[@]}"; do
  if git check-ignore -q "$file"; then
    echo "❌ Ignoré: $file"
    git check-ignore -v "$file"
  else
    echo "✅ Non ignoré: $file"
  fi
done
echo ""

# 4. Vérifier si les fichiers sont dans le dernier commit
echo "=== 4. Vérification dans HEAD ==="
for file in "${JSON_FILES[@]}"; do
  if git ls-tree -r HEAD --name-only | grep -q "^$file$"; then
    echo "✅ Dans HEAD: $file"
  else
    echo "❌ Pas dans HEAD: $file"
  fi
done
echo ""

# 5. Vérifier les différences
echo "=== 5. Vérification des différences ==="
CHANGES=0
for file in "${JSON_FILES[@]}"; do
  if git diff HEAD -- "$file" | grep -q "^+"; then
    echo "⚠️  Modifications non commitées: $file"
    ((CHANGES++))
  fi
done

if [ $CHANGES -eq 0 ]; then
  echo "✅ Aucune modification non commitée"
fi
echo ""

# 6. Corriger le .gitignore si nécessaire
echo "=== 6. Correction du .gitignore ==="

# Vérifier si les exceptions sont bien placées
if ! grep -q "^!node/auth-service/data/\*\.json$" .gitignore; then
  echo "⚠️  Correction nécessaire dans .gitignore"
  
  # Créer une version corrigée
  cat > /tmp/gitignore_fixed <<'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
# Keep package-lock.json files for reproducible builds (required for npm ci)
!package-lock.json
!package.json
pnpm-debug.log*

# Build outputs
dist/
build/
*.log
*.tgz
*.tar.gz

# Environment variables
.env
.env.local
.env.*.local
.env.production
.env.development

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
*.sublime-project
*.sublime-workspace

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
Desktop.ini

# Testing
coverage/
.nyc_output/
*.lcov
.vitest/

# Temporary files
*.tmp
*.temp
.cache/
.temp/

# Docker
.dockerignore

# Kubernetes
*.kubeconfig

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache
.parcel-cache

# Next.js
.next/
out/

# Nuxt.js
.nuxt/
dist/

# Vue.js
.vite/
dist-ssr/

# TypeScript
*.tsbuildinfo

# Python (if any)
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/

# Database files (if using local DB)
*.db
*.sqlite
*.sqlite3

# Backup files
*.bak
*.backup
*.old

# IMPORTANT: Game data JSON files must be tracked
# These exceptions must come AFTER any general ignore rules
!node/auth-service/data/
!node/auth-service/data/*.json
!node/auth-service/data/.gitkeep
!node/quiz-service/data/
!node/quiz-service/data/*.json
!node/quiz-service/data/.gitkeep
!node/game-service/data/
!node/game-service/data/*.json
!node/game-service/data/.gitkeep

# But ignore other data files that might be generated
*.data
*.dat

# Secrets and credentials
secrets/
*.pem
*.key
*.cert
*.p12
*.pfx

# CI/CD
.github/workflows/*.local.yml

# Misc
*.orig
.sass-cache/
connect.lock
typings/
EOF
  
  # Comparer avec l'original
  if ! diff -q .gitignore /tmp/gitignore_fixed > /dev/null 2>&1; then
    echo "📝 Mise à jour du .gitignore..."
    cp /tmp/gitignore_fixed .gitignore
    echo "✅ .gitignore mis à jour"
  else
    echo "✅ .gitignore déjà correct"
  fi
  rm -f /tmp/gitignore_fixed
else
  echo "✅ .gitignore semble correct"
fi
echo ""

# 7. Forcer l'ajout des fichiers JSON
echo "=== 7. Ajout des fichiers JSON à Git ==="
ADDED=0
for file in "${JSON_FILES[@]}"; do
  if [ -f "$file" ]; then
    # Forcer l'ajout même si ignoré
    git add -f "$file" 2>/dev/null && echo "✅ Ajouté: $file" && ((ADDED++)) || echo "⚠️  Impossible d'ajouter: $file"
  fi
done

# Ajouter les .gitkeep aussi
GITKEEP_FILES=(
  "node/auth-service/data/.gitkeep"
  "node/quiz-service/data/.gitkeep"
  "node/game-service/data/.gitkeep"
)

for file in "${GITKEEP_FILES[@]}"; do
  if [ -f "$file" ]; then
    git add -f "$file" 2>/dev/null && echo "✅ Ajouté: $file" || true
  fi
done

if [ $ADDED -gt 0 ]; then
  echo ""
  echo "📝 $ADDED fichier(s) JSON ajouté(s)"
fi
echo ""

# 8. Statut final
echo "=== 8. Statut final ==="
git status --short node/*/data/*.json node/*/data/.gitkeep .gitignore 2>&1 | head -20

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Diagnostic terminé!"
echo ""
echo "📝 Prochaines étapes:"
echo ""
if git diff --cached --quiet 2>/dev/null; then
  echo "   Aucun changement dans l'index"
  echo ""
  echo "   Si les fichiers ne sont pas poussés, vérifiez:"
  echo "   1. git log --oneline --all -- node/*/data/*.json"
  echo "   2. git push origin main"
else
  echo "   Fichiers prêts à être commités:"
  git status --short node/*/data/*.json node/*/data/.gitkeep .gitignore 2>&1 | head -10
  echo ""
  echo "   Pour créer le commit:"
  echo "   git commit -m 'fix: Ensure JSON data files are tracked in Git'"
  echo "   git push origin main"
fi
echo "═══════════════════════════════════════════════════════════"

