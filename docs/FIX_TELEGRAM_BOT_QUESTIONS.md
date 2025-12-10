# Correction : Les questions ne s'affichent pas dans Telegram

## Problème

Lors du démarrage du jeu, le bot Telegram affiche :
- ✅ "🚀 The game has started!"
- ✅ "⏳ The first question is coming soon..."
- ❌ Mais la question ne vient jamais

## Cause

Le bot Telegram essayait d'appeler `/quiz/full` pour obtenir les détails complets de la question, mais cette route nécessite l'authentification admin. Le bot n'a pas de token admin, donc l'appel échoue silencieusement et retourne un tableau vide, ce qui empêche l'envoi de la question.

## Solution

L'événement WebSocket `question:next` contient déjà toutes les informations nécessaires :
- `question.id`
- `question.question` (le texte de la question)
- `question.choices` (les choix de réponse)

Il n'est donc pas nécessaire d'appeler `/quiz/full`. Le code a été modifié pour :

1. **Utiliser directement les données de l'événement** dans le handler `question:next`
2. **Remplacer `/quiz/full` par `/quiz/all`** dans la fonction `getAllQuestions()` (utilisée pour le fallback)

## Modifications apportées

### 1. Handler `question:next`

**Avant** :
```javascript
const allQuestions = await getAllQuestions(); // Appel à /quiz/full (admin)
const fullQuestion = allQuestions.find(q => q.id === question.id);
```

**Après** :
```javascript
// Utiliser directement la question de l'événement
const fullQuestion = {
  id: question.id,
  question: question.question,
  choices: question.choices || []
};
```

### 2. Fonction `getAllQuestions()`

**Avant** :
```javascript
const url = getApiUrl('/quiz/full'); // Nécessite admin
```

**Après** :
```javascript
const url = getApiUrl('/quiz/all'); // Public
```

## Actions requises

### 1. Rebuild et redéployer le bot Telegram

```bash
# Sur votre machine locale
cd node/telegram-bot
docker build -t thismann17/gamev2-telegram-bot:latest -f Dockerfile .
docker push thismann17/gamev2-telegram-bot:latest

# Sur la VM
kubectl rollout restart deployment/telegram-bot -n intelectgame
kubectl rollout status deployment/telegram-bot -n intelectgame --timeout=120s
```

### 2. Vérifier les logs

```bash
# Sur la VM
kubectl logs -f -n intelectgame -l app=telegram-bot | grep -A 10 "question:next"
```

Vous devriez voir :
- `📝 Question next event received:`
- `✅ Question from event: [texte de la question]`
- `✅ Question sent to [nom du joueur]`

Au lieu de :
- `❌ Question not found: [id]`
- `Error getting questions: Request failed with status code 401`

## Vérification

Après le redéploiement :

1. Démarrez le jeu depuis le dashboard admin
2. Le bot Telegram devrait recevoir l'événement `question:next`
3. La question devrait être envoyée à tous les joueurs enregistrés dans Telegram
4. Les joueurs devraient pouvoir répondre en cliquant sur les boutons

## Résumé

Le problème venait du fait que le bot essayait d'appeler une route admin (`/quiz/full`) sans authentification. La solution est d'utiliser directement les données de l'événement WebSocket `question:next` qui contient déjà toutes les informations nécessaires.

Une fois corrigé, les questions devraient s'afficher correctement dans Telegram lorsque le jeu démarre.

