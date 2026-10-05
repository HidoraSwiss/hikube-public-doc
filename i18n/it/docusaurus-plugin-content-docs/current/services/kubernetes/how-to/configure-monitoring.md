---
title: "Come configurare il monitoring"
---

# Come configurare il monitoring

Questa guida spiega come attivare la raccolta di metriche e log su un cluster Kubernetes Hikube con l'addon **Monitoring Agents** e come verificarne il funzionamento nel cluster.

## Prerequisiti

- Un cluster Kubernetes Hikube distribuito (vedere l'[avvio rapido](../quick-start.md))
- Il kubeconfig del cluster scaricato dalla console (pulsante **Kubeconfig**)

## Passaggi

### 1. Attivare l'addon Monitoring Agents

L'addon **Monitoring Agents** («Monitoring agents for logs and metrics») è selezionato per impostazione predefinita alla creazione di un cluster. Per attivarlo su un cluster esistente:

1. In **Infrastructure** > **Kubernetes**, apra il menu **Actions** del cluster e scelga **Edit**.
2. Nella sezione **Extensions & Addons**, selezioni **Monitoring Agents**.
3. Faccia clic su **Save**.

La pagina di dettaglio del cluster mostra quindi **Monitoring Agents** nella sezione **Extensions**.

### 2. Comprendere che cosa viene distribuito

L'addon installa nel cluster agenti di raccolta che trasmettono i dati al sistema di monitoraggio della piattaforma Hikube. Non è necessario attivare alcuna opzione nel progetto:

| Componente | Ruolo |
|-----------|------|
| **VictoriaMetrics Agent** (`vmagent`) | Raccoglie e invia le metriche |
| **Fluent Bit** | Raccoglie e invia i log dei container |
| **kube-state-metrics** | Espone lo stato degli oggetti Kubernetes sotto forma di metriche |
| **Node exporter** | Espone le metriche di sistema dei nodi |

Gli agenti vengono eseguiti sui nodi del cluster; lo storage delle metriche e dei log non occupa i suoi nodi.

:::note
L'accesso alle dashboard di monitoraggio del progetto non è disponibile nella console; contatti il supporto.
:::

### 3. Verificare gli agenti nel cluster

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<nome-del-cluster>.yaml

# Elencare i pod degli agenti di monitoring
kubectl get pods -A | grep -E "vmagent|fluent-bit|kube-state-metrics|node-exporter"
```

**Risultato atteso**: i pod degli agenti sono nello stato `Running`, con un pod Fluent Bit e un pod node exporter per nodo.

### 4. Consultare le metriche nel cluster

```bash
# Metriche dei nodi
kubectl top nodes

# Metriche dei pod
kubectl top pods -A

# Eventi del cluster
kubectl get events -A --sort-by=.metadata.creationTimestamp
```

**Esempio di risultato per `kubectl top nodes`:**

```console
NAME                          CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
my-cluster-general-xxxxx      250m         6%     1200Mi          15%
my-cluster-general-yyyyy      310m         7%     1350Mi          17%
```

## Verifica

```bash
# Log di un agente Fluent Bit, in caso di dubbi sull'invio dei log
# Namespace degli agenti Fluent Bit
FLUENTBIT_NS=$(kubectl get ds -A -l app.kubernetes.io/name=fluent-bit -o jsonpath='{.items[0].metadata.namespace}')
kubectl logs -n "$FLUENTBIT_NS" -l app.kubernetes.io/name=fluent-bit --tail=20 --prefix
```

:::warning
Le destinazioni delle metriche e dei log sono configurate dalla piattaforma. Per modificare il comportamento degli agenti (risorse, filtri di raccolta), contatti il supporto.
:::

## Per approfondire

- [Monitoring Agents](../plugins/monitoring-agents.md): dettaglio dell'addon
- [Accesso e strumenti](./toolbox.md): comandi di diagnostica e metriche
