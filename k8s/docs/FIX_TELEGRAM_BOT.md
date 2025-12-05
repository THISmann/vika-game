# 🔧 Guide de Résolution - Erreur Telegram Bot 404

## Problème

L'erreur `ETELEGRAM: 404 Not Found` indique que le token Telegram Bot est invalide, incorrect, ou que le bot a été supprimé.

## Diagnostic

### 1. Vérifier le Token dans Kubernetes

```bash
# Vérifier que le secret existe
kubectl get secret telegram-bot-secret -n intelectgame

# Voir le token (décodé)
kubectl get secret telegram-bot-secret -n intelectgame -o jsonpath='{.data.TELEGRAM_BOT_TOKEN}' | base64 -d
echo ""
```

### 2. Vérifier le Format du Token

Le token doit être au format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

```bash
# Tester le token localement
export TELEGRAM_BOT_TOKEN="votre_token_ici"
./k8s/verify-telegram-token.sh
```

### 3. Vérifier le Token avec l'API Telegram

```bash
# Remplacer YOUR_TOKEN par votre token
curl "https://api.telegram.org/botYOUR_TOKEN/getMe"
```

Si vous obtenez `{"ok":true,...}`, le token est valide.
Si vous obtenez `{"ok":false,"error_code":401,...}`, le token est invalide.

## Solutions

### Solution 1: Vérifier le Token depuis GitHub Secrets

1. Aller sur GitHub → Settings → Secrets and variables → Actions
2. Vérifier que `TELEGRAM_BOT_TOKEN` existe et contient le bon token
3. Copier le token

### Solution 2: Régénérer le Token

Si le token est invalide, régénérez-le :

1. Ouvrir Telegram
2. Chercher `@BotFather`
3. Envoyer `/mybots`
4. Sélectionner votre bot
5. Cliquer sur "API Token"
6. Cliquer sur "Revoke current token" puis "Generate new token"
7. Copier le nouveau token

### Solution 3: Mettre à Jour le Secret Kubernetes

```bash
# Option A: Via le script
export TELEGRAM_BOT_TOKEN="nouveau_token_ici"
./k8s/update-telegram-secret.sh

# Option B: Manuellement
kubectl create secret generic telegram-bot-secret \
  --from-literal=TELEGRAM_BOT_TOKEN="nouveau_token_ici" \
  --namespace=intelectgame \
  --dry-run=client -o yaml | kubectl apply -f -

# Redémarrer le pod
kubectl rollout restart deployment/telegram-bot -n intelectgame
```

### Solution 4: Vérifier depuis le Pod

```bash
# Se connecter au pod
kubectl exec -it deployment/telegram-bot -n intelectgame -- sh

# Dans le pod, vérifier la variable d'environnement
echo $TELEGRAM_BOT_TOKEN

# Tester le token
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe"
```

## Vérification Post-Correction

```bash
# Vérifier les logs (ne devrait plus y avoir d'erreurs 404)
kubectl logs -f deployment/telegram-bot -n intelectgame

# Tester le bot depuis Telegram
# 1. Ouvrir Telegram
# 2. Chercher votre bot
# 3. Cliquer sur "Start"
# 4. Le bot devrait répondre
```

## Causes Possibles

1. **Token invalide**: Le token a été révoqué ou est incorrect
2. **Token mal formaté**: Espaces supplémentaires, caractères invalides
3. **Bot supprimé**: Le bot a été supprimé de Telegram
4. **Secret Kubernetes incorrect**: Le secret contient une mauvaise valeur
5. **Token expiré**: Rare, mais possible si le bot a été réinitialisé

## Prévention

- ✅ Toujours vérifier le token avec `verify-telegram-token.sh` avant de déployer
- ✅ Utiliser GitHub Secrets pour stocker le token de manière sécurisée
- ✅ Ne jamais commiter le token dans le code
- ✅ Vérifier les logs après chaque déploiement

