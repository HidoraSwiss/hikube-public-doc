---
title: "Benutzer und Datenbanken verwalten — MariaDB"
sidebar_label: "Benutzer und Datenbanken verwalten"
sidebar_position: 1
---

# Benutzer und Datenbanken verwalten

Diese Anleitung erklärt, wie Sie auf einem MariaDB-Cluster in der [Hikube-Konsole](https://console.hikube.cloud) Benutzer anlegen, ihnen Zugriff auf Datenbanken gewähren und ihre Passwörter erneuern.

## Voraussetzungen

- Ein **MariaDB**-Cluster im Status **Ready** in Ihrem Projekt (siehe [Schnellstart](../quick-start.md))
- Ein Client **`mysql`** oder **`mariadb`**, um die Verbindungen zu testen

Alle Vorgänge erfolgen auf der Seite des Clusters: **DB & Messaging** → **MariaDB** → Name des Clusters, Abschnitt **Users**.

:::note
Die MariaDB-Konsole hat keine eigene Registerkarte für Datenbanken: Eine Datenbank wird erstellt, indem Sie einem Benutzer Zugriff auf ihren Namen gewähren.
:::

## Schritte

### 1. Einen Benutzer anlegen

1. Klicken Sie im Abschnitt **Users** auf **Create a user**.
2. Geben Sie den **Username** ein: 3 bis 16 Zeichen, Kleinbuchstaben, Ziffern und Bindestriche, beginnend mit einem Buchstaben und endend mit einem Buchstaben oder einer Ziffer (zum Beispiel `report-reader`).
3. Klicken Sie unter **Specific Access (Databases)** für jede Datenbank auf **Add**:
   - **Database name**: zum Beispiel `analytics` (Kleinbuchstaben, Ziffern und Bindestriche; kein Unterstrich; die Systemdatenbanken `mysql`, `information_schema`, `performance_schema` und `sys` werden abgelehnt);
   - **Rights**: **Administrator (Admin)** oder **Read-only**.
4. Klicken Sie auf **Create user**.

Eine globale Rolle gibt es nicht: Der Benutzer hat nur auf die aufgeführten Datenbanken Zugriff. Ohne Zugriff zeigt die Konsole „No access configured: the user has no rights on any database.“ an; der Benutzer kann so angelegt werden und seine Zugriffe später erhalten.

Der Bildschirm „User created successfully!“ zeigt das generierte Passwort an.

:::warning
Kopieren Sie dieses Passwort sofort und bewahren Sie es sicher auf: Es wird nach dem Verlassen dieses Bildschirms nicht mehr angezeigt.
:::

Klicken Sie anschließend auf **Done and return to cluster**.

:::tip
Die im Assistenten zur Cluster-Erstellung angelegten Benutzer erhalten ihre Rolle auf der im Schritt **Users** angegebenen **Database**.
:::

### 2. Eine Datenbank erstellen

Gewähren Sie einem Benutzer Zugriff auf den Namen der neuen Datenbank (Schritt 1 für einen neuen Benutzer, Schritt 3 für einen bestehenden Benutzer). Die Datenbank wird erstellt, falls sie noch nicht existiert.

### 3. Die Rechte eines Benutzers ändern

1. Öffnen Sie das Menü **Actions** des Benutzers und wählen Sie **Manage Access**.
2. Fügen Sie mit **Add** Zugriffe hinzu, ändern Sie die **Rights** oder entfernen Sie eine Zeile.
3. Klicken Sie auf **Save**. Die Meldung „Access updated“ bestätigt das Speichern.

Der Benutzername kann nicht geändert werden.

:::warning Vor der Konsole v1.3.0 erstellte Benutzer
Die vor der Konsole v1.3.0 im Assistenten zur Cluster-Erstellung angelegten Benutzer haben eine Rolle auf der Systemdatenbank `mysql` erhalten. In **Manage Access** wird diese Zeile als Fehler angezeigt und verhindert das Speichern: Entfernen Sie sie, fügen Sie bei Bedarf die Anwendungsdatenbank des Benutzers hinzu und klicken Sie dann auf **Save**.
:::

### 4. Das Passwort eines Benutzers erneuern

1. Öffnen Sie das Menü **Actions** des Benutzers und wählen Sie **Change Password**.
2. Klicken Sie im Fenster **Rotate password** auf **Perform rotation**.
3. Kopieren Sie das neue Passwort und klicken Sie dann auf **Done**.

:::warning
Die Rotation widerruft das alte Passwort sofort. Aktualisieren Sie Ihre Anwendungen umgehend, um eine Unterbrechung zu vermeiden.
:::

### 5. Einen Benutzer löschen

Öffnen Sie das Menü **Actions** des Benutzers, wählen Sie **Delete user**, geben Sie seinen exakten Namen ein und klicken Sie dann auf **Permanently delete**.

### 6. Die Verbindung testen

```bash
mysql -h <host> -P 3306 -u report-reader -p analytics
```

```sql
-- Muss erfolgreich sein
SELECT CURRENT_USER(), DATABASE();
SHOW GRANTS;

-- Muss für einen Benutzer mit Nur-Lese-Recht fehlschlagen
CREATE TABLE test (id INT);
```

## Überprüfung

Die Spalte **Databases** der Benutzerliste zeigt für jeden Benutzer die zugänglichen Datenbanken mit der zugehörigen Rolle an (zum Beispiel `analytics (Read-only)` oder `analytics (Administrator)`), oder **None**.

## Weiterführende Informationen

- [MariaDB-Konzepte](../concepts.md): Rollen und Benennungsregeln
- [Ressourcen ändern](./scale-resources.md)
