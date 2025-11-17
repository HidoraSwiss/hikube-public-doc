---
sidebar_position: 2
title: Quick Start
---

# Deploy Redis in 5 minutes

This guide walks you step by step through deploying your first **Redis** cluster on Hikube, to use it as a distributed cache or high-performance in-memory database.  

---

## Objectives

By the end of this guide, you will have:  

- A **Redis** cluster deployed on Hikube  
- An architecture composed of a **master** and **replicas** to guarantee high availability  
- Secure Redis access with your authentication credentials  
- Persistent storage attached to preserve data beyond restarts  

---

## Prerequisites

Before starting, make sure you have:  

- **kubectl** configured with your Hikube kubeconfig  
- **Administrator rights** on your tenant  
- A dedicated **namespace** to host your Redis cluster  

---

## Step 1: Create YAML to Deploy Redis

### **Prepare the manifest file**

Create a `redis.yaml` file as below:

```yaml title="redis.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: example
  namespace: default
spec:
  authEnabled: true
  external: true
  replicas: 3
  resources:
    cpu: 3000m
    memory: 3Gi
  resourcesPreset: nano
  size: 1Gi
  storageClass: ""
```

### **Deploy the Redis YAML**

```bash
# Apply the YAML
kubectl apply -f redis.yaml
```

## Step 2: Verification and Tests

Once the application is deployed, verify that everything works:

```bash
# Check status (may take 1-2 minutes)
➜  ~ kubectl get redis
NAME      READY   AGE     VERSION
example   True    1m39s   0.10.0

# Check if application pods are running
# With my example you should have 6 "example" pods on different datacenters
# 3 redis pods and 3 redis sentinel pods
➜  ~ kubectl get po -o wide  | grep redis
rfr-redis-example-0                               2/2     Running     0              7m7s    10.244.2.109   gld-csxhk-006   <none>           <none>
rfr-redis-example-1                               2/2     Running     0              7m7s    10.244.2.114   luc-csxhk-005   <none>           <none>
rfr-redis-example-2                               2/2     Running     0              7m7s    10.244.2.111   plo-csxhk-004   <none>           <none>
rfs-redis-example-7b65c79ccb-dkqqz                1/1     Running     0              7m7s    10.244.2.112   luc-csxhk-005   <none>           <none>
rfs-redis-example-7b65c79ccb-kvjt8                1/1     Running     0              7m7s    10.244.2.108   gld-csxhk-006   <none>           <none>
rfs-redis-example-7b65c79ccb-xwk7v                1/1     Running     0              7m7s    10.244.2.110   plo-csxhk-004   <none>           <none>

# You can retrieve the username, password of your PostgreSQL if needed
➜  ~ kubectl get secret redis-example-auth -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'

password: QkP9bhppEFCQcXIXLzEAhAUBlMYEVFNZ

# Port-forward the service to access it from your workstation, or modify the external parameter like this "external: true"
# It is recommended not to open the DB to the outside if you don't need it

➜  ~  kubectl get svc | grep redis
redis-example-external-lb            LoadBalancer   10.96.156.151   91.223.132.41   6379/TCP                     13m
redis-example-metrics                ClusterIP      10.96.58.67     <none>          9121/TCP                     13m
rfr-redis-example                    ClusterIP      None            <none>          9121/TCP                     13m
rfrm-redis-example                   ClusterIP      10.96.109.194   <none>          6379/TCP                     13m
rfrs-redis-example                   ClusterIP      10.96.118.28    <none>          6379/TCP                     13m
rfs-redis-example                    ClusterIP      10.96.176.169   <none>          26379/TCP                    13m


# Connection test from my terminal
# Retrieve the password
REDIS_PASSWORD=$(kubectl get secret redis-example-auth -o jsonpath="{.data.password}" | base64 -d)

# Test Redis version
➜  ~ redis-cli -h 91.223.132.41 -p 6379 -a "$REDIS_PASSWORD" ping
PONG

# Create a key
➜  ~ redis-cli -h 91.223.132.41 -p 6379 -a "$REDIS_PASSWORD" SET hello "hikube"
OK

# Read the key
➜  ~ redis-cli -h 91.223.132.41 -p 6379 -a "$REDIS_PASSWORD" GET hello
"hikube"
```

