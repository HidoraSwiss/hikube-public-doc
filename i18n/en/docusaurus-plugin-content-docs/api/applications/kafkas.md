---
title: Kafka
---

Kafka is a distributed messaging platform designed to manage real-time data streams with high availability and fault tolerance. This page details the configuration parameters for Kafka, including options for ZooKeeper, and provides a usage example.

---

## Configuration Example

Here is a YAML configuration example to deploy Kafka with ZooKeeper in a Kubernetes cluster:

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: kafka-example
spec:
  external: true
  kafka:
    size: 20Gi
    replicas: 3
    storageClass: "replicated"
  zookeeper:
    size: 10Gi
    replicas: 3
    storageClass: "replicated"
  topics:
    - name: "example-topic"
      partitions: 3
      replicationFactor: 2
    - name: "another-topic"
      partitions: 5
      replicationFactor: 3
```

Using the kubeconfig provided by Hikube and this example yaml, saved as a `manifest.yaml` file, you can easily test the application deployment using the following command:

```sh
kubectl apply -f manifest.yaml
```

In this example:

- **`external`**: Enabled to allow external access to Kafka from outside the cluster.
- **`kafka.size`**: Set to `20Gi`, specifying the size of the persistent volume for Kafka.
- **`kafka.replicas`**: Configured to `3`, ensuring redundancy and high availability.
- **`kafka.storageClass`**: Uses a storage class named `replicated`.
- **`zookeeper.size`**: Set to `10Gi` for persistent storage of ZooKeeper data.
- **`zookeeper.replicas`**: Configured to `3`, ensuring fault tolerance for ZooKeeper.
- **`zookeeper.storageClass`**: Uses a reliable storage class named `reliable-storage`.
- **`topics`**:
  - **`example-topic`**: A topic with 3 partitions and a replication factor of 2.
  - **`another-topic`**: A topic with 5 partitions and a replication factor of 3.

This configuration ensures a robust and high-performance Kafka deployment, incorporating best practices for data and topic management.

---

## Configurable Parameters

### **General Parameters**

These parameters configure the Kafka and ZooKeeper components to ensure their deployment and proper functioning.

| **Name**              | **Description**                                           | **Default Value** |
|------------------------|--------------------------------------------------------------|------------------------|
| `external`            | Allows external access to Kafka from outside the cluster. | `false`               |
| `kafka.size`          | Size of the persistent volume for Kafka data.             | `10Gi`                |
| `kafka.replicas`      | Number of Kafka replicas.                                 | `3`                   |
| `kafka.storageClass`  | Storage class used for Kafka data.                        | `"replicated"` or `"local"`   |
| `zookeeper.size`      | Size of the persistent volume for ZooKeeper data.         | `5Gi`                 |
| `zookeeper.replicas`  | Number of ZooKeeper replicas.                             | `3`                   |
| `zookeeper.storageClass` | Storage class used for ZooKeeper data.                 | `"replicated"` or `"local"`   |

---

### **Configuration Parameters**

These parameters allow customizing Kafka topic management.

| **Name**  | **Description**           | **Default Value** |
|-----------|------------------------------|------------------------|
| `topics`  | Topics configuration.        | `[]`                  |

---

## Additional Resources

To deepen your knowledge of Kafka and its components, check the following resources:

- [**Official Kafka Documentation**](https://kafka.apache.org/documentation/)
  Official guide for configuring and operating Kafka, with practical examples and advanced concepts.

- [**ZooKeeper Documentation**](https://zookeeper.apache.org/doc/r3.8.0/index.html)
  Comprehensive guide to understanding and configuring ZooKeeper, a key component for Kafka's proper functioning.
