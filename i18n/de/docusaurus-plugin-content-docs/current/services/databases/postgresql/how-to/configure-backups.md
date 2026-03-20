---
title: "Automatische Sicherungen konfigurieren"
---

# Automatische Sicherungen konfigurieren

Diese Anleitung erklärt, wie Sie automatische Sicherungen Ihrer PostgreSQL-Datenbank auf einen S3-kompatiblen Speicher aktivieren und konfigurieren, über den CloudNativePG-Operator.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- Eine **PostgreSQL**-Instanz auf Hikube bereitgestellt (oder ein Manifest zur Bereitstellung)
- Ein zugänglicher **S3-kompatibler Bucket** (Minio, AWS S3, etc.)
- Die **S3-Anmeldedaten**: Access Key, Secret Key, Endpoint-URL

## Schritte

### 1. S3-Anmeldedaten vorbereiten

Bevor Sie die Sicherungen aktivieren, sammeln Sie die folgenden Informationen:

| Parameter | Beschreibung | Beispiel |
|-----------|-------------|---------|
| `destinationPath` | S3-Pfad des Ziel-Buckets | `s3://backups/postgresql/production/` |
| `endpointURL` | URL des S3-Endpoints | `http://minio-gateway-service:9000` |
| `s3AccessKey` | S3-Zugriffsschlüssel | `oobaiRus9pah8PhohL1ThaeTa4UVa7gu` |
| `s3SecretKey` | S3-Geheimschlüssel | `ju3eum4dekeich9ahM1te8waeGai0oog` |

:::tip
Wenn Sie den Hikube Object Storage (Minio) verwenden, ist der Standard-Endpoint `http://minio-gateway-service:9000`. Für einen externen Anbieter (AWS S3, Scaleway, etc.) geben Sie die entsprechende URL an.
:::

### 2. PostgreSQL-Manifest mit aktiviertem Backup erstellen

Erstellen oder ändern Sie Ihr Manifest, um den Abschnitt `backup` einzufügen:

```yaml title="postgresql-with-backup.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 3
  resourcesPreset: medium
  size: 20Gi

  users:
    admin:
      password: SecureAdminPassword

  databases:
    myapp:
      roles:
        admin:
          - admin

  backup:
    enabled: true
    schedule: "0 2 * * *"
    retentionPolicy: 30d
    destinationPath: s3://backups/postgresql/my-database/
    endpointURL: http://minio-gateway-service:9000
    s3AccessKey: oobaiRus9pah8PhohL1ThaeTa4UVa7gu
    s3SecretKey: ju3eum4dekeich9ahM1te8waeGai0oog
```

**Details der Backup-Parameter:**

| Parameter | Beschreibung | Standardwert |
|-----------|-------------|-------------------|
| `backup.enabled` | Automatische Sicherungen aktivieren | `false` |
| `backup.schedule` | Cron-Zeitplan (hier: täglich um 2 Uhr) | `"0 2 * * * *"` |
| `backup.retentionPolicy` | Aufbewahrungsdauer der Sicherungen | `"30d"` |
| `backup.destinationPath` | S3-Zielpfad | _(erforderlich)_ |
| `backup.endpointURL` | URL des S3-Endpoints | _(erforderlich)_ |
| `backup.s3AccessKey` | S3-Zugriffsschlüssel | _(erforderlich)_ |
| `backup.s3SecretKey` | S3-Geheimschlüssel | _(erforderlich)_ |

:::note
Der `schedule` verwendet die Standard-Cron-Syntax. Gängige Beispiele:
- `"0 2 * * *"`: täglich um 2:00 Uhr
- `"0 */6 * * *"`: alle 6 Stunden
- `"0 2 * * 0"`: jeden Sonntag um 2:00 Uhr
:::

### 3. Konfiguration anwenden

```bash
kubectl apply -f postgresql-with-backup.yaml
```

### 4. Überprüfen, ob die Sicherungen konfiguriert sind

Überprüfen Sie, dass die PostgreSQL-Instanz mit aktiviertem Backup bereitgestellt wurde:

```bash
kubectl get postgres my-database -o yaml | grep -A 10 backup
```

**Erwartetes Ergebnis:**

```console
  backup:
    enabled: true
    schedule: "0 2 * * *"
    retentionPolicy: 30d
    destinationPath: s3://backups/postgresql/my-database/
    endpointURL: http://minio-gateway-service:9000
```

## Überprüfung

Um zu bestätigen, dass die Sicherungen korrekt funktionieren:

1. **Überprüfen Sie die Logs** des PostgreSQL-Primary-Pods auf Sicherungsmeldungen:

```bash
kubectl logs postgres-my-database-1 -c postgres | grep -i backup
```

2. **Überprüfen Sie den Inhalt des S3-Buckets**, um zu bestätigen, dass die WAL-Dateien und Base-Backups gesendet werden.

3. **Überprüfen Sie die Events** der Instanz:

```bash
kubectl describe postgres my-database
```

:::warning
Testen Sie regelmäßig die Wiederherstellung Ihrer Sicherungen. Eine Sicherung, die nie getestet wurde, ist keine zuverlässige Sicherung. Lesen Sie die Anleitung [Sicherung wiederherstellen (PITR)](./restore-backup.md).
:::

## Weiterführende Informationen

- **[API-Referenz PostgreSQL](../api-reference.md)**: Vollständige Dokumentation aller Backup-Parameter
- **[Sicherung wiederherstellen (PITR)](./restore-backup.md)**: Daten zu einem bestimmten Zeitpunkt wiederherstellen
