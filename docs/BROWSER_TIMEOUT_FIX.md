# Guide de résolution du problème de timeout dans le navigateur

## Problème
Le site `http://vika-game.ru/` fonctionne avec `curl` mais affiche "This site can't be reached - vika-game.ru took too long to respond" dans le navigateur.

## Diagnostic effectué

✅ **DNS** : Résout correctement vers `82.202.141.248`
✅ **Port 80** : Ouvert et accessible
✅ **Traefik** : Fonctionne correctement (HTTP 200)
✅ **Services** : Tous les services sont actifs (15/15)

## Solutions à essayer

### 1. Vider le cache DNS

**Windows:**
```cmd
ipconfig /flushdns
```

**Mac:**
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

**Linux:**
```bash
sudo systemd-resolve --flush-caches
# ou
sudo /etc/init.d/nscd restart
```

### 2. Tester en navigation privée
Ouvrez une fenêtre de navigation privée (Ctrl+Shift+N ou Cmd+Shift+N) et testez `http://vika-game.ru/`

### 3. Vérifier les paramètres proxy
- Vérifiez que votre navigateur n'utilise pas de proxy
- Désactivez temporairement les extensions de navigateur (VPN, ad-blockers, etc.)

### 4. Tester depuis un autre réseau
- Testez depuis votre téléphone en utilisant les données mobiles
- Testez depuis un autre réseau Wi-Fi

### 5. Vérifier le firewall local
- Vérifiez que votre firewall local n'bloque pas les connexions sortantes sur le port 80
- Testez en désactivant temporairement le firewall

### 6. Tester avec différents navigateurs
- Chrome
- Firefox
- Safari
- Edge

### 7. Vérifier les paramètres réseau
- Vérifiez que vous n'êtes pas sur un réseau d'entreprise avec des restrictions
- Vérifiez les paramètres de votre routeur/modem

## Test depuis la ligne de commande

Pour vérifier que le site fonctionne :
```bash
curl -I http://vika-game.ru/
# Devrait retourner: HTTP/1.1 200 OK
```

## Contact
Si le problème persiste après avoir essayé toutes ces solutions, le problème est probablement lié à votre configuration réseau locale ou à un firewall/proxy intermédiaire.
