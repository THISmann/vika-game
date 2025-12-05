# 🚀 Accès Rapide à Grafana

## ✅ Solution la Plus Simple : Port-Forward

```bash
kubectl port-forward -n intelectgame service/grafana 3000:3000
```

**Puis ouvrez :** http://localhost:3000

⚠️ **Cette commande doit rester active.** Ouvrez un nouveau terminal pour continuer à travailler.

---

## 🌐 Accès Public (si nécessaire)

### Option 1 : Via l'IP Minikube (si tunnel actif)

```bash
# Obtenir l'IP de minikube
MINIKUBE_IP=$(minikube ip)
echo "http://$MINIKUBE_IP:3000"
```

### Option 2 : Ouvrir le port dans le firewall

```bash
# Sur la VM
sudo ufw allow 3000/tcp
sudo ufw reload

# Puis accéder via l'IP publique de la VM
# http://82.202.141.248:3000
```

### Option 3 : Utiliser le NodePort

Si le service a un NodePort (30300), ouvrez ce port :

```bash
sudo ufw allow 30300/tcp
sudo ufw reload

# Puis accéder via
# http://82.202.141.248:30300
```

---

## 🔍 Vérifier l'Accès

```bash
# Vérifier que Grafana répond
curl http://localhost:3000/api/health

# Ou avec port-forward actif
kubectl port-forward -n intelectgame service/grafana 3000:3000 &
sleep 2
curl http://localhost:3000/api/health
```

---

## 📋 Script Automatique

```bash
./k8s/monitoring/get-grafana-url.sh
```

Ce script affiche toutes les options d'accès disponibles.

---

## 🔐 Credentials

- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Changez le mot de passe après la première connexion !**

