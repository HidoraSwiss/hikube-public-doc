---
title: "Einen Cluster neu starten — RabbitMQ"
sidebar_label: "Einen Cluster neu starten"
---

# Einen RabbitMQ-Cluster neu starten

Diese Anleitung erklärt, wie Sie einen RabbitMQ-Cluster über die [Hikube-Konsole](https://console.hikube.cloud) neu starten, zum Beispiel wenn sich ein Knoten nicht mehr normal verhält.

## Voraussetzungen

- Ein **RabbitMQ-Cluster** mit dem Status **Ready** in Ihrem Projekt
- Das Recht, diesen Cluster zu ändern

## Was beim Neustart passiert

Alle Pods des Clusters werden gleichzeitig neu erstellt:

- der Cluster ist für einige Sekunden nicht erreichbar, solange die Knoten neu starten;
- offene AMQP-Verbindungen werden getrennt, und Ihre Clients müssen sich neu verbinden;
- die Daten bleiben erhalten: VHosts, Benutzer, dauerhafte (durable) Queues und ihre persistenten Nachrichten. Wie bei jedem Neustart von RabbitMQ überstehen nicht dauerhafte Queues und nicht persistente Nachrichten den Neustart nicht.

Die Adresse im Feld **Host** ändert sich nicht.

:::warning
Planen Sie den Neustart in einem Wartungsfenster oder außerhalb der Spitzenzeiten, und prüfen Sie, dass Ihre Producer und Consumer sich automatisch neu verbinden können.
:::

## Schritte

### 1. Die Seite des Clusters öffnen

Klicken Sie im Menü **DB & Messaging** → **RabbitMQ** auf den Cluster.

### 2. Den Neustart auslösen

1. Klicken Sie auf **Restart**, neben den Schaltflächen **Edit** und **Delete**.
2. Das Fenster „Restart `<name>`?“ erinnert an die Auswirkungen des Neustarts. Bestätigen Sie mit **Restart**.

Die Meldung „Restart started“ bestätigt, dass die Anfrage angenommen wurde. Der Neustart läuft im Hintergrund weiter.

:::note
Ein Cluster, der noch erstellt wird, hat noch nichts neu zu starten: Die Anfrage wird abgelehnt. Warten Sie, bis der Cluster den Status **Ready** hat, und lösen Sie den Neustart dann erneut aus.
:::

## Überprüfung

Der Status des Clusters ändert sich während eines Neustarts nicht: Er wird weiterhin als **Ready** angezeigt. Prüfen Sie in den Logs Ihrer Anwendungen, dass ihre Verbindungen wiederhergestellt wurden und der Nachrichtenverbrauch wieder läuft.

## Weiterführende Informationen

- [Konzepte](../concepts.md): Quorum Queues und Hochverfügbarkeit
- [Die Konfiguration eines Clusters ändern](./scale-resources.md)
