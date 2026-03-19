---
sidebar_position: 5
title: Schnellstart
---

# 🚀 Kubernetes in 5 Minuten bereitstellen

Diese Anleitung begleitet Sie bei der Erstellung Ihres ersten Kubernetes-Clusters auf Hikube, von der Basiskonfiguration bis zur Bereitstellung einer Testanwendung.

---

## Voraussetzungen

Stellen Sie vor Beginn sicher, dass Sie Folgendes haben:

- **Zugriff auf einen Hikube-Tenant** mit entsprechenden Berechtigungen
- **CLI kubectl konfiguriert**, um mit der Hikube-API zu interagieren
- **Kubernetes-Grundkenntnisse** (Pods, Services, Deployments)

---

## Schritt 1: Cluster-Konfiguration

### **Einfacher Kubernetes-Cluster**

Erstellen Sie eine Datei `my-first-cluster.yaml` mit folgender Konfiguration:

```yaml title="my-first-cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-first-cluster
spec:
  # Konfiguration der Steuerungsebene
  controlPlane:
    replicas: 2  # Hochverfügbarkeit

  # Konfiguration der Worker-Knoten
  nodeGroups:
    general:
      minReplicas: 1
      maxReplicas: 5
      instanceType: "s1.large"     # 4 vCPU, 8 GB RAM
      ephemeralStorage: 50Gi       # Speicher für die Systempartition
      resources: {}               # Erforderlich — instanceType bestimmt die Werte
      roles:
        - ingress-nginx           # Ingress-Unterstützung

  # Aktiviert die Replikation des Speichers
  storageClass: "replicated"

  # Wesentliche Add-ons aktiviert
  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
      hosts:
        - my-app.example.com
```

:::warning Feld `resources` erforderlich
Das Feld `resources` ist in jeder Node Group erforderlich, auch wenn Sie `instanceType` verwenden. Mit `resources: {}` werden die CPU-/Speicherwerte durch `instanceType` bestimmt. Wenn Sie explizite Werte angeben (z.B. `cpu: 4, memory: 8Gi`), **überschreiben** diese `instanceType`.
:::

### **Cluster bereitstellen**

```bash
# Konfiguration anwenden
kubectl apply -f my-first-cluster.yaml

# Bereitstellungsstatus prüfen
kubectl get kubernetes my-first-cluster -w
```

**Wartezeit:** Der Cluster ist in 3-5 Minuten bereit

---

## 🔐 Schritt 2: Zugriff auf den Cluster

### **Kubeconfig abrufen**

Sobald der Cluster bereitgestellt ist, rufen Sie die Zugangsinformationen ab:

```bash
# Kubeconfig des Clusters abrufen
kubectl get tenantsecret my-first-cluster-admin-kubeconfig \
  -o go-template='{{ index .data "super-admin.conf" | base64decode }}' \
  > my-cluster-kubeconfig.yaml

# kubectl für den neuen Cluster konfigurieren
export KUBECONFIG=my-cluster-kubeconfig.yaml

# Verbindung testen
kubectl get nodes
```

**Erwartetes Ergebnis:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-first-cluster-md0-xxxxx   Ready    <none>   2m    v1.29.0
```

---

## 🚀 Schritt 3: Bereitstellung einer Anwendung

### **Demo-Anwendung**

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
# Anwendung bereitstellen
kubectl apply -f demo-app.yaml

# Bereitstellung prüfen
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get ingress
```

---

## ✅ Schritt 4: Überprüfung und Tests

### **Prüfen, ob alles funktioniert**

```bash
# Pod-Status
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
# Externe IP des Ingress Controllers abrufen
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Lokaler Test (bis die DNS-Konfiguration steht)
kubectl port-forward svc/hello-hikube-service 8080:80 &
curl http://localhost:8080
```

---

## 📊 Schritt 5: Monitoring und Observability

### **Integrierte Dashboards**

Wenn Sie das Monitoring bei der Tenant-Konfiguration aktiviert haben:

```bash
# Monitoring-Services prüfen
kubectl get pods -n monitoring

# Zugriff auf Grafana (je nach Tenant-Konfiguration)
kubectl get ingress -n monitoring
```

### **Cluster-Metriken**

```bash
# Knoten-Metriken
kubectl top nodes

# Pod-Metriken
kubectl top pods

# Cluster-Events
kubectl get events --sort-by=.metadata.creationTimestamp
```

---

## 🎛️ Schritt 6: Verwaltung und Skalierung

### **Cluster-Skalierung**

Der Hikube-Cluster kann die Anzahl der Knoten automatisch je nach Bedarf anpassen:

```bash
# Aktuelle Knotenanzahl prüfen
kubectl get nodes

# NodeGroup-Konfiguration anzeigen
kubectl get kubernetes my-first-cluster -o yaml | grep -A 10 nodeGroups

# Die automatische Skalierung wird durch die angeforderten Ressourcen ausgelöst
# Beispiel: Mehr Pods bereitzustellen erfordert mehr Knoten
kubectl scale deployment hello-hikube --replicas=6
```

### **Skalierung beobachten**

```bash
# Automatische Hinzufügung von Knoten beobachten
kubectl get nodes -w

# Skalierungsmetriken prüfen
kubectl describe hpa  # Wenn HPA konfiguriert ist
```

---

## 🔧 Schritt 7: Nächste Schritte

### **Erweiterte Konfiguration**

Nun da Ihr Cluster funktioniert, erkunden Sie die erweiterten Funktionen:

```bash
# Um Node Groups hinzuzufügen, bearbeiten Sie die YAML-Datei und wenden Sie sie erneut an
# Beispiel in my-first-cluster.yaml:
# nodeGroups:
#   general:
#     # ... bestehende Konfiguration
#   compute:
#     minReplicas: 0
#     maxReplicas: 3
#     instanceType: "s1.2xlarge"
#     ephemeralStorage: 100Gi

# Dann die Änderungen anwenden
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
  storageClassName: replicated  # Hochverfügbarer Speicher
  resources:
    requests:
      storage: 10Gi
```

---

## 🚨 Schnelle Fehlerbehebung

### **Häufige Probleme**

```bash
# Cluster-Erstellung dauert zu lange
kubectl describe kubernetes my-first-cluster

# Knoten nicht Ready
kubectl describe nodes

# Pods im Fehlerzustand
kubectl logs -l app=hello-hikube
kubectl describe pod <pod-name>

# Ingress funktioniert nicht
kubectl describe ingress hello-hikube-ingress
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller
```

### **Bereinigung**

```bash
# Testanwendung löschen
kubectl delete -f demo-app.yaml

# Cluster löschen (ACHTUNG: irreversible Aktion)
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

**💡 Tipp:** Bewahren Sie Ihre `kubeconfig`-Datei sicher auf und denken Sie daran, RBAC zu konfigurieren, um den Zugriff auf Ihren Cluster je nach Teams und Umgebungen zu steuern.
