---
sidebar_position: 3
title: API-Referenz
---

# API-Referenz NATS

Diese Referenz beschreibt die Konfiguration und Funktionsweise der **NATS-Cluster** auf Hikube, einschließlich der **Benutzerverwaltung**, der **JetStream**-Konfiguration für die Nachrichtenpersistenz und der Anpassungsoptionen über das Feld `config`.

---

## Grundstruktur

### **NATS-Ressource**

#### Beispiel einer YAML-Konfiguration

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: nats
spec:
  replicas: 2
  resourcesPreset: nano
  external: false
  jetstream:
    enabled: true
    size: 10Gi
  users:
    user1:
      password: "mypassword"
```

---

## Parameter

### **Allgemeine Parameter**

| **Parameter** | **Typ** | **Beschreibung** | **Standard** | **Erforderlich** |
| ------------- | ------- | ---------------- | ------------ | ---------------- |
| `replicas` | `int` | Anzahl der NATS-Replikate (Cluster-Knoten) | `2` | Ja |
| `resources` | `object` | Explizite CPU- und Speicherkonfiguration pro Replikat. Wenn leer, wird `resourcesPreset` verwendet. | `{}` | Nein |
| `resources.cpu` | `quantity` | Verfügbare CPU pro NATS-Replikat | `""` | Nein |
| `resources.memory` | `quantity` | Verfügbarer RAM pro NATS-Replikat | `""` | Nein |
| `resourcesPreset` | `string` | Standard-Ressourcen-Preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `"nano"` | Ja |
| `storageClass` | `string` | StorageClass für die Speicherung der persistenten Cluster-Daten | `""` | Nein |
| `external` | `bool` | Aktiviert den externen Zugang zum NATS-Cluster (Exposition außerhalb des Kubernetes-Clusters) | `false` | Nein |

#### YAML-Beispiel

```yaml title="nats.yaml"
replicas: 3
resourcesPreset: small
external: true
storageClass: replicated
```

---

### **Anwendungsparameter (NATS-spezifisch)**

| **Parameter** | **Typ** | **Beschreibung** | **Standard** | **Erforderlich** |
| ------------- | ------- | ---------------- | ------------ | ---------------- |
| `users` | `map[string]object` | Liste der autorisierten Benutzer für die Verbindung zum NATS-Cluster. Der Schlüssel entspricht dem Benutzernamen. | `{}` | Nein |
| `users[name].password` | `string` | Dem Benutzer zugeordnetes Passwort. | `""` | Ja, wenn definiert |
| `jetstream` | `object` | Konfiguration des **JetStream**-Moduls für die Nachrichtenpersistenz. | `{}` | Nein |
| `jetstream.enabled` | `bool` | Aktiviert oder deaktiviert das JetStream-Modul. | `true` | Nein |
| `jetstream.size` | `quantity` | Größe des persistenten Volumes für JetStream. | `10Gi` | Nein |
| `config` | `object` | Erweiterte NATS-Konfiguration. Ermöglicht das Hinzufügen oder Überschreiben bestimmter Werte der Standardkonfiguration. | `{}` | Nein |
| `config.merge` | `object` | Zusätzliche Konfiguration, die in die NATS-Hauptkonfiguration eingefügt wird. | `{}` | Nein |
| `config.resolver` | `object` | Spezifische Konfiguration des NATS-Resolvers (DNS, Operator usw.). | `{}` | Nein |

#### YAML-Beispiel

```yaml title="nats.yaml"
users:
  admin:
    password: "supersecurepassword"
  client:
    password: "clientpassword"

jetstream:
  enabled: true
  size: 20Gi

config:
  merge:
    debug: true
    trace: true
  resolver:
    dir: /data/nats/resolver
```

---

### **resources und resourcesPreset**

Das Feld `resources` ermöglicht die explizite Definition der CPU- und Speicherkonfiguration jedes Replikats.
Wenn dieses Feld leer gelassen wird, wird der Wert des Parameters `resourcesPreset` verwendet.

#### YAML-Beispiel

```yaml title="nats.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```

⚠️ **Hinweis:** Wenn `resources` definiert ist, wird der Wert von `resourcesPreset` ignoriert.

| **Preset-Name** | **CPU** | **Speicher** |
| --------------- | ------- | ------------ |
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

---

## Vollständige Beispiele

### Produktionscluster

```yaml title="nats-production.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: production
spec:
  external: false
  replicas: 3
  resources:
    cpu: 2000m
    memory: 4Gi
  storageClass: replicated

  jetstream:
    enabled: true
    size: 50Gi

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: SecureAppPassword
    monitoring:
      password: SecureMonitoringPassword

  config:
    merge:
      max_payload: 8MB
      write_deadline: 2s
      debug: false
      trace: false
```

### Entwicklungscluster

```yaml title="nats-development.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: development
spec:
  external: true
  replicas: 1
  resourcesPreset: nano

  jetstream:
    enabled: true
    size: 5Gi

  users:
    dev:
      password: devpassword
```

---

:::tip Best Practices

- **JetStream in der Produktion**: Aktivieren Sie immer JetStream (`jetstream.enabled: true`), um von der Nachrichtenpersistenz und dem Streaming zu profitieren
- **Mindestens 3 Replikate** in der Produktion, um Hochverfügbarkeit und Raft-Konsens für JetStream zu gewährleisten
- **`max_payload`**: Passen Sie die maximale Nachrichtengröße an Ihren Anwendungsfall an (Standard: 1MB, empfohlenes Maximum: 8MB)
- **Dedizierte Benutzer**: Erstellen Sie separate Benutzer pro Anwendung für eine granulare Zugriffskontrolle
:::

:::warning Achtung

- **Löschungen sind unwiderruflich**: Das Löschen einer NATS-Ressource führt zum endgültigen Verlust der JetStream-Streams und aller Nachrichten
- **Änderung von `jetstream.size`**: Die Reduzierung der JetStream-Volume-Größe auf einem bestehenden Cluster kann zu Datenverlust führen
- **Externer Zugang**: Die Aktivierung von `external: true` exponiert den NATS-Cluster im Internet — stellen Sie sicher, dass die Authentifizierung korrekt konfiguriert ist
:::
