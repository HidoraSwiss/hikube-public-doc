---

sidebar_position: 3
title: Control Plane
--------------------

# 🧩 Details of the `controlPlane` Field

The `controlPlane` field defines the configuration of the managed Kubernetes cluster's control plane.
It specifies the resources allocated to each key component (API Server, Scheduler, Controller Manager, Konnectivity) and the number of replicas for high availability.

```yaml
controlPlane:
  apiServer:
    resources:
      cpu: 2
      memory: 4Gi
    resourcesPreset: small
  controllerManager:
    resources:
      cpu: 2
      memory: 2Gi
    resourcesPreset: small
  konnectivity:
    server:
      resources:
        cpu: 1
        memory: 1Gi
      resourcesPreset: nano
  scheduler:
    resources:
      cpu: 1
      memory: 512Mi
    resourcesPreset: micro
  replicas: 3
```

---

## `apiServer` (Object) — **Required**

### Description

The `apiServer` is the central component of the Kubernetes control plane.
It manages all requests to the Kubernetes API and ensures communication between internal cluster components.

### Internal fields

| Field              | Type   | Required | Description                                                       |
| ------------------ | ------ | -------- | ----------------------------------------------------------------- |
| `resources`        | Object | ✅        | Defines CPU and memory resources allocated to the API Server      |
| `resources.cpu`    | string | ❌        | Number of vCPUs assigned (ex: `2`)                                |
| `resources.memory` | string | ❌        | Amount of memory allocated (ex: `4Gi`)                            |
| `resourcesPreset`  | string | ✅        | Predefined resource profile to simplify configuration             |
|                    |        |          | Possible values: `nano`, `micro`, `small`, `medium`, `large`, ... |

### Example

```yaml
apiServer:
  resources:
    cpu: 2
    memory: 4Gi
  resourcesPreset: small
```

---

## `controllerManager` (Object) — **Required**

### Description

The `controllerManager` runs Kubernetes **control loops** (reconciliation loops).
It ensures the creation, update, and deletion of resources (pods, services, etc.) based on the desired cluster state.

### Internal fields

| Field              | Type   | Required | Description                                                |
| ------------------ | ------ | -------- | ---------------------------------------------------------- |
| `resources`        | Object | ✅        | Specifies CPU/memory resources for the Controller Manager  |
| `resources.cpu`    | string | ❌        | Number of vCPUs reserved                                   |
| `resources.memory` | string | ❌        | Amount of memory allocated                                 |
| `resourcesPreset`  | string | ✅        | Predefined size (`nano`, `micro`, `small`, `medium`, etc.) |

### Example

```yaml
controllerManager:
  resources:
    cpu: 2
    memory: 2Gi
  resourcesPreset: small
```

---

## `konnectivity` (Object) — **Required**

### Description

The **Konnectivity** service manages secure communication between the control plane and nodes.
It replaces the old `kube-proxy` for outbound node connections and optimizes network connectivity.

### Sub-field: `server`

Defines the configuration of the Konnectivity server responsible for multiplexed connections between the control plane and nodes.

#### Internal fields

| Field              | Type   | Required | Description                                                   |
| ------------------ | ------ | -------- | ------------------------------------------------------------- |
| `resources`        | Object | ✅        | Specifies CPU/memory resources for the Konnectivity server    |
| `resources.cpu`    | string | ❌        | Number of vCPUs                                               |
| `resources.memory` | string | ❌        | Amount of memory                                              |
| `resourcesPreset`  | string | ✅        | Predefined profile (`nano`, `micro`, `small`, `medium`, etc.) |

### Example

```yaml
konnectivity:
  server:
    resources:
      cpu: 1
      memory: 1Gi
    resourcesPreset: nano
```

---

## `scheduler` (Object) — **Required**

### Description

The `scheduler` determines on which node each pod should run based on resource constraints, affinity rules, and topology.
It is essential for cluster performance and workload balancing.

### Internal fields

| Field              | Type   | Required | Description                                                |
| ------------------ | ------ | -------- | ---------------------------------------------------------- |
| `resources`        | Object | ✅        | Defines resources allocated to the Scheduler               |
| `resources.cpu`    | string | ❌        | Number of vCPUs                                            |
| `resources.memory` | string | ❌        | Amount of memory                                           |
| `resourcesPreset`  | string | ✅        | Predefined size (`nano`, `micro`, `small`, `medium`, etc.) |

### Example

```yaml
scheduler:
  resources:
    cpu: 1
    memory: 512Mi
  resourcesPreset: micro
```

---

## `replicas` (integer) — **Required**

### Description

The `replicas` field defines the **number of control plane instances**.
An odd number of replicas (usually `3`) is recommended to ensure high availability and quorum for `etcd`.

### Example

```yaml
replicas: 3
```

---

## **Types of resourcesPreset**

```yaml
# Available presets
resourcesPreset: "nano"     # 0.1 CPU, 128 MiB RAM
resourcesPreset: "micro"    # 0.25 CPU, 256 MiB RAM
resourcesPreset: "small"    # 0.5 CPU, 512 MiB RAM
resourcesPreset: "medium"   # 0.5 CPU, 1 GiB RAM
resourcesPreset: "large"    # 1 CPU, 2 GiB RAM
resourcesPreset: "xlarge"   # 2 CPU, 4 GiB RAM
resourcesPreset: "2xlarge"  # 4 CPU, 8 GiB RAM
```

---

## 💡 Best Practices

* Always set `replicas: 3` for redundancy.
* Use consistent `resourcesPreset` values across components.
* Adjust resources based on workload (production clusters → `medium` or `large`).
* Do not under-size the `apiServer`, as it is the most heavily used component.

---
