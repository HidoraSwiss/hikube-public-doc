---
sidebar_position: 2
title: Quick Start
---

# Deploy MySQL in 5 minutes

This guide walks you through deploying your first **MySQL** database on Hikube, from installation to first connection.

---

## Objectives

By the end of this guide, you will have:  

- An operational **MySQL** database on Hikube  
- A replicated cluster with a **primary** and **replicas** to ensure high availability  
- **Users and passwords** to access your applications  
- **Persistent storage** attached to each instance to guarantee data durability  
- (Optional) The ability to enable **automatic backups** to S3-compatible storage  

---

## Prerequisites

Before starting, make sure you have:  

- **kubectl** configured with your Hikube kubeconfig  
- **Administrator rights** on your tenant  
- A **namespace** available to host your database  
- (Optional) An **S3-compatible** bucket if you want to enable automatic backups via MariaDB-Operator  

---

## Step 1: Create YAML to Deploy MySQL

### **Prepare the manifest file**

Create a `mysql.yaml` file as below:

```yaml title="mysql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example
  namespace: default
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

### **Deploy the MySQL YAML**

```bash
# Apply the YAML
kubectl apply -f mysql.yaml
```

Once the application is deployed, verify that everything works:

```bash
# Check status (may take 1-2 minutes)
➜  ~ kubectl get mysql 
NAME      READY   AGE   VERSION
example   True    1m16s   0.10.0

# Check if application pods are running
# With my example you should have 3 "example" pods on different datacenters
➜  ~ kubectl get po -o wide  | grep mysql
mysql-example-0                                   1/1     Running     0             24m   10.244.123.64    gld-csxhk-006   <none>           <none>
mysql-example-1                                   1/1     Running     0             24m   10.244.123.65    luc-csxhk-005   <none>           <none>
mysql-example-2                                   1/1     Running     0             24m   10.244.123.66    plo-csxhk-001   <none>           <none>
mysql-example-metrics-747cf456c9-6vnq9            1/1     Running     0             23m   10.244.123.73    plo-csxhk-004   <none>           <none>

# Verify we have 3 PVCs (1 PVC per MySQL)
➜  ~ kubectl get pvc | grep mysql
storage-mysql-example-0                    Bound     pvc-3622a61d-7432-4a36-9812-953e30f85fbe   10Gi       RWO            local          <unset>                 24m
storage-mysql-example-1                    Bound     pvc-b9933029-c9c6-40c2-a67d-69dcb224a9bb   10Gi       RWO            local          <unset>                 24m
storage-mysql-example-2                    Bound     pvc-597da2f3-1604-416c-a480-2dae7aae75e1   10Gi       RWO            local          <unset>                 24m

# You can retrieve the username, password of your MySQL if needed
➜  ~ kubectl get secret mysql-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'

root: cr42msoxKhnEajfo
user1: hackme
user2: hackme

# Port-forward the service to access it from your workstation, or modify the external parameter like this "external: true"
# It is recommended not to open the DB to the outside if you don't need it
➜  ~ kubectl get svc | grep mysql    
mysql-example                        ClusterIP      10.96.149.25    <none>          3306/TCP                     27m
mysql-example-internal               ClusterIP      None            <none>          3306/TCP                     27m
mysql-example-metrics                ClusterIP      10.96.101.154   <none>          9104/TCP                     26m
mysql-example-primary                LoadBalancer   10.96.161.170   91.223.132.64   3306:32537/TCP               27m
mysql-example-secondary              ClusterIP      10.96.105.28    <none>          3306/TCP                     27m

# Connection test from my terminal
➜  ~ mysql -h 91.223.132.64 -u user1 -p myapp1
Enter password: 
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

## 📋 Summary

You have deployed:  

- A **MySQL** database on your Hikube tenant  
- A replicated cluster with a **primary** and **replicas** to ensure service continuity  
- Automatically created users, with their credentials stored in Kubernetes Secrets  
- Persistent storage (PVC) dedicated to each MySQL pod to guarantee data durability  
- Secure access via the `mysql` client (port-forward or LoadBalancer)  
- The ability to configure **S3 backups** and restore if needed  

