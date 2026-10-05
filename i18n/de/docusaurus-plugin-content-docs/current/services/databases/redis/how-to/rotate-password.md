---
title: "Das Redis-Passwort erneuern"
sidebar_position: 3
---

# Das Redis-Passwort erneuern

Diese Anleitung erklärt, wie Sie über die [Hikube-Konsole](https://console.hikube.cloud) ein neues Passwort für einen Redis-Cluster generieren, zum Beispiel nach dem Verlust des ursprünglichen Passworts oder im Rahmen einer regelmäßigen Rotation.

## Voraussetzungen

- Ein **Redis**-Cluster mit aktivierter Authentifizierung
- Die Liste der Anwendungen, die diesen Cluster nutzen, um sie direkt nach der Rotation zu aktualisieren

:::warning
Die Rotation widerruft das aktuelle Passwort sofort. Anwendungen, die es noch verwenden, verlieren den Zugriff, bis sie aktualisiert sind.
:::

## Schritte

### 1. Den Abschnitt Security öffnen

Öffnen Sie **DB & Messaging** → **Redis** und dann den betreffenden Cluster. Der Abschnitt **Security** zeigt: „Generate a new global password for this cluster. This action will revoke the current password.“

### 2. Die Rotation starten

1. Klicken Sie auf **Rotate password**.
2. Bestätigen Sie im Fenster **Rotate password** mit **Perform rotation**.

### 3. Das neue Passwort kopieren

Das Fenster **Generated password** zeigt das neue Passwort an. Kopieren Sie es in Ihren Passwort-Manager: Nach dem Schließen des Fensters wird es nicht erneut angezeigt. Klicken Sie auf **Done**.

### 4. Ihre Anwendungen aktualisieren

Ersetzen Sie das alte Passwort in der Konfiguration Ihrer Anwendungen (Umgebungsvariablen, Kubernetes-Secrets Ihrer Cluster, Konfigurationsdateien) und starten Sie sie anschließend neu, falls sie die Konfiguration nicht im laufenden Betrieb neu einlesen.

## Überprüfung

```bash
REDISCLI_AUTH='<neues passwort>' redis-cli -h <host> -p 6379 ping
# PONG
```

## Weiterführende Informationen

- [Redis-Konzepte](../concepts.md): Authentifizierung
- [Fehlerbehebung Redis](../troubleshooting.md)
