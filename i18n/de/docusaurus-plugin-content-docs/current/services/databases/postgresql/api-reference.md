---
sidebar_position: 3
title: API-Referenz
---

# API-Referenz PostgreSQL

Diese Referenz beschreibt die Verwendung von **PostgreSQL** auf Hikube, mit Schwerpunkt auf dem Betrieb als replizierter Cluster mit einem Primary und Standbys für Hochverfügbarkeit sowie der Möglichkeit, automatische Sicherungen auf S3-kompatiblen Speicher zu aktivieren.

---

## Grundstruktur

### **Postgres-Ressource**

#### YAML-Konfigurationsbeispiel

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: example
spec:
```

---

## Parameter

### **Allgemeine Parameter**

| **Parameter**       | **Typ**    | **Beschreibung**                                                                 | **Standard** | **Erforderlich** |
|----------------------|------------|---------------------------------------------------------------------------------|--------------|------------------|
| `replicas`           | `int`      | Anzahl der PostgreSQL-Replikas (Instanzen im Cluster)                          | `2`          | Ja               |
| `resources`          | `object`   | Explizite CPU- und Speicherkonfiguration für jedes PostgreSQL-Replika. Wenn leer, wird `resourcesPreset` angewendet | `{}`         | Nein             |
| `resources.cpu`      | `quantity` | Verfügbare CPU pro Replika                                                      | `null`       | Nein             |
| `resources.memory`   | `quantity` | Verfügbarer Speicher (RAM) pro Replika                                          | `null`       | Nein             |
| `resourcesPreset`    | `string`   | Standard-Dimensionierungsprofil (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `"micro"` | Ja               |
| `size`               | `quantity` | Persistent Volume Claim-Größe für Anwendungsdaten                               | `10Gi`       | Ja               |
| `storageClass`       | `string`   | StorageClass zur Datenspeicherung                                               | `""`         | Nein             |
| `external`           | `bool`     | Externen Zugriff von außerhalb des Clusters aktivieren                          | `false`      | Nein             |

#### YAML-Konfigurationsbeispiel

```yaml title="postgresql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: postgres-example
spec:
  # Anzahl der PostgreSQL-Replikas (Instanzen im Cluster)
  replicas: 3
  # Explizite Ressourcenkonfiguration
  resources:
    cpu: 2000m     # 2 vCPU pro Instanz
    memory: 2Gi    # 2 GiB RAM pro Instanz
  # Verwendung eines Presets wenn resources leer ist
  resourcesPreset: micro
  # Persistentes Volume für jede PostgreSQL-Instanz
  size: 10Gi
  # Speicherklasse (leer lassen für die Standard-Klasse des Clusters)
  storageClass: "replicated"
  # Datenbank extern freigeben (LoadBalancer wenn true)
  external: false
```

---

### **Anwendungsspezifische Parameter**

| **Parameter**                         | **Typ**              | **Beschreibung**                                                                 | **Standard** | **Erforderlich** |
|---------------------------------------|----------------------|---------------------------------------------------------------------------------|--------------|------------------|
| `postgresql`                          | `object`             | PostgreSQL-Serverkonfiguration                                                   | `{}`         | Nein             |
| `postgresql.parameters`               | `object`             | PostgreSQL-Serverparameter                                                       | `{}`         | Nein             |
| `postgresql.parameters.max_connections` | `int`               | Maximale Anzahl gleichzeitiger Verbindungen zum Datenbankserver (Standard: 100)  | `100`        | Nein             |
| `quorum`                              | `object`             | Quorum-Konfiguration für synchrone Replikation                                   | `{}`         | Nein             |
| `quorum.minSyncReplicas`              | `int`                | Mindestanzahl synchroner Replikas, die eine Transaktion bestätigen müssen        | `0`          | Nein             |
| `quorum.maxSyncReplicas`              | `int`                | Maximale Anzahl synchroner Replikas, die eine Transaktion bestätigen können      | `0`          | Nein             |
| `users`                               | `map[string]object`  | Benutzerkonfiguration                                                            | `{...}`      | Nein             |
| `users[name].password`                | `string`             | Passwort des Benutzers                                                           | `null`       | Ja               |
| `users[name].replication`             | `bool`               | Ob der Benutzer Replikationsrechte hat                                           | `null`       | Nein             |
| `databases`                           | `map[string]object`  | Datenbankkonfiguration                                                           | `{...}`      | Nein             |
| `databases[name].roles`               | `object`             | Rollen für die Datenbank                                                         | `null`       | Nein             |
| `databases[name].roles.admin`         | `[]string`           | Liste der Benutzer mit Admin-Rechten                                             | `[]`         | Nein             |
| `databases[name].roles.readonly`      | `[]string`           | Liste der Benutzer mit Leserechten                                               | `[]`         | Nein             |
| `databases[name].extensions`          | `[]string`           | Aktivierte Erweiterungen für die Datenbank                                       | `[]`         | Nein             |

#### YAML-Konfigurationsbeispiel

```yaml title="postgresql.yaml"
spec:
  replicas: 3
  size: 10Gi
  storageClass: replicated
  resourcesPreset: medium

  # PostgreSQL-Serverkonfiguration
  postgresql:
    parameters:
      max_connections: 200
      shared_buffers: 512MB
      work_mem: 64MB

  # Quorum-Konfiguration für synchrone Replikation
  quorum:
    minSyncReplicas: 1
    maxSyncReplicas: 2

  # Benutzer
  users:
    admin:
      password: StrongAdminPwd123
      replication: true
    appuser:
      password: AppUserPwd456
    readonly:
      password: ReadOnlyPwd789

  # Datenbanken
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

### **Backup-Parameter**

| **Parameter**              | **Typ**    | **Beschreibung**                                        | **Standard**                      | **Erforderlich** |
|-----------------------------|------------|---------------------------------------------------------|-----------------------------------|------------------|
| `backup`                    | `object`  | Backup-Konfiguration                                    | `{}`                              | Nein             |
| `backup.enabled`            | `bool`    | Regelmäßige Sicherungen aktivieren                      | `false`                           | Nein             |
| `backup.schedule`           | `string`  | Cron-Zeitplan für automatische Sicherungen              | `"0 2 * * * *"`                   | Nein             |
| `backup.retentionPolicy`    | `string`  | Aufbewahrungsrichtlinie                                 | `"30d"`                           | Nein             |
| `backup.destinationPath`    | `string`  | Speicherpfad für die Sicherung (z.B. s3://bucket/path/) | `"s3://bucket/path/to/folder/"`   | Ja               |
| `backup.endpointURL`        | `string`  | S3-Endpoint zum Hochladen der Daten                     | `"http://minio-gateway-service:9000"` | Ja           |
| `backup.s3AccessKey`        | `string`  | Zugriffsschlüssel für S3 zur Authentifizierung          | `<your-access-key>`               | Ja               |
| `backup.s3SecretKey`        | `string`  | Geheimer Schlüssel für S3 zur Authentifizierung         | `<your-secret-key>`               | Ja               |

Um eine **PostgreSQL**-Datenbank zu sichern, ist ein externer **S3-kompatibler** Speicher erforderlich.

Um regelmäßige Sicherungen zu aktivieren:

1. Aktualisieren Sie die Konfiguration Ihrer PostgreSQL-Anwendung.
2. Setzen Sie den Parameter `backup.enabled` auf `true`.
3. Geben Sie den Zielpfad und die Anmeldedaten in den `backup.*`-Feldern an.

#### YAML-Konfigurationsbeispiel

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
  endpointURL: http://minio-gateway-service:9000
  schedule: "0 2 * * * *"
  s3AccessKey: oobaiRus9pah8PhohL1ThaeTa4UVa7gu
  s3SecretKey: ju3eum4dekeich9ahM1te8waeGai0oog
```

### **Parameter zur Backup-Wiederherstellung**

| **Parameter**             | **Typ**    | **Beschreibung**                                                                                       | **Standard** | **Erforderlich** |
|----------------------------|------------|-------------------------------------------------------------------------------------------------------|--------------|------------------|
| `bootstrap`                | `object`   | Bootstrap-Konfiguration                                                                               | `{}`         | Nein             |
| `bootstrap.enabled`        | `bool`     | Datenbankcluster aus einem Backup wiederherstellen                                                     | `false`      | Nein             |
| `bootstrap.recoveryTime`   | `string`   | Zeitstempel (PITR), bis zu dem die Wiederherstellung erfolgen soll (Format RFC 3339). Leer = letztes Backup | `""`         | Nein             |
| `bootstrap.oldName`        | `string`   | Name des PostgreSQL-Clusters vor der Löschung                                                         | `""`         | Ja               |

Hikube unterstützt die **Wiederherstellung zu einem bestimmten Zeitpunkt (Point-In-Time Recovery - PITR)**.
Die Wiederherstellung erfolgt durch Erstellen einer **neuen PostgreSQL-Instanz** mit einem anderen Namen, aber einer identischen Konfiguration wie die Ursprungsinstanz.

#### Schritte

1. Erstellen Sie eine neue PostgreSQL-Anwendung.
2. Geben Sie ihr einen anderen Namen als die Ursprungsinstanz.
3. Aktivieren Sie den Parameter `bootstrap.enabled`.
4. Geben Sie an:
   - `bootstrap.oldName`: den Namen der alten PostgreSQL-Instanz.
   - `bootstrap.recoveryTime`: den Zeitpunkt, bis zu dem wiederhergestellt werden soll, im Format **RFC 3339**. Wenn leer gelassen, wird bis zum letzten verfügbaren Zustand wiederhergestellt.

---

#### YAML-Konfigurationsbeispiel

```yaml title="postgresql.yaml"
bootstrap:
  enabled: true
  oldName: "postgres-example"   # Name der alten Instanz
  recoveryTime: "2025-01-15T10:30:00Z"  # Wiederherstellung zu einem bestimmten Zeitpunkt (RFC 3339)
```

### resources und resourcesPreset

Das Feld `resources` ermöglicht die explizite Definition der CPU- und Speicherkonfiguration jedes PostgreSQL-Replikas.
Wenn dieses Feld leer gelassen wird, wird der Wert des Parameters `resourcesPreset` verwendet.

#### YAML-Konfigurationsbeispiel

```yaml title="postgresql.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```

⚠️ Achtung: Wenn resources definiert ist, wird der Wert von resourcesPreset ignoriert.

| **Preset-Name** | **CPU** | **Speicher** |
|------------------|---------|-------------|
| `nano`          | 250m    | 128Mi       |
| `micro`         | 500m    | 256Mi       |
| `small`         | 1       | 512Mi       |
| `medium`        | 1       | 1Gi         |
| `large`         | 2       | 2Gi         |
| `xlarge`        | 4       | 4Gi         |
| `2xlarge`       | 8       | 8Gi         |

---

## Vollständige Beispiele

### Produktionscluster

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
    endpointURL: http://minio-gateway-service:9000
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
```

### Entwicklungscluster

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

:::tip Bewährte Praktiken

- **Synchrone Replikation**: Konfigurieren Sie `quorum.minSyncReplicas: 1` in der Produktion, um sicherzustellen, dass mindestens ein Replika jede Transaktion bestätigt
- **S3-Sicherungen**: Aktivieren Sie automatische Sicherungen mit `backup.enabled: true` und testen Sie regelmäßig die Wiederherstellung
- **Rollentrennung**: Erstellen Sie separate Benutzer für Administration, Anwendung und Lesezugriff
- **PostgreSQL-Parameter**: Passen Sie `shared_buffers` (~25% des RAM), `work_mem` und `max_connections` an Ihre Arbeitslast an
:::

:::warning Achtung

- **Löschungen sind unwiderruflich**: Das Löschen einer Postgres-Ressource führt zum endgültigen Datenverlust, wenn keine Sicherung konfiguriert ist
- **`resources` vs `resourcesPreset`**: Wenn `resources` definiert ist, wird `resourcesPreset` vollständig ignoriert
- **PITR-Wiederherstellung**: Die Wiederherstellung erstellt eine **neue Instanz** mit einem anderen Namen — sie stellt nicht die bestehende Instanz wieder her
:::
