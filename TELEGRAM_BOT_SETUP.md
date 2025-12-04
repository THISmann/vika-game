# 🤖 Configuration du Bot Telegram

## Vue d'ensemble

Le bot Telegram permet aux joueurs de participer au quiz directement depuis Telegram, sans avoir besoin d'ouvrir un navigateur web.

## Fonctionnalités

1. **Démarrage** (`/start`): Le bot demande le code du jeu
2. **Vérification du code**: Le bot vérifie le code via l'API
3. **Inscription**: Le joueur s'inscrit avec son nom
4. **Attente**: Le bot attend que l'admin démarre la partie
5. **Questions**: Le bot envoie automatiquement les questions via WebSocket
6. **Réponses**: Le joueur répond via des boutons inline
7. **Classement**: Le bot affiche le classement final à la fin du jeu

## Configuration

### 1. Obtenir un Token Telegram Bot

1. Ouvrir Telegram et chercher `@BotFather`
2. Envoyer `/newbot`
3. Suivre les instructions pour créer le bot
4. Copier le token reçu (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Configurer le Secret GitHub

1. Aller sur GitHub → Settings → Secrets and variables → Actions
2. Cliquer sur "New repository secret"
3. Nom: `TELEGRAM_BOT_TOKEN`
4. Valeur: Coller le token du bot
5. Cliquer sur "Add secret"

### 3. Déployer le Secret dans Kubernetes

#### Option A: Via Script (Recommandé)

```bash
# Depuis votre machine locale (avec accès à kubectl)
export TELEGRAM_BOT_TOKEN="votre_token_ici"
./k8s/update-telegram-secret.sh
```

#### Option B: Manuellement

```bash
kubectl create secret generic telegram-bot-secret \
  --from-literal=TELEGRAM_BOT_TOKEN="votre_token_ici" \
  --namespace=intelectgame
```

#### Option C: Depuis GitHub Actions (si déploiement automatisé)

Le token est disponible dans les workflows GitHub Actions via `${{ secrets.TELEGRAM_BOT_TOKEN }}`.

### 4. Déployer le Bot

```bash
# Déployer tous les services (inclut le bot)
kubectl apply -f k8s/all-services.yaml

# Vérifier le statut
kubectl get pods -n intelectgame | grep telegram-bot
kubectl logs -f deployment/telegram-bot -n intelectgame
```

## Utilisation

### Pour les Joueurs

1. **Démarrer le bot**: Ouvrir Telegram, chercher votre bot, cliquer sur "Start"
2. **Entrer le code**: Le bot demande le code → Envoyer le code (ex: `ABC123`)
3. **S'inscrire**: Le bot demande le nom → Envoyer votre nom (ex: `Jean`)
4. **Attendre**: Le bot confirme l'inscription et attend le démarrage
5. **Répondre**: Quand la partie démarre, le bot envoie les questions avec des boutons
6. **Classement**: À la fin, le bot affiche le classement final

### Commandes Disponibles

- `/start` - Recommencer (demande le code)
- `/status` - Voir votre statut actuel
- `/help` - Afficher l'aide

## Architecture Technique

### Flux de Communication

```
Joueur Telegram
    │
    ├─→ /start → Bot demande code
    │
    ├─→ Code → Bot vérifie via /game/verify-code
    │
    ├─→ Nom → Bot inscrit via /auth/players/register
    │
    ├─→ WebSocket: register(playerId)
    │
    ├─→ WebSocket: game:started → Bot notifie le joueur
    │
    ├─→ WebSocket: question:next → Bot envoie la question
    │
    ├─→ Bouton réponse → Bot envoie via /game/answer
    │
    └─→ WebSocket: game:ended → Bot affiche le classement
```

### Endpoints API Utilisés

- `POST /game/verify-code` - Vérifier le code du jeu
- `POST /auth/players/register` - Inscrire un joueur
- `POST /game/answer` - Soumettre une réponse
- `GET /game/leaderboard` - Obtenir le classement
- `GET /game/state` - Obtenir l'état du jeu (fallback)
- `GET /quiz/full` - Obtenir toutes les questions

### Événements WebSocket

- `register` (client → serveur) - Enregistrer le joueur
- `game:started` (serveur → client) - Jeu démarré
- `question:next` (serveur → client) - Nouvelle question
- `game:ended` (serveur → client) - Jeu terminé
- `leaderboard:update` (serveur → client) - Mise à jour classement

## Dépannage

### Le bot ne répond pas

```bash
# Vérifier les logs
kubectl logs -f deployment/telegram-bot -n intelectgame

# Vérifier que le token est correct
kubectl get secret telegram-bot-secret -n intelectgame -o jsonpath='{.data.TELEGRAM_BOT_TOKEN}' | base64 -d
```

### Le bot ne reçoit pas les questions

1. Vérifier la connexion WebSocket:
   ```bash
   kubectl logs deployment/telegram-bot -n intelectgame | grep "WebSocket"
   ```

2. Vérifier que le joueur est enregistré:
   ```bash
   kubectl logs deployment/game-service -n intelectgame | grep "register"
   ```

### Le bot ne peut pas se connecter aux services

1. Vérifier les URLs des services:
   ```bash
   kubectl get configmap app-config -n intelectgame -o yaml
   ```

2. Tester la connectivité depuis le pod:
   ```bash
   kubectl exec -it deployment/telegram-bot -n intelectgame -- sh
   # Dans le pod:
   curl http://auth-service:3001/test
   curl http://quiz-service:3002/test
   curl http://game-service:3003/test
   ```

## Variables d'Environnement

Le bot utilise les variables d'environnement suivantes:

- `TELEGRAM_BOT_TOKEN` (requis) - Token du bot Telegram
- `AUTH_SERVICE_URL` - URL du service d'authentification
- `QUIZ_SERVICE_URL` - URL du service de quiz
- `GAME_SERVICE_URL` - URL du service de jeu
- `GAME_WS_URL` - URL WebSocket du service de jeu
- `NODE_ENV` - Environnement (development/production)
- `MONGODB_URI` - URI de connexion MongoDB

## Sécurité

⚠️ **Important**: Ne jamais commiter le token dans le code !

- ✅ Utiliser GitHub Secrets pour le token
- ✅ Utiliser Kubernetes Secrets pour le déploiement
- ✅ Ne jamais logger le token
- ✅ Régénérer le token si compromis

## Améliorations Futures

- [ ] Support de plusieurs langues (i18n)
- [ ] Statistiques personnelles pour chaque joueur
- [ ] Notifications push pour les nouveaux quiz
- [ ] Mode multijoueur en temps réel
- [ ] Intégration avec d'autres plateformes (Discord, WhatsApp)
