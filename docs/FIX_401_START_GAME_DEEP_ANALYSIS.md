# Correction définitive : Erreur 401 lors du démarrage du jeu

## Problème

Lors du démarrage du jeu depuis le dashboard admin, l'erreur suivante apparaît :
```
POST http://82.202.141.248/api/game/start 401 (Unauthorized)
Error: Invalid or missing authentication token for quiz service
```

## Analyse approfondie

### Flux de la requête

1. **Frontend** → Envoie `POST /api/game/start` avec header `Authorization: Bearer <token>`
2. **Nginx** → Route `/api/game/start` vers `game-service` avec rewrite `/game/start`
3. **Game-service** → Reçoit la requête, vérifie l'authentification (middleware), puis appelle `quiz-service` pour récupérer les questions
4. **Quiz-service** → Vérifie l'authentification et retourne les questions

### Problème identifié

Le `game-service` doit transmettre le header `Authorization` de la requête originale au `quiz-service` lors de l'appel à `/quiz/full`. Le problème peut venir de :

1. **Header non reçu par game-service** : Nginx ne transmet pas correctement le header
2. **Header mal formaté** : Le format du header n'est pas correct
3. **Header non transmis au quiz-service** : Le game-service ne transmet pas correctement le header

## Corrections appliquées

### 1. Amélioration des logs de diagnostic

Dans `node/game-service/controllers/game.controller.js`, fonction `startGame()` :

```javascript
// Logs détaillés pour diagnostiquer le problème
console.log(`🚀 All headers:`, JSON.stringify(req.headers, null, 2));
console.log(`🚀 Authorization header: ${req.headers.authorization ? 'Present' : 'Missing'}`);

// Récupérer le header (peut être en minuscules ou majuscules)
const authHeader = req.headers.authorization || req.headers.Authorization;

// S'assurer que le header est au format "Bearer <token>"
const authHeaderFormatted = authHeader.startsWith('Bearer ') 
  ? authHeader 
  : `Bearer ${authHeader.replace(/^Bearer\s+/i, '')}`;
```

### 2. Vérification robuste du header

- Vérification des deux cas (minuscules et majuscules) : `req.headers.authorization || req.headers.Authorization`
- Formatage automatique du header pour s'assurer qu'il est au format `Bearer <token>`
- Logs détaillés pour tracer le flux du header

### 3. Amélioration de la gestion des erreurs

- Logs détaillés des erreurs axios
- Affichage de la configuration de la requête en cas d'erreur
- Messages d'erreur plus informatifs en développement

## Vérification

### 1. Vérifier les logs du game-service

```bash
# Sur la VM
kubectl logs -f -l app=game-service -n intelectgame | grep -A 20 "START GAME REQUEST"
```

Vous devriez voir :
- `🚀 Authorization header: Present`
- `🚀 Token preview: Bearer ...`
- `📋 Auth header present: true`
- `📋 Formatted auth header: Bearer ...`

### 2. Vérifier les logs du quiz-service

```bash
# Sur la VM
kubectl logs -f -l app=quiz-service -n intelectgame | grep -A 10 "AUTHENTICATION"
```

Vous devriez voir :
- `🔐 Authorization header: PRESENT`
- `🔐 Authorization value: Bearer ...`

### 3. Vérifier la configuration Nginx

```bash
# Sur la VM
kubectl exec -n intelectgame $(kubectl get pods -n intelectgame -l app=nginx-proxy -o jsonpath='{.items[0].metadata.name}') -- cat /etc/nginx/nginx.conf | grep -A 10 "location /api/game"
```

Vous devriez voir :
- `proxy_set_header Authorization $http_authorization;`
- `proxy_pass_request_headers on;`
- `underscores_in_headers on;`

## Actions requises

### 1. Rebuild et redéployer le game-service

```bash
# Sur votre machine locale
cd node/game-service
docker build -t thismann17/gamev2-game-service:latest -f Dockerfile .
docker push thismann17/gamev2-game-service:latest

# Sur la VM
kubectl rollout restart deployment/game-service -n intelectgame
kubectl rollout status deployment/game-service -n intelectgame --timeout=120s
```

### 2. Vérifier que Nginx transmet correctement le header

Si les logs du game-service montrent que le header est `Missing`, vérifiez la configuration Nginx et redémarrez-le :

```bash
# Sur la VM
kubectl rollout restart deployment/nginx-proxy -n intelectgame
```

### 3. Tester le démarrage du jeu

1. Connectez-vous au dashboard admin
2. Cliquez sur "Lancer la partie"
3. Vérifiez les logs du game-service et du quiz-service
4. L'erreur 401 ne devrait plus apparaître

## Diagnostic en cas de problème persistant

### Si le header est toujours Missing dans game-service

1. Vérifiez que le frontend envoie bien le header (console navigateur → Network → Headers)
2. Vérifiez la configuration Nginx (voir ci-dessus)
3. Redémarrez Nginx

### Si le header arrive mais le quiz-service retourne 401

1. Vérifiez que le token est valide (non expiré)
2. Vérifiez que `AUTH_SERVICE_URL` est correctement configuré dans le quiz-service
3. Vérifiez les logs du quiz-service pour voir l'erreur exacte

### Si le problème persiste

Exécutez le script de diagnostic :

```bash
# Sur la VM
./k8s/scripts/diagnose-auth-header-issue.sh
```

Ce script vérifiera :
- La configuration Nginx
- Les logs du game-service
- Les logs du quiz-service
- La transmission du header

## Résumé des modifications

1. ✅ Logs de diagnostic améliorés dans `startGame()`
2. ✅ Vérification robuste du header (minuscules/majuscules)
3. ✅ Formatage automatique du header `Bearer <token>`
4. ✅ Gestion d'erreurs améliorée avec détails
5. ✅ Même corrections appliquées à `nextQuestion()`

Ces modifications devraient résoudre définitivement le problème d'authentification lors du démarrage du jeu.

