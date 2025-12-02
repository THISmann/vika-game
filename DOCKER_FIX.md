# Correction du problème Docker Build

## Problème identifié

L'erreur `npm ci` se produisait car :
1. Le `.gitignore` ignorait les fichiers `package-lock.json`
2. `npm ci` nécessite un `package-lock.json` pour fonctionner
3. Les Dockerfiles utilisaient `--only=production` qui est obsolète

## Solutions appliquées

### 1. Modification du `.gitignore`
- Les fichiers `package-lock.json` ne sont plus ignorés
- Ces fichiers sont nécessaires pour des builds reproductibles avec `npm ci`

### 2. Correction des Dockerfiles

Tous les Dockerfiles ont été modifiés pour :
- Utiliser `npm ci --omit=dev` (syntaxe moderne) si `package-lock.json` existe
- Utiliser `npm install --production` en fallback si `package-lock.json` n'existe pas

**Services backend** (auth, quiz, game) :
```dockerfile
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --production; fi
```

**Frontend** :
```dockerfile
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
```

## Action requise

Pour que les builds fonctionnent correctement, vous devez vous assurer que les fichiers `package-lock.json` sont commités dans le repository :

```bash
# Vérifier que les package-lock.json sont présents
ls node/*/package-lock.json
ls vue/front/package-lock.json

# Si certains manquent, les générer
cd node/auth-service && npm install
cd ../quiz-service && npm install
cd ../game-service && npm install
cd ../../vue/front && npm install

# Puis commit les fichiers
git add node/*/package-lock.json vue/front/package-lock.json
git commit -m "Add package-lock.json files for Docker builds"
git push
```

## Alternative : Utiliser npm install uniquement

Si vous préférez ne pas commit les `package-lock.json`, vous pouvez modifier les Dockerfiles pour utiliser uniquement `npm install` :

```dockerfile
RUN npm install --production
```

Cependant, cela est moins optimal car :
- Les builds ne seront pas reproductibles
- Les versions des dépendances peuvent varier entre les builds

## Vérification

Après avoir commit les `package-lock.json`, le workflow GitHub Actions devrait fonctionner correctement.

