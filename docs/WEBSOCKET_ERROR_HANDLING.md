# Gestion des erreurs WebSocket

## Problème résolu

L'erreur "server error" apparaissait dans la console du navigateur lors de la connexion WebSocket de l'admin dashboard.

## Cause

Le serveur Socket.io peut envoyer des paquets d'erreur via `socket.emit("error", ...)` dans certains cas :
1. Lorsqu'un joueur essaie de se connecter alors que le jeu a déjà commencé
2. Lors d'une erreur lors de l'enregistrement d'un joueur
3. Lors d'erreurs non gérées dans le code serveur

Le client (AdminDashboard) ne gérait pas l'événement "error", seulement "connect_error".

## Solution

### 1. Handler d'erreur côté client

Ajout d'un handler pour l'événement "error" dans `AdminDashboard.vue` :

```javascript
// Handle server error packets (emitted by server after connection)
this.socket.on('error', (errorData) => {
  console.error('❌ Admin WebSocket server error:', errorData)
  // Ignore GAME_ALREADY_STARTED errors for admin (admin doesn't need to register as player)
  if (errorData && errorData.code === 'GAME_ALREADY_STARTED') {
    console.log('ℹ️ Game already started - this is normal for admin')
    return
  }
  // Only show error if it's not a game already started error
  if (errorData && errorData.message) {
    this.error = errorData.message
    setTimeout(() => this.error = '', 5000)
  }
})
```

### 2. Amélioration de la gestion des erreurs côté serveur

Amélioration des messages d'erreur dans `node/game-service/server.js` :

```javascript
catch (error) {
  console.error("Error registering player:", error);
  // Envoyer une erreur plus détaillée en développement
  const errorMessage = process.env.NODE_ENV === 'development' 
    ? `Erreur lors de l'enregistrement: ${error.message}`
    : "Erreur lors de l'enregistrement";
  socket.emit("error", { 
    message: errorMessage,
    code: "REGISTRATION_ERROR"
  });
}
```

## Types d'erreurs WebSocket

### `connect_error`
- Se produit lors de la tentative de connexion initiale
- Géré par : `socket.on('connect_error', ...)`

### `error`
- Paquet d'erreur envoyé par le serveur après la connexion
- Géré par : `socket.on('error', ...)`
- Peut contenir :
  - `code` : Code d'erreur (ex: "GAME_ALREADY_STARTED", "REGISTRATION_ERROR")
  - `message` : Message d'erreur descriptif

## Codes d'erreur

- `GAME_ALREADY_STARTED` : Le jeu a déjà commencé, nouveau joueur rejeté
- `REGISTRATION_ERROR` : Erreur lors de l'enregistrement d'un joueur

## Bonnes pratiques

1. **Toujours gérer l'événement "error"** en plus de "connect_error"
2. **Ignorer les erreurs non pertinentes** (ex: GAME_ALREADY_STARTED pour l'admin)
3. **Afficher les erreurs pertinentes** à l'utilisateur avec un timeout
4. **Logger toutes les erreurs** pour le débogage

## Test

Pour tester la gestion des erreurs :

1. Démarrer le jeu
2. Essayer de se connecter en tant que nouveau joueur → Devrait recevoir GAME_ALREADY_STARTED
3. Se connecter en tant qu'admin → Ne devrait pas recevoir d'erreur (ou l'ignorer si reçue)

## Fichiers modifiés

- `vue/front/src/components/admin/AdminDashboard.vue` - Ajout du handler d'erreur
- `node/game-service/server.js` - Amélioration des messages d'erreur


