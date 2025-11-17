---
sidebar_position: 2
title: Quick Start
---

# Deploy ClickHouse in 5 minutes

This guide walks you through deploying your first **ClickHouse** database on Hikube in **a few minutes**!

---

## Objectives

By the end of this guide, you will have:  

- A **ClickHouse** database deployed on Hikube  
- An initial configuration with **shards** and **replicas** adapted to your needs  
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

## Step 1: Create ClickHouse YAML

### **Prepare the manifest file**

Create a `clickhouse.yaml` file as below:

```yaml title="clickhouse.yaml"
apiVersion: apps.cozystack.io/v1alpha1
appVersion: 0.13.0
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

### **Deploy the ClickHouse YAML**

```bash
# Apply the YAML
kubectl apply -f clickhouse.yaml
```

## Step 2: Verification and Tests

Once the application is deployed, verify that everything works:

```bash
# Check status (may take 1-2 minutes)
➜  ~ kubectl get clickhouse
NAME      READY   AGE     VERSION
example   True    2m48s   0.13.0

# Check if application pods are running
➜  ~ kubectl get po | grep clickhouse
chi-clickhouse-example-clickhouse-0-0-0           1/1     Running     0             3m43s
chi-clickhouse-example-clickhouse-0-1-0           1/1     Running     0             2m28s
chk-clickhouse-example-keeper-cluster1-0-0-0      1/1     Running     0             3m17s
chk-clickhouse-example-keeper-cluster1-0-1-0      1/1     Running     0             2m50s
chk-clickhouse-example-keeper-cluster1-0-2-0      1/1     Running     0             2m28s

# You can retrieve the username, password of your database
  ~ kubectl get secret clickhouse-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'

backup: vIdZUNiaLKaVbIvl
user1: strongpassword
user2: hackme



# Port-forward the service to access it locally, or modify the service as a LoadBalancer
kubectl port-forward svc/chendpoint-clickhouse-example 9000:9000

# In another terminal connect and verify ClickHouse version
➜  ~ clickhouse-client \
  --host 127.0.0.1 \
  --port 9000 \
  --user user1 \
  --password 'strongpassword' \
  --query "SHOW DATABASES; "
INFORMATION_SCHEMA
default
information_schema
system
```

---

## 📋 Summary

You have deployed:  

- A **ClickHouse** database on your Hikube tenant  
- An initial configuration with **shards** and **replicas**  
- A **ClickHouse Keeper** component for cluster coordination  
- Persistent storage attached for your data and logs  
- Users with generated passwords stored in a Kubernetes Secret  
- Access to your database via `clickhouse-client`
- The ability to configure automatic **S3 backups**  

