# Guide : Vider le cache du navigateur pour vika-game.ru

## Problème
Le site fonctionne en navigation privée mais pas dans les onglets normaux. C'est dû au cache du navigateur qui a mémorisé une ancienne réponse.

## Solutions par navigateur

### Chrome / Edge (Chromium)

**Méthode rapide :**
1. Ouvrez `http://vika-game.ru/`
2. Appuyez sur **Ctrl+Shift+R** (Windows/Linux) ou **Cmd+Shift+R** (Mac)
   - Cela force un rechargement sans utiliser le cache

**Méthode complète :**
1. Appuyez sur **F12** pour ouvrir les outils développeur
2. Clic droit sur le bouton de rechargement (à côté de la barre d'adresse)
3. Sélectionnez **"Vider le cache et effectuer une actualisation forcée"**

**Vider tout le cache :**
1. Allez dans **Paramètres** → **Confidentialité et sécurité** → **Effacer les données de navigation**
2. Sélectionnez **"Images et fichiers en cache"**
3. Choisissez **"Tout le temps"**
4. Cliquez sur **"Effacer les données"**

### Firefox

**Méthode rapide :**
1. Ouvrez `http://vika-game.ru/`
2. Appuyez sur **Ctrl+Shift+R** (Windows/Linux) ou **Cmd+Shift+R** (Mac)

**Méthode complète :**
1. Appuyez sur **F12** pour ouvrir les outils développeur
2. Allez dans l'onglet **Réseau**
3. Cochez **"Désactiver le cache"**
4. Rechargez la page avec **F5**

**Vider tout le cache :**
1. Allez dans **Paramètres** → **Confidentialité et sécurité**
2. Dans la section **Cookies et données de sites**
3. Cliquez sur **"Effacer les données"**
4. Cochez **"Cache"**
5. Cliquez sur **"Effacer"**

### Safari

**Méthode rapide :**
1. Ouvrez `http://vika-game.ru/`
2. Appuyez sur **Cmd+Option+R** (Mac)

**Vider le cache :**
1. Allez dans **Safari** → **Préférences** → **Avancé**
2. Cochez **"Afficher le menu Développement"**
3. Dans le menu **Développement**, cliquez sur **"Vider les caches"**

## Solution alternative : Forcer le rechargement

Sur n'importe quel navigateur, vous pouvez :
1. Ouvrir `http://vika-game.ru/`
2. Appuyer sur **Ctrl+F5** (Windows/Linux) ou **Cmd+Shift+R** (Mac)
3. Ou maintenir **Shift** et cliquer sur le bouton de rechargement

## Vider le cache DNS du système

**Windows :**
```cmd
ipconfig /flushdns
```

**Mac :**
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

**Linux :**
```bash
sudo systemd-resolve --flush-caches
```

## Après avoir vidé le cache

1. Fermez tous les onglets avec `vika-game.ru`
2. Videz le cache (voir méthodes ci-dessus)
3. Ouvrez un nouvel onglet
4. Tapez `http://vika-game.ru/`
5. Le site devrait maintenant fonctionner normalement
