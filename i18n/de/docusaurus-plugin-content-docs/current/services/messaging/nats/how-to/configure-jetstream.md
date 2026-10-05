---
title: "JetStream konfigurieren"
---

# JetStream konfigurieren

:::info Verfügbarkeit
NATS ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht im Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

Diese Anleitung erklärt, wie Sie **JetStream** auf einem NATS-Cluster von Hikube dimensionieren und anschließend Streams über das CLI `nats` erstellen und nutzen. JetStream bietet Persistenz von Nachrichten, Streaming und Replay mit Zustellgarantien.

Die Aktivierung von JetStream, die Größe seines Volumes und die erweiterte Serverkonfiguration sind Teil der Instanzkonfiguration. Diese Option wird in der Konsole nicht angeboten; wenden Sie sich an den Support.

## Voraussetzungen

- Ein auf Hikube bereitgestellter **NATS**-Cluster, seine URL (`<nats-url>`) und Zugangsdaten
- Das CLI **nats** lokal installiert, mit einem gespeicherten Kontext (siehe den [Schnellstart](../quick-start.md))

## Schritte

### 1. Den JetStream-Speicher dimensionieren

| Parameter | Beschreibung |
|-----------|-------------|
| JetStream aktiviert | Aktiviert oder deaktiviert die Persistenz auf der Instanz |
| Volume-Größe | Für JetStream-Daten reservierter Speicherplatz |

Die Dimensionierung des Volumes hängt von Ihrem Anwendungsfall ab:

- **Flüchtige Nachrichten** (kurze TTL, einige Stunden): 10 bis 20 GB
- **Lange Aufbewahrung** (Tage, Wochen): 50 bis 100 GB
- **Große Streams** (Ereignisse, Logs): 100 GB und mehr

:::tip
Sehen Sie in der Produktion mindestens 3 Replicas vor, um vom Raft-Konsens von JetStream zu profitieren. Das gewährleistet Hochverfügbarkeit und Dauerhaftigkeit der Streams beim Ausfall eines Knotens.
:::

:::warning
Eine Verkleinerung des JetStream-Volumes auf einer bestehenden Instanz kann zu Datenverlust führen. Planen Sie bei der anfänglichen Dimensionierung ausreichend Reserve ein.
:::

### 2. Die Serverkonfiguration anpassen (optional)

Die folgenden Parameter können auf Ebene der Instanz angepasst werden:

| Parameter | Beschreibung | Standard |
|-----------|-------------|--------|
| `max_payload` | Maximale Größe einer Nachricht | `1MB` |
| `write_deadline` | Maximale Zeit zum Schreiben einer Antwort an den Client | `2s` |
| `debug` | Aktiviert Debug-Logs | `false` |
| `trace` | Aktiviert das Tracing von Nachrichten (sehr ausführlich) | `false` |

:::note
`debug` und `trace` sind nur für eine vorübergehende Fehlerbehebung gerechtfertigt. Diese Optionen erzeugen ein großes Log-Volumen und können die Leistung beeinträchtigen.
:::

Übermitteln Sie die gewünschte Größe und gegebenenfalls die Parameter an den [Support](mailto:support@hidora.io) und geben Sie dabei das Projekt und den Namen der Instanz an.

### 3. Einen Stream erstellen

Sobald JetStream aktiviert ist, erstellen Sie einen Stream über das CLI:

```bash
nats stream add EVENTS \
  --subjects "events.>" \
  --storage file \
  --retention limits \
  --max-msgs -1 \
  --max-bytes -1 \
  --max-age 72h \
  --replicas 3 \
  --defaults
```

**Erwartetes Ergebnis:**

```console
Stream EVENTS was created

Information:

  Subjects: events.>
  Replicas: 3
  Storage:  File
  Retention: Limits
  ...
```

### 4. Den Stream testen

Veröffentlichen Sie eine Nachricht:

```bash
nats pub events.test "Hello JetStream"
```

Konsumieren Sie die Nachricht:

```bash
nats sub "events.>" --count 1
```

**Erwartetes Ergebnis:**

```console
[#1] Received on "events.test"
Hello JetStream
```

Prüfen Sie den Status des Streams:

```bash
nats stream info EVENTS
```

## Überprüfung

Die Konfiguration ist korrekt, wenn:

- `nats account info` anzeigt, dass JetStream verfügbar ist
- ein Stream mit der gewünschten Anzahl von Replicas erstellt werden kann
- veröffentlichte Nachrichten gespeichert werden und konsumiert werden können
- `nats stream info` die richtige Anzahl von Replicas und die konfigurierte Aufbewahrungsrichtlinie anzeigt

## Weiterführende Informationen

- **[Konzepte](../concepts.md)**: Kommunikationsmodelle und JetStream
- **[NATS-Benutzer verwalten](./manage-users.md)**: Zugangskonten für den Cluster
