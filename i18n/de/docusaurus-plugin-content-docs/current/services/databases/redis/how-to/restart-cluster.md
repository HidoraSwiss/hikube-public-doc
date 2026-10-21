---
title: "Einen Redis-Cluster neu starten"
sidebar_position: 4
---

# Einen Redis-Cluster neu starten

Diese Anleitung erklärt, wie Sie einen Redis-Cluster über die [Hikube-Konsole](https://console.hikube.cloud) neu starten, insbesondere um eine Änderung der Authentifizierung oder ein neues Passwort anzuwenden.

## Wann ein Neustart nötig ist

Einige Änderungen werden sofort gespeichert, erreichen die laufenden Redis-Server aber erst nach einem Neustart des Clusters:

- das Aktivieren oder Deaktivieren von **Authentication required** auf einem bestehenden Cluster;
- die [Rotation des Passworts](./rotate-password.md).

Bis dahin behalten die Server ihre bisherige Konfiguration. Nach dem Aktivieren der Authentifizierung funktionieren Verbindungen ohne Passwort weiterhin; nach einer Rotation akzeptieren die Server weiterhin das alte Passwort und lehnen das neue ab.

Solange ein Neustart aussteht, zeigt die Seite des Clusters das Banner **Restart required** mit einer Schaltfläche **Restart now** an.

## Voraussetzungen

- Ein **Redis**-Cluster mit dem Status **Ready** in Ihrem Projekt
- Das Recht, diesen Cluster zu ändern

## Was beim Neustart passiert

Alle Instanzen des Clusters werden gleichzeitig neu gestartet, einschließlich der Sentinels:

- der Cluster ist etwa eine Minute lang nicht erreichbar;
- offene Verbindungen werden getrennt, und Ihre Anwendungen müssen sich neu verbinden;
- die Daten bleiben erhalten.

:::warning
Planen Sie den Neustart in einem Wartungsfenster oder außerhalb der Spitzenzeiten, und prüfen Sie, dass Ihre Anwendungen sich automatisch neu verbinden können.
:::

## Schritte

### 1. Die Seite des Clusters öffnen

1. Öffnen Sie **DB & Messaging** → **Redis**.
2. Öffnen Sie den Cluster.

### 2. Den Neustart auslösen

1. Klicken Sie auf **Restart**, neben den Schaltflächen **Edit** und **Delete**. Wird das Banner **Restart required** angezeigt, bewirkt seine Schaltfläche **Restart now** dasselbe.
2. Das Fenster „Restart `<name>`?“ erinnert an die Auswirkungen des Neustarts. Bestätigen Sie mit **Restart**.

Die Meldung „Restart started“ bestätigt, dass die Anfrage angenommen wurde. Der Neustart läuft im Hintergrund weiter.

Die Konsole bietet den Neustart auch im passenden Moment an:

- nach dem Speichern einer Änderung der Authentifizierung über **Edit**: Bestätigen Sie mit **Restart**, oder klicken Sie auf **Later**, um ihn zu verschieben; das Banner **Restart required** bleibt dann auf der Seite des Clusters;
- im Fenster, das nach einer Rotation das neue Passwort anzeigt, mit der Schaltfläche **Restart now**.

:::note
Ein Cluster, der noch erstellt wird, hat noch nichts neu zu starten: Die Anfrage wird abgelehnt. Warten Sie nach dem Wechsel in den Status **Ready** einige Minuten, bis der Cluster vollständig gestartet ist, und lösen Sie den Neustart dann erneut aus.
:::

## Überprüfung

Der Status des Clusters ändert sich während eines Neustarts nicht: Er wird weiterhin als **Ready** angezeigt. Das Banner **Restart required** verschwindet, sobald der Neustart berücksichtigt wurde. Prüfen Sie anschließend, dass die Instanz gerade neu gestartet wurde:

```bash
REDISCLI_AUTH='<passwort>' redis-cli -h <host> -p 6379 INFO server | grep uptime_in_seconds
```

Prüfen Sie nach einer Änderung der Authentifizierung oder des Passworts auch, dass die neue Konfiguration greift:

```bash
# Authentifizierung aktiviert: Eine Verbindung ohne Passwort wird abgelehnt
redis-cli -h <host> -p 6379 ping
# NOAUTH Authentication required.

# Neues Passwort akzeptiert
REDISCLI_AUTH='<neues passwort>' redis-cli -h <host> -p 6379 ping
# PONG
```

## Weiterführende Informationen

- [Passwort erneuern](./rotate-password.md)
- [Die Ressourcen eines Redis-Clusters ändern](./scale-resources.md)
- [Fehlerbehebung Redis](../troubleshooting.md)
