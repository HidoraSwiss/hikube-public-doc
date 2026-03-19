---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — NATS

### Verlorene Nachrichten (kein JetStream)

**Ursache**: JetStream ist nicht aktiviert oder es ist kein Stream konfiguriert, um die Nachrichten zu erfassen. Ohne JetStream arbeitet NATS im Fire-and-Forget-Modus: Nachrichten werden nur an zum Zeitpunkt der Veröffentlichung verbundene Abonnenten zugestellt.

**Lösung**:

1. Überprüfen Sie, ob JetStream in Ihrem Manifest aktiviert ist:
   ```yaml title="nats.yaml"
   jetstream:
     enabled: true
     size: 10Gi
   ```
2. Wenden Sie das Manifest bei Bedarf erneut an:
   ```bash
   kubectl apply -f nats.yaml
   ```
3. Erstellen Sie einen Stream, um die Nachrichten der gewünschten Subjects zu erfassen:
   ```bash
   nats stream add --subjects "orders.>" --storage file --replicas 3 --retention limits orders-stream
   ```
4. Überprüfen Sie, ob der Stream erstellt wurde und Nachrichten erfasst:
   ```bash
   nats stream info orders-stream
   ```

### Consumer empfängt keine Nachrichten

**Ursache**: Der Consumer ist auf ein Subject abonniert, das nicht dem vom Produzenten verwendeten entspricht. Häufige Fehler sind ein Tippfehler im Subject-Namen, eine falsche Verwendung von Wildcards oder eine fehlerhafte Queue-Group-Konfiguration.

**Lösung**:

1. Überprüfen Sie das genaue Subject, das vom Produzenten und Consumer verwendet wird — Subjects sind **case-sensitive**
2. Testen Sie den Empfang mit einem Diagnose-Abonnement:
   ```bash
   nats sub ">"
   ```
   Dies ermöglicht es, **alle Nachrichten** auf dem Server zu sehen
3. Überprüfen Sie die verwendeten Wildcards:
   - `orders.*` matcht **nicht** `orders.new.urgent` (verwenden Sie `orders.>` für Unterebenen)
4. Wenn Sie Queue Groups verwenden, überprüfen Sie, ob der Consumer Mitglied der erwarteten Gruppe ist und der Gruppenname identisch ist

### JetStream-Speicher voll

**Ursache**: Das JetStream-Volume hat seine maximale Kapazität erreicht (`jetstream.size`). Neue Nachrichten können nicht mehr persistiert werden und Veröffentlichungen schlagen fehl.

**Lösung**:

1. Überprüfen Sie die JetStream-Speichernutzung:
   ```bash
   nats account info
   ```
2. Identifizieren Sie die größten Streams:
   ```bash
   nats stream list
   ```
3. Löschen Sie alte Nachrichten aus Streams, die dies erlauben:
   ```bash
   nats stream purge <stream-name>
   ```
4. Überprüfen Sie die Aufbewahrungsrichtlinie der Streams — verwenden Sie `limits` mit `max-age`, um alte Nachrichten automatisch zu löschen:
   ```bash
   nats stream edit <stream-name> --max-age 72h
   ```
5. Erhöhen Sie bei Bedarf `jetstream.size` in Ihrem Manifest:
   ```yaml title="nats.yaml"
   jetstream:
     enabled: true
     size: 50Gi
   ```

### Unzureichender Arbeitsspeicher

**Ursache**: Der NATS-Server verbraucht mehr Speicher als das zugewiesene Limit, oft aufgrund einer hohen Anzahl von Verbindungen, großer Nachrichten (`max_payload` zu hoch) oder JetStream-Streams im Speicher.

**Lösung**:

1. Überprüfen Sie die Pod-Ereignisse, um einen OOMKill zu bestätigen:
   ```bash
   kubectl describe pod <pod-nats> | grep -A 5 "Last State"
   ```
2. Erhöhen Sie die NATS zugewiesenen Ressourcen:
   ```yaml title="nats.yaml"
   replicas: 3
   resources:
     cpu: 1
     memory: 2Gi
   ```
3. Überprüfen Sie den Wert von `max_payload` in `config.merge` — reduzieren Sie ihn, wenn sehr große Nachrichten nicht erforderlich sind
4. Wenden Sie das Manifest erneut an:
   ```bash
   kubectl apply -f nats.yaml
   ```

### Verbindung abgelehnt

**Ursache**: Der Client kann keine Verbindung zum NATS-Server herstellen. Dies kann an nicht gestarteten Pods, falschen Zugangsdaten oder einem externen Verbindungsversuch ohne `external: true` liegen.

**Lösung**:

1. Überprüfen Sie, ob die NATS-Pods im Status `Running` sind:
   ```bash
   kubectl get pods -l app.kubernetes.io/component=nats
   ```
2. Überprüfen Sie die Pod-Logs auf Fehler:
   ```bash
   kubectl logs <pod-nats>
   ```
3. Überprüfen Sie die Benutzerzugangsdaten im Kubernetes Secret:
   ```bash
   kubectl get tenantsecret <nats-name>-credentials -o jsonpath='{.data}' | base64 -d
   ```
4. Wenn Sie sich von außerhalb des Clusters verbinden, stellen Sie sicher, dass `external: true` konfiguriert ist:
   ```yaml title="nats.yaml"
   external: true
   ```
5. Testen Sie die Konnektivität von einem Pod innerhalb des Clusters:
   ```bash
   kubectl exec <pod-nats> -- nats-server --help 2>&1 | head -1
   ```
