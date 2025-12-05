# 🌐 Accès à Grafana

## Problème

Le NodePort n'est pas accessible depuis l'extérieur sur Minikube. Voici plusieurs solutions :

## Solution 1 : Port-Forward (Recommandé pour test rapide)

```bash
kubectl port-forward -n intelectgame service/grafana 3000:3000
```

Puis ouvrez : **http://localhost:3000**

**Avantages :**
- ✅ Simple et rapide
- ✅ Fonctionne immédiatement
- ✅ Pas de configuration réseau

**Inconvénients :**
- ❌ Doit rester actif (ne fermez pas le terminal)
- ❌ Accessible seulement depuis la machine locale

## Solution 2 : Minikube Tunnel (Recommandé pour accès public)

```bash
# Dans un terminal séparé
minikube tunnel
```

Puis accédez via : **http://<VM_IP>:3000**

**Avantages :**
- ✅ Accessible depuis l'extérieur
- ✅ Pas besoin de garder un terminal ouvert après démarrage
- ✅ IP stable

**Inconvénients :**
- ❌ Nécessite minikube
- ❌ Doit être lancé au démarrage

## Solution 3 : LoadBalancer (Si supporté)

```bash
# Changer le type de service
kubectl patch service grafana -n intelectgame -p '{"spec":{"type":"LoadBalancer"}}'

# Attendre l'IP externe
kubectl get svc grafana -n intelectgame -w
```

Puis accédez via l'IP externe affichée.

## Solution 4 : Ingress (Pour production)

Si vous avez un Ingress Controller (comme Nginx), créez un Ingress :

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: grafana-ingress
  namespace: intelectgame
spec:
  rules:
  - host: grafana.votre-domaine.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: grafana
            port:
              number: 3000
```

## Solution 5 : Script automatique

```bash
./k8s/monitoring/expose-grafana.sh
```

## 🔐 Credentials

- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Changez le mot de passe après la première connexion !**

## 📊 Vérification

```bash
# Vérifier que Grafana est prêt
kubectl get pods -n intelectgame -l app=grafana

# Vérifier les logs
kubectl logs -n intelectgame -l app=grafana --tail=20

# Vérifier le service
kubectl get svc grafana -n intelectgame
```

## 🎯 Recommandation

Pour un accès rapide : **Solution 1 (port-forward)**  
Pour un accès public : **Solution 2 (minikube tunnel)**

