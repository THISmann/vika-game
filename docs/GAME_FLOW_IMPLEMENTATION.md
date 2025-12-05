# Implémentation du flux de jeu complet

## ✅ Fonctionnalités implémentées

### 1. Admin - Configuration du temps par question

**Fichier** : `vue/front/src/components/admin/AdminDashboard.vue`

- ✅ Champ pour définir le temps par question (en secondes)
- ✅ Validation : entre 5 et 300 secondes
- ✅ Le temps est envoyé au backend lors du démarrage

**Interface** :
- Champ de saisie pour le temps (défaut: 30 secondes)
- Validation avant le démarrage

### 2. Admin - Partage du code de jeu

**Fichier** : `vue/front/src/components/admin/AdminDashboard.vue`

- ✅ Affichage du code de jeu généré automatiquement
- ✅ Code visible et partageable avec les joueurs
- ✅ Code généré au démarrage du service

### 3. Joueur - Entrée du code de jeu

**Fichier** : `vue/front/src/components/player/PlayerRegister.vue`

- ✅ Champ pour entrer le code de la partie
- ✅ Vérification du code avant l'inscription
- ✅ Validation que le code existe et que le jeu n'a pas commencé
- ✅ Interface en deux étapes :
  1. Vérifier le code
  2. Entrer le nom et s'inscrire

### 4. Joueur - Attente du démarrage

**Fichier** : `vue/front/src/components/player/QuizPlay.vue`

- ✅ Affichage d'un message d'attente si le jeu n'a pas commencé
- ✅ Écoute de l'événement `game:started` via WebSocket
- ✅ Redirection automatique vers les questions quand le jeu démarre

### 5. Timer synchronisé

**Fichier** : `vue/front/src/components/player/QuizPlay.vue`

- ✅ Timer affiché pour chaque question
- ✅ Synchronisation basée sur `questionStartTime` et `questionDuration` du serveur
- ✅ Mise à jour toutes les 100ms pour un affichage fluide
- ✅ Barre de progression visuelle
- ✅ Changement de couleur selon le temps restant :
  - Vert : > 10 secondes
  - Jaune : 5-10 secondes
  - Rouge : < 5 secondes

## 🔄 Flux complet

### Côté Admin

1. **Créer la partie** :
   - Le code de jeu est généré automatiquement
   - Le code s'affiche dans le dashboard

2. **Configurer le temps** :
   - L'admin définit le temps par question (5-300 secondes)
   - Par défaut : 30 secondes

3. **Partager le code** :
   - L'admin partage le code affiché avec les joueurs

4. **Démarrer le jeu** :
   - L'admin clique sur "Démarrer le jeu"
   - Le temps configuré est envoyé au backend
   - Tous les joueurs connectés reçoivent la première question avec le timer

### Côté Joueur

1. **Entrer le code** :
   - Le joueur entre le code de la partie
   - Le code est vérifié côté serveur

2. **S'inscrire** :
   - Si le code est valide et le jeu n'a pas commencé
   - Le joueur entre son nom
   - Le joueur s'inscrit et se connecte au WebSocket

3. **Attendre le démarrage** :
   - Le joueur voit un message d'attente
   - Le joueur attend que l'admin démarre le jeu

4. **Jouer** :
   - Quand l'admin démarre, le joueur reçoit la première question
   - Le timer s'affiche et se synchronise avec le serveur
   - Le joueur répond aux questions
   - Le timer passe automatiquement à la question suivante

## 📝 Endpoints API

### Nouveaux endpoints

- `POST /api/game/verify-code` - Vérifier un code de jeu
  ```json
  {
    "code": "ABC123"
  }
  ```
  Réponse :
  ```json
  {
    "valid": true,
    "gameCode": "ABC123",
    "isStarted": false
  }
  ```

### Endpoints modifiés

- `POST /api/game/start` - Démarrer le jeu avec temps personnalisé
  ```json
  {
    "questionDuration": 30  // en secondes
  }
  ```

## 🔧 Modifications backend

### game.controller.js

- ✅ `startGame()` accepte maintenant `questionDuration` en secondes
- ✅ `verifyGameCode()` - Nouvelle fonction pour vérifier le code
- ✅ `scheduleNextQuestion()` utilise la durée configurée

### game.routes.js

- ✅ Route `POST /verify-code` ajoutée

### gameState.js

- ✅ Utilise un champ `key` au lieu de `_id` pour éviter les erreurs ObjectId

## 🎨 Modifications frontend

### AdminDashboard.vue

- ✅ Champ de saisie pour le temps par question
- ✅ Validation du temps (5-300 secondes)
- ✅ Envoi du temps au backend lors du démarrage

### PlayerRegister.vue

- ✅ Interface en deux étapes
- ✅ Vérification du code avant l'inscription
- ✅ Validation que le jeu n'a pas commencé

### QuizPlay.vue

- ✅ Timer synchronisé avec le serveur
- ✅ Affichage visuel du temps restant
- ✅ Barre de progression

## 🚀 Déploiement

### Backend (game-service)

```bash
# Rebuild l'image
cd node/game-service
docker build -t thismann17/gamev2-game-service:latest .
docker push thismann17/gamev2-game-service:latest

# Sur le serveur
kubectl rollout restart deployment/game-service -n intelectgame
```

### Frontend

```bash
# Rebuild l'image
cd vue
docker build -t thismann17/gamev2-frontend:latest .
docker push thismann17/gamev2-frontend:latest

# Sur le serveur
kubectl rollout restart deployment/frontend -n intelectgame
```

## ✅ Tests

Après le déploiement, testez le flux complet :

1. **Admin** :
   - Connectez-vous au dashboard admin
   - Vérifiez que le code de jeu s'affiche
   - Définissez un temps (ex: 20 secondes)
   - Démarrer le jeu

2. **Joueur** :
   - Allez sur la page d'inscription
   - Entrez le code de la partie
   - Vérifiez que le code est accepté
   - Entrez votre nom
   - Attendez que l'admin démarre
   - Vérifiez que le timer s'affiche correctement

## 📊 Synchronisation du timer

Le timer est synchronisé côté serveur :
- Le serveur envoie `startTime` (timestamp) et `duration` (millisecondes)
- Le client calcule le temps restant : `duration - (Date.now() - startTime)`
- Le timer se met à jour toutes les 100ms
- Tous les joueurs voient le même temps restant

