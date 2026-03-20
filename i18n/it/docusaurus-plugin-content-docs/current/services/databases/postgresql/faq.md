---
sidebar_position: 6
title: FAQ
---

# FAQ — PostgreSQL

### Qual e la differenza tra `resourcesPreset` e `resources`?

Il campo `resourcesPreset` permette di scegliere un profilo di risorse predeterminato per ogni replica PostgreSQL. Se il campo `resources` (CPU/memoria espliciti) e definito, `resourcesPreset` viene **completamente ignorato**.

| **Preset** | **CPU** | **Memoria** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

```yaml title="postgresql.yaml"
spec:
  # Utilizzo di un preset
  resourcesPreset: medium

  # OPPURE configurazione esplicita (il preset viene allora ignorato)
  resources:
    cpu: 2000m
    memory: 2Gi
```

### Come scegliere tra `storageClass` local e replicated?

Hikube propone due tipi di classi di archiviazione:

- **`local`**: i dati sono archiviati sul nodo fisico dove viene eseguito il pod. Questa modalita offre le **migliori prestazioni** (latenza minima) ma non protegge contro il guasto di un nodo.
- **`replicated`**: i dati sono replicati su più nodi fisici. Questa modalita assicura l'**alta disponibilità multi-DC** e protegge contro la perdita di un nodo, al prezzo di una latenza leggermente superiore.

:::tip
Usate `storageClass: local` se configurate più repliche (`replicas` > 1): la replica applicativa (standby PostgreSQL) assicura già l'alta disponibilità. Usate `storageClass: replicated` se avete una sola replica (`replicas` = 1): lo storage replicato compensa l'assenza di replica applicativa. In sviluppo con una sola replica, `local` può bastare se la perdita di dati e accettabile.
:::

### Come connettersi a PostgreSQL dall'interno del cluster?

Il servizio PostgreSQL e accessibile tramite il seguente nome di servizio Kubernetes:

- **Servizio in lettura-scrittura**: `pg-<name>-rw` sulla porta `5432`

Le credenziali di connessione sono memorizzate in un Secret Kubernetes chiamato `pg-<name>-app`.

```bash
# Recuperare la password
kubectl get tenantsecret pg-mydb-app -o jsonpath='{.data.password}' | base64 -d

# Recuperare il nome utente
kubectl get tenantsecret pg-mydb-app -o jsonpath='{.data.username}' | base64 -d

# Connettersi da un pod
psql -h pg-mydb-rw -p 5432 -U <username> -d <database>
```

### Come configurare la replica sincrona?

La replica sincrona garantisce che una transazione venga confermata solo quando è stata scritta su un numero minimo di repliche. Configurate i parametri `quorum` nel vostro manifesto:

```yaml title="postgresql.yaml"
spec:
  replicas: 3
  quorum:
    minSyncReplicas: 1    # Almeno 1 replica deve confermare
    maxSyncReplicas: 2    # Al massimo 2 repliche confermano
```

- **`minSyncReplicas`**: numero minimo di repliche sincrone che devono confermare la ricezione di una transazione.
- **`maxSyncReplicas`**: numero massimo di repliche sincrone che possono confermare la ricezione.

:::warning
La replica sincrona aumenta la latenza di scrittura. Assicuratevi di avere sufficienti repliche (`replicas` >= `maxSyncReplicas` + 1).
:::

### Come attivare il backup PITR?

PostgreSQL su Hikube utilizza **CloudNativePG** con l'archiviazione WAL per permettere il ripristino a un istante specifico (PITR). Configurate la sezione `backup` con uno storage S3 compatibile:

```yaml title="postgresql.yaml"
spec:
  backup:
    enabled: true
    schedule: "0 2 * * *"
    retentionPolicy: 30d
    destinationPath: s3://my-bucket/postgresql-backups/
    endpointURL: https://prod.s3.hikube.cloud
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
```

I backup includono automaticamente i file WAL, il che permette di ripristinare il database a qualsiasi istante tra due backup.

### Come aggiungere estensioni PostgreSQL?

Potete attivare estensioni PostgreSQL per ogni database tramite il campo `databases[name].extensions`:

```yaml title="postgresql.yaml"
spec:
  databases:
    myapp:
      extensions:
        - uuid-ossp
        - pgcrypto
        - hstore
      roles:
        admin:
          - admin
```

Le estensioni vengono attivate automaticamente alla creazione del database. Le estensioni disponibili dipendono dalla versione di PostgreSQL distribuita.

### Si possono creare più database e utenti?

Si. Usate le mappe `users` e `databases` per definire quanti utenti e database necessitate. Ogni database può avere ruoli `admin` e `readonly` distinti:

```yaml title="postgresql.yaml"
spec:
  users:
    admin:
      password: AdminPassword123
      replication: true
    appuser:
      password: AppPassword456
    analyst:
      password: AnalystPassword789

  databases:
    production:
      roles:
        admin:
          - admin
        readonly:
          - analyst
      extensions:
        - uuid-ossp
    analytics:
      roles:
        admin:
          - admin
        readonly:
          - appuser
          - analyst
```
