# Erreurs d'Extensions de Navigateur

## Analyse des Erreurs

### 1. `single-player.bundle.js:2` - "No suitable locators found or elements not present"

**Source** : Extension de navigateur (probablement un outil d'automatisation ou de remplissage automatique)

**Cause** : L'extension tente de trouver des éléments sur la page pour remplir automatiquement des formulaires, mais ne trouve pas les sélecteurs qu'elle cherche.

**Impact** : **Aucun** - C'est juste un avertissement de l'extension, pas une erreur de votre application.

### 2. `content_script.js:1` - "Cannot read properties of undefined (reading 'control')"

**Source** : Extension de navigateur (probablement LastPass, 1Password, Dashlane, ou similaire)

**Cause** : L'extension tente d'accéder à une propriété `control` qui n'existe pas dans le contexte où elle s'exécute.

**Impact** : **Aucun** - C'est une erreur interne de l'extension, pas de votre application.

## Pourquoi ces erreurs apparaissent ?

Les extensions de navigateur injectent des scripts (`content_script.js`) dans toutes les pages web pour :
- Détecter les champs de formulaire
- Offrir le remplissage automatique de mots de passe
- Suggérer des identifiants sauvegardés
- Détecter les champs de paiement

Quand ces extensions ne trouvent pas les éléments qu'elles cherchent, ou quand elles tentent d'accéder à des propriétés qui n'existent pas, elles génèrent ces erreurs.

## Solutions

### Option 1 : Ignorer les erreurs (Recommandé)

Ces erreurs n'affectent **pas** le fonctionnement de votre application. Vous pouvez simplement les ignorer.

### Option 2 : Désactiver les extensions temporairement

Pour avoir une console plus propre lors du débogage :

1. **Chrome/Edge** :
   - Ouvrir `chrome://extensions/` ou `edge://extensions/`
   - Désactiver temporairement les extensions de remplissage automatique (LastPass, 1Password, etc.)

2. **Firefox** :
   - Ouvrir `about:addons`
   - Désactiver temporairement les extensions de remplissage automatique

### Option 3 : Filtrer les erreurs dans la console

Dans la console du navigateur, vous pouvez filtrer les erreurs :
- Chrome/Edge : Utiliser le filtre pour exclure `content_script.js` et `single-player.bundle.js`
- Firefox : Utiliser le filtre pour exclure les scripts d'extensions

### Option 4 : Mode navigation privée

Tester l'application en mode navigation privée (les extensions sont généralement désactivées par défaut).

## Comment identifier si c'est une extension ?

1. **Regarder le nom du fichier** :
   - `content_script.js` = Extension de navigateur
   - `single-player.bundle.js` = Extension de navigateur
   - `vendor.js`, `app.js`, etc. = Votre application

2. **Regarder la source** :
   - Si le fichier vient de `chrome-extension://` ou `moz-extension://` = Extension
   - Si le fichier vient de votre domaine = Votre application

3. **Tester sans extensions** :
   - Mode navigation privée
   - Désactiver toutes les extensions
   - Si les erreurs disparaissent = C'était des extensions

## Erreurs à surveiller (Votre application)

Les erreurs **importantes** à surveiller sont celles qui viennent de :
- `index-*.js` (votre application Vue.js)
- `app.js`, `vendor.js` (votre application)
- Votre domaine (`localhost:3000`, etc.)

**Exemples d'erreurs importantes** :
- `❌ WebSocket connection error`
- `❌ Error loading game state`
- `❌ Player not found`
- `404 Not Found` (requêtes API)
- `429 Too Many Requests` (rate limiting)

## Conclusion

Les erreurs que vous voyez (`single-player.bundle.js` et `content_script.js`) sont **normales** et **non critiques**. Elles proviennent d'extensions de navigateur et n'affectent pas votre application.

**Vous pouvez les ignorer en toute sécurité.**



