---
title: "Come aggiornare un cluster"
---

# Come aggiornare un cluster

Questa guida spiega come aggiornare la versione di Kubernetes su un cluster Hikube. Gli aggiornamenti avvengono tramite rolling update, senza interruzione del piano di controllo.

## Prerequisiti

- Un cluster Kubernetes Hikube distribuito (vedere l'[avvio rapido](../quick-start.md))
- `kubectl` configurato per interagire con l'API Hikube
- Il kubeconfig del cluster figlio recuperato

## Fasi

### 1. Verificare la versione attuale

Identificate la versione Kubernetes attualmente distribuita sul vostro cluster:

```bash
# Versione nella configurazione Hikube
kubectl get kubernetes my-cluster -o yaml | grep version

# Versione riportata dai nodi
kubectl --kubeconfig=cluster-admin.yaml get nodes
```

**Risultato atteso:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx     Ready    <none>   30d   v1.29.0
my-cluster-general-yyyyy     Ready    <none>   30d   v1.29.0
```

### 2. Consultare le versioni disponibili

Prima di aggiornare, verificate le versioni supportate da Hikube:

```bash
# Verificare la configurazione attuale del cluster
kubectl get kubernetes my-cluster -o yaml
```

:::warning
Testate sempre l'aggiornamento in un ambiente di staging prima della produzione. Alcune applicazioni potrebbero non essere compatibili con le nuove versioni di Kubernetes.
:::

:::note
Gli aggiornamenti devono essere effettuati in modo incrementale (ad esempio, v1.29 verso v1.30). Non saltate diverse versioni minori in una volta.
:::

### 3. Aggiornare la versione

**Opzione A: Patch diretto**

```bash
kubectl patch kubernetes my-cluster --type='merge' -p='
spec:
  version: "v1.30.0"
'
```

**Opzione B: Modificare il file YAML**

```yaml title="cluster-upgrade.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  version: "v1.30.0"

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
```

```bash
kubectl apply -f cluster-upgrade.yaml
```

### 4. Seguire il rolling update

Osservate lo svolgimento dell'aggiornamento:

```bash
# Seguire lo stato del cluster Hikube
kubectl get kubernetes my-cluster -w

# Osservare la sostituzione delle macchine
kubectl get machines -l cluster.x-k8s.io/cluster-name=my-cluster -w

# Verificare gli eventi
kubectl describe kubernetes my-cluster
```

:::tip
Gli aggiornamenti avvengono tramite rolling update: i nodi vengono sostituiti uno per uno. Il piano di controllo viene aggiornato per primo, seguito dai node group. I vostri workload continuano a funzionare durante l'aggiornamento.
:::

### 5. Verificare l'aggiornamento

Una volta completato il rolling update, confermate la nuova versione:

```bash
# Verificare la versione dei nodi
kubectl --kubeconfig=cluster-admin.yaml get nodes

# Verificare la versione dell'API server
kubectl --kubeconfig=cluster-admin.yaml version
```

## Verifica

Validate che il cluster funzioni correttamente dopo l'aggiornamento:

```bash
# Nodi in stato Ready con la nuova versione
kubectl --kubeconfig=cluster-admin.yaml get nodes

# Pod di sistema operativi
kubectl --kubeconfig=cluster-admin.yaml get pods -n kube-system

# I vostri workload funzionano
kubectl --kubeconfig=cluster-admin.yaml get pods -A
```

**Risultato atteso:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx     Ready    <none>   5m    v1.30.0
my-cluster-general-yyyyy     Ready    <none>   3m    v1.30.0
```

:::warning
Se dei pod rimangono in errore dopo l'aggiornamento, verificate la compatibilità dei vostri manifesti con la nuova versione Kubernetes. Alcune API deprecate potrebbero essere state rimosse.
:::

## Per approfondire

- [Riferimento API](../api-reference.md) -- Campo `version` e configurazione completa
- [Concetti](../concepts.md) -- Architettura del piano di controllo e rolling update
- [Accesso e strumenti](./toolbox.md) -- Comandi di debugging e monitoring
