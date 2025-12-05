# 🚀 Guide de Démarrage Rapide - VM cloud.ru

## Déploiement en 3 étapes

### 1️⃣ Déployer l'application

```bash
cd /chemin/vers/gameV2
chmod +x k8s/*.sh
./k8s/deploy-vm.sh --rebuild
```

Lors de la première exécution, entrez votre token Telegram Bot quand demandé.

### 2️⃣ Vérifier le statut

```bash
./k8s/status.sh
```

### 3️⃣ Exposer publiquement

**Option A : NodePort (simple)**
```bash
./k8s/expose-public.sh
```

**Option B : minikube tunnel (recommandé)**
```bash
./k8s/deploy-vm-minikube-tunnel.sh
```

## 📋 Commandes principales

| Commande | Description |
|----------|-------------|
| `./k8s/deploy-vm.sh --rebuild` | Déployer/reconstruire l'application |
| `./k8s/status.sh` | Voir le statut de l'application |
| `./k8s/expose-public.sh` | Exposer publiquement (NodePort) |
| `./k8s/undeploy.sh` | Supprimer le déploiement |

## 🔗 Accès à l'application

Après le déploiement, l'application sera accessible via :
- **IP de Minikube** : `http://<minikube-ip>:30080`
- **IP de la VM** : `http://<vm-ip>:30080`

Pour obtenir l'IP :
```bash
minikube ip  # IP de Minikube
hostname -I  # IP de la VM
```

## 🔄 Mise à jour

Pour mettre à jour l'application après avoir modifié le code :

```bash
git pull  # Mettre à jour le code
./k8s/deploy-vm.sh --rebuild  # Reconstruire et redéployer
```

## 📝 Logs

```bash
# Voir les logs d'un service
kubectl logs -f deployment/auth-service -n intelectgame
kubectl logs -f deployment/game-service -n intelectgame
kubectl logs -f deployment/telegram-bot -n intelectgame
```

## ⚠️ Dépannage

Si quelque chose ne fonctionne pas :

1. Vérifier le statut : `./k8s/status.sh`
2. Voir les logs : `kubectl logs <pod-name> -n intelectgame`
3. Redémarrer un service : `kubectl rollout restart deployment/<service> -n intelectgame`

## 📚 Documentation complète

Consultez `k8s/VM_DEPLOYMENT.md` pour la documentation complète.

