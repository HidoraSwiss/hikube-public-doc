---
title: "Come distribuire con Flux (GitOps)"
---

# Come distribuire con Flux (GitOps)

Questa guida spiega come attivare e configurare FluxCD su un cluster Kubernetes Hikube per distribuire le vostre applicazioni secondo l'approccio GitOps: un repository Git come fonte di verita per lo stato del vostro cluster.

## Prerequisiti

- Un cluster Kubernetes Hikube distribuito (vedere l'[avvio rapido](../quick-start.md))
- `kubectl` configurato per interagire con l'API Hikube
- Un repository Git accessibile contenente i vostri manifesti Kubernetes
- Il kubeconfig del cluster figlio recuperato

## Fasi

### 1. Preparare il repository Git

Organizzate il vostro repository Git con una struttura di directory contenente i vostri manifesti Kubernetes:

```
k8s-manifests/
├── namespaces/
│   └── production.yaml
├── apps/
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── ingress.yaml
│   └── backend/
│       ├── deployment.yaml
│       └── service.yaml
└── config/
    └── configmaps.yaml
```

:::tip
Flux sincronizza tutti i manifesti YAML trovati nella directory di destinazione e nelle sue sottodirectory. Organizzate i vostri file in modo logico per facilitare la manutenzione.
:::

### 2. Attivare l'addon FluxCD

Modificate la configurazione del vostro cluster per attivare FluxCD con l'URL del vostro repository:

```yaml title="cluster-gitops.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    general:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
      hosts:
        - app.example.com
    fluxcd:
      enabled: true
      valuesOverride:
        gitRepository:
          url: "https://github.com/company/k8s-manifests"
          branch: "main"
```

:::note
Per i repository Git privati, configurate l'autenticazione SSH o tramite token nel cluster figlio dopo la distribuzione di Flux.
:::

### 3. Applicare la configurazione del cluster

```bash
kubectl apply -f cluster-gitops.yaml

# Attendere che il cluster e gli addon siano pronti
kubectl get kubernetes my-cluster -w
```

### 4. Osservare la sincronizzazione

Verificate che Flux sincronizzi correttamente il vostro repository Git:

```bash
export KUBECONFIG=cluster-admin.yaml

# Verificare il GitRepository
kubectl get gitrepositories -A

# Verificare le Kustomization (riconciliazione Flux)
kubectl get kustomizations -A

# Dettagli della sincronizzazione
kubectl describe gitrepository -A

# Verificare i pod Flux
kubectl get pods -n flux-system
```

**Risultato atteso:**

```console
NAMESPACE     NAME            URL                                          READY   STATUS                  AGE
flux-system   flux-system     https://github.com/company/k8s-manifests    True    Fetched revision: main   5m
```

```console
NAMESPACE     NAME            READY   STATUS                  AGE
flux-system   flux-system     True    Applied revision: main   5m
```

### 5. Distribuire un'applicazione tramite Git

Per distribuire o aggiornare un'applicazione, inviate semplicemente i manifesti nel vostro repository Git:

```yaml title="apps/my-app/deployment.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: app
          image: registry.example.com/my-app:v1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"
```

```bash
# Dal vostro repository locale
git add apps/my-app/deployment.yaml
git commit -m "deploy: add my-app v1.0.0"
git push origin main
```

Flux rileva automaticamente le modifiche e applica i manifesti nel cluster:

```bash
# Osservare la riconciliazione
kubectl get kustomizations -A -w

# Verificare che l'applicazione sia distribuita
kubectl get pods -l app=my-app
```

:::tip
Per impostazione predefinita, Flux sincronizza il repository ogni minuto. Per forzare una riconciliazione immediata:
```bash
kubectl annotate --overwrite gitrepository flux-system -n flux-system reconcile.fluxcd.io/requestedAt="$(date +%s)"
```
:::

## Verifica

Validate che il pipeline GitOps funzioni da un capo all'altro:

```bash
# Stato globale di Flux
kubectl get gitrepositories,kustomizations -A

# Log di Flux in caso di problema
kubectl logs -n flux-system deploy/source-controller --tail=30
kubectl logs -n flux-system deploy/kustomize-controller --tail=30

# Verificare le risorse distribuite da Flux
kubectl get all -l kustomize.toolkit.fluxcd.io/name=flux-system
```

:::warning
Se la sincronizzazione fallisce, verificate:
- L'accessibilita del repository Git dal cluster
- La validita dei manifesti YAML nel repository (un file non valido blocca la riconciliazione)
- I log dei controller Flux per identificare l'errore preciso
:::

## Per approfondire

- [Riferimento API](../api-reference.md) -- Configurazione dell'addon `fluxcd`
- [Concetti](../concepts.md) -- Architettura del cluster e addon
- [Come distribuire un Ingress con TLS](./deploy-ingress-tls.md) -- Esporre le vostre applicazioni distribuite da Flux
