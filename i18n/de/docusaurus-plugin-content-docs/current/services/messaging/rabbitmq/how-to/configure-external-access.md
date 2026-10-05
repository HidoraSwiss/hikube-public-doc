---
title: "Externen Zugriff konfigurieren"
---

# Externen Zugriff konfigurieren

Standardmäßig ist ein RabbitMQ-Cluster nicht im Internet erreichbar. Die Option **External access** stellt den Cluster unter einer öffentlichen Adresse bereit, damit sich Anwendungen außerhalb von Hikube (oder Ihr Arbeitsrechner) per AMQP mit ihm verbinden können.

## Voraussetzungen

- Ein in Ihrem Projekt erstellter **RabbitMQ-Cluster** oder der geöffnete Erstellungsassistent
- Mindestens ein RabbitMQ-**Benutzer** und sein Passwort

## Externen Zugriff bei der Erstellung aktivieren

Aktivieren Sie im Schritt **Configuration** des Assistenten **Create a RabbitMQ cluster** die Option **External access**. Die Zusammenfassung im Schritt **Summary** zeigt dann in der Zeile **Network** den Wert **Public** an (statt **Private**).

## Externen Zugriff auf einem bestehenden Cluster aktivieren oder deaktivieren

1. Öffnen Sie die Seite des Clusters und klicken Sie auf **Edit**.
2. Aktivieren oder deaktivieren Sie den Schalter **External access**.
3. Klicken Sie auf **Save**.

## Die öffentliche Adresse abrufen

1. Öffnen Sie die Seite des Clusters.
2. Prüfen Sie im Abschnitt **Connection**, ob **External Access** den Wert **Enabled** anzeigt.
3. Kopieren Sie den Wert des Feldes **Host**. Solange die Adresse nicht zugewiesen ist, zeigt das Feld „Not available / Creating“ an.

Ihre Clients verbinden sich anschließend mit diesem Host über den Port **5672**:

```text
amqp://<user>:<password>@<host>:5672/<vhost>
```

Die AMQP-Verbindung ist nicht verschlüsselt: TLS (AMQPS, Port 5671) wird nicht angeboten. Die öffentliche Adresse stellt außerdem die Ports 15672 (Management-Oberfläche) und 15692 (Prometheus-Metriken) bereit.

## Bewährte Sicherheitspraktiken

:::warning
Ein Cluster mit externem Zugriff ist aus dem Internet erreichbar. Teilen Sie einen Benutzer nicht zwischen mehreren Anwendungen und erneuern Sie im Zweifelsfall sein Passwort mit **Change Password**.
:::

- Deaktivieren Sie den **External access**, wenn nur Anwendungen innerhalb Ihres Projekts den Cluster nutzen: Zugangsdaten und Nachrichten werden im Klartext über das Internet übertragen.
- Weisen Sie Anwendungen, die nur konsumieren, das Recht **Read-only** zu.
- Löschen Sie nicht verwendete Benutzer.

## Überprüfung

Testen Sie von einem externen Rechner aus, ob der AMQP-Port offen ist:

```bash
nc -zv <host> 5672
```

Führen Sie anschließend das Testskript aus Schritt 5 des [Schnellstarts](../quick-start.md) aus.

## Weiterführende Informationen

- [VHosts und Benutzer verwalten](./manage-vhosts-users.md)
- [Die Konfiguration eines Clusters ändern](./scale-resources.md)
