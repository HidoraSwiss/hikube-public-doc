---
title: "Come configurare l'autoscaling"
---

# Come configurare l'autoscaling

L'autoscaling consente al cluster Hikube di regolare automaticamente il numero di nodi in base al carico. Questa guida spiega come configurare i limiti di scaling dei gruppi di nodi dalla console e come osservare lo scaling nel cluster.

## Prerequisiti

- Un cluster Kubernetes Hikube distribuito (vedere l'[avvio rapido](../quick-start.md))
- Il kubeconfig del cluster scaricato dalla console (pulsante **Kubeconfig**)

## Passaggi

### 1. Comprendere il funzionamento

L'autoscaling Hikube funziona a livello dei gruppi di nodi. Ogni gruppo definisce:

- **Minimum nodes**: numero di nodi sempre attivi;
- **Maximum nodes**: numero massimo di nodi di cui è possibile effettuare il provisioning.

Il cluster aggiunge nodi quando alcuni pod non possono essere pianificati per mancanza di risorse (CPU, memoria). Rimuove i nodi sottoutilizzati quando il carico diminuisce, senza scendere al di sotto del minimo.

:::note
Lo scaling è attivato dalla pressione sulle risorse: quando alcuni pod restano nello stato `Pending` per mancanza di capacità, viene effettuato automaticamente il provisioning di nuovi nodi.
:::

:::warning
La quota del progetto è calcolata sul **numero massimo** di nodi di ogni gruppo. Un massimo elevato riserva quota di CPU, memoria e storage anche se il provisioning dei nodi non è ancora stato effettuato.
:::

### 2. Definire i limiti di scaling

1. In **Infrastructure** > **Kubernetes**, apra il menu **Actions** del cluster e scelga **Edit**.
2. Nella sezione **Node groups**, espanda la scheda del gruppo.
3. Compili **Minimum nodes** e **Maximum nodes**. Ad esempio:

| Gruppo | Minimo | Massimo | Uso |
|--------|---------|---------|-------|
| `web` | 2 | 10 | Autoscaling moderato, gruppo esposto su internet |
| `compute` | 1 | 20 | Ampio margine per le elaborazioni |

4. Faccia clic su **Save**.

La console rifiuta un massimo inferiore al minimo («Maximum node count must be greater than or equal to minimum») e un massimo superiore a 100.

:::tip
Per un ambiente di produzione, imposti il minimo ad almeno 2 per garantire l'alta disponibilità dei suoi workload.
:::

### 3. Configurare lo scaling a zero

Per gli ambienti di sviluppo o i workload GPU, un gruppo può scendere a zero nodi quando non è utilizzato: inserisca **0** in **Minimum nodes**.

Mantenga almeno un gruppo con un minimo superiore a zero per ospitare i componenti di sistema del cluster.

:::warning
Lo scaling a zero comporta un tempo di avvio (cold start) durante il provisioning del primo nodo. Preveda alcuni minuti prima che i pod possano essere pianificati sul nuovo nodo.
:::

### 4. Osservare lo scaling in azione

Nel cluster, distribuisca un workload che richiede più risorse di quelle offerte dai nodi attuali:

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
export KUBECONFIG=~/Downloads/kubeconfig-<nome-del-cluster>.yaml

# Distribuire il workload di test
kubectl apply -f load-test.yaml

# Osservare i pod in attesa (Pending) e poi pianificati
kubectl get pods -l app=load-test -w

# Osservare l'aggiunta di nodi
kubectl get nodes -w
```

Nella console, la sezione **Node Pools** della pagina di dettaglio mostra il numero di nodi attivi di ogni gruppo, ad esempio «4 active nodes (2 to 10)».

Elimini il workload di test al termine dell'osservazione:

```bash
kubectl delete -f load-test.yaml
```

## Verifica

```bash
kubectl get nodes
```

**Risultato atteso dopo lo scaling:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-web-xxxxx         Ready    <none>   30m   v1.xx.x
my-cluster-web-yyyyy         Ready    <none>   30m   v1.xx.x
my-cluster-compute-zzzzz     Ready    <none>   2m    v1.xx.x
my-cluster-compute-wwwww     Ready    <none>   2m    v1.xx.x
```

## Per approfondire

- [Concetti](../concepts.md): architettura dei gruppi di nodi e quota
- [Come aggiungere e modificare un gruppo di nodi](./manage-node-groups.md): gestione dei gruppi di nodi
- [Vertical Pod Autoscaler](../plugins/verticalpodautoscaler.md): regolare le risorse dei pod
