# Système de Logging

## Vue d'ensemble

Un système de logging centralisé a été implémenté pour tous les services Node.js. Ce système enregistre automatiquement tous les appels API, les réponses, les erreurs et les événements WebSocket.

## Structure

### Fichier de logging partagé
- **Location**: `node/shared/logger.js`
- **Usage**: Utilisé par tous les services (auth-service, quiz-service, game-service, api-gateway)

### Fichiers de logs générés
Les logs sont écrits dans le dossier `logs/` à la racine du projet :
- `auth-service.log` - Logs généraux du service d'authentification
- `auth-service-errors.log` - Erreurs uniquement
- `quiz-service.log` - Logs généraux du service de quiz
- `quiz-service-errors.log` - Erreurs uniquement
- `game-service.log` - Logs généraux du service de jeu
- `game-service-errors.log` - Erreurs uniquement
- `api-gateway.log` - Logs généraux de l'API Gateway
- `api-gateway-errors.log` - Erreurs uniquement

## Format des logs

Tous les logs sont au format JSON pour faciliter le parsing et l'analyse :

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "auth-service",
  "level": "INFO",
  "message": "POST /auth/users/register 201",
  "method": "POST",
  "path": "/auth/users/register",
  "statusCode": 201,
  "ip": "127.0.0.1",
  "responseTime": "45ms"
}
```

## Niveaux de logging

- **INFO**: Requêtes API normales, connexions WebSocket, opérations réussies
- **WARN**: Avertissements (connexions Redis échouées, erreurs mineures)
- **ERROR**: Erreurs critiques (erreurs API, erreurs de connexion)
- **DEBUG**: Informations détaillées (uniquement en développement)

## Données enregistrées

### Requêtes API
- Méthode HTTP (GET, POST, PUT, DELETE)
- Chemin de la requête
- Paramètres de requête (query params)
- Corps de la requête (POST/PUT/PATCH) - **les mots de passe et tokens sont masqués**
- Adresse IP du client
- User-Agent
- ID utilisateur (si authentifié)
- Rôle utilisateur (si authentifié)
- Code de statut HTTP
- Temps de réponse

### WebSocket
- Connexions/déconnexions
- Événements émis/reçus
- Erreurs de connexion
- Tentatives de reconnexion

### Erreurs
- Message d'erreur
- Stack trace
- Contexte de la requête (si disponible)

## Utilisation

### Dans un service
```javascript
const { createLogger, requestLogger, errorLogger } = require("../shared/logger");

// Créer une instance de logger
const logger = createLogger('service-name');

// Utiliser comme middleware
app.use(requestLogger(logger));
app.use(errorLogger(logger));

// Utiliser dans le code
logger.info('Service started', { port: 3000 });
logger.error('Error occurred', error, { context: 'additional data' });
logger.warn('Warning message', { data: 'warning data' });
logger.debug('Debug info', { debug: 'data' });
```

## Sécurité

- Les mots de passe sont automatiquement masqués dans les logs
- Les tokens JWT sont masqués
- Les données sensibles ne sont pas enregistrées

## Configuration

Le système de logging fonctionne automatiquement. Aucune configuration supplémentaire n'est nécessaire.

### Variables d'environnement
- `NODE_ENV=production` : Désactive les logs DEBUG
- `NODE_ENV=development` : Active tous les niveaux de logs

## Consultation des logs

### En développement local
```bash
# Voir les logs en temps réel
tail -f logs/auth-service.log

# Voir uniquement les erreurs
tail -f logs/auth-service-errors.log

# Filtrer par niveau
grep '"level":"ERROR"' logs/auth-service.log
```

### En production (Kubernetes)
Les logs sont également disponibles via `kubectl logs` :
```bash
kubectl logs -f deployment/auth-service
```

## Intégration avec les services

### Auth Service
- ✅ Logging de toutes les requêtes API
- ✅ Logging des erreurs d'authentification
- ✅ Logging des opérations utilisateur

### Quiz Service
- ✅ Logging de toutes les requêtes API
- ✅ Logging des opérations CRUD sur les questions

### Game Service
- ✅ Logging de toutes les requêtes API
- ✅ Logging des connexions WebSocket
- ✅ Logging des événements de jeu
- ✅ Logging des opérations sur les parties

### API Gateway
- ✅ Logging de toutes les requêtes proxy
- ✅ Logging des erreurs de routage

## Exemples de logs

### Requête API réussie
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "auth-service",
  "level": "INFO",
  "message": "POST /auth/users/register 201",
  "method": "POST",
  "path": "/auth/users/register",
  "url": "/auth/users/register",
  "query": {},
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "statusCode": 201,
  "responseTime": "45ms"
}
```

### Erreur API
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "auth-service",
  "level": "ERROR",
  "message": "POST /auth/users/login 401",
  "method": "POST",
  "path": "/auth/users/login",
  "statusCode": 401,
  "error": {
    "message": "Invalid credentials",
    "name": "Error"
  }
}
```

### Connexion WebSocket
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "game-service",
  "level": "INFO",
  "message": "WebSocket client connected",
  "socketId": "abc123",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "totalClients": 5
}
```




