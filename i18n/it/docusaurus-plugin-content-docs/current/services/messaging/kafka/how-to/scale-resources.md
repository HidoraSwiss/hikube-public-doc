---
title: "Come scalare il cluster"
---

# Come scalare il cluster Kafka

Questa guida spiega come regolare le risorse di un cluster Kafka su Hikube: numero di broker, risorse CPU/memoria, archiviazione, nonché la configurazione ZooKeeper associata.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Un cluster **Kafka** distribuito su Hikube

## Preset disponibili

Hikube propone dei preset di risorse predefiniti, applicabili ai broker Kafka e ai nodi ZooKeeper:

| Preset | CPU | Memoria |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

:::warning
Se il campo `resources` (CPU/memoria espliciti) è definito, il valore di `resourcesPreset` viene **completamente ignorato**. Assicuratevi di svuotare il campo `resources` se desiderate utilizzare un preset.
:::

## Passi

### 1. Verificare le risorse attuali

Consultate la configurazione attuale del cluster:

```bash
kubectl get kafka my-kafka -o yaml | grep -A 8 -E "kafka:|zookeeper:"
```

**Esempio di risultato:**

```console
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
```

### 2. Scalare i broker Kafka

Potete regolare il numero di broker, le risorse e l'archiviazione indipendentemente.

**Opzione A: cambiare il preset dei broker**

```bash
kubectl patch kafka my-kafka --type='merge' -p='
spec:
  kafka:
    replicas: 5
    resourcesPreset: large
    resources: {}
'
```

**Opzione B: definire risorse esplicite**

```bash
kubectl patch kafka my-kafka --type='merge' -p='
spec:
  kafka:
    replicas: 5
    resources:
      cpu: 4000m
      memory: 8Gi
'
```

Potete anche modificare il manifesto completo:

```yaml title="kafka-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: my-kafka
spec:
  kafka:
    replicas: 5
    resources:
      cpu: 4000m
      memory: 8Gi
    size: 50Gi
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
  topics: []
```

```bash
kubectl apply -f kafka-scaled.yaml
```

:::warning
Ridurre il numero di broker su un cluster esistente può comportare una perdita di dati se le partizioni non vengono redistribuite preventivamente. Aumentate sempre il numero di broker piuttosto che ridurlo.
:::

### 3. Scalare ZooKeeper

ZooKeeper utilizza un meccanismo di quorum: il numero di repliche deve essere **dispari** (1, 3, 5) per garantire l'elezione di un leader.

```bash
kubectl patch kafka my-kafka --type='merge' -p='
spec:
  zookeeper:
    replicas: 3
    resourcesPreset: medium
    resources: {}
'
```

Oppure con risorse esplicite:

```yaml title="kafka-zookeeper-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: my-kafka
spec:
  kafka:
    replicas: 5
    resourcesPreset: large
    size: 50Gi
  zookeeper:
    replicas: 3
    resources:
      cpu: 1000m
      memory: 1Gi
    size: 10Gi
  topics: []
```

```bash
kubectl apply -f kafka-zookeeper-scaled.yaml
```

:::tip
In produzione, 3 repliche ZooKeeper sono sufficienti nella maggior parte dei casi. 5 repliche sono raccomandate solo per cluster molto grandi (10+ broker).
:::

### 4. Aumentare l'archiviazione se necessario

Se i broker esauriscono lo spazio su disco, aumentate la dimensione del volume persistente:

```bash
kubectl patch kafka my-kafka --type='merge' -p='
spec:
  kafka:
    size: 100Gi
'
```

:::warning
Il numero di repliche di un topic non può superare il numero di broker. Dopo uno scale-up dei broker, potete aumentare il fattore di replica dei vostri topic esistenti.
:::

### 5. Applicare e verificare

Se non avete ancora applicato le modifiche:

```bash
kubectl apply -f kafka-scaled.yaml
```

Monitorate il rolling update dei pod:

```bash
kubectl get po -w | grep my-kafka
```

**Risultato atteso (durante il rolling update):**

```console
my-kafka-kafka-0       1/1     Running       0   45m
my-kafka-kafka-1       1/1     Running       0   44m
my-kafka-kafka-2       1/1     Terminating   0   43m
my-kafka-kafka-2       0/1     Pending       0   0s
my-kafka-kafka-2       1/1     Running       0   30s
```

Attendete che tutti i pod siano nello stato `Running`:

```bash
kubectl get po | grep my-kafka
```

```console
my-kafka-kafka-0       1/1     Running   0   10m
my-kafka-kafka-1       1/1     Running   0   8m
my-kafka-kafka-2       1/1     Running   0   6m
my-kafka-kafka-3       1/1     Running   0   4m
my-kafka-kafka-4       1/1     Running   0   2m
my-kafka-zookeeper-0   1/1     Running   0   10m
my-kafka-zookeeper-1   1/1     Running   0   8m
my-kafka-zookeeper-2   1/1     Running   0   6m
```

## Verifica

Confermate che le nuove risorse siano applicate:

```bash
kubectl get kafka my-kafka -o yaml | grep -A 8 -E "kafka:|zookeeper:"
```

Verificate che il cluster sia funzionante elencando i topic:

```bash
kubectl run kafka-debug --rm -it --image=bitnami/kafka:latest --restart=Never -- \
  kafka-topics.sh --bootstrap-server my-kafka-kafka-bootstrap:9092 --list
```

## Per approfondire

- **[Riferimento API Kafka](../api-reference.md)**: documentazione completa dei parametri `kafka`, `zookeeper` e della tabella dei preset
- **[Come creare e gestire i topic](./manage-topics.md)**: configurare i topic dopo lo scaling
