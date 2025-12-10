# Correction du problème de pathRewrite dans l'API Gateway

## 🔍 Problème identifié

Les endpoints `/game/state` et `/game/players/count` retournaient des erreurs 404 même si les routes existaient dans le game-service.

### Symptômes
- `GET http://localhost:3000/game/state` → 404 (Not Found)
- `GET http://localhost:3000/game/players/count` → 404 (Not Found)
- Le problème revenait après chaque redémarrage

### Cause racine

Le problème venait du `pathRewrite` dans l'API Gateway (`node/api-gateway/src/routes/gateway.routes.js`).

**Avant la correction :**
```javascript
pathRewrite: (path, req) => {
  const newPath = pathPrefix ? `${pathPrefix}${path}` : path;
  return newPath;
}
```

**Problème :**
- `http-proxy-middleware` recevait parfois le path complet `/game/state` au lieu de juste `/state`
- Le pathRewrite ajoutait le préfixe `/game` sans vérifier s'il était déjà présent
- Résultat : `/game/state` → `/game/game/state` (double préfixe)
- Le game-service ne trouvait pas la route `/game/game/state` → 404

**Logs d'erreur :**
```
🔄 pathRewrite: '/game/state' → '/game/game/state'
🔄 Proxying GET /game/state → http://game:3003/game/game/state
⚠️ GET /game/state - 404
```

## ✅ Solution appliquée

Correction du `pathRewrite` pour supprimer le préfixe s'il est déjà présent avant de le réajouter :

```javascript
pathRewrite: (path, req) => {
  // http-proxy-middleware reçoit parfois le path complet avec le préfixe
  // On doit supprimer le préfixe s'il est présent avant de le réajouter
  let cleanPath = path;
  
  // Si le path commence par le préfixe, le supprimer
  if (pathPrefix && path.startsWith(pathPrefix)) {
    cleanPath = path.substring(pathPrefix.length);
  }
  
  // Réajouter le préfixe pour que le service backend le reçoive correctement
  const newPath = pathPrefix ? `${pathPrefix}${cleanPath}` : cleanPath;
  console.log(`🔄 pathRewrite: '${path}' → '${newPath}' (cleanPath: '${cleanPath}', originalUrl: '${req.originalUrl}', prefix: '${pathPrefix}')`);
  return newPath;
}
```

**Résultat :**
- `/game/state` → supprime `/game` → `/state` → réajoute `/game` → `/game/state` ✅
- `/state` → réajoute `/game` → `/game/state` ✅

## 🛡️ Prévention

### 1. Tests automatisés

Ajouter des tests pour vérifier que les routes proxy fonctionnent :

```javascript
// tests/api-gateway.test.js
describe('API Gateway Routes', () => {
  it('should proxy /game/state correctly', async () => {
    const response = await request(app)
      .get('/game/state')
      .expect(200);
    expect(response.body).toHaveProperty('isStarted');
  });
  
  it('should proxy /game/players/count correctly', async () => {
    const response = await request(app)
      .get('/game/players/count')
      .expect(200);
    expect(response.body).toHaveProperty('count');
  });
});
```

### 2. Monitoring des logs

Surveiller les logs de l'API Gateway pour détecter les problèmes de pathRewrite :

```bash
docker-compose logs api-gateway | grep -E "(pathRewrite|404|Proxying)"
```

### 3. Validation du pathRewrite

Ajouter une validation pour s'assurer que le pathRewrite ne crée pas de double préfixe :

```javascript
pathRewrite: (path, req) => {
  let cleanPath = path;
  
  if (pathPrefix && path.startsWith(pathPrefix)) {
    cleanPath = path.substring(pathPrefix.length);
  }
  
  const newPath = pathPrefix ? `${pathPrefix}${cleanPath}` : cleanPath;
  
  // Validation : vérifier qu'on n'a pas créé un double préfixe
  if (newPath.startsWith(pathPrefix + pathPrefix)) {
    console.error(`❌ Double prefix detected: ${newPath}`);
    throw new Error(`Invalid pathRewrite: double prefix detected`);
  }
  
  return newPath;
}
```

### 4. Documentation des routes

Maintenir une documentation à jour des routes disponibles :

```markdown
## Routes API Gateway

### Game Service
- `GET /game/state` → `http://game:3003/game/state`
- `GET /game/players/count` → `http://game:3003/game/players/count`
- `GET /game/players` → `http://game:3003/game/players`
- `POST /game/answer` → `http://game:3003/game/answer`
- ...
```

### 5. Health checks

Ajouter des health checks qui testent les routes proxy :

```javascript
// Health check endpoint qui teste les routes proxy
app.get('/health/detailed', async (req, res) => {
  const checks = {
    apiGateway: 'ok',
    gameService: await checkGameService(),
    authService: await checkAuthService(),
    quizService: await checkQuizService()
  };
  
  const allOk = Object.values(checks).every(status => status === 'ok');
  res.status(allOk ? 200 : 503).json(checks);
});
```

## 📝 Checklist de vérification

Avant de déployer une nouvelle route proxy :

- [ ] Vérifier que la route existe dans le service backend
- [ ] Tester la route directement sur le service backend
- [ ] Tester la route via l'API Gateway
- [ ] Vérifier les logs de pathRewrite pour s'assurer qu'il n'y a pas de double préfixe
- [ ] Ajouter la route à la documentation
- [ ] Ajouter un test automatisé si possible

## 🔄 Procédure de dépannage

Si une route proxy retourne 404 :

1. **Vérifier les logs de l'API Gateway :**
   ```bash
   docker-compose logs api-gateway | grep "pathRewrite"
   ```

2. **Vérifier que la route existe dans le service backend :**
   ```bash
   docker-compose exec game-service cat routes/game.routes.js
   ```

3. **Tester la route directement sur le service backend :**
   ```bash
   curl http://localhost:3003/game/state
   ```

4. **Tester la route via l'API Gateway :**
   ```bash
   curl http://localhost:3000/game/state
   ```

5. **Vérifier le pathRewrite dans les logs :**
   - Le path ne doit pas avoir de double préfixe
   - Le path final doit correspondre à la route dans le service backend

## 📚 Références

- [http-proxy-middleware documentation](https://github.com/chimurai/http-proxy-middleware)
- [Express Router documentation](https://expressjs.com/en/guide/routing.html)


