---
title: Référence API PostgreSQL
---

# Référence API PostgreSQL

Documentation complète de l'API PostgreSQL sur Hikube.

---

## Spécification complète

### Paramètres généraux

| **Nom**                     | **Type** | **Défaut** | **Description** |
|------------------------------|----------|-------------|-----------------|
| `external`                  | boolean  | `false`     | Permet l'accès externe depuis l'extérieur du cluster |
| `size`                      | string   | `10Gi`      | Taille du volume persistant pour les données |
| `replicas`                  | integer  | `2`         | Nombre de réplicas PostgreSQL |
| `storageClass`              | string   | `"replicated"` | Classe de stockage utilisée pour les données |
| `postgresql.parameters.max_connections` | integer | `100` | Nombre maximal de connexions simultanées |
| `quorum.minSyncReplicas`    | integer  | `0`         | Nombre minimum de réplicas synchrones |
| `quorum.maxSyncReplicas`    | integer  | `0`         | Nombre maximum de réplicas synchrones |

### Paramètres de configuration

| **Nom**      | **Type** | **Défaut** | **Description** |
|--------------|----------|-------------|-----------------|
| `users`      | object   | `{}`        | Configuration des utilisateurs |
| `databases`  | object   | `{}`        | Configuration des bases de données |

### Paramètres de backup

| **Nom**                  | **Type** | **Défaut** | **Description** |
|---------------------------|----------|-------------|-----------------|
| `backup.enabled`         | boolean  | `false`     | Active ou désactive les sauvegardes périodiques |
| `backup.s3Region`        | string   | `us-east-1` | Région AWS S3 pour les sauvegardes |
| `backup.s3Bucket`        | string   | -           | Bucket S3 utilisé pour les sauvegardes |
| `backup.schedule`        | string   | `0 2 * * *` | Planification des sauvegardes (format Cron) |
| `backup.cleanupStrategy` | string   | -           | Stratégie pour nettoyer les anciennes sauvegardes |
| `backup.s3AccessKey`     | string   | -           | Clé d'accès AWS S3 |
| `backup.s3SecretKey`     | string   | -           | Clé secrète AWS S3 |
| `backup.resticPassword`  | string   | -           | Mot de passe pour le chiffrement Restic |

---

## Exemples de configuration

### Configuration minimale

```text
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: postgres-minimal
spec:
  size: 10Gi
  replicas: 2
```

### Configuration complète

```text
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: postgres-complete
spec:
  external: true
  size: 50Gi
  replicas: 3
  storageClass: "replicated"
  postgresql:
    parameters:
      max_connections: 200
      shared_buffers: "256MB"
      effective_cache_size: "1GB"
  quorum:
    minSyncReplicas: 1
    maxSyncReplicas: 2
  users:
    admin:
      password: "secure-admin-password"
    app_user:
      password: "app-password"
    readonly_user:
      password: "readonly-password"
      replication: true
  databases:
    myapp:
      roles:
        admin:
          - admin
          - app_user
        readonly:
          - readonly_user
    analytics:
      roles:
        admin:
          - admin
      extensions:
        - hstore
        - pg_stat_statements
  backup:
    enabled: true
    s3Region: "us-east-1"
    s3Bucket: "s3.tenant.hikube.cloud/postgres-backups"
    schedule: "0 3 * * *"
    cleanupStrategy: "--keep-last=5 --keep-daily=7 --keep-within-weekly=2m"
    s3AccessKey: "your-s3-access-key"
    s3SecretKey: "your-s3-secret-key"
    resticPassword: "your-restic-password"
```

### Configuration haute disponibilité

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: postgres-ha
spec:
  external: true
  size: 100Gi
  replicas: 5
  storageClass: "replicated"
  postgresql:
    parameters:
      max_connections: 500
      shared_buffers: "512MB"
      effective_cache_size: "2GB"
      wal_buffers: "16MB"
      checkpoint_completion_target: 0.9
      wal_writer_delay: "200ms"
      default_statistics_target: 100
      random_page_cost: 1.1
      effective_io_concurrency: 200
  quorum:
    minSyncReplicas: 2
    maxSyncReplicas: 3
  users:
    admin:
      password: "very-secure-password"
    app_user:
      password: "app-password"
    monitoring_user:
      password: "monitoring-password"
  databases:
    production:
      roles:
        admin:
          - admin
        app:
          - app_user
        monitoring:
          - monitoring_user
      extensions:
        - hstore
        - pg_stat_statements
        - pg_trgm
        - btree_gin
  backup:
    enabled: true
    s3Region: "us-east-1"
    s3Bucket: "s3.tenant.hikube.cloud/postgres-backups"
    schedule: "0 2 * * *"
    cleanupStrategy: "--keep-last=10 --keep-daily=14 --keep-within-weekly=1m"
```

### Configuration pour développement

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: postgres-dev
spec:
  external: false
  size: 5Gi
  replicas: 1
  storageClass: "local"
  postgresql:
    parameters:
      max_connections: 50
      shared_buffers: "128MB"
  users:
    dev_user:
      password: "dev-password"
  databases:
    dev_db:
      roles:
        admin:
          - dev_user
      extensions:
        - hstore
```

---

## Paramètres PostgreSQL avancés

### Paramètres de performance

```yaml
postgresql:
  parameters:
    # Mémoire
    shared_buffers: "256MB"
    effective_cache_size: "1GB"
    work_mem: "4MB"
    maintenance_work_mem: "64MB"
    
    # WAL
    wal_buffers: "16MB"
    checkpoint_completion_target: 0.9
    wal_writer_delay: "200ms"
    
    # Requêtes
    default_statistics_target: 100
    random_page_cost: 1.1
    effective_io_concurrency: 200
    
    # Connexions
    max_connections: 200
    max_worker_processes: 8
    max_parallel_workers_per_gather: 2
    max_parallel_workers: 8
```

### Paramètres de réplication

```yaml
quorum:
  minSyncReplicas: 1    # Nombre minimum de réplicas synchrones
  maxSyncReplicas: 2    # Nombre maximum de réplicas synchrones
```

---

## Gestion des utilisateurs

### Structure des utilisateurs

```yaml
users:
  username:
    password: "password"
    replication: false  # Optionnel, pour la réplication
    superuser: false    # Optionnel, pour les privilèges admin
```

### Exemples d'utilisateurs

```yaml
users:
  admin:
    password: "admin-password"
    superuser: true
  
  app_user:
    password: "app-password"
  
  readonly_user:
    password: "readonly-password"
    replication: true
  
  monitoring_user:
    password: "monitoring-password"
```

---

## Gestion des bases de données

### Structure des bases de données

```yaml
databases:
  database_name:
    roles:
      admin:
        - user1
        - user2
      readonly:
        - readonly_user
    extensions:
      - extension1
      - extension2
```

### Extensions disponibles

- `hstore` : Stockage clé-valeur
- `pg_stat_statements` : Statistiques de requêtes
- `pg_trgm` : Recherche de similarité
- `btree_gin` : Index GIN pour B-tree
- `uuid-ossp` : Génération d'UUIDs
- `pgcrypto` : Fonctions cryptographiques

---

## Configuration des sauvegardes

### Paramètres S3

```text
backup:
  enabled: true
  s3Region: "us-east-1"
  s3Bucket: "s3.tenant.hikube.cloud/postgres-backups"
  schedule: "0 2 * * *"  # Tous les jours à 2h du matin
  cleanupStrategy: "--keep-last=5 --keep-daily=7 --keep-within-weekly=2m"
  s3AccessKey: "your-access-key"
  s3SecretKey: "your-secret-key"
  resticPassword: "your-restic-password"
```

### Stratégies de nettoyage

- `--keep-last=5` : Garde les 5 dernières sauvegardes
- `--keep-daily=7` : Garde les sauvegardes quotidiennes pendant 7 jours
- `--keep-within-weekly=2m` : Garde les sauvegardes hebdomadaires pendant 2 mois

---

## Commandes kubectl utiles

### Vérifier l'état

```bash
# Lister les instances PostgreSQL
kubectl get postgres

# Voir les détails
kubectl describe postgres postgres-example

# Voir les logs
kubectl logs -l app=postgres
```

### Se connecter

```bash
# Se connecter à PostgreSQL
kubectl exec -it postgres-postgres-example-0 -- psql -U admin -d postgres

# Obtenir les credentials
kubectl get secret postgres-postgres-example -o yaml
```

### Gestion des sauvegardes

```bash
# Lister les sauvegardes
kubectl get postgresbackups

# Créer une sauvegarde manuelle
kubectl create -f backup-manual.yaml
``` 