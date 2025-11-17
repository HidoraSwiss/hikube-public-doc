---
sidebar_position: 3
title: Référence API
---

# Référence API ClickHouse

Cette référence détaille l’utilisation de **ClickHouse** sur Hikube, que ce soit en configuration simple ou distribuée avec shards et réplicas.

---

## Structure de Base

### **Ressource Clickhouse**

#### Exemple de configuration YAML

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: clickhouse-name
  namespace: default
spec:
```

## Paramètres

### **Paramètres Communs**

| **Paramètre**       | **Type**   | **Description**                                                                 | **Défaut** | **Requis** |
|----------------------|------------|---------------------------------------------------------------------------------|------------|------------|
| `replicas`           | `int`      | Number of ClickHouse replicas                                                   | `2`        | Oui        |
| `shards`             | `int`      | Number of ClickHouse shards                                                     | `1`        | Oui        |
| `resources`          | `object`   | Explicit CPU and memory configuration for each replica. Si vide, `resourcesPreset` est appliqué | `{}`       | Non        |
| `resources.cpu`      | `quantity` | CPU available to each replica                                                   | `null`     | Non        |
| `resources.memory`   | `quantity` | Memory (RAM) available to each replica                                          | `null`     | Non        |
| `resourcesPreset`    | `string`   | Default sizing preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `"small"`  | Oui        |
| `size`               | `quantity` | Persistent Volume Claim size, available for application data                    | `10Gi`     | Oui        |
| `storageClass`       | `string`   | StorageClass used to store the data                                             | `""`       | Non        |

#### Exemple de configuration YAML

```yaml title="clickhouse.yaml"
replicas: 2
shards: 1
resources:
  cpu: 4000m
  memory: 4Gi
resourcesPreset: small
size: 20Gi
storageClass: replicated
```

### **Paramètres d'application spécifique**

| **Paramètre**           | **Type**             | **Description**                                             | **Défaut** | **Requis** |
|--------------------------|----------------------|-------------------------------------------------------------|------------|------------|
| `logStorageSize`         | `quantity`           | Size of Persistent Volume for logs                          | `2Gi`      | Non        |
| `logTTL`                 | `int`                | TTL (expiration time) for `query_log` and `query_thread_log`| `15`       | Non        |
| `users`                  | `map[string]object`  | Users configuration                                         | `{...}`    | Non        |
| `users[name].password`   | `string`             | Password for the user                                       | `null`     | Oui        |
| `users[name].readonly`   | `bool`               | User is readonly, default is false                          | `null`     | Non        |

#### Exemple de configuration YAML

```yaml title="clickhouse.yaml"
logStorageSize: 5Gi
logTTL: 30
users:
  analyst:
    password: analyst123
    readonly: true
  admin:
    password: adminStrongPwd
```

### **Paramètres de backup**

| **Paramètre**           | **Type**   | **Description**                                | **Défaut**                                   | **Requis** |
|--------------------------|------------|------------------------------------------------|-----------------------------------------------|------------|
| `backup`                 | `object`   | Backup configuration                           | `{}`                                          | Non        |
| `backup.enabled`         | `bool`     | Enable regular backups                         | `false`                                       | Non        |
| `backup.s3Region`        | `string`   | AWS S3 region where backups are stored         | `us-east-1`                                   | Non        |
| `backup.s3Bucket`        | `string`   | S3 bucket used for storing backups             | `s3.example.org/clickhouse-backups`           | Non        |
| `backup.schedule`        | `string`   | Cron schedule for automated backups            | `"0 2 * * *"`                                 | Non        |
| `backup.cleanupStrategy` | `string`   | Retention strategy for cleaning up old backups | `"--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"` | Non        |
| `backup.s3AccessKey`     | `string`   | Access key for S3, used for authentication     | `<your-access-key>`                           | Oui        |
| `backup.s3SecretKey`     | `string`   | Secret key for S3, used for authentication     | `<your-secret-key>`                           | Oui        |
| `backup.resticPassword`  | `string`   | Password for Restic backup encryption          | `<password>`                                  | Oui        |

#### Exemple de configuration YAML

```yaml title="clickhouse.yaml"
backup:
  enabled: true
  s3Region: eu-central-1
  s3Bucket: backups.hikube.clickhouse
  schedule: "0 3 * * *"
  cleanupStrategy: "--keep-last=5 --keep-daily=7 --keep-weekly=4"
  s3AccessKey: "<your-access-key>"
  s3SecretKey: "<your-secret-key>"
  resticPassword: "<password>"
```

### **Paramètres de Clickhouse keeper**

| **Paramètre**                   | **Type**   | **Description**                                                                 | **Défaut** | **Requis** |
|---------------------------------|------------|---------------------------------------------------------------------------------|------------|------------|
| `clickhouseKeeper`              | `object`   | ClickHouse Keeper configuration                                                 | `{}`       | Non        |
| `clickhouseKeeper.enabled`      | `bool`     | Deploy ClickHouse Keeper for cluster coordination                               | `true`     | Oui        |
| `clickhouseKeeper.size`         | `quantity` | Persistent Volume Claim size, available for application data                    | `1Gi`      | Oui        |
| `clickhouseKeeper.resourcesPreset` | `string` | Default sizing preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `micro` | Oui        |
| `clickhouseKeeper.replicas`     | `int`      | Number of Keeper replicas                                                       | `3`        | Oui        |

#### Exemple de configuration YAML

```yaml title="clickhouse.yaml"
clickhouseKeeper:
  enabled: true
  replicas: 3
  resourcesPreset: medium
  size: 5Gi  
```  

### resources et resourcesPreset

Le champ `resources` permet de définir explicitement la configuration CPU et mémoire de chaque réplique ClickHouse.  
Si ce champ est laissé vide, la valeur du paramètre `resourcesPreset` est utilisée.  

#### Exemple de configuration YAML

```yaml title="clickhouse.yaml"
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
