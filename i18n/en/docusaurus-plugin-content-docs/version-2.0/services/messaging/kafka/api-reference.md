---
sidebar_position: 3
title: API Reference
---

# Kafka API Reference

This reference details the configuration and operation of **Kafka clusters** on Hikube, including **topic** management, **Kafka broker** configuration, and coordination via **ZooKeeper**.

---

## Base Structure

### **Kafka Resource**

#### YAML Configuration Example

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: kafka
spec:
  external: false
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
  topics: []
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
```

---

## Parameters

### **Common Parameters**

| **Parameter** | **Type** | **Description**                                                                 | **Default** | **Required** |
| ------------- | -------- | ------------------------------------------------------------------------------- | ----------- | ------------ |
| `external`    | `bool`   | Enable external access to the Kafka cluster (expose outside the Kubernetes cluster) | `false`     | No           |

#### YAML Example

```yaml title="kafka.yaml"
external: true
```

---

### **Kafka Parameters**

| **Parameter**            | **Type**   | **Description**                                                                                          | **Default** | **Required** |
| ------------------------ | ---------- | -------------------------------------------------------------------------------------------------------- | ----------- | ------------ |
| `kafka`                  | `object`   | Kafka cluster configuration                                                                              | `{}`        | Yes          |
| `kafka.replicas`         | `int`      | Number of Kafka replicas (brokers)                                                                       | `3`         | Yes          |
| `kafka.resources`        | `object`   | Explicit CPU and memory configuration for each broker. If empty, `kafka.resourcesPreset` is used.        | `{}`        | No           |
| `kafka.resources.cpu`    | `quantity` | CPU available per broker                                                                                 | `null`      | No           |
| `kafka.resources.memory` | `quantity` | RAM available per broker                                                                                 | `null`      | No           |
| `kafka.resourcesPreset`  | `string`   | Default resource preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`)               | `"small"`   | Yes          |
| `kafka.size`             | `quantity` | Persistent volume size used for Kafka data                                                               | `10Gi`      | Yes          |
| `kafka.storageClass`     | `string`   | StorageClass used to store Kafka data                                                                    | `""`        | No           |

#### YAML Example

```yaml title="kafka.yaml"
kafka:
  replicas: 3
  resources:
    cpu: 2000m
    memory: 2Gi
  resourcesPreset: medium
  size: 20Gi
  storageClass: replicated
```

---

### **ZooKeeper Parameters**

| **Parameter**                | **Type**   | **Description**                                                                                                | **Default** | **Required** |
| ---------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------- | ----------- | ------------ |
| `zookeeper`                  | `object`   | ZooKeeper cluster configuration used by Kafka                                                                  | `{}`        | Yes          |
| `zookeeper.replicas`         | `int`      | Number of ZooKeeper replicas                                                                                   | `3`         | Yes          |
| `zookeeper.resources`        | `object`   | Explicit CPU and memory configuration for each replica. If empty, `zookeeper.resourcesPreset` is used.         | `{}`        | No           |
| `zookeeper.resources.cpu`    | `quantity` | CPU available per ZooKeeper replica                                                                            | `null`      | No           |
| `zookeeper.resources.memory` | `quantity` | RAM available per ZooKeeper replica                                                                            | `null`      | No           |
| `zookeeper.resourcesPreset`  | `string`   | Default resource preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`)                     | `"small"`   | Yes          |
| `zookeeper.size`             | `quantity` | Persistent volume size for ZooKeeper                                                                           | `5Gi`       | Yes          |
| `zookeeper.storageClass`     | `string`   | StorageClass used to store ZooKeeper data                                                                      | `""`        | No           |

#### YAML Example

```yaml title="kafka.yaml"
zookeeper:
  replicas: 3
  resourcesPreset: small
  size: 5Gi
  storageClass: replicated
```

---

### **Topics Parameters**

| **Parameter**          | **Type**   | **Description**                                             | **Default** | **Required** |
| ---------------------- | ---------- | ----------------------------------------------------------- | ----------- | ------------ |
| `topics`               | `[]object` | List of topics to create automatically                      | `[]`        | No           |
| `topics[i].name`       | `string`   | Topic name                                                  | `""`        | Yes          |
| `topics[i].partitions` | `int`      | Number of topic partitions                                  | `0`         | Yes          |
| `topics[i].replicas`   | `int`      | Number of topic replicas                                    | `0`         | Yes          |
| `topics[i].config`     | `object`   | Advanced topic configuration (cleanup, retention, etc.)     | `{}`        | No           |

#### YAML Example

```yaml title="kafka.yaml"
topics:
  - name: results
    partitions: 1
    replicas: 3
    config:
      min.insync.replicas: 2
  - name: orders
    partitions: 1
    replicas: 3
    config:
      cleanup.policy: compact
      segment.ms: 3600000
      max.compaction.lag.ms: 5400000
      min.insync.replicas: 2
```

---

### **resources and resourcesPreset**

The `resources` field allows explicitly defining the CPU and memory configuration of each broker or ZooKeeper node.
If this field is left empty, the value of the `resourcesPreset` parameter is used.

#### YAML Example

```yaml title="kafka.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```

⚠️ Warning: if `resources` is defined, the `resourcesPreset` value is ignored.

| **Preset name** | **CPU** | **Memory** |
| --------------- | ------- | ---------- |
| `nano`          | 250m    | 128Mi      |
| `micro`         | 500m    | 256Mi      |
| `small`         | 1       | 512Mi      |
| `medium`        | 1       | 1Gi        |
| `large`         | 2       | 2Gi        |
| `xlarge`        | 4       | 4Gi        |
| `2xlarge`       | 8       | 8Gi        |

---

## Complete Examples

### Production Cluster

```yaml title="kafka-production.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: production
spec:
  external: false
  kafka:
    replicas: 3
    resources:
      cpu: 4000m
      memory: 8Gi
    size: 100Gi
    storageClass: replicated
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
    storageClass: replicated
  topics:
    - name: events
      partitions: 6
      replicas: 3
      config:
        retention.ms: "604800000"
        cleanup.policy: "delete"
        min.insync.replicas: "2"
    - name: commands
      partitions: 3
      replicas: 3
      config:
        cleanup.policy: "compact"
        min.insync.replicas: "2"
```

### Development Cluster

```yaml title="kafka-development.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: development
spec:
  external: false
  kafka:
    replicas: 1
    resourcesPreset: nano
    size: 5Gi
  zookeeper:
    replicas: 1
    resourcesPreset: nano
    size: 2Gi
  topics:
    - name: test-topic
      partitions: 1
      replicas: 1
```

---

:::tip Best Practices

- **`min.insync.replicas: 2`**: configure this parameter on your production topics to ensure at least 2 replicas acknowledge each write
- **Replicated storage**: use `storageClass: replicated` to protect data against the loss of a physical node
- **Storage sizing**: plan enough disk space for message retention (`retention.ms`) and compaction
- **ZooKeeper: 3 replicas minimum** in production to ensure quorum and fault tolerance
:::

:::warning Warning

- **Deletions are irreversible**: deleting a Kafka resource results in the permanent loss of all messages and topics
- **Topic replicas vs brokers**: the number of replicas for a topic cannot exceed the number of available brokers
- **Reducing the number of brokers**: reducing the number of brokers on an existing cluster can lead to data loss if partitions are not redistributed beforehand
:::
