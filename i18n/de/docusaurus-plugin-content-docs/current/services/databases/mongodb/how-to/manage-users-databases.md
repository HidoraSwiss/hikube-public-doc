---
title: "Benutzer und Datenbanken verwalten"
sidebar_position: 1
---

# Benutzer und Datenbanken verwalten

Diese Anleitung erklärt, wie Sie über die [Hikube-Konsole](https://console.hikube.cloud) MongoDB-Benutzer anlegen, ihnen Zugriff auf Datenbanken gewähren und ihre Passwörter erneuern.

## Voraussetzungen

- Ein **MongoDB**-Cluster mit dem Status **Ready** in Ihrem Projekt (siehe [Schnellstart](../quick-start.md))
- Die Shell **`mongosh`**, um die Verbindungen zu testen

Alle Vorgänge erfolgen auf der Seite des Clusters: **DB & Messaging** → **MongoDB** → Name des Clusters, Abschnitt **Users**.

:::note
Die MongoDB-Konsole hat keine eigene Registerkarte für Datenbanken: Die Rechte werden pro Benutzer festgelegt, Datenbank für Datenbank. Wie bei MongoDB üblich, entsteht eine Datenbank physisch, sobald Sie ein erstes Dokument hineinschreiben.
:::

## Schritte

### 1. Einen Benutzer anlegen

1. Klicken Sie im Abschnitt **Users** auf **Create a user**.
2. Geben Sie den **Username** ein: Kleinbuchstaben, Ziffern und Bindestriche, beginnend mit einem Buchstaben (zum Beispiel `report-reader`).
3. Legen Sie mindestens eine Rolle fest:
   - **Global Role (Optional)**: Lassen Sie **No global role** stehen, um den Benutzer auf bestimmte Datenbanken zu beschränken;
   - **Specific Access (Databases)**: Klicken Sie auf **Add**, geben Sie den **Database name** ein (zum Beispiel `analytics`) und wählen Sie als **Rights** **Administrator (Admin)** oder **Read-only**.
4. Klicken Sie auf **Create user**.

Ist keine Rolle festgelegt, zeigt die Konsole „Please assign at least one role (global or specific) to the user.“ an, und die Schaltfläche bleibt inaktiv.

Der Bildschirm „Generated password“ zeigt das generierte Passwort an.

:::warning
Kopieren Sie dieses Passwort sofort und bewahren Sie es sicher auf: Es wird nach dem Verlassen dieses Bildschirms nicht erneut angezeigt.
:::

Klicken Sie anschließend auf **Done**.

### 2. Die Rechte eines Benutzers ändern

1. Öffnen Sie das Menü **Actions** des Benutzers und wählen Sie **Manage Access**.
2. Fügen Sie mit **Add** Zugriffe hinzu, ändern Sie die **Rights** oder entfernen Sie eine Zeile. Mindestens eine Rolle muss bestehen bleiben.
3. Klicken Sie auf **Save**.

Der Benutzername kann nicht geändert werden.

### 3. Das Passwort eines Benutzers erneuern

1. Öffnen Sie das Menü **Actions** des Benutzers und wählen Sie **Change Password**.
2. Klicken Sie im Fenster **Rotate password** auf **Perform rotation**.
3. Kopieren Sie das neue Passwort und klicken Sie dann auf **Done**.

:::warning
Die Rotation widerruft das alte Passwort sofort. Aktualisieren Sie Ihre Anwendungen umgehend, um eine Unterbrechung zu vermeiden.
:::

### 4. Einen Benutzer löschen

Öffnen Sie das Menü **Actions** des Benutzers, wählen Sie **Delete user**, geben Sie seinen genauen Namen ein und klicken Sie dann auf **Permanently delete**.

### 5. Die Verbindung testen

```bash
mongosh "mongodb://<host>:27017/analytics" --username report-reader --authenticationDatabase admin
```

```javascript
// Muss gelingen
db.runCommand({ connectionStatus: 1 })
db.events.find().limit(1)

// Muss für einen schreibgeschützten Benutzer fehlschlagen
db.events.insertOne({ test: true })
```

## Überprüfung

Die Benutzerliste zeigt für jeden Benutzer seine **Role** und die zugänglichen **Databases** mit dem jeweiligen Recht an (zum Beispiel `analytics (Read-only)`).

## Weiterführende Informationen

- [MongoDB-Konzepte](../concepts.md): Rollen und Benennungsregeln
- [Ressourcen ändern](./scale-resources.md)
