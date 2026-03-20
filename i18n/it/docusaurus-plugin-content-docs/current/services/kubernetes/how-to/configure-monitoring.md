---
title: "Come configurare il monitoring"
---

# Come configurare il monitoring

Questa guida spiega come attivare e configurare il monitoring su un cluster Kubernetes Hikube, inclusa la raccolta di metriche, i log e le dashboard di visualizzazione.

## Prerequisiti

- Un cluster Kubernetes Hikube distribuito (vedere l'[avvio rapido](../quick-start.md))
- `kubectl` configurato per interagire con l'API Hikube
- Il file YAML di configurazione del vostro cluster

## Fasi

### 1. Attivare l'addon monitoringAgents

Modificate la configurazione del vostro cluster per attivare l'addon di monitoring:

```yaml title="cluster-monitoring.yaml"
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

    monitoring:
      minReplicas: 2
      maxReplicas: 4
      instanceType: "m1.xlarge"
      ephemeralStorage: 200Gi
      roles:
        - monitoring

  addons:
    monitoringAgents:
      enabled: true
      valuesOverride:
        fluentbit:
          enabled: true
```

:::note
L'attivazione di Fluent Bit (`fluentbit.enabled: true`) permette la raccolta e il trasferimento dei log delle vostre applicazioni verso lo stack di osservabilità.
:::

### 2. Creare un node group dedicato al monitoring

I componenti di monitoring (VictoriaMetrics, Grafana, Fluent Bit) consumano risorse significative. Si raccomanda di dedicare un node group con istanze ottimizzate per la memoria:

```yaml title="cluster-monitoring.yaml"
nodeGroups:
  monitoring:
    minReplicas: 2
    maxReplicas: 4
    instanceType: "m1.xlarge"    # 4 vCPU, 32 GB RAM
    ephemeralStorage: 200Gi       # Archiviazione importante per metriche e log
    roles:
      - monitoring
```

:::tip
La serie M (Memory Optimized) è ideale per il monitoring perché i database di metriche (VictoriaMetrics) e i motori di indicizzazione dei log necessitano di molta memoria.
:::

### 3. Applicare la configurazione

```bash
kubectl apply -f cluster-monitoring.yaml

# Attendere che il cluster sia pronto
kubectl get kubernetes my-cluster -w
```

### 4. Accedere agli strumenti di monitoring

Una volta aggiornato il cluster, verificate che i componenti di monitoring siano distribuiti nel cluster figlio:

```bash
export KUBECONFIG=cluster-admin.yaml

# Elencare i pod di monitoring
kubectl get pods -n monitoring

# Verificare i servizi disponibili
kubectl get svc -n monitoring

# Accedere a Grafana (se disponibile tramite Ingress)
kubectl get ingress -n monitoring
```

Per accedere a Grafana in locale:

```bash
kubectl port-forward -n monitoring svc/grafana 3000:80 &
# Aprire http://localhost:3000 nel browser
```

### 5. Verificare le metriche

Confermate che le metriche vengano raccolte correttamente:

```bash
# Metriche dei nodi
kubectl top nodes

# Metriche dei pod
kubectl top pods -A

# Eventi del cluster
kubectl get events --sort-by=.metadata.creationTimestamp
```

**Risultato atteso per `kubectl top nodes`:**

```console
NAME                          CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
my-cluster-general-xxxxx      250m         6%     1200Mi          15%
my-cluster-monitoring-yyyyy   800m         20%    4500Mi          14%
```

## Verifica

Verificate che l'intero stack di monitoring sia operativo:

```bash
# Verificare tutti i componenti di monitoring
kubectl get pods -n monitoring

# Verificare i log di Fluent Bit
kubectl logs -n monitoring -l app.kubernetes.io/name=fluent-bit --tail=20
```

**Risultato atteso:**

```console
NAME                                 READY   STATUS    RESTARTS   AGE
grafana-xxxxx-yyyyy                  1/1     Running   0          10m
vmagent-xxxxx-yyyyy                  1/1     Running   0          10m
fluent-bit-xxxxx                     1/1     Running   0          10m
```

## Per approfondire

- [Riferimento API](../api-reference.md) -- Configurazione dell'addon `monitoringAgents`
- [Concetti](../concepts.md) -- Architettura e osservabilità
- [Accesso e strumenti](./toolbox.md) -- Comandi di debugging e metriche
