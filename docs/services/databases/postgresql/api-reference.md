---
sidebar_position: 3
title: Référence API
---

# Référence API PostgreSQL

Cette référence détaille l’utilisation de **PostgreSQL** sur Hikube, en mettant en avant son fonctionnement en cluster répliqué avec un primary et des standby pour la haute disponibilité, ainsi que la possibilité d’activer des sauvegardes automatiques vers un stockage compatible S3.

---

## Structure de Base

### **Ressource Postgres**

#### Exemple de configuration YAML

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: example
spec:
```

---

## Paramètres

### **Paramètres Communs**

| **Paramètre**       | **Type**   | **Description**                                                                 | **Défaut** | **Requis** |
|----------------------|------------|---------------------------------------------------------------------------------|------------|------------|
| `replicas`           | `int`      | Number of PostgreSQL replicas (instances dans le cluster)                       | `2`        | Oui        |
| `resources`          | `object`   | Explicit CPU and memory configuration for each PostgreSQL replica. Si vide, `resourcesPreset` est appliqué | `{}`       | Non        |
| `resources.cpu`      | `quantity` | CPU available to each replica                                                   | `null`     | Non        |
| `resources.memory`   | `quantity` | Memory (RAM) available to each replica                                          | `null`     | Non        |
| `resourcesPreset`    | `string`   | Default sizing preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `"micro"` | Oui        |
| `size`               | `quantity` | Persistent Volume Claim size, available for application data                    | `10Gi`     | Oui        |
| `storageClass`       | `string`   | StorageClass used to store the data                                             | `""`       | Non        |
| `external`           | `bool`     | Enable external access from outside the cluster                                 | `false`    | Non        |

#### Exemple de configuration YAML

```yaml title="postgresql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: postgres-example
spec:
  # Nombre de réplicas PostgreSQL (instances dans le cluster)
  replicas: 3
  # Configuration explicite des ressources
  resources:
    cpu: 2000m     # 2 vCPU par instance
    memory: 2Gi    # 2 GiB de RAM par instance
  # Utilisation d’un preset si resources est vide
  resourcesPreset: micro
  # Volume persistant pour chaque instance PostgreSQL
  size: 10Gi
  # Classe de stockage (laisser vide pour utiliser celle par défaut du cluster)
  storageClass: "replicated"
  # Exposer la base à l’extérieur du cluster (LoadBalancer si true)
  external: false
```

---

### **Paramètres d'application spécifique**

| **Paramètre**                         | **Type**             | **Description**                                                                 | **Défaut** | **Requis** |
|---------------------------------------|----------------------|---------------------------------------------------------------------------------|------------|------------|
| `postgresql`                          | `object`             | PostgreSQL server configuration                                                 | `{}`       | Non        |
| `postgresql.parameters`               | `object`             | PostgreSQL server parameters                                                    | `{}`       | Non        |
| `postgresql.parameters.max_connections` | `int`               | Maximum number of concurrent connections to the database server (par défaut : 100) | `100`   | Non        |
| `quorum`                              | `object`             | Quorum configuration for synchronous replication                                | `{}`       | Non        |
| `quorum.minSyncReplicas`              | `int`                | Minimum number of synchronous replicas that must acknowledge a transaction      | `0`        | Non        |
| `quorum.maxSyncReplicas`              | `int`                | Maximum number of synchronous replicas that can acknowledge a transaction       | `0`        | Non        |
| `users`                               | `map[string]object`  | Users configuration                                                             | `{...}`    | Non        |
| `users[name].password`                | `string`             | Password for the user                                                           | `null`     | Oui        |
| `users[name].replication`             | `bool`               | Whether the user has replication privileges                                     | `null`     | Non        |
| `databases`                           | `map[string]object`  | Databases configuration                                                         | `{...}`    | Non        |
| `databases[name].roles`               | `object`             | Roles for the database                                                          | `null`     | Non        |
| `databases[name].roles.admin`         | `[]string`           | List of users with admin privileges                                             | `[]`       | Non        |
| `databases[name].roles.readonly`      | `[]string`           | List of users with read-only privileges                                         | `[]`       | Non        |
| `databases[name].extensions`          | `[]string`           | Extensions enabled for the database                                             | `[]`       | Non        |

#### Exemple de configuration YAML

```yaml title="postgresql.yaml"
spec:
  replicas: 3
  size: 10Gi
  storageClass: replicated
  resourcesPreset: medium

  # Configuration serveur PostgreSQL
  postgresql:
    parameters:
      max_connections: 200
      shared_buffers: 512MB
      work_mem: 64MB

  # Configuration quorum pour la réplication synchrone
  quorum:
    minSyncReplicas: 1
    maxSyncReplicas: 2

  # Utilisateurs
  users:
    admin:
      password: StrongAdminPwd123
      replication: true
    appuser:
      password: AppUserPwd456
    readonly:
      password: ReadOnlyPwd789

  # Bases de données
  databases:
    myapp:
      roles:
        admin:
          - admin
        readonly:
          - readonly
      extensions:
        - hstore
        - uuid-ossp

    analytics:
      roles:
        admin:
          - admin
        readonly:
          - appuser
      extensions:
        - pgcrypto
```

---

### **Paramètres de backup**

| **Paramètre**              | **Type**   | **Description**                                         | **Défaut**                       | **Requis** |
|-----------------------------|------------|---------------------------------------------------------|-----------------------------------|------------|
| `backup`                    | `object`  | Backup configuration                                    | `{}`                              | Non        |
| `backup.enabled`            | `bool`    | Enable regular backups                                  | `false`                           | Non        |
| `backup.schedule`           | `string`  | Cron schedule for automated backups                     | `"0 2 * * * *"`                   | Non        |
| `backup.retentionPolicy`    | `string`  | Retention policy                                        | `"30d"`                           | Non        |
| `backup.destinationPath`    | `string`  | Path to store the backup (i.e. s3://bucket/path/)       | `"s3://bucket/path/to/folder/"`   | Oui        |
| `backup.endpointURL`        | `string`  | S3 Endpoint used to upload data to the cloud            | `"http://minio-gateway-service:9000"` | Oui    |
| `backup.s3AccessKey`        | `string`  | Access key for S3, used for authentication              | `<your-access-key>`               | Oui        |
| `backup.s3SecretKey`        | `string`  | Secret key for S3, used for authentication              | `<your-secret-key>`               | Oui        |

Pour sauvegarder une base de données **PostgreSQL**, un stockage externe **compatible S3** est requis.  

Pour activer les sauvegardes régulières :  

1. Mettez à jour la configuration de votre application PostgreSQL.  
2. Passez le paramètre `backup.enabled` à `true`.  
3. Renseignez le chemin de destination ainsi que les identifiants dans les champs `backup.*`.

#### Exemple de configuration YAML

```yaml title="postgresql.yaml"
## @param backup.enabled Enable regular backups
## @param backup.schedule Cron schedule for automated backups
## @param backup.retentionPolicy Retention policy
## @param backup.destinationPath Path to store the backup (i.e. s3://bucket/path/to/folder)
## @param backup.endpointURL S3 Endpoint used to upload data to the cloud
## @param backup.s3AccessKey Access key for S3, used for authentication
## @param backup.s3SecretKey Secret key for S3, used for authentication
backup:
  enabled: false
  retentionPolicy: 30d
  destinationPath: s3://bucket/path/to/folder/
  endpointURL: http://minio-gateway-service:9000
  schedule: "0 2 * * * *"
  s3AccessKey: oobaiRus9pah8PhohL1ThaeTa4UVa7gu
  s3SecretKey: ju3eum4dekeich9ahM1te8waeGai0oog
```

### **Paramètres de restauration de backup**

| **Paramètre**             | **Type**   | **Description**                                                                                       | **Défaut** | **Requis** |
|----------------------------|------------|-------------------------------------------------------------------------------------------------------|------------|------------|
| `bootstrap`                | `object`   | Bootstrap configuration                                                                               | `{}`       | Non        |
| `bootstrap.enabled`        | `bool`     | Restore database cluster from a backup                                                                | `false`    | Non        |
| `bootstrap.recoveryTime`   | `string`   | Timestamp (PITR) jusqu’auquel la restauration doit s’effectuer (format RFC 3339). Vide = dernière sauvegarde | `""`       | Non        |
| `bootstrap.oldName`        | `string`   | Nom du cluster PostgreSQL avant suppression                                                           | `""`       | Oui        |

Hikube en charge la **restauration à un instant donné (Point-In-Time Recovery - PITR)**.  
La récupération s’effectue en créant une **nouvelle instance PostgreSQL** avec un nom différent, mais une configuration identique à celle de l’instance d’origine.  

#### Étapes  

1. Créez une nouvelle application PostgreSQL.  
2. Donnez-lui un nom différent de l’instance d’origine.  
3. Activez le paramètre `bootstrap.enabled`.  
4. Renseignez :  
   - `bootstrap.oldName` : le nom de l’ancienne instance PostgreSQL.  
   - `bootstrap.recoveryTime` : l’instant jusqu’auquel restaurer, au format **RFC 3339**. Si laissé vide, la restauration se fera jusqu’au dernier état disponible.  

---

#### Exemple de configuration YAML

```yaml title="postgresql.yaml"
bootstrap:
  enabled: true
  oldName: "postgres-example"   # nom de l’ancienne instance
  recoveryTime: "2025-01-15T10:30:00Z"  # restauration à un instant précis (RFC 3339)
```

### resources et resourcesPreset  

Le champ `resources` permet de définir explicitement la configuration CPU et mémoire de chaque réplique PostgreSQL.  
Si ce champ est laissé vide, la valeur du paramètre `resourcesPreset` est utilisée.  

#### Exemple de configuration YAML

```yaml title="postgresql.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```  

⚠️ Attention : si resources est défini, la valeur de resourcesPreset est ignorée.

| **Preset name** | **CPU** | **Mémoire** |
|-----------------|---------|-------------|
| `nano`          | 250m    | 128Mi       |
| `micro`         | 500m    | 256Mi       |
| `small`         | 1       | 512Mi       |
| `medium`        | 1       | 1Gi         |
| `large`         | 2       | 2Gi         |
| `xlarge`        | 4       | 4Gi         |
| `2xlarge`       | 8       | 8Gi         |

---

## Exemples Complets

### Cluster de Production

```yaml title="postgresql-production.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: production
spec:
  replicas: 3
  resources:
    cpu: 4000m
    memory: 8Gi
  size: 50Gi
  storageClass: replicated
  external: false

  postgresql:
    parameters:
      max_connections: 300
      shared_buffers: 2GB
      work_mem: 64MB
      effective_cache_size: 6GB

  quorum:
    minSyncReplicas: 1
    maxSyncReplicas: 2

  users:
    admin:
      password: SecureAdminPassword
      replication: true
    appuser:
      password: SecureAppPassword
    readonly:
      password: SecureReadOnlyPassword

  databases:
    production:
      roles:
        admin:
          - admin
        readonly:
          - readonly
          - appuser
      extensions:
        - uuid-ossp
        - pgcrypto

  backup:
    enabled: true
    schedule: "0 2 * * *"
    retentionPolicy: 30d
    destinationPath: s3://backups/postgresql/production/
    endpointURL: http://minio-gateway-service:9000
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
```

### Cluster de Développement

```yaml title="postgresql-development.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: development
spec:
  replicas: 1
  resourcesPreset: nano
  size: 5Gi
  external: true

  users:
    dev:
      password: devpassword

  databases:
    devdb:
      roles:
        admin:
          - dev
```

---

:::tip Bonnes Pratiques

- **Réplication synchrone** : configurez `quorum.minSyncReplicas: 1` en production pour garantir qu'au moins un réplica confirme chaque transaction
- **Sauvegardes S3** : activez les sauvegardes automatiques avec `backup.enabled: true` et testez régulièrement la restauration
- **Séparation des rôles** : créez des utilisateurs distincts pour l'administration, l'application et la lecture seule
- **Paramètres PostgreSQL** : ajustez `shared_buffers` (~25% de la RAM), `work_mem` et `max_connections` selon votre charge de travail
:::

:::warning Attention

- **Les suppressions sont irréversibles** : la suppression d'une ressource Postgres entraîne la perte définitive des données si aucune sauvegarde n'est configurée
- **`resources` vs `resourcesPreset`** : si `resources` est défini, `resourcesPreset` est entièrement ignoré
- **Restauration PITR** : la restauration crée une **nouvelle instance** avec un nom différent — elle ne restaure pas l'instance existante
:::
