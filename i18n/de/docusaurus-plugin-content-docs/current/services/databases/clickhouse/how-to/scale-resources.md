---
title: "ClickHouse vertikal skalieren"
---

# ClickHouse vertikal skalieren

Diese Anleitung erklärt, wie Sie die CPU-, Speicher- und Storage-Ressourcen Ihrer ClickHouse-Instanz auf Hikube anpassen, entweder über ein vordefiniertes Preset oder durch Definition expliziter Werte.

## Voraussetzungen

- Eine ClickHouse-Instanz auf Hikube bereitgestellt (siehe [Schnellstart](../quick-start.md))
- `kubectl` konfiguriert für die Interaktion mit der Hikube-API
- Die YAML-Konfigurationsdatei Ihrer ClickHouse-Instanz

## Schritte

### 1. Aktuelle Ressourcen überprüfen

Überprüfen Sie die aktuelle Konfiguration Ihrer ClickHouse-Instanz:

```bash
kubectl get clickhouse my-clickhouse -o yaml
```

Notieren Sie die Werte von `resourcesPreset`, `resources`, `replicas`, `shards` und `size` im Abschnitt `spec`.

### 2. resourcesPreset oder explizite Ressourcen ändern

#### Option A: Preset verwenden

Hier sind die verfügbaren Presets:

| **Preset** | **CPU** | **Speicher** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Zum Beispiel, um von `small` (Standardwert) auf `large` zu wechseln:

```yaml title="clickhouse-large.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resourcesPreset: large
  size: 20Gi
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
```

#### Option B: Explizite Ressourcen definieren

Für eine präzise Steuerung geben Sie CPU und Speicher direkt an:

```yaml title="clickhouse-custom-resources.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resources:
    cpu: 4000m
    memory: 8Gi
  size: 50Gi
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: small
    size: 2Gi
```

:::warning
Wenn das Feld `resources` definiert ist, wird der Wert von `resourcesPreset` vollständig ignoriert. Entfernen Sie `resourcesPreset` aus dem Manifest, um Verwirrung zu vermeiden.
:::

### 3. Speicher bei Bedarf anpassen

ClickHouse speichert Daten auf der Festplatte (im Gegensatz zu Redis). Denken Sie daran, das persistente Volume (`size`) entsprechend dem erwarteten Datenvolumen zu vergrößern:

```yaml title="clickhouse-storage.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resourcesPreset: xlarge
  size: 100Gi
  storageClass: replicated
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
```

:::tip
Verwenden Sie `storageClass: replicated` in der Produktion, um Daten gegen den Verlust eines physischen Knotens zu schützen.
:::

### 4. Update anwenden

```bash
kubectl apply -f clickhouse-large.yaml
```

## Überprüfung

Überprüfen Sie, dass die Ressourcen aktualisiert wurden:

```bash
# ClickHouse-Ressourcenkonfiguration prüfen
kubectl get clickhouse my-clickhouse -o yaml | grep -A 5 resources

# Status der ClickHouse-Pods prüfen
kubectl get pods -l app.kubernetes.io/instance=my-clickhouse
```

**Erwartetes Ergebnis:**

```console
NAME                READY   STATUS    RESTARTS   AGE
my-clickhouse-0-0   1/1     Running   0          3m
my-clickhouse-0-1   1/1     Running   0          3m
```

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Parameter `resources`, `resourcesPreset`, `size` und `storageClass`
- [Sharding konfigurieren](./configure-sharding.md) -- Horizontale Datenverteilung
- [Benutzer und Profile verwalten](./manage-users.md) -- Benutzerzugriffsverwaltung
