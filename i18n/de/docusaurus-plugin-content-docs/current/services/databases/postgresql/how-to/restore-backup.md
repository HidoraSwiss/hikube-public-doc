---
title: "Sicherung wiederherstellen (PITR)"
---

# Sicherung wiederherstellen (PITR)

Diese Anleitung erklärt, wie Sie eine PostgreSQL-Datenbank zu einem bestimmten Zeitpunkt dank des in Hikube integrierten **Point-In-Time Recovery (PITR)**-Mechanismus wiederherstellen.

:::warning
Die PITR-Wiederherstellung erstellt eine **neue PostgreSQL-Instanz** mit einem anderen Namen. Sie stellt nicht die bestehende Instanz an Ort und Stelle wieder her. Die alte Instanz wird nicht verändert.
:::

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- Eine ursprüngliche PostgreSQL-Instanz mit **aktivierten Sicherungen** (`backup.enabled: true`)
- Die Sicherungen müssen korrekt an den S3-Bucket gesendet worden sein
- Der **Name der alten Instanz** PostgreSQL (`bootstrap.oldName`)
- (Optional) Ein **RFC 3339-Zeitstempel** für die Wiederherstellung zu einem bestimmten Zeitpunkt

## Schritte

### 1. Wiederherstellungspunkt identifizieren

Bestimmen Sie den Zeitpunkt, zu dem Sie Ihre Daten wiederherstellen möchten. Der Zeitstempel muss im Format **RFC 3339** sein:

```
YYYY-MM-DDTHH:MM:SSZ
```

**Beispiele:**

| Zeitstempel | Beschreibung |
|-----------|-------------|
| `2025-06-15T10:30:00Z` | 15. Juni 2025 um 10:30 UTC |
| `2025-06-15T14:00:00+02:00` | 15. Juni 2025 um 14:00 (Pariser Zeit) |
| _(leer)_ | Wiederherstellung zum letzten verfügbaren Zustand |

:::tip
Wenn Sie `recoveryTime` leer lassen, wird die Wiederherstellung bis zum letzten verfügbaren WAL durchgeführt, also dem aktuellsten möglichen Zustand.
:::

### 2. Manifest der neuen Instanz vorbereiten

Erstellen Sie ein Manifest für die neue PostgreSQL-Instanz. Der Name muss **anders** als die Ursprungsinstanz sein. Die Konfiguration (Replikas, Ressourcen, Speicher) muss **identisch** mit der Ursprungsinstanz sein.

Fügen Sie den Abschnitt `bootstrap` hinzu, um die Wiederherstellung zu aktivieren:

```yaml title="postgresql-restored.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database-restored
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
    destinationPath: s3://backups/postgresql/my-database-restored/
    endpointURL: https://prod.s3.hikube.cloud
    s3AccessKey: oobaiRus9pah8PhohL1ThaeTa4UVa7gu
    s3SecretKey: ju3eum4dekeich9ahM1te8waeGai0oog

  bootstrap:
    enabled: true
    oldName: "my-database"
    recoveryTime: "2025-06-15T10:30:00Z"
```

**Schlüsselparameter des Abschnitts `bootstrap`:**

| Parameter | Beschreibung | Erforderlich |
|-----------|-------------|--------|
| `bootstrap.enabled` | Wiederherstellung aus einer Sicherung aktivieren | Ja |
| `bootstrap.oldName` | Name der alten PostgreSQL-Instanz | Ja |
| `bootstrap.recoveryTime` | RFC 3339-Zeitstempel des Wiederherstellungspunkts. Leer = letzter verfügbarer Zustand | Nein |

:::note
Das Feld `bootstrap.oldName` entspricht dem `metadata.name` der Ursprungsinstanz. In diesem Beispiel hieß die alte Instanz `my-database`.
:::

### 3. Manifest anwenden

```bash
kubectl apply -f postgresql-restored.yaml
```

Die Erstellung der neuen Instanz und die Wiederherstellung können je nach Datenvolumen mehrere Minuten dauern.

### 4. Wiederherstellung überprüfen

Überwachen Sie den Status der neuen Instanz:

```bash
kubectl get postgres my-database-restored
```

**Erwartetes Ergebnis:**

```console
NAME                      READY   AGE     VERSION
my-database-restored      True    3m12s   0.18.0
```

Überprüfen Sie, dass die Pods den Status `Running` haben:

```bash
kubectl get po | grep postgres-my-database-restored
```

**Erwartetes Ergebnis:**

```console
postgres-my-database-restored-1   1/1     Running   0   3m
postgres-my-database-restored-2   1/1     Running   0   2m
postgres-my-database-restored-3   1/1     Running   0   1m
```

### 5. Wiederhergestellte Daten validieren

Rufen Sie die Verbindungsanmeldedaten der neuen Instanz ab:

```bash
kubectl get secret postgres-my-database-restored-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

Verbinden Sie sich mit der Datenbank und überprüfen Sie, ob die Daten vorhanden sind:

```bash
kubectl port-forward svc/postgres-my-database-restored-rw 5432:5432
```

```bash
psql -h 127.0.0.1 -U admin myapp
```

```sql
-- Tabellen und Daten überprüfen
\dt
SELECT count(*) FROM ihre_tabelle;
```

## Überprüfung

Die Wiederherstellung ist erfolgreich, wenn:

- Die Instanz `my-database-restored` den Status `READY: True` hat
- Alle PostgreSQL-Pods den Status `Running` haben
- Die Daten zum angeforderten Zeitstempel vorhanden und konsistent sind
- Die `psql`-Verbindung korrekt funktioniert

:::tip
Sobald die Wiederherstellung validiert ist, denken Sie daran, Ihre Anwendungen zu aktualisieren, damit sie auf die neue Instanz zeigen (`postgres-my-database-restored-rw` statt `postgres-my-database-rw`).
:::

## Weiterführende Informationen

- **[API-Referenz PostgreSQL](../api-reference.md)**: Vollständige Dokumentation der `bootstrap`-Parameter
- **[Automatische Sicherungen konfigurieren](./configure-backups.md)**: Sicherungen auf der neuen Instanz aktivieren
