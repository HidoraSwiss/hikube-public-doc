---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — Kafka

### ZooKeeper verliert das Quorum

**Ursache**: Die Anzahl der ZooKeeper-Replikate ist unzureichend oder gerade, was die Bildung eines Mehrheitsquorums verhindert. Ein Quorum erfordert eine strikte Mehrheit (z.B. 2/3 Knoten).

**Lösung**:

1. Überprüfen Sie die konfigurierte Anzahl der ZooKeeper-Replikate:
   ```bash
   kubectl get kafka -o yaml | grep -A 5 zookeeper
   ```
2. Stellen Sie sicher, dass `zookeeper.replicas` eine **ungerade Zahl** ist (3, 5 oder 7)
3. Überprüfen Sie den Status der ZooKeeper-Pods:
   ```bash
   kubectl get pods -l app.kubernetes.io/component=zookeeper
   ```
4. Kontrollieren Sie den verfügbaren Speicherplatz auf den ZooKeeper-Volumes — eine volle Festplatte verursacht den Verlust des Quorums:
   ```bash
   kubectl exec <pod-zookeeper> -- df -h /data
   ```
5. Erhöhen Sie bei Bedarf `zookeeper.size` in Ihrem Manifest und wenden Sie es erneut an

### Topic nicht erreichbar oder Broker nicht verfügbar

**Ursache**: Ein oder mehrere Kafka-Broker funktionieren nicht korrekt, oder das Topic hat nicht genügend synchronisierte Replikate im Verhältnis zu `min.insync.replicas`.

**Lösung**:

1. Überprüfen Sie den Status der Kafka-Pods:
   ```bash
   kubectl get pods -l app.kubernetes.io/component=kafka
   ```
2. Untersuchen Sie die Ereignisse eines fehlerhaften Pods:
   ```bash
   kubectl describe pod <pod-kafka>
   ```
3. Überprüfen Sie, ob die Anzahl der Topic-Replikate mit der Anzahl der verfügbaren Broker übereinstimmt:
   ```bash
   kubectl exec <pod-kafka> -- kafka-topics.sh --describe --topic <topic-name> --bootstrap-server localhost:9092
   ```
4. Kontrollieren Sie den Speicherplatz — ein volles Volume verhindert die Funktion des Brokers:
   ```bash
   kubectl exec <pod-kafka> -- df -h /bitnami/kafka
   ```

### Hoher Consumer Lag

**Ursache**: Die Consumer verarbeiten die Nachrichten nicht schnell genug im Verhältnis zum Produktionsdurchsatz. Dies kann an einer unzureichenden Anzahl von Partitionen, zu wenigen Consumern in der Gruppe oder unterdimensionierten Consumern liegen.

**Lösung**:

1. Identifizieren Sie den Lag der Consumer Group:
   ```bash
   kubectl exec <pod-kafka> -- kafka-consumer-groups.sh --describe --group <group-id> --bootstrap-server localhost:9092
   ```
2. Wenn der Lag über viele Partitionen verteilt ist, **erhöhen Sie die Anzahl der Consumer** in der Gruppe (ohne die Anzahl der Partitionen zu überschreiten)
3. Wenn alle Partitionen Lag aufweisen, erwägen Sie eine **Erhöhung der Partitionsanzahl** des Topics:
   ```yaml title="kafka.yaml"
   topics:
     - name: events
       partitions: 12
       replicas: 3
   ```
4. Überprüfen Sie, ob die Consumer über ausreichende Ressourcen (CPU, Speicher) zur Nachrichtenverarbeitung verfügen

### Broker mit OOMKilled

**Ursache**: Der Kafka-Broker verbraucht mehr Speicher als das zugewiesene Limit. Dies tritt häufig beim Preset `nano` oder `micro` unter Last auf.

**Lösung**:

1. Überprüfen Sie die Pod-Ereignisse, um den OOMKill zu bestätigen:
   ```bash
   kubectl describe pod <pod-kafka> | grep -A 5 "Last State"
   ```
2. Erhöhen Sie die Speicherressourcen des Brokers mit einem höheren Preset oder expliziten Ressourcen:
   ```yaml title="kafka.yaml"
   kafka:
     replicas: 3
     resources:
       cpu: 2000m
       memory: 4Gi
     size: 20Gi
   ```
3. Wenden Sie das Manifest erneut an:
   ```bash
   kubectl apply -f kafka.yaml
   ```

### Doppelte Nachrichten

**Ursache**: Standardmäßig arbeitet Kafka im **At-least-once-Delivery**-Modus. Bei Produzenten-Retries oder Consumer-Rebalancing können Nachrichten mehrfach zugestellt werden.

**Lösung**:

1. **Produzentenseite**: Aktivieren Sie die Idempotenz, um Duplikate bei Retries zu vermeiden:
   ```
   enable.idempotence=true
   acks=all
   ```
2. **Consumerseite**: Implementieren Sie einen **Deduplizierungs**-Mechanismus basierend auf einer eindeutigen Nachrichten-ID (Schlüssel, UUID usw.)
3. Für kritische Fälle kombinieren Sie `acks=all`, `enable.idempotence=true` auf dem Produzenten und eine idempotente Verarbeitung auf Consumer-Seite

:::tip
Die Idempotenz des Produzenten stellt sicher, dass eine mehrfach gesendete Nachricht (aufgrund von Netzwerk-Retries) nur einmal in die Partition geschrieben wird. Die idempotente Verarbeitung auf Consumer-Seite ist weiterhin notwendig, um Rebalancing-Szenarien abzudecken.
:::
