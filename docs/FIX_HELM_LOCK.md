# Correction des verrouillages Helm

## Problème

Lors du déploiement avec Helm, l'erreur suivante apparaît :
```
Error: UPGRADE FAILED: another operation (install/upgrade/rollback) is in progress
```

## Cause

Helm utilise des secrets Kubernetes pour stocker l'état des releases. Si un déploiement précédent a été interrompu (Ctrl+C, erreur, etc.), Helm peut rester bloqué dans un état intermédiaire (`pending-install`, `pending-upgrade`, `pending-rollback`).

## Solutions

### Solution 1 : Script de déblocage automatique (recommandé)

Le script `deploy-local.sh` détecte et débloque automatiquement les releases bloquées avant le déploiement.

### Solution 2 : Déblocage manuel d'une release spécifique

```bash
# Débloquer une release spécifique
./k8s/local/scripts/force-unlock-helm.sh <release-name> <namespace>

# Exemples:
./k8s/local/scripts/force-unlock-helm.sh nginx-ingress nginx-ingress
./k8s/local/scripts/force-unlock-helm.sh app intelectgame
```

### Solution 3 : Diagnostic et nettoyage manuel

```bash
# 1. Voir toutes les releases
helm list --all-namespaces

# 2. Voir l'état d'une release
helm status <release-name> -n <namespace>

# 3. Voir les secrets de release (qui contiennent l'état)
kubectl get secrets -n <namespace> -l owner=helm

# 4. Supprimer un secret de release bloqué
kubectl get secrets -n <namespace> -l owner=helm | grep "pending"
kubectl delete secret <secret-name> -n <namespace>

# 5. Ou supprimer la release complètement
helm delete <release-name> -n <namespace> --ignore-not-found
```

### Solution 4 : Script de diagnostic

```bash
# Diagnostiquer tous les verrouillages
./k8s/local/scripts/fix-helm-lock.sh
```

## Prévention

Pour éviter ce problème :
- **Ne pas interrompre** les déploiements Helm (éviter Ctrl+C)
- **Attendre** que chaque `helm upgrade --install` se termine
- **Vérifier** l'état des releases avant de redéployer : `helm list --all-namespaces`

## Vérification

Après le déblocage, vérifiez que la release n'est plus bloquée :

```bash
# Vérifier l'état
helm status <release-name> -n <namespace>

# Devrait afficher "deployed" et non "pending-*"
```

## Scripts disponibles

- `fix-helm-lock.sh` : Diagnostic interactif de tous les verrouillages
- `force-unlock-helm.sh` : Déblocage forcé d'une release spécifique
- `deploy-local.sh` : Déploiement avec déblocage automatique


