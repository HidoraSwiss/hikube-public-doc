---
sidebar_position: 3
title: Riferimento API
---

# Riferimento API MySQL

Questo riferimento descrive in dettaglio l'utilizzo di **MySQL** su Hikube, evidenziando il deployment in cluster replicato con un primary e delle repliche per l'alta disponibilita, nonche la possibilita di attivare backup automatici verso uno storage compatibile S3.

---

## Struttura di Base

### **Risorsa MySQL**

#### Esempio di configurazione YAML

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example
spec:
```

---

## Parametri

### **Parametri Comuni**

| **Parametro**      | **Tipo**   | **Descrizione**                                                                 | **Predefinito** | **Richiesto** |
|---------------------|------------|---------------------------------------------------------------------------------|------------|------------|
| `replicas`          | `int`      | Numero di repliche MariaDB nel cluster                                      | `2`        | Si        |
| `resources`         | `object`   | Configurazione esplicita CPU e memoria per ogni replica. Se vuoto, viene applicato `resourcesPreset` | `{}`       | No        |
| `resources.cpu`     | `quantity` | CPU disponibile per ogni replica                                              | `null`     | No        |
| `resources.memory`  | `quantity` | Memoria (RAM) disponibile per ogni replica                                    | `null`     | No        |
| `resourcesPreset`   | `string`   | Profilo di risorse predefinito (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `nano`     | Si        |
| `size`              | `quantity` | Dimensione del volume persistente (PVC) per archiviare i dati                      | `10Gi`     | Si        |
| `storageClass`      | `string`   | StorageClass utilizzata per archiviare i dati                                  | `""`       | No        |
| `external`          | `bool`     | Attivare un accesso esterno al cluster (LoadBalancer)                              | `false`    | No        |

#### Esempio di configurazione YAML

```yaml title="mysql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example              # Nome dell'istanza
spec:
  replicas: 3                # Numero di repliche (1 primary + 2 repliche)

  resources:
    cpu: 1000m               # CPU per replica
    memory: 1Gi              # RAM per replica

  resourcesPreset: nano      # Profilo predefinito se resources e vuoto
  size: 10Gi                 # Dimensione del volume persistente
  storageClass: ""           # Classe di archiviazione
  external: false            # Accesso esterno (LoadBalancer)
```

### **Parametri specifici dell'applicazione**

| **Parametro**                     | **Tipo**             | **Descrizione**                                   | **Predefinito** | **Richiesto** |
|-----------------------------------|----------------------|---------------------------------------------------|------------|------------|
| `users`                           | `map[string]object`  | Configurazione degli utenti                    | `{...}`    | Si        |
| `users[name].password`            | `string`             | Password dell'utente                     | `""`       | Si        |
| `users[name].maxUserConnections`  | `int`                | Numero massimo di connessioni per l'utente   | `0`        | No        |
| `databases`                       | `map[string]object`  | Configurazione dei database                | `{...}`    | Si        |
| `databases[name].roles`           | `object`             | Ruoli associati al database                          | `null`     | No        |
| `databases[name].roles.admin`     | `[]string`           | Lista degli utenti con diritti admin          | `[]`       | No        |
| `databases[name].roles.readonly`  | `[]string`           | Lista degli utenti con diritti in lettura     | `[]`       | No        |

#### Esempio di configurazione YAML

```yaml title="mysql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example
spec:
  replicas: 2
  size: 10Gi
  resourcesPreset: nano
  # Definizione degli utenti MySQL
  users:
    appuser:
      password: strongpassword     # Password dell'utente applicativo
      maxUserConnections: 50       # Limite di connessioni simultanee
    readonly:
      password: readonlypass       # Utente con diritti limitati
      maxUserConnections: 10

  # Definizione dei database
  databases:
    myapp:
      roles:
        admin:
          - appuser                # appuser = admin del database "myapp"
        readonly:
          - readonly               # readonly = accesso in sola lettura
    analytics:
      roles:
        admin:
          - appuser                # appuser = admin del database "analytics"
```

### **Parametri di backup**

| **Parametro**           | **Tipo**  | **Descrizione**                                        | **Predefinito**                              | **Richiesto** |
|--------------------------|-----------|--------------------------------------------------------|------------------------------------------|------------|
| `backup`                 | `object`  | Configurazione dei backup                          | `{}`                                     | No        |
| `backup.enabled`         | `bool`    | Attivare i backup regolari                     | `false`                                  | No        |
| `backup.s3Region`        | `string`  | Regione AWS S3 dove sono archiviati i backup         | `"us-east-1"`                            | Si        |
| `backup.s3Bucket`        | `string`  | Bucket S3 utilizzato per archiviare i backup         | `"s3.example.org/mysql-backups"`         | Si        |
| `backup.schedule`        | `string`  | Pianificazione dei backup (cron)                   | `"0 2 * * *"`                            | No        |
| `backup.cleanupStrategy` | `string`  | Strategia di retention per pulire i vecchi backup | `"--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"` | No |
| `backup.s3AccessKey`     | `string`  | Chiave di accesso S3 (autenticazione)                      | `"<your-access-key>"`                    | Si        |
| `backup.s3SecretKey`     | `string`  | Chiave segreta S3 (autenticazione)                      | `"<your-secret-key>"`                    | Si        |
| `backup.resticPassword`  | `string`  | Password utilizzata per la cifratura Restic        | `"<password>"`                           | Si        |

#### Esempio di configurazione YAML

```yaml title="mysql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example
spec:
  replicas: 2
  size: 10Gi
  resourcesPreset: small

  # Configurazione dei backup automatici
  backup:
    enabled: true
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/mysql-backups
    schedule: "0 3 * * *"                       # Backup ogni giorno alle 3 del mattino
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3AccessKey: "HIKUBE123ACCESSKEY"
    s3SecretKey: "HIKUBE456SECRETKEY"
    resticPassword: "SuperStrongResticPassword!"
```

### resources e resourcesPreset

Il campo `resources` permette di definire esplicitamente la configurazione CPU e memoria di ogni replica MySQL.
Se questo campo e lasciato vuoto, viene utilizzato il valore del parametro `resourcesPreset`.

#### Esempio di configurazione YAML

```yaml title="mysql.yaml"
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

## Guide pratiche

Per le procedure dettagliate, consultate le guide dedicate:

- [Come configurare i backup automatici](./how-to/configure-backups.md)
- [Come ripristinare un backup](./how-to/restore-backup.md)
- [Come scalare verticalmente](./how-to/scale-resources.md)
- [Come gestire utenti e database](./how-to/manage-users-databases.md)

## Problemi noti

- La replica puo fallire con diversi errori
- La replica puo fallire se il binlog e stato eliminato. Finche `mariadbbackup` non viene utilizzato per inizializzare un nodo da mariadb-operator (questa funzionalita non e ancora implementata), seguite questi passaggi manuali per correggere il problema: https://github.com/mariadb-operator/mariadb-operator/issues/141#issuecomment-1804760231
- Gli indici possono talvolta essere corrotti sulla replica primaria. Potete ripristinarli da una replica secondaria

```bash
mysqldump -h <slave> -P 3306 -u<user> -p<password> --column-statistics=0 <database> <table> ~/tmp/fix-table.sql
mysql -h <master> -P 3306 -u<user> -p<password> <database> < ~/tmp/fix-table.sql
```

---

## Esempi Completi

### Cluster di Produzione

```yaml title="mysql-production.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
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

  users:
    admin:
      password: SecureAdminPassword
      maxUserConnections: 100
    appuser:
      password: SecureAppPassword
      maxUserConnections: 500
    readonly:
      password: SecureReadOnlyPassword
      maxUserConnections: 50

  databases:
    production:
      roles:
        admin:
          - admin
        readonly:
          - readonly
    analytics:
      roles:
        admin:
          - admin
        readonly:
          - appuser

  backup:
    enabled: true
    schedule: "0 3 * * *"
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/mysql-backups
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
    resticPassword: SecureResticPassword
```

### Cluster di Sviluppo

```yaml title="mysql-development.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
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
      maxUserConnections: 100

  databases:
    devdb:
      roles:
        admin:
          - dev
```

---

:::tip Buone Pratiche

- **3 repliche minimo** in produzione per assicurare l'alta disponibilita (1 primary + 2 repliche)
- **`maxUserConnections`**: limitate le connessioni per utente per evitare l'esaurimento delle risorse
- **Backup Restic**: attivate i backup automatici con `backup.enabled: true` e conservate il `resticPassword` in un luogo sicuro
- **Separazione dei database**: create un database per applicazione con ruoli distinti (admin, readonly)
:::

:::warning Attenzione

- **Le cancellazioni sono irreversibili**: la cancellazione di una risorsa MySQL comporta la perdita definitiva dei dati se nessun backup e configurato
- **Commutazione del primary**: il cambio di primary tramite `spec.replication.primary.podIndex` puo comportare una breve interruzione delle scritture
- **Indici corrotti**: gli indici possono talvolta essere corrotti sulla replica primaria — ripristinateli da una replica secondaria con `mysqldump`
:::
