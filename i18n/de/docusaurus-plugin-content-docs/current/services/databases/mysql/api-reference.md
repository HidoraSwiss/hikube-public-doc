---
sidebar_position: 3
title: API-Referenz
---

# API-Referenz MySQL

Diese Referenz beschreibt die Verwendung von **MySQL** auf Hikube, mit Schwerpunkt auf der Bereitstellung als replizierter Cluster mit einem Primary und Replikas für Hochverfügbarkeit sowie der Möglichkeit, automatische Sicherungen auf S3-kompatiblen Speicher zu aktivieren.

---

## Grundstruktur

### **MySQL-Ressource**

#### YAML-Konfigurationsbeispiel

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example
spec:
```

---

## Parameter

### **Allgemeine Parameter**

| **Parameter**      | **Typ**    | **Beschreibung**                                                                 | **Standard** | **Erforderlich** |
|---------------------|------------|---------------------------------------------------------------------------------|--------------|------------------|
| `replicas`          | `int`      | Anzahl der MariaDB-Replikas im Cluster                                          | `2`          | Ja               |
| `resources`         | `object`   | Explizite CPU- und Speicherkonfiguration für jedes Replika. Wenn leer, wird `resourcesPreset` angewendet | `{}`         | Nein             |
| `resources.cpu`     | `quantity` | Verfügbare CPU pro Replika                                                      | `null`       | Nein             |
| `resources.memory`  | `quantity` | Verfügbarer Speicher (RAM) pro Replika                                          | `null`       | Nein             |
| `resourcesPreset`   | `string`   | Standard-Ressourcenprofil (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `nano`       | Ja               |
| `size`              | `quantity` | Größe des persistenten Volumes (PVC) zur Datenspeicherung                       | `10Gi`       | Ja               |
| `storageClass`      | `string`   | Verwendete StorageClass zur Datenspeicherung                                    | `""`         | Nein             |
| `external`          | `bool`     | Externen Zugriff zum Cluster aktivieren (LoadBalancer)                          | `false`      | Nein             |

#### YAML-Konfigurationsbeispiel

```yaml title="mysql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example              # Name der Instanz
spec:
  replicas: 3                # Anzahl der Replikas (1 Primary + 2 Replikas)

  resources:
    cpu: 1000m               # CPU pro Replika
    memory: 1Gi              # RAM pro Replika

  resourcesPreset: nano      # Standardprofil wenn resources leer ist
  size: 10Gi                 # Größe des persistenten Volumes
  storageClass: ""           # Speicherklasse
  external: false            # Externer Zugriff (LoadBalancer)
```

### **Anwendungsspezifische Parameter**

| **Parameter**                     | **Typ**              | **Beschreibung**                                   | **Standard** | **Erforderlich** |
|-----------------------------------|----------------------|---------------------------------------------------|--------------|------------------|
| `users`                           | `map[string]object`  | Benutzerkonfiguration                              | `{...}`      | Ja               |
| `users[name].password`            | `string`             | Passwort des Benutzers                             | `""`         | Ja               |
| `users[name].maxUserConnections`  | `int`                | Maximale Verbindungsanzahl für den Benutzer        | `0`          | Nein             |
| `databases`                       | `map[string]object`  | Datenbankkonfiguration                             | `{...}`      | Ja               |
| `databases[name].roles`           | `object`             | Rollen der Datenbank                               | `null`       | Nein             |
| `databases[name].roles.admin`     | `[]string`           | Liste der Benutzer mit Admin-Rechten               | `[]`         | Nein             |
| `databases[name].roles.readonly`  | `[]string`           | Liste der Benutzer mit Leserechten                 | `[]`         | Nein             |

#### YAML-Konfigurationsbeispiel

```yaml title="mysql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example
spec:
  replicas: 2
  size: 10Gi
  resourcesPreset: nano
  # MySQL-Benutzer definieren
  users:
    appuser:
      password: strongpassword     # Passwort des Anwendungsbenutzers
      maxUserConnections: 50       # Limit gleichzeitiger Verbindungen
    readonly:
      password: readonlypass       # Benutzer mit eingeschränkten Rechten
      maxUserConnections: 10

  # Datenbanken definieren
  databases:
    myapp:
      roles:
        admin:
          - appuser                # appuser = Admin der Datenbank "myapp"
        readonly:
          - readonly               # readonly = Nur-Lese-Zugriff
    analytics:
      roles:
        admin:
          - appuser                # appuser = Admin der Datenbank "analytics"
```

### **Backup-Parameter**

| **Parameter**           | **Typ**   | **Beschreibung**                                        | **Standard**                              | **Erforderlich** |
|--------------------------|-----------|--------------------------------------------------------|------------------------------------------|------------------|
| `backup`                 | `object`  | Sicherungskonfiguration                                 | `{}`                                     | Nein             |
| `backup.enabled`         | `bool`    | Regelmäßige Sicherungen aktivieren                      | `false`                                  | Nein             |
| `backup.s3Region`        | `string`  | AWS S3-Region der Sicherungen                           | `"us-east-1"`                            | Ja               |
| `backup.s3Bucket`        | `string`  | S3-Bucket für die Sicherungen                           | `"s3.example.org/mysql-backups"`         | Ja               |
| `backup.schedule`        | `string`  | Sicherungszeitplan (Cron)                               | `"0 2 * * *"`                            | Nein             |
| `backup.cleanupStrategy` | `string`  | Aufbewahrungsstrategie für alte Sicherungen              | `"--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"` | Nein |
| `backup.s3AccessKey`     | `string`  | S3-Zugriffsschlüssel (Authentifizierung)                | `"<your-access-key>"`                    | Ja               |
| `backup.s3SecretKey`     | `string`  | S3-Geheimschlüssel (Authentifizierung)                  | `"<your-secret-key>"`                    | Ja               |
| `backup.resticPassword`  | `string`  | Passwort für die Restic-Verschlüsselung                 | `"<password>"`                           | Ja               |

#### YAML-Konfigurationsbeispiel

```yaml title="mysql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example
spec:
  replicas: 2
  size: 10Gi
  resourcesPreset: small

  # Automatische Sicherungskonfiguration
  backup:
    enabled: true
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/mysql-backups
    schedule: "0 3 * * *"                       # Sicherung täglich um 3 Uhr morgens
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3AccessKey: "HIKUBE123ACCESSKEY"
    s3SecretKey: "HIKUBE456SECRETKEY"
    resticPassword: "SuperStrongResticPassword!"
```

### resources und resourcesPreset

Das Feld `resources` ermöglicht die explizite Definition der CPU- und Speicherkonfiguration jedes MySQL-Replikas.
Wenn dieses Feld leer gelassen wird, wird der Wert des Parameters `resourcesPreset` verwendet.

#### YAML-Konfigurationsbeispiel

```yaml title="mysql.yaml"
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

## Praktische Anleitungen

Für detaillierte Verfahren konsultieren Sie die dedizierten Anleitungen:

- [Automatische Sicherungen konfigurieren](./how-to/configure-backups.md)
- [Sicherung wiederherstellen](./how-to/restore-backup.md)
- [Vertikal skalieren](./how-to/scale-resources.md)
- [Benutzer und Datenbanken verwalten](./how-to/manage-users-databases.md)

## Bekannte Probleme

- Die Replikation kann mit verschiedenen Fehlern fehlschlagen
- Die Replikation kann fehlschlagen, wenn das Binlog gelöscht wurde. Solange `mariadbbackup` nicht vom mariadb-operator zur Initialisierung eines Knotens verwendet wird (diese Funktion ist noch nicht implementiert), befolgen Sie diese manuellen Schritte zur Problembehebung: https://github.com/mariadb-operator/mariadb-operator/issues/141#issuecomment-1804760231
- Indizes können manchmal auf dem primären Replika beschädigt werden. Sie können sie von einem sekundären Replika wiederherstellen

```bash
mysqldump -h <slave> -P 3306 -u<user> -p<password> --column-statistics=0 <database> <table> ~/tmp/fix-table.sql
mysql -h <master> -P 3306 -u<user> -p<password> <database> < ~/tmp/fix-table.sql
```

---

## Vollständige Beispiele

### Produktionscluster

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

### Entwicklungscluster

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

:::tip Bewährte Praktiken

- **Mindestens 3 Replikas** in der Produktion für Hochverfügbarkeit (1 Primary + 2 Replikas)
- **`maxUserConnections`**: Begrenzen Sie die Verbindungen pro Benutzer, um Ressourcenerschöpfung zu vermeiden
- **Restic-Sicherungen**: Aktivieren Sie automatische Sicherungen mit `backup.enabled: true` und bewahren Sie das `resticPassword` sicher auf
- **Datenbanktrennung**: Erstellen Sie eine Datenbank pro Anwendung mit unterschiedlichen Rollen (admin, readonly)
:::

:::warning Achtung

- **Löschungen sind unwiderruflich**: Das Löschen einer MySQL-Ressource führt zum endgültigen Datenverlust, wenn keine Sicherung konfiguriert ist
- **Primary-Wechsel**: Das Ändern des Primary über `spec.replication.primary.podIndex` kann eine kurze Unterbrechung der Schreibvorgänge verursachen
- **Beschädigte Indizes**: Indizes können manchmal auf dem primären Replika beschädigt werden — stellen Sie sie mit `mysqldump` von einem sekundären Replika wieder her
:::
