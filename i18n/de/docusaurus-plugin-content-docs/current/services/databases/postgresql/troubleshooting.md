---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — PostgreSQL

### PostgreSQL-Pod im Status Pending

**Ursache**: Der PersistentVolumeClaim (PVC) kann sich nicht an ein Volume binden. Dies kann an einer nicht existierenden `storageClass`, einem überschrittenen Speicherkontingent oder fehlenden Ressourcen auf den Knoten liegen.

**Lösung**:

1. Überprüfen Sie den Status des Pods und die zugehörigen Events:
   ```bash
   kubectl describe pod pg-<name>-1
   ```
2. Überprüfen Sie den Status des PVC:
   ```bash
   kubectl get pvc
   kubectl describe pvc pg-<name>-1
   ```
3. Überprüfen Sie, dass die verwendete `storageClass` eine der verfügbaren Klassen ist: `local`, `replicated` oder `replicated-async`.
4. Überprüfen Sie, dass Ihr Speicherkontingent nicht erreicht ist.
5. Korrigieren Sie bei Bedarf die `storageClass` in Ihrem Manifest und wenden Sie es erneut an:
   ```bash
   kubectl apply -f postgresql.yaml
   ```

### Desynchronisierte Replikation zwischen Primary und Standby

**Ursache**: Eine Replikationsverzögerung (Lag) kann durch hohe Netzwerklast, unzureichende Ressourcen auf den Standbys oder ein hohes Transaktionsvolumen auf dem Primary verursacht werden.

**Lösung**:

1. Verbinden Sie sich mit dem Primary und überprüfen Sie den Replikationsstatus:
   ```sql
   SELECT client_addr, state, sent_lsn, write_lsn, flush_lsn, replay_lsn
   FROM pg_stat_replication;
   ```
2. Vergleichen Sie die LSN-Positionen zwischen `sent_lsn` und `replay_lsn`. Ein großer Unterschied deutet auf einen Lag hin.
3. Überprüfen Sie die den Standbys zugewiesenen Ressourcen (CPU, Speicher). Erhöhen Sie bei Bedarf den `resourcesPreset` oder die expliziten `resources`.
4. Überprüfen Sie die Netzwerkverbindung zwischen den Pods:
   ```bash
   kubectl logs pg-<name>-2
   ```
5. Wenn der Lag bestehen bleibt, erwägen Sie, die Schreiblast auf dem Primary zu reduzieren oder die Ressourcen zu erhöhen.

### Verbindung zu PostgreSQL verweigert

**Ursache**: Die Pods laufen nicht, der Secret-Name ist falsch oder der Service ist nicht erreichbar.

**Lösung**:

1. Überprüfen Sie, dass die PostgreSQL-Pods den Status `Running` haben:
   ```bash
   kubectl get pods -l app=pg-<name>
   ```
2. Überprüfen Sie, dass der Service existiert und auf die richtigen Endpoints zeigt:
   ```bash
   kubectl get svc pg-<name>-rw
   kubectl get endpoints pg-<name>-rw
   ```
3. Stellen Sie sicher, dass Sie den richtigen Secret-Namen für die Anmeldedaten verwenden. Das Muster ist `pg-<name>-app`:
   ```bash
   kubectl get tenantsecret pg-<name>-app
   ```
4. Testen Sie die Verbindung von einem Pod im selben Namespace:
   ```bash
   kubectl run test-pg --rm -it --image=postgres:16 -- psql -h pg-<name>-rw -p 5432 -U <user>
   ```

### PITR-Wiederherstellung fehlgeschlagen

**Ursache**: Die Bootstrap-Parameter sind falsch konfiguriert. Das Feld `bootstrap.oldName` muss genau dem Namen der Ursprungsinstanz entsprechen, und der Name der neuen Instanz muss anders sein.

**Lösung**:

1. Überprüfen Sie, dass `bootstrap.oldName` genau dem Namen der ursprünglichen PostgreSQL-Instanz entspricht:
   ```yaml title="postgresql-restore.yaml"
   apiVersion: apps.cozystack.io/v1alpha1
   kind: Postgres
   metadata:
     name: restored-db       # Muss ein neuer Name sein
   spec:
     bootstrap:
       enabled: true
       oldName: "original-db"  # Genauer Name der alten Instanz
       recoveryTime: "2025-06-15T14:30:00Z"  # Format RFC 3339
   ```
2. Der `recoveryTime` muss im Format **RFC 3339** sein (z.B.: `2025-06-15T14:30:00Z`). Wenn leer gelassen, wird zum letzten verfügbaren Zustand wiederhergestellt.
3. Der Name in `metadata.name` muss **anders** als `bootstrap.oldName` sein.
4. Stellen Sie sicher, dass die Sicherungen der Ursprungsinstanz im S3-Speicher noch zugänglich sind.

### Langsame Leistung

**Ursache**: Die PostgreSQL-Parameter sind nicht an die Arbeitslast angepasst, oder die zugewiesenen Ressourcen sind unzureichend.

**Lösung**:

1. Passen Sie die PostgreSQL-Parameter in Ihrem Manifest an:
   ```yaml title="postgresql.yaml"
   spec:
     postgresql:
       parameters:
         shared_buffers: 512MB       # ~25% des zugewiesenen RAM
         work_mem: 64MB              # Speicher pro Sortiervorgang
         max_connections: 200        # An die Last anpassen
         effective_cache_size: 1536MB  # ~75% des RAM
   ```
2. Überprüfen Sie, dass der `resourcesPreset` für Ihre Last geeignet ist:
   - Entwicklung: `nano` oder `micro`
   - Produktion: `medium`, `large` oder höher
3. Überwachen Sie die Ressourcennutzung:
   ```bash
   kubectl top pod pg-<name>-1
   ```
4. Wenn Abfragen langsam sind, identifizieren Sie sie mit `pg_stat_statements` und optimieren Sie die Indizes.
5. Erhöhen Sie die Ressourcen bei Bedarf, indem Sie zu einem höheren Preset wechseln oder explizite `resources` definieren.
