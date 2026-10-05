---
title: "Vertikal skalieren"
---

# Vertikal skalieren

Diese Anleitung erklärt, wie Sie die CPU- und Speicherressourcen Ihrer MySQL-Instanz auf Hikube anpassen, entweder über ein vordefiniertes Preset oder durch Definition expliziter Werte.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- Eine **MySQL**-Instanz auf Ihrem Tenant bereitgestellt
- Kenntnis der Ressourcenanforderungen Ihrer Arbeitslast

## Schritte

### 1. Aktuelle Ressourcen überprüfen

Überprüfen Sie die aktuelle Konfiguration Ihrer MySQL-Instanz:

```bash
kubectl get mariadb example -o yaml | grep -A 5 -E "resources:|resourcesPreset"
```

**Erwartetes Ergebnis (mit Preset):**

```console
  resourcesPreset: nano
```

**Erwartetes Ergebnis (mit expliziten Ressourcen):**

```console
  resources:
    cpu: 1000m
    memory: 1Gi
```

### 2. Skalierungsmethode wählen

Hikube bietet zwei Ansätze zur Definition von Ressourcen:

#### Option A: `resourcesPreset` verwenden

Die Presets bieten vordefinierte Ressourcenprofile für verschiedene Anwendungsfälle:

| Preset | CPU | Speicher | Anwendungsfall |
|---|---|---|---|
| `nano` | 250m | 128Mi | Tests, minimale Entwicklung |
| `micro` | 500m | 256Mi | Entwicklung, kleine Anwendungen |
| `small` | 1 | 512Mi | Leichte Anwendungen |
| `medium` | 1 | 1Gi | Standardanwendungen |
| `large` | 2 | 2Gi | Moderate Arbeitslasten |
| `xlarge` | 4 | 4Gi | Standard-Produktion |
| `2xlarge` | 8 | 8Gi | Intensive Produktion |

#### Option B: Explizite Ressourcen definieren

Für eine präzise Steuerung definieren Sie direkt die Werte `resources.cpu` und `resources.memory`.

:::warning
Wenn das Feld `resources` definiert ist (explizite CPU und Speicher), wird der Wert von `resourcesPreset` **ignoriert**. Die beiden Ansätze schließen sich gegenseitig aus.
:::

### 3. Option A: resourcesPreset ändern

Um von einem Preset zu einem anderen zu wechseln, verwenden Sie `kubectl patch`:

```bash
kubectl patch mariadb example --type='merge' -p='
spec:
  resourcesPreset: medium
'
```

Oder ändern Sie direkt das Manifest:

```yaml title="mysql-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: example
spec:
  replicas: 3
  size: 10Gi
  resourcesPreset: medium
```

```bash
kubectl apply -f mysql-scaled.yaml
```

### 4. Option B: Explizite Ressourcen definieren

Für eine feine Ressourcensteuerung geben Sie die CPU- und Speicherwerte direkt an:

```bash
kubectl patch mariadb example --type='merge' -p='
spec:
  resources:
    cpu: 2000m
    memory: 4Gi
'
```

Oder über das vollständige Manifest:

```yaml title="mysql-custom-resources.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: example
spec:
  replicas: 3
  size: 10Gi
  resources:
    cpu: 2000m
    memory: 4Gi
```

```bash
kubectl apply -f mysql-custom-resources.yaml
```

:::tip
Um nach der Verwendung expliziter Ressourcen zu einem Preset zurückzukehren, entfernen Sie das Feld `resources` und definieren Sie `resourcesPreset` in Ihrem Manifest.
:::

## Überprüfung

Verfolgen Sie das Rolling Update der MySQL-Pods:

```bash
kubectl get pods -w | grep mysql-example
```

**Erwartetes Ergebnis:**

```console
mysql-example-0   1/1     Running   0   5m
mysql-example-1   1/1     Running   0   3m
mysql-example-2   1/1     Running   0   1m
```

Überprüfen Sie, dass die neuen Ressourcen korrekt angewendet wurden:

```bash
kubectl get mariadb example -o yaml | grep -A 5 -E "resources:|resourcesPreset"
```

:::note
Die vertikale Skalierung verursacht ein **Rolling Update** der Pods. Die Replikas werden nacheinander neu gestartet, um die Auswirkungen auf die Verfügbarkeit zu minimieren. Während dieses Prozesses bleibt der Cluster über die bereits aktualisierten Replikas zum Lesen zugänglich.
:::

## Weiterführende Informationen

- [API-Referenz](../api-reference.md): Vollständige Liste der Presets und Ressourcenparameter
