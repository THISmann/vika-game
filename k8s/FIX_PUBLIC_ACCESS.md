# 🔧 Résolution du problème d'accès public

## Problème

L'application est accessible via l'IP de Minikube (`192.168.49.2:30080`) mais pas via l'IP publique de la VM (`82.202.141.248:30080`).

**Cause** : Minikube crée un réseau virtuel isolé. Le NodePort n'est accessible que depuis l'IP de Minikube, pas directement depuis l'IP publique de la VM.

## Solutions

### Solution 1 : minikube tunnel (⭐ Recommandé - Le plus simple)

Cette solution expose les services via LoadBalancer et les rend accessibles publiquement.

```bash
./k8s/fix-public-access.sh
# Choisir l'option 1 (minikube tunnel)
```

Ou manuellement :

```bash
# Changer le service en LoadBalancer
kubectl patch service frontend -n intelectgame -p '{"spec":{"type":"LoadBalancer"}}'

# Démarrer minikube tunnel (en arrière-plan)
nohup minikube tunnel > /tmp/minikube-tunnel.log 2>&1 &

# Vérifier l'IP LoadBalancer
kubectl get service frontend -n intelectgame
```

**Avantages** :
- ✅ Simple et rapide
- ✅ Fonctionne automatiquement
- ✅ Pas de configuration supplémentaire

**Inconvénients** :
- ⚠️ Doit rester actif (processus en arrière-plan)

### Solution 2 : Nginx Reverse Proxy (⭐ Recommandé pour production)

Configure Nginx pour proxy les requêtes vers Minikube.

```bash
./k8s/setup-nginx-proxy.sh
```

Ou manuellement :

```bash
# Installer Nginx
sudo apt update
sudo apt install -y nginx

# Créer la configuration
sudo nano /etc/nginx/sites-available/intelectgame
```

Contenu :
```nginx
server {
    listen 80;
    server_name 82.202.141.248;

    location / {
        proxy_pass http://192.168.49.2:30080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Activer
sudo ln -s /etc/nginx/sites-available/intelectgame /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Ouvrir le port 80
sudo ufw allow 80/tcp
```

**Avantages** :
- ✅ Stable et fiable
- ✅ Support SSL/TLS facile
- ✅ Configuration flexible
- ✅ Idéal pour la production

### Solution 3 : Port Forwarding avec iptables

Configure le port forwarding système.

```bash
./k8s/setup-port-forwarding.sh
```

Ou manuellement :

```bash
MINIKUBE_IP=$(minikube ip)
NODEPORT=30080

# Ajouter la règle
sudo iptables -t nat -A PREROUTING -p tcp --dport ${NODEPORT} -j DNAT --to-destination ${MINIKUBE_IP}:${NODEPORT}
sudo iptables -A FORWARD -p tcp -d ${MINIKUBE_IP} --dport ${NODEPORT} -j ACCEPT

# Sauvegarder les règles (pour qu'elles persistent)
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

**Avantages** :
- ✅ Pas de service supplémentaire
- ✅ Performance directe

**Inconvénients** :
- ⚠️ Configuration système plus complexe
- ⚠️ Peut nécessiter des permissions root

### Solution 4 : socat (Alternative simple)

Utilise socat pour le port forwarding.

```bash
# Installer socat
sudo apt install -y socat

# Démarrer le forwarding
MINIKUBE_IP=$(minikube ip)
nohup socat TCP-LISTEN:30080,fork,reuseaddr TCP:${MINIKUBE_IP}:30080 > /dev/null 2>&1 &
```

## Solution rapide (recommandée)

Pour une solution rapide et simple, utilisez **minikube tunnel** :

```bash
./k8s/fix-public-access.sh
```

Choisissez l'option 1, et l'application sera accessible via `http://82.202.141.248`.

## Vérification

Après avoir configuré une solution, testez :

```bash
# Depuis la VM
curl http://82.202.141.248

# Depuis l'extérieur
curl http://82.202.141.248
```

## Pour la production

Pour un déploiement en production, utilisez **Nginx** (Solution 2) avec SSL/TLS :

```bash
./k8s/setup-nginx-proxy.sh

# Puis configurer SSL avec Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

## Dépannage

### minikube tunnel ne fonctionne pas

```bash
# Vérifier que tunnel est actif
ps aux | grep "minikube tunnel"

# Voir les logs
cat /tmp/minikube-tunnel.log

# Redémarrer
pkill -f "minikube tunnel"
nohup minikube tunnel > /tmp/minikube-tunnel.log 2>&1 &
```

### Nginx ne fonctionne pas

```bash
# Vérifier les logs
sudo tail -f /var/log/nginx/intelectgame-error.log

# Tester la configuration
sudo nginx -t

# Vérifier le statut
sudo systemctl status nginx
```

### Le port forwarding ne fonctionne pas

```bash
# Vérifier les règles iptables
sudo iptables -t nat -L -n -v

# Vérifier que le forwarding est activé
cat /proc/sys/net/ipv4/ip_forward
# Doit retourner 1, sinon: sudo sysctl -w net.ipv4.ip_forward=1
```

