---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — MariaDB

### Der Cluster bleibt im Status „Creating“

**Ursache**: Die Bereitstellung der Knoten und ihrer Volumes läuft noch. Sie kann mehrere Minuten dauern, mit 3 oder 5 Replicas länger.

**Lösung**:

1. Warten Sie einige Minuten und aktualisieren Sie die Seite des Clusters.
2. Wenn sich der Status nach etwa fünfzehn Minuten nicht ändert oder zu **Error** oder **Failed** wechselt, [wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie dabei das Projekt und den Namen des Clusters an.

### Verbindung abgelehnt oder Zeitüberschreitung

**Ursache**: Der externe Zugriff ist deaktiviert, die IP-Adresse ist noch nicht zugewiesen, oder der Client verwendet eine falsche Adresse oder einen falschen Port.

**Lösung**:

1. Prüfen Sie in der Karte **Connection and network**, ob der **External Access** **Enabled** ist und das Feld **Host** eine Adresse enthält.
2. Verwenden Sie den Port `3306` und testen Sie die Konnektivität:
   ```bash
   mysqladmin -h <host> -P 3306 -u <user> -p ping
   ```
3. Prüfen Sie, ob keine ausgehende Firewall Ihres Netzwerks den Port `3306` blockiert.

### `Access denied for user`

**Ursache**: falsches oder durch eine Rotation widerrufenes Passwort, oder ein Benutzer ohne Recht auf der angegebenen Datenbank.

**Lösung**:

1. Prüfen Sie in der Benutzerliste die Spalte **Databases**: Der Benutzer muss Zugriff auf die verwendete Datenbank haben.
2. Fügen Sie den Zugriff bei Bedarf über **Actions** → **Manage Access** hinzu.
3. Wenn Sie beim Passwort unsicher sind, generieren Sie über **Actions** → **Change Password** ein neues und aktualisieren Sie Ihre Anwendungen.

### Fehler beim Hinzufügen eines Zugriffs oder eines Benutzers

**Ursache**: Der Name der Datenbank oder des Benutzers entspricht nicht den Benennungsregeln.

**Lösung**: Verwenden Sie nur Kleinbuchstaben, Ziffern und Bindestriche, beginnend mit einem Buchstaben und endend mit einem Buchstaben oder einer Ziffer. Unterstriche (`_`) und Großbuchstaben werden nicht akzeptiert. Siehe [MariaDB-Konzepte](./concepts.md#benennungsregeln).

### Disk-Speicherplatz voll

**Ursache**: Das Datenvolumen (einschließlich der Binary Logs) hat die **Allocated Size** erreicht.

**Lösung**:

1. Messen Sie den belegten Speicherplatz pro Datenbank:
   ```sql
   SELECT table_schema, ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS size_mb
   FROM information_schema.tables
   GROUP BY table_schema;
   ```
2. Erhöhen Sie die **Disk size (GB)** über **Edit**, im Rahmen des Speicher-Quotas des Projekts. Siehe [Ressourcen ändern](./how-to/scale-resources.md).
3. Löschen Sie veraltete Daten und optimieren Sie anschließend die betroffenen Tabellen (`OPTIMIZE TABLE`).

### Replikation nicht synchron

**Ursache**: Eine Replica kann dem Primary nicht mehr folgen (hohe Schreiblast, unzureichende Ressourcen, Infrastrukturvorfall).

**Lösung**: Die Resynchronisierung einer Replica wird in der Konsole nicht angeboten. [Wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie dabei das Projekt und den Namen des Clusters an.
