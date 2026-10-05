---
sidebar_position: 3
title: Schnellstart
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Erste Schritte mit NATS

:::info Verfügbarkeit
NATS ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht im Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

Diese Anleitung erklärt, wie Sie einen **NATS-Cluster** auf Hikube erhalten und mit dem CLI `nats` erste Tests zum Veröffentlichen und Konsumieren von Nachrichten durchführen.

---

## Ziele

Am Ende dieser Anleitung haben Sie:

- Einen in Ihrem Hikube-Projekt bereitgestellten **NATS-Cluster** mit aktiviertem **JetStream**
- Einen **Benutzer**, um sich mit dem Cluster zu verbinden
- Einen Stream erstellt sowie eine erste Nachricht veröffentlicht und konsumiert

---

## Voraussetzungen

- Ein **Hikube-Konto** und ein **Projekt** (siehe den [Hikube-Schnellstart](../../../getting-started/quick-start.md))
- Das **NATS-CLI** (`nats`) auf Ihrem Rechner installiert, verfügbar unter [nats-io/natscli](https://github.com/nats-io/natscli)

---

## Schritt 1: Ihre Anfrage vorbereiten

Stellen Sie die Parameter der gewünschten Instanz zusammen:

| Parameter | Beschreibung | Beispiel |
|-----------|-------------|---------|
| Projekt | Hikube-Projekt, in dem die Instanz erstellt wird | `demo01` |
| Name | Name der NATS-Instanz | `events` |
| Replicas | Anzahl der NATS-Server (3 für die Hochverfügbarkeit von JetStream) | `3` |
| Preset | CPU-/Arbeitsspeicherprofil (siehe [Konzepte](./concepts.md#ressourcen-presets)) | `small` |
| JetStream | Aktivierung und Größe des Persistenz-Volumes | Aktiviert, `10 GB` |
| Benutzer | Namen der zu erstellenden Konten | `user1` |
| Erweiterte Konfiguration | Anzupassende NATS-Parameter (`max_payload`, `write_deadline`…) | `max_payload: 16MB` |
| Externer Zugriff | Ob der Cluster außerhalb der Plattform erreichbar sein soll | Nein |

---

## Schritt 2: Die Instanz anfordern

Senden Sie diese Parameter an den Support unter [support@hidora.io](mailto:support@hidora.io) oder über die Schaltfläche **Contact support** im Profilmenü der Konsole.

Der Support übermittelt Ihnen im Gegenzug:

- die **Server-URL** von NATS (im weiteren Verlauf dieser Anleitung als `<nats-url>` bezeichnet);
- die **Zugangsdaten** der angeforderten Benutzer.

:::note
Der Standard-Client-Port von NATS ist `4222`. Mit externem Zugriff wird TLS automatisch aktiviert: Verbinden Sie sich über `tls://` und vertrauen Sie dem CA-Zertifikat, das Ihnen der Support übermittelt. Die Passwörter der Benutzer werden von der Plattform generiert. Verwenden Sie immer die vom Support mitgeteilte Adresse und den mitgeteilten Port.
:::

Um URL und Zugangsdaten nicht jedes Mal angeben zu müssen, speichern Sie einen Kontext im CLI:

```bash
nats context save hikube --server <nats-url> --user <user> --password <password> --select
```

---

## Schritt 3: Einen JetStream-Stream erstellen

```bash
nats stream add EVENTS \
  --subjects "events.*" --storage file --replicas 3 --retention limits \
  --max-msgs -1 --max-bytes -1 --max-age 24h --discard old --defaults
```

:::note
Die Anzahl der Replicas eines Streams darf die Anzahl der NATS-Server der Instanz nicht überschreiten.
:::

---

## Schritt 4: Eine Nachricht veröffentlichen und konsumieren

```bash
# Eine Nachricht veröffentlichen
nats pub events.test "Hello Hikube!"

# Den Inhalt des Streams lesen
nats stream view EVENTS
```

**Erwartetes Ergebnis:**

```console
[1] Subject: events.test Received: 2025-01-15T10:30:00Z
  Hello Hikube!
```

---

## Schritt 5: Schnelle Fehlerbehebung

### Verbindung abgelehnt

```bash
nats server check connection
```

**Häufige Ursachen:** falsche URL oder falscher Port, fehlerhafte Zugangsdaten (`Authorization Violation`), externer Zugriff nicht aktiviert, obwohl Sie sich von außerhalb der Plattform verbinden.

### JetStream funktioniert nicht

```bash
nats account info
```

**Häufige Ursachen:** JetStream auf der Instanz nicht aktiviert, unzureichender JetStream-Speicherplatz, Anzahl der Stream-Replicas größer als die Anzahl der Server.

### Problem auf Cluster-Seite

Wenn der Cluster nicht verfügbar zu sein scheint, [wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie den Namen des Projekts und der Instanz an.

---

## Schritt 6: Bereinigung

Löschen Sie den Test-Stream über das CLI:

```bash
nats stream rm EVENTS -f
```

Um die Instanz selbst zu löschen, richten Sie die Anfrage an den [Support](mailto:support@hidora.io) und geben Sie das Projekt und den Namen der Instanz an.

:::warning
Das Löschen eines NATS-Clusters entfernt alle zugehörigen Daten, einschließlich der JetStream-Streams. Dieser Vorgang ist **unwiderruflich**.
:::

---

## Nächste Schritte

- **[Konzepte](./concepts.md)**: Kommunikationsmodelle und JetStream
- **[JetStream konfigurieren](./how-to/configure-jetstream.md)**: Dimensionierung und Verwaltung der Streams

<NavigationFooter
  nextSteps={[
    {label: "FAQ", href: "../faq"},
    {label: "Konzepte", href: "../concepts"},
  ]}
  seeAlso={[
    {label: "Alle Messaging-Dienste", href: "../../"},
  ]}
/>
