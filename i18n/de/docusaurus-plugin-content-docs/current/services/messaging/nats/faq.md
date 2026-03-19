---
sidebar_position: 6
title: FAQ
---

# FAQ — NATS

### Sollte man JetStream aktivieren?

**JetStream** fügt NATS **Persistenz**, **Streaming** und **Replay** von Nachrichten hinzu. Ohne JetStream arbeitet NATS im reinen **Pub/Sub**-Modus (Fire-and-Forget): Nachrichten werden nur an zum Zeitpunkt der Veröffentlichung verbundene Abonnenten übertragen.

JetStream ist standardmäßig aktiviert (`jetstream.enabled: true`). Deaktivieren Sie es nur, wenn Sie ausschließlich ephemeres Messaging ohne Persistenz benötigen:

```yaml title="nats.yaml"
jetstream:
  enabled: true
  size: 10Gi
```

:::tip
Lassen Sie JetStream in der Produktion immer aktiviert, um von der Nachrichtenpersistenz, der Möglichkeit des Event-Replays und dauerhaften Consumer Groups zu profitieren.
:::

### Was ist der Unterschied zwischen Pub/Sub und Queue Groups?

NATS bietet zwei Konsummodelle:

- **Klassisches Pub/Sub**: Jeder Abonnent erhält **alle Nachrichten**, die auf dem Subject veröffentlicht werden. Geeignet für Verbreitung (Benachrichtigungen, Logs).
- **Queue Groups**: Die Abonnenten derselben Gruppe **teilen sich die Nachrichten** (Load Balancing). Jede Nachricht wird an **nur einen Abonnenten** der Gruppe zugestellt. Geeignet für verteilte Verarbeitung.

Mehrere Queue Groups können dasselbe Subject abonnieren — jede Gruppe erhält eine Kopie jeder Nachricht, aber nur ein Mitglied pro Gruppe verarbeitet sie.

### Wie funktionieren Wildcards in Subjects?

NATS verwendet ein hierarchisches Subject-System, das durch Punkte (`.`) getrennt wird. Zwei Wildcards sind verfügbar:

| **Wildcard** | **Beschreibung** | **Beispiel** |
| ------------ | ---------------- | ------------ |
| `*` | Entspricht **genau einem Token** | `orders.*` matcht `orders.new`, aber nicht `orders.new.urgent` |
| `>` | Entspricht **einem oder mehreren Token** | `orders.>` matcht `orders.new`, `orders.new.urgent` usw. |

Beispiele:
- `logs.*`: empfängt `logs.info`, `logs.error`, aber nicht `logs.app.error`
- `logs.>`: empfängt `logs.info`, `logs.error`, `logs.app.error` usw.

### Was ist der Unterschied zwischen `resourcesPreset` und `resources`?

Das Feld `resourcesPreset` wendet eine vordefinierte CPU-/Speicherkonfiguration an, während `resources` die Angabe expliziter Werte ermöglicht. Wenn `resources` definiert ist, wird `resourcesPreset` **ignoriert**.

| **Preset** | **CPU** | **Speicher** |
| ---------- | ------- | ------------ |
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

Beispiel mit expliziten Ressourcen:

```yaml title="nats.yaml"
replicas: 3
resources:
  cpu: 2000m
  memory: 2Gi
```

### Persistiert NATS die Nachrichten?

Standardmäßig arbeitet NATS im **Fire-and-Forget**-Modus: Nachrichten werden nur an zum Zeitpunkt der Veröffentlichung verbundene Abonnenten übertragen. **Keine Persistenz** findet ohne zusätzliche Konfiguration statt.

Um Nachrichten zu persistieren, müssen zwei Bedingungen erfüllt sein:

1. **JetStream muss aktiviert sein** (`jetstream.enabled: true`)
2. **Ein Stream muss erstellt werden**, um die Nachrichten der gewünschten Subjects zu erfassen

Ohne konfigurierten Stream werden selbst bei aktiviertem JetStream die auf einem Subject ohne zugehörigen Stream veröffentlichten Nachrichten nicht persistiert.

### Wie konfiguriert man NATS erweitert?

Das Feld `config.merge` ermöglicht das Hinzufügen oder Überschreiben von NATS-Konfigurationsparametern:

```yaml title="nats.yaml"
config:
  merge:
    max_payload: 8MB
    write_deadline: 2s
    debug: false
    trace: false
```

Gängige Parameter:

| **Parameter** | **Beschreibung** | **Standard** |
| ------------- | ---------------- | ------------ |
| `max_payload` | Maximale Größe einer Nachricht | 1MB |
| `write_deadline` | Schreib-Timeout für einen Client | 2s |
| `debug` | Aktiviert Debug-Logs | false |
| `trace` | Aktiviert Nachrichten-Tracing (sehr ausführlich) | false |

:::warning
Die Aktivierung von `debug` und `trace` in der Produktion erzeugt ein erhebliches Log-Volumen. Verwenden Sie sie nur für temporäre Diagnose.
:::
