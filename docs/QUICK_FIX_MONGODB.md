# 🔧 Correction rapide des erreurs MongoDB

## 🔍 Problèmes identifiés

1. **`Command requires authentication`** - MongoDB a été initialisé avec des credentials mais les services se connectent sans
2. **`Cast to ObjectId failed for value "current"`** - Le modèle GameState utilise un _id invalide

## ✅ Solutions

### Option 1: Supprimer les données et redémarrer (recommandé si pas de données importantes)

```bash
./fix-mongodb-complete.sh
```

**Ce script** :
- Supprime MongoDB et toutes les données
- Redéploie MongoDB sans authentification
- Redémarre tous les services
- ✅ **Résout les deux problèmes**

### Option 2: Garder les données (utiliser l'URI avec credentials)

```bash
./fix-mongodb-keep-data.sh
```

**Ce script** :
- Met à jour le ConfigMap avec l'URI avec credentials
- Redémarre tous les services
- ✅ **Résout le problème d'authentification**
- ⚠️ **Nécessite aussi de rebuild game-service pour le modèle GameState**

## 🚀 Correction complète (recommandée)

### Étape 1: Corriger MongoDB

```bash
# Sur le serveur
./fix-mongodb-complete.sh
```

### Étape 2: Rebuild game-service (pour le modèle GameState corrigé)

```bash
# Sur votre machine locale
cd node/game-service
docker build -t thismann17/gamev2-game-service:latest .
docker push thismann17/gamev2-game-service:latest

# Sur le serveur
kubectl rollout restart deployment/game-service -n intelectgame
```

### Étape 3: Vérifier

```bash
# Vérifier les logs
kubectl logs -n intelectgame deployment/auth-service | grep MongoDB
kubectl logs -n intelectgame deployment/quiz-service | grep MongoDB
kubectl logs -n intelectgame deployment/game-service | grep MongoDB

# Tester les endpoints
./test-all-endpoints.sh http://82.202.141.248
```

## 📝 Changements appliqués

### 1. MongoDB sans authentification
- **Fichier** : `k8s/mongodb-deployment.yaml`
- **Changement** : Suppression des variables d'environnement d'authentification
- **Résultat** : MongoDB accepte les connexions sans credentials

### 2. Modèle GameState corrigé
- **Fichier** : `node/game-service/models/GameState.js`
- **Changement** : Utilise un champ `key: 'current'` au lieu de `_id: 'current'`
- **Résultat** : Plus d'erreur de cast ObjectId

## ⚠️ Important

- **Option 1** supprime toutes les données MongoDB (utilisateurs, questions, scores)
- **Option 2** garde les données mais nécessite un rebuild de game-service
- Après la correction, tous les services doivent être redémarrés

## ✅ Résultat attendu

Après la correction, vous devriez voir :
- ✅ `MongoDB connected (service-name)` dans les logs
- ✅ Plus d'erreurs `Command requires authentication`
- ✅ Plus d'erreurs `Cast to ObjectId failed`
- ✅ Les endpoints retournent 200 au lieu de 500

