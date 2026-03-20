---
sidebar_position: 3
title: Riferimento API
---

# Riferimento API PostgreSQL

Questo riferimento descrive in dettaglio l'utilizzo di **PostgreSQL** su Hikube, evidenziando il funzionamento in cluster replicato con un primary e degli standby per l'alta disponibilità, nonche la possibilità di attivare backup automatici verso uno storage compatibile S3.

---

## Struttura di Base

### **Risorsa Postgres**

#### Esempio di configurazione YAML

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: example
spec:
```

---

## Parametri

### **Parametri Comuni**

| **Parametro**       | **Tipo**   | **Descrizione**                                                                 | **Predefinito** | **Richiesto** |
|----------------------|------------|---------------------------------------------------------------------------------|------------|------------|
| `replicas`           | `int`      | Number of PostgreSQL replicas (istanze nel cluster)                       | `2`        | Si        |
| `resources`          | `object`   | Explicit CPU and memory configuration for each PostgreSQL replica. Se vuoto, viene applicato `resourcesPreset` | `{}`       | No        |
| `resources.cpu`      | `quantity` | CPU available to each replica                                                   | `null`     | No        |
| `resources.memory`   | `quantity` | Memory (RAM) available to each replica                                          | `null`     | No        |
| `resourcesPreset`    | `string`   | Default sizing preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `"micro"` | Si        |
| `size`               | `quantity` | Persistent Volume Claim size, available for application data                    | `10Gi`     | Si        |
| `storageClass`       | `string`   | StorageClass used to store the data                                             | `""`       | No        |
| `external`           | `bool`     | Enable external access from outside the cluster                                 | `false`    | No        |

#### Esempio di configurazione YAML

```yaml title="postgresql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: postgres-example
spec:
  # Numero di repliche PostgreSQL (istanze nel cluster)
  replicas: 3
  # Configurazione esplicita delle risorse
  resources:
    cpu: 2000m     # 2 vCPU per istanza
    memory: 2Gi    # 2 GiB di RAM per istanza
  # Utilizzo di un preset se resources e vuoto
  resourcesPreset: micro
  # Volume persistente per ogni istanza PostgreSQL
  size: 10Gi
  # Classe di archiviazione (lasciare vuoto per usare quella predefinita del cluster)
  storageClass: "replicated"
  # Esporre il database all'esterno del cluster (LoadBalancer se true)
  external: false
```

---

### **Parametri specifici dell'applicazione**

| **Parametro**                         | **Tipo**             | **Descrizione**                                                                 | **Predefinito** | **Richiesto** |
|---------------------------------------|----------------------|---------------------------------------------------------------------------------|------------|------------|
| `postgresql`                          | `object`             | PostgreSQL server configuration                                                 | `{}`       | No        |
| `postgresql.parameters`               | `object`             | PostgreSQL server parameters                                                    | `{}`       | No        |
| `postgresql.parameters.max_connections` | `int`               | Maximum number of concurrent connections to the database server (predefinito: 100) | `100`   | No        |
| `quorum`                              | `object`             | Quorum configuration for synchronous replication                                | `{}`       | No        |
| `quorum.minSyncReplicas`              | `int`                | Minimum number of synchronous replicas that must acknowledge a transaction      | `0`        | No        |
| `quorum.maxSyncReplicas`              | `int`                | Maximum number of synchronous replicas that can acknowledge a transaction       | `0`        | No        |
| `users`                               | `map[string]object`  | Users configuration                                                             | `{...}`    | No        |
| `users[name].password`                | `string`             | Password for the user                                                           | `null`     | Si        |
| `users[name].replication`             | `bool`               | Whether the user has replication privileges                                     | `null`     | No        |
| `databases`                           | `map[string]object`  | Databases configuration                                                         | `{...}`    | No        |
| `databases[name].roles`               | `object`             | Roles for the database                                                          | `null`     | No        |
| `databases[name].roles.admin`         | `[]string`           | List of users with admin privileges                                             | `[]`       | No        |
| `databases[name].roles.readonly`      | `[]string`           | List of users with read-only privileges                                         | `[]`       | No        |
| `databases[name].extensions`          | `[]string`           | Extensions enabled for the database                                             | `[]`       | No        |

#### Esempio di configurazione YAML

```yaml title="postgresql.yaml"
spec:
  replicas: 3
  size: 10Gi
  storageClass: replicated
  resourcesPreset: medium

  # Configurazione server PostgreSQL
  postgresql:
    parameters:
      max_connections: 200
      shared_buffers: 512MB
      work_mem: 64MB

  # Configurazione quorum per la replica sincrona
  quorum:
    minSyncReplicas: 1
    maxSyncReplicas: 2

  # Utenti
  users:
    admin:
      password: StrongAdminPwd123
      replication: true
    appuser:
      password: AppUserPwd456
    readonly:
      password: ReadOnlyPwd789

  # Database
  databases:
    myapp:
      roles:
        admin:
          - admin
        readonly:
          - readonly
      extensions:
        - hstore
        - uuid-ossp

    analytics:
      roles:
        admin:
          - admin
        readonly:
          - appuser
      extensions:
        - pgcrypto
```

---

### **Parametri di backup**

| **Parametro**              | **Tipo**   | **Descrizione**                                         | **Predefinito**                       | **Richiesto** |
|-----------------------------|------------|---------------------------------------------------------|-----------------------------------|------------|
| `backup`                    | `object`  | Backup configuration                                    | `{}`                              | No        |
| `backup.enabled`            | `bool`    | Enable regular backups                                  | `false`                           | No        |
| `backup.schedule`           | `string`  | Cron schedule for automated backups                     | `"0 2 * * * *"`                   | No        |
| `backup.retentionPolicy`    | `string`  | Retention policy                                        | `"30d"`                           | No        |
| `backup.destinationPath`    | `string`  | Path to store the backup (i.e. s3://bucket/path/)       | `"s3://bucket/path/to/folder/"`   | Si        |
| `backup.endpointURL`        | `string`  | S3 Endpoint used to upload data to the cloud            | `"https://prod.s3.hikube.cloud"` | Si    |
| `backup.s3AccessKey`        | `string`  | Access key for S3, used for authentication              | `<your-access-key>`               | Si        |
| `backup.s3SecretKey`        | `string`  | Secret key for S3, used for authentication              | `<your-secret-key>`               | Si        |

Per salvare un database **PostgreSQL**, e richiesto uno storage esterno **compatibile S3**.

Per attivare i backup regolari:

1. Aggiornate la configurazione della vostra applicazione PostgreSQL.
2. Impostate il parametro `backup.enabled` su `true`.
3. Compilate il percorso di destinazione e le credenziali nei campi `backup.*`.

#### Esempio di configurazione YAML

```yaml title="postgresql.yaml"
## @param backup.enabled Enable regular backups
## @param backup.schedule Cron schedule for automated backups
## @param backup.retentionPolicy Retention policy
## @param backup.destinationPath Path to store the backup (i.e. s3://bucket/path/to/folder)
## @param backup.endpointURL S3 Endpoint used to upload data to the cloud
## @param backup.s3AccessKey Access key for S3, used for authentication
## @param backup.s3SecretKey Secret key for S3, used for authentication
backup:
  enabled: false
  retentionPolicy: 30d
  destinationPath: s3://bucket/path/to/folder/
  endpointURL: https://prod.s3.hikube.cloud
  schedule: "0 2 * * * *"
  s3AccessKey: oobaiRus9pah8PhohL1ThaeTa4UVa7gu
  s3SecretKey: ju3eum4dekeich9ahM1te8waeGai0oog
```

### **Parametri di ripristino del backup**

| **Parametro**             | **Tipo**   | **Descrizione**                                                                                       | **Predefinito** | **Richiesto** |
|----------------------------|------------|-------------------------------------------------------------------------------------------------------|------------|------------|
| `bootstrap`                | `object`   | Bootstrap configuration                                                                               | `{}`       | No        |
| `bootstrap.enabled`        | `bool`     | Restore database cluster from a backup                                                                | `false`    | No        |
| `bootstrap.recoveryTime`   | `string`   | Timestamp (PITR) fino al quale effettuare il ripristino (formato RFC 3339). Vuoto = ultimo backup | `""`       | No        |
| `bootstrap.oldName`        | `string`   | Nome del cluster PostgreSQL prima della cancellazione                                                           | `""`       | Si        |

Hikube supporta il **ripristino a un istante specifico (Point-In-Time Recovery - PITR)**.
Il recupero avviene creando una **nuova istanza PostgreSQL** con un nome diverso, ma una configurazione identica a quella dell'istanza originale.

#### Passaggi

1. Create una nuova applicazione PostgreSQL.
2. Assegnatele un nome diverso dall'istanza originale.
3. Attivate il parametro `bootstrap.enabled`.
4. Compilate:
   - `bootstrap.oldName`: il nome della vecchia istanza PostgreSQL.
   - `bootstrap.recoveryTime`: l'istante fino al quale ripristinare, nel formato **RFC 3339**. Se lasciato vuoto, il ripristino verra effettuato fino all'ultimo stato disponibile.

---

#### Esempio di configurazione YAML

```yaml title="postgresql.yaml"
bootstrap:
  enabled: true
  oldName: "postgres-example"   # nome della vecchia istanza
  recoveryTime: "2025-01-15T10:30:00Z"  # ripristino a un istante preciso (RFC 3339)
```

### resources e resourcesPreset

Il campo `resources` permette di definire esplicitamente la configurazione CPU e memoria di ogni replica PostgreSQL.
Se questo campo e lasciato vuoto, viene utilizzato il valore del parametro `resourcesPreset`.

#### Esempio di configurazione YAML

```yaml title="postgresql.yaml"
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

```yaml title="postgresql-production.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: production
spec:
  replicas: 3
  resources:
    cpu: 4000m
    memory: 8Gi
  size: 50Gi
  storageClass: replicated
  external: false

  postgresql:
    parameters:
      max_connections: 300
      shared_buffers: 2GB
      work_mem: 64MB
      effective_cache_size: 6GB

  quorum:
    minSyncReplicas: 1
    maxSyncReplicas: 2

  users:
    admin:
      password: SecureAdminPassword
      replication: true
    appuser:
      password: SecureAppPassword
    readonly:
      password: SecureReadOnlyPassword

  databases:
    production:
      roles:
        admin:
          - admin
        readonly:
          - readonly
          - appuser
      extensions:
        - uuid-ossp
        - pgcrypto

  backup:
    enabled: true
    schedule: "0 2 * * *"
    retentionPolicy: 30d
    destinationPath: s3://backups/postgresql/production/
    endpointURL: https://prod.s3.hikube.cloud
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
```

### Cluster di Sviluppo

```yaml title="postgresql-development.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: development
spec:
  replicas: 1
  resourcesPreset: nano
  size: 5Gi
  external: true

  users:
    dev:
      password: devpassword

  databases:
    devdb:
      roles:
        admin:
          - dev
```

---

:::tip Buone Pratiche

- **Replica sincrona**: configurate `quorum.minSyncReplicas: 1` in produzione per garantire che almeno una replica confermi ogni transazione
- **Backup S3**: attivate i backup automatici con `backup.enabled: true` e testate regolarmente il ripristino
- **Separazione dei ruoli**: create utenti distinti per l'amministrazione, l'applicazione e la sola lettura
- **Parametri PostgreSQL**: regolate `shared_buffers` (~25% della RAM), `work_mem` e `max_connections` in base al vostro carico di lavoro
:::

:::warning Attenzione

- **Le cancellazioni sono irreversibili**: la cancellazione di una risorsa Postgres comporta la perdita definitiva dei dati se nessun backup è configurato
- **`resources` vs `resourcesPreset`**: se `resources` e definito, `resourcesPreset` viene completamente ignorato
- **Ripristino PITR**: il ripristino crea una **nuova istanza** con un nome diverso — non ripristina l'istanza esistente
:::
