---
title: "Automatische Sicherungen konfigurieren"
---

# Automatische Sicherungen konfigurieren

Diese Anleitung erklärt, wie Sie automatische Sicherungen Ihrer MySQL-Datenbank auf Hikube aktivieren und konfigurieren. Die Sicherungen verwenden **Restic** und werden in einem **S3-kompatiblen** Bucket gespeichert, was eine zuverlässige Wiederherstellung bei Datenverlust ermöglicht.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- Eine **MySQL**-Instanz auf Ihrem Tenant bereitgestellt
- Ein zugänglicher **S3-kompatibler Bucket** (Hikube Object Storage, AWS S3, etc.)
- **S3-Zugangsdaten** (Access Key und Secret Key)

## Schritte

### 1. S3-Speicher und Anmeldedaten vorbereiten

Stellen Sie vor der Konfiguration der Sicherungen sicher, dass Sie die folgenden Informationen haben:

| Information | Beispiel | Beschreibung |
|---|---|---|
| **S3-Region** | `eu-central-1` | Region des S3-Buckets |
| **S3-Bucket** | `s3.hikube.cloud/mysql-backups` | Vollständiger Pfad des Buckets |
| **Access Key** | `HIKUBE123ACCESSKEY` | S3-Zugriffsschlüssel |
| **Secret Key** | `HIKUBE456SECRETKEY` | S3-Geheimschlüssel |
| **Restic-Passwort** | `SuperStrongResticPassword!` | Passwort für die Verschlüsselung der Sicherungen |

:::warning
Bewahren Sie das **Restic-Passwort** an einem sicheren Ort auf. Ohne dieses Passwort ist es unmöglich, die verschlüsselten Sicherungen wiederherzustellen.
:::

### 2. Backup-Abschnitt im Manifest konfigurieren

Erstellen oder ändern Sie Ihr MySQL-Manifest, um den Abschnitt `backup` einzufügen:

```yaml title="mysql-with-backup.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: example
spec:
  replicas: 3
  size: 10Gi
  resourcesPreset: small

  users:
    appuser:
      password: strongpassword
      maxUserConnections: 100

  databases:
    myapp:
      roles:
        admin:
          - appuser

  backup:
    enabled: true
    schedule: "0 2 * * *"                                              # Täglich um 2 Uhr morgens
    cleanupStrategy: "--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/mysql-backups
    s3AccessKey: "HIKUBE123ACCESSKEY"
    s3SecretKey: "HIKUBE456SECRETKEY"
    resticPassword: "SuperStrongResticPassword!"
```

#### Backup-Parameter

| Parameter | Beschreibung | Standardwert |
|---|---|---|
| `backup.enabled` | Sicherungen aktivieren | `false` |
| `backup.schedule` | Cron-Zeitplan | `"0 2 * * *"` |
| `backup.s3Region` | AWS S3-Region | `"us-east-1"` |
| `backup.s3Bucket` | S3-Bucket | - |
| `backup.s3AccessKey` | S3-Zugriffsschlüssel | - |
| `backup.s3SecretKey` | S3-Geheimschlüssel | - |
| `backup.resticPassword` | Restic-Passwort | - |
| `backup.cleanupStrategy` | Aufbewahrungsstrategie | `"--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"` |

:::tip
Passen Sie den `schedule` an Ihre Bedürfnisse an. Einige gängige Beispiele:
- `"0 2 * * *"`: täglich um 2:00 Uhr morgens
- `"0 */6 * * *"`: alle 6 Stunden
- `"0 3 * * 0"`: jeden Sonntag um 3:00 Uhr morgens
:::

### 3. Konfiguration anwenden

```bash
kubectl apply -f mysql-with-backup.yaml
```

### 4. Aufbewahrungsstrategie anpassen

Die `cleanupStrategy` verwendet die Aufbewahrungsoptionen von Restic. Hier einige Beispiele:

| Strategie | Beschreibung |
|---|---|
| `--keep-last=3` | Die letzten 3 Snapshots behalten |
| `--keep-daily=7` | 1 Snapshot pro Tag für 7 Tage behalten |
| `--keep-weekly=4` | 1 Snapshot pro Woche für 4 Wochen behalten |
| `--keep-within-weekly=1m` | Alle wöchentlichen Snapshots des letzten Monats behalten |

Beispiel für eine Produktionsumgebung:

```yaml title="mysql-production-backup.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: production
spec:
  replicas: 3
  resourcesPreset: medium
  size: 50Gi

  backup:
    enabled: true
    schedule: "0 */6 * * *"
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/mysql-backups
    s3AccessKey: "PROD_ACCESS_KEY"
    s3SecretKey: "PROD_SECRET_KEY"
    resticPassword: "ProdResticPassword!"
```

## Überprüfung

Überprüfen Sie, dass die Konfiguration korrekt angewendet wurde:

```bash
kubectl get mariadb example -o yaml | grep -A 10 backup
```

**Erwartetes Ergebnis:**

```console
  backup:
    enabled: true
    schedule: "0 2 * * *"
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/mysql-backups
    cleanupStrategy: "--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"
```

:::note
Die erste Sicherung wird gemäß dem in `schedule` definierten Cron-Zeitplan ausgeführt. Sie können die verfügbaren Snapshots mit dem Restic-Befehl überprüfen (siehe Anleitung [Sicherung wiederherstellen](./restore-backup.md)).
:::

## Weiterführende Informationen

- [API-Referenz](../api-reference.md): Vollständige Liste der Backup-Parameter
- [Sicherung wiederherstellen](./restore-backup.md): Wiederherstellungsverfahren aus einem Restic-Snapshot
