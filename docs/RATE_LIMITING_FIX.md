# Fix: Erreur 429 (Too Many Requests)

## Problème

Le front-end reçoit des erreurs `429 (Too Many Requests)` car il fait trop de requêtes HTTP :
- `AdminDashboard` : Polling toutes les 2 secondes (3 requêtes : state, players/count, players)
- `QuizPlay` : Polling toutes les 1 seconde (1 requête : state)

**Calcul** : 
- AdminDashboard : 3 requêtes × 30 fois/min = 90 requêtes/min
- QuizPlay : 1 requête × 60 fois/min = 60 requêtes/min
- **Total** : 150 requêtes/min par IP → **Dépasse la limite de 100/min**

## Solutions appliquées

### 1. Réduction de la fréquence du polling

**AdminDashboard** : 
- Avant : 2 secondes (90 requêtes/min)
- Après : 5 secondes (36 requêtes/min)

**QuizPlay** :
- Avant : 1 seconde (60 requêtes/min)
- Après : 3 secondes (20 requêtes/min)

### 2. Exclusion de certaines routes du rate limiting

Les routes fréquemment pollées sont maintenant exclues du rate limiting :
- `/game/state`
- `/game/players/count`
- `/game/players`
- `/health`

### 3. Augmentation de la limite du rate limiter

- Avant : 100 requêtes/minute par IP
- Après : 300 requêtes/minute par IP

## Pourquoi pas RabbitMQ ?

**RabbitMQ n'est pas la bonne solution ici** car :

1. **Le problème n'est pas la communication entre services** : Les services backend communiquent déjà bien entre eux.

2. **Le problème est le polling HTTP côté front-end** : Le front-end fait trop de requêtes HTTP au lieu d'utiliser les WebSockets.

3. **RabbitMQ est pour la communication asynchrone entre services** : Il ne résoudrait pas le problème de rate limiting HTTP.

4. **La solution est d'utiliser les WebSockets** : Les événements Socket.io sont déjà en place, il faut juste réduire le polling HTTP.

## Solutions alternatives (si nécessaire)

### Option 1 : Utiliser uniquement WebSocket (recommandé)

Supprimer complètement le polling HTTP et utiliser uniquement les événements WebSocket :
- `game:started` → Démarrage du jeu
- `question:next` → Nouvelle question
- `players:count` → Nombre de joueurs
- `game:ended` → Fin du jeu

**Avantages** :
- ✅ Pas de rate limiting
- ✅ Temps réel
- ✅ Moins de charge serveur

**Inconvénients** :
- ⚠️ Dépend de la connexion WebSocket
- ⚠️ Nécessite une gestion de reconnexion robuste

### Option 2 : Cache côté client

Implémenter un cache côté client pour éviter les requêtes répétées :
- Cache l'état du jeu pendant 2-3 secondes
- Ne fait une requête que si le cache est expiré

### Option 3 : Debouncing/Throttling

Utiliser un système de debouncing/throttling pour limiter les requêtes :
- Regrouper les requêtes multiples en une seule
- Limiter le nombre de requêtes par seconde

## Recommandation

**Utiliser les WebSockets comme source principale** et garder le polling comme filet de sécurité avec une fréquence réduite (5-10 secondes).

## Fichiers modifiés

- `vue/front/src/components/admin/AdminDashboard.vue` - Polling réduit à 5 secondes
- `vue/front/src/components/player/QuizPlay.vue` - Polling réduit à 3 secondes
- `node/api-gateway/server.js` - Routes exclues du rate limiting + limite augmentée

## Test

Après ces modifications :
- ✅ Plus d'erreurs 429
- ✅ Le polling continue mais moins fréquent
- ✅ Les WebSockets restent la source principale d'information
- ✅ Le polling sert de filet de sécurité


