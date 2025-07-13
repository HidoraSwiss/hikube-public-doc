---
title: FerretDB
---

FerretDB is a MongoDB-compatible database that uses PostgreSQL as a backend. It offers the simplicity of MongoDB while leveraging the robustness of PostgreSQL.

---

## Configuration Example

Here is a configuration example for FerretDB with enabled backups and custom replicas:

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: FerretDB
metadata:
  name: ferretdb-example
spec:
  external: true
  size: 20Gi
  replicas: 3
  storageClass: "replicated"
  quorum:
    minSyncReplicas: 1
    maxSyncReplicas: 2
  backup:
    enabled: false
  users:
    user1:
      password: "securepassword"
  #  s3Region: "us-east-1"
  #  s3Bucket: "s3.tenant.hikube.cloud/postgres-backups"
  #  schedule: "0 2 * * *"
  #  cleanupStrategy: "--keep-last=5 --keep-daily=5 --keep-within-weekly=1m"
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

These parameters allow you to configure the fundamental aspects of FerretDB.

| **Name**                | **Description**                                                                                        | **Default Value** |
|--------------------------|--------------------------------------------------------------------------------------------------------|------------------------|
| `external`              | Allows external access to FerretDB from outside the cluster.                                           | `false`               |
| `size`                  | Size of the main persistent volume.                                                                   | `10Gi`                |
| `replicas`              | Number of PostgreSQL replicas for FerretDB.                                                           | `2`                   |
| `storageClass`          | Kubernetes storage class used for data.                                                               | `"replicated"` or `"local"`   |
| `quorum.minSyncReplicas`| Minimum number of synchronous replicas required for a transaction to be considered validated.          | `0`                   |
| `quorum.maxSyncReplicas`| Maximum number of synchronous replicas that can validate a transaction (must be less than the total number of instances). | `0`                   |

---

### **Configuration Parameters**

| **Name**  | **Description**                                                      | **Default Value** |
|----------|----------------------------------------------------------------------|------------------------|
| `users`  | FerretDB users configuration. Each user can have custom permissions. | `{}`                  |

**Example**:

```yaml
users:
  user1:
    password: strongpassword
  user2:
    readonly: true
    password: hackme
```

---

### **Backup Parameters**

These parameters allow you to configure periodic backups of FerretDB.

| **Name**                | **Description**                                        | **Default Value**                         |
|---------------------------|----------------------------------------------------------|-----------------------------------------------|
| `backup.enabled`         | Enables or disables periodic backups.                    | `false`                                      |
| `backup.s3Region`        | AWS S3 region where backups are stored.                   | `us-east-1`                                  |
| `backup.s3Bucket`        | S3 bucket name used for storing backups.                  | `s3.example.org/postgres-backups`            |
| `backup.schedule`        | Backup schedule (in Cron format).                         | `0 2 * * *`                                  |
| `backup.cleanupStrategy` | Strategy for cleaning up old backups.                     | `--keep-last=3 --keep-daily=3 --keep-within-weekly=1m` |
| `backup.s3AccessKey`     | AWS S3 access key for authentication.                     | `oobaiRus9pah8PhohL1ThaeTa4UVa7gu`           |
| `backup.s3SecretKey`     | AWS S3 secret key for authentication.                     | `ju3eum4dekeich9ahM1te8waeGai0oog`           |
| `backup.resticPassword`  | Password used for encrypting Restic backups.              | `ChaXoveekoh6eigh4siesheeda2quai0`           |

---

## Restoring a Backup

You can restore a FerretDB backup using Restic. Here are the main steps:

### Finding a Snapshot

Use the following command to list available snapshots in your S3 bucket:

```bash
restic -r s3:s3.tenant.hikube.cloud/ferretdb-backups/table_name snapshots
```

### Restoring the Snapshot

To restore the most recent snapshot, run the following command specifying a restoration target:

```bash
restic -r s3:s3.tenant.hikube.cloud/ferretdb-backups/table_name restore latest --target /tmp/
```

---

## Additional Resources

To deepen your knowledge of FerretDB and its features, here are some useful resources:

- [**Official FerretDB Documentation**](https://github.com/FerretDB/FerretDB)
  Discover technical details, configuration options, and usage examples for FerretDB.

- [**Restic Guide**](https://restic.readthedocs.io/)
  Learn how to use Restic for backup management, including best practices for encryption and restoration.

- [**Tutorial: Cron Format**](https://crontab.guru/)
  A practical tool for creating and understanding Cron expressions used for scheduled backups.
