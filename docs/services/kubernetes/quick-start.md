---
sidebar_position: 5
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# 🚀 Déployer Kubernetes en 5 minutes

Ce guide vous accompagne dans la création de votre premier cluster Kubernetes sur Hikube, de la configuration de base au déploiement d'une application de test.

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- **Accès à un tenant Hikube** avec permissions appropriées
- **CLI kubectl configuré** pour interagir avec l'API Hikube
- **Notions de base Kubernetes** (pods, services, deployments)

---

## Étape 1 : Configuration du Cluster

### **Cluster Kubernetes Basique**

Créez un fichier `my-first-cluster.yaml` avec la configuration suivante :

```yaml title="my-first-cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-first-cluster
spec:
  # Configuration du plan de contrôle
  controlPlane:
    replicas: 2  # Haute disponibilité

  # Configuration des nœuds workers
  nodeGroups:
    general:
      minReplicas: 1
      maxReplicas: 5
      instanceType: "s1.large"     # 4 vCPU, 8 GB RAM
      ephemeralStorage: 50Gi       # Stockage partition système
      resources: {}               # Requis — instanceType définit les valeurs
      roles:
        - ingress-nginx           # Support Ingress

  # Active la réplication sur le stockage
  storageClass: "replicated"

  # Add-ons essentiels activés
  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
      hosts:
        - my-app.example.com
```

:::warning Champ `resources` obligatoire
Le champ `resources` est requis dans chaque node group, même si vous utilisez `instanceType`. Avec `resources: {}`, les valeurs CPU/mémoire sont déterminées par `instanceType`. Si vous spécifiez des valeurs explicites (ex. `cpu: 4, memory: 8Gi`), elles **overrident** `instanceType`.
:::

### **Déployer le Cluster**

```bash
# Appliquer la configuration
kubectl apply -f my-first-cluster.yaml

# Vérifier le statut de déploiement
kubectl get kubernetes my-first-cluster -w
```

**Temps d'attente :** Le cluster sera prêt en 3-5 minutes

---

## 🔐 Étape 2 : Accès au Cluster

### **Récupérer le Kubeconfig**

Une fois le cluster déployé, récupérez les informations d'accès :

```bash
# Récupérer le kubeconfig du cluster
kubectl get tenantsecret my-first-cluster-admin-kubeconfig \
  -o go-template='{{ index .data "super-admin.conf" | base64decode }}' \
  > my-cluster-kubeconfig.yaml

# Configurer kubectl pour le nouveau cluster
export KUBECONFIG=my-cluster-kubeconfig.yaml

# Tester la connexion
kubectl get nodes
```

**Résultat attendu :**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-first-cluster-md0-xxxxx   Ready    <none>   2m    v1.29.0
```

---

## 🚀 Étape 3 : Déploiement d'une Application

### **Application de démonstration**

Déployons une application web simple pour tester notre cluster :

```yaml title="demo-app.yaml"
---
# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-hikube
  labels:
    app: hello-hikube
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello-hikube
  template:
    metadata:
      labels:
        app: hello-hikube
    spec:
      containers:
      - name: app
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
        env:
        - name: WELCOME_MESSAGE
          value: "Hello from Hikube Kubernetes!"

---
# Service
apiVersion: v1
kind: Service
metadata:
  name: hello-hikube-service
spec:
  selector:
    app: hello-hikube
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP

---
# Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hello-hikube-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: my-app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: hello-hikube-service
            port:
              number: 80
```

### **Déployer l'Application**

```bash
# Déployer l'application
kubectl apply -f demo-app.yaml

# Vérifier le déploiement
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get ingress
```

---

## ✅ Étape 4 : Vérification et Tests

### **Vérifier que tout fonctionne**

```bash
# Statut des pods
kubectl get pods -l app=hello-hikube
```

**Résultat attendu :**

```console
NAME                           READY   STATUS    RESTARTS   AGE
hello-hikube-xxxxx-xxxx        1/1     Running   0          1m
hello-hikube-xxxxx-yyyy        1/1     Running   0          1m
hello-hikube-xxxxx-zzzz        1/1     Running   0          1m
```

### **Accès à l'application**

```bash
# Obtenir l'IP externe de l'Ingress Controller
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Test local (en attendant la configuration DNS)
kubectl port-forward svc/hello-hikube-service 8080:80 &
curl http://localhost:8080
```

---

## 📊 Étape 5 : Monitoring et Observabilité

### **Dashboards Intégrés**

Si vous avez activé le monitoring lors de la configuration du tenant :

```bash
# Vérifier les services de monitoring
kubectl get pods -n monitoring

# Accéder à Grafana (selon configuration du tenant)
kubectl get ingress -n monitoring
```

### **Métriques Cluster**

```bash
# Métriques des nœuds
kubectl top nodes

# Métriques des pods
kubectl top pods

# Events du cluster
kubectl get events --sort-by=.metadata.creationTimestamp
```

---

## 🎛️ Étape 6 : Gestion et Scaling

### **Scaling du Cluster**

Le cluster Hikube peut ajuster automatiquement le nombre de nœuds selon la demande :

```bash
# Vérifier le nombre de nœuds actuel
kubectl get nodes

# Voir la configuration du nodeGroup
kubectl get kubernetes my-first-cluster -o yaml | grep -A 10 nodeGroups

# Le scaling automatique se déclenche selon les ressources demandées
# Exemple : déployer plus de pods nécessitera plus de nœuds
kubectl scale deployment hello-hikube --replicas=6
```

### **Observer le Scaling**

```bash
# Voir l'ajout automatique de nœuds
kubectl get nodes -w

# Vérifier les métriques de scaling
kubectl describe hpa  # Si HPA est configuré
```

---

## 🔧 Étape 7 : Prochaines Actions

### **Configuration Avancée**

Maintenant que votre cluster fonctionne, explorez les fonctionnalités avancées :

```bash
# Pour ajouter des node groups, modifiez le fichier YAML et ré-appliquez
# Exemple dans my-first-cluster.yaml :
# nodeGroups:
#   general:
#     # ... configuration existante
#   compute:
#     minReplicas: 0
#     maxReplicas: 3
#     instanceType: "s1.2xlarge"
#     ephemeralStorage: 100Gi

# Puis appliquer les changements
kubectl apply -f my-first-cluster.yaml
```

### **Stockage Persistant**

```yaml title="persistent-app.yaml"
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-app-storage
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: replicated  # Stockage hautement disponible
  resources:
    requests:
      storage: 10Gi
```

---

## 🚨 Dépannage Rapide

### **Problèmes Courants**

```bash
# Cluster en création trop long
kubectl describe kubernetes my-first-cluster

# Nœuds pas Ready
kubectl describe nodes

# Pods en erreur
kubectl logs -l app=hello-hikube
kubectl describe pod <pod-name>

# Ingress non fonctionnel
kubectl describe ingress hello-hikube-ingress
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller
```

### **Nettoyage**

```bash
# Supprimer l'application de test
kubectl delete -f demo-app.yaml

# Supprimer le cluster (ATTENTION: action irréversible)
kubectl delete kubernetes my-first-cluster
```

---

## 📋 Résumé

Vous avez créé :

- Un cluster Kubernetes avec plan de contrôle managé
- Des nœuds workers avec scaling automatique (1-5 nœuds)
- Une application d'exemple avec Ingress
- Un certificat SSL automatique via cert-manager

## 🚀 Prochaines Étapes

- **[API Reference](./api-reference.md)** → Configuration complète des clusters
- **[GPU](../gpu/overview.md)** → Utiliser des GPU avec Kubernetes

---

**💡 Conseil :** Gardez votre fichier `kubeconfig` en sécurité et pensez à configurer RBAC pour contrôler l'accès à votre cluster selon vos équipes et environnements.

<NavigationFooter
  nextSteps={[
    {label: "FAQ", href: "../faq"},
    {label: "Référence API", href: "../api-reference"},
  ]}
/>
