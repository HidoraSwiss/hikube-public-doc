---
sidebar_position: 2
title: Quick Start
---

# Deploy MySQL in 5 minutes

This guide walks you through deploying your first **MySQL** database on Hikube, from setup to your first connection.

---

## Objectives

By the end of this guide, you will have:

- An operational **MySQL** database on Hikube
- A replicated cluster with a **primary** and **replicas** for high availability
- **Users and passwords** to access your applications
- **Persistent storage** attached to each instance to ensure data durability
- (Optional) The option to enable **automatic backups** to S3-compatible storage

---

## Prerequisites

Before starting, make sure you have:

- **kubectl** configured with your Hikube kubeconfig
- **Administrator rights** on your tenant
- A **namespace** available to host your database
- (Optional) An **S3-compatible** bucket if you want to enable automatic backups via MariaDB-Operator

---

## Step 1: Create the MySQL manifest

### **Prepare the manifest file**

Create a `mysql.yaml` file as shown below:

```yaml title="mysql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example
spec:
  backup:
    cleanupStrategy: --keep-last=3 --keep-daily=3 --keep-within-weekly=1m
    enabled: false
    resticPassword: <password>
    s3AccessKey: <your-access-key>
    s3Bucket: s3.example.org/mysql-backups
    s3Region: us-east-1
    s3SecretKey: <your-secret-key>
    schedule: 0 2 * * *
  databases:
    myapp1:
      roles:
        admin:
        - user1
        readonly:
        - user2
  external: true
  replicas: 3
  resources:
    cpu: 3000m
    memory: 3Gi
  resourcesPreset: nano
  size: 10Gi
  storageClass: ""
  users:
    user1:
      maxUserConnections: 1000
      password: hackme
    user2:
      maxUserConnections: 1000
      password: hackme
```

### **Deploy the MySQL yaml**

```bash
# Apply the yaml
kubectl apply -f mysql.yaml
```

---

## Step 2: Deployment verification

Check the status of your MySQL cluster (may take 1-2 minutes):

```bash
kubectl get mysql
```

**Expected output:**

```console
NAME      READY   AGE     VERSION
example   True    1m16s   0.10.0
```

---

## Step 3: Pod verification

Verify that the application pods are in `Running` state:

```bash
kubectl get po -o wide | grep mysql
```

**Expected output:**

```console
mysql-example-0                                   1/1     Running     0             24m   10.244.123.64    gld-csxhk-006   <none>           <none>
mysql-example-1                                   1/1     Running     0             24m   10.244.123.65    luc-csxhk-005   <none>           <none>
mysql-example-2                                   1/1     Running     0             24m   10.244.123.66    plo-csxhk-001   <none>           <none>
mysql-example-metrics-747cf456c9-6vnq9            1/1     Running     0             23m   10.244.123.73    plo-csxhk-004   <none>           <none>
```

With `replicas: 3`, you get **3 MySQL instances** (1 primary + 2 replicas) distributed across different datacenters, plus a metrics pod.

Verify that each instance has a persistent volume (PVC):

```bash
kubectl get pvc | grep mysql
```

**Expected output:**

```console
storage-mysql-example-0                    Bound     pvc-3622a61d-7432-4a36-9812-953e30f85fbe   10Gi       RWO            local          <unset>                 24m
storage-mysql-example-1                    Bound     pvc-b9933029-c9c6-40c2-a67d-69dcb224a9bb   10Gi       RWO            local          <unset>                 24m
storage-mysql-example-2                    Bound     pvc-597da2f3-1604-416c-a480-2dae7aae75e1   10Gi       RWO            local          <unset>                 24m
```

---

## Step 4: Retrieve credentials

Passwords are stored in a Kubernetes Secret:

```bash
kubectl get secret mysql-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Expected output:**

```console
root: cr42msoxKhnEajfo
user1: hackme
user2: hackme
```

---

## Step 5: Connection and testing

### External access (if `external: true`)

Check available services:

```bash
kubectl get svc | grep mysql
```

```console
mysql-example                        ClusterIP      10.96.149.25    <none>          3306/TCP                     27m
mysql-example-internal               ClusterIP      None            <none>          3306/TCP                     27m
mysql-example-metrics                ClusterIP      10.96.101.154   <none>          9104/TCP                     26m
mysql-example-primary                LoadBalancer   10.96.161.170   91.223.132.64   3306:32537/TCP               27m
mysql-example-secondary              ClusterIP      10.96.105.28    <none>          3306/TCP                     27m
```

### Access via port-forward (if `external: false`)

```bash
kubectl port-forward svc/mysql-example 3306:3306
```

:::note
It is recommended not to expose the database externally if you do not need to.
:::

### Connection test with mysql

```bash
mysql -h 91.223.132.64 -u user1 -p myapp1
```

```console
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 1214
Server version: 11.0.2-MariaDB-1:11.0.2+maria~ubu2204-log mariadb.org binary distribution

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| myapp1             |
+--------------------+
2 rows in set (0.00 sec)

mysql>
```

---

## Step 6: Quick troubleshooting

### Pods in CrashLoopBackOff

```bash
# Check the logs of the failing pod
kubectl logs mysql-example-0

# Check the pod events
kubectl describe pod mysql-example-0
```

**Common causes:** insufficient memory (`resources.memory` too low), full storage volume, MariaDB configuration error.

### MySQL not accessible

```bash
# Check that services exist
kubectl get svc | grep mysql

# Check that the LoadBalancer has an external IP
kubectl describe svc mysql-example-primary
```

**Common causes:** `external: false` in the manifest, LoadBalancer waiting for IP assignment, wrong port or hostname in the connection string.

### Replication failure

```bash
# Check the MariaDB cluster status
kubectl get mariadb

# Inspect the MariaDB resource details
kubectl describe mariadb mysql-example
```

**Common causes:** binlog purged before a replica could synchronize, insufficient disk space, network issue between nodes.

### General diagnostic commands

```bash
# Recent events on the namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Detailed MySQL cluster status
kubectl describe mysql example
```

---

## Summary

You have deployed:

- A **MySQL** database on your Hikube tenant
- A replicated cluster with a **primary** and **replicas** to ensure service continuity
- Automatically created users, with their credentials stored in Kubernetes Secrets
- Persistent storage (PVC) dedicated to each MySQL pod to ensure data durability
- Secure access via the `mysql` client (port-forward or LoadBalancer)
- The option to configure **S3 backups** and restore when needed

---

## Cleanup

To delete the test resources:

```bash
kubectl delete -f mysql.yaml
```

:::warning
This action deletes the MySQL cluster and all associated data. This operation is **irreversible**.
:::

---

## Next steps

- **[API Reference](./api-reference.md)**: Complete configuration of all MySQL options
- **[Overview](./overview.md)**: Detailed architecture and MySQL use cases on Hikube
