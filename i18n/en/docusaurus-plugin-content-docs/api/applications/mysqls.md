---
title: MariaDB/MySQL
---

The **Managed MariaDB** service offers a powerful and widely used relational database solution. This service allows you to easily create and manage a replicated MariaDB cluster.

---

## Configuration Example

Here is a YAML configuration example for a MariaDB deployment with two replicas and enabled backups:

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: mariadb-example
spec:
  external: true
  size: 20Gi
  replicas: 2
  storageClass: "replicated"
  users:
    admin:
      password: "secure-password"
  databases:
    mydb:
      roles:
        admin:
          - admin
  backup:
    enabled: false
  #  s3Region: "us-east-1"
  #  s3Bucket: "s3.tenant.hikube.cloud/mariadb-backups"
  #  schedule: "0 2 * * *"
  #  cleanupStrategy: "--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"
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

| **Name**      | **Description**                                  | **Default Value** |
|-----------------|------------------------------------------------------|------------------------|
| `external`     | Allows external access from outside the cluster. | `false`               |
| `size`         | Size of the persistent volume for data.          | `10Gi`                |
| `replicas`     | Number of MariaDB replicas.                      | `2`                   |
| `storageClass` | Storage class used.                               | `"replicated"` or `"local"`  |

---

### **Configuration Parameters**

| **Name**    | **Description**              | **Default Value** |
|--------------|-----------------------------------|------------------------|
| `users`      | Users configuration.              | `{}`                  |
| `databases`  | Databases configuration.          | `{}`                  |

---

### **Backup Parameters**

| **Name**               | **Description**                                | **Default Value**                         |
|---------------------------|----------------------------------------------------|-----------------------------------------------|
| `backup.enabled`         | Enables or disables periodic backups.              | `false`                                      |
| `backup.s3Region`        | AWS S3 region for backups.                         | `us-east-1`                                  |
| `backup.s3Bucket`        | S3 bucket used for backups.                        | `s3.example.org/mariadb-backups`             |
| `backup.schedule`        | Backup schedule (Cron format).                     | `0 2 * * *`                                  |
| `backup.cleanupStrategy` | Strategy for cleaning up old backups.              | `--keep-last=3 --keep-daily=3 --keep-within-weekly=1m` |
| `backup.s3AccessKey`     | AWS S3 access key for authentication.              | `oobaiRus9pah8PhohL1ThaeTa4UVa7gu`           |
| `backup.s3SecretKey`     | AWS S3 secret key for authentication.              | `ju3eum4dekeich9ahM1te8waeGai0oog`           |
| `backup.resticPassword`  | Password for Restic encryption.                    | `ChaXoveekoh6eigh4siesheeda2quai0`           |

---

## Tutorials

### Master/Slave Failover

1. Modify the MariaDB instance to set a new primary replica. Use the following command to edit the instance:

```bash
kubectl edit mariadb <instance>
```

2. Modify the configuration to set the primary pod:

```yaml
spec.replication.primary.podIndex: 1
```

3. Check the cluster status:

```bash
kubectl get mariadb
```

### Restoring a Backup

1. Find an available snapshot in your S3 bucket:

```bash
restic -r s3:s3.tenant.hikube.cloud/mariadb-backups/database_name snapshots
```

2. Restore the latest snapshot:

```bash
restic -r s3:s3.tenant.hikube.cloud/mariadb-backups/database_name restore latest --target /tmp/
```

---

## Additional Resources

To deepen your knowledge of MariaDB and its operator, check the following resources:

- **[Official MariaDB Documentation](https://mariadb.com/kb/en/documentation/)**
  Comprehensive guide for using and configuring MariaDB.

- **[Restic Guide](https://itnext.io/restic-effective-backup-from-stdin-4bc1e8f083c1)**
  Learn how to use Restic to manage your backups, with practical examples.
