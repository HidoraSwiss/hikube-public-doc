---
sidebar_position: 7
title: "Fehlerbehebung — Redis"
sidebar_label: Fehlerbehebung
description: "Beheben Sie häufige Redis-Probleme auf Hikube: Cluster im Fehler, Host ausstehend, Timeout, NOAUTH oder WRONGPASS, voller Speicher, ausbleibendes Failover."
---

# Fehlerbehebung — Redis

### Der Cluster bleibt im Status „Creating“

**Ursache**: Die Bereitstellung der Redis-Knoten, der Sentinels und ihrer Volumes läuft noch.

**Lösung**:

1. Warten Sie einige Minuten und aktualisieren Sie die Seite des Clusters.
2. Ändert sich der Status nach etwa fünfzehn Minuten nicht, [wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie das Projekt und den Namen des Clusters an.

### Der Cluster wechselt in den Status „Error“

**Ursache**: Die Plattform konnte die Erstellung des Clusters oder seine letzte Änderung nicht anwenden. Nach einer Änderung kann der Cluster mit seiner vorherigen Konfiguration weiterlaufen.

**Lösung**: [Wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie das Projekt, den Namen des Clusters und die angeforderte Änderung an.

### „An error occurred while updating the cluster.“ beim Speichern

**Ursache**: Die Änderung verlangt eine niedrigere Version als die aktuelle (zum Beispiel `7` auf einem Cluster mit `8`) oder eine kleinere **Volume Size (GB)** als die aktuelle. Solche Änderungen werden abgelehnt, und die Fehlermeldung gibt den von der API zurückgegebenen Grund wieder. In der API tragen diese Ablehnungen die Codes `120203` (Version) und `120204` (Volume).

**Lösung**: Behalten Sie die aktuelle oder eine höhere Version bei und eine Volume-Größe, die mindestens der aktuellen entspricht.

### Der Host zeigt „Waiting for allocation...“ an

**Ursache**: Das öffentliche Netzwerk ist deaktiviert, oder die öffentliche IP-Adresse ist noch nicht zugewiesen.

**Lösung**:

1. Öffnen Sie **Edit** und prüfen Sie die Option **External access**. Aktivieren Sie sie, wenn Sie sich aus dem Internet verbinden müssen, und klicken Sie dann auf **Save changes**.
2. Warten Sie einige Augenblicke und aktualisieren Sie die Seite des Clusters.

### Verbindungs-Timeout

**Ursache**: Die verwendete Adresse oder der Port ist falsch, der Cluster ist nicht bereit, oder eine Firewall blockiert den Port `6379`.

**Lösung**:

1. Prüfen Sie, ob der **Status** im Abschnitt **Connection** **Ready** lautet.
2. Kopieren Sie den **Host** mit der Kopier-Schaltfläche, um Tippfehler zu vermeiden.
3. Prüfen Sie, ob keine ausgehende Firewall Ihres Netzwerks den Port `6379` blockiert.

### Authentifizierung schlägt fehl (`NOAUTH` oder `WRONGPASS`)

**Ursache**: Der Client sendet kein Passwort, verwendet ein falsches Passwort oder ein durch eine Rotation widerrufenes Passwort.

**Lösung**:

1. Prüfen Sie den an den Client übergebenen Wert (`REDISCLI_AUTH`, Option `-a` oder Anwendungskonfiguration).
2. Generieren Sie im Zweifel im Abschnitt **Security** ein neues Passwort (**Rotate password**) und aktualisieren Sie Ihre Anwendungen. Siehe [Passwort erneuern](./how-to/rotate-password.md).
3. Wurde die Option **Authentication required** geändert, passen Sie die Clients entsprechend an.

### Arbeitsspeicher erschöpft (`OOM command not allowed`)

**Ursache**: Der Datenbestand übersteigt den durch das Preset zugewiesenen Arbeitsspeicher.

**Lösung**:

1. Prüfen Sie die Speichernutzung:
   ```bash
   redis-cli -h <host> -p 6379 INFO memory
   ```
2. Wechseln Sie über **Edit** zu einem größeren **Preset**. Siehe [Ressourcen ändern](./how-to/scale-resources.md).
3. Wenn Redis als Cache dient, setzen Sie Ablaufzeiten (`EXPIRE`) für Ihre Schlüssel, um das Wachstum des Datenbestands zu begrenzen.

### Das Failover findet nicht statt

**Ursache**: Der Cluster hat nur eine Replica; es kann keine Replica zum Master befördert werden.

**Lösung**: Die Anzahl der Replicas kann nach der Erstellung nicht geändert werden. Erstellen Sie einen neuen Cluster mit mindestens 2 Replicas (3 in der Produktion) und migrieren Sie Ihre Daten, oder [wenden Sie sich an den Support](mailto:support@hidora.io). Siehe [Hochverfügbarkeit konfigurieren](./how-to/configure-ha.md).
