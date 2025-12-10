# ⚡ Guide Rapide : Exécution des Tests

## 🎯 Commandes Principales

### Tous les Services (Depuis la racine)

```bash
# Depuis la racine du projet
cd /Users/etienne/Documents/GitHub/gameV2

# Exécuter tous les tests
npm run test:all

# Avec couverture de code
npm run test:all:coverage
```

### Un Service Individuel

```bash
# Auth Service
cd node/auth-service
npm test

# Quiz Service
cd node/quiz-service
npm test

# Game Service
cd node/game-service
npm test
```

## ⚠️ Important : Lien Symbolique

Pour que les tests fonctionnent, chaque service doit avoir un lien symbolique vers le dossier `shared` :

```bash
# Créer le lien symbolique (si pas déjà fait)
cd node/auth-service
ln -sf ../shared shared

cd ../quiz-service
ln -sf ../shared shared

cd ../game-service
ln -sf ../shared shared
```

## 📋 Scripts Disponibles

### À la racine

- `npm run test:all` - Exécute tous les tests
- `npm run test:all:coverage` - Tests avec couverture
- `npm run test:integration` - Tests d'intégration (nécessite services démarrés)

### Dans chaque service

- `npm test` - Exécute les tests
- `npm run test:watch` - Mode watch (re-exécute à chaque changement)
- `npm run test:coverage` - Tests avec couverture

## 🔧 Résolution de Problèmes

### Erreur : "Cannot find module '../shared/cache-utils'"

**Solution** : Créer le lien symbolique :
```bash
cd node/auth-service
ln -sf ../shared shared
```

### Erreur : "Missing script: test:all"

**Solution** : Vous êtes dans un service individuel. Utilisez :
- `npm test` depuis le service
- OU `npm run test:all` depuis la racine

### Les tests échouent

1. Vérifier que les dépendances sont installées :
   ```bash
   cd node/auth-service
   npm install
   ```

2. Vérifier que le lien symbolique existe :
   ```bash
   ls -la node/auth-service | grep shared
   # Devrait afficher : shared -> ../shared
   ```

## 📊 Exemple de Sortie

```
🧪 ========== TESTS DES MICROSERVICES ==========

📦 Test du service: auth-service
▶️  Exécution: npm test
✅ Tests de auth-service réussis

📦 Test du service: quiz-service
▶️  Exécution: npm test
✅ Tests de quiz-service réussis

📦 Test du service: game-service
▶️  Exécution: npm test
✅ Tests de game-service réussis

📊 ========== RÉSUMÉ ==========
✅ Réussis: 3
❌ Échoués: 0

🎉 Tous les tests sont passés !
```

## 🚀 Première Installation

Si c'est la première fois que vous exécutez les tests :

```bash
# 1. Installer les dépendances à la racine
npm install

# 2. Créer les liens symboliques
cd node/auth-service && ln -sf ../shared shared && cd ../..
cd node/quiz-service && ln -sf ../shared shared && cd ../..
cd node/game-service && ln -sf ../shared shared && cd ../..

# 3. Installer les dépendances de chaque service
cd node/auth-service && npm install && cd ../..
cd node/quiz-service && npm install && cd ../..
cd node/game-service && npm install && cd ../..

# 4. Exécuter les tests
npm run test:all
```

