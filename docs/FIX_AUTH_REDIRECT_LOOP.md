# Fix: Boucle de redirection vers login

## Problème identifié

L'utilisateur était redirigé vers la page de login à chaque action admin (lancer le jeu, ajouter une question), même après s'être connecté.

## Causes identifiées

1. **Vérification du token incorrecte** : La fonction `isAdminAuthenticated()` dans `guards.js` essayait de décoder le token mais la logique de vérification était incomplète.

2. **Redirection avec `window.location.href`** : L'intercepteur axios utilisait `window.location.href` qui force un rechargement complet de la page, causant des problèmes de navigation.

3. **Double vérification des guards** : Il y avait un guard global ET un `beforeEnter` sur chaque route, causant des conflits.

## Corrections appliquées

### 1. Amélioration de la vérification du token (`guards.js`)

- Vérification correcte du format du token (base64 avec format `role-timestamp`)
- Vérification du rôle (doit être `admin`)
- Vérification de l'expiration (24 heures)
- Logs détaillés pour le débogage
- Nettoyage automatique du localStorage si le token est invalide

### 2. Amélioration de l'intercepteur axios (`api.js`)

- Utilisation du router Vue au lieu de `window.location.href`
- Import dynamique du router pour éviter les dépendances circulaires
- Logs pour déboguer les problèmes d'authentification
- Logs pour voir quand le token est ajouté aux requêtes

### 3. Simplification des guards (`router/index.js`)

- Suppression du guard global qui causait des doubles vérifications
- Les guards sont maintenant gérés uniquement par `beforeEnter` sur chaque route

## Test

1. Se connecter avec `admin` / `admin`
2. Vérifier dans la console du navigateur :
   - `✅ Login successful, token stored: ...`
   - `🔑 Adding auth token to request: ...`
3. Tester les actions admin :
   - Lancer le jeu
   - Ajouter une question
   - Vérifier que vous n'êtes pas redirigé vers login

## Debug

Si le problème persiste, vérifier dans la console :
- `🔒 Auth check failed: ...` - Problème avec le token
- `⚠️ No auth token found for admin request: ...` - Token non trouvé
- `🔒 401 Unauthorized - clearing auth and redirecting to login` - Token rejeté par le backend

## Notes

- Le token est valide pendant 24 heures
- Le token est stocké dans `localStorage` sous la clé `adminToken`
- Le flag admin est stocké sous la clé `admin` avec la valeur `'1'`

