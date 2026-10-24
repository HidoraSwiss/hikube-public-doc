---
sidebar_position: 7
title: "Fehlerbehebung — MongoDB"
sidebar_label: Fehlerbehebung
description: "Beheben Sie häufige MongoDB-Probleme auf Hikube: Cluster im Fehler, Verbindung abgelehnt, not primary, Authentication failed, not authorized, volle Festplatte."
---

# Fehlerbehebung — MongoDB

### Der Cluster bleibt im Status „Creating“

**Ursache**: Die Bereitstellung der Mitglieder und ihrer Volumes läuft noch. Mit Sharding dauert sie länger, da mehr Komponenten bereitgestellt werden.

**Lösung**:

1. Warten Sie einige Minuten und aktualisieren Sie die Seite des Clusters.
2. Ändert sich der Status nach etwa fünfzehn Minuten nicht, [wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie das Projekt und den Namen des Clusters an.

### Der Cluster wechselt in den Status „Error“

**Ursache**: Die Plattform konnte die Erstellung des Clusters oder seine letzte Änderung nicht anwenden. Nach einer Änderung kann der Cluster mit seiner vorherigen Konfiguration weiterlaufen.

**Lösung**: [Wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie das Projekt, den Namen des Clusters und die angeforderte Änderung an.

### Der Schritt Configuration des Assistenten lässt sich nicht abschließen

**Ursache**: Die Konfiguration überschreitet die Quotas des Projekts. Mit Sharding umfasst der Verbrauch 2 Shards, die Konfigurationsserver und die Mongos-Router.

**Lösung**: Verringern Sie das Preset, die Disk-Größe oder die Anzahl der Replicas, deaktivieren Sie das Sharding, wenn Sie es nicht benötigen, oder beantragen Sie eine Erhöhung der Quotas des Projekts.

### Verbindung abgelehnt oder Zeitüberschreitung

**Ursache**: Der externe Zugriff ist deaktiviert, die Adresse ist noch nicht zugewiesen, oder eine Firewall blockiert den Port.

**Lösung**:

1. Prüfen Sie in der Karte **Network and Connection**, ob der Bereich **External** eine Adresse enthält (eine pro Mitglied bei einem Replica Set) und nicht **Disabled** oder „Waiting for allocation…“.
2. Testen Sie die Konnektivität (bei einem Replica Set mit der Adresse eines Mitglieds):
   ```bash
   mongosh "mongodb://<host>:27017/?directConnection=true" --eval 'db.runCommand({ ping: 1 })'
   ```
3. Prüfen Sie, ob keine ausgehende Firewall Ihres Netzwerks den Port `27017` blockiert.

### `ENOTFOUND`, oder Schreibvorgang mit `not primary` abgelehnt

**Ursache**: Bei einem Replica Set hat der Client den Parameter `replicaSet` erhalten und versucht, die Mitglieder unter ihren clusterinternen Namen zu erreichen, die von außen nicht aufgelöst werden; oder er ist direkt mit einem Secondary verbunden, das keine Schreibvorgänge annimmt.

**Lösung**:

1. Entfernen Sie `replicaSet` aus dem Verbindungsstring und fügen Sie `directConnection=true` hinzu, wie im **External connection string** der Karte **Network and Connection**.
2. Verbinden Sie sich zum Schreiben mit dem Primary-Mitglied: `db.hello().isWritablePrimary` gibt an, ob das erreichte Mitglied es ist. Andernfalls versuchen Sie ein anderes Mitglied der Liste.

### `Authentication failed`

**Ursache**: falsches oder durch eine Rotation widerrufenes Passwort, oder falsche Authentifizierungsdatenbank.

**Lösung**:

1. Geben Sie die Authentifizierungsdatenbank `admin` an (`--authenticationDatabase admin` oder `?authSource=admin` in der URI).
2. Wenn Sie beim Passwort unsicher sind, generieren Sie über **Actions** → **Change Password** ein neues und aktualisieren Sie anschließend Ihre Anwendungen.

### `not authorized on <database> to execute command`

**Ursache**: Der Benutzer hat keinen Zugriff auf diese Datenbank oder nur einen **Read-only**-Zugriff.

**Lösung**: Fügen Sie über **Actions** → **Manage Access** die betreffende Datenbank mit den passenden **Rights** hinzu und verbinden Sie sich erneut.

### Fehler beim Hinzufügen eines Zugriffs oder eines Benutzers

**Ursache**: Es ist kein Zugriff auf eine Datenbank definiert, ein Zugriff zielt auf eine Systemdatenbank (`admin`, `local`, `config`), oder ein Name entspricht nicht den Benennungsregeln.

**Lösung**: Weisen Sie mindestens einen Zugriff auf eine Anwendungsdatenbank zu und verwenden Sie nur Kleinbuchstaben, Ziffern und Bindestriche, beginnend mit einem Buchstaben und endend mit einem Buchstaben oder einer Ziffer. Siehe [MongoDB-Konzepte](./concepts.md#benennungsregeln).

### Eine Zeile `admin` wird in „Manage Access“ als Fehler angezeigt

**Ursache**: Der Benutzer wurde vor der Konsole v1.3.0 mit dem Assistenten zur Cluster-Erstellung angelegt, der ihm eine Rolle auf der Systemdatenbank `admin` zuwies. Eine Systemdatenbank kann keinen Zugriff mehr erhalten, und die Aktualisierung des Benutzers wird abgelehnt, solange diese Zeile vorhanden ist.

**Lösung**: Entfernen Sie die Zeile `admin`, fügen Sie bei Bedarf die Anwendungsdatenbank des Benutzers hinzu und klicken Sie dann auf **Save**. Die Meldung „Access updated“ bestätigt das Speichern.

### Disk voll

**Ursache**: Das Datenvolumen hat die **Allocated Size** erreicht.

**Lösung**: Erhöhen Sie die **Disk size (GB)** über **Edit**, im Rahmen des Speicher-Quotas des Projekts. Die Größe kann danach nicht mehr verringert werden. Siehe [Ressourcen ändern](./how-to/scale-resources.md). Löschen Sie bei Bedarf veraltete Daten oder legen Sie TTL-Indizes auf die Ereignis-Collections.
