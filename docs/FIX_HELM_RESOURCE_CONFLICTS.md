# Correction des conflits de ressources avec Helm

## Problème

Lors du déploiement avec Helm, des erreurs apparaissent indiquant que des ressources existent déjà mais ne sont pas gérées par Helm :
```
Error: Unable to continue with install: ConfigMap "app-config" in namespace "intelectgame" exists and cannot be imported into the current release: invalid ownership metadata
```

## Cause

Les ressources (ConfigMap, Secret, etc.) ont été créées manuellement (via `kubectl` ou d'autres scripts) et n'ont pas les labels et annotations Helm nécessaires :
- Label `app.kubernetes.io/managed-by: Helm`
- Annotation `meta.helm.sh/release-name: <release-name>`
- Annotation `meta.helm.sh/release-namespace: <namespace>`

## Solutions appliquées

### 1. Templates Helm mis à jour

Tous les templates Helm incluent maintenant les labels et annotations nécessaires via le fichier `_helpers.tpl` :
- `configmap.yaml` : ConfigMap `app-config`
- `telegram-bot.yaml` : Secret `telegram-bot-secret`
- Tous les Deployments et Services

### 2. Script de nettoyage automatique

Le script `deploy-local.sh` vérifie et supprime automatiquement les ressources existantes qui ne sont pas gérées par Helm avant le déploiement.

### 3. Script de nettoyage manuel

Un script `pre-deploy-cleanup.sh` permet de nettoyer manuellement les ressources avant le déploiement.

## Utilisation

### Déploiement automatique (recommandé)

Le script `deploy-local.sh` gère automatiquement le nettoyage :

```bash
./k8s/local/scripts/deploy-local.sh
```

### Nettoyage manuel

Si vous préférez nettoyer manuellement avant le déploiement :

```bash
# Option 1 : Script de nettoyage
./k8s/local/scripts/pre-deploy-cleanup.sh

# Option 2 : Suppression manuelle
kubectl delete configmap app-config -n intelectgame
kubectl delete secret telegram-bot-secret -n intelectgame

# Puis déployer
./k8s/local/scripts/deploy-local.sh
```

## Prévention

Pour éviter ce problème à l'avenir :
- **Toujours créer les ressources via Helm** (dans les templates)
- **Éviter de créer manuellement** des ressources que Helm doit gérer
- **Utiliser `kubectl apply` avec les labels Helm** si vous devez créer des ressources manuellement

## Vérification

Après le déploiement, vérifiez que les ressources sont bien gérées par Helm :

```bash
# Vérifier les labels
kubectl get configmap app-config -n intelectgame -o jsonpath='{.metadata.labels.app\.kubernetes\.io/managed-by}'
# Devrait afficher: Helm

kubectl get secret telegram-bot-secret -n intelectgame -o jsonpath='{.metadata.labels.app\.kubernetes\.io/managed-by}'
# Devrait afficher: Helm
```


