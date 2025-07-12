---
title: Kafka sur Hikube
---

# Kafka - Plateforme de streaming de données

**Kafka** sur Hikube offre une plateforme de streaming de données distribuée et haute performance. Ce service vous permet de traiter des flux de données en temps réel avec une fiabilité et une scalabilité exceptionnelles.

---

## Qu'est-ce que Kafka ?

Apache Kafka est une plateforme de streaming distribuée qui permet de publier, stocker et traiter des flux de données en temps réel. Sur Hikube, Kafka est déployé avec haute disponibilité et gestion automatique des partitions.

### Avantages sur Hikube

- **🚀 Performance** : Débit ultra-élevé (millions de messages/seconde)
- **🔒 Fiabilité** : Réplication automatique des données
- **📈 Scalabilité** : Scaling horizontal automatique
- **💾 Persistance** : Stockage persistant des messages
- **🔧 Simplicité** : Configuration déclarative
- **📊 Monitoring** : Métriques intégrées

### Cas d'usage

- **Event Streaming** : Flux d'événements en temps réel
- **Data Pipeline** : Pipelines de données ETL
- **Microservices** : Communication inter-services
- **IoT** : Données de capteurs et télématique
- **Logs** : Centralisation des logs applicatifs
- **Analytics** : Données pour l'analyse en temps réel

---

## Architecture

```
┌─────────────────────────────────────┐
│         Application Layer           │
├─────────────────────────────────────┤
│    Producer │ Consumer │ Stream     │
├─────────────────────────────────────┤
│         Kafka Cluster               │
│  Broker 1 │ Broker 2 │ Broker 3    │
├─────────────────────────────────────┤
│         Storage Layer               │
│    (Distributed Storage)            │
└─────────────────────────────────────┘
```

### Composants

- **Kafka Brokers** : Serveurs qui stockent les messages
- **ZooKeeper** : Coordination et métadonnées
- **Producers** : Applications qui publient des messages
- **Consumers** : Applications qui consomment des messages
- **Topics** : Canaux de messages organisés
- **Partitions** : Unités de parallélisme

---

## Fonctionnalités Kafka

### Concepts fondamentaux

- **Topics** : Canaux de messages nommés
- **Partitions** : Unités de parallélisme dans un topic
- **Replicas** : Copies des partitions pour la fiabilité
- **Producers** : Applications qui publient des messages
- **Consumers** : Applications qui lisent des messages
- **Consumer Groups** : Groupes de consumers qui partagent la charge

### Fonctionnalités avancées

- **Exactly Once Semantics** : Garantie de traitement unique
- **Stream Processing** : Traitement de flux avec KSQL
- **Schema Registry** : Gestion des schémas de données
- **Connect** : Connecteurs pour systèmes externes
- **Security** : Authentification et autorisation
- **Monitoring** : Métriques détaillées

---

## Comparaison avec d'autres solutions

| Fonctionnalité | Kafka Hikube | AWS MSK | GCP Pub/Sub | Azure Event Hubs |
|----------------|---------------|---------|-------------|------------------|
| **Performance** | ⚡ Ultra-élevée | ⚡ Élevée | ⚡ Élevée | ⚡ Élevée |
| **Setup** | ⚡ Instantané | ⚡ Instantané | ⚡ Instantané | ⚡ Instantané |
| **Coût** | 💰 Prévisible | 💰 Variable | 💰 Variable | 💰 Variable |
| **K8s Integration** | ✅ Native | ⚠️ Partielle | ⚠️ Partielle | ⚠️ Partielle |
| **Stream Processing** | ✅ KSQL | ✅ KSQL | ⚠️ Limité | ⚠️ Limité |
| **Schema Registry** | ✅ Intégré | ✅ Intégré | ⚠️ Partiel | ⚠️ Partiel |

---

## Intégration avec l'écosystème Hikube

### Kubernetes

Kafka s'intègre parfaitement avec Kubernetes :

- **Custom Resources** : Définition déclarative
- **Operators** : Gestion automatique
- **Services** : Découverte de service automatique
- **Secrets** : Gestion sécurisée des credentials
- **ConfigMaps** : Configuration centralisée

### Applications

Intégration avec les autres services Hikube :

- **ClickHouse** : Ingestion de données analytiques
- **PostgreSQL** : CDC (Change Data Capture)
- **Redis** : Cache de messages
- **Monitoring** : Métriques et alertes

---

## Exemples d'usage

### Producer simple

```text
from kafka import KafkaProducer
import json

# Configuration du producer
producer = KafkaProducer(
    bootstrap_servers=['kafka-mon-app.default.svc.cluster.local:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    key_serializer=lambda k: k.encode('utf-8') if k else None
)

# Publier des messages
# Exemple de fonction send_event(event_type, data):
message = {
    'event_type': 'user_login',
    'data': {'user_id': 123, 'ip': '192.168.1.1'},
    'timestamp': datetime.now().isoformat()
}

producer.send('events', key='user_login', value=message)
producer.flush()

# Exemples d'utilisation
# send_event('user_login', {'user_id': 123, 'ip': '192.168.1.1'})
# send_event('purchase', {'user_id': 123, 'amount': 99.99, 'product': 'premium'})
# send_event('page_view', {'user_id': 456, 'page': '/home', 'session_id': 'sess_1'})
```

### Consumer simple

```text
from kafka import KafkaConsumer
import json

# Configuration du consumer
consumer = KafkaConsumer(
    'events',
    bootstrap_servers=['kafka-mon-app.default.svc.cluster.local:9092'],
    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
    key_deserializer=lambda k: k.decode('utf-8') if k else None,
    group_id='event-processor',
    auto_offset_reset='earliest'
)

# Traiter les messages
for message in consumer:
    event = message.value
    event_type = message.key
    
    print(f"Received {event_type} event: {event}")
    
    # Traitement selon le type d'événement
    if event_type == 'user_login':
        # process_login(event['data'])
        print("Processing login event")
    elif event_type == 'purchase':
        # process_purchase(event['data'])
        print("Processing purchase event")
    elif event_type == 'page_view':
        # process_page_view(event['data'])
        print("Processing page view event")
```

### Stream Processing avec KSQL

```sql
-- Créer un stream depuis un topic
CREATE STREAM user_events (
    user_id BIGINT,
    event_type VARCHAR,
    data VARCHAR,
    timestamp VARCHAR
) WITH (
    kafka_topic='events',
    value_format='JSON'
);

-- Filtrer les événements de connexion
CREATE STREAM login_events AS
SELECT user_id, data, timestamp
FROM user_events
WHERE event_type = 'user_login';

-- Agrégation par utilisateur
CREATE TABLE user_activity AS
SELECT 
    user_id,
    COUNT(*) as event_count,
    COLLECT_LIST(event_type) as event_types,
    MAX(timestamp) as last_activity
FROM user_events
GROUP BY user_id;

-- Détection d'activité suspecte
CREATE STREAM suspicious_activity AS
SELECT 
    user_id,
    COUNT(*) as login_count,
    WINDOWEND as window_end
FROM login_events
WINDOW TUMBLING (SIZE 1 HOUR)
GROUP BY user_id
HAVING COUNT(*) > 10;
```

### Schema Registry

```text
from confluent_kafka import avro
from confluent_kafka.avro import AvroProducer, AvroConsumer
from confluent_kafka.avro.serializer import SerializerError

# Configuration avec Schema Registry
producer_config = {
    'bootstrap.servers': 'kafka-mon-app.default.svc.cluster.local:9092',
    'schema.registry.url': 'http://kafka-mon-app.default.svc.cluster.local:8081'
}

# Schéma Avro pour les événements
event_schema = {
    "type": "record",
    "name": "Event",
    "fields": [
        {"name": "user_id", "type": "long"},
        {"name": "event_type", "type": "string"},
        {"name": "data", "type": "string"},
        {"name": "timestamp", "type": "string"}
    ]
}

# Producer avec schéma
producer = AvroProducer(producer_config, default_value_schema=event_schema)

# Publier un message avec schéma
event = {
    'user_id': 123,
    'event_type': 'purchase',
    'data': '{"amount": 99.99, "product": "premium"}',
    'timestamp': '2024-01-15T10:30:00Z'
}

producer.produce(topic='events', value=event)
producer.flush()
```

### Connect pour PostgreSQL

```yaml
# Configuration du connecteur PostgreSQL
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaConnector
metadata:
  name: postgres-source
  labels:
    strimzi.io/cluster: kafka-mon-app
spec:
  class: io.confluent.connect.jdbc.JdbcSourceConnector
  tasksMax: 1
  config:
    connection.url: jdbc:postgresql://postgres-mon-app.default.svc.cluster.local:5432/monapp
    connection.user: admin
    connection.password: mon-mot-de-passe-securise
    topic.prefix: postgres-
    mode: incrementing
    incrementing.column.name: id
    table.whitelist: users,orders,products
    poll.interval.ms: 5000
```

### Consumer Group avec répartition

```text
from kafka import KafkaConsumer
import json
import threading

# Exemple de classe EventProcessor:
# class EventProcessor:
#     def __init__(self, consumer_id):
#         self.consumer_id = consumer_id
#         self.consumer = KafkaConsumer(
#             'events',
#             bootstrap_servers=['kafka-mon-app.default.svc.cluster.local:9092'],
#             value_deserializer=lambda m: json.loads(m.decode('utf-8')),
#             group_id='event-processors',
#             auto_offset_reset='earliest'
#         )
#     
#     def process_messages(self):
#         print(f"Consumer {self.consumer_id} started")
#         
#         for message in self.consumer:
#             event = message.value
#             partition = message.partition
#             offset = message.offset
#             
#             print(f"Consumer {self.consumer_id} - Partition {partition} - Offset {offset}: {event}")
#             
#             # Traitement du message
#             self.process_event(event)
#     
#     def process_event(self, event):
#         # Logique de traitement spécifique
#         if event['event_type'] == 'purchase':
#             self.process_purchase(event)
#         elif event['event_type'] == 'user_login':
#             self.process_login(event)
#     
#     def process_purchase(self, event):
#         # Traitement des achats
#         print(f"Processing purchase: {event['data']}")
#     
#     def process_login(self, event):
#         # Traitement des connexions
#         print(f"Processing login: {event['data']}")

# Démarrer plusieurs consumers
consumers = []
for i in range(3):
    consumer = EventProcessor(f"consumer-{i}")
    thread = threading.Thread(target=consumer.process_messages)
    thread.start()
    consumers.append(consumer)
```

### Monitoring et métriques

```text
from kafka.admin import KafkaAdminClient, ConfigResource, ConfigResourceType
from kafka import KafkaConsumer
import json

# Client admin pour la gestion
admin_client = KafkaAdminClient(
    bootstrap_servers=['kafka-mon-app.default.svc.cluster.local:9092']
)

# Exemple d'obtention des informations sur les topics:
# def get_topic_info():
#     topics = admin_client.list_topics()
#     for topic in topics:
#         if not topic.startswith('__'):
#             print(f"Topic: {topic}")
#             
#             # Obtenir les partitions
#             partitions = admin_client.get_partition_metadata(topic)
#             print(f"  Partitions: {len(partitions)}")
#             
#             # Obtenir la configuration
#             config = admin_client.describe_configs([
#                 ConfigResource(ConfigResourceType.TOPIC, topic)
#             ])
#             print(f"  Config: {config}")

# Exemple de consumer pour les métriques:
# def monitor_consumer_lag():
#     consumer = KafkaConsumer(
#         group_id='monitoring',
#         bootstrap_servers=['kafka-mon-app.default.svc.cluster.local:9092'],
#         enable_auto_commit=False
#     )
#     
#     # Obtenir les métriques de lag
#     for topic in consumer.topics():
#         partitions = consumer.partitions_for_topic(topic)
#         for partition in partitions:
#             tp = TopicPartition(topic, partition)
#             beginning = consumer.beginning_offsets([tp])[tp]
#             end = consumer.end_offsets([tp])[tp]
#             
#             consumer.assign([tp])
#             current = consumer.position([tp])[tp]
#             
#             lag = end - current
#             print(f"Topic: {topic}, Partition: {partition}, Lag: {lag}")

# Exemple de monitoring des performances:
# def monitor_producer_performance():
#     from kafka import KafkaProducer
#     import time
#     
#     producer = KafkaProducer(
#         bootstrap_servers=['kafka-mon-app.default.svc.cluster.local:9092'],
#         value_serializer=lambda v: json.dumps(v).encode('utf-8')
#     )
#     
#     start_time = time.time()
#     messages_sent = 0
#     
#     for i in range(10000):
#         producer.send('test-topic', value={'message_id': i, 'data': f'Message {i}'})
#         messages_sent += 1
#         
#         if i % 1000 == 0:
#             elapsed = time.time() - start_time
#             rate = messages_sent / elapsed
#             print(f"Messages sent: {messages_sent}, Rate: {rate:.2f} msg/s")
#     
#     producer.flush()
#     total_time = time.time() - start_time
#     print(f"Total time: {total_time:.2f}s, Average rate: {messages_sent/total_time:.2f} msg/s")
```

---

## Prochaines étapes

1. **[Démarrage rapide](quick-start.md)** : Déployez Kafka en 5 minutes
2. **[Référence API](api-reference.md)** : Tous les paramètres disponibles
3. **[Tutoriels](tutorials/)** : Guides avancés
4. **[Dépannage](troubleshooting.md)** : Solutions aux problèmes courants
5. **[Connect](connect/)** : Connecteurs pour systèmes externes
6. **[KSQL](ksql/)** : Stream processing avec KSQL 