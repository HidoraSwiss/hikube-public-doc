---
sidebar_position: 2
title: Quick Start
---

# Deploy ClickHouse in 5 minutes

This guide walks you through deploying your first **ClickHouse** database on Hikube in **just a few minutes**!

---

## Objectives

By the end of this guide, you will have:

- A **ClickHouse** database deployed on Hikube
- An initial configuration with **shards** and **replicas** tailored to your needs
- A user and password to connect
- Persistent storage to preserve your data

---

## Prerequisites

Before starting, make sure you have:

- **kubectl** configured with your Hikube kubeconfig
- **Administrator rights** on your tenant
- A **namespace** available to host your database
- (Optional) An **S3-compatible** bucket if you want to enable automatic backups

---

## Step 1: Create the ClickHouse manifest

### **Prepare the manifest file**

Create a `clickhouse.yaml` file as shown below:

```yaml title="clickhouse.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: example
spec:
#   backup:
#     cleanupStrategy: --keep-last=3 --keep-daily=3 --keep-within-weekly=1m
#     enabled: false
#     resticPassword: <password>
#     s3AccessKey: <your-access-key>
#     s3Bucket: s3.example.org/clickhouse-backups
#     s3Region: us-east-1
#     s3SecretKey: <your-secret-key>
#     schedule: 0 2 * * *
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
  logStorageSize: 2Gi
  logTTL: 15
  replicas: 2
  resources:
    cpu: 3000m
    memory: 3Gi
  resourcesPreset: small
  shards: 1
  size: 10Gi
  storageClass: ""
  users:
    user1:
      password: strongpassword
    user2:
      readonly: true
      password: hackme
```

### **Deploy the ClickHouse yaml**

```bash
# Apply the yaml
kubectl apply -f clickhouse.yaml
```

---

## Step 2: Deployment verification

Check the status of your ClickHouse cluster (may take 1-2 minutes):

```bash
kubectl get clickhouse
```

**Expected output:**

```console
NAME      READY   AGE     VERSION
example   True    2m48s   0.13.0
```

---

## Step 3: Pod verification

Verify that the application pods are in `Running` state:

```bash
kubectl get po | grep clickhouse
```

**Expected output:**

```console
chi-clickhouse-example-clickhouse-0-0-0           1/1     Running     0             3m43s
chi-clickhouse-example-clickhouse-0-1-0           1/1     Running     0             2m28s
chk-clickhouse-example-keeper-cluster1-0-0-0      1/1     Running     0             3m17s
chk-clickhouse-example-keeper-cluster1-0-1-0      1/1     Running     0             2m50s
chk-clickhouse-example-keeper-cluster1-0-2-0      1/1     Running     0             2m28s
```

With `replicas: 2` and `shards: 1`, you get **2 ClickHouse pods** (shard replicas) and **3 ClickHouse Keeper pods** for cluster coordination.

---

## Step 4: Retrieve credentials

Passwords are stored in a Kubernetes Secret:

```bash
kubectl get secret clickhouse-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Expected output:**

```console
backup: vIdZUNiaLKaVbIvl
user1: strongpassword
user2: hackme
```

---

## Step 5: Connection and testing

### Port-forward the ClickHouse service

```bash
kubectl port-forward svc/chendpoint-clickhouse-example 9000:9000
```

### Connection test with clickhouse-client

In another terminal, connect and verify the ClickHouse version:

```bash
clickhouse-client \
  --host 127.0.0.1 \
  --port 9000 \
  --user user1 \
  --password 'strongpassword' \
  --query "SHOW DATABASES;"
```

**Expected output:**

```console
INFORMATION_SCHEMA
default
information_schema
system
```

---

## Step 6: Quick troubleshooting

### Pods in CrashLoopBackOff

```bash
# Check the logs of the failing ClickHouse pod
kubectl logs chi-clickhouse-example-clickhouse-0-0-0

# Check the pod events
kubectl describe pod chi-clickhouse-example-clickhouse-0-0-0
```

**Common causes:** insufficient memory (`resources.memory` too low), full storage volume, error in shard or replica configuration.

### ClickHouse not accessible

```bash
# Check that services exist
kubectl get svc | grep clickhouse

# Check the endpoint service
kubectl describe svc chendpoint-clickhouse-example
```

**Common causes:** port-forward not active, wrong port (9000 for native protocol, 8123 for HTTP), service not ready.

### ClickHouse Keeper not working

```bash
# Check the Keeper logs
kubectl logs chk-clickhouse-example-keeper-cluster1-0-0-0

# Check the Keeper pod status
kubectl get pods | grep keeper
```

**Common causes:** Keeper quorum requires an odd number of replicas (3 minimum recommended), insufficient Keeper disk space (`clickhouseKeeper.size` too low).

### General diagnostic commands

```bash
# Recent events on the namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Detailed ClickHouse cluster status
kubectl describe clickhouse example
```

---

## Summary

You have deployed:

- A **ClickHouse** database on your Hikube tenant
- An initial configuration with **shards** and **replicas**
- A **ClickHouse Keeper** component for cluster coordination
- Persistent storage attached for your data and logs
- Users with passwords generated and stored in a Kubernetes Secret
- Access to your database via `clickhouse-client`
- The option to configure automatic **S3 backups**

---

## Cleanup

To delete the test resources:

```bash
kubectl delete -f clickhouse.yaml
```

:::warning
This action deletes the ClickHouse cluster and all associated data. This operation is **irreversible**.
:::

---

## Next steps

- **[API Reference](./api-reference.md)**: Complete configuration of all ClickHouse options
- **[Overview](./overview.md)**: Detailed architecture and ClickHouse use cases on Hikube
