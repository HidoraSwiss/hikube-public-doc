---
title: "Benutzer und Datenbanken verwalten"
sidebar_position: 1
---

# Benutzer und Datenbanken verwalten

Diese Anleitung erklärt, wie Sie auf einem PostgreSQL-Cluster in der [Hikube-Konsole](https://console.hikube.cloud) Datenbanken erstellen, Erweiterungen aktivieren, Benutzer anlegen, ihre Rechte verwalten und ihre Passwörter erneuern.

## Voraussetzungen

- Ein **PostgreSQL**-Cluster im Status **Ready** in Ihrem Projekt (siehe [Schnellstart](../quick-start.md))
- Der Client **`psql`**, um die Verbindungen zu testen

Alle Vorgänge erfolgen auf der Seite des Clusters: **DB & Messaging** → **PostgreSQL** → Name des Clusters. Die Seite hat zwei Registerkarten, **Databases** und **Users**.

## Schritte

### 1. Eine Datenbank erstellen

1. Klicken Sie in der Registerkarte **Databases** auf **Create**.
2. Geben Sie den **Database name** ein (Kleinbuchstaben, Ziffern und Unterstriche, höchstens 63 Zeichen), zum Beispiel `analytics`.
3. Wählen Sie unter **PostgreSQL Extensions** die Erweiterungen aus, die bei der Erstellung aktiviert werden sollen.
4. Klicken Sie auf **Create**.

Die Datenbank erscheint mit ihren Erweiterungen in der Liste. Sie wird auch in der Karte **Connection and Databases** unter **Initial Databases** aufgeführt.

:::tip
Sie können Datenbanken auch bereits bei der Erstellung des Clusters im Schritt **Databases** des Assistenten anlegen. Die Datenbank **`postgres`** wird immer automatisch erstellt.
:::

### 2. Die Erweiterungen einer Datenbank verwalten

1. Öffnen Sie in der Registerkarte **Databases** das Menü **Actions** der Datenbank.
2. Wählen Sie **Manage extensions**.
3. Aktivieren oder deaktivieren Sie die Erweiterungen und klicken Sie dann auf **Save**.

Die angebotene Liste entspricht den auf der Plattform verfügbaren Erweiterungen, unter anderem `pg_stat_statements`, `pgcrypto`, `uuid-ossp`, `pg_trgm`, `hstore`, `citext`, `postgres_fdw`, `pgaudit` und `vector` (pgvector).

### 3. Einen Benutzer anlegen

1. Klicken Sie in der Registerkarte **Users** auf **Create a user**.
2. Geben Sie den **Username** ein: 3 bis 16 Zeichen, Kleinbuchstaben, Ziffern und Unterstriche, beginnend mit einem Buchstaben oder einem Unterstrich (zum Beispiel `report_reader`).
3. Klicken Sie unter **Databases** für jede Datenbank, auf die der Benutzer zugreifen soll, auf **Add access**:
   - **Database name**: Wählen Sie die Datenbank aus;
   - **Rights**: **Administrator (Admin)** (Lesen und Schreiben) oder **Read-only**.
4. Klicken Sie auf **Create user**.

Der Bildschirm „User created successfully!“ zeigt das generierte Passwort an.

:::warning
Kopieren Sie dieses Passwort sofort und bewahren Sie es sicher auf: Es wird nach dem Verlassen dieses Bildschirms nicht mehr angezeigt.
:::

Klicken Sie anschließend auf **Done and return to cluster**.

### 4. Die Rechte eines Benutzers ändern

1. Öffnen Sie in der Registerkarte **Users** das Menü **Actions** des Benutzers.
2. Wählen Sie **Manage Access**.
3. Fügen Sie mit **Add** Zugriffe hinzu, ändern Sie die **Rights** oder entfernen Sie eine Zeile.
4. Klicken Sie auf **Save**.

Der Benutzername kann nicht geändert werden.

### 5. Das Passwort eines Benutzers erneuern

1. Öffnen Sie das Menü **Actions** des Benutzers und wählen Sie **Change Password**.
2. Klicken Sie im Fenster **Rotate password** auf **Perform rotation**.
3. Kopieren Sie das angezeigte neue Passwort und klicken Sie dann auf **Done**.

:::warning
Die Rotation widerruft das alte Passwort sofort. Aktualisieren Sie Ihre Anwendungen umgehend, um eine Unterbrechung zu vermeiden.
:::

### 6. Eine Datenbank oder einen Benutzer löschen

- Datenbank: Menü **Actions** → **Delete database**.
- Benutzer: Menü **Actions** → **Delete user**.

Bestätigen Sie, indem Sie den exakten Namen des Elements eingeben, und klicken Sie dann auf **Permanently delete**. Beim Löschen einer Datenbank werden ihre Daten gelöscht.

### 7. Die Verbindung testen

```bash
# Benutzer mit Nur-Lese-Recht
psql "host=<host> port=5432 dbname=analytics user=report_reader sslmode=require"
```

```sql
-- Muss erfolgreich sein
SELECT current_user, current_database();

-- Muss für einen Benutzer mit Nur-Lese-Recht fehlschlagen
CREATE TABLE test (id int);
```

## Überprüfung

- Die Registerkarte **Databases** listet Ihre Datenbanken und deren Erweiterungen auf.
- Die Registerkarte **Users** listet Ihre Benutzer auf, jeweils mit den zugänglichen Datenbanken und dem zugehörigen Recht (zum Beispiel `analytics (Read-only)`).

## Weiterführende Informationen

- [PostgreSQL-Konzepte](../concepts.md): Rechte, Benennungsregeln
- [Ressourcen ändern](./scale-resources.md): Preset, Disk, externer Zugriff
