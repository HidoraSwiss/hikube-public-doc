---
sidebar_position: 6
title: FAQ
---

# FAQ — PostgreSQL

### Was ist der Unterschied zwischen `resourcesPreset` und `resources`?

Das Feld `resourcesPreset` ermöglicht die Auswahl eines vordefinierten Ressourcenprofils für jedes PostgreSQL-Replika. Wenn das Feld `resources` (explizite CPU/Speicher) definiert ist, wird `resourcesPreset` **vollständig ignoriert**.

| **Preset** | **CPU** | **Speicher** |
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
  # Verwendung eines Presets
  resourcesPreset: medium

  # ODER explizite Konfiguration (das Preset wird dann ignoriert)
  resources:
    cpu: 2000m
    memory: 2Gi
```

### Wie wähle ich zwischen `storageClass` local und replicated?

Hikube bietet zwei Speicherklassen an:

- **`local`**: Die Daten werden auf dem physischen Knoten gespeichert, auf dem der Pod ausgeführt wird. Dieser Modus bietet die **beste Leistung** (minimale Latenz), schützt aber nicht vor dem Ausfall eines Knotens.
- **`replicated`**: Die Daten werden auf mehrere physische Knoten repliziert. Dieser Modus gewährleistet **Multi-DC-Hochverfügbarkeit** und schützt vor dem Verlust eines Knotens, allerdings mit leicht höherer Latenz.

:::tip
Verwenden Sie `storageClass: local`, wenn Sie mehrere Replikas konfigurieren (`replicas` > 1): Die Anwendungsreplikation (PostgreSQL-Standby) gewährleistet bereits Hochverfügbarkeit. Verwenden Sie `storageClass: replicated`, wenn Sie nur ein Replika haben (`replicas` = 1): Der replizierte Speicher kompensiert das Fehlen der Anwendungsreplikation. In der Entwicklung mit einem einzelnen Replika kann `local` ausreichen, wenn Datenverlust akzeptabel ist.
:::

### Wie verbinde ich mich von innerhalb des Clusters mit PostgreSQL?

Der PostgreSQL-Service ist über den folgenden Kubernetes-Service-Namen erreichbar:

- **Lese-Schreib-Service**: `pg-<name>-rw` auf Port `5432`

Die Verbindungsanmeldedaten sind in einem Kubernetes-Secret namens `pg-<name>-app` gespeichert.

```bash
# Passwort abrufen
kubectl get tenantsecret pg-mydb-app -o jsonpath='{.data.password}' | base64 -d

# Benutzernamen abrufen
kubectl get tenantsecret pg-mydb-app -o jsonpath='{.data.username}' | base64 -d

# Von einem Pod aus verbinden
psql -h pg-mydb-rw -p 5432 -U <username> -d <database>
```

### Wie konfiguriere ich die synchrone Replikation?

Die synchrone Replikation stellt sicher, dass eine Transaktion erst bestätigt wird, wenn sie auf einer Mindestanzahl von Replikas geschrieben wurde. Konfigurieren Sie die `quorum`-Parameter in Ihrem Manifest:

```yaml title="postgresql.yaml"
spec:
  replicas: 3
  quorum:
    minSyncReplicas: 1    # Mindestens 1 Replika muss bestätigen
    maxSyncReplicas: 2    # Maximal 2 Replikas bestätigen
```

- **`minSyncReplicas`**: Mindestanzahl synchroner Replikas, die eine Transaktion bestätigen müssen.
- **`maxSyncReplicas`**: Maximale Anzahl synchroner Replikas, die bestätigen können.

:::warning
Die synchrone Replikation erhöht die Schreiblatenz. Stellen Sie sicher, dass Sie genügend Replikas haben (`replicas` >= `maxSyncReplicas` + 1).
:::

### Wie aktiviere ich das PITR-Backup?

PostgreSQL auf Hikube verwendet **CloudNativePG** mit WAL-Archivierung, um die Point-In-Time-Recovery (PITR) zu ermöglichen. Konfigurieren Sie den Abschnitt `backup` mit einem S3-kompatiblen Speicher:

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

Die Sicherungen enthalten automatisch die WAL-Dateien, was eine Wiederherstellung der Datenbank zu jedem beliebigen Zeitpunkt zwischen zwei Sicherungen ermöglicht.

### Wie füge ich PostgreSQL-Erweiterungen hinzu?

Sie können PostgreSQL-Erweiterungen für jede Datenbank über das Feld `databases[name].extensions` aktivieren:

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

Die Erweiterungen werden automatisch bei der Erstellung der Datenbank aktiviert. Die verfügbaren Erweiterungen hängen von der bereitgestellten PostgreSQL-Version ab.

### Können mehrere Datenbanken und Benutzer erstellt werden?

Ja. Verwenden Sie die Maps `users` und `databases`, um beliebig viele Benutzer und Datenbanken zu definieren. Jede Datenbank kann unterschiedliche `admin`- und `readonly`-Rollen haben:

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
