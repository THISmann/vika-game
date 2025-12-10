# Mise à jour du token Telegram

## Problème

Le bot Telegram est en `CrashLoopBackOff` car le token Telegram dans le Secret Kubernetes est toujours la valeur par défaut `YOUR_TELEGRAM_BOT_TOKEN_HERE` au lieu d'un vrai token.

## Solution

### Option 1 : Utiliser le script automatique (Recommandé)

```bash
# Sur la VM
./k8s/scripts/update-telegram-token.sh
```

Le script vous demandera :
1. Votre token Telegram (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
2. Confirmation de la mise à jour
3. Redémarrera automatiquement le pod

### Option 2 : Mise à jour manuelle via kubectl

```bash
# Sur la VM

# 1. Créer ou mettre à jour le Secret avec votre token
kubectl create secret generic telegram-bot-secret \
  --from-literal=TELEGRAM_BOT_TOKEN="VOTRE_TOKEN_ICI" \
  --dry-run=client -o yaml | kubectl apply -f - -n intelectgame

# Remplacez VOTRE_TOKEN_ICI par votre vrai token Telegram
# Format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# 2. Vérifier que le Secret a été mis à jour
kubectl get secret telegram-bot-secret -n intelectgame -o jsonpath='{.data.TELEGRAM_BOT_TOKEN}' | base64 -d
echo ""

# 3. Redémarrer le pod pour qu'il prenne le nouveau token
kubectl rollout restart deployment/telegram-bot -n intelectgame

# 4. Attendre que le pod redémarre
kubectl rollout status deployment/telegram-bot -n intelectgame --timeout=60s

# 5. Vérifier les logs
kubectl logs -n intelectgame -l app=telegram-bot --tail=50
```

### Option 3 : Mise à jour via fichier YAML

```bash
# Sur la VM

# 1. Éditer le fichier k8s/telegram-bot-deployment.yaml
# Remplacer YOUR_TELEGRAM_BOT_TOKEN_HERE par votre vrai token

# 2. Appliquer le Secret
kubectl apply -f k8s/telegram-bot-deployment.yaml -n intelectgame

# 3. Redémarrer le pod
kubectl rollout restart deployment/telegram-bot -n intelectgame
```

## Obtenir un token Telegram

Si vous n'avez pas encore de token Telegram :

1. Ouvrez Telegram et cherchez `@BotFather`
2. Envoyez `/newbot`
3. Suivez les instructions pour créer un nouveau bot
4. BotFather vous donnera un token au format : `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
5. Copiez ce token et utilisez-le dans le script

## Vérification

Après la mise à jour, vérifiez que le bot fonctionne :

```bash
# Sur la VM

# 1. Vérifier l'état du pod
kubectl get pods -n intelectgame -l app=telegram-bot

# Devrait afficher: READY 1/1, STATUS Running

# 2. Vérifier les logs
kubectl logs -n intelectgame -l app=telegram-bot --tail=20

# Ne devrait plus afficher: "❌ TELEGRAM_BOT_TOKEN format invalide!"
# Devrait afficher: "✅ Bot Telegram démarré" ou similaire
```

## Format du token

Le token Telegram doit être au format :
```
123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

Où :
- La première partie (avant `:`) est l'ID du bot (chiffres)
- La deuxième partie (après `:`) est le secret du bot (lettres et chiffres)

## Sécurité

⚠️ **Important** : Ne partagez jamais votre token Telegram publiquement. Le token est stocké dans un Secret Kubernetes qui est chiffré, mais évitez de le commiter dans Git.

## Résumé

Le problème vient du fait que le Secret Kubernetes contient toujours la valeur par défaut `YOUR_TELEGRAM_BOT_TOKEN_HERE`. Il faut :

1. Obtenir un vrai token depuis BotFather
2. Mettre à jour le Secret Kubernetes avec le vrai token
3. Redémarrer le pod pour qu'il prenne le nouveau token

Une fois corrigé, le bot Telegram devrait démarrer correctement et être prêt à recevoir des commandes.

