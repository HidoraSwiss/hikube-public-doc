---
title: "Come aggiornare un cluster"
---

# Come aggiornare un cluster

Questa guida spiega come aggiornare la versione di Kubernetes di un cluster Hikube dalla console. Gli aggiornamenti avvengono tramite rolling update.

## Prerequisiti

- Un cluster Kubernetes Hikube distribuito (vedere l'[avvio rapido](../quick-start.md))
- Il kubeconfig del cluster scaricato dalla console (pulsante **Kubeconfig**), per verificare il risultato

## Passaggi

### 1. Verificare la versione attuale

In **Infrastructure** > **Kubernetes**, la colonna **Version** dell'elenco indica la versione di ogni cluster. La pagina di dettaglio la mostra anche nella sezione **General** (**Version**).

Lato cluster, la versione dei nodi è visibile con:

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<nome-del-cluster>.yaml
kubectl get nodes
```

### 2. Preparare l'aggiornamento

:::warning
Testi sempre l'aggiornamento su un cluster di collaudo prima della produzione. Alcune applicazioni potrebbero non essere compatibili con una nuova versione di Kubernetes (API deprecate e poi rimosse).
:::

:::note
Esegua gli aggiornamenti in modo incrementale (ad esempio, da v1.29 a v1.30). Non salti più versioni minori in una sola volta.
:::

### 3. Cambiare la versione

1. Apra il menu **Actions** del cluster e scelga **Edit** (oppure faccia clic su **Edit** dalla pagina di dettaglio).
2. Nella sezione **General information**, apra l'elenco **Kubernetes Version** e selezioni la versione di destinazione. L'elenco contiene solo le versioni proposte dalla piattaforma.
3. Faccia clic su **Save**. La console mostra «Cluster updated» e torna alla pagina di dettaglio.

:::note
Se la versione attuale del cluster non è più proposta dalla piattaforma, la console lo indica («current version») e la invita a selezionare una versione supportata.
:::

### 4. Seguire il rolling update

I nodi vengono sostituiti progressivamente. Segua la sostituzione nel cluster:

```bash
kubectl get nodes -w
```

:::tip
Durante un rolling update, i nodi vengono sostituiti uno alla volta: i suoi workload continuano a funzionare se dispongono di più repliche. Definisca dei `PodDisruptionBudget` per le applicazioni critiche.
:::

## Verifica

Al termine della sostituzione, confermi la nuova versione:

```bash
# Nodi nello stato Ready con la nuova versione
kubectl get nodes

# Versione dell'API server
kubectl version

# I workload funzionano
kubectl get pods -A
```

**Risultato atteso:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx     Ready    <none>   5m    v1.30.x
my-cluster-general-yyyyy     Ready    <none>   3m    v1.30.x
```

:::warning
Se alcuni pod restano in errore dopo l'aggiornamento, verifichi la compatibilità dei suoi manifesti con la nuova versione di Kubernetes. Alcune API deprecate potrebbero essere state rimosse.
:::

## Per approfondire

- [Concetti](../concepts.md): architettura del control plane
- [Accesso e strumenti](./toolbox.md): comandi di diagnostica nel cluster
