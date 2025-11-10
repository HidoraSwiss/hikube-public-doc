---
sidebar_position: 2
title: Quick Start
---

# Deploy PostgreSQL in 5 minutes

This guide walks you through deploying your first **PostgreSQL** database on Hikube, from installation to first connection.

---

## Objectives

By the end of this guide, you will have:  

- A **PostgreSQL** database deployed on Hikube  
- A replicated cluster with a **primary** and **replicas** to ensure high availability  
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

## Step 1: Create YAML to Deploy PostgreSQL

### **Prepare the manifest file**

Create a `postgresql.yaml` file as below:

```yaml title="postgresql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: example
  namespace: default
spec:
  # backup configuration
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
  # database creation  
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
  external: true # create LoadBalancer service if true (with public IP)
  # define PostgreSQL parameters
  postgresql:
    parameters:
      max_connections: 200
  quorum:
    maxSyncReplicas: 0
    minSyncReplicas: 0  
  replicas: 3 # total number of postgresql instances
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

### **Deploy the PostgreSQL YAML**

```bash
# Apply the YAML
kubectl apply -f postgresql.yaml
```

## Step 2: Verification and Tests

Once the application is deployed, verify that everything works:

```bash
# Check status (may take 1-2 minutes)
➜  ~ kubectl get postgreses
NAME      READY   AGE     VERSION
example   True    1m36s   0.18.0


# Check if application pods are running
# With my example you should have 3 "example" pods on different datacenters
➜  ~ kubectl get po -o wide  | grep postgres
postgres-example-1                                1/1     Running     0             23m   10.244.117.142   gld-csxhk-006   <none>           <none>
postgres-example-2                                1/1     Running     0             19m   10.244.117.168   luc-csxhk-005   <none>           <none>
postgres-example-3                                1/1     Running     0             18m   10.244.117.182   plo-csxhk-004   <none>           <none>

# Verify we have 3 PVCs (1 PVC per PostgreSQL)
➜  ~ kubectl get pvc | grep postgres
postgres-example-1                         Bound     pvc-36fbac70-f976-4ef5-ae64-29b06817b18a   10Gi       RWO            local          <unset>                 9m43s
postgres-example-2                         Bound     pvc-f042a765-0ffd-46e5-a1f2-c703fe59b56c   10Gi       RWO            local          <unset>                 8m38s
postgres-example-3                         Bound     pvc-1dcbab1f-18c1-4eae-9b12-931c8c2f9a74   10Gi       RWO            local          <unset>                 4m28s

# You can retrieve the username, password of your PostgreSQL if needed
➜  ~ kubectl get secret postgres-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'

airflow: qwerty123
debezium: tJ7H4RLTEYckNY7C
user1: strongpassword
user2: hackme


# Port-forward the service to access it from your workstation, or modify the external parameter like this "external: true"
# It is recommended not to open the DB to the outside if you don't need it
➜  ~ kubectl get svc | grep postgre  
postgres-example-external-write      LoadBalancer   10.96.171.243   91.223.132.64   5432/TCP                     10m
postgres-example-r                   ClusterIP      10.96.18.28     <none>          5432/TCP                     10m
postgres-example-ro                  ClusterIP      10.96.238.251   <none>          5432/TCP                     10m
postgres-example-rw                  ClusterIP      10.96.59.254    <none>          5432/TCP                     10m

# Connection test from my terminal
➜  ~ psql -h 91.223.132.64 -U user1 myapp   
Password for user user1: 

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

## 📋 Summary

You have deployed:  

- A **PostgreSQL** database on your Hikube tenant  
- A replicated cluster with a **primary** and **standby** for high availability  
- Configured users and roles, with passwords stored in Kubernetes Secrets  
- Persistent storage (PVC) attached to each PostgreSQL instance  
- Secure access via `psql` (internal service or LoadBalancer)  
- The ability to enable automatic **S3 backups**

