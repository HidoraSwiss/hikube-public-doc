---
sidebar_position: 2
title: Quick Start
---

# Deploy Kafka in 5 minutes

This guide walks you step by step through deploying your first **Kafka cluster** on Hikube, from the YAML manifest to initial messaging tests.

---

## Objectives

By the end of this guide, you will have:

- A **Kafka cluster** deployed and running on Hikube
- **3 Kafka brokers** and **3 ZooKeeper nodes** for high availability
- A **topic** ready to receive messages
- **Persistent storage** for your Kafka and ZooKeeper data

---

## Prerequisites

Before you begin, make sure you have:

- **kubectl** configured with your Hikube kubeconfig
- **Admin rights** on your tenant
- A dedicated **namespace** to host your Kafka cluster
- **kafkacat** (or `kcat`) installed on your workstation (optional, for testing)

---

## Step 1: Create the Kafka manifest

Create a `kafka.yaml` file with the following configuration:

```yaml title="kafka.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: example
spec:
  external: false
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
    storageClass: replicated
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
    storageClass: replicated
  topics:
    - name: my-topic
      partitions: 3
      replicas: 3
      config:
        retention.ms: "604800000"
        cleanup.policy: "delete"
```

:::tip
Kafka does not have authentication enabled by default on Hikube. For production use, it is recommended not to expose the cluster externally (`external: false`). See the [API Reference](./api-reference.md) for the full configuration.
:::

---

## Step 2: Deploy the Kafka cluster

Apply the manifest and verify that the deployment starts:

```bash
# Apply the manifest
kubectl apply -f kafka.yaml
```

Check the cluster status (may take 2-3 minutes):

```bash
kubectl get kafka
```

**Expected output:**

```console
NAME      READY   AGE     VERSION
example   True    2m      0.13.0
```

---

## Step 3: Pod verification

Verify that all pods are in `Running` state:

```bash
kubectl get pods | grep kafka
```

**Expected output:**

```console
kafka-example-kafka-0        1/1     Running   0   2m
kafka-example-kafka-1        1/1     Running   0   2m
kafka-example-kafka-2        1/1     Running   0   2m
kafka-example-zookeeper-0    1/1     Running   0   2m
kafka-example-zookeeper-1    1/1     Running   0   2m
kafka-example-zookeeper-2    1/1     Running   0   2m
```

With `kafka.replicas: 3` and `zookeeper.replicas: 3`, you get **6 pods**:

| Prefix | Role | Count |
|--------|------|-------|
| `kafka-example-kafka-*` | **Kafka Brokers** (receive, store, and distribute messages) | 3 |
| `kafka-example-zookeeper-*` | **ZooKeeper** (cluster coordination and leader election) | 3 |

---

## Step 4: Retrieve credentials

Kafka on Hikube does not have authentication enabled by default. Connections are made directly via the bootstrap service:

```bash
kubectl get svc | grep kafka
```

**Expected output:**

```console
kafka-example-kafka-bootstrap    ClusterIP      10.96.xx.xx    <none>        9092/TCP    2m
kafka-example-kafka-brokers      ClusterIP      None           <none>        9092/TCP    2m
kafka-example-zookeeper-client   ClusterIP      10.96.xx.xx    <none>        2181/TCP    2m
```

:::note
The `kafka-example-kafka-bootstrap` service is the main entry point for Kafka clients.
:::

---

## Step 5: Connection and testing

### Port-forward the Kafka service

```bash
kubectl port-forward svc/kafka-example-kafka-bootstrap 9092:9092 &
```

### Publish and consume a message

```bash
# Send a message to the topic
echo "Hello Hikube!" | kafkacat -b localhost:9092 -t my-topic -P

# Consume the message
kafkacat -b localhost:9092 -t my-topic -C -o beginning -e
```

**Expected output:**

```console
Hello Hikube!
```

:::note
If you don't have `kafkacat`, you can install it with `apt install kafkacat` (Debian/Ubuntu) or `brew install kcat` (macOS).
:::

---

## Step 6: Quick troubleshooting

### Pods in CrashLoopBackOff

```bash
# Check the logs of the failing broker
kubectl logs kafka-example-kafka-0

# Check the pod events
kubectl describe pod kafka-example-kafka-0
```

**Common causes:** insufficient memory (`kafka.resources.memory` too low), storage volume full.

### Kafka not accessible

```bash
# Check that the services exist
kubectl get svc | grep kafka

# Check the bootstrap service
kubectl describe svc kafka-example-kafka-bootstrap
```

**Common causes:** port-forward not active, wrong port in the connection string, service not ready.

### ZooKeeper errors

```bash
# Check ZooKeeper logs
kubectl logs kafka-example-zookeeper-0

# Check ZooKeeper pod status
kubectl get pods | grep zookeeper
```

**Common causes:** the ZooKeeper quorum requires an odd number of replicas (3 minimum recommended), insufficient disk space.

### General diagnostic commands

```bash
# Recent events in the namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Detailed Kafka cluster status
kubectl describe kafka example
```

---

## Step 7: Cleanup

To delete the test resources:

```bash
kubectl delete -f kafka.yaml
```

:::warning
This action deletes the Kafka cluster and all associated data. This operation is **irreversible**.
:::

---

## Summary

You have deployed:

- A Kafka cluster with **3 brokers** distributed across different nodes
- **3 ZooKeeper nodes** for cluster coordination
- A **topic** configured with 3 partitions and 3 replicas
- Persistent storage for data durability

---

## Next steps

- **[API Reference](./api-reference.md)**: Full configuration of all Kafka options
- **[Overview](./overview.md)**: Detailed architecture and Kafka use cases on Hikube
