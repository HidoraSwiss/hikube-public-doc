---
sidebar_position: 5
title: Avvio rapido
---

# 🚀 Distribuire Kubernetes in 5 minuti

Questa guida vi accompagna nella creazione del vostro primo cluster Kubernetes su Hikube, dalla configurazione di base alla distribuzione di un'applicazione di test.

---

## Prerequisiti

Prima di iniziare, assicuratevi di avere:

- **Accesso a un tenant Hikube** con permessi appropriati
- **CLI kubectl configurato** per interagire con l'API Hikube
- **Nozioni di base Kubernetes** (pod, servizi, deployment)

---

## Fase 1: Configurazione del Cluster

### **Cluster Kubernetes Base**

Create un file `my-first-cluster.yaml` con la seguente configurazione:

```yaml title="my-first-cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-first-cluster
spec:
  # Configurazione del piano di controllo
  controlPlane:
    replicas: 2  # Alta disponibilità

  # Configurazione dei nodi worker
  nodeGroups:
    general:
      minReplicas: 1
      maxReplicas: 5
      instanceType: "s1.large"     # 4 vCPU, 8 GB RAM
      ephemeralStorage: 50Gi       # Archiviazione partizione sistema
      resources: {}               # Richiesto — instanceType definisce i valori
      roles:
        - ingress-nginx           # Supporto Ingress

  # Attiva la replica sull'archiviazione
  storageClass: "replicated"

  # Add-on essenziali attivati
  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
      hosts:
        - my-app.example.com
```

:::warning Campo `resources` obbligatorio
Il campo `resources` e richiesto in ogni node group, anche se utilizzate `instanceType`. Con `resources: {}`, i valori CPU/memoria sono determinati da `instanceType`. Se specificate valori espliciti (es. `cpu: 4, memory: 8Gi`), questi **sovrascrivono** `instanceType`.
:::

### **Distribuire il Cluster**

```bash
# Applicare la configurazione
kubectl apply -f my-first-cluster.yaml

# Verificare lo stato di distribuzione
kubectl get kubernetes my-first-cluster -w
```

**Tempo di attesa:** Il cluster sara pronto in 3-5 minuti

---

## 🔐 Fase 2: Accesso al Cluster

### **Recuperare il Kubeconfig**

Una volta distribuito il cluster, recuperate le informazioni di accesso:

```bash
# Recuperare il kubeconfig del cluster
kubectl get tenantsecret my-first-cluster-admin-kubeconfig \
  -o go-template='{{ index .data "super-admin.conf" | base64decode }}' \
  > my-cluster-kubeconfig.yaml

# Configurare kubectl per il nuovo cluster
export KUBECONFIG=my-cluster-kubeconfig.yaml

# Testare la connessione
kubectl get nodes
```

**Risultato atteso:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-first-cluster-md0-xxxxx   Ready    <none>   2m    v1.29.0
```

---

## 🚀 Fase 3: Distribuzione di un'Applicazione

### **Applicazione dimostrativa**

Distribuiamo un'applicazione web semplice per testare il nostro cluster:

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

### **Distribuire l'Applicazione**

```bash
# Distribuire l'applicazione
kubectl apply -f demo-app.yaml

# Verificare la distribuzione
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get ingress
```

---

## ✅ Fase 4: Verifica e Test

### **Verificare che tutto funzioni**

```bash
# Stato dei pod
kubectl get pods -l app=hello-hikube
```

**Risultato atteso:**

```console
NAME                           READY   STATUS    RESTARTS   AGE
hello-hikube-xxxxx-xxxx        1/1     Running   0          1m
hello-hikube-xxxxx-yyyy        1/1     Running   0          1m
hello-hikube-xxxxx-zzzz        1/1     Running   0          1m
```

### **Accesso all'applicazione**

```bash
# Ottenere l'IP esterno dell'Ingress Controller
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Test locale (in attesa della configurazione DNS)
kubectl port-forward svc/hello-hikube-service 8080:80 &
curl http://localhost:8080
```

---

## 📊 Fase 5: Monitoring e Osservabilita

### **Dashboard Integrate**

Se avete attivato il monitoring durante la configurazione del tenant:

```bash
# Verificare i servizi di monitoring
kubectl get pods -n monitoring

# Accedere a Grafana (secondo la configurazione del tenant)
kubectl get ingress -n monitoring
```

### **Metriche del Cluster**

```bash
# Metriche dei nodi
kubectl top nodes

# Metriche dei pod
kubectl top pods

# Eventi del cluster
kubectl get events --sort-by=.metadata.creationTimestamp
```

---

## 🎛️ Fase 6: Gestione e Scaling

### **Scaling del Cluster**

Il cluster Hikube può regolare automaticamente il numero di nodi in base alla domanda:

```bash
# Verificare il numero di nodi attuale
kubectl get nodes

# Vedere la configurazione del nodeGroup
kubectl get kubernetes my-first-cluster -o yaml | grep -A 10 nodeGroups

# Lo scaling automatico si attiva in base alle risorse richieste
# Esempio: distribuire più pod richiederà più nodi
kubectl scale deployment hello-hikube --replicas=6
```

### **Osservare lo Scaling**

```bash
# Vedere l'aggiunta automatica di nodi
kubectl get nodes -w

# Verificare le metriche di scaling
kubectl describe hpa  # Se HPA è configurato
```

---

## 🔧 Fase 7: Prossime Azioni

### **Configurazione Avanzata**

Ora che il vostro cluster funziona, esplorate le funzionalità avanzate:

```bash
# Per aggiungere node group, modificate il file YAML e ri-applicate
# Esempio in my-first-cluster.yaml:
# nodeGroups:
#   general:
#     # ... configurazione esistente
#   compute:
#     minReplicas: 0
#     maxReplicas: 3
#     instanceType: "s1.2xlarge"
#     ephemeralStorage: 100Gi

# Poi applicare le modifiche
kubectl apply -f my-first-cluster.yaml
```

### **Archiviazione Persistente**

```yaml title="persistent-app.yaml"
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-app-storage
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: replicated  # Archiviazione altamente disponibile
  resources:
    requests:
      storage: 10Gi
```

---

## 🚨 Risoluzione Rapida dei Problemi

### **Problemi Comuni**

```bash
# Cluster in creazione troppo lungo
kubectl describe kubernetes my-first-cluster

# Nodi non Ready
kubectl describe nodes

# Pod in errore
kubectl logs -l app=hello-hikube
kubectl describe pod <pod-name>

# Ingress non funzionante
kubectl describe ingress hello-hikube-ingress
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller
```

### **Pulizia**

```bash
# Eliminare l'applicazione di test
kubectl delete -f demo-app.yaml

# Eliminare il cluster (ATTENZIONE: azione irreversibile)
kubectl delete kubernetes my-first-cluster
```

---

## 📋 Riepilogo

Avete creato:

- Un cluster Kubernetes con piano di controllo gestito
- Nodi worker con scaling automatico (1-5 nodi)
- Un'applicazione d'esempio con Ingress
- Un certificato SSL automatico tramite cert-manager

## 🚀 Prossimi Passi

- **[Riferimento API](./api-reference.md)** → Configurazione completa dei cluster
- **[GPU](../gpu/overview.md)** → Utilizzare GPU con Kubernetes

---

**💡 Consiglio:** Conservate il vostro file `kubeconfig` in modo sicuro e pensate a configurare RBAC per controllare l'accesso al vostro cluster secondo i vostri team e ambienti.
