---
title: "Come scalare verticalmente ClickHouse"
sidebar_position: 2
---

# Come scalare verticalmente ClickHouse

:::info Disponibilità
ClickHouse non è ancora disponibile in modalità self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

Questa guida aiuta a decidere quando e come aumentare le risorse di un'istanza ClickHouse.

## Preset disponibili

Le risorse di ogni replica ClickHouse sono definite da un preset:

| Preset | CPU | Memoria |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

## Passaggi

### 1. Misurare il consumo attuale

Identifichi le query che consumano più memoria:

```sql
SELECT query, memory_usage, elapsed
FROM system.query_log
WHERE type = 'QueryFinish'
ORDER BY memory_usage DESC
LIMIT 10;
```

E lo spazio su disco utilizzato per tabella:

```sql
SELECT database, table, formatReadableSize(sum(bytes_on_disk)) AS size
FROM system.parts
WHERE active
GROUP BY database, table
ORDER BY sum(bytes_on_disk) DESC;
```

### 2. Richiedere la modifica

[Contatti il supporto](mailto:support@hidora.io) indicando il progetto, il nome dell'istanza e l'obiettivo: preset, dimensione dello storage, oppure numero di shard se un singolo nodo non è più sufficiente (vedere [Configurare lo sharding](./configure-sharding.md)).

:::warning
Un cambio di preset riavvia le repliche. Con più repliche per shard, il servizio resta disponibile durante l'operazione.
:::

## Verifica

Dopo l'intervento, controlli le risorse viste da ClickHouse:

```sql
SELECT name, value FROM system.settings WHERE name = 'max_memory_usage';
SELECT * FROM system.disks;
```

## Per approfondire

- [Concetti ClickHouse](../concepts.md)
- [Configurare lo sharding](./configure-sharding.md)
