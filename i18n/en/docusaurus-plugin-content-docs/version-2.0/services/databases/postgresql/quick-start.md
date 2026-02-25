---
sidebar_position: 2
title: Quick Start
---

# Deploy PostgreSQL in 5 minutes

This guide walks you through deploying your first **PostgreSQL** database on Hikube, from setup to your first connection.

---

## Objectives

By the end of this guide, you will have:

- A **PostgreSQL** database deployed on Hikube
- A replicated cluster with a **primary** and **replicas** for high availability
- A user and password to connect
- Persistent storage to preserve your data

---

## Prerequisites

Before starting, make sure you have:

- **kubectl** configured with your Hikube kubeconfig
- **Administrator rights** on your tenant
- A **namespace** available to host your database
- (Optional) An **S3-compatible** bucket if you want to enable automatic backups via CloudNativePG

---

## Step 1: Create the PostgreSQL manifest

### **Prepare the manifest file**

Create a `postgresql.yaml` file as shown below:

```yaml title="postgresql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: example
spec:
  # configuration backup
  backup:
    enabled: false
    destinationPath: s3://bucket/path/to/folder/
    endpointURL: http://minio-gateway-service:9000
    retentionPolicy: 30d
    s3AccessKey: <your-access-key>
    s3SecretKey: <your-secret-key>
    schedule: 0 2 * * * *
  bootstrap:
    enabled: false
    oldName: ""
    recoveryTime: ""
  # creation databases
  databases:
    airflow:
      extensions:
      - hstore
      roles: # assign roles to the database
        admin:
        - airflow
    myapp:
      roles:
        admin:
        - user1
        - debezium
        readonly:
        - user2
  external: true # create service LoadBalancer if true (with public IP)
  # define parameters about postgresql
  postgresql:
    parameters:
      max_connections: 200
  quorum:
    maxSyncReplicas: 0
    minSyncReplicas: 0
  replicas: 3 # total number of postgresql instance
  resources:
    cpu: 3000m
    memory: 3Gi
  resourcesPreset: micro
  size: 10Gi
  storageClass: ""
  # create users
  users:
    airflow:
      password: qwerty123
    debezium:
      replication: true
    user1:
      password: strongpassword
    user2:
      password: hackme
```

### **Deploy the PostgreSQL yaml**

```bash
# Apply the yaml
kubectl apply -f postgresql.yaml
```

---

## Step 2: Deployment verification

Check the status of your PostgreSQL cluster (may take 1-2 minutes):

```bash
kubectl get postgreses
```

**Expected output:**

```console
NAME      READY   AGE     VERSION
example   True    1m36s   0.18.0
```

---

## Step 3: Pod verification

Verify that the application pods are in `Running` state:

```bash
kubectl get po -o wide | grep postgres
```

**Expected output:**

```console
postgres-example-1                                1/1     Running     0             23m   10.244.117.142   gld-csxhk-006   <none>           <none>
postgres-example-2                                1/1     Running     0             19m   10.244.117.168   luc-csxhk-005   <none>           <none>
postgres-example-3                                1/1     Running     0             18m   10.244.117.182   plo-csxhk-004   <none>           <none>
```

With `replicas: 3`, you get **3 PostgreSQL instances** distributed across different datacenters for high availability.

Verify that each instance has a persistent volume (PVC):

```bash
kubectl get pvc | grep postgres
```

**Expected output:**

```console
postgres-example-1                         Bound     pvc-36fbac70-f976-4ef5-ae64-29b06817b18a   10Gi       RWO            local          <unset>                 9m43s
postgres-example-2                         Bound     pvc-f042a765-0ffd-46e5-a1f2-c703fe59b56c   10Gi       RWO            local          <unset>                 8m38s
postgres-example-3                         Bound     pvc-1dcbab1f-18c1-4eae-9b12-931c8c2f9a74   10Gi       RWO            local          <unset>                 4m28s
```

---

## Step 4: Retrieve credentials

Passwords are stored in a Kubernetes Secret:

```bash
kubectl get secret postgres-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Expected output:**

```console
airflow: qwerty123
debezium: tJ7H4RLTEYckNY7C
user1: strongpassword
user2: hackme
```

---

## Step 5: Connection and testing

### External access (if `external: true`)

Check available services:

```bash
kubectl get svc | grep postgre
```

```console
postgres-example-external-write      LoadBalancer   10.96.171.243   91.223.132.64   5432/TCP                     10m
postgres-example-r                   ClusterIP      10.96.18.28     <none>          5432/TCP                     10m
postgres-example-ro                  ClusterIP      10.96.238.251   <none>          5432/TCP                     10m
postgres-example-rw                  ClusterIP      10.96.59.254    <none>          5432/TCP                     10m
```

### Access via port-forward (if `external: false`)

```bash
kubectl port-forward svc/postgres-example-rw 5432:5432
```

:::note
It is recommended not to expose the database externally if you do not need to.
:::

### Connection test with psql

```bash
psql -h 91.223.132.64 -U user1 myapp
```

```console
psql (17.4, server 17.2 (Debian 17.2-1.pgdg110+1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off, ALPN: postgresql)
Type "help" for help.

myapp=> \du
                                 List of roles
     Role name     |                         Attributes
-------------------+------------------------------------------------------------
 airflow           |
 airflow_admin     | No inheritance, Cannot login
 airflow_readonly  | No inheritance, Cannot login
 app               |
 debezium          | Replication
 myapp_admin       | No inheritance, Cannot login
 myapp_readonly    | No inheritance, Cannot login
 postgres          | Superuser, Create role, Create DB, Replication, Bypass RLS
 streaming_replica | Replication
 user1             |
 user2             |

myapp=>
```

---

## Step 6: Quick troubleshooting

### Pods in CrashLoopBackOff

```bash
# Check the logs of the failing pod
kubectl logs postgres-example-1

# Check the pod events
kubectl describe pod postgres-example-1
```

**Common causes:** insufficient memory (`resources.memory` too low), full storage volume, PostgreSQL configuration error in `postgresql.parameters`.

### PostgreSQL not accessible

```bash
# Check that services exist
kubectl get svc | grep postgres

# Check that the LoadBalancer has an external IP
kubectl describe svc postgres-example-external-write
```

**Common causes:** `external: false` in the manifest, LoadBalancer waiting for IP assignment, wrong service name in the connection string.

### Replication failure

```bash
# Check the CloudNativePG cluster status
kubectl describe postgres example

# Check the primary logs
kubectl logs postgres-example-1 -c postgres
```

**Common causes:** insufficient storage on a replica, network issue between nodes, misconfigured `quorum` parameters.

### General diagnostic commands

```bash
# Recent events on the namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Detailed PostgreSQL cluster status
kubectl describe postgres example
```

---

## Summary

You have deployed:

- A **PostgreSQL** database on your Hikube tenant
- A replicated cluster with a **primary** and **standby** instances for high availability
- Configured users and roles, with passwords stored in Kubernetes Secrets
- Persistent storage (PVC) attached to each PostgreSQL instance
- Secure access via `psql` (internal service or LoadBalancer)
- The option to enable automatic **S3 backups**

---

## Cleanup

To delete the test resources:

```bash
kubectl delete -f postgresql.yaml
```

:::warning
This action deletes the PostgreSQL cluster and all associated data. This operation is **irreversible**.
:::

---

## Next steps

- **[API Reference](./api-reference.md)**: Complete configuration of all PostgreSQL options
- **[Overview](./overview.md)**: Detailed architecture and PostgreSQL use cases on Hikube
