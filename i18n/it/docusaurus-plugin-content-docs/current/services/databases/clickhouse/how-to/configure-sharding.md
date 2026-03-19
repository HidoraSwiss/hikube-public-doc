---
title: "Come configurare lo sharding ClickHouse"
---

# Come configurare lo sharding ClickHouse

Questa guida spiega come configurare lo sharding (partizionamento orizzontale) su ClickHouse per distribuire i dati su piu shard e garantire l'alta disponibilita con le repliche. Il coordinamento del cluster e assicurato da **ClickHouse Keeper**.

## Prerequisiti

- Un'istanza ClickHouse distribuita su Hikube (vedere l'[avvio rapido](../quick-start.md))
- `kubectl` configurato per interagire con l'API Hikube
- Conoscenza dei concetti di sharding e replica (vedere i [concetti](../concepts.md) se disponibile)

## Passaggi

### 1. Comprendere shard vs repliche

Prima di configurare lo sharding, e importante distinguere questi due concetti:

- **Shard**: distribuiscono i dati orizzontalmente. Ogni shard contiene una parte dei dati. Piu shard = piu capacita di archiviazione e di elaborazione in parallelo.
- **Repliche**: duplicano i dati all'interno di ogni shard per la ridondanza. Piu repliche = piu disponibilita in caso di guasto.

Ad esempio, con `shards: 2` e `replicas: 2`, ottenete 4 pod ClickHouse in totale (2 shard x 2 repliche per shard).

:::note
Lo sharding e utile quando il volume di dati supera la capacita di un singolo nodo, o quando desiderate parallelizzare le query su piu server.
:::

### 2. Configurare lo sharding

Create un manifesto con piu shard e repliche:

```yaml title="clickhouse-sharded.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse-sharded
spec:
  shards: 2
  replicas: 2
  resourcesPreset: large
  size: 50Gi
  storageClass: replicated
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 2Gi
```

Questa configurazione crea:
- **2 shard** per distribuire i dati
- **2 repliche per shard** per la ridondanza (4 pod ClickHouse in totale)
- **3 repliche Keeper** per il coordinamento del cluster

### 3. Configurare il ClickHouse Keeper

ClickHouse Keeper assicura il coordinamento del cluster: elezione del leader, replica dei dati e monitoraggio dello stato degli shard. Deve imperativamente essere attivato per le configurazioni con sharding.

```yaml title="clickhouse-keeper-config.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse-sharded
spec:
  shards: 2
  replicas: 2
  resourcesPreset: large
  size: 50Gi
  storageClass: replicated
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: small
    size: 5Gi
```

:::tip
Distribuite sempre il Keeper in numero dispari (3 o 5 repliche) per garantire il quorum. Con 3 repliche, il cluster tollera la perdita di un nodo Keeper. Con 5, ne tollera due.
:::

:::warning
Modificare il numero di shard su un cluster esistente puo comportare una ridistribuzione complessa dei dati. Pianificate il numero di shard fin dal deployment iniziale per quanto possibile.
:::

### 4. Applicare e verificare

Applicate la configurazione:

```bash
kubectl apply -f clickhouse-sharded.yaml
```

Attendete che tutti i pod siano pronti:

```bash
# Osservare il deployment in tempo reale
kubectl get pods -l app.kubernetes.io/instance=my-clickhouse-sharded -w
```

**Risultato atteso:**

```console
NAME                          READY   STATUS    RESTARTS   AGE
my-clickhouse-sharded-0-0     1/1     Running   0          4m
my-clickhouse-sharded-0-1     1/1     Running   0          4m
my-clickhouse-sharded-1-0     1/1     Running   0          3m
my-clickhouse-sharded-1-1     1/1     Running   0          3m
```

Verificate anche i pod Keeper:

```bash
kubectl get pods -l app.kubernetes.io/instance=my-clickhouse-sharded,app.kubernetes.io/component=keeper
```

**Risultato atteso:**

```console
NAME                                  READY   STATUS    RESTARTS   AGE
my-clickhouse-sharded-keeper-0        1/1     Running   0          4m
my-clickhouse-sharded-keeper-1        1/1     Running   0          4m
my-clickhouse-sharded-keeper-2        1/1     Running   0          4m
```

## Verifica

Connettetevi a ClickHouse e verificate la topologia del cluster:

```bash
# Connettersi al primo pod ClickHouse
kubectl exec -it my-clickhouse-sharded-0-0 -- clickhouse-client
```

Poi eseguite la seguente query per elencare shard e repliche:

```sql
SELECT cluster, shard_num, replica_num, host_name
FROM system.clusters
WHERE cluster = 'default'
ORDER BY shard_num, replica_num;
```

## Per approfondire

- [Riferimento API](../api-reference.md) -- Parametri `shards`, `replicas` e `clickhouseKeeper`
- [Come scalare verticalmente ClickHouse](./scale-resources.md) -- Regolare le risorse CPU e memoria
- [Come gestire utenti e profili](./manage-users.md) -- Gestione degli accessi utente
