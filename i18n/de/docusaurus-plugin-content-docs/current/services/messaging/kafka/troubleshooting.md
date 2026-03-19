---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — Kafka

### ZooKeeper perd le quorum

**Ursache**: le nombre de réplicas ZooKeeper est insuffisant ou pair, empêchant la formation d'un quorum majoritaire. Un quorum nécessite une majorité stricte (ex. 2/3 nœuds).

**Lösung**:

1. Vérifiez le nombre de réplicas ZooKeeper configuré :
   ```bash
   kubectl get kafka -o yaml | grep -A 5 zookeeper
   ```
2. Assurez-vous que `zookeeper.replicas` est un **nombre impair** (3, 5 ou 7)
3. Vérifiez l'état des pods ZooKeeper :
   ```bash
   kubectl get pods -l app.kubernetes.io/component=zookeeper
   ```
4. Contrôlez l'espace disque disponible sur les volumes ZooKeeper — un disque plein provoque la perte du quorum :
   ```bash
   kubectl exec <pod-zookeeper> -- df -h /data
   ```
5. Si nécessaire, augmentez `zookeeper.size` dans votre manifeste et réappliquez-le

### Topic inaccessible ou broker indisponible

**Ursache**: un ou plusieurs brokers Kafka ne fonctionnent pas correctement, ou le topic n'a pas suffisamment de réplicas synchronisées par rapport à `min.insync.replicas`.

**Lösung**:

1. Vérifiez l'état des pods Kafka :
   ```bash
   kubectl get pods -l app.kubernetes.io/component=kafka
   ```
2. Inspectez les événements d'un pod en erreur :
   ```bash
   kubectl describe pod <pod-kafka>
   ```
3. Überprüfen Sie, ob le nombre de réplicas du topic est cohérent avec le nombre de brokers disponibles :
   ```bash
   kubectl exec <pod-kafka> -- kafka-topics.sh --describe --topic <nom-topic> --bootstrap-server localhost:9092
   ```
4. Contrôlez l'espace de stockage — un volume plein empêche le broker de fonctionner :
   ```bash
   kubectl exec <pod-kafka> -- df -h /bitnami/kafka
   ```

### Consumer lag important

**Ursache**: les consumers ne traitent pas les messages assez rapidement par rapport au débit de production. Cela peut être dû à un nombre insuffisant de partitions, trop peu de consumers dans le groupe, ou des consumers sous-dimensionnés.

**Lösung**:

1. Identifiez le lag du consumer group :
   ```bash
   kubectl exec <pod-kafka> -- kafka-consumer-groups.sh --describe --group <group-id> --bootstrap-server localhost:9092
   ```
2. Si le lag est réparti sur de nombreuses partitions, **augmentez le nombre de consumers** dans le group (sans dépasser le nombre de partitions)
3. Si toutes les partitions ont du lag, envisagez d'**augmenter le nombre de partitions** du topic :
   ```yaml title="kafka.yaml"
   topics:
     - name: events
       partitions: 12
       replicas: 3
   ```
4. Überprüfen Sie, ob les consumers ont des ressources suffisantes (CPU, mémoire) pour traiter les messages

### Broker en OOMKilled

**Ursache**: le broker Kafka consomme plus de mémoire que la limite allouée. Cela se produit fréquemment avec le preset `nano` ou `micro` sous charge.

**Lösung**:

1. Vérifiez les événements du pod pour confirmer l'OOMKill :
   ```bash
   kubectl describe pod <pod-kafka> | grep -A 5 "Last State"
   ```
2. Augmentez les ressources mémoire du broker en utilisant un preset supérieur ou des ressources explicites :
   ```yaml title="kafka.yaml"
   kafka:
     replicas: 3
     resources:
       cpu: 2000m
       memory: 4Gi
     size: 20Gi
   ```
3. Réappliquez le manifeste :
   ```bash
   kubectl apply -f kafka.yaml
   ```

### Messages dupliqués

**Ursache**: par défaut, Kafka fonctionne en mode **at-least-once delivery**. En cas de retry du producteur ou de rebalancing des consumers, des messages peuvent être délivrés plusieurs fois.

**Lösung**:

1. **Côté producteur** : aktiviertz l'idempotence pour éviter les doublons lors des retries :
   ```
   enable.idempotence=true
   acks=all
   ```
2. **Côté consumer** : implémentez un mécanisme de **déduplication** basé sur un identifiant unique du message (clé, UUID, etc.)
3. Pour les cas critiques, combinez `acks=all`, `enable.idempotence=true` sur le producteur et un traitement idempotent côté consumer

:::tip
L'idempotence du producteur garantit qu'un message envoyé plusieurs fois (à cause de retries réseau) n'est écrit qu'une seule fois dans la partition. Le traitement idempotent côté consumer reste nécessaire pour couvrir les scénarios de rebalancing.
:::
