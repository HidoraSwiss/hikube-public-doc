---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — MongoDB

### Der Cluster bleibt im Status „Creating“

**Ursache**: Die Bereitstellung der Mitglieder und ihrer Volumes läuft noch. Mit Sharding dauert sie länger, da mehr Komponenten bereitgestellt werden.

**Lösung**:

1. Warten Sie einige Minuten und aktualisieren Sie die Seite des Clusters.
2. Ändert sich der Status nach etwa fünfzehn Minuten nicht oder wechselt er auf **Error** oder **Failed**, [wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie das Projekt und den Namen des Clusters an.

### Der Schritt Configuration des Assistenten lässt sich nicht abschließen

**Ursache**: Die Konfiguration überschreitet die Quotas des Projekts. Mit Sharding umfasst der Verbrauch 2 Shards, die Konfigurationsserver und die Mongos-Router.

**Lösung**: Verringern Sie das Preset, die Disk-Größe oder die Anzahl der Replicas, deaktivieren Sie das Sharding, wenn Sie es nicht benötigen, oder beantragen Sie eine Erhöhung der Quotas des Projekts.

### Verbindung abgelehnt oder Zeitüberschreitung

**Ursache**: Der externe Zugriff ist deaktiviert, die Adresse ist noch nicht zugewiesen, oder eine Firewall blockiert den Port.

**Lösung**:

1. Prüfen Sie in der Karte **Network and Connection**, ob der **External Access** **Enabled** ist und das Feld **Host** eine Adresse enthält.
2. Testen Sie die Konnektivität:
   ```bash
   mongosh "mongodb://<host>:27017" --eval 'db.runCommand({ ping: 1 })'
   ```
3. Prüfen Sie, ob keine ausgehende Firewall Ihres Netzwerks den Port `27017` blockiert.

### `Authentication failed`

**Ursache**: falsches oder durch eine Rotation widerrufenes Passwort, oder falsche Authentifizierungsdatenbank.

**Lösung**:

1. Geben Sie die Authentifizierungsdatenbank `admin` an (`--authenticationDatabase admin` oder `?authSource=admin` in der URI).
2. Wenn Sie beim Passwort unsicher sind, generieren Sie über **Actions** → **Change Password** ein neues und aktualisieren Sie anschließend Ihre Anwendungen.

### `not authorized on <database> to execute command`

**Ursache**: Der Benutzer hat keinen Zugriff auf diese Datenbank oder nur einen **Read-only**-Zugriff.

**Lösung**: Fügen Sie über **Actions** → **Manage Access** die betreffende Datenbank mit den passenden **Rights** hinzu und verbinden Sie sich erneut.

### Fehler beim Hinzufügen eines Zugriffs oder eines Benutzers

**Ursache**: Es ist keine Rolle definiert, oder ein Name entspricht nicht den Benennungsregeln.

**Lösung**: Weisen Sie mindestens eine globale Rolle oder einen spezifischen Zugriff zu und verwenden Sie nur Kleinbuchstaben, Ziffern und Bindestriche, beginnend mit einem Buchstaben. Siehe [MongoDB-Konzepte](./concepts.md#benennungsregeln).

### Disk voll

**Ursache**: Das Datenvolumen hat die **Allocated Size** erreicht.

**Lösung**: Erhöhen Sie die **Disk size (GB)** über **Edit**, im Rahmen des Speicher-Quotas des Projekts. Siehe [Ressourcen ändern](./how-to/scale-resources.md). Löschen Sie bei Bedarf veraltete Daten oder legen Sie TTL-Indizes auf die Ereignis-Collections.
