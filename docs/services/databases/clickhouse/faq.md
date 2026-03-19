---
sidebar_position: 6
title: FAQ
---

# FAQ — ClickHouse

### Quelle est la difference entre shards et replicas ?

Les **shards** et les **replicas** jouent des roles differents dans l'architecture ClickHouse :

- **Shards** : distribution **horizontale** des donnees. Chaque shard contient une partie du dataset total. Ajouter des shards augmente la capacite de stockage et de traitement.
- **Replicas** : copies **identiques** des donnees au sein d'un meme shard. Chaque replica contient les memes donnees pour assurer la haute disponibilite.

```yaml title="clickhouse.yaml"
spec:
  shards: 2       # Les donnees sont reparties sur 2 shards
  replicas: 3     # Chaque shard a 3 copies (total: 6 pods)
```

:::tip
En production, utilisez au moins 2 replicas par shard pour la haute disponibilite. Augmentez le nombre de shards pour traiter des volumes de donnees plus importants.
:::

### A quoi sert ClickHouse Keeper ?

**ClickHouse Keeper** est le composant de coordination du cluster, base sur le protocole **Raft**. Il remplace Apache ZooKeeper et assure :

- L'**election du leader** pour les tables repliquees
- La **coordination** des operations de replication entre replicas
- La gestion des **metadonnees** du cluster

Le nombre de replicas Keeper doit etre **impair** (3 ou 5) pour garantir le quorum (majorite necessaire pour l'election du leader). Le minimum recommande est **3 replicas**.

```yaml title="clickhouse.yaml"
spec:
  clickhouseKeeper:
    enabled: true
    replicas: 3        # Toujours impair : 3 ou 5
    resourcesPreset: micro
    size: 2Gi
```

### ClickHouse est-il adapte aux requetes transactionnelles (OLTP) ?

**Non.** ClickHouse est un moteur de base de donnees **OLAP** (Online Analytical Processing) optimise pour l'analyse de donnees :

- Architecture **orientee colonnes** : tres performant pour les aggregations et les scans sur de grands volumes de donnees
- Optimise pour les **lectures massives** et les requetes analytiques
- **Non adapte** aux operations transactionnelles frequentes (`UPDATE`, `DELETE` unitaires)

Si vous avez besoin d'un moteur transactionnel (OLTP), utilisez plutot **PostgreSQL** ou **MySQL** sur Hikube.

### Quelle est la difference entre `resourcesPreset` et `resources` ?

Le champ `resourcesPreset` permet de choisir un profil de ressources predetermine pour chaque replica ClickHouse. Si le champ `resources` (CPU/memoire explicites) est defini, `resourcesPreset` est **entierement ignore**.

| **Preset** | **CPU** | **Memoire** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

```yaml title="clickhouse.yaml"
spec:
  # Utilisation d'un preset
  resourcesPreset: large

  # OU configuration explicite (le preset est alors ignore)
  resources:
    cpu: 4000m
    memory: 8Gi
```

### Comment sont distribuees les donnees entre shards ?

Les donnees sont distribuees entre les shards via le moteur **Distributed** de ClickHouse :

- Chaque shard stocke une **partition** du dataset total
- Le moteur `Distributed` redirige les requetes vers tous les shards et **fusionne les resultats**
- Les donnees sont **repliquees** au sein de chaque shard selon le nombre de replicas configure

Pour beneficier de la distribution, creez des tables avec le moteur `ReplicatedMergeTree` sur chaque shard et une table `Distributed` pour les requetes globales.

### Comment configurer les backups ClickHouse ?

Les sauvegardes ClickHouse utilisent **Restic** pour l'envoi vers un stockage S3 compatible. Configurez la section `backup` :

```yaml title="clickhouse.yaml"
spec:
  backup:
    enabled: true
    s3Region: eu-central-1
    s3Bucket: s3.example.com/clickhouse-backups
    schedule: "0 3 * * *"
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
    resticPassword: your-restic-password
```

:::warning
Conservez le `resticPassword` en lieu sur. Sans ce mot de passe, les sauvegardes ne pourront pas etre dechiffrees.
:::
