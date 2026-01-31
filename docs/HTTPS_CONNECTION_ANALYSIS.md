# Analyse : https://vika-game.ru/ ne charge pas

## Diagnostic effectué

### 1. Connexion TCP
- **DNS** : vika-game.ru → 82.202.141.248 ✅
- **Port 443** : connexion TCP réussie (`Connected to vika-game.ru port 443`) ✅
- **Client Hello TLS** : envoyé par le client ✅

### 2. Problème identifié
**SSL connection timeout** : le serveur ne répond pas au Client Hello TLS.
La poignée de main TLS ne se termine jamais (timeout après ~10 s).

### 3. Ce qui fonctionne côté serveur
- HTTPS sur **localhost** (127.0.0.1) : HTTP/2 200 ✅
- HTTP (80) : redirection 308 vers HTTPS ✅
- Traefik écoute sur 0.0.0.0:443 ✅
- Firewall iptables : policy ACCEPT ✅

### 4. Hypothèses

| Cause possible | Probabilité | Vérification |
|----------------|-------------|--------------|
| **Pare-feu Cloud.ru** | Élevée | Port 443 peut être bloqué au niveau du cloud (security groups, firewall). |
| **Protection DDoS / proxy** | Moyenne | Interception ou filtrage du trafic TLS par le fournisseur. |
| **MTU / fragmentation** | Faible | Client Hello trop gros ou problème de fragmentation. |
| **Certificat / TLS** | Faible | OK en localhost, donc config TLS probablement correcte. |

### 5. Actions recommandées

#### A. Vérifier le pare-feu Cloud.ru
1. Connexion au panneau Cloud.ru
2. Sécurité / Firewall / Security Groups
3. Vérifier que le port **443/TCP** est **ouvert** en entrée pour 0.0.0.0/0 (ou les plages d’IP souhaitées)

#### B. Vérifier si Cloudflare est utilisé
- Si le domaine passe par Cloudflare :
  - Mode SSL : **Full** ou **Full (strict)**
  - Sinon, Cloudflare ne pourra pas établir une connexion HTTPS correcte vers l’origine

#### C. Tester depuis d’autres réseaux
- Réseau mobile (4G/5G)
- Autre fournisseur d’accès
- Outils en ligne : https://www.sslshopper.com/ssl-checker.html

#### D. Test depuis le serveur
```bash
# Depuis le serveur, vérifier que HTTPS répond en local
ssh user1@82.202.141.248 'curl -sI -k -H "Host: vika-game.ru" https://127.0.0.1/'
# Doit retourner HTTP/2 200
```

#### E. Vérifier les logs Traefik
```bash
ssh user1@82.202.141.248 'docker logs intelectgame-traefik 2>&1 | tail -100'
```
Les requêtes HTTPS externes n’apparaissent pas, ce qui indique qu’elles n’atteignent pas Traefik.

### 6. Conclusion
Le blocage est probablement en amont du serveur (pare-feu Cloud.ru ou équivalent).  
Traefik, les services et le certificat semblent corrects car tout fonctionne en localhost.
