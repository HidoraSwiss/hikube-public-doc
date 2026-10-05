---
title: "VHosts und Benutzer verwalten"
---

# VHosts und Benutzer verwalten

Diese Anleitung erklärt, wie Sie in der [Hikube-Konsole](https://console.hikube.cloud) Virtual Hosts (VHosts) hinzufügen und löschen, RabbitMQ-Benutzer erstellen, ihre Rechte pro VHost verwalten und ihr Passwort erneuern.

## Voraussetzungen

- Ein in Ihrem Projekt erstellter **RabbitMQ-Cluster** (siehe den [Schnellstart](../quick-start.md))
- Zugriff auf die Detailseite des Clusters: Menü **DB & Messaging** → **RabbitMQ**, dann Klick auf den Cluster

## Einen VHost hinzufügen

1. Klicken Sie auf der Seite des Clusters im Abschnitt **VHosts** auf **Add a VHost**.
2. Geben Sie im Fenster **Create a VHost** den **VHost Name** ein (Buchstaben, Ziffern, `_`, `.` und `-`, zum Beispiel `production`).
3. Klicken Sie auf **Create**. Die Meldung „VHost created“ bestätigt den Vorgang und der VHost erscheint in der Liste.

## Einen VHost löschen

1. Öffnen Sie im Abschnitt **VHosts** das Aktionsmenü des VHosts.
2. Wählen Sie **Delete VHost**.
3. Geben Sie zur Bestätigung den exakten Namen des VHosts ein und klicken Sie dann auf **Permanently delete**.

:::warning
Das Löschen eines VHosts entfernt seine Exchanges, Queues und Nachrichten. Der Standard-VHost `/` kann, sofern vorhanden, nicht gelöscht werden.
:::

## Einen Benutzer erstellen

1. Klicken Sie im Abschnitt **Users** auf **Create a user**.
2. Geben Sie den **Username** ein (Buchstaben, Ziffern, `_`, `.` und `-`).
3. Klicken Sie unter **Specific Access (VHosts)** für jeden VHost, auf den der Benutzer zugreifen soll, auf **Add** und wählen Sie dann:
   - den **VHost name** aus der Liste;
   - die **Rights**: **Administrator (Admin)** oder **Read-only**.
4. Klicken Sie auf **Create user**.

Die Konsole zeigt das für den Benutzer generierte Passwort an.

:::warning Passwort wird nur einmal angezeigt
Kopieren Sie das Passwort sofort: Es wird nach dem Verlassen dieses Bildschirms nicht mehr angezeigt. Klicken Sie anschließend auf **Done**.
:::

:::tip
Erstellen Sie einen Benutzer pro Anwendung, mit dem Recht **Read-only** für Anwendungen, die nur Nachrichten konsumieren. Das begrenzt die Auswirkungen eines Lecks von Zugangsdaten.
:::

## Die Rechte eines Benutzers ändern

1. Öffnen Sie im Abschnitt **Users** das Aktionsmenü des Benutzers und wählen Sie **Manage Access**.
2. Die Seite **Edit user** listet seine Zugriffe pro VHost auf. Der **Username** kann nicht geändert werden.
3. Fügen Sie mit **Add** einen Zugriff hinzu, ändern Sie die **Rights** für einen VHost oder entfernen Sie einen Zugriff mit dem Löschsymbol der Zeile.
4. Klicken Sie auf **Save**.

Das Passwort des Benutzers wird durch diesen Vorgang nicht geändert.

## Das Passwort eines Benutzers erneuern

1. Wählen Sie im Aktionsmenü des Benutzers **Change Password**.
2. Das Fenster **Rotate password** fragt nach einer Bestätigung. Klicken Sie auf **Perform rotation**.
3. Kopieren Sie das angezeigte neue Passwort und klicken Sie dann auf **Done**.

:::warning
Das alte Passwort wird sofort widerrufen. Aktualisieren Sie umgehend die Anwendungen, die dieses Konto verwenden, da ihre Verbindungen sonst abgelehnt werden.
:::

## Einen Benutzer löschen

1. Wählen Sie im Aktionsmenü des Benutzers **Delete user**.
2. Geben Sie zur Bestätigung den exakten Namen des Benutzers ein und klicken Sie dann auf **Permanently delete**.

Seine Rechte auf allen VHosts werden gleichzeitig entfernt.

## Überprüfung

- Der Abschnitt **VHosts** listet alle VHosts des Clusters auf.
- Die Spalte **VHosts** der Tabelle **Users** zeigt für jeden Benutzer seine VHosts und das zugehörige Recht an.
- Ein Verbindungstest mit einem AMQP-Client (siehe Schritt 5 des [Schnellstarts](../quick-start.md)) bestätigt, dass der Benutzer auf den erwarteten VHost zugreift.

## Weiterführende Informationen

- [Konzepte](../concepts.md): VHosts, Benutzer und Rechte
- [Die Konfiguration eines Clusters ändern](./scale-resources.md)
- [Externen Zugriff konfigurieren](./configure-external-access.md)
