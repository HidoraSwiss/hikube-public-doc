---
sidebar_position: 2
title: Quick Start
---

# Deploy RabbitMQ in 5 minutes

This guide walks you step by step through deploying your first **RabbitMQ cluster** on Hikube, from the YAML manifest to initial messaging tests.

---

## Objectives

By the end of this guide, you will have:

- A **RabbitMQ cluster** deployed and running on Hikube
- **3 replicated RabbitMQ nodes** for high availability
- A **vhost** and an **admin user** configured
- **Persistent storage** for RabbitMQ data
- Access to the **Management UI**

---

## Prerequisites

Before you begin, make sure you have:

- **kubectl** configured with your Hikube kubeconfig
- **Admin rights** on your tenant
- A dedicated **namespace** to host your RabbitMQ cluster
- **Python** with the `pika` module installed (optional, for testing)

---

## Step 1: Create the RabbitMQ manifest

Create a `rabbitmq.yaml` file with the following configuration:

```yaml title="rabbitmq.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: example
spec:
  replicas: 3
  resourcesPreset: small
  size: 10Gi
  storageClass: replicated
  users:
    admin:
      password: "strongpassword"
  vhosts:
    default:
      roles:
        admin: ["admin"]
```

:::tip
With 3 replicas, RabbitMQ uses **quorum queues** to guarantee message durability. See the [API Reference](./api-reference.md) for the full configuration.
:::

---

## Step 2: Deploy the RabbitMQ cluster

Apply the manifest and verify that the deployment starts:

```bash
# Apply the manifest
kubectl apply -f rabbitmq.yaml
```

Check the cluster status (may take 2-3 minutes):

```bash
kubectl get rabbitmq
```

**Expected output:**

```console
NAME      READY   AGE     VERSION
example   True    2m      0.10.0
```

---

## Step 3: Pod verification

Verify that all pods are in `Running` state:

```bash
kubectl get pods | grep rabbitmq
```

**Expected output:**

```console
rabbitmq-example-rabbitmq-server-0    1/1     Running   0   2m
rabbitmq-example-rabbitmq-server-1    1/1     Running   0   2m
rabbitmq-example-rabbitmq-server-2    1/1     Running   0   2m
```

With `replicas: 3`, you get **3 RabbitMQ nodes** forming a high-availability cluster.

| Prefix | Role | Count |
|--------|------|-------|
| `rabbitmq-example-rabbitmq-server-*` | **RabbitMQ Server** (message broker + Management UI) | 3 |

---

## Step 4: Retrieve credentials

Passwords are stored in Kubernetes Secrets:

```bash
# Credentials for the user defined in the manifest
kubectl get secret rabbitmq-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Expected output:**

```console
admin: strongpassword
```

A default user is also automatically created by the operator:

```bash
# Default user credentials
kubectl get secret rabbitmq-example-rabbitmq-default-user -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

---

## Step 5: Connection and testing

### Access the Management UI

```bash
kubectl port-forward svc/rabbitmq-example-rabbitmq 15672:15672 &
```

Access the interface via your browser: http://localhost:15672

Log in with the default user credentials retrieved in step 4.

### Messaging test with Python

```bash
kubectl port-forward svc/rabbitmq-example-rabbitmq 5672:5672 &
```

```python title="test_rabbitmq.py"
import pika

credentials = pika.PlainCredentials('admin', 'strongpassword')
parameters = pika.ConnectionParameters(
    host='localhost',
    port=5672,
    virtual_host='default',
    credentials=credentials
)

connection = pika.BlockingConnection(parameters)
channel = connection.channel()

# Create a queue
channel.queue_declare(queue='test')

# Send a message
channel.basic_publish(exchange='', routing_key='test', body='Hello Hikube!')
print("Message sent successfully")

connection.close()
```

```bash
python test_rabbitmq.py
```

**Expected output:**

```console
Message sent successfully
```

:::note
If you don't have `pika`, install it with `pip install pika`.
:::

---

## Step 6: Quick troubleshooting

### Pods in CrashLoopBackOff

```bash
# Check the logs of the failing pod
kubectl logs rabbitmq-example-rabbitmq-server-0

# Check the pod events
kubectl describe pod rabbitmq-example-rabbitmq-server-0
```

**Common causes:** insufficient memory (`resources.memory` too low), storage volume full, DNS resolution error between nodes.

### RabbitMQ not accessible

```bash
# Check that the services exist
kubectl get svc | grep rabbitmq

# Check the RabbitMQ service
kubectl describe svc rabbitmq-example-rabbitmq
```

**Common causes:** port-forward not active, wrong port (5672 for AMQP, 15672 for Management UI), incorrect credentials.

### Cluster not formed

```bash
# Check the RabbitMQ cluster status
kubectl exec rabbitmq-example-rabbitmq-server-0 -- rabbitmqctl cluster_status

# Check the cluster formation logs
kubectl logs rabbitmq-example-rabbitmq-server-0 | grep -i cluster
```

**Common causes:** DNS resolution issue between nodes, Erlang cookie not synchronized, insufficient resources for the cluster formation process.

### General diagnostic commands

```bash
# Recent events in the namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Detailed RabbitMQ cluster status
kubectl describe rabbitmq example
```

---

## Step 7: Cleanup

To delete the test resources:

```bash
kubectl delete -f rabbitmq.yaml
```

:::warning
This action deletes the RabbitMQ cluster and all associated data. This operation is **irreversible**.
:::

---

## Summary

You have deployed:

- A RabbitMQ cluster with **3 nodes** in high availability
- An **admin user** and a **default vhost** configured
- A **Management UI** accessible locally
- Persistent storage for data durability

---

## Next steps

- **[API Reference](./api-reference.md)**: Full configuration of all RabbitMQ options
- **[Overview](./overview.md)**: Detailed architecture and RabbitMQ use cases on Hikube
