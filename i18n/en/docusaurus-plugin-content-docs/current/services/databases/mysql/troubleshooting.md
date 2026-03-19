---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — MySQL

### Broken replication (purged binlog)

**Cause**: the binary log (binlog) was purged on the primary before the replica could read it. This is a known issue with the MariaDB Operator when `mariadbbackup` is not yet used to initialize nodes.

**Solution**:

1. Identify the desynchronized replica:
   ```bash
   kubectl get pods -l app=mysql-<name>
   ```
2. Perform a dump from a working replica and restore it on the primary:
   ```bash
   mysqldump -h <replica-host> -P 3306 -u<user> -p<password> --column-statistics=0 <database> <table> > fix-table.sql
   mysql -h <primary-host> -P 3306 -u<user> -p<password> <database> < fix-table.sql
   ```
3. Verify that replication resumes correctly after the restore.

:::note
This issue is tracked in the [MariaDB Operator](https://github.com/mariadb-operator/mariadb-operator/issues/141). An automatic fix is planned for future versions of the operator.
:::

### Restic backup failed

**Cause**: S3 credentials are incorrect, the endpoint is unreachable, or the `resticPassword` does not match the one used when the repository was initialized.

**Solution**:

1. Check the backup pod logs:
   ```bash
   kubectl logs -l app=mysql-<name>-backup
   ```
2. Make sure the S3 parameters are correct in your manifest:
   - `s3Bucket`: the bucket exists and is accessible
   - `s3AccessKey` / `s3SecretKey`: the keys are valid
   - `s3Region`: the region matches the bucket location
3. Verify that the `resticPassword` is identical to the one used during the first backup. Changing the password makes old backups inaccessible.
4. Test connectivity to the S3 endpoint from the cluster.

### Connection refused

**Cause**: MySQL pods are not running, the Secret name is incorrect, or the `maxUserConnections` limit has been reached.

**Solution**:

1. Check that pods are in `Running` state:
   ```bash
   kubectl get pods -l app=mysql-<name>
   ```
2. Get the credentials from the Secret. The pattern is `mysql-<name>-auth`:
   ```bash
   kubectl get tenantsecret mysql-<name>-auth -o jsonpath='{.data.password}' | base64 -d
   ```
3. Check that the `maxUserConnections` limit has not been reached for the concerned user.
4. Test the connection from a pod within the cluster:
   ```bash
   kubectl run test-mysql --rm -it --image=mariadb:11 -- mysql -h mysql-<name> -P 3306 -u<user> -p
   ```

### Pod in CrashLoopBackOff

**Cause**: the pod keeps restarting, usually due to memory issues (OOMKilled) or invalid configuration.

**Solution**:

1. Check the previous pod logs to identify the error:
   ```bash
   kubectl logs mysql-<name>-0 --previous
   ```
2. Check if the pod was killed due to memory overflow (OOMKilled):
   ```bash
   kubectl describe pod mysql-<name>-0 | grep -i oom
   ```
3. If it is a memory issue, increase the `resourcesPreset` or define explicit `resources`:
   ```yaml title="mysql.yaml"
   spec:
     resourcesPreset: medium    # Switch from nano/micro to medium or higher
   ```
4. Apply the change and wait for the restart:
   ```bash
   kubectl apply -f mysql.yaml
   ```

### Disk space full

**Cause**: the persistent volume is saturated by data, binary logs, or temporary files.

**Solution**:

1. Check disk usage inside the pod:
   ```bash
   kubectl exec mysql-<name>-0 -- df -h /var/lib/mysql
   ```
2. Increase the volume size in your manifest:
   ```yaml title="mysql.yaml"
   spec:
     size: 20Gi    # Increase from the current value
   ```
3. Apply the change:
   ```bash
   kubectl apply -f mysql.yaml
   ```
4. If the issue is urgent, clean up obsolete data from a MySQL client.

:::warning
Never reduce the `size` value. Volume expansion is supported, but shrinking is not.
:::
