# Guide d'accès public à l'application

## ✅ État actuel

L'application fonctionne et est accessible via l'IP de Minikube :
- ✅ `http://192.168.49.2:30081` (fonctionne)

Mais n'est pas accessible via l'IP publique :
- ❌ `http://82.202.141.248:30081` (Connection refused)

## 🔍 Diagnostic

Exécutez le script de diagnostic :

```bash
./k8s/expose-public-access.sh
```

## 🔧 Solutions

### Solution 1 : Vérifier le firewall du provider cloud

Le port 30081 doit être ouvert dans le firewall de cloud.ru :

1. Connectez-vous au panneau de contrôle de cloud.ru
2. Allez dans la section "Firewall" ou "Sécurité"
3. Ajoutez une règle pour autoriser le port 30081 (TCP) depuis toutes les sources (0.0.0.0/0)

### Solution 2 : Utiliser minikube tunnel avec LoadBalancer

Convertir le service en LoadBalancer et utiliser minikube tunnel :

```bash
# Convertir le service en LoadBalancer
kubectl patch service nginx-proxy -n intelectgame -p '{"spec":{"type":"LoadBalancer"}}'

# Vérifier que minikube tunnel est actif
sudo minikube tunnel

# Obtenir l'IP externe
kubectl get service nginx-proxy -n intelectgame
```

### Solution 3 : Utiliser un reverse proxy externe (Nginx)

Installer Nginx sur la VM et configurer un reverse proxy :

```bash
# Installer Nginx
sudo apt-get update
sudo apt-get install -y nginx

# Créer la configuration
sudo tee /etc/nginx/sites-available/intelectgame <<EOF
server {
    listen 80;
    server_name 82.202.141.248;

    location / {
        proxy_pass http://192.168.49.2:30081;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Activer le site
sudo ln -s /etc/nginx/sites-available/intelectgame /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Ouvrir le port 80 dans le firewall
sudo ufw allow 80/tcp
```

Puis accédez via : `http://82.202.141.248`

### Solution 4 : Utiliser un port standard (80 ou 443)

Si le provider cloud autorise les ports 80/443, changez le NodePort :

```bash
# Modifier le service pour utiliser le port 80
kubectl patch service nginx-proxy -n intelectgame -p '{"spec":{"ports":[{"port":80,"targetPort":80,"nodePort":80}]}}'

# OU utiliser le port 443 pour HTTPS
kubectl patch service nginx-proxy -n intelectgame -p '{"spec":{"ports":[{"port":443,"targetPort":80,"nodePort":443}]}}'
```

## 🧪 Tests

### Test 1 : Depuis la VM

```bash
# Test local
curl http://localhost:30081

# Test via IP Minikube
curl http://192.168.49.2:30081

# Test via IP publique
curl http://82.202.141.248:30081
```

### Test 2 : Depuis l'extérieur

Depuis votre machine locale ou un autre serveur :

```bash
curl http://82.202.141.248:30081
```

### Test 3 : Vérifier le firewall local

```bash
# Vérifier ufw
sudo ufw status

# Vérifier iptables
sudo iptables -L -n | grep 30081
```

## 📝 Commandes utiles

```bash
# Vérifier l'état de minikube tunnel
pgrep -f "minikube tunnel"
sudo tail -f /tmp/minikube-tunnel.log

# Vérifier les services
kubectl get services -n intelectgame

# Vérifier les routes
ip route | grep 192.168.49

# Tester la connectivité
nc -zv 82.202.141.248 30081
```

## ⚠️ Problèmes courants

### "Connection refused" via IP publique

**Causes possibles :**
1. Firewall du provider cloud bloque le port
2. Minikube tunnel ne route pas correctement
3. Le service NodePort n'est pas correctement exposé

**Solutions :**
- Vérifier le firewall du provider cloud
- Utiliser un reverse proxy externe (Solution 3)
- Convertir en LoadBalancer (Solution 2)

### "Timeout" via IP publique

**Causes possibles :**
1. Le port n'est pas ouvert dans le firewall
2. Le service n'est pas accessible depuis l'extérieur

**Solutions :**
- Ouvrir le port dans le firewall du provider
- Vérifier que minikube tunnel est actif

## 🎯 Solution recommandée

Pour une production, je recommande la **Solution 3** (reverse proxy Nginx externe) car :
- Plus simple à gérer
- Permet d'ajouter facilement HTTPS/SSL
- Meilleure performance
- Plus de contrôle sur le routage

