---
title: "Einen Cluster neu starten — PostgreSQL"
sidebar_label: "Einen Cluster neu starten"
sidebar_position: 5
---

# Einen Cluster neu starten

Diese Anleitung erklärt, wie Sie einen PostgreSQL-Cluster über die [Hikube-Konsole](https://console.hikube.cloud) neu starten, zum Beispiel wenn sich eine Instanz nicht mehr normal verhält.

## Voraussetzungen

- Ein **PostgreSQL**-Cluster mit dem Status **Ready** in Ihrem Projekt
- Das Recht, diesen Cluster zu ändern

## Was beim Neustart passiert

Der Neustart erfolgt schrittweise: Zuerst starten die Replicas neu, dann der Primary.

- Lesezugriffe werden während des gesamten Vorgangs weiter bedient.
- Schreibzugriffe werden für etwa vierzig Sekunden angehalten, solange der Primary neu startet.
- Die Daten bleiben erhalten.

Bei einem Cluster mit 1 Replica übernimmt keine andere Instanz: Die Datenbank ist während des Neustarts nicht verfügbar.

:::warning
Planen Sie den Neustart in einem Wartungsfenster oder außerhalb der Spitzenzeiten, und prüfen Sie, dass Ihre Anwendungen sich neu verbinden und einen abgelehnten Schreibvorgang wiederholen können.
:::

## Schritte

### 1. Die Seite des Clusters öffnen

1. Öffnen Sie **DB & Messaging** → **PostgreSQL**.
2. Öffnen Sie den Cluster in der Liste **PostgreSQL Clusters**.

### 2. Den Neustart auslösen

1. Klicken Sie auf **Restart**, neben den Schaltflächen **Edit** und **Delete**.
2. Das Fenster „Restart `<name>`?“ erinnert an die Auswirkungen des Neustarts. Bestätigen Sie mit **Restart**.

Die Meldung „Restart started“ bestätigt, dass die Anfrage angenommen wurde. Der Neustart läuft im Hintergrund weiter.

:::note
Ein Cluster, der noch erstellt wird, hat noch nichts neu zu starten: Die Anfrage wird abgelehnt. Warten Sie, bis der Cluster den Status **Ready** hat, und lösen Sie den Neustart dann erneut aus.
:::

## Überprüfung

Der Status des Clusters ändert sich während eines Neustarts nicht: Er wird weiterhin als **Ready** angezeigt. Um den Neustart zu bestätigen, prüfen Sie die Startzeit des Primary:

```bash
psql "host=<host> port=5432 dbname=<datenbank> user=<benutzer> sslmode=require" \
  -c "SELECT pg_postmaster_start_time();"
```

Die zurückgegebene Zeit entspricht dem Zeitpunkt des Neustarts.

## Weiterführende Informationen

- [PostgreSQL-Konzepte](../concepts.md): Replikation und Hochverfügbarkeit
- [Die Ressourcen eines Clusters ändern](./scale-resources.md)
