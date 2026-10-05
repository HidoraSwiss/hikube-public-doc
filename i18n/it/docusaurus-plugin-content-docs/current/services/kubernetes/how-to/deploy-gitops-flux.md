---
title: "Come distribuire con Flux (GitOps)"
---

# Come distribuire con Flux (GitOps)

Questa guida spiega come attivare Flux CD su un cluster Kubernetes Hikube e configurarlo per distribuire le sue applicazioni secondo l'approccio GitOps: un repository Git come fonte di verità per lo stato del cluster.

## Prerequisiti

- Un cluster Kubernetes Hikube distribuito (vedere l'[avvio rapido](../quick-start.md))
- Il kubeconfig del cluster scaricato dalla console (pulsante **Kubeconfig**)
- Un repository Git accessibile dal cluster, contenente i suoi manifesti Kubernetes

## Passaggi

### 1. Preparare il repository Git

Organizzi il repository Git con una struttura di directory contenente i suoi manifesti Kubernetes:

```
k8s-manifests/
└── clusters/
    └── production/
        ├── namespaces.yaml
        ├── frontend/
        │   ├── deployment.yaml
        │   ├── service.yaml
        │   └── ingress.yaml
        └── backend/
            ├── deployment.yaml
            └── service.yaml
```

:::tip
Flux applica tutti i manifesti YAML trovati nella directory di destinazione e nelle relative sottodirectory. Organizzi i file in modo logico per facilitarne la manutenzione.
:::

### 2. Attivare l'addon Flux CD

1. In **Infrastructure** > **Kubernetes**, apra il menu **Actions** del cluster e scelga **Edit** (oppure selezioni l'addon direttamente alla creazione, passaggio **Addons**).
2. Nella sezione **Extensions & Addons**, selezioni **Flux CD** («GitOps continuous deployment for Kubernetes»).
3. Faccia clic su **Save**.

La pagina di dettaglio del cluster mostra quindi **Flux CD** nella sezione **Extensions**. L'addon installa i controller Flux e le relative CRD; la dichiarazione dei repository si effettua poi nel cluster.

### 3. Verificare l'installazione di Flux

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<nome-del-cluster>.yaml

# CRD Flux installate
kubectl get crds | grep toolkit.fluxcd.io

# Controller Flux
kubectl get deploy -A -l app.kubernetes.io/part-of=flux
```

### 4. Dichiarare il repository e la sincronizzazione

Crei nel cluster una sorgente `GitRepository` e una `Kustomization` che applica la directory scelta:

```yaml title="gitops-sync.yaml"
apiVersion: v1
kind: Namespace
metadata:
  name: gitops
---
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: k8s-manifests
  namespace: gitops
spec:
  interval: 1m
  url: https://github.com/company/k8s-manifests
  ref:
    branch: main
---
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: production
  namespace: gitops
spec:
  interval: 5m
  sourceRef:
    kind: GitRepository
    name: k8s-manifests
  path: ./clusters/production
  prune: true
```

```bash
kubectl apply -f gitops-sync.yaml
```

:::note
Per un repository Git privato, crei un Secret contenente una chiave SSH o un token nel namespace `gitops`, quindi lo referenzi nel campo `spec.secretRef` del `GitRepository`. Consulti la [documentazione Flux](https://fluxcd.io/flux/components/source/gitrepositories/) per il formato previsto.
:::

### 5. Osservare la sincronizzazione

```bash
# Stato della sorgente Git
kubectl get gitrepositories -n gitops

# Stato della riconciliazione
kubectl get kustomizations -n gitops
```

**Risultato atteso:**

```console
NAME            URL                                         READY   STATUS
k8s-manifests   https://github.com/company/k8s-manifests    True    stored artifact for revision 'main@sha1:...'
```

```console
NAME         READY   STATUS
production   True    Applied revision: main@sha1:...
```

### 6. Distribuire un'applicazione tramite Git

Per distribuire o aggiornare un'applicazione, esegua il push dei manifesti nel repository Git:

```yaml title="clusters/production/my-app/deployment.yaml"
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
# Dal repository locale
git add clusters/production/my-app/deployment.yaml
git commit -m "deploy: add my-app v1.0.0"
git push origin main
```

Flux rileva le modifiche all'intervallo definito e applica i manifesti nel cluster:

```bash
kubectl get kustomizations -n gitops -w
kubectl get pods -A -l app=my-app
```

:::tip
Per forzare una riconciliazione immediata:
```bash
kubectl annotate --overwrite gitrepository k8s-manifests -n gitops reconcile.fluxcd.io/requestedAt="$(date +%s)"
```
Con la CLI `flux`, l'equivalente è `flux reconcile kustomization production -n gitops --with-source`.
:::

## Verifica

```bash
# Stato globale
kubectl get gitrepositories,kustomizations -A

# Dettaglio di un errore di riconciliazione
kubectl describe kustomization production -n gitops
```

:::warning
Se la sincronizzazione non riesce, verifichi:
- l'accessibilità del repository Git dal cluster;
- la validità dei manifesti YAML del repository (un file non valido blocca la riconciliazione);
- gli eventi e i log dei controller Flux (`kubectl logs` sui pod `source-controller` e `kustomize-controller`).
:::

## Per approfondire

- [Flux CD](../plugins/fluxcd.md): dettaglio dell'addon
- [Come distribuire un Ingress con TLS](./deploy-ingress-tls.md): esporre le applicazioni distribuite da Flux
