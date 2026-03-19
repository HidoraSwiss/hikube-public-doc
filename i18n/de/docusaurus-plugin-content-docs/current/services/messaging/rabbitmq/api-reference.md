---
sidebar_position: 3
title: API-Referenz
---

# API-Referenz RabbitMQ

Diese Referenz beschreibt die Konfiguration und Funktionsweise der **RabbitMQ-Cluster** auf Hikube, einschließlich der Verwaltung von **Benutzern**, **Vhosts** und **Queues**.
Die Bereitstellungen basieren auf dem **offiziellen RabbitMQ-Operator**, der eine vereinfachte, hochverfügbare und den Best Practices des Upstream-Projekts konforme Verwaltung gewährleistet.

---

## Grundstruktur

### **RabbitMQ-Ressource**

#### Beispiel einer YAML-Konfiguration

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: rabbitmq
spec:
  replicas: 3
  resourcesPreset: small
  size: 10Gi
  storageClass: replicated
  users:
    admin:
      password: "strongpassword"
  vhosts:
    default:
      roles:
        admin: ["admin"]
```

---

## Parameter

### **Allgemeine Parameter**

| **Parameter** | **Typ** | **Beschreibung** | **Standard** | **Erforderlich** |
| ------------- | ------- | ---------------- | ------------ | ---------------- |
| `external` | `bool` | Aktiviert den externen Zugang zum RabbitMQ-Cluster (Exposition außerhalb des Clusters) | `false` | Nein |
| `replicas` | `int` | Anzahl der RabbitMQ-Replikate (Cluster-Knoten) | `3` | Ja |
| `resources` | `object` | Explizite CPU- und Speicherkonfiguration pro RabbitMQ-Replikat | `{}` | Nein |
| `resources.cpu` | `quantity` | Verfügbare CPU pro Replikat | `null` | Nein |
| `resources.memory` | `quantity` | Verfügbarer RAM pro Replikat | `null` | Nein |
| `resourcesPreset` | `string` | Ressourcen-Preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `"small"` | Ja |
| `size` | `quantity` | Größe des persistenten Volumes für RabbitMQ-Daten | `10Gi` | Ja |
| `storageClass` | `string` | StorageClass für die Speicherung der RabbitMQ-Daten | `""` | Nein |

#### YAML-Beispiel

```yaml title="rabbitmq.yaml"
replicas: 3
resourcesPreset: medium
size: 20Gi
storageClass: replicated
external: true
```

---

### **Benutzerparameter**

| **Parameter** | **Typ** | **Beschreibung** | **Standard** | **Erforderlich** |
| ------------- | ------- | ---------------- | ------------ | ---------------- |
| `users` | `map[string]object` | Liste der RabbitMQ-Benutzer | `{}` | Ja |
| `users[name].password` | `string` | Passwort des Benutzers | `null` | Ja |

#### YAML-Beispiel

```yaml title="rabbitmq.yaml"
users:
  admin:
    password: "securepassword"
  app:
    password: "apppassword123"
```

---

### **Virtual-Host-Parameter (Vhosts)**

| **Parameter** | **Typ** | **Beschreibung** | **Standard** | **Erforderlich** |
| ------------- | ------- | ---------------- | ------------ | ---------------- |
| `vhosts` | `map[string]object` | Liste der RabbitMQ Virtual Hosts | `{}` | Nein |
| `vhosts[name].roles` | `object` | Rollen und Berechtigungen für diesen Virtual Host | `{}` | Nein |
| `vhosts[name].roles.admin` | `[]string` | Liste der Benutzer mit Administratorzugriff auf diesen Vhost | `[]` | Nein |
| `vhosts[name].roles.readonly` | `[]string` | Liste der Benutzer mit Lesezugriff | `[]` | Nein |

#### YAML-Beispiel

```yaml title="rabbitmq.yaml"
vhosts:
  "default":
    roles:
      admin: ["admin"]
      readonly: ["app"]
  "analytics":
    roles:
      admin: ["admin"]
      readonly: ["analyst"]
```

---

### **resources und resourcesPreset**

Das Feld `resources` ermöglicht die explizite Definition der CPU- und Speicherkonfiguration jedes RabbitMQ-Replikats.
Wenn dieses Feld leer gelassen wird, wird der Wert des Parameters `resourcesPreset` verwendet.

#### YAML-Beispiel

```yaml title="rabbitmq.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```

⚠️ Wenn `resources` definiert ist, wird der Wert von `resourcesPreset` ignoriert.

| **Preset-Name** | **CPU** | **Speicher** |
| --------------- | ------- | ------------ |
| `nano` | 100m | 128Mi |
| `micro` | 250m | 256Mi |
| `small` | 500m | 512Mi |
| `medium` | 500m | 1Gi |
| `large` | 1 | 2Gi |
| `xlarge` | 2 | 4Gi |
| `2xlarge` | 4 | 8Gi |

---

## Vollständige Beispiele

### Produktionscluster

```yaml title="rabbitmq-production.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: production
spec:
  replicas: 3
  resources:
    cpu: 2000m
    memory: 4Gi
  size: 20Gi
  storageClass: replicated
  external: false

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: SecureAppPassword
    monitoring:
      password: SecureMonitoringPassword

  vhosts:
    production:
      roles:
        admin: ["admin"]
        readonly: ["monitoring"]
    analytics:
      roles:
        admin: ["admin"]
        readonly: ["appuser"]
```

### Entwicklungscluster

```yaml title="rabbitmq-development.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: development
spec:
  replicas: 1
  resourcesPreset: nano
  size: 5Gi
  external: true

  users:
    dev:
      password: devpassword

  vhosts:
    default:
      roles:
        admin: ["dev"]
```

---

:::tip Best Practices

- **3 Replikate für Quorum Queues**: Mit 3 Knoten verwendet RabbitMQ die Quorum Queues, um die Nachrichtenhaltbarkeit bei Ausfällen zu gewährleisten
- **Vhosts pro Anwendung**: Isolieren Sie jede Anwendung in einem dedizierten Vhost, um die Auswirkungen bei Überlastung zu begrenzen
- **Getrennte Rollen**: Trennen Sie Admin-, Anwendungs- und Monitoring-Benutzer mit angepassten Berechtigungen
- **Replizierter Speicher**: Verwenden Sie `storageClass: replicated`, um die Daten vor dem Verlust eines Knotens zu schützen
:::

:::warning Achtung

- **Löschungen sind unwiderruflich**: Das Löschen einer RabbitMQ-Ressource führt zum endgültigen Verlust aller Queues und Nachrichten
- **Weniger als 3 Replikate**: Mit weniger als 3 Replikaten können die Quorum Queues die Nachrichtenhaltbarkeit bei Ausfällen nicht gewährleisten
- **Exponierte Ports**: Wenn `external: true`, sind die Ports AMQP (5672) und Management UI (15672) von außen zugänglich — sichern Sie die Zugangsdaten
:::

---

### Externe Referenzen

* **Offizieller RabbitMQ-Operator:** [GitHub – rabbitmq/cluster-operator](https://github.com/rabbitmq/cluster-operator/)
* **RabbitMQ Operator-Dokumentation:** [operator-overview.html](https://www.rabbitmq.com/kubernetes/operator/operator-overview.html)
