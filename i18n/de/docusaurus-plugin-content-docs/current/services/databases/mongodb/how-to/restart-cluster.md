---
title: "Einen Cluster neu starten — MongoDB"
sidebar_label: "Einen Cluster neu starten"
sidebar_position: 4
---

# Einen Cluster neu starten

Diese Anleitung erklärt, wie Sie einen MongoDB-Cluster über die [Hikube-Konsole](https://console.hikube.cloud) neu starten, zum Beispiel wenn sich ein Mitglied nicht mehr normal verhält.

## Voraussetzungen

- Ein **MongoDB**-Cluster mit dem Status **Ready** in Ihrem Projekt
- Das Recht, diesen Cluster zu ändern

## Was beim Neustart passiert

Alle Pods des Clusters werden gleichzeitig neu erstellt:

- der Cluster ist für einige Sekunden nicht erreichbar, solange die Mitglieder neu starten;
- offene Verbindungen werden getrennt, und Ihre Anwendungen müssen sich neu verbinden;
- die Daten bleiben erhalten.

Bei einem Sharded Cluster werden die `mongos`-Router nicht neu gestartet.

:::warning
Planen Sie den Neustart in einem Wartungsfenster oder außerhalb der Spitzenzeiten, und prüfen Sie, dass Ihre Anwendungen sich automatisch neu verbinden können.
:::

## Schritte

### 1. Die Seite des Clusters öffnen

1. Öffnen Sie **DB & Messaging** → **MongoDB**.
2. Öffnen Sie den Cluster.

### 2. Den Neustart auslösen

1. Klicken Sie auf **Restart**, neben den Schaltflächen **Edit** und **Delete**.
2. Das Fenster „Restart `<name>`?“ erinnert an die Auswirkungen des Neustarts. Bestätigen Sie mit **Restart**.

Die Meldung „Restart started“ bestätigt, dass die Anfrage angenommen wurde. Der Neustart läuft im Hintergrund weiter.

:::note
Ein Cluster, der noch erstellt wird, hat noch nichts neu zu starten: Die Anfrage wird abgelehnt. Warten Sie, bis der Cluster den Status **Ready** hat, und lösen Sie den Neustart dann erneut aus.
:::

## Überprüfung

Der Status des Clusters ändert sich während eines Neustarts nicht: Er wird weiterhin als **Ready** angezeigt. Um den Neustart zu bestätigen, prüfen Sie, seit wie vielen Sekunden das Mitglied läuft:

```bash
mongosh "mongodb://<host>:27017/admin?directConnection=true&authSource=admin" --username <benutzer> \
  --eval "db.serverStatus().uptime"
```

Ein niedriger Wert bestätigt, dass das Mitglied gerade neu gestartet wurde.

## Weiterführende Informationen

- [MongoDB-Konzepte](../concepts.md): Replikation, Hochverfügbarkeit und Sharding
- [Die Ressourcen eines Clusters ändern](./scale-resources.md)
