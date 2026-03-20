---
sidebar_position: 3
title: Riferimento API
---

# Riferimento API ClickHouse

Questo riferimento descrive in dettaglio l'utilizzo di **ClickHouse** su Hikube, sia in configurazione semplice che distribuita con shard e repliche.

---

## Struttura di Base

### **Risorsa Clickhouse**

#### Esempio di configurazione YAML

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: clickhouse-name
spec:
```

## Parametri

### **Parametri Comuni**

| **Parametro**       | **Tipo**   | **Descrizione**                                                                 | **Predefinito** | **Richiesto** |
|----------------------|------------|---------------------------------------------------------------------------------|------------|------------|
| `replicas`           | `int`      | Number of ClickHouse replicas                                                   | `2`        | Si        |
| `shards`             | `int`      | Number of ClickHouse shards                                                     | `1`        | Si        |
| `resources`          | `object`   | Explicit CPU and memory configuration for each replica. Se vuoto, viene applicato `resourcesPreset` | `{}`       | No        |
| `resources.cpu`      | `quantity` | CPU available to each replica                                                   | `null`     | No        |
| `resources.memory`   | `quantity` | Memory (RAM) available to each replica                                          | `null`     | No        |
| `resourcesPreset`    | `string`   | Default sizing preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `"small"`  | Si        |
| `size`               | `quantity` | Persistent Volume Claim size, available for application data                    | `10Gi`     | Si        |
| `storageClass`       | `string`   | StorageClass used to store the data                                             | `""`       | No        |

#### Esempio di configurazione YAML

```yaml title="clickhouse.yaml"
replicas: 2
shards: 1
resources:
  cpu: 4000m
  memory: 4Gi
resourcesPreset: small
size: 20Gi
storageClass: replicated
```

### **Parametri specifici dell'applicazione**

| **Parametro**           | **Tipo**             | **Descrizione**                                             | **Predefinito** | **Richiesto** |
|--------------------------|----------------------|-------------------------------------------------------------|------------|------------|
| `logStorageSize`         | `quantity`           | Size of Persistent Volume for logs                          | `2Gi`      | No        |
| `logTTL`                 | `int`                | TTL (expiration time) for `query_log` and `query_thread_log`| `15`       | No        |
| `users`                  | `map[string]object`  | Users configuration                                         | `{...}`    | No        |
| `users[name].password`   | `string`             | Password for the user                                       | `null`     | Si        |
| `users[name].readonly`   | `bool`               | User is readonly, default is false                          | `null`     | No        |

#### Esempio di configurazione YAML

```yaml title="clickhouse.yaml"
logStorageSize: 5Gi
logTTL: 30
users:
  analyst:
    password: analyst123
    readonly: true
  admin:
    password: adminStrongPwd
```

### **Parametri di backup**

| **Parametro**           | **Tipo**   | **Descrizione**                                | **Predefinito**                                   | **Richiesto** |
|--------------------------|------------|------------------------------------------------|-----------------------------------------------|------------|
| `backup`                 | `object`   | Backup configuration                           | `{}`                                          | No        |
| `backup.enabled`         | `bool`     | Enable regular backups                         | `false`                                       | No        |
| `backup.s3Region`        | `string`   | AWS S3 region where backups are stored         | `us-east-1`                                   | No        |
| `backup.s3Bucket`        | `string`   | S3 bucket used for storing backups             | `s3.example.org/clickhouse-backups`           | No        |
| `backup.schedule`        | `string`   | Cron schedule for automated backups            | `"0 2 * * *"`                                 | No        |
| `backup.cleanupStrategy` | `string`   | Retention strategy for cleaning up old backups | `"--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"` | No        |
| `backup.s3AccessKey`     | `string`   | Access key for S3, used for authentication     | `<your-access-key>`                           | Si        |
| `backup.s3SecretKey`     | `string`   | Secret key for S3, used for authentication     | `<your-secret-key>`                           | Si        |
| `backup.resticPassword`  | `string`   | Password for Restic backup encryption          | `<password>`                                  | Si        |

#### Esempio di configurazione YAML

```yaml title="clickhouse.yaml"
backup:
  enabled: true
  s3Region: eu-central-1
  s3Bucket: backups.hikube.clickhouse
  schedule: "0 3 * * *"
  cleanupStrategy: "--keep-last=5 --keep-daily=7 --keep-weekly=4"
  s3AccessKey: "<your-access-key>"
  s3SecretKey: "<your-secret-key>"
  resticPassword: "<password>"
```

### **Parametri di ClickHouse Keeper**

| **Parametro**                   | **Tipo**   | **Descrizione**                                                                 | **Predefinito** | **Richiesto** |
|---------------------------------|------------|---------------------------------------------------------------------------------|------------|------------|
| `clickhouseKeeper`              | `object`   | ClickHouse Keeper configuration                                                 | `{}`       | No        |
| `clickhouseKeeper.enabled`      | `bool`     | Deploy ClickHouse Keeper for cluster coordination                               | `true`     | Si        |
| `clickhouseKeeper.size`         | `quantity` | Persistent Volume Claim size, available for application data                    | `1Gi`      | Si        |
| `clickhouseKeeper.resourcesPreset` | `string` | Default sizing preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `micro` | Si        |
| `clickhouseKeeper.replicas`     | `int`      | Number of Keeper replicas                                                       | `3`        | Si        |

#### Esempio di configurazione YAML

```yaml title="clickhouse.yaml"
clickhouseKeeper:
  enabled: true
  replicas: 3
  resourcesPreset: medium
  size: 5Gi
```

### resources e resourcesPreset

Il campo `resources` permette di definire esplicitamente la configurazione CPU e memoria di ogni replica ClickHouse.
Se questo campo e lasciato vuoto, viene utilizzato il valore del parametro `resourcesPreset`.

#### Esempio di configurazione YAML

```yaml title="clickhouse.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```

⚠️ Attenzione: se resources e definito, il valore di resourcesPreset viene ignorato.

| **Preset name** | **CPU** | **Memoria** |
|-----------------|---------|-------------|
| `nano`          | 250m    | 128Mi       |
| `micro`         | 500m    | 256Mi       |
| `small`         | 1       | 512Mi       |
| `medium`        | 1       | 1Gi         |
| `large`         | 2       | 2Gi         |
| `xlarge`        | 4       | 4Gi         |
| `2xlarge`       | 8       | 8Gi         |

---

## Esempi Completi

### Cluster di Produzione

```yaml title="clickhouse-production.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: production
spec:
  replicas: 3
  shards: 2
  resources:
    cpu: 4000m
    memory: 8Gi
  size: 100Gi
  storageClass: replicated

  logStorageSize: 10Gi
  logTTL: 30

  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: small
    size: 5Gi

  users:
    admin:
      password: SecureAdminPassword
    analyst:
      password: SecureAnalystPassword
      readonly: true

  backup:
    enabled: true
    schedule: "0 3 * * *"
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/clickhouse-backups
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
    resticPassword: SecureResticPassword
```

### Cluster di Sviluppo

```yaml title="clickhouse-development.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: development
spec:
  replicas: 1
  shards: 1
  resourcesPreset: nano
  size: 10Gi

  logStorageSize: 2Gi
  logTTL: 7

  clickhouseKeeper:
    enabled: true
    replicas: 1
    resourcesPreset: nano
    size: 1Gi

  users:
    dev:
      password: devpassword
```

---

:::tip Buone Pratiche

- **Keeper in numero dispari**: distribuite sempre 3 o 5 repliche Keeper per garantire il quorum (maggioranza necessaria per l'elezione del leader)
- **`logTTL`**: regolate la durata di retention dei log di sistema (`query_log`, `query_thread_log`) per evitare l'accumulo di dati inutili
- **Shard vs repliche**: usate gli shard per distribuire i dati orizzontalmente (più capacità) e le repliche per la ridondanza (più disponibilità)
- **Utente `readonly`**: create un utente in sola lettura per gli strumenti di analisi e reporting
:::

:::warning Attenzione

- **Le cancellazioni sono irreversibili**: la cancellazione di una risorsa ClickHouse comporta la perdita definitiva dei dati se nessun backup è configurato
- **Modifica degli shard**: modificare il numero di shard su un cluster esistente può comportare una ridistribuzione complessa dei dati
- **Keeper e quorum**: con meno di 3 Keeper, il cluster non può mantenere il quorum in caso di guasto di un nodo
:::
