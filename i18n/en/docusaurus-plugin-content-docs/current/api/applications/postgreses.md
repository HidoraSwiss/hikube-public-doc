---
title: PostgreSQL
---

PostgreSQL is one of the most popular choices among relational databases, known for its robust features and high performance. The **Managed PostgreSQL** service offers a self-healing replicated cluster.

---

## Configuration Example

Here is a YAML configuration example for a PostgreSQL deployment with two replicas and enabled backups:

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: postgres-example
spec:
  external: false
  size: 20Gi
  replicas: 3
  storageClass: "local"
  postgresql:
    parameters:
      max_connections: 200
  quorum:
    minSyncReplicas: 1
    maxSyncReplicas: 2
  users:
    user1:
      password: "securepassword"
    user2:
      password: "readonlypassword"
    airflow:
      password: "airflowpassword"
    debezium:
      replication: true
  databases:
    myapp:
      roles:
        admin:
        - user1
        - debezium
        readonly:
        - user2
    airflow:
      roles:
        admin:
        - airflow
      extensions:
      - hstore
  backup:
    enabled: false
  #  s3Region: "us-west-2"
  #  s3Bucket: "s3.tenant.hikube.cloud/postgres-backups"
  #  schedule: "0 3 * * *"
  #  cleanupStrategy: "--keep-last=5 --keep-daily=7 --keep-within-weekly=2m"
  #  s3AccessKey: "your-s3-access-key"
  #  s3SecretKey: "your-s3-secret-key"
  #  resticPassword: "your-restic-password"
```

Using the kubeconfig provided by Hikube and this example yaml, saved as a `manifest.yaml` file, you can easily test the application deployment using the following command:

```sh
kubectl apply -f manifest.yaml
```

---

## Configurable Parameters

### **General Parameters**

| **Name**                    | **Description**                                                                                | **Default Value** |
|------------------------------|-----------------------------------------------------------------------------------------------------|------------------------|
| `external`                  | Allows external access from outside the cluster.                                                | `false`               |
| `size`                      | Size of the persistent volume for data.                                                        | `10Gi`                |
| `replicas`                  | Number of PostgreSQL replicas.                                                                 | `2`                   |
| `storageClass`              | Storage class used for data.                                                                   | `"replicated"` or `"local"` |
| `postgresql.parameters.max_connections` | Maximum number of simultaneous connections to the PostgreSQL server.                     | `100`                 |
| `quorum.minSyncReplicas`    | Minimum number of synchronous replicas required to validate a transaction.                     | `0`                   |
| `quorum.maxSyncReplicas`    | Maximum number of synchronous replicas that can validate a transaction (must be less than the total number of instances). | `0`                   |

---

### **Configuration Parameters**

| **Name**    | **Description**               | **Default Value** |
|--------------|------------------------------------|------------------------|
| `users`      | Users configuration.               | `{}`                  |
| `databases`  | Databases configuration.           | `{}`                  |

**Example:**

```yaml
users:
  user1:
    password: strongpassword
  user2:
    password: hackme
  airflow:
    password: qwerty123
  debezium:
    replication: true

databases:
  myapp:
    roles:
      admin:
      - user1
      - debezium
      readonly:
      - user2
  airflow:
    roles:
      admin:
      - airflow
    extensions:
    - hstore
```

---

### **Backup Parameters**

| **Name**               | **Description**                                | **Default Value**                         |
|---------------------------|----------------------------------------------------|-----------------------------------------------|
| `backup.enabled`         | Enables or disables periodic backups.              | `false`                                      |
| `backup.s3Region`        | AWS S3 region for backups.                         | `us-east-1`                                  |
| `backup.s3Bucket`        | S3 bucket used for backups.                        | `s3.example.org/postgres-backups`            |
| `backup.schedule`        | Backup schedule (Cron format).                     | `0 2 * * *`                                  |
| `backup.cleanupStrategy` | Strategy for cleaning up old backups.              | `--keep-last=3 --keep-daily=3 --keep-within-weekly=1m` |
| `backup.s3AccessKey`     | AWS S3 access key for authentication.              | `oobaiRus9pah8PhohL1ThaeTa4UVa7gu`           |
| `backup.s3SecretKey`     | AWS S3 secret key for authentication.              | `ju3eum4dekeich9ahM1te8waeGai0oog`           |
| `backup.resticPassword`  | Password for Restic encryption.                    | `ChaXoveekoh6eigh4siesheeda2quai0`           |

---

## Tutorials

### How to switch Master/Slave replica

To perform a manual failover of replicas in the cluster, follow the detailed instructions in the [official CloudNativePG documentation](https://cloudnative-pg.io/documentation/1.15/rolling_update/#manual-updates-supervised).

### How to restore a backup

1. Find an available snapshot in your S3 bucket:
   - Command: `restic -r s3:s3.tenant.hikube.cloud/postgres-backups/database_name snapshots`
2. Restore the latest snapshot:
   - Command: `restic -r s3:s3.tenant.hikube.cloud/postgres-backups/database_name restore latest --target /tmp/`
3. See the **Additional Resources** section for details on Restic.

---

## Additional Resources

- **[Restic Guide](https://itnext.io/restic-effective-backup-from-stdin-4bc1e8f083c1)**
  Learn how to use Restic to manage your backups.
