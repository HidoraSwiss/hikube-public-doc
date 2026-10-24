---
title: "Benutzer und Datenbanken verwalten — MongoDB"
sidebar_label: "Benutzer und Datenbanken verwalten"
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
2. Geben Sie den **Username** ein: 3 bis 16 Zeichen, Kleinbuchstaben, Ziffern und Bindestriche, beginnend mit einem Buchstaben und endend mit einem Buchstaben oder einer Ziffer (zum Beispiel `report-reader`).
3. Klicken Sie unter **Specific Access (Databases)** für jede Datenbank auf **Add**:
   - **Database name**: zum Beispiel `analytics` (Kleinbuchstaben, Ziffern und Bindestriche; die Systemdatenbanken `admin`, `local` und `config` werden abgelehnt);
   - **Rights**: **Administrator (Admin)** oder **Read-only**.
4. Klicken Sie auf **Create user**.

Ein MongoDB-Benutzer muss mindestens einen Zugriff haben: Ohne Zugriff zeigt die Konsole „Please grant access to at least one database.“ an, und die Schaltfläche bleibt inaktiv. Eine globale Rolle gibt es nicht: Der Benutzer hat nur auf die aufgeführten Datenbanken Zugriff.

Der Bildschirm „User created successfully!“ zeigt das generierte Passwort an.

:::warning
Kopieren Sie dieses Passwort sofort und bewahren Sie es sicher auf: Es wird nach dem Verlassen dieses Bildschirms nicht erneut angezeigt.
:::

Klicken Sie anschließend auf **Done and return to cluster**.

:::tip
Die im Assistenten zur Cluster-Erstellung angelegten Benutzer erhalten ihre Rolle auf der im Schritt **Users** angegebenen **Database**.
:::

### 2. Die Rechte eines Benutzers ändern

1. Öffnen Sie das Menü **Actions** des Benutzers und wählen Sie **Manage Access**.
2. Fügen Sie mit **Add** Zugriffe hinzu, ändern Sie die **Rights** oder entfernen Sie eine Zeile. Mindestens ein Zugriff muss bestehen bleiben.
3. Klicken Sie auf **Save**. Die Meldung „Access updated“ bestätigt das Speichern.

Der Benutzername kann nicht geändert werden.

:::warning Vor der Konsole v1.3.0 erstellte Benutzer
Die vor der Konsole v1.3.0 im Assistenten zur Cluster-Erstellung angelegten Benutzer haben eine Rolle auf der Systemdatenbank `admin` erhalten. In **Manage Access** wird diese Zeile als Fehler angezeigt und verhindert das Speichern: Entfernen Sie sie, fügen Sie bei Bedarf die Anwendungsdatenbank des Benutzers hinzu und klicken Sie dann auf **Save**.
:::

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
mongosh "mongodb://<host>:27017/analytics?directConnection=true&authSource=admin" --username report-reader
```

Bei einem Replica Set ist `<host>` die Adresse eines der Mitglieder, die im Bereich **External** der Karte **Network and Connection** aufgeführt sind.

```javascript
// Muss gelingen
db.runCommand({ connectionStatus: 1 })
db.events.find().limit(1)

// Muss für einen schreibgeschützten Benutzer fehlschlagen
db.events.insertOne({ test: true })
```

## Überprüfung

Die Spalte **Databases** der Benutzerliste zeigt für jeden Benutzer die zugänglichen Datenbanken mit der jeweiligen Rolle an (zum Beispiel `analytics (Read-only)` oder `analytics (Administrator)`).

## Weiterführende Informationen

- [MongoDB-Konzepte](../concepts.md): Rollen und Benennungsregeln
- [Ressourcen ändern](./scale-resources.md)
