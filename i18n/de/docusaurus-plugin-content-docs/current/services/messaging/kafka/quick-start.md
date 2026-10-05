---
sidebar_position: 3
title: Schnellstart
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Erste Schritte mit Kafka

:::info Verfügbarkeit
Kafka ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht als Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

Diese Anleitung erklärt, wie Sie einen **Kafka-Cluster** auf Hikube erhalten und erste Tests zum Veröffentlichen und Konsumieren mit den Kafka-Client-Werkzeugen durchführen.

---

## Ziele

Am Ende dieser Anleitung verfügen Sie über:

- Einen **Kafka-Cluster**, der in Ihrem Hikube-Projekt bereitgestellt ist
- Einen **Topic**, der bereit ist, Nachrichten zu empfangen
- Eine erste Nachricht, die Sie von Ihrem Rechner oder Ihrer Anwendung aus veröffentlicht und konsumiert haben

---

## Voraussetzungen

- Ein **Hikube-Konto** und ein **Projekt** (siehe den [Hikube-Schnellstart](../../../getting-started/quick-start.md))
- Einen installierten Kafka-Client: die Kafka-Skripte (`kafka-console-producer.sh`, `kafka-console-consumer.sh`) oder **kcat** (früher `kafkacat`)

---

## Schritt 1: Anfrage vorbereiten

Stellen Sie die Parameter der gewünschten Instanz zusammen:

| Parameter | Beschreibung | Beispiel |
|-----------|-------------|---------|
| Projekt | Hikube-Projekt, in dem die Instanz erstellt wird | `demo01` |
| Name | Name der Kafka-Instanz | `events` |
| Broker | Anzahl der Kafka-Broker | `3` |
| Preset der Broker | CPU-/Arbeitsspeicherprofil (siehe [Konzepte](./concepts.md#ressourcen-presets)) | `small` |
| Speicher der Broker | Volume-Größe pro Broker | `10 GB` |
| ZooKeeper | Anzahl der Instanzen (ungerade), Preset und Speichergröße | `3`, `small`, `5 GB` |
| Topics | Name, Partitionen, Replicas und Optionen (`retention.ms`, `cleanup.policy` …) | `my-topic`, 3 Partitionen, 3 Replicas |
| Externer Zugriff | Den Cluster außerhalb der Plattform erreichbar machen oder nicht | Nein |

---

## Schritt 2: Instanz anfragen

Senden Sie diese Parameter an den Support unter [support@hidora.io](mailto:support@hidora.io) oder über die Schaltfläche **Contact support** im Profilmenü der Konsole.

Der Support teilt Ihnen im Gegenzug die Verbindungsinformationen mit:

- die Adresse der **Bootstrap-Server** (im weiteren Verlauf dieser Anleitung als `<bootstrap-servers>` bezeichnet);
- gegebenenfalls die Zugangsdaten und Sicherheitsparameter, die clientseitig zu verwenden sind.

:::note
Innerhalb des Projekts lauschen die Broker auf Port `9092` (unverschlüsselt) und `9093` (TLS). Mit externem Zugriff verwendet die öffentliche Adresse den Port `9094`, standardmäßig per TLS verschlüsselt: Ihre Clients müssen dann dem CA-Zertifikat des Clusters vertrauen, das Ihnen der Support übermittelt (zum Beispiel `-X security.protocol=SSL -X ssl.ca.location=ca.crt` mit kcat). Standardmäßig ist keine Client-Authentifizierung konfiguriert. Verwenden Sie immer die Adresse und den Port, die Ihnen der Support mitteilt.
:::

---

## Schritt 3: Eine Nachricht veröffentlichen

Mit den Kafka-Skripten:

```bash
echo "Hello Hikube!" | kafka-console-producer.sh \
  --bootstrap-server <bootstrap-servers> \
  --topic my-topic
```

Oder mit kcat:

```bash
echo "Hello Hikube!" | kcat -b <bootstrap-servers> -t my-topic -P
```

---

## Schritt 4: Die Nachricht konsumieren

Mit den Kafka-Skripten:

```bash
kafka-console-consumer.sh \
  --bootstrap-server <bootstrap-servers> \
  --topic my-topic \
  --from-beginning \
  --max-messages 1
```

Oder mit kcat:

```bash
kcat -b <bootstrap-servers> -t my-topic -C -o beginning -e
```

**Erwartetes Ergebnis:**

```console
Hello Hikube!
```

:::note
kcat wird mit `apt install kcat` (Debian/Ubuntu) oder `brew install kcat` (macOS) installiert.
:::

---

## Schritt 5: Schnelle Fehlerbehebung

### Verbindung nicht möglich

Prüfen Sie die Metadaten des Clusters von Ihrem Client aus:

```bash
kcat -b <bootstrap-servers> -L
```

**Häufige Ursachen:** falsche Adresse oder falscher Port, externer Zugriff nicht aktiviert, obwohl Sie sich von außerhalb der Plattform verbinden, fehlende clientseitige Sicherheitsparameter.

### Topic nicht gefunden

Listen Sie die sichtbaren Topics auf:

```bash
kafka-topics.sh --bootstrap-server <bootstrap-servers> --list
```

**Häufige Ursachen:** Tippfehler im Namen des Topics, Topic nicht in der Konfiguration der Instanz deklariert.

### Problem auf Seiten des Clusters

Wenn der Cluster nicht verfügbar zu sein scheint (Broker nicht erreichbar, ZooKeeper-Quorumfehler), [wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie den Namen des Projekts und der Instanz an.

---

## Schritt 6: Bereinigung

Um die Instanz zu löschen, richten Sie die Anfrage an den [Support](mailto:support@hidora.io) und geben Sie das Projekt und den Namen der Instanz an.

:::warning
Das Löschen eines Kafka-Clusters entfernt alle zugehörigen Daten. Dieser Vorgang ist **unwiderruflich**.
:::

---

## Nächste Schritte

- **[Konzepte](./concepts.md)**: Topics, Partitionen, ZooKeeper und Presets
- **[Topics erstellen und verwalten](./how-to/manage-topics.md)**: Konfigurationsoptionen der Topics

<NavigationFooter
  nextSteps={[
    {label: "FAQ", href: "../faq"},
    {label: "Konzepte", href: "../concepts"},
  ]}
  seeAlso={[
    {label: "Alle Messaging-Dienste", href: "../../"},
  ]}
/>
