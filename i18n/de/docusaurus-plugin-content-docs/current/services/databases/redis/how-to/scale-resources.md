---
title: "Redis vertikal skalieren"
---

# Redis vertikal skalieren

Diese Anleitung erklärt, wie Sie die CPU-, Speicher- und Storage-Ressourcen Ihrer Redis-Instanz auf Hikube anpassen, entweder über ein vordefiniertes Preset oder durch Definition expliziter Werte.

## Voraussetzungen

- Eine Redis-Instanz auf Hikube bereitgestellt (siehe [Schnellstart](../quick-start.md))
- `kubectl` konfiguriert für die Interaktion mit der Hikube-API
- Die YAML-Konfigurationsdatei Ihrer Redis-Instanz

## Schritte

### 1. Aktuelle Ressourcen überprüfen

Überprüfen Sie die aktuelle Konfiguration Ihrer Redis-Instanz:

```bash
kubectl get redis my-redis -o yaml
```

Notieren Sie die Werte von `resourcesPreset`, `resources`, `replicas` und `size` im Abschnitt `spec`.

### 2. Option A: resourcesPreset ändern

Der einfachste Weg zu skalieren ist die Verwendung eines vordefinierten Presets. Hier sind die verfügbaren Presets:

| **Preset** | **CPU** | **Speicher** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Zum Beispiel, um von `nano` auf `medium` zu wechseln:

```yaml title="redis-medium.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: my-redis
spec:
  replicas: 2
  resourcesPreset: medium
  size: 2Gi
  authEnabled: true
```

### 3. Option B: Explizite Ressourcen definieren

Für eine präzise Steuerung geben Sie CPU und Speicher direkt über das Feld `resources` an:

```yaml title="redis-custom-resources.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: my-redis
spec:
  replicas: 2
  resources:
    cpu: 2000m
    memory: 4Gi
  size: 5Gi
  authEnabled: true
```

:::warning
Wenn das Feld `resources` definiert ist, wird der Wert von `resourcesPreset` vollständig ignoriert. Entfernen Sie `resourcesPreset` aus dem Manifest, um Verwirrung zu vermeiden.
:::

### 4. Anzahl der Replikas bei Bedarf anpassen

Sie können auch die Anzahl der Replikas erhöhen, um die Leselast zu verteilen:

```yaml title="redis-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: my-redis
spec:
  replicas: 3
  resourcesPreset: large
  size: 5Gi
  storageClass: replicated
  authEnabled: true
```

### 5. Update anwenden

```bash
kubectl apply -f redis-medium.yaml
```

:::tip
Redis ist ein In-Memory Data Store: Der zugewiesene Speicher (`resources.memory` oder der des Presets) muss ausreichend sein, um Ihr gesamtes Dataset aufzunehmen. Überwachen Sie die Speichernutzung vor dem Skalieren.
:::

## Überprüfung

Überprüfen Sie, dass die Ressourcen aktualisiert wurden:

```bash
# Redis-Ressourcenkonfiguration prüfen
kubectl get redis my-redis -o yaml | grep -A 5 resources

# Status der Redis-Pods prüfen
kubectl get pods -l app.kubernetes.io/instance=my-redis
```

**Erwartetes Ergebnis:**

```console
NAME              READY   STATUS    RESTARTS   AGE
my-redis-0        1/1     Running   0          2m
my-redis-1        1/1     Running   0          2m
```

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Parameter `resources`, `resourcesPreset` und `replicas`
- [Hochverfügbarkeit konfigurieren](./configure-ha.md) -- Redis HA-Konfiguration mit Sentinel
