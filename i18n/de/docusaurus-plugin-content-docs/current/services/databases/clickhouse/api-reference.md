---
sidebar_position: 3
title: API-Referenz
---

# API-Referenz ClickHouse

Diese Referenz beschreibt die Verwendung von **ClickHouse** auf Hikube, sowohl in einfacher als auch in verteilter Konfiguration mit Shards und Replikas.

---

## Grundstruktur

### **ClickHouse-Ressource**

#### YAML-Konfigurationsbeispiel

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: clickhouse-name
spec:
```

## Parameter

### **Allgemeine Parameter**

| **Parameter**       | **Typ**    | **Beschreibung**                                                                 | **Standard** | **Erforderlich** |
|----------------------|------------|---------------------------------------------------------------------------------|--------------|------------------|
| `replicas`           | `int`      | Anzahl der ClickHouse-Replikas                                                  | `2`          | Ja               |
| `shards`             | `int`      | Anzahl der ClickHouse-Shards                                                    | `1`          | Ja               |
| `resources`          | `object`   | Explizite CPU- und Speicherkonfiguration pro Replika. Wenn leer, wird `resourcesPreset` angewendet | `{}`         | Nein             |
| `resources.cpu`      | `quantity` | Verfügbare CPU pro Replika                                                      | `null`       | Nein             |
| `resources.memory`   | `quantity` | Verfügbarer Speicher (RAM) pro Replika                                          | `null`       | Nein             |
| `resourcesPreset`    | `string`   | Standard-Dimensionierungsprofil (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `"small"`    | Ja               |
| `size`               | `quantity` | Persistent Volume Claim-Größe für Anwendungsdaten                               | `10Gi`       | Ja               |
| `storageClass`       | `string`   | StorageClass zur Datenspeicherung                                               | `""`         | Nein             |

#### YAML-Konfigurationsbeispiel

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

### **Anwendungsspezifische Parameter**

| **Parameter**           | **Typ**              | **Beschreibung**                                             | **Standard** | **Erforderlich** |
|--------------------------|----------------------|-------------------------------------------------------------|--------------|------------------|
| `logStorageSize`         | `quantity`           | Größe des persistenten Volumes für Logs                     | `2Gi`        | Nein             |
| `logTTL`                 | `int`                | TTL (Ablaufzeit) für `query_log` und `query_thread_log`     | `15`         | Nein             |
| `users`                  | `map[string]object`  | Benutzerkonfiguration                                        | `{...}`      | Nein             |
| `users[name].password`   | `string`             | Passwort des Benutzers                                       | `null`       | Ja               |
| `users[name].readonly`   | `bool`               | Benutzer ist schreibgeschützt, Standard ist false            | `null`       | Nein             |

#### YAML-Konfigurationsbeispiel

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

### **Backup-Parameter**

| **Parameter**           | **Typ**    | **Beschreibung**                                | **Standard**                                   | **Erforderlich** |
|--------------------------|------------|------------------------------------------------|------------------------------------------------|------------------|
| `backup`                 | `object`   | Backup-Konfiguration                           | `{}`                                           | Nein             |
| `backup.enabled`         | `bool`     | Regelmäßige Sicherungen aktivieren             | `false`                                        | Nein             |
| `backup.s3Region`        | `string`   | AWS S3-Region der Sicherungen                  | `us-east-1`                                    | Nein             |
| `backup.s3Bucket`        | `string`   | S3-Bucket für Sicherungen                      | `s3.example.org/clickhouse-backups`            | Nein             |
| `backup.schedule`        | `string`   | Cron-Zeitplan für automatische Sicherungen     | `"0 2 * * *"`                                  | Nein             |
| `backup.cleanupStrategy` | `string`   | Aufbewahrungsstrategie für alte Sicherungen    | `"--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"` | Nein             |
| `backup.s3AccessKey`     | `string`   | S3-Zugriffsschlüssel zur Authentifizierung     | `<your-access-key>`                            | Ja               |
| `backup.s3SecretKey`     | `string`   | S3-Geheimschlüssel zur Authentifizierung       | `<your-secret-key>`                            | Ja               |
| `backup.resticPassword`  | `string`   | Passwort für Restic-Backup-Verschlüsselung    | `<password>`                                   | Ja               |

#### YAML-Konfigurationsbeispiel

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

### **ClickHouse Keeper-Parameter**

| **Parameter**                   | **Typ**    | **Beschreibung**                                                                 | **Standard** | **Erforderlich** |
|---------------------------------|------------|---------------------------------------------------------------------------------|--------------|------------------|
| `clickhouseKeeper`              | `object`   | ClickHouse Keeper-Konfiguration                                                  | `{}`         | Nein             |
| `clickhouseKeeper.enabled`      | `bool`     | ClickHouse Keeper für Cluster-Koordination bereitstellen                         | `true`       | Ja               |
| `clickhouseKeeper.size`         | `quantity` | Persistent Volume Claim-Größe für Anwendungsdaten                               | `1Gi`        | Ja               |
| `clickhouseKeeper.resourcesPreset` | `string` | Standard-Dimensionierungsprofil (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `micro`  | Ja               |
| `clickhouseKeeper.replicas`     | `int`      | Anzahl der Keeper-Replikas                                                       | `3`          | Ja               |

#### YAML-Konfigurationsbeispiel

```yaml title="clickhouse.yaml"
clickhouseKeeper:
  enabled: true
  replicas: 3
  resourcesPreset: medium
  size: 5Gi
```

### resources und resourcesPreset

Das Feld `resources` ermöglicht die explizite Definition der CPU- und Speicherkonfiguration jedes ClickHouse-Replikas.
Wenn dieses Feld leer gelassen wird, wird der Wert des Parameters `resourcesPreset` verwendet.

#### YAML-Konfigurationsbeispiel

```yaml title="clickhouse.yaml"
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

### Entwicklungscluster

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

:::tip Bewährte Praktiken

- **Keeper in ungerader Anzahl**: Stellen Sie immer 3 oder 5 Keeper-Replikas bereit, um das Quorum zu gewährleisten (Mehrheit erforderlich für die Leader-Wahl)
- **`logTTL`**: Passen Sie die Aufbewahrungsdauer der Systemlogs (`query_log`, `query_thread_log`) an, um die Ansammlung unnötiger Daten zu vermeiden
- **Shards vs Replikas**: Verwenden Sie Shards zur horizontalen Datenverteilung (mehr Kapazität) und Replikas für Redundanz (mehr Verfügbarkeit)
- **Benutzer `readonly`**: Erstellen Sie einen schreibgeschützten Benutzer für Analyse- und Reporting-Tools
:::

:::warning Achtung

- **Löschungen sind unwiderruflich**: Das Löschen einer ClickHouse-Ressource führt zum endgültigen Datenverlust, wenn keine Sicherung konfiguriert ist
- **Änderung von Shards**: Das Ändern der Shard-Anzahl auf einem bestehenden Cluster kann eine komplexe Datenumverteilung verursachen
- **Keeper und Quorum**: Mit weniger als 3 Keeper kann der Cluster bei Ausfall eines Knotens das Quorum nicht aufrechterhalten
:::
