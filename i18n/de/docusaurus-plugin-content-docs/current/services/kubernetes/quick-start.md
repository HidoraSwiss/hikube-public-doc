---
sidebar_position: 5
title: Schnellstart
---

# 🚀 Kubernetes in 5 Minuten bereitstellen

Dieser Leitfaden begleitet Sie bei der Erstellung Ihres ersten Kubernetes-Clusters auf Hikube, von der Grundkonfiguration bis zum Deployment einer Testanwendung.

---

## Voraussetzungen

Stellen Sie vor dem Start sicher, dass Sie Folgendes haben:

- **Zugang zu einem Hikube-Tenant** mit entsprechenden Berechtigungen
- **CLI kubectl konfiguriert** für die Interaktion mit der Hikube-API
- **Kubernetes-Grundkenntnisse** (Pods, Services, Deployments)

---

## Schritt 1: Cluster-Konfiguration

### **Basis-Kubernetes-Cluster**

Erstellen Sie eine Datei `my-first-cluster.yaml` mit folgender Konfiguration:

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

:::warning Feld `resources` obligatorisch
Das Feld `resources` ist in jeder Node Group erforderlich, auch wenn Sie `instanceType` verwenden. Mit `resources: {}` werden die CPU-/Speicherwerte durch `instanceType` bestimmt. Wenn Sie explizite Werte angeben (z.B. `cpu: 4, memory: 8Gi`), **überschreiben** diese `instanceType`.
:::

### **Cluster bereitstellen**

```bash
# Appliquer la configuration
kubectl apply -f my-first-cluster.yaml

# Vérifier le statut de déploiement
kubectl get kubernetes my-first-cluster -w
```

**Wartezeit:** Der Cluster ist in 3-5 Minuten bereit

---

## 🔐 Schritt 2: Zugriff auf den Cluster

### **Kubeconfig abrufen**

Sobald der Cluster bereitgestellt ist, rufen Sie die Zugangsdaten ab:

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

**Erwartetes Ergebnis:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-first-cluster-md0-xxxxx   Ready    <none>   2m    v1.29.0
```

---

## 🚀 Schritt 3: Anwendungs-Deployment

### **Demoanwendung**

Stellen wir eine einfache Webanwendung bereit, um unseren Cluster zu testen:

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

### **Anwendung bereitstellen**

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

## ✅ Schritt 4: Überprüfung und Tests

### **Überprüfen, dass alles funktioniert**

```bash
# Statut des pods
kubectl get pods -l app=hello-hikube
```

**Erwartetes Ergebnis:**

```console
NAME                           READY   STATUS    RESTARTS   AGE
hello-hikube-xxxxx-xxxx        1/1     Running   0          1m
hello-hikube-xxxxx-yyyy        1/1     Running   0          1m
hello-hikube-xxxxx-zzzz        1/1     Running   0          1m
```

### **Zugriff auf die Anwendung**

```bash
# Obtenir l'IP externe de l'Ingress Controller
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Test local (en attendant la configuration DNS)
kubectl port-forward svc/hello-hikube-service 8080:80 &
curl http://localhost:8080
```

---

## 📊 Schritt 5: Monitoring und Observability

### **Integrierte Dashboards**

Wenn Sie das Monitoring bei der Tenant-Konfiguration aktiviert haben:

```bash
# Vérifier les services de monitoring
kubectl get pods -n monitoring

# Accéder à Grafana (selon configuration du tenant)
kubectl get ingress -n monitoring
```

### **Cluster-Metriken**

```bash
# Métriques des nœuds
kubectl top nodes

# Métriques des pods
kubectl top pods

# Events du cluster
kubectl get events --sort-by=.metadata.creationTimestamp
```

---

## 🎛️ Schritt 6: Verwaltung und Skalierung

### **Cluster-Skalierung**

Der Hikube-Cluster kann die Anzahl der Knoten automatisch an die Nachfrage anpassen:

```bash
# Vérifier le nombre de nœuds actuel
kubectl get nodes

# Voir la configuration du nodeGroup
kubectl get kubernetes my-first-cluster -o yaml | grep -A 10 nodeGroups

# Le scaling automatique se déclenche selon les ressources demandées
# Exemple : déployer plus de pods nécessitera plus de nœuds
kubectl scale deployment hello-hikube --replicas=6
```

### **Skalierung beobachten**

```bash
# Voir l'ajout automatique de nœuds
kubectl get nodes -w

# Vérifier les métriques de scaling
kubectl describe hpa  # Si HPA est configuré
```

---

## 🔧 Schritt 7: Nächste Schritte

### **Erweiterte Konfiguration**

Jetzt, da Ihr Cluster läuft, erkunden Sie die erweiterten Funktionen:

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

### **Persistenter Speicher**

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

## 🚨 Schnelle Fehlerbehebung

### **Häufige Probleme**

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

### **Bereinigung**

```bash
# Supprimer l'application de test
kubectl delete -f demo-app.yaml

# Supprimer le cluster (ATTENTION: action irréversible)
kubectl delete kubernetes my-first-cluster
```

---

## 📋 Zusammenfassung

Sie haben erstellt:

- Einen Kubernetes-Cluster mit verwalteter Steuerungsebene
- Worker-Knoten mit automatischer Skalierung (1-5 Knoten)
- Eine Beispielanwendung mit Ingress
- Ein automatisches SSL-Zertifikat über cert-manager

## 🚀 Nächste Schritte

- **[API-Referenz](./api-reference.md)** → Vollständige Cluster-Konfiguration
- **[GPU](../gpu/overview.md)** → GPUs mit Kubernetes verwenden

---

**💡 Tipp:** Bewahren Sie Ihre `kubeconfig`-Datei sicher auf und denken Sie daran, RBAC zu konfigurieren, um den Zugriff auf Ihren Cluster nach Teams und Umgebungen zu steuern.
