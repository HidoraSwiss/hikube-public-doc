---
sidebar_position: 6
title: FAQ
---

# FAQ — MySQL

### Warum verwendet Hikube MariaDB für den MySQL-Dienst?

Der MySQL-Dienst auf Hikube basiert auf **MariaDB**, bereitgestellt über den **MariaDB Operator**. MariaDB ist ein Open-Source-Fork von MySQL, der vollständig kompatibel mit dem MySQL-Protokoll und der MySQL-Syntax ist. Diese Wahl garantiert:

- **Vollständige Kompatibilität** mit bestehenden MySQL-Clients und -Anwendungen
- Eine aktive und transparente **Open-Source**-Entwicklung
- Erweiterte Funktionen (Spaltenkompression, Aria-Engine, etc.)

Ihre MySQL-Anwendungen funktionieren ohne Änderung mit dem Hikube MySQL-Dienst.

### Was ist der Unterschied zwischen `resourcesPreset` und `resources`?

Das Feld `resourcesPreset` ermöglicht die Auswahl eines vordefinierten Ressourcenprofils für jedes MySQL-Replika. Wenn das Feld `resources` (explizite CPU/Speicher) definiert ist, wird `resourcesPreset` **vollständig ignoriert**.

| **Preset** | **CPU** | **Speicher** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

```yaml title="mysql.yaml"
spec:
  # Verwendung eines Presets
  resourcesPreset: small

  # ODER explizite Konfiguration (das Preset wird dann ignoriert)
  resources:
    cpu: 2000m
    memory: 2Gi
```

### Wie funktioniert die MySQL-Replikation auf Hikube?

Die MySQL-Replikation auf Hikube verwendet die **Binlog-Replikation** (Binary Log), verwaltet vom MariaDB Operator:

- Ein Knoten wird als **Primary** (Lesen-Schreiben) bezeichnet
- Die anderen Knoten sind **Replikas** (nur Lesen)
- Der automatische Failover (**Auto-Failover**) wird vom Operator bei einem Ausfall des Primary verwaltet

Mit 3 Replikas erhalten Sie 1 Primary + 2 Replikas, was Hochverfügbarkeit gewährleistet.

### Wie konfiguriere ich Backups mit Restic?

Die MySQL-Sicherungen verwenden **Restic** für Verschlüsselung und Komprimierung. Konfigurieren Sie den Abschnitt `backup` mit einem S3-kompatiblen Speicher:

```yaml title="mysql.yaml"
spec:
  backup:
    enabled: true
    s3Region: eu-central-1
    s3Bucket: s3.example.com/mysql-backups
    schedule: "0 3 * * *"
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
    resticPassword: your-restic-password
```

:::warning
Bewahren Sie das `resticPassword` an einem sicheren Ort auf. Ohne dieses Passwort können die Sicherungen nicht entschlüsselt werden.
:::

### Wie führe ich einen Primary-Switchover durch?

Um die Primary-Rolle auf ein anderes Replika zu übertragen, ändern Sie das Feld `spec.replication.primary.podIndex` in Ihrem Manifest:

```yaml title="mysql.yaml"
spec:
  replication:
    primary:
      podIndex: 1    # Index des Pods, der zum neuen Primary wird
```

Wenden Sie dann die Änderung an:

```bash
kubectl apply -f mysql.yaml
```

:::note
Der Switchover verursacht eine **kurze Unterbrechung** der Schreibvorgänge während des Wechsels. Lesevorgänge bleiben über die Replikas verfügbar.
:::

### Wie verwalte ich Benutzer und Datenbanken?

Verwenden Sie die Maps `users` und `databases`, um Ihre Benutzer und Datenbanken zu definieren. Jeder Benutzer kann ein Verbindungslimit haben, und jede Datenbank `admin`- und `readonly`-Rollen:

```yaml title="mysql.yaml"
spec:
  users:
    appuser:
      password: SecurePassword123
      maxUserConnections: 100
    analyst:
      password: AnalystPassword456
      maxUserConnections: 20

  databases:
    production:
      roles:
        admin:
          - appuser
        readonly:
          - analyst
    analytics:
      roles:
        admin:
          - appuser
        readonly:
          - analyst
```
