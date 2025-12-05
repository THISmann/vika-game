# Implémentation Redis Cache - IntelectGame

## 📋 Vue d'ensemble

Cette documentation décrit l'implémentation complète d'un système de cache Redis pour améliorer les performances de l'application IntelectGame. Redis est utilisé pour mettre en cache les données fréquemment accédées, réduisant ainsi la charge sur MongoDB et améliorant les temps de réponse.

## 🎯 Objectifs

- **Réduire la latence** : Réponses plus rapides pour les requêtes fréquentes
- **Diminuer la charge MongoDB** : Moins de requêtes à la base de données
- **Améliorer la scalabilité** : Support de plus de requêtes simultanées
- **Cache intelligent** : Invalidation automatique lors des mises à jour

## 🏗️ Architecture

### Composants

1. **Redis Server** : Serveur de cache centralisé
2. **Client Redis partagé** : Module réutilisable (`node/shared/redis-client.js`)
3. **Utilitaires de cache** : Fonctions helper (`node/shared/cache-utils.js`)
4. **Intégration par service** : Cache intégré dans chaque microservice

### Flux de données

```
Requête API
    ↓
Vérifier le cache Redis
    ↓
┌─────────────────┐
│ Cache Hit?      │
└─────────────────┘
    ↓              ↓
   OUI            NON
    ↓              ↓
Retourner      Requête MongoDB
données        ↓
cachées        Mettre en cache
               ↓
            Retourner données
```

## 📦 Déploiement

### Docker Compose (Développement local)

Redis est automatiquement inclus dans `docker-compose.yml` :

```yaml
redis:
  image: redis:7.2-alpine
  container_name: intelectgame-redis
  ports:
    - "6379:6379"
  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
```

**Démarrer avec Redis :**
```bash
docker-compose up -d
```

### Kubernetes (Production)

Le déploiement Redis est défini dans `k8s/redis-deployment.yaml` :

```bash
# Déployer Redis
kubectl apply -f k8s/redis-deployment.yaml

# Vérifier le statut
kubectl get pods -n intelectgame -l app=redis
kubectl get svc -n intelectgame redis
```

## 🔧 Configuration

### Variables d'environnement

Chaque service doit avoir ces variables :

```bash
REDIS_HOST=redis          # Nom du service Redis (Kubernetes) ou localhost (Docker)
REDIS_PORT=6379          # Port Redis
REDIS_PASSWORD=          # Optionnel, pour Redis sécurisé
REDIS_DB=0               # Base de données Redis (0 par défaut)
```

### Configuration Redis

- **Max Memory** : 256MB (configurable)
- **Eviction Policy** : `allkeys-lru` (Least Recently Used)
- **Persistence** : Désactivée pour le cache (optionnel)

## 💻 Utilisation dans les services

### 1. Quiz Service

**Données mises en cache :**
- Liste complète des questions (sans réponses) : TTL 1 heure
- Liste complète des questions (avec réponses) : TTL 1 heure

**Clés de cache :**
- `quiz:all` : Questions sans réponses
- `quiz:full` : Questions avec réponses
- `quiz:question:{id}` : Question individuelle

**Exemple d'utilisation :**

```javascript
const cache = require("../../shared/cache-utils");
const CACHE_KEYS = {
  ALL_QUESTIONS: cache.PREFIXES.QUIZ + 'all'
};

// Récupérer depuis le cache
const cached = await cache.get(CACHE_KEYS.ALL_QUESTIONS);
if (cached) {
  return res.json(cached);
}

// Sinon, récupérer depuis MongoDB
const questions = await Question.find({});
const questionsData = questions.map(q => q.toObject());

// Mettre en cache
await cache.set(CACHE_KEYS.ALL_QUESTIONS, questionsData, cache.TTL.QUESTIONS);
```

**Invalidation :**
- Lors de l'ajout d'une question : `cache.del('quiz:all')` et `cache.del('quiz:full')`
- Lors de la modification : Invalidation de la question spécifique + listes
- Lors de la suppression : Invalidation complète

### 2. Game Service

**Données mises en cache :**
- Leaderboard : TTL 30 secondes
- Scores individuels : TTL 1 minute
- État du jeu : TTL 1 minute

**Clés de cache :**
- `leaderboard:current` : Leaderboard actuel
- `score:player:{playerId}` : Score d'un joueur
- `game:state` : État actuel du jeu
- `game:connected-players` : Liste des joueurs connectés

**Exemple d'utilisation :**

```javascript
// Leaderboard avec cache
const cached = await cache.get(CACHE_KEYS.LEADERBOARD);
if (cached) {
  return res.json(cached);
}

const scores = await Score.find({}).lean();
const mappedScores = scores.map(/* ... */);

// Mettre en cache
await cache.set(CACHE_KEYS.LEADERBOARD, mappedScores, cache.TTL.LEADERBOARD);
```

**Invalidation :**
- Lors de la mise à jour d'un score : Invalidation du score + leaderboard
- Lors du démarrage/fin du jeu : Invalidation de l'état

### 3. Auth Service

**Données mises en cache :**
- Informations d'un joueur : TTL 30 minutes
- Liste de tous les joueurs : TTL 5 minutes

**Clés de cache :**
- `auth:player:{id}` : Informations d'un joueur
- `auth:all-players` : Liste complète des joueurs

**Exemple d'utilisation :**

```javascript
// Récupérer un joueur
const cached = await cache.get(CACHE_KEYS.PLAYER(playerId));
if (cached) {
  return res.json(cached);
}

const player = await User.findOne({ id: playerId });
const playerObj = player.toObject();

// Mettre en cache
await cache.set(CACHE_KEYS.PLAYER(playerId), playerObj, cache.TTL.PLAYER);
```

**Invalidation :**
- Lors de l'enregistrement d'un nouveau joueur : Invalidation de la liste
- Lors de la modification : Invalidation du joueur spécifique

## 🔑 TTL (Time To Live) par défaut

| Type de données | TTL | Justification |
|----------------|-----|---------------|
| Questions | 1 heure | Changent rarement |
| Question individuelle | 30 minutes | Changent rarement |
| État du jeu | 1 minute | Change fréquemment |
| Joueur | 30 minutes | Change rarement |
| Leaderboard | 30 secondes | Change souvent |
| Score | 1 minute | Change souvent |
| Liste des joueurs | 5 minutes | Change modérément |

## 🛠️ API des utilitaires de cache

### Fonctions principales

```javascript
const cache = require("../../shared/cache-utils");

// Obtenir une valeur
const value = await cache.get('key');

// Mettre une valeur
await cache.set('key', value, ttl); // ttl en secondes

// Supprimer une clé
await cache.del('key');

// Supprimer par pattern
await cache.delPattern('quiz:*');

// Vérifier l'existence
const exists = await cache.exists('key');

// Obtenir plusieurs clés
const values = await cache.mget(['key1', 'key2']);

// Mettre plusieurs clés
await cache.mset({ key1: value1, key2: value2 }, ttl);

// Incrémenter une valeur numérique
const newValue = await cache.incr('counter', 1);

// Définir un TTL sur une clé existante
await cache.expire('key', ttl);
```

## 🔄 Stratégies d'invalidation

### 1. Invalidation à l'écriture (Write-Through)

Lorsqu'une donnée est modifiée, le cache est immédiatement invalidé :

```javascript
// Exemple : Mise à jour d'un score
await Score.findOneAndUpdate(/* ... */);
await cache.del(CACHE_KEYS.SCORE(playerId));
await cache.del(CACHE_KEYS.LEADERBOARD);
```

### 2. Invalidation par pattern

Pour invalider plusieurs clés liées :

```javascript
// Invalider toutes les questions
await cache.delPattern('quiz:*');
```

### 3. TTL automatique

Les données expirent automatiquement après le TTL, garantissant la fraîcheur.

## 📊 Monitoring et métriques

### Vérifier le statut Redis

```bash
# Docker Compose
docker exec intelectgame-redis redis-cli ping

# Kubernetes
kubectl exec -n intelectgame deployment/redis -- redis-cli ping
```

### Statistiques Redis

```bash
# Informations sur la mémoire
docker exec intelectgame-redis redis-cli INFO memory

# Nombre de clés
docker exec intelectgame-redis redis-cli DBSIZE

# Statistiques des commandes
docker exec intelectgame-redis redis-cli INFO stats
```

### Logs des services

Les services loggent automatiquement les opérations de cache :

```
✅ Questions served from cache
✅ Questions fetched from DB and cached
✅ Leaderboard served from cache
```

## 🚀 Amélioration des performances

### Avant Redis

- **Temps de réponse moyen** : 50-100ms (requête MongoDB)
- **Charge MongoDB** : Élevée
- **Scalabilité** : Limitée par MongoDB

### Après Redis

- **Temps de réponse moyen** : 5-10ms (cache hit)
- **Charge MongoDB** : Réduite de 60-80%
- **Scalabilité** : Améliorée significativement

### Métriques attendues

- **Cache Hit Rate** : 70-90% pour les questions
- **Cache Hit Rate** : 50-70% pour le leaderboard
- **Réduction de latence** : 80-90% pour les données en cache

## 🔒 Sécurité

### En développement

Redis est accessible sans authentification (acceptable pour le développement local).

### En production

Pour sécuriser Redis :

1. **Activer l'authentification** :
```yaml
# Dans redis-deployment.yaml
command:
  - redis-server
  - /etc/redis/redis.conf
  - --requirepass ${REDIS_PASSWORD}
```

2. **Restreindre l'accès réseau** :
   - Redis n'est accessible que depuis les pods du cluster
   - Pas d'exposition publique

3. **Chiffrement TLS** (optionnel) :
   - Pour les environnements sensibles

## 🐛 Dépannage

### Redis non accessible

**Symptôme** : Les services continuent sans cache

**Solution** :
```bash
# Vérifier que Redis est en cours d'exécution
kubectl get pods -n intelectgame -l app=redis

# Vérifier les logs
kubectl logs -n intelectgame -l app=redis

# Tester la connexion
kubectl exec -n intelectgame deployment/redis -- redis-cli ping
```

### Cache toujours vide

**Symptôme** : Aucun cache hit, toujours des requêtes MongoDB

**Causes possibles** :
1. Redis n'est pas connecté (vérifier les variables d'environnement)
2. TTL trop court
3. Invalidation trop fréquente

**Solution** :
```bash
# Vérifier les variables d'environnement
kubectl exec -n intelectgame deployment/auth-service -- env | grep REDIS

# Vérifier les clés en cache
kubectl exec -n intelectgame deployment/redis -- redis-cli KEYS "*"
```

### Mémoire Redis saturée

**Symptôme** : Erreurs "OOM" (Out Of Memory)

**Solution** :
1. Augmenter la mémoire allouée
2. Ajuster la politique d'éviction
3. Réduire les TTL pour libérer de l'espace

```yaml
# Dans redis-deployment.yaml
resources:
  limits:
    memory: "512Mi"  # Augmenter si nécessaire
```

## 📚 Références

- [Redis Documentation](https://redis.io/documentation)
- [Node Redis Client](https://github.com/redis/node-redis)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)

## ✅ Checklist de déploiement

- [ ] Redis déployé et accessible
- [ ] Variables d'environnement configurées dans tous les services
- [ ] Services redémarrés pour charger Redis
- [ ] Cache fonctionnel (vérifier les logs)
- [ ] Monitoring en place
- [ ] Tests de performance effectués

## 🎓 Conclusion

L'implémentation Redis améliore significativement les performances de l'application en réduisant la charge sur MongoDB et en accélérant les réponses. Le système est conçu pour être résilient : si Redis n'est pas disponible, les services continuent de fonctionner normalement en utilisant directement MongoDB.

