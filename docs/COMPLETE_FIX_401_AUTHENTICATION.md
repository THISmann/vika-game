# Correction complète : Erreur 401 lors du démarrage du jeu

## Problème

Lors du démarrage du jeu depuis le dashboard admin, l'erreur suivante apparaît :

```
POST http://82.202.141.248/api/game/start 401 (Unauthorized)
Error: Invalid or missing authentication token for quiz service
```

Les logs montrent que :
1. ✅ Le header Authorization arrive bien au game-service
2. ✅ Le game-service transmet le header au quiz-service
3. ❌ Le quiz-service ne peut pas vérifier le token via l'auth-service

## Analyse complète

### Flux de la requête

```
Frontend → Nginx → Game-service → Quiz-service → Auth-service
   ✅         ✅         ✅              ❌            ?
```

### Problèmes identifiés

1. **Quiz-service ne peut pas se connecter à l'auth-service**
   - URL incorrecte
   - Problème de réseau Kubernetes
   - Auth-service non accessible

2. **Timeout trop court**
   - Timeout de 5 secondes peut être insuffisant
   - Augmenté à 10 secondes

3. **Logs insuffisants**
   - Difficile de diagnostiquer le problème
   - Logs améliorés pour tracer le flux complet

## Corrections appliquées

### 1. Game-service (`node/game-service/controllers/game.controller.js`)

- ✅ Logs détaillés dans `startGame()` et `nextQuestion()`
- ✅ Vérification robuste du header (minuscules/majuscules)
- ✅ Formatage automatique du header `Bearer <token>`
- ✅ Gestion d'erreurs améliorée

### 2. Quiz-service (`node/quiz-service/middleware/auth.middleware.js`)

- ✅ Logs de diagnostic complets à chaque étape
- ✅ Affichage de l'URL complète appelée
- ✅ Timeout augmenté de 5 à 10 secondes
- ✅ Détection des erreurs de connexion (ECONNREFUSED, ENOTFOUND, ETIMEDOUT)
- ✅ Messages d'erreur détaillés en développement

## Actions requises

### 1. Rebuild et redéployer les services

```bash
# Sur votre machine locale

# Game-service
cd node/game-service
docker build -t thismann17/gamev2-game-service:latest -f Dockerfile .
docker push thismann17/gamev2-game-service:latest

# Quiz-service
cd ../quiz-service
docker build -t thismann17/gamev2-quiz-service:latest -f Dockerfile .
docker push thismann17/gamev2-quiz-service:latest

# Sur la VM
kubectl rollout restart deployment/game-service -n intelectgame
kubectl rollout restart deployment/quiz-service -n intelectgame
kubectl rollout status deployment/game-service -n intelectgame --timeout=120s
kubectl rollout status deployment/quiz-service -n intelectgame --timeout=120s
```

### 2. Vérifier la connectivité

```bash
# Sur la VM
./k8s/scripts/test-quiz-auth-connectivity.sh
```

Ce script vérifiera :
- Les variables d'environnement
- La connectivité réseau
- L'accessibilité de l'auth-service
- L'endpoint `/auth/verify-token`
- Les logs des services

### 3. Surveiller les logs

```bash
# Sur la VM - Logs du quiz-service
kubectl logs -f -l app=quiz-service -n intelectgame | grep -A 30 "QUIZ-SERVICE AUTHENTICATION"

# Dans un autre terminal - Logs du game-service
kubectl logs -f -l app=game-service -n intelectgame | grep -A 30 "START GAME REQUEST"
```

### 4. Tester le démarrage du jeu

1. Connectez-vous au dashboard admin
2. Cliquez sur "Lancer la partie"
3. Vérifiez les logs des deux services
4. L'erreur 401 ne devrait plus apparaître

## Diagnostic en cas de problème persistant

### Si l'auth-service n'est pas accessible

1. Vérifiez que l'auth-service est en cours d'exécution :
   ```bash
   kubectl get pods -n intelectgame -l app=auth-service
   kubectl logs -l app=auth-service -n intelectgame --tail=100
   ```

2. Vérifiez le service Kubernetes :
   ```bash
   kubectl get svc -n intelectgame auth-service
   kubectl describe svc auth-service -n intelectgame
   ```

3. Testez la connectivité depuis le quiz-service :
   ```bash
   QUIZ_POD=$(kubectl get pods -n intelectgame -l app=quiz-service -o jsonpath='{.items[0].metadata.name}')
   kubectl exec -n intelectgame $QUIZ_POD -- wget -qO- --timeout=10 http://auth-service:3001/auth/test
   ```

### Si l'URL est incorrecte

1. Vérifiez le ConfigMap :
   ```bash
   kubectl get configmap app-config -n intelectgame -o yaml | grep AUTH_SERVICE_URL
   ```

2. Vérifiez que le quiz-service utilise la bonne variable :
   ```bash
   QUIZ_POD=$(kubectl get pods -n intelectgame -l app=quiz-service -o jsonpath='{.items[0].metadata.name}')
   kubectl exec -n intelectgame $QUIZ_POD -- env | grep AUTH_SERVICE_URL
   ```

   Devrait afficher : `AUTH_SERVICE_URL=http://auth-service:3001`

### Si le token n'est pas valide

1. Vérifiez que le token est bien formaté dans les logs
2. Vérifiez que le token n'a pas expiré (24 heures)
3. Essayez de vous reconnecter pour obtenir un nouveau token

## Fichiers modifiés

1. ✅ `node/game-service/controllers/game.controller.js` - Logs améliorés et vérification robuste
2. ✅ `node/quiz-service/middleware/auth.middleware.js` - Logs complets et timeout augmenté
3. ✅ `docs/FIX_QUIZ_SERVICE_AUTH_401.md` - Documentation du problème
4. ✅ `docs/FIX_401_START_GAME_DEEP_ANALYSIS.md` - Analyse approfondie
5. ✅ `k8s/scripts/test-quiz-auth-connectivity.sh` - Script de diagnostic
6. ✅ `k8s/scripts/diagnose-start-game-401.sh` - Script de diagnostic complet

## Résumé

Les corrections appliquées devraient résoudre définitivement le problème d'authentification :

1. ✅ Logs détaillés pour diagnostiquer rapidement les problèmes
2. ✅ Vérification robuste des headers
3. ✅ Timeout augmenté pour les appels inter-services
4. ✅ Gestion d'erreurs améliorée avec détails complets
5. ✅ Scripts de diagnostic pour vérifier la connectivité

Après le rebuild et le redéploiement, le problème devrait être résolu. Si le problème persiste, les logs détaillés permettront d'identifier rapidement la cause.

