---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — NATS

:::info Verfügbarkeit
NATS ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht im Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

Die folgenden Diagnosen erfolgen über das CLI `nats` (siehe den [Schnellstart](./quick-start.md), um einen Verbindungskontext zu speichern). Wenn eine Aktion auf Plattformseite erforderlich ist (Ressourcen, Speicher, Neustart, Serverprotokolle), [wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie das Projekt und den Namen der Instanz an.

### Verlorene Nachrichten (kein JetStream)

**Ursache**: JetStream ist nicht aktiviert oder es ist kein Stream konfiguriert, der die Nachrichten erfasst. Ohne JetStream arbeitet NATS im Fire-and-Forget-Modus: Nachrichten werden nur an die Subscribers zugestellt, die zum Zeitpunkt der Veröffentlichung verbunden sind.

**Lösung**:

1. Prüfen Sie, ob JetStream für Ihr Konto verfügbar ist:
   ```bash
   nats account info
   ```
   Wenn JetStream auf der Instanz nicht aktiviert ist, wenden Sie sich an den Support.
2. Erstellen Sie einen Stream, um die Nachrichten der gewünschten Subjects zu erfassen:
   ```bash
   nats stream add --subjects "orders.>" --storage file --replicas 3 --retention limits orders-stream
   ```
3. Prüfen Sie, ob der Stream erstellt wurde und die Nachrichten erfasst:
   ```bash
   nats stream info orders-stream
   ```

### Consumer empfängt keine Nachrichten

**Ursache**: Der Consumer hat ein Subject abonniert, das nicht dem vom Producer verwendeten entspricht. Häufige Fehler sind ein Tippfehler im Namen des Subjects, eine falsche Verwendung von Wildcards oder eine fehlerhafte Queue-Group-Konfiguration.

**Lösung**:

1. Prüfen Sie das genaue Subject, das vom Producer und vom Consumer verwendet wird — Subjects **unterscheiden zwischen Groß- und Kleinschreibung**.
2. Testen Sie den Empfang mit einem Diagnose-Abonnement:
   ```bash
   nats sub ">"
   ```
   So sehen Sie **alle Nachrichten**, die Ihr Benutzer empfangen darf.
3. Prüfen Sie die verwendeten Wildcards: `orders.*` passt **nicht** auf `orders.new.urgent` (verwenden Sie `orders.>` für Unterebenen).
4. Wenn Sie Queue Groups verwenden, prüfen Sie, ob der Consumer Mitglied der erwarteten Gruppe ist und der Gruppenname identisch ist.

### JetStream-Speicher voll

**Ursache**: Das JetStream-Volume hat seine maximale Kapazität erreicht. Neue Nachrichten können nicht mehr gespeichert werden und Veröffentlichungen schlagen fehl.

**Lösung**:

1. Prüfen Sie die Belegung des JetStream-Speichers:
   ```bash
   nats account info
   ```
2. Ermitteln Sie die größten Streams:
   ```bash
   nats stream list
   ```
3. Löschen Sie alte Nachrichten aus den Streams, bei denen dies möglich ist:
   ```bash
   nats stream purge <stream-name>
   ```
4. Passen Sie die Aufbewahrungsrichtlinie der Streams an — verwenden Sie `limits` mit `max-age`, um alte Nachrichten automatisch zu löschen:
   ```bash
   nats stream edit <stream-name> --max-age 72h
   ```
5. Beantragen Sie bei Bedarf eine Vergrößerung des JetStream-Volumes. Diese Option wird in der Konsole nicht angeboten; wenden Sie sich an den Support.

### Unzureichender Arbeitsspeicher

**Ursache**: Der NATS-Server verbraucht mehr Arbeitsspeicher als das zugewiesene Limit, häufig aufgrund einer hohen Anzahl von Verbindungen, großer Nachrichten (hoher `max_payload`) oder JetStream-Streams im Arbeitsspeicher.

**Lösung**:

1. Bevorzugen Sie für große Streams den Speichertyp `file` statt `memory`.
2. Verringern Sie die Größe der veröffentlichten Nachrichten, wenn sehr große Nachrichten nicht erforderlich sind.
3. Wenn das Problem weiterhin besteht, beantragen Sie ein größeres Preset oder eine Anpassung von `max_payload`. Diese Option wird in der Konsole nicht angeboten; wenden Sie sich an den Support.

### Verbindung abgelehnt

**Ursache**: falsche URL oder falscher Port, fehlerhafte Zugangsdaten oder ein Verbindungsversuch von außerhalb der Plattform ohne aktivierten externen Zugriff.

**Lösung**:

1. Prüfen Sie, ob Sie die vom Support mitgeteilte URL und die mitgeteilten Zugangsdaten verwenden.
2. Testen Sie die Verbindung:
   ```bash
   nats server check connection --server <nats-url> --user <user> --password <password>
   ```
3. Ein Fehler `Authorization Violation` weist auf falsche Zugangsdaten hin; bitten Sie den Support, das Passwort zu prüfen oder zu erneuern.
4. Wenn Sie sich von außerhalb der Plattform verbinden, klären Sie mit dem Support, ob der externe Zugriff auf der Instanz aktiviert ist.
