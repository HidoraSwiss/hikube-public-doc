---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — ClickHouse

### ClickHouse Keeper instabil (gerade Anzahl von Replikas)

**Ursache**: Die Anzahl der ClickHouse-Keeper-Replikas ist gerade (2, 4, etc.), was die Aufrechterhaltung des Quorums verhindert. Das Raft-Protokoll erfordert eine strikte Mehrheit zur Wahl eines Leaders, und eine gerade Anzahl von Knoten garantiert diese Mehrheit bei einer Netzwerkpartition nicht.

**Lösung**:

1. Überprüfen Sie die aktuelle Anzahl der Keeper-Replikas:
   ```bash
   kubectl get pods -l app=clickhouse-keeper-<name>
   ```
2. Ändern Sie die Replikaanzahl auf eine **ungerade** Zahl (3 oder 5):
   ```yaml title="clickhouse.yaml"
   spec:
     clickhouseKeeper:
       enabled: true
       replicas: 3    # Immer ungerade
   ```
3. Wenden Sie die Änderung an:
   ```bash
   kubectl apply -f clickhouse.yaml
   ```
4. Überprüfen Sie die Keeper-Logs, um zu bestätigen, dass das Quorum wiederhergestellt ist:
   ```bash
   kubectl logs -l app=clickhouse-keeper-<name>
   ```

### Langsame Abfragen bei großen Volumen

**Ursache**: Die Sharding-Konfiguration ist nicht optimal, die Tabellen verwenden nicht die richtigen Engines, oder die zugewiesenen Ressourcen sind unzureichend.

**Lösung**:

1. Überprüfen Sie, dass Sie **Distributed**-Tabellen verwenden, um Abfragen auf alle Shards zu verteilen.
2. Stellen Sie sicher, dass die lokalen Tabellen die `ReplicatedMergeTree`-Engine mit einem an Ihre häufigsten Abfragen angepassten `ORDER BY` verwenden.
3. Erhöhen Sie die Anzahl der Shards, um die Last zu verteilen:
   ```yaml title="clickhouse.yaml"
   spec:
     shards: 4    # Anzahl der Shards erhöhen
   ```
4. Überprüfen Sie die zugewiesenen Ressourcen und erhöhen Sie sie bei Bedarf:
   ```bash
   kubectl top pod -l app=clickhouse-<name>
   ```
5. Analysieren Sie langsame Abfragen über das System-`query_log`:
   ```sql
   SELECT query, elapsed, read_rows, memory_usage
   FROM system.query_log
   WHERE type = 'QueryFinish'
   ORDER BY elapsed DESC
   LIMIT 10;
   ```

### Unzureichender Festplattenplatz

**Ursache**: Das Datenvolumen überschreitet die PVC-Größe, oder die Systemlogs (`query_log`, `query_thread_log`) akkumulieren zu viele Daten.

**Lösung**:

1. Erhöhen Sie die Größe des Datenvolumes:
   ```yaml title="clickhouse.yaml"
   spec:
     size: 50Gi    # Vom aktuellen Wert erhöhen
   ```
2. Überprüfen Sie auch die Größe des Log-Volumes und passen Sie sie bei Bedarf an:
   ```yaml title="clickhouse.yaml"
   spec:
     logStorageSize: 5Gi    # Erhöhen wenn Logs gesättigt sind
   ```
3. Reduzieren Sie die Aufbewahrungsdauer der Systemlogs über `logTTL`:
   ```yaml title="clickhouse.yaml"
   spec:
     logTTL: 7    # Z.B. von 15 auf 7 Tage reduzieren
   ```
4. Überprüfen Sie die Aufbewahrungsrichtlinien Ihrer Anwendungsdaten und löschen Sie veraltete Partitionen.

### ClickHouse-Pod im Status Pending

**Ursache**: Der PersistentVolumeClaim (PVC) kann sich nicht an ein Volume binden, meist wegen einer nicht existierenden `storageClass` oder eines überschrittenen Ressourcenkontingents.

**Lösung**:

1. Überprüfen Sie den Status des Pods und die zugehörigen Events:
   ```bash
   kubectl describe pod clickhouse-<name>-0-0
   ```
2. Überprüfen Sie den Status der PVCs:
   ```bash
   kubectl get pvc -l app=clickhouse-<name>
   ```
3. Überprüfen Sie, dass die verwendete `storageClass` eine der verfügbaren Klassen ist: `local`, `replicated` oder `replicated-async`.
4. Überprüfen Sie, dass die Ressourcenkontingente (CPU, Speicher, Storage) nicht erreicht sind.
5. Korrigieren Sie die Konfiguration in Ihrem Manifest und wenden Sie sie erneut an:
   ```bash
   kubectl apply -f clickhouse.yaml
   ```

### Inter-Shard-Replikation fehlgeschlagen

**Ursache**: ClickHouse Keeper ist nicht funktionsfähig, das Netzwerk zwischen den Pods ist instabil, oder die Replikakonfiguration pro Shard ist fehlerhaft.

**Lösung**:

1. Überprüfen Sie, dass ClickHouse Keeper funktioniert:
   ```bash
   kubectl get pods -l app=clickhouse-keeper-<name>
   ```
2. Konsultieren Sie die Keeper-Logs, um Fehler zu identifizieren:
   ```bash
   kubectl logs -l app=clickhouse-keeper-<name>
   ```
3. Überprüfen Sie die Netzwerkverbindung zwischen den ClickHouse-Pods:
   ```bash
   kubectl exec clickhouse-<name>-0-0 -- clickhouse-client --query "SELECT * FROM system.clusters"
   ```
4. Stellen Sie sicher, dass die Replika-Konfiguration konsistent ist:
   ```yaml title="clickhouse.yaml"
   spec:
     shards: 2
     replicas: 3    # Jeder Shard muss die gleiche Anzahl von Replikas haben
     clickhouseKeeper:
       enabled: true
       replicas: 3
   ```
5. Wenn Keeper instabil ist, starten Sie die Keeper-Pods neu und warten Sie auf die Stabilisierung des Quorums.
