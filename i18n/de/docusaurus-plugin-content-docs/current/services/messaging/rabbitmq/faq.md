---
sidebar_position: 6
title: FAQ
---

# FAQ — RabbitMQ

### Was ist der Unterschied zwischen Quorum Queues und Classic Queues?

RabbitMQ bietet zwei Haupttypen von Queues:

- **Quorum Queues**: Basieren auf dem **Raft**-Protokoll, die Daten werden auf mehrere Cluster-Knoten repliziert. Sie gewährleisten die **Haltbarkeit** und **Hochverfügbarkeit** der Nachrichten. Empfohlen für die Produktion.
- **Classic Queues**: Auf einem einzigen Knoten gespeichert, schneller beim Schreiben, aber **ohne Replikation**. Bei Ausfall des Knotens gehen die Nachrichten verloren.

:::tip
Mit 3 oder mehr Replikaten (`replicas: 3`) verwendet RabbitMQ standardmäßig die Quorum Queues, die die Nachrichtenhaltbarkeit bei Ausfall eines Knotens gewährleisten.
:::

### Wozu dienen Virtual Hosts (Vhosts)?

Die **Virtual Hosts** (Vhosts) bieten eine **logische Isolation** innerhalb desselben RabbitMQ-Clusters:

- Jeder Vhost besitzt seine eigenen Exchanges, Queues und Bindings
- Berechtigungen werden **pro Vhost** verwaltet, was die Zugriffskontrolle pro Anwendung ermöglicht
- Ein Benutzer kann je nach Vhost unterschiedliche Rollen haben (Admin auf dem einen, Readonly auf dem anderen)

Konfigurationsbeispiel mit mehreren Vhosts:

```yaml title="rabbitmq.yaml"
vhosts:
  production:
    roles:
      admin: ["admin"]
      readonly: ["monitoring"]
  staging:
    roles:
      admin: ["admin", "dev"]
```

### Wie funktionieren die Exchanges in RabbitMQ?

Ein **Exchange** empfängt Nachrichten von Produzenten und routet sie an Queues gemäß **Binding**-Regeln:

| **Typ** | **Verhalten** |
| ------- | ------------- |
| `direct` | Routet die Nachricht an die Queue, deren **Routing Key** genau übereinstimmt |
| `fanout` | Verbreitet die Nachricht an **alle gebundenen Queues** ohne Filter |
| `topic` | Routet nach einem **Pattern** des Routing Keys (z.B. `orders.*`, `logs.#`) |
| `headers` | Routet nach den **Headers** der Nachricht anstelle des Routing Keys |

Der Produzent veröffentlicht an einen Exchange, nie direkt an eine Queue.

### Welche Protokolle werden unterstützt?

RabbitMQ auf Hikube unterstützt folgende Protokolle:

| **Protokoll** | **Port** | **Verwendung** |
| ------------- | -------- | -------------- |
| AMQP | 5672 | Hauptprotokoll für Nachrichten |
| Management HTTP API | 15672 | Web-Oberfläche und Management-API |

### Was ist der Unterschied zwischen `resourcesPreset` und `resources`?

Das Feld `resourcesPreset` wendet eine vordefinierte CPU-/Speicherkonfiguration an, während `resources` die Angabe expliziter Werte ermöglicht. Wenn `resources` definiert ist, wird `resourcesPreset` **ignoriert**.

| **Preset** | **CPU** | **Speicher** |
| ---------- | ------- | ------------ |
| `nano` | 100m | 128Mi |
| `micro` | 250m | 256Mi |
| `small` | 500m | 512Mi |
| `medium` | 500m | 1Gi |
| `large` | 1 | 2Gi |
| `xlarge` | 2 | 4Gi |
| `2xlarge` | 4 | 8Gi |

Beispiel mit expliziten Ressourcen:

```yaml title="rabbitmq.yaml"
replicas: 3
resources:
  cpu: 2000m
  memory: 4Gi
size: 20Gi
```

### Wie greift man auf die Management-Oberfläche zu?

Die RabbitMQ Management-Oberfläche ist über Port **15672** zugänglich. Zwei Optionen:

**Option 1 — Port-Forward (lokaler Zugang)**:

```bash
kubectl port-forward svc/<rabbitmq-name> 15672:15672
```

Dann öffnen Sie `http://localhost:15672` in Ihrem Browser.

**Option 2 — Externer Zugang**:

Aktivieren Sie `external: true` in Ihrem Manifest, um den Service über einen LoadBalancer zu exponieren:

```yaml title="rabbitmq.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: rabbitmq
spec:
  external: true
  replicas: 3
  resourcesPreset: small
  size: 10Gi
```

:::warning
Der externe Zugang exponiert die Ports AMQP (5672) und Management (15672) im Internet. Stellen Sie sicher, dass Sie starke Passwörter für alle Benutzer verwenden.
:::
