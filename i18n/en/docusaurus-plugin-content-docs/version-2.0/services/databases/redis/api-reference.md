---
sidebar_position: 3
title: API Reference
---

# Redis API Reference

This reference details the use of **Redis** on Hikube, highlighting its speed and versatility as an **in-memory data store** and **distributed cache** system.  
The managed service simplifies Redis cluster deployment and management, guaranteeing **high availability**, **low latency**, and optimal performance for your applications.  

The service is based on the **[Spotahome Redis Operator](https://github.com/spotahome/redis-operator)**, which ensures orchestration, replication, and supervision of Redis clusters.  

---

## Base Structure

### **Redis Resource**

#### YAML Configuration Example

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: example
  namespace: default
spec:
```

---

## Parameters

### **Common Parameters**

| **Parameter**     | **Type**   | **Description**                                                                 | **Default Value** | **Required** |
|--------------------|------------|---------------------------------------------------------------------------------|------------------------|------------|
| `replicas`         | `int`      | Number of Redis replicas (instances in the cluster)                            | `2`                    | Yes        |
| `resources`        | `object`   | Explicit CPU and memory configuration for each Redis replica. If empty, `resourcesPreset` is applied | `{}`                   | No        |
| `resources.cpu`    | `quantity` | CPU available per replica                                                     | `null`                 | No        |
| `resources.memory` | `quantity` | RAM available per replica                                                     | `null`                 | No        |
| `resourcesPreset`  | `string`   | Predefined resource profile (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `"nano"`              | Yes        |
| `size`             | `quantity` | Persistent volume (PVC) size for data                              | `1Gi`                  | Yes        |
| `storageClass`     | `string`   | Storage class used                                                     | `""`                   | No        |
| `external`         | `bool`     | Enable external access to the cluster (LoadBalancer)                               | `false`                | No        |
| `authEnabled`      | `bool`     | Enable password authentication (stored in a Kubernetes Secret) | `true`                 | No        |

#### YAML Configuration Example

```yaml title="redis.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: example
  namespace: default
spec:
  # Number of Redis replicas (high availability if >1)
  replicas: 3

  # Resources allocated per instance
  resources:
    cpu: 1000m      # 1 vCPU
    memory: 1Gi     # 1 GiB RAM

  # Persistent disk size for each instance
  size: 2Gi
  storageClass: replicated

  # Enable Redis authentication
  # If true, a password is automatically generated
  authEnabled: true

  # Expose Redis service outside the cluster
  external: true
  ```

  ---

### **Application-Specific Parameters**

| **Parameter**   | **Type** | **Description**                  | **Default Value** | **Required** |
|------------------|----------|----------------------------------|------------------------|------------|
| `authEnabled`    | `bool`   | Enables password generation (stored in a Kubernetes Secret) | `true` | No |

#### YAML Configuration Example

```yaml title="redis.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: example
  namespace: default
spec:
  replicas: 3
  resources:
    cpu: 1000m 
    memory: 1Gi 
  size: 2Gi
  storageClass: replicated
  # Enable Redis authentication
  # If true, a password is automatically generated
  authEnabled: false
  # Expose Redis service outside the cluster
  external: false
```

### resources and resourcesPreset  

The `resources` field allows explicitly defining the CPU and memory configuration of each Redis replica.  
If this field is left empty, the value of the `resourcesPreset` parameter is used.  

#### YAML Configuration Example

```yaml title="redis.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```  

⚠️ Attention: if resources is defined, the resourcesPreset value is ignored.

| **Preset name** | **CPU** | **Memory** |
|-----------------|---------|-------------|
| `nano`          | 250m    | 128Mi       |
| `micro`         | 500m    | 256Mi       |
| `small`         | 1       | 512Mi       |
| `medium`        | 1       | 1Gi         |
| `large`         | 2       | 2Gi         |
| `xlarge`        | 4       | 4Gi         |
| `2xlarge`       | 8       | 8Gi         |

