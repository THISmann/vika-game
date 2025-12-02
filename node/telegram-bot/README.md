# Telegram Bot Service

Micro-service pour le bot Telegram d'IntelectGame.

## Fonctionnalités

Le bot permet aux utilisateurs de :
- Entrer le code d'une partie
- S'inscrire avec un nom
- Répondre aux questions via Telegram
- Voir leur statut

## Commandes disponibles

- `/start` - Affiche le message de bienvenue
- `/help` - Affiche l'aide
- `/code <CODE>` - Entrer le code de la partie (ex: `/code ABC123`)
- `/register <NOM>` - S'inscrire avec un nom (ex: `/register Jean`)
- `/status` - Voir le statut actuel

## Utilisation

1. L'utilisateur entre le code : `/code ABC123`
2. L'utilisateur s'inscrit : `/register MonNom`
3. L'admin démarre la partie
4. Le bot envoie automatiquement les questions
5. L'utilisateur répond avec 1, 2, 3 ou 4
6. Le bot confirme la réponse et passe à la question suivante

## Configuration

Créer un fichier `.env` :

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
AUTH_SERVICE_URL=http://localhost:3001
QUIZ_SERVICE_URL=http://localhost:3002
GAME_SERVICE_URL=http://localhost:3003
```

## Créer un bot Telegram

1. Ouvrir Telegram et chercher `@BotFather`
2. Envoyer `/newbot`
3. Suivre les instructions pour créer le bot
4. Copier le token reçu
5. L'ajouter dans le fichier `.env` ou dans les secrets Kubernetes

## Déploiement

### Local
```bash
npm install
npm start
```

### Docker
```bash
docker build -t thismann17/intelectgame-telegram-bot:latest .
docker run -e TELEGRAM_BOT_TOKEN=your_token thismann17/intelectgame-telegram-bot:latest
```

### Kubernetes
Le bot est déployé via le fichier `k8s/telegram-bot-deployment.yaml`.
Le token doit être configuré dans le Secret Kubernetes.

