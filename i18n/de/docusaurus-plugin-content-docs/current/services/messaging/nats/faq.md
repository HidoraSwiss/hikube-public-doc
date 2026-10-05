---
sidebar_position: 6
title: FAQ
---

# FAQ — NATS

:::info Verfügbarkeit
NATS ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht im Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

### Wie erhalte ich einen NATS-Cluster?

Richten Sie Ihre Anfrage mit den Parametern der Instanz (Replicas, Preset, JetStream, Benutzer, externer Zugriff) an den [Support](mailto:support@hidora.io). Der [Schnellstart](./quick-start.md) listet die vorzubereitenden Informationen auf.

### Muss JetStream aktiviert werden?

**JetStream** ergänzt NATS um **Persistenz**, **Streaming** und **Replay** von Nachrichten. Ohne JetStream arbeitet NATS im Modus **reines Pub/Sub** (Fire-and-Forget): Nachrichten werden nur an die Subscribers übermittelt, die zum Zeitpunkt der Veröffentlichung verbunden sind.

:::tip
Lassen Sie JetStream in der Produktion aktiviert, um von der Persistenz der Nachrichten, der Möglichkeit, Ereignisse erneut abzuspielen, und von dauerhaften Consumern zu profitieren.
:::

Die Aktivierung von JetStream und die Größe seines Volumes sind Teil der Instanzkonfiguration. Diese Option wird in der Konsole nicht angeboten; wenden Sie sich an den Support.

### Was ist der Unterschied zwischen Pub/Sub und Queue Groups?

NATS bietet zwei Konsummodelle:

- **Klassisches Pub/Sub**: Jeder Subscriber erhält **alle Nachrichten**, die zum Subject veröffentlicht werden. Geeignet für die Verteilung (Benachrichtigungen, Logs).
- **Queue Groups**: Die Subscribers derselben Gruppe **teilen sich die Nachrichten** (Load Balancing). Jede Nachricht wird an **genau einen Subscriber** der Gruppe zugestellt. Geeignet für verteilte Verarbeitung.

Mehrere Queue Groups können dasselbe Subject abonnieren — jede Gruppe erhält eine Kopie jeder Nachricht, verarbeitet wird sie jedoch nur von einem Mitglied pro Gruppe.

### Wie funktionieren Wildcards in Subjects?

NATS verwendet ein System hierarchischer Subjects, die durch Punkte (`.`) getrennt sind. Zwei Wildcards stehen zur Verfügung:

| **Wildcard** | **Beschreibung**                        | **Beispiel**                                                     |
| ------------ | -------------------------------------- | --------------------------------------------------------------- |
| `*`          | Entspricht **genau einem Token**         | `orders.*` passt auf `orders.new`, aber nicht auf `orders.new.urgent`     |
| `>`          | Entspricht **einem oder mehreren Tokens**| `orders.>` passt auf `orders.new`, `orders.new.urgent` usw.       |

Beispiele:
- `logs.*`: empfängt `logs.info`, `logs.error`, aber nicht `logs.app.error`
- `logs.>`: empfängt `logs.info`, `logs.error`, `logs.app.error` usw.

### Welche Ressourcen-Presets sind verfügbar?

| **Preset** | **CPU** | **Arbeitsspeicher** |
| ---------- | ------- | ----------- |
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Explizite CPU-/Arbeitsspeicherwerte können ebenfalls angefordert werden; sie ersetzen dann das Preset. Diese Option wird in der Konsole nicht angeboten; wenden Sie sich an den Support.

### Speichert NATS Nachrichten dauerhaft?

Standardmäßig arbeitet NATS im Modus **Fire-and-Forget**: Nachrichten werden nur an die Subscribers übermittelt, die zum Zeitpunkt der Veröffentlichung verbunden sind. Ohne zusätzliche Konfiguration findet **keine Persistenz** statt.

Um Nachrichten dauerhaft zu speichern, müssen zwei Bedingungen erfüllt sein:

1. **JetStream muss** auf der Instanz **aktiviert sein**
2. **Ein Stream muss erstellt werden** (zum Beispiel mit `nats stream add`), um die Nachrichten der betreffenden Subjects zu erfassen

Auch bei aktiviertem JetStream werden Nachrichten, die zu einem Subject ohne zugehörigen Stream veröffentlicht werden, nicht gespeichert.

### Lässt sich die Konfiguration des NATS-Servers anpassen?

Einige Serverparameter können auf Ebene der Instanz angepasst werden:

| **Parameter**     | **Beschreibung**                                          | **Standard** |
| ------------------ | -------------------------------------------------------- | ---------- |
| `max_payload`      | Maximale Größe einer Nachricht                             | 1MB        |
| `write_deadline`   | Schreib-Timeout gegenüber einem Client                        | 2s         |
| `debug`            | Aktiviert Debug-Logs                                 | false      |
| `trace`            | Aktiviert das Tracing von Nachrichten (sehr ausführlich)            | false      |

Diese Option wird in der Konsole nicht angeboten; wenden Sie sich an den Support.

:::warning
Die Aktivierung von `debug` und `trace` in der Produktion erzeugt ein erhebliches Log-Volumen. Fordern Sie sie nur für eine vorübergehende Diagnose an.
:::
