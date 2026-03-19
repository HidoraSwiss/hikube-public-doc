---
title: "Come configurare l'autoscaling"
---

# Come configurare l'autoscaling

L'autoscaling permette al vostro cluster Hikube di regolare automaticamente il numero di nodi in base al carico. Questa guida spiega come configurare e osservare lo scaling automatico dei vostri node group.

## Prerequisiti

- Un cluster Kubernetes Hikube distribuito (vedere l'[avvio rapido](../quick-start.md))
- `kubectl` configurato per interagire con l'API Hikube
- Il file YAML di configurazione del vostro cluster

## Fasi

### 1. Comprendere il funzionamento

L'autoscaling Hikube funziona a livello dei node group. Ogni gruppo di nodi definisce:

- **`minReplicas`**: numero minimo di nodi sempre attivi
- **`maxReplicas`**: numero massimo di nodi che possono essere provisionati

Il cluster aggiunge automaticamente nodi quando i pod non possono essere pianificati per mancanza di risorse (CPU, memoria). Rimuove i nodi sottoutilizzati quando il carico diminuisce, rispettando sempre la soglia `minReplicas`.

:::note
Lo scaling viene attivato dalla pressione sulle risorse: quando dei pod rimangono in stato `Pending` per mancanza di capacita, nuovi nodi vengono provisionati automaticamente.
:::

### 2. Configurare minReplicas e maxReplicas

Definite i limiti di scaling nella vostra configurazione cluster:

```yaml title="cluster-autoscaling.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    # Node group con autoscaling moderato
    web:
      minReplicas: 2
      maxReplicas: 10
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # Node group compute con ampia ampiezza
    compute:
      minReplicas: 1
      maxReplicas: 20
      instanceType: "u1.2xlarge"
      ephemeralStorage: 100Gi
      roles: []
```

:::tip
Per un ambiente di produzione, fissate `minReplicas` ad almeno 2 per garantire l'alta disponibilita dei vostri workload.
:::

### 3. Configurare lo scaling a zero

Per gli ambienti di sviluppo o i workload GPU, potete configurare un node group che scende a zero nodi quando non e utilizzato:

```yaml title="cluster-scale-to-zero.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 2

  nodeGroups:
    # Node group permanente
    system:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # Node group GPU con scaling a zero
    gpu:
      minReplicas: 0
      maxReplicas: 8
      instanceType: "u1.2xlarge"
      ephemeralStorage: 500Gi
      roles: []
```

:::warning
Lo scaling a zero implica un ritardo di avvio (cold start) durante il provisioning del primo nodo. Prevedete alcuni minuti prima che i pod possano essere pianificati sul nuovo nodo.
:::

### 4. Osservare lo scaling in azione

Applicate la configurazione e osservate il comportamento dello scaling:

```bash
# Applicare la configurazione
kubectl apply -f cluster-autoscaling.yaml

# Osservare i nodi in tempo reale
kubectl --kubeconfig=cluster-admin.yaml get nodes -w
```

Per attivare uno scaling, distribuite un workload che consuma risorse:

```yaml title="load-test.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: load-test
spec:
  replicas: 20
  selector:
    matchLabels:
      app: load-test
  template:
    metadata:
      labels:
        app: load-test
    spec:
      containers:
        - name: busybox
          image: busybox
          command: ["sleep", "3600"]
          resources:
            requests:
              cpu: "500m"
              memory: "512Mi"
```

```bash
# Distribuire il workload di test
kubectl --kubeconfig=cluster-admin.yaml apply -f load-test.yaml

# Osservare i pod in attesa (Pending) poi pianificati
kubectl --kubeconfig=cluster-admin.yaml get pods -w

# Osservare l'aggiunta di nodi
kubectl --kubeconfig=cluster-admin.yaml get nodes -w
```

### 5. Regolare i limiti

Potete regolare i limiti di scaling in qualsiasi momento con un patch:

```bash
kubectl patch kubernetes my-cluster --type='merge' -p='
spec:
  nodeGroups:
    compute:
      maxReplicas: 30
'
```

Oppure modificando il file YAML e ri-applicando:

```bash
kubectl apply -f cluster-autoscaling.yaml
```

## Verifica

Verificate che l'autoscaling sia correttamente configurato:

```bash
# Verificare la configurazione attuale del cluster
kubectl get kubernetes my-cluster -o yaml | grep -A 8 nodeGroups

# Verificare lo stato delle macchine
kubectl get machines -l cluster.x-k8s.io/cluster-name=my-cluster

# Verificare i nodi nel cluster figlio
kubectl --kubeconfig=cluster-admin.yaml get nodes
```

**Risultato atteso dopo lo scaling:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-web-xxxxx         Ready    <none>   30m   v1.29.0
my-cluster-web-yyyyy         Ready    <none>   30m   v1.29.0
my-cluster-compute-zzzzz     Ready    <none>   2m    v1.29.0
my-cluster-compute-wwwww     Ready    <none>   2m    v1.29.0
```

## Per approfondire

- [Riferimento API](../api-reference.md) -- Parametri `minReplicas` e `maxReplicas`
- [Concetti](../concepts.md) -- Architettura dei node group e scalabilita
- [Come aggiungere e modificare un node group](./manage-node-groups.md) -- Gestione dei node group
