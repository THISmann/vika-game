# Correction du conflit de Secret avec Helm

## Problème

Lors du déploiement avec Helm, l'erreur suivante apparaît :
```
Error: Unable to continue with install: Secret "telegram-bot-secret" in namespace "intelectgame" exists and cannot be imported into the current release: invalid ownership metadata; label validation error: missing key "app.kubernetes.io/managed-by": must be set to "Helm"
```

## Cause

Le Secret `telegram-bot-secret` existe déjà dans le namespace `intelectgame`, mais il a été créé manuellement (via `kubectl` ou un autre script) et n'a pas les labels et annotations nécessaires pour être géré par Helm.

Helm nécessite que les ressources qu'il gère aient :
- Label `app.kubernetes.io/managed-by: Helm`
- Annotation `meta.helm.sh/release-name: <release-name>`
- Annotation `meta.helm.sh/release-namespace: <namespace>`

## Solutions

### Solution 1 : Supprimer le secret existant (recommandé)

```bash
# Supprimer le secret existant
kubectl delete secret telegram-bot-secret -n intelectgame

# Redéployer avec Helm
./k8s/local/scripts/deploy-local.sh
```

### Solution 2 : Utiliser le script de correction

```bash
# Le script vérifie et supprime le secret si nécessaire
./k8s/local/scripts/fix-telegram-secret.sh

# Puis redéployer
./k8s/local/scripts/deploy-local.sh
```

### Solution 3 : Mettre à jour le token après le déploiement

Si le secret est créé par Helm avec un token placeholder, vous pouvez le mettre à jour :

```bash
# Méthode 1 : Éditer directement
kubectl edit secret telegram-bot-secret -n intelectgame
# Modifier la valeur base64 de TELEGRAM_BOT_TOKEN

# Méthode 2 : Recréer le secret (Helm le détectera et le mettra à jour)
kubectl create secret generic telegram-bot-secret \
  --from-literal=TELEGRAM_BOT_TOKEN=<VOTRE_TOKEN> \
  -n intelectgame \
  --dry-run=client -o yaml | kubectl apply -f -
```

## Corrections appliquées

1. **Template Helm modifié** : Le template `telegram-bot.yaml` inclut maintenant les labels et annotations Helm nécessaires.

2. **Script de déploiement amélioré** : Le script `deploy-local.sh` vérifie automatiquement si le secret existe et le supprime si nécessaire avant le déploiement Helm.

3. **Script de correction** : Un nouveau script `fix-telegram-secret.sh` permet de corriger manuellement le problème.

## Prévention

Pour éviter ce problème à l'avenir :
- Toujours créer les secrets via Helm (dans les templates)
- Ou utiliser `kubectl create secret` avec les labels Helm appropriés
- Éviter de créer manuellement des ressources que Helm doit gérer


