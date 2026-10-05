---
title: "Come aggiungere e modificare un gruppo di nodi"
---

# Come aggiungere e modificare un gruppo di nodi

I gruppi di nodi consentono di suddividere i nodi del cluster Kubernetes in base alle esigenze dei suoi workload. Questa guida spiega come aggiungere, modificare ed eliminare gruppi di nodi dalla console Hikube.

## Prerequisiti

- Un cluster Kubernetes Hikube distribuito (vedere l'[avvio rapido](../quick-start.md))
- Il kubeconfig del cluster scaricato dalla console (pulsante **Kubeconfig**), per verificare i nodi con `kubectl`

## Passaggi

### 1. Comprendere i tipi di istanza

Hikube propone tre serie di istanze adatte a diversi casi d'uso:

| Serie | Rapporto CPU:RAM | Casi d'uso |
|-------|---------------|-------------|
| **Standard (S)** | 1:2 | Uso economico, sviluppo, test |
| **Universal (U)** | 1:4 | Uso generale: server web, applicazioni |
| **Memory (M)** | 1:8 | Ottimizzata per la memoria: database, cache |

Il dettaglio dei modelli di ogni serie si trova nei [concetti](../concepts.md#tipi-di-istanza).

### 2. Aprire la pagina di modifica del cluster

1. Nella console, apra **Infrastructure** > **Kubernetes**.
2. Apra il menu **Actions** del cluster e scelga **Edit** (oppure faccia clic su **Edit** dalla pagina di dettaglio del cluster).

La pagina di modifica presenta le sezioni **General information**, **Node groups** ed **Extensions & Addons**, oltre agli indicatori di quota del progetto.

### 3. Aggiungere un gruppo di nodi

1. Nella sezione **Node groups**, faccia clic su **Add node group**. Si apre una nuova scheda.
2. Compili i campi:
   - **Group name**: ad esempio `compute` (da 3 a 16 caratteri: lettere minuscole, cifre e trattini);
   - **Ephemeral storage size**: ad esempio 100 GB;
   - **Minimum nodes** e **Maximum nodes**: ad esempio 1 e 10;
   - **Instance type**: ad esempio serie **Universal (U)**, dimensione **4XLarge** (`u1.4xlarge`);
   - **Exposed on the internet (Public IP)**: da attivare solo se questo gruppo deve ricevere il traffico in ingresso (Ingress NGINX);
   - **GPU**: se necessario, vedere [Aggiungere GPU](#5-aggiungere-gpu).
3. Faccia clic su **Save**.

:::tip
Scelga un nome descrittivo per i gruppi (`compute`, `web`, `monitoring`, `gpu`) per facilitare la gestione del cluster.
:::

### 4. Modificare un gruppo esistente

Nella sezione **Node groups**, espanda la scheda del gruppo, modifichi i campi desiderati (tipo di istanza, storage effimero, numero minimo o massimo di nodi, esposizione), quindi faccia clic su **Save**.

:::warning
La modifica del tipo di istanza sostituisce progressivamente i nodi del gruppo: vengono creati nuovi nodi, quindi i vecchi vengono rimossi uno alla volta. La quota del progetto deve poter accogliere i nodi aggiuntivi durante la sostituzione.
:::

:::note
Eviti di rinominare un gruppo esistente: un gruppo rinominato viene trattato come un nuovo gruppo.
:::

### 5. Aggiungere GPU

La sezione **GPU** di una scheda compare solo se sono disponibili GPU per il suo progetto.

- Per un **nuovo** gruppo, selezioni il modello e il numero di GPU per nodo. L'addon **GPU Operator** viene quindi attivato automaticamente e non può più essere deselezionato.
- Un gruppo **creato senza GPU** non può riceverne: aggiunga un nuovo gruppo di nodi GPU.
- Un gruppo **creato con GPU** può cambiare modello o numero, ma deve mantenere almeno una GPU: per tornare a nodi senza GPU, aggiunga piuttosto un nuovo gruppo senza GPU.

Vedere anche [Effettuare il provisioning di GPU in Kubernetes](../../gpu/how-to/provision-gpu-kubernetes.md).

### 6. Eliminare un gruppo di nodi

:::warning
Prima di eliminare un gruppo, si assicuri che i workload in esecuzione possano essere ripianificati su altri gruppi. Se necessario, utilizzi `kubectl drain` sui nodi interessati.
:::

1. Nella sezione **Node groups**, faccia clic sull'icona **Remove this group** della scheda interessata.
2. Faccia clic su **Save**.

Il primo gruppo del cluster non può essere eliminato; un cluster deve sempre mantenere almeno un gruppo di nodi.

## Verifica

Dopo il salvataggio, la console mostra «Cluster updated» e torna alla pagina di dettaglio. La sezione **Node Pools** elenca ogni gruppo con il relativo tipo di istanza e il numero di nodi attivi.

Nel cluster, osservi l'arrivo dei nuovi nodi:

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<nome-del-cluster>.yaml
kubectl get nodes -w
```

**Risultato atteso:**

```console
NAME                        STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx    Ready    <none>   10m   v1.xx.x
my-cluster-compute-yyyyy    Ready    <none>   2m    v1.xx.x
```

## Per approfondire

- [Concetti](../concepts.md): descrizione di ogni campo di un gruppo di nodi
- [Come configurare l'autoscaling](./configure-autoscaling.md): gestire lo scaling automatico dei gruppi
