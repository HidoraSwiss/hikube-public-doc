---
title: "ClickHouse-Benutzer und -Profile verwalten"
---

# ClickHouse-Benutzer und -Profile verwalten

Diese Anleitung erklärt, wie Sie ClickHouse-Benutzer auf Hikube erstellen und verwalten, Nur-Lese-Berechtigungen für Analysten definieren und die Aufbewahrung der Abfragelogs konfigurieren.

## Voraussetzungen

- Eine ClickHouse-Instanz auf Hikube bereitgestellt (siehe [Schnellstart](../quick-start.md))
- `kubectl` konfiguriert für die Interaktion mit der Hikube-API
- Die YAML-Konfigurationsdatei Ihrer ClickHouse-Instanz

## Schritte

### 1. Admin-Benutzer erstellen

Definieren Sie einen Benutzer mit Vollzugriff (Lesen und Schreiben) im Feld `users` des Manifests:

```yaml title="clickhouse-users.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resourcesPreset: small
  size: 10Gi
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
  users:
    admin:
      password: MeinAdminPasswort2024
```

:::warning
Verwenden Sie in der Produktion starke Passwörter. Passwörter werden im Manifest im Klartext gespeichert -- stellen Sie sicher, dass der Zugriff auf Ihre YAML-Dateien und die zugehörigen Kubernetes-Secrets geschützt ist.
:::

### 2. Schreibgeschützten Benutzer erstellen

Fügen Sie einen Benutzer `analyst` mit dem Flag `readonly: true` hinzu, um den Zugriff auf Leseabfragen (SELECT) zu beschränken:

```yaml title="clickhouse-users-readonly.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resourcesPreset: small
  size: 10Gi
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
  users:
    admin:
      password: MeinAdminPasswort2024
    analyst:
      password: AnalystSicher2024
      readonly: true
```

:::tip
Erstellen Sie einen schreibgeschützten Benutzer für Analyse- und Reporting-Tools (Grafana, Metabase, etc.). Dies begrenzt das Risiko versehentlicher Datenänderungen.
:::

### 3. Abfragelogs konfigurieren

ClickHouse zeichnet ausgeführte Abfragen in den Systemtabellen `query_log` und `query_thread_log` auf. Konfigurieren Sie die Speichergröße und Aufbewahrungsdauer der Logs:

```yaml title="clickhouse-users-logs.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resourcesPreset: small
  size: 10Gi
  logStorageSize: 5Gi
  logTTL: 30
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
  users:
    admin:
      password: MeinAdminPasswort2024
    analyst:
      password: AnalystSicher2024
      readonly: true
```

- **`logStorageSize`**: Größe des dedizierten persistenten Volumes für Logs (Standard: `2Gi`)
- **`logTTL`**: Aufbewahrungsdauer in Tagen für `query_log` und `query_thread_log` (Standard: `15`)

:::note
Passen Sie `logTTL` an Ihre Audit-Bedürfnisse an. Ein hoher Wert verbraucht mehr Festplattenplatz (`logStorageSize`). Für eine Entwicklungsumgebung sind `7` Tage in der Regel ausreichend.
:::

### 4. Änderungen anwenden

```bash
kubectl apply -f clickhouse-users-logs.yaml
```

### 5. Mit clickhouse-client verbinden

Testen Sie die Verbindung mit jedem Benutzer:

```bash
# Verbindung mit dem Admin-Benutzer
kubectl exec -it my-clickhouse-0-0 -- clickhouse-client --user admin --password MeinAdminPasswort2024
```

```bash
# Verbindung mit dem Analyst-Benutzer
kubectl exec -it my-clickhouse-0-0 -- clickhouse-client --user analyst --password AnalystSicher2024
```

### 6. Berechtigungen überprüfen

Sobald Sie mit dem Benutzer `analyst` verbunden sind, überprüfen Sie, dass Schreibvorgänge blockiert sind:

```sql
-- Diese Abfrage muss erfolgreich sein (Lesen erlaubt)
SELECT count() FROM system.tables;

-- Diese Abfrage muss fehlschlagen (Schreiben verboten)
CREATE TABLE test_write (id UInt32) ENGINE = Memory;
```

Der schreibgeschützte Benutzer erhält einen Fehler wie:

```console
Code: 164. DB::Exception: analyst: Not enough privileges.
```

## Überprüfung

Überprüfen Sie, dass die Benutzer korrekt konfiguriert sind:

```bash
# ClickHouse-Ressourcenkonfiguration prüfen
kubectl get clickhouse my-clickhouse -o yaml | grep -A 10 users

# Prüfen, ob die Pods den Status Running haben
kubectl get pods -l app.kubernetes.io/instance=my-clickhouse
```

Verbinden Sie sich als Admin und listen Sie die Benutzer auf:

```sql
SELECT name, storage, auth_type FROM system.users;
```

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Parameter `users`, `logStorageSize` und `logTTL`
- [ClickHouse vertikal skalieren](./scale-resources.md) -- CPU- und Speicherressourcen anpassen
- [Sharding konfigurieren](./configure-sharding.md) -- Horizontale Datenverteilung
