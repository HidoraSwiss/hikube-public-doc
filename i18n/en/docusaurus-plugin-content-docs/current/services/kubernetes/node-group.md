---

sidebar_position: 4
title: Node Group
-----------------

---

sidebar_position: 4
title: Node Group
-----------------

# 🧩 Details of the `nodeGroup` Field

The `nodeGroup` field defines the configuration of a group of nodes (workers) within the Kubernetes cluster.
It allows specifying the instance type, resources, number of replicas, roles, and associated GPUs.

```yaml
nodeGroup:
  <name>:
    ephemeralStorage:
      size: 100Gi
    gpus:
      - name: nvidia.com/AD102GL_L40S
    instanceType: m5.large
    maxReplicas: 5
    minReplicas: 2
    resources:
      cpu: 4
      memory: 16Gi
    roles:
      - ingress-nginx
```

---

## `ephemeralStorage` (Object) — **Required**

### Description

Defines the configuration of **ephemeral storage** assigned to the nodes in the group.
This storage is used for temporary data, caches, or log files.

### Example

```yaml
ephemeralStorage:
  size: 100Gi
```

---

## `gpus` (Array)

### Description

Lists the **GPUs** available on the nodes in the group, used for workloads requiring compute acceleration (AI, ML, etc.).

### Internal fields

| Field  | Type   | Required | Description                                                                             |
| ------ | ------ | -------- | --------------------------------------------------------------------------------------- |
| `name` | string | ✅        | GPU name or card type (e.g. nvidia.com/AD102GL_L40S or nvidia.com/GA100_A100_PCIE_80GB) |

### Example

```yaml
gpus:
  - name: nvidia.com/AD102GL_L40S
```

---

## `instanceType` (string) — **Required**

### Description

Specifies the **instance type** used for the nodes.
This parameter determines the base resources available (CPU, memory, storage, etc.).

### Example

```yaml
instanceType: s1.small
```

### **Available Instance Types**

#### **S Series (Standard) – Ratio 1:2**

Optimized for general workloads with shared and burstable CPU.

```yaml
# Available instances
instanceType: "s1.small"     # 1 vCPU, 2 GB RAM
instanceType: "s1.medium"    # 2 vCPU, 4 GB RAM
instanceType: "s1.large"     # 4 vCPU, 8 GB RAM
instanceType: "s1.xlarge"    # 8 vCPU, 16 GB RAM
instanceType: "s1.3large"    # 12 vCPU, 24 GB RAM
instanceType: "s1.2xlarge"   # 16 vCPU, 32 GB RAM
instanceType: "s1.3xlarge"   # 24 vCPU, 48 GB RAM
instanceType: "s1.4xlarge"   # 32 vCPU, 64 GB RAM
instanceType: "s1.8xlarge"   # 64 vCPU, 128 GB RAM
```

#### **U Series (Universal) – Ratio 1:4**

Optimized for balanced workloads with more memory.

```yaml
# Available instances
instanceType: "u1.medium"    # 1 vCPU, 4 GB RAM
instanceType: "u1.large"     # 2 vCPU, 8 GB RAM
instanceType: "u1.xlarge"    # 4 vCPU, 16 GB RAM
instanceType: "u1.2xlarge"   # 8 vCPU, 32 GB RAM
instanceType: "u1.4xlarge"   # 16 vCPU, 64 GB RAM
instanceType: "u1.8xlarge"   # 32 vCPU, 128 GB RAM
```

#### **M Series (Memory Optimized) – Ratio 1:8**

Optimized for applications requiring high memory.

```yaml
# Available instances
instanceType: "m1.large"     # 2 vCPU, 16 GB RAM
instanceType: "m1.xlarge"    # 4 vCPU, 32 GB RAM
instanceType: "m1.2xlarge"   # 8 vCPU, 64 GB RAM
instanceType: "m1.4xlarge"   # 16 vCPU, 128 GB RAM
instanceType: "m1.8xlarge"   # 32 vCPU, 256 GB RAM
```

---

## `maxReplicas` (integer) — **Required**

### Description

Maximum number of nodes that can be deployed in this group.
This field limits the **autoscaling capacity** of the cluster.

### Example

```yaml
maxReplicas: 5
```

---

## `minReplicas` (integer) — **Required**

### Description

Minimum number of nodes guaranteed in this group.
This parameter ensures a baseline capacity even when the load is low.

### Example

```yaml
minReplicas: 2
```

---

## `resources` (Object) — **Required**

### Description

Defines the **resources allocated** to each node in the group (CPU and memory).
These values are used to adjust node size and performance.

### Internal fields

| Field    | Type   | Required | Description                                       |
| -------- | ------ | -------- | ------------------------------------------------- |
| `cpu`    | string | ❌        | Number of vCPUs assigned per node (e.g. `4`)      |
| `memory` | string | ❌        | Amount of memory allocated per node (e.g. `16Gi`) |

### Example

```yaml
resources:
  cpu: 4
  memory: 16Gi
```

---

## `roles` (Array)

### Description

Lists the **roles** assigned to the nodes in this group.
These roles can be used to structure responsibilities within the cluster.

### Example

```yaml
roles:
  - ingress-nginx
```

---

# **Node Group Examples**

## **General Node Group**

```yaml
nodeGroups:
  general:
    minReplicas: 2
    maxReplicas: 10
    instanceType: "s1.large"
    ephemeralStorage: 50Gi
    roles:
      - ingress-nginx
```

## **Compute-Intensive Node Group**

```yaml
nodeGroups:
  compute:
    minReplicas: 0
    maxReplicas: 5
    instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
    ephemeralStorage: 100Gi
    roles: []
```

## **Memory-Optimized Node Group**

```yaml
nodeGroups:
  memory-intensive:
    minReplicas: 1
    maxReplicas: 3
    instanceType: "m1.xlarge"   # 4 vCPU, 32 GB RAM
    ephemeralStorage: 30Gi
    resources:
      cpu: "6"       # Override: 6 vCPU instead of 4
      memory: "48Gi" # Override: 48 GB instead of 32
```

---

# 💡 Best Practices

* Adjust `minReplicas` and `maxReplicas` according to scaling needs.
* Use `instanceType` values consistent with workload type (e.g. GPU → `p3`, CPU intensive → `c5`).
* Define sufficient ephemeral storage for temporary workloads (logs, caches).
* Clearly specify roles to segment node responsibilities (e.g. separating `worker` / `ingress`).
* Monitor resource usage to adjust `cpu` and `memory` over time.

---
