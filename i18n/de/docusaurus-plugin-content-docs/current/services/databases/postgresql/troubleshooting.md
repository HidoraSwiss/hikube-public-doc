---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — PostgreSQL

### Der Cluster bleibt im Status „Creating“

**Ursache**: Die Bereitstellung der Instanzen und ihrer Volumes läuft noch. Sie kann mehrere Minuten dauern, mit mehreren Replicas länger.

**Lösung**:

1. Warten Sie einige Minuten und aktualisieren Sie die Seite des Clusters.
2. Wenn sich der Status nach etwa fünfzehn Minuten nicht ändert oder zu **Error** oder **Failed** wechselt, [wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie dabei das Projekt und den Namen des Clusters an.

### Der Schritt Configuration des Assistenten lässt sich nicht abschließen

**Ursache**: Die angeforderte Konfiguration überschreitet die Quotas des Projekts (CPU, Arbeitsspeicher oder Speicher). Unter dem Feld **Disk size (GB)** kann die Meldung „Storage quota exceeded for this project“ erscheinen.

**Lösung**:

1. Sehen Sie sich das Quota-Banner oben im Assistenten an.
2. Verringern Sie das **Instance preset**, die **Disk size (GB)** oder die **Number of replicas**: Der Verbrauch wird mit der Anzahl der Replicas multipliziert.
3. Wenn das Projekt zusätzliche Quotas benötigt, wenden Sie sich an den Support.

### Verbindung abgelehnt oder Zeitüberschreitung

**Ursache**: Der externe Zugriff ist deaktiviert, die IP-Adresse ist noch nicht zugewiesen, oder der Client verwendet eine falsche Adresse oder einen falschen Port.

**Lösung**:

1. Prüfen Sie auf der Seite des Clusters, ob die Karte **External Access** **Enabled** anzeigt. Andernfalls aktivieren Sie ihn über **Edit**.
2. Prüfen Sie, ob das Feld **Host** eine Adresse enthält und nicht **Not defined**.
3. Verwenden Sie den Port `5432` und testen Sie die Konnektivität:
   ```bash
   pg_isready -h <host> -p 5432
   ```
4. Prüfen Sie, ob keine ausgehende Firewall Ihres Netzwerks den Port `5432` blockiert.

### Authentifizierung abgelehnt (`password authentication failed`)

**Ursache**: falsches oder durch eine Rotation widerrufenes Passwort, oder ein Benutzer ohne Recht auf der Zieldatenbank.

**Lösung**:

1. Prüfen Sie in der Registerkarte **Users**, ob der Benutzer existiert und Zugriff auf die verwendete Datenbank hat (Spalte **Databases**).
2. Fügen Sie den Zugriff bei Bedarf über **Actions** → **Manage Access** hinzu.
3. Wenn das Passwort verloren gegangen ist oder sich geändert hat, generieren Sie über **Actions** → **Change Password** ein neues und aktualisieren Sie anschließend Ihre Anwendungen.

### Zugriff auf eine Tabelle verweigert (`permission denied`)

**Ursache**: Der Benutzer hat auf der Datenbank das Recht **Read-only** oder hat keinen Zugriff auf diese Datenbank.

**Lösung**: Weisen Sie über **Actions** → **Manage Access** das Recht **Administrator (Admin)** auf der betreffenden Datenbank zu und verbinden Sie sich anschließend erneut.

### Langsame Performance

**Ursache**: Die zugewiesenen Ressourcen reichen für die Last nicht aus, oder Abfragen sind nicht optimiert.

**Lösung**:

1. Aktivieren Sie die Erweiterung `pg_stat_statements` auf der Datenbank (**Actions** → **Manage extensions**) und ermitteln Sie die aufwendigsten Abfragen:
   ```sql
   SELECT query, calls, mean_exec_time
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```
2. Fügen Sie fehlende Indizes hinzu.
3. Wenn die Ressourcen ausgelastet sind, wechseln Sie über **Edit** zu einem größeren Preset. Siehe [Ressourcen ändern](./how-to/scale-resources.md).
4. Um PostgreSQL-Parameter anzupassen (`shared_buffers`, `work_mem`, `max_connections`), wenden Sie sich an den Support: Diese Parameter werden in der Konsole nicht angeboten.

### Disk voll

**Ursache**: Das Datenvolumen hat die **Allocated Size** erreicht.

**Lösung**: Erhöhen Sie die **Disk size (GB)** über **Edit**, im Rahmen des Speicher-Quotas des Projekts. Löschen Sie bei Bedarf veraltete Daten und führen Sie `VACUUM` aus, um Speicherplatz freizugeben.
