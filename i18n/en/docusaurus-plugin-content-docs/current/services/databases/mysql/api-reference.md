---
sidebar_position: 3
title: API Reference
---

# MySQL API Reference

This reference details the use of **MySQL** on Hikube, highlighting its deployment in a replicated cluster with a primary and replicas for high availability, as well as the ability to enable automatic backups to S3-compatible storage.

---

## Base Structure

### **MySQL Resource**

#### YAML Configuration Example

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example
  namespace: default
spec:
```

---

## Parameters

### **Common Parameters**

| **Parameter**      | **Type**   | **Description**                                                                 | **Default** | **Required** |
|---------------------|------------|---------------------------------------------------------------------------------|------------|------------|
| `replicas`          | `int`      | Number of MariaDB replicas in the cluster                                      | `2`        | Yes        |
| `resources`         | `object`   | Explicit CPU and memory configuration for each replica. If empty, `resourcesPreset` is applied | `{}`       | No        |
| `resources.cpu`     | `quantity` | CPU available for each replica                                              | `null`     | No        |
| `resources.memory`  | `quantity` | Memory (RAM) available for each replica                                    | `null`     | No        |
| `resourcesPreset`   | `string`   | Default resource profile (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `nano`     | Yes        |
| `size`              | `quantity` | Persistent volume (PVC) size for storing data                      | `10Gi`     | Yes        |
| `storageClass`      | `string`   | StorageClass used to store data                                  | `""`       | No        |
| `external`          | `bool`     | Enable external access to the cluster (LoadBalancer)                              | `false`    | No        |

#### YAML Configuration Example

```yaml title="mysql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example              # Instance name
  namespace: default         # Target namespace
spec:
  replicas: 3                # Number of replicas (1 primary + 2 replicas)

  resources:
    cpu: 1000m               # CPU per replica
    memory: 1Gi              # RAM per replica

  resourcesPreset: nano      # Default profile if resources is empty
  size: 10Gi                 # Persistent volume size
  storageClass: ""           # Storage class
  external: false            # External access (LoadBalancer)
```

### **Application-Specific Parameters**

| **Parameter**                     | **Type**             | **Description**                                   | **Default** | **Required** |
|-----------------------------------|----------------------|---------------------------------------------------|------------|------------|
| `users`                           | `map[string]object`  | User configuration                    | `{...}`    | Yes        |
| `users[name].password`            | `string`             | User password                     | `""`       | Yes        |
| `users[name].maxUserConnections`  | `int`                | Maximum number of connections for the user   | `0`        | No        |
| `databases`                       | `map[string]object`  | Database configuration                | `{...}`    | Yes        |
| `databases[name].roles`           | `object`             | Roles associated with the database                          | `null`     | No        |
| `databases[name].roles.admin`     | `[]string`           | List of users with admin rights          | `[]`       | No        |
| `databases[name].roles.readonly`  | `[]string`           | List of users with read-only rights     | `[]`       | No        |

#### YAML Configuration Example

```yaml title="mysql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example
  namespace: default
spec:
  replicas: 2
  size: 10Gi
  resourcesPreset: nano
  # MySQL user definition
  users:
    appuser:
      password: strongpassword     # Application user password
      maxUserConnections: 50       # Simultaneous connection limit
    readonly:
      password: readonlypass       # User with restricted rights
      maxUserConnections: 10

  # Database definition
  databases:
    myapp:
      roles:
        admin:
          - appuser                # appuser = admin of "myapp" database
        readonly:
          - readonly               # readonly = read-only access
    analytics:
      roles:
        admin:
          - appuser                # appuser = admin of "analytics" database
```

### **Backup Parameters**

| **Parameter**           | **Type**  | **Description**                                        | **Default**                              | **Required** |
|--------------------------|-----------|--------------------------------------------------------|------------------------------------------|------------|
| `backup`                 | `object`  | Backup configuration                          | `{}`                                     | No        |
| `backup.enabled`         | `bool`    | Enable regular backups                     | `false`                                  | No        |
| `backup.s3Region`        | `string`  | AWS S3 region where backups are stored         | `"us-east-1"`                            | Yes        |
| `backup.s3Bucket`        | `string`  | S3 bucket used to store backups         | `"s3.example.org/mysql-backups"`         | Yes        |
| `backup.schedule`        | `string`  | Backup scheduling (cron)                   | `"0 2 * * *"`                            | No        |
| `backup.cleanupStrategy` | `string`  | Retention strategy for cleaning up old backups | `"--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"` | No |
| `backup.s3AccessKey`     | `string`  | S3 access key (authentication)                      | `"<your-access-key>"`                    | Yes        |
| `backup.s3SecretKey`     | `string`  | S3 secret key (authentication)                      | `"<your-secret-key>"`                    | Yes        |
| `backup.resticPassword`  | `string`  | Password used for Restic encryption        | `"<password>"`                           | Yes        |

#### YAML Configuration Example

```yaml title="mysql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example
  namespace: default
spec:
  replicas: 2
  size: 10Gi
  resourcesPreset: small

  # Automatic backup configuration
  backup:
    enabled: true
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/mysql-backups
    schedule: "0 3 * * *"                       # Backup every day at 3 AM
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3AccessKey: "HIKUBE123ACCESSKEY"
    s3SecretKey: "HIKUBE456SECRETKEY"
    resticPassword: "SuperStrongResticPassword!"
```

### resources and resourcesPreset  

The `resources` field allows explicitly defining the CPU and memory configuration of each MySQL replica.  
If this field is left empty, the value of the `resourcesPreset` parameter is used.  

#### YAML Configuration Example

```yaml title="mysql.yaml"
resources:
cpu: 4000m
memory: 4Gi
```  

⚠️ Attention: if resources is defined, the resourcesPreset value is ignored.

| **Preset name** | **CPU** | **Memory** |
|-----------------|---------|-------------|
| `nano`          | 250m    | 128Mi       |
| `micro`         | 500m    | 256Mi       |
| `small`         | 1       | 512Mi       |
| `medium`        | 1       | 1Gi         |
| `large`         | 2       | 2Gi         |
| `xlarge`        | 4       | 4Gi         |
| `2xlarge`       | 8       | 8Gi         |

## How to?

### Switch Primary Role in a MySQL/MariaDB Cluster

In a **managed MySQL/MariaDB cluster**, one node is defined as **primary** (handling writes) and the others as **replicas** (read).  
It is sometimes necessary to change the primary role, for example during maintenance or to distribute load.

1. **Edit the MariaDB resource**  

```bash
kubectl edit mariadb  mysql-example
```

Modify the following section to designate a new primary:

```yaml
spec:
  replication:
    primary:
      podIndex: 1   # Indicates the pod index to promote to primary
```

2. **Check cluster status**  

```bash
➜  ~ kubectl get mariadb
NAME            READY   STATUS    PRIMARY           UPDATES                    AGE
mysql-example   True    Running   mysql-example-1   ReplicasFirstPrimaryLast   84m
➜  ~ 
```

### ♻️ Restore a MariaDB/MySQL Backup

Backups are managed with **Restic** and stored in an S3-compatible bucket.  
Restoration allows recovering a database from an existing snapshot.

##### 1. List available snapshots

To display all stored backups:  

```bash
restic -r s3:s3.example.org/mariadb-backups/database_name snapshots
```

##### 2. Restore the latest snapshot

```bash
restic -r s3:s3.example.org/mariadb-backups/database_name restore latest --target /tmp/
```

## Known Issues

- Replication can't be finished with various errors
- Replication can't be finished in case if binlog purged Until mariadbbackup is not used to bootstrap a node by mariadb-operator (this feature is not inmplemented yet), follow these manual steps to fix it: https://github.com/mariadb-operator/mariadb-operator/issues/141#issuecomment-1804760231
- Corrupted indicies Sometimes some indecies can be corrupted on master replica, you can recover them from slave

```bash
mysqldump -h <slave> -P 3306 -u<user> -p<password> --column-statistics=0 <database> <table> ~/tmp/fix-table.sql
mysql -h <master> -P 3306 -u<user> -p<password> <database> < ~/tmp/fix-table.sql
```

