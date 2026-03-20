---
sidebar_position: 6
title: FAQ
---

# FAQ — ClickHouse

### Qual e la differenza tra shard e repliche?

Gli **shard** e le **repliche** svolgono ruoli diversi nell'architettura ClickHouse:

- **Shard**: distribuzione **orizzontale** dei dati. Ogni shard contiene una parte del dataset totale. Aggiungere shard aumenta la capacità di archiviazione e di elaborazione.
- **Repliche**: copie **identiche** dei dati all'interno di uno stesso shard. Ogni replica contiene gli stessi dati per assicurare l'alta disponibilità.

```yaml title="clickhouse.yaml"
spec:
  shards: 2       # I dati sono distribuiti su 2 shard
  replicas: 3     # Ogni shard ha 3 copie (totale: 6 pod)
```

:::tip
In produzione, usate almeno 2 repliche per shard per l'alta disponibilità. Aumentate il numero di shard per elaborare volumi di dati più importanti.
:::

### A cosa serve ClickHouse Keeper?

**ClickHouse Keeper** e il componente di coordinamento del cluster, basato sul protocollo **Raft**. Sostituisce Apache ZooKeeper e assicura:

- L'**elezione del leader** per le tabelle replicate
- Il **coordinamento** delle operazioni di replica tra repliche
- La gestione dei **metadati** del cluster

Il numero di repliche Keeper deve essere **dispari** (3 o 5) per garantire il quorum (maggioranza necessaria per l'elezione del leader). Il minimo raccomandato e **3 repliche**.

```yaml title="clickhouse.yaml"
spec:
  clickhouseKeeper:
    enabled: true
    replicas: 3        # Sempre dispari: 3 o 5
    resourcesPreset: micro
    size: 2Gi
```

### ClickHouse è adatto alle query transazionali (OLTP)?

**No.** ClickHouse e un motore di database **OLAP** (Online Analytical Processing) ottimizzato per l'analisi dei dati:

- Architettura **orientata per colonne**: molto performante per aggregazioni e scansioni su grandi volumi di dati
- Ottimizzato per le **letture massive** e le query analitiche
- **Non adatto** alle operazioni transazionali frequenti (`UPDATE`, `DELETE` unitari)

Se avete bisogno di un motore transazionale (OLTP), usate piuttosto **PostgreSQL** o **MySQL** su Hikube.

### Qual e la differenza tra `resourcesPreset` e `resources`?

Il campo `resourcesPreset` permette di scegliere un profilo di risorse predeterminato per ogni replica ClickHouse. Se il campo `resources` (CPU/memoria espliciti) e definito, `resourcesPreset` viene **completamente ignorato**.

| **Preset** | **CPU** | **Memoria** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

```yaml title="clickhouse.yaml"
spec:
  # Utilizzo di un preset
  resourcesPreset: large

  # OPPURE configurazione esplicita (il preset viene allora ignorato)
  resources:
    cpu: 4000m
    memory: 8Gi
```

### Come vengono distribuiti i dati tra gli shard?

I dati vengono distribuiti tra gli shard tramite il motore **Distributed** di ClickHouse:

- Ogni shard archivia una **partizione** del dataset totale
- Il motore `Distributed` reindirizza le query verso tutti gli shard e **fonde i risultati**
- I dati vengono **replicati** all'interno di ogni shard secondo il numero di repliche configurato

Per beneficiare della distribuzione, create tabelle con il motore `ReplicatedMergeTree` su ogni shard e una tabella `Distributed` per le query globali.

### Come configurare i backup ClickHouse?

I backup ClickHouse utilizzano **Restic** per l'invio verso uno storage S3 compatibile. Configurate la sezione `backup`:

```yaml title="clickhouse.yaml"
spec:
  backup:
    enabled: true
    s3Region: eu-central-1
    s3Bucket: s3.example.com/clickhouse-backups
    schedule: "0 3 * * *"
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
    resticPassword: your-restic-password
```

:::warning
Conservate il `resticPassword` in un luogo sicuro. Senza questa password, i backup non potranno essere decifrati.
:::
