---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — RabbitMQ

### Der Cluster bleibt im Status „Creating“ oder wechselt zu „Error“

**Ursache**: Die Bereitstellung läuft noch oder ist fehlgeschlagen (zum Beispiel mangels verfügbarer Ressourcen).

**Lösung**:

1. Warten Sie einige Minuten: Detailseite und Liste werden automatisch aktualisiert.
2. Bleibt der Status ungewöhnlich lange **Creating** oder wechselt er zu **Error** / **Failed**, [wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie den Namen des Projekts, den Namen des Clusters und seine Kennung an (unter dem Namen des Clusters angezeigt, mit einer Kopierschaltfläche).

### „Storage quota exceeded for this project“ im Assistenten

**Ursache**: Die Disk-Größe multipliziert mit der Anzahl der Replicas übersteigt den verbleibenden Speicher der Projekt-Quota.

**Lösung**:

1. Verringern Sie **Disk size (GB)** oder **Number of replicas**.
2. Geben Sie bei Bedarf Speicher im Projekt frei oder lassen Sie die Quota des Projekts erhöhen.

### „A cluster with this name already exists.“

**Ursache**: Ein RabbitMQ-Cluster des Projekts trägt bereits diesen Namen.

**Lösung**: Kehren Sie zum Schritt **General** zurück und wählen Sie einen anderen **Cluster Name**.

### Das Feld „Host“ zeigt „Not available / Creating“ an

**Ursache**: Die öffentliche Adresse ist noch nicht zugewiesen oder der **External Access** ist deaktiviert.

**Lösung**:

1. Prüfen Sie im Abschnitt **Connection**, ob **External Access** den Wert **Enabled** anzeigt. Falls nicht, aktivieren Sie ihn (siehe [Externen Zugriff konfigurieren](./how-to/configure-external-access.md)).
2. Wenn der externe Zugriff aktiviert ist, warten Sie und laden Sie die Seite anschließend neu.

### AMQP-Verbindung abgelehnt (`ACCESS_REFUSED`)

**Ursache**: falsche Zugangsdaten oder der Benutzer hat keine Rechte auf dem angeforderten VHost.

**Lösung**:

1. Prüfen Sie in der Tabelle **Users** (Spalte **VHosts**), ob der Benutzer ein Recht auf dem vom Client verwendeten VHost hat.
2. Fügen Sie den Zugriff bei Bedarf über **Manage Access** hinzu.
3. Wenn das Passwort verloren gegangen oder zweifelhaft ist, generieren Sie mit **Change Password** ein neues und aktualisieren Sie den Client.
4. Prüfen Sie, ob der Client den richtigen VHost angibt (exakter Name, Groß- und Kleinschreibung beachten).

### Verbindung nicht möglich (Timeout, Verbindung abgelehnt)

**Ursache**: externer Zugriff deaktiviert, falsche Adresse oder falscher Port oder Netzwerkfilterung auf Client-Seite.

**Lösung**:

1. Prüfen Sie den **Host** und den Status des **External Access** im Abschnitt **Connection**.
2. Verwenden Sie den Port **5672**.
3. Testen Sie von der Client-Maschine aus, ob der Port offen ist:
   ```bash
   nc -zv <host> 5672
   ```
4. Prüfen Sie, ob Ihr Netzwerk oder Ihre lokale Firewall ausgehende Verbindungen zu diesem Port zulässt.

### Blockierte Veröffentlichungen (Flow Control, Speicher- oder Disk-Alarm)

**Ursache**: RabbitMQ blockiert Veröffentlichungen, wenn der Schwellenwert für den Arbeitsspeicher (High Watermark) erreicht wird oder der Speicherplatz auf der Disk nicht ausreicht, um den Broker zu schützen. Die Clients erhalten dann eine Benachrichtigung `connection.blocked`.

**Lösung**:

1. Prüfen Sie auf Anwendungsseite, ob die Consumer mit den Producern Schritt halten, und leeren Sie Queues, in denen sich nicht konsumierte Nachrichten ansammeln.
2. Erhöhen Sie **Disk size (GB)** über **Edit**, wenn der Alarm die Disk betrifft (siehe [Die Konfiguration eines Clusters ändern](./how-to/scale-resources.md)).
3. Das Preset (Arbeitsspeicher) ist nach der Erstellung nicht änderbar: Erstellen Sie einen Cluster mit einem größeren Preset oder [wenden Sie sich an den Support](mailto:support@hidora.io).

### Nicht geroutete Nachrichten

**Ursache**: Der Producer veröffentlicht an einen Exchange ohne passendes Binding (falscher Exchange-Typ, falscher Routing Key, fehlendes Binding). Die Nachricht wird dann verworfen.

**Lösung**:

1. Prüfen Sie im Code des Producers den Namen des Exchanges und den Routing Key.
2. Prüfen Sie, ob der Consumer das Binding zwischen Queue und Exchange deklariert.
3. Veröffentlichen Sie mit dem Flag `mandatory`, um über nicht geroutete Nachrichten benachrichtigt zu werden, oder deklarieren Sie einen *Alternate Exchange*, um sie aufzufangen.

### Das Löschen des Clusters schlägt fehl

**Ursache**: Ein Konflikt verhindert das Löschen („Cannot delete this cluster (conflict).“) oder der Dienst ist vorübergehend nicht verfügbar.

**Lösung**: Versuchen Sie es einige Minuten später erneut. Besteht der Fehler weiterhin, [wenden Sie sich an den Support](mailto:support@hidora.io).
