---
sidebar_position: 3
title: API-Referenz
---

# API-Referenz Redis

Diese Referenz beschreibt die Verwendung von **Redis** auf Hikube, mit Schwerpunkt auf Geschwindigkeit und Vielseitigkeit als **In-Memory Data Store** und **verteiltes Cache-System**.
Der verwaltete Dienst vereinfacht die Bereitstellung und Verwaltung von Redis-Clustern und garantiert **Hochverfügbarkeit**, **geringe Latenz** und optimale Leistung für Ihre Anwendungen.

Der Dienst basiert auf dem Operator **[Spotahome Redis Operator](https://github.com/spotahome/redis-operator)**, der die Orchestrierung, Replikation und Überwachung von Redis-Clustern gewährleistet.

---

## Grundstruktur

### **Redis-Ressource**

#### YAML-Konfigurationsbeispiel

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: example
spec:
```

---

## Parameter

### **Allgemeine Parameter**

| **Parameter**     | **Typ**    | **Beschreibung**                                                                 | **Standardwert** | **Erforderlich** |
|--------------------|------------|---------------------------------------------------------------------------------|-------------------|------------------|
| `replicas`         | `int`      | Anzahl der Redis-Replikas (Instanzen im Cluster)                               | `2`               | Ja               |
| `resources`        | `object`   | Explizite CPU- und Speicherkonfiguration pro Redis-Replika. Wenn leer, wird `resourcesPreset` angewendet | `{}`              | Nein             |
| `resources.cpu`    | `quantity` | Verfügbare CPU pro Replika                                                      | `null`            | Nein             |
| `resources.memory` | `quantity` | Verfügbarer RAM pro Replika                                                     | `null`            | Nein             |
| `resourcesPreset`  | `string`   | Vordefiniertes Ressourcenprofil (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `"nano"`         | Ja               |
| `size`             | `quantity` | Größe des persistenten Volumes (PVC) für Daten                                  | `1Gi`             | Ja               |
| `storageClass`     | `string`   | Verwendete Speicherklasse                                                       | `""`              | Nein             |
| `external`         | `bool`     | Externen Zugriff zum Cluster aktivieren (LoadBalancer)                          | `false`           | Nein             |
| `authEnabled`      | `bool`     | Passwort-Authentifizierung aktivieren (im Kubernetes-Secret gespeichert)        | `true`            | Nein             |

#### YAML-Konfigurationsbeispiel

```yaml title="redis.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: example
spec:
  # Anzahl der Redis-Replikas (Hochverfügbarkeit wenn >1)
  replicas: 3

  # Zugewiesene Ressourcen pro Instanz
  resources:
    cpu: 1000m      # 1 vCPU
    memory: 1Gi     # 1 GiB RAM

  # Größe der persistenten Festplatte pro Instanz
  size: 2Gi
  storageClass: replicated

  # Redis-Authentifizierung aktivieren
  # Wenn true, wird ein Passwort automatisch generiert
  authEnabled: true

  # Redis-Service extern freigeben
  external: true
```

---

### **Anwendungsspezifische Parameter**

| **Parameter**   | **Typ** | **Beschreibung**                  | **Standardwert** | **Erforderlich** |
|------------------|----------|----------------------------------|-------------------|------------------|
| `authEnabled`    | `bool`   | Aktiviert die Generierung eines Passworts (im Kubernetes-Secret gespeichert) | `true` | Nein |

#### YAML-Konfigurationsbeispiel

```yaml title="redis.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: example
spec:
  replicas: 3
  resources:
    cpu: 1000m
    memory: 1Gi
  size: 2Gi
  storageClass: replicated
  # Redis-Authentifizierung aktivieren
  # Wenn true, wird ein Passwort automatisch generiert
  authEnabled: false
  # Redis-Service extern freigeben
  external: false
```

### resources und resourcesPreset

Das Feld `resources` ermöglicht die explizite Definition der CPU- und Speicherkonfiguration jedes Redis-Replikas.
Wenn dieses Feld leer gelassen wird, wird der Wert des Parameters `resourcesPreset` verwendet.

#### YAML-Konfigurationsbeispiel

```yaml title="redis.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```

⚠️ Achtung: Wenn resources definiert ist, wird der Wert von resourcesPreset ignoriert.

| **Preset-Name** | **CPU** | **Speicher** |
|------------------|---------|-------------|
| `nano`          | 250m    | 128Mi       |
| `micro`         | 500m    | 256Mi       |
| `small`         | 1       | 512Mi       |
| `medium`        | 1       | 1Gi         |
| `large`         | 2       | 2Gi         |
| `xlarge`        | 4       | 4Gi         |
| `2xlarge`       | 8       | 8Gi         |

---

:::tip Bewährte Praktiken

- **`authEnabled: true`**: Aktivieren Sie in der Produktion immer die Authentifizierung, um den Zugriff auf Ihre Redis-Daten zu sichern
- **Mindestens 3 Replikas** in der Produktion für Hochverfügbarkeit mit Redis Sentinel
- **Replizierter Speicher**: Verwenden Sie `storageClass: replicated`, um Daten gegen den Verlust eines physischen Knotens zu schützen
- **Speicherdimensionierung**: Der zugewiesene Speicher (`resources.memory`) muss ausreichend sein, um Ihr gesamtes Redis-Dataset aufzunehmen
:::

:::warning Achtung

- **Löschungen sind unwiderruflich**: Das Löschen einer Redis-Ressource führt zum endgültigen Datenverlust, wenn keine externe Persistenz konfiguriert ist
- **`resources` vs `resourcesPreset`**: Wenn `resources` definiert ist, wird `resourcesPreset` vollständig ignoriert
- **Externer Zugriff**: Die Aktivierung von `external: true` stellt Redis im Internet bereit — stellen Sie sicher, dass `authEnabled: true` konfiguriert ist
:::
