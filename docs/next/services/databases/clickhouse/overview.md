---
title: ClickHouse sur Hikube
---

# ClickHouse - Base de données analytique

**ClickHouse** sur Hikube offre une base de données analytique haute performance pour l'analyse de données en temps réel. Ce service vous permet d'analyser de grandes quantités de données avec des requêtes SQL ultra-rapides.

---

## Qu'est-ce que ClickHouse ?

ClickHouse est une base de données analytique open-source développée par Yandex, optimisée pour les requêtes OLAP (Online Analytical Processing). Elle excelle dans l'analyse de grandes quantités de données avec des performances exceptionnelles.

### Avantages sur Hikube

- **🚀 Performance** : Requêtes analytiques ultra-rapides
- **📊 Analytics** : Optimisé pour l'analyse de données
- **📈 Scalabilité** : Cluster distribué automatique
- **💾 Compression** : Stockage très efficace
- **🔧 Simplicité** : Configuration déclarative
- **📊 Monitoring** : Métriques intégrées

### Cas d'usage

- **Analytics** : Analyse de données en temps réel
- **Logs** : Analyse de logs applicatifs
- **IoT** : Données de capteurs et télématique
- **E-commerce** : Analytics de ventes
- **Monitoring** : Métriques système et applicatives
- **Business Intelligence** : Tableaux de bord

---

## Architecture

```
┌─────────────────────────────────────┐
│         Application Layer           │
├─────────────────────────────────────┤
│         ClickHouse Client           │
├─────────────────────────────────────┤
│  Coordinator │ Shard 1 │ Shard 2    │
├─────────────────────────────────────┤
│         Storage Layer               │
│    (Distributed Storage)            │
└─────────────────────────────────────┘
```

### Composants

- **ClickHouse Coordinator** : Coordination des requêtes
- **ClickHouse Shards** : Nœuds de données distribués
- **ZooKeeper** : Coordination et métadonnées
- **Storage** : Stockage distribué haute performance
- **Client** : Connexions depuis les applications

---

## Fonctionnalités ClickHouse

### Moteurs de stockage

- **MergeTree** : Moteur principal pour données ordonnées
- **ReplacingMergeTree** : Déduplication automatique
- **SummingMergeTree** : Agrégation automatique
- **AggregatingMergeTree** : Agrégations pré-calculées
- **CollapsingMergeTree** : Gestion des changements
- **VersionedCollapsingMergeTree** : Versions des changements

### Fonctionnalités avancées

- **Columnar Storage** : Stockage orienté colonnes
- **Vectorized Processing** : Traitement vectorisé
- **Compression** : Compression automatique des données
- **Materialized Views** : Vues matérialisées
- **Window Functions** : Fonctions de fenêtre
- **User-Defined Functions** : Fonctions personnalisées

---

## Comparaison avec d'autres solutions

| Fonctionnalité | ClickHouse Hikube | AWS Redshift | GCP BigQuery | Azure Synapse |
|----------------|-------------------|--------------|--------------|---------------|
| **Performance** | ⚡ Ultra-rapide | ⚡ Rapide | ⚡ Rapide | ⚡ Rapide |
| **Setup** | ⚡ Instantané | ⚡ Instantané | ⚡ Instantané | ⚡ Instantané |
| **Coût** | 💰 Prévisible | 💰 Variable | 💰 Variable | 💰 Variable |
| **K8s Integration** | ✅ Native | ⚠️ Partielle | ⚠️ Partielle | ⚠️ Partielle |
| **Compression** | 📦 Excellente | 📦 Bonne | 📦 Bonne | 📦 Bonne |
| **Real-time** | ⚡ Excellent | ⚠️ Limité | ⚠️ Limité | ⚠️ Limité |

---

## Intégration avec l'écosystème Hikube

### Kubernetes

ClickHouse s'intègre parfaitement avec Kubernetes :

- **Custom Resources** : Définition déclarative
- **Operators** : Gestion automatique
- **Services** : Découverte de service automatique
- **Secrets** : Gestion sécurisée des credentials
- **ConfigMaps** : Configuration centralisée

### Applications

Intégration avec les autres services Hikube :

- **Kafka** : Ingestion de données en streaming
- **PostgreSQL** : Données de référence
- **Redis** : Cache de requêtes
- **Monitoring** : Métriques et alertes

---

## Exemples d'usage

### Connexion simple

```python
import clickhouse_driver

# Connexion à ClickHouse
client = clickhouse_driver.Client(
    host='clickhouse-mon-app.default.svc.cluster.local',
    port=9000,
    user='default',
    password='mon-mot-de-passe-securise',
    database='analytics'
)

# Exécuter une requête
result = client.execute('SELECT * FROM events LIMIT 10')
for row in result:
    print(f"Event: {row}")
```

### Création de tables

```sql
-- Table pour les événements utilisateur
CREATE TABLE events (
    event_id UUID,
    user_id UInt32,
    event_type String,
    event_data String,
    timestamp DateTime,
    session_id String
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (user_id, timestamp)
TTL timestamp + INTERVAL 1 YEAR;

-- Table pour les métriques
CREATE TABLE metrics (
    metric_name String,
    metric_value Float64,
    labels Map(String, String),
    timestamp DateTime
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (metric_name, timestamp)
TTL timestamp + INTERVAL 6 MONTH;
```

### Insertion de données

```python
import clickhouse_driver
from datetime import datetime
import uuid

client = clickhouse_driver.Client(
    host='clickhouse-mon-app.default.svc.cluster.local',
    port=9000,
    user='default',
    password='mon-mot-de-passe-securise',
    database='analytics'
)

# Insérer des événements
events = [
    (str(uuid.uuid4()), 123, 'page_view', '{"page": "/home"}', datetime.now(), 'session_1'),
    (str(uuid.uuid4()), 123, 'click', '{"button": "signup"}', datetime.now(), 'session_1'),
    (str(uuid.uuid4()), 456, 'purchase', '{"amount": 99.99}', datetime.now(), 'session_2')
]

# Exécuter l'insertion
client.execute(
    'INSERT INTO events (event_id, user_id, event_type, event_data, timestamp, session_id) VALUES',
    events
)

# Insérer des métriques
metrics = [
    ('cpu_usage', 75.5, {'host': 'server1', 'region': 'eu'}, datetime.now()),
    ('memory_usage', 82.3, {'host': 'server1', 'region': 'eu'}, datetime.now()),
    ('disk_usage', 45.7, {'host': 'server2', 'region': 'us'}, datetime.now())
]

# Exécuter l'insertion
client.execute(
    'INSERT INTO metrics (metric_name, metric_value, labels, timestamp) VALUES',
    metrics
)
```

### Requêtes analytiques

```sql
-- Analyse des événements par utilisateur
SELECT 
    user_id,
    count() as event_count,
    uniq(session_id) as session_count,
    min(timestamp) as first_event,
    max(timestamp) as last_event
FROM events
WHERE timestamp >= now() - INTERVAL 30 DAY
GROUP BY user_id
ORDER BY event_count DESC
LIMIT 10;

-- Funnel d'événements
WITH funnel AS (
    SELECT 
        user_id,
        session_id,
        arraySort(groupArray(event_type)) as event_sequence
    FROM events
    WHERE timestamp >= now() - INTERVAL 7 DAY
    GROUP BY user_id, session_id
)
SELECT 
    count() as total_sessions,
    countIf(has(event_sequence, 'page_view')) as page_views,
    countIf(has(event_sequence, 'click')) as clicks,
    countIf(has(event_sequence, 'purchase')) as purchases
FROM funnel;

-- Métriques par host
SELECT 
    labels['host'] as host,
    metric_name,
    avg(metric_value) as avg_value,
    max(metric_value) as max_value,
    min(metric_value) as min_value
FROM metrics
WHERE timestamp >= now() - INTERVAL 1 HOUR
GROUP BY host, metric_name
ORDER BY host, metric_name;
```

### Agrégations avancées

```sql
-- Agrégations par fenêtres de temps
SELECT 
    toStartOfHour(timestamp) as hour,
    event_type,
    count() as event_count,
    uniq(user_id) as unique_users
FROM events
WHERE timestamp >= now() - INTERVAL 24 HOUR
GROUP BY hour, event_type
ORDER BY hour DESC, event_count DESC;

-- Top-K par groupe
SELECT 
    user_id,
    event_type,
    count() as event_count
FROM events
WHERE timestamp >= now() - INTERVAL 7 DAY
GROUP BY user_id, event_type
ORDER BY user_id, event_count DESC
LIMIT 3 BY user_id;

-- Corrélations
SELECT 
    corr(
        avgIf(metric_value, metric_name = 'cpu_usage'),
        avgIf(metric_value, metric_name = 'memory_usage')
    ) as cpu_memory_correlation
FROM metrics
WHERE timestamp >= now() - INTERVAL 1 HOUR
GROUP BY labels['host'];
```

### Vues matérialisées

```sql
-- Vue matérialisée pour les statistiques quotidiennes
CREATE MATERIALIZED VIEW daily_stats
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, event_type)
AS SELECT
    toDate(timestamp) as date,
    event_type,
    count() as event_count,
    uniq(user_id) as unique_users
FROM events
GROUP BY date, event_type;

-- Vue matérialisée pour les métriques agrégées
CREATE MATERIALIZED VIEW hourly_metrics
ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(hour)
ORDER BY (hour, metric_name, host)
AS SELECT
    toStartOfHour(timestamp) as hour,
    metric_name,
    labels['host'] as host,
    avgState(metric_value) as avg_value,
    maxState(metric_value) as max_value,
    minState(metric_value) as min_value
FROM metrics
GROUP BY hour, metric_name, host;
```

### Optimisation des performances

```sql
-- Index pour optimiser les requêtes
ALTER TABLE events ADD INDEX idx_user_timestamp user_id TYPE minmax GRANULARITY 4;
ALTER TABLE events ADD INDEX idx_event_type event_type TYPE set(100) GRANULARITY 4;

-- Projections pour accélérer les requêtes
ALTER TABLE events ADD PROJECTION user_events_proj (
    SELECT user_id, event_type, timestamp
    ORDER BY user_id, timestamp
);

-- Compression optimisée
ALTER TABLE events MODIFY SETTING compression_codec = 'ZSTD(3)';

-- Partitionnement intelligent
ALTER TABLE events DROP PARTITION '202401';
ALTER TABLE events DROP PARTITION '202402';
```

### Monitoring et métriques

```sql
-- Vérifier l'utilisation du stockage
SELECT 
    table,
    formatReadableSize(sum(bytes)) as size,
    formatReadableSize(sum(primary_key_bytes_in_memory)) as primary_key_size,
    count() as parts
FROM system.parts
WHERE active
GROUP BY table
ORDER BY sum(bytes) DESC;

-- Vérifier les requêtes lentes
SELECT 
    query,
    count() as executions,
    avg(query_duration_ms) as avg_duration_ms,
    max(query_duration_ms) as max_duration_ms
FROM system.query_log
WHERE type = 'QueryFinish'
    AND query_duration_ms > 1000
    AND event_time >= now() - INTERVAL 1 HOUR
GROUP BY query
ORDER BY avg_duration_ms DESC
LIMIT 10;

-- Vérifier l'utilisation mémoire
SELECT 
    metric,
    value,
    description
FROM system.metrics
WHERE metric IN ('MemoryUsage', 'MemoryTracking', 'MemoryTrackingInBackgroundProcessingPool')
ORDER BY value DESC;
```

---

## Prochaines étapes

1. **[Démarrage rapide](quick-start.md)** : Déployez ClickHouse en 5 minutes
2. **[Référence API](api-reference.md)** : Tous les paramètres disponibles
3. **[Tutoriels](tutorials/)** : Guides avancés
4. **[Dépannage](troubleshooting.md)** : Solutions aux problèmes courants
5. **[Optimisation](optimization/)** : Techniques d'optimisation
6. **[Migration](migration/)** : Migration depuis d'autres bases 