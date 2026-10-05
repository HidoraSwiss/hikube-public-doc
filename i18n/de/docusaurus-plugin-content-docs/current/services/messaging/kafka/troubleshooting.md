---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — Kafka

:::info Verfügbarkeit
Kafka ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht als Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

Die folgenden Diagnosen führen Sie mit Ihren Kafka-Client-Werkzeugen durch. Wenn auf Seiten der Plattform eine Aktion erforderlich ist (Ressourcen, Speicher, Neustart, Server-Logs), [wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie das Projekt und den Namen der Instanz an.

### Keine Verbindung zum Cluster möglich

**Ursache**: falsche Adresse oder falscher Port der Bootstrap-Server, externer Zugriff nicht aktiviert, obwohl sich der Client außerhalb der Plattform befindet, oder fehlende clientseitige Sicherheitsparameter.

**Lösung**:

1. Prüfen Sie, dass Sie die vom Support mitgeteilte Adresse verwenden.
2. Fragen Sie die Metadaten des Clusters ab:
   ```bash
   kcat -b <bootstrap-servers> -L
   ```
3. Schlägt der Befehl von außerhalb der Plattform fehl, klären Sie mit dem Support, ob der externe Zugriff für die Instanz aktiviert ist.

### ZooKeeper verliert das Quorum

**Ursache**: Die Anzahl der ZooKeeper-Instanzen ist unzureichend oder gerade, oder ein ZooKeeper-Volume ist voll. Ein Quorum erfordert eine strikte Mehrheit (z. B. 2 von 3 Knoten).

**Lösung**: Diese Diagnose und ihre Behebung (ungerade Anzahl von Instanzen, Erhöhung des ZooKeeper-Speichers) erfolgen auf Seiten der Plattform. Wenden Sie sich an den Support.

### Topic nicht erreichbar oder Broker nicht verfügbar

**Ursache**: Ein oder mehrere Broker funktionieren nicht ordnungsgemäß, oder der Topic hat im Verhältnis zu `min.insync.replicas` nicht genügend synchronisierte Replicas.

**Lösung**:

1. Lassen Sie sich den Topic von Ihrem Client aus beschreiben, um die Leader und die ISR (In-Sync Replicas) zu prüfen:
   ```bash
   kafka-topics.sh --describe --topic <topic-name> --bootstrap-server <bootstrap-servers>
   ```
2. Prüfen Sie, ob die Anzahl der Replicas des Topics zur Anzahl der Broker passt.
3. Wenn Partitionen keinen Leader haben oder Broker fehlen, wenden Sie sich an den Support (Zustand der Broker, Speicherplatz).

### Hoher Consumer-Lag

**Ursache**: Die Consumer verarbeiten die Nachrichten im Verhältnis zum Produktionsdurchsatz nicht schnell genug. Das kann an einer unzureichenden Anzahl von Partitionen, zu wenigen Consumern in der Gruppe oder unterdimensionierten Consumern liegen.

**Lösung**:

1. Messen Sie den Lag der Consumer Group:
   ```bash
   kafka-consumer-groups.sh --describe --group <group-id> --bootstrap-server <bootstrap-servers>
   ```
2. Verteilt sich der Lag auf viele Partitionen, **erhöhen Sie die Anzahl der Consumer** in der Gruppe (ohne die Anzahl der Partitionen zu überschreiten).
3. Haben alle Partitionen Lag, ziehen Sie in Betracht, **die Anzahl der Partitionen** des Topics **zu erhöhen**. Diese Option wird in der Konsole nicht angeboten; wenden Sie sich an den Support.
4. Prüfen Sie, ob Ihre Consumer über ausreichende Ressourcen (CPU, Arbeitsspeicher) verfügen, um die Nachrichten zu verarbeiten.

### Broker wegen Speichermangels neu gestartet

**Ursache**: Der Broker verbraucht mehr Arbeitsspeicher als das zugewiesene Limit. Das tritt häufig mit den Presets `nano` oder `micro` unter Last auf.

**Lösung**: Fordern Sie ein größeres Preset oder explizite Ressourcen für die Broker an. Diese Option wird in der Konsole nicht angeboten; wenden Sie sich an den Support.

### Doppelte Nachrichten

**Ursache**: Standardmäßig arbeitet Kafka im Modus **at-least-once delivery**. Bei Wiederholungsversuchen (Retries) des Producers oder beim Rebalancing der Consumer können Nachrichten mehrfach zugestellt werden.

**Lösung**:

1. **Auf der Producer-Seite**: Aktivieren Sie die Idempotenz, um Duplikate bei Retries zu vermeiden:
   ```properties title="producer.properties"
   enable.idempotence=true
   acks=all
   ```
2. **Auf der Consumer-Seite**: Implementieren Sie einen **Deduplizierungsmechanismus** auf Basis einer eindeutigen Kennung der Nachricht (Schlüssel, UUID usw.).
3. Kombinieren Sie in kritischen Fällen `acks=all` und `enable.idempotence=true` auf dem Producer mit einer idempotenten Verarbeitung auf der Consumer-Seite.

:::tip
Die Idempotenz des Producers garantiert, dass eine mehrfach gesendete Nachricht (aufgrund von Netzwerk-Retries) nur einmal in die Partition geschrieben wird. Eine idempotente Verarbeitung auf der Consumer-Seite bleibt erforderlich, um Rebalancing-Szenarien abzudecken.
:::
