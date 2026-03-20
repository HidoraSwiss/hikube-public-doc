---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — RabbitMQ

### Queue blockiert (Flow Control)

**Ursache**: RabbitMQ hat einen **Speicheralarm** oder **Festplattenalarm** ausgelöst und blockiert die Veröffentlichungen, um das System zu schützen. Dies tritt auf, wenn der Speicherverbrauch den Schwellenwert (High Watermark) überschreitet oder der Speicherplatz unzureichend ist.

**Lösung**:

1. Überprüfen Sie den Cluster-Status und die aktiven Alarme:
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl status | grep -A 10 "alarms"
   ```
2. Identifizieren Sie die betroffene Ressource (Speicher oder Festplatte):
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl status | grep -E "mem_|disk_"
   ```
3. Erhöhen Sie die zugewiesenen Ressourcen in Ihrem Manifest:
   ```yaml title="rabbitmq.yaml"
   replicas: 3
   resources:
     cpu: 1
     memory: 2Gi
   size: 20Gi
   ```
4. Löschen Sie bei Bedarf ungenutzte Queues:
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl purge_queue <queue-name>
   ```

### RabbitMQ-Knoten nicht dem Cluster beigetreten

**Ursache**: Ein RabbitMQ-Knoten kann dem Cluster nicht beitreten, oft aufgrund eines DNS-Auflösungsproblems, einer Inkonsistenz des Erlang-Cookies oder restriktiver Netzwerkrichtlinien.

**Lösung**:

1. Überprüfen Sie den Cluster-Status von einem funktionierenden Knoten aus:
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl cluster_status
   ```
2. Überprüfen Sie die Logs des fehlerhaften Pods:
   ```bash
   kubectl logs <pod-rabbitmq-problematisch>
   ```
3. Überprüfen Sie, ob die DNS-Auflösung zwischen den Pods funktioniert:
   ```bash
   kubectl exec <pod-rabbitmq> -- nslookup <pod-rabbitmq-problematisch>.<headless-service>
   ```
4. Wenn das Problem weiterhin besteht, löschen Sie den fehlerhaften Pod, um seine Neuerstellung zu erzwingen:
   ```bash
   kubectl delete pod <pod-rabbitmq-problematisch>
   ```

### Nachrichten nicht geroutet (Exchange falsch konfiguriert)

**Ursache**: Die veröffentlichten Nachrichten erreichen die Queues nicht, in der Regel aufgrund eines falschen Exchange-Typs, eines falschen Routing Keys oder eines fehlenden Bindings zwischen Exchange und Queue.

**Lösung**:

1. Listen Sie die vorhandenen Bindings auf, um die konfigurierten Routen zu identifizieren:
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl list_bindings -p <vhost>
   ```
2. Überprüfen Sie den Exchange-Typ und den erwarteten Routing Key:
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl list_exchanges -p <vhost>
   ```
3. Konfigurieren Sie einen **Dead Letter Exchange**, um nicht geroutete Nachrichten zu erfassen und die Diagnose zu erleichtern:
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl set_policy DLX ".*" '{"dead-letter-exchange":"dlx"}' -p <vhost>
   ```
4. Überprüfen Sie, ob der Produzent den richtigen Exchange und den richtigen Routing Key in seiner Konfiguration verwendet

### Speicher gesättigt (Memory Alarm)

**Ursache**: RabbitMQ hat den Speicherschwellenwert erreicht (**High Watermark**, standardmäßig 40% des verfügbaren Speichers). Alle Veröffentlichungen werden blockiert, bis der Speicher unter den Schwellenwert fällt.

**Lösung**:

1. Überprüfen Sie den Speicherverbrauch:
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl status | grep "mem_used"
   ```
2. Identifizieren Sie die größten Queues:
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl list_queues name messages memory -p <vhost> --formatter table
   ```
3. Erhöhen Sie den RabbitMQ zugewiesenen Speicher:
   ```yaml title="rabbitmq.yaml"
   resources:
     cpu: 1
     memory: 4Gi
   ```
4. Löschen Sie ungenutzte Queues oder Queues mit einer großen Anzahl nicht konsumierter Nachrichten

### AMQP-Verbindung abgelehnt

**Ursache**: Der Client kann keine Verbindung zum RabbitMQ-Broker herstellen. Dies kann an falschen Zugangsdaten, fehlenden Vhost-Berechtigungen oder einem Netzwerk-Erreichbarkeitsproblem liegen.

**Lösung**:

1. Überprüfen Sie die Verbindungszugangsdaten im Kubernetes Secret:
   ```bash
   kubectl get tenantsecret <rabbitmq-name>-credentials -o jsonpath='{.data}' | base64 -d
   ```
2. Überprüfen Sie, ob der Benutzer die erforderlichen Berechtigungen auf dem Vhost hat:
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmqctl list_permissions -p <vhost>
   ```
3. Testen Sie die Konnektivität zum AMQP-Port (5672):
   ```bash
   kubectl exec <pod-rabbitmq> -- rabbitmq-diagnostics check_port_connectivity
   ```
4. Wenn Sie sich von außerhalb des Clusters verbinden, stellen Sie sicher, dass `external: true` in Ihrem Manifest konfiguriert ist
