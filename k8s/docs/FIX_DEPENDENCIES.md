# Correction des dépendances manquantes

## Problème résolu

Le service `game-service` avait une dépendance manquante : `express` n'était pas dans le `package.json` mais était utilisé dans le code.

## Correction appliquée

✅ Ajout de `express` dans `node/game-service/package.json` :
```json
"dependencies": {
  "axios": "^1.13.2",
  "cors": "^2.8.5",
  "express": "^4.18.2",  // ← Ajouté
  "mongoose": "^8.0.0",
  "socket.io": "^4.8.1"
}
```

## Vérification des autres services

Les autres services ont déjà `express` dans leurs dépendances :
- ✅ `auth-service` : express ^5.1.0
- ✅ `quiz-service` : express ^5.1.0
- ✅ `game-service` : express ^4.18.2 (maintenant corrigé)

## Pour reconstruire et redéployer

Si vous devez reconstruire l'image après avoir modifié les dépendances :

```bash
# Activer le Docker daemon de Minikube
eval $(minikube docker-env)

# Reconstruire l'image
docker build -t thismann17/gamev2-game-service:latest ./node/game-service

# Redémarrer le déploiement
kubectl rollout restart deployment/game-service -n intelectgame

# Vérifier le statut
kubectl get pods -n intelectgame
kubectl logs -f deployment/game-service -n intelectgame
```

## Note

Après avoir modifié les `package.json`, n'oubliez pas de :
1. Reconstruire les images Docker
2. Redéployer les services affectés
3. Vérifier que les pods démarrent correctement

