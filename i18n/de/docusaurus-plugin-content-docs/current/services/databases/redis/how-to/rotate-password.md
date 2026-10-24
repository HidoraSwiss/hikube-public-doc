---
title: "Das Redis-Passwort erneuern"
sidebar_position: 3
---

# Das Redis-Passwort erneuern

Diese Anleitung erklärt, wie Sie über die [Hikube-Konsole](https://console.hikube.cloud) ein neues Passwort für einen Redis-Cluster generieren, zum Beispiel nach dem Verlust des ursprünglichen Passworts oder im Rahmen einer regelmäßigen Rotation.

## Voraussetzungen

- Ein **Redis**-Cluster mit aktivierter Authentifizierung. Auf einem Cluster ohne Authentifizierung wird die Rotation abgelehnt: Aktivieren Sie zuerst **Authentication required** über **Edit** (siehe [Die Ressourcen ändern](./scale-resources.md)).
- Die Liste der Anwendungen, die diesen Cluster nutzen, um sie direkt nach dem Neustart zu aktualisieren

:::warning
Das neue Passwort gilt erst nach einem [Neustart des Clusters](./restart-cluster.md). Bis dahin akzeptieren die Redis-Server weiterhin das alte Passwort und lehnen das neue ab. Der Neustart unterbricht den Cluster kurz (etwa eine Minute): Planen Sie die Rotation in einem Wartungsfenster.
:::

## Schritte

### 1. Den Abschnitt Security öffnen

Öffnen Sie **DB & Messaging** → **Redis** und dann den betreffenden Cluster. Im Abschnitt **Security** generieren Sie ein neues globales Passwort für diesen Cluster.

### 2. Die Rotation starten

1. Klicken Sie auf **Rotate password**.
2. Bestätigen Sie im Fenster **Rotate password** mit **Perform rotation**.

### 3. Das neue Passwort kopieren

Das Fenster **Generated password** zeigt das neue Passwort an. Kopieren Sie es in Ihren Passwort-Manager: Nach dem Schließen des Fensters wird es nicht erneut angezeigt.

Das Fenster weist darauf hin: „The new password is accepted only after the cluster restarts; until then, the servers still accept the previous one.“

### 4. Den Cluster neu starten

1. Klicken Sie im selben Fenster auf **Restart now** und bestätigen Sie mit **Restart**.
2. Um später neu zu starten, klicken Sie auf **Done**: Die Seite des Clusters zeigt bis zum Neustart das Banner **Restart required** mit einer Schaltfläche **Restart now** an.

Der Cluster ist etwa eine Minute lang nicht erreichbar. Siehe [Einen Cluster neu starten](./restart-cluster.md).

### 5. Ihre Anwendungen aktualisieren

Ersetzen Sie nach dem Neustart des Clusters das alte Passwort in der Konfiguration Ihrer Anwendungen (Umgebungsvariablen, Kubernetes-Secrets Ihrer Cluster, Konfigurationsdateien) und starten Sie sie anschließend neu, falls sie die Konfiguration nicht im laufenden Betrieb neu einlesen. Vor dem Neustart des Clusters wird das neue Passwort noch abgelehnt.

## Überprüfung

```bash
REDISCLI_AUTH='<neues passwort>' redis-cli -h <host> -p 6379 ping
# PONG
```

Antwortet der Befehl mit `WRONGPASS`, wurde der Cluster noch nicht neu gestartet: Prüfen Sie, ob auf der Seite des Clusters das Banner **Restart required** angezeigt wird.

## Weiterführende Informationen

- [Einen Cluster neu starten](./restart-cluster.md)
- [Redis-Konzepte](../concepts.md): Authentifizierung
- [Fehlerbehebung Redis](../troubleshooting.md)
