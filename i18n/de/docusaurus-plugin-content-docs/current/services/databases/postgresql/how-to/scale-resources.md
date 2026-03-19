---
title: "Vertikal skalieren"
---

# Vertikal skalieren

Diese Anleitung erklärt, wie Sie die CPU- und Speicherressourcen Ihrer PostgreSQL-Instanz auf Hikube anpassen, entweder über ein vordefiniertes Preset oder mit expliziten Werten.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- Eine **PostgreSQL**-Instanz auf Hikube bereitgestellt

## Verfügbare Presets

Hikube bietet vordefinierte Ressourcen-Presets zur Vereinfachung der Dimensionierung:

| Preset | CPU | Speicher |
|--------|-----|----------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

:::warning
Wenn das Feld `resources` (explizite CPU/Speicher) definiert ist, wird der Wert von `resourcesPreset` **vollständig ignoriert**. Stellen Sie sicher, dass das Feld `resources` leer ist, wenn Sie ein Preset verwenden möchten.
:::

## Schritte

### 1. Aktuelle Ressourcen überprüfen

Überprüfen Sie die aktuelle Konfiguration Ihrer Instanz:

```bash
kubectl get postgres my-database -o yaml | grep -A 5 -E "resources:|resourcesPreset"
```

**Beispielergebnis mit einem Preset:**

```console
  resourcesPreset: micro
  resources: {}
```

**Beispielergebnis mit expliziten Ressourcen:**

```console
  resourcesPreset: micro
  resources:
    cpu: 2000m
    memory: 2Gi
```

### 2. Option A: Ressourcen-Preset ändern

Um von einem Preset zu einem anderen zu wechseln (z.B. von `micro` zu `large`), wenden Sie einen Patch an:

```bash
kubectl patch postgres my-database --type='merge' -p='
spec:
  resourcesPreset: large
  resources: {}
'
```

:::note
Es ist wichtig, `resources: {}` beim Wechsel zu einem Preset zurückzusetzen, damit das Preset berücksichtigt wird. Wenn `resources` explizite Werte enthält, wird das Preset ignoriert.
:::

Sie können auch das vollständige YAML-Manifest ändern:

```yaml title="postgresql-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 3
  resourcesPreset: large
  size: 20Gi

  users:
    admin:
      password: SecureAdminPassword

  databases:
    myapp:
      roles:
        admin:
          - admin
```

Dann anwenden:

```bash
kubectl apply -f postgresql-scaled.yaml
```

### 3. Option B: Explizite Ressourcen definieren

Für eine feine Steuerung definieren Sie die CPU- und Speicherwerte direkt:

```bash
kubectl patch postgres my-database --type='merge' -p='
spec:
  resources:
    cpu: 4000m
    memory: 4Gi
'
```

Oder über das vollständige Manifest:

```yaml title="postgresql-custom-resources.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 3
  resources:
    cpu: 4000m
    memory: 4Gi
  size: 20Gi

  users:
    admin:
      password: SecureAdminPassword

  databases:
    myapp:
      roles:
        admin:
          - admin
```

```bash
kubectl apply -f postgresql-custom-resources.yaml
```

:::tip
Für die PostgreSQL-Dimensionierung ist eine gute Faustregel, `shared_buffers` auf etwa 25% des Gesamtspeichers zuzuweisen. Passen Sie die PostgreSQL-Parameter entsprechend über den Abschnitt `postgresql.parameters` an.
:::

### 4. Rolling Update überprüfen

Nach der Ressourcenänderung führt der Operator ein **Rolling Update** der PostgreSQL-Pods durch. Überwachen Sie den Fortschritt:

```bash
kubectl get po -w | grep postgres-my-database
```

**Erwartetes Ergebnis (während des Rolling Updates):**

```console
postgres-my-database-2   1/1     Terminating   0   45m
postgres-my-database-2   0/1     Pending       0   0s
postgres-my-database-2   1/1     Running       0   30s
```

Warten Sie, bis alle Pods den Status `Running` haben:

```bash
kubectl get po | grep postgres-my-database
```

```console
postgres-my-database-1   1/1     Running   0   2m
postgres-my-database-2   1/1     Running   0   4m
postgres-my-database-3   1/1     Running   0   6m
```

## Überprüfung

Bestätigen Sie, dass die neuen Ressourcen angewendet wurden:

```bash
kubectl get postgres my-database -o yaml | grep -A 5 -E "resources:|resourcesPreset"
```

Überprüfen Sie, dass die Instanz funktionsfähig ist:

```bash
kubectl get postgres my-database
```

**Erwartetes Ergebnis:**

```console
NAME          READY   AGE   VERSION
my-database   True    1h    0.18.0
```

## Weiterführende Informationen

- **[API-Referenz PostgreSQL](../api-reference.md)**: Vollständige Dokumentation der Parameter `resources`, `resourcesPreset` und Preset-Tabelle
