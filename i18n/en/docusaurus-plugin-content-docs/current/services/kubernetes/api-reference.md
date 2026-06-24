---
sidebar_position: 6
title: API Reference
---

# API Reference – Kubernetes

This reference describes Hikube's **`Kubernetes`** API (`apps.cozystack.io/v1alpha1`), which provisions managed Kubernetes clusters (Kamaji control plane + KubeVirt workers). The fields below correspond to the schema actually exposed by the platform.

```yaml title="cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  version: v1.35
  storageClass: replicated
  controlPlane:
    replicas: 2
  nodeGroups:
    md0:
      minReplicas: 1
      maxReplicas: 5
      instanceType: u1.medium
      ephemeralStorage: 20Gi
      roles:
        - ingress-nginx
  addons:
    ingressNginx:
      enabled: true
```

---

## Specification

| Parameter       | Type      | Description                                                            | Default      |
| --------------- | --------- | --------------------------------------------------------------------- | ------------ |
| `version`       | `string`  | Kubernetes version (`major.minor`) — see [versions](#version)         | `v1.35`      |
| `storageClass`  | `string`  | Storage class for persistent volumes                                  | `replicated` |
| `host`          | `string`  | External hostname of the cluster. Defaults to `<cluster>.<tenant-host>` | `""`       |
| `controlPlane`  | `object`  | Control plane configuration — see [Concepts](concepts.md#control-plane) | `{}`       |
| `nodeGroups`    | `object`  | Map of worker groups — see [nodeGroups](#nodegroups)                   | see default  |
| `addons`        | `object`  | Cluster add-ons — see [addons](#addons)                               | `{}`         |

---

## version

`version` selects the Kubernetes minor version to deploy.

| Supported values |
| ---------------- |
| `v1.35` (default), `v1.34`, `v1.33`, `v1.32`, `v1.31`, `v1.30` |

```yaml
spec:
  version: v1.34
```

See the [Upgrade a cluster](how-to/upgrade-cluster.md) guide for version upgrades.

---

## nodeGroups

`nodeGroups` is a **map** (`<name>: {…}`) describing the worker groups. Each group is autoscaled between `minReplicas` and `maxReplicas`.

| Field              | Type            | Description                                                       | Default     |
| ------------------ | --------------- | ----------------------------------------------------------------- | ----------- |
| `minReplicas`      | `integer`       | Minimum number of nodes (0 = scale-to-zero possible)             | `0`         |
| `maxReplicas`      | `integer`       | Maximum number of nodes                                          | `10`        |
| `instanceType`     | `string`        | Node flavor (see [instance types](../compute/api-reference.md#instance-types)) | `u1.medium` |
| `ephemeralStorage` | `int`/`string`  | Ephemeral storage size per node (e.g., `20Gi`)                   | `20Gi`      |
| `resources`        | `object`        | Explicit `cpu` / `memory` override per node                      | `{}`        |
| `gpus`             | `[]object`      | GPUs attached to the nodes (`gpus[].name`) — see [GPU with Kubernetes](../gpu/api-reference.md) | `[]` |
| `roles`            | `[]string`      | Node roles (e.g., `ingress-nginx`)                               | `[]`        |

:::note `ephemeralStorage` is a scalar
Specify a size directly (`ephemeralStorage: 20Gi`), not an object `{size: …}`.
:::

```yaml
spec:
  nodeGroups:
    workers:
      minReplicas: 1
      maxReplicas: 10
      instanceType: u1.xlarge
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx
    gpu-workers:
      minReplicas: 0
      maxReplicas: 4
      instanceType: u1.2xlarge
      ephemeralStorage: 200Gi
      gpus:
        - name: nvidia.com/AD102GL_L40S
```

See [Concepts → Node Groups](concepts.md#node-groups) for the details of each field.

---

## addons

The `addons` block enables the add-ons installed in the tenant cluster. Most expose `enabled` and `valuesOverride` (Helm values override).

| Addon                  | Fields                                          | Role                                                      |
| ---------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| `certManager`          | `enabled`, `valuesOverride`                     | Automatic TLS certificate management                      |
| `ingressNginx`         | `enabled`, `exposeMethod`, `hosts`, `valuesOverride` | NGINX Ingress controller (see below)                 |
| `fluxcd`               | `enabled`, `valuesOverride`                     | GitOps (Flux)                                             |
| `gatewayAPI`           | `enabled`                                       | Gateway API support                                       |
| `gpuOperator`          | `enabled`, `valuesOverride`                     | NVIDIA GPU Operator (**required** for GPU workers)        |
| `monitoringAgents`     | `enabled`, `valuesOverride`                     | Monitoring/logging agents                                 |
| `velero`               | `enabled`, `valuesOverride`                     | Backup / restore                                          |
| `cilium`               | `valuesOverride`                                | Cilium CNI (always on, override only)                     |
| `coredns`              | `valuesOverride`                                | CoreDNS (always on, override only)                        |
| `verticalPodAutoscaler`| `valuesOverride`                                | Vertical Pod Autoscaler (always on)                       |

:::note
`cilium`, `coredns`, and `verticalPodAutoscaler` have no `enabled` field (core components) — only `valuesOverride` is usable. `gatewayAPI` exposes only `enabled`.
:::

### certManager / fluxcd / velero / monitoringAgents / gpuOperator

```yaml
spec:
  addons:
    certManager:
      enabled: true
    gpuOperator:
      enabled: true     # required if any nodeGroups carry gpus
    velero:
      enabled: true
    monitoringAgents:
      enabled: true
    fluxcd:
      enabled: true
```

### ingressNginx

| Field            | Type       | Description                                                                  | Default    |
| ---------------- | ---------- | ---------------------------------------------------------------------------- | ---------- |
| `enabled`        | `boolean`  | Enables the controller (requires nodes with the `ingress-nginx` role)        | `false`    |
| `exposeMethod`   | `string`   | Exposure method: `Proxied` or `LoadBalancer`                                | `Proxied`  |
| `hosts`          | `[]string` | Domains routed to this cluster when `exposeMethod: Proxied`                 | `[]`       |
| `valuesOverride` | `object`   | Helm values override                                                         | `{}`       |

```yaml
spec:
  addons:
    ingressNginx:
      enabled: true
      exposeMethod: Proxied
      hosts:
        - app.example.com
        - "*.services.example.com"
```

---

## Complete Examples

### Production cluster

```yaml title="production-cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: production
spec:
  version: v1.34
  storageClass: replicated
  host: k8s-prod.example.com

  controlPlane:
    replicas: 3

  nodeGroups:
    web:
      minReplicas: 3
      maxReplicas: 10
      instanceType: s1.large
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx
    compute:
      minReplicas: 1
      maxReplicas: 5
      instanceType: u1.4xlarge
      ephemeralStorage: 100Gi
      roles: []

  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
      exposeMethod: Proxied
      hosts:
        - app.example.com
        - api.example.com
    fluxcd:
      enabled: true
    monitoringAgents:
      enabled: true
    velero:
      enabled: true
```

### Development cluster

```yaml title="development-cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: development
spec:
  storageClass: replicated

  controlPlane:
    replicas: 1   # resource saving (no HA)

  nodeGroups:
    general:
      minReplicas: 1
      maxReplicas: 3
      instanceType: s1.medium
      ephemeralStorage: 30Gi
      roles:
        - ingress-nginx

  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
      hosts:
        - "*.dev.example.com"
```

### ML/AI cluster with GPU

```yaml title="ml-cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: machine-learning
spec:
  storageClass: replicated

  controlPlane:
    replicas: 2

  nodeGroups:
    system:
      minReplicas: 2
      maxReplicas: 4
      instanceType: s1.large
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx
    gpu:
      minReplicas: 0          # scale-to-zero when idle
      maxReplicas: 10
      instanceType: u1.2xlarge
      ephemeralStorage: 500Gi # datasets
      gpus:
        - name: nvidia.com/AD102GL_L40S
      roles: []

  addons:
    certManager:
      enabled: true
    # Required to expose GPUs to pods (nvidia.com/gpu)
    gpuOperator:
      enabled: true
    monitoringAgents:
      enabled: true
```

:::tip Best practices
- `controlPlane.replicas: 3` in production (etcd quorum / HA).
- Separate workloads into dedicated node groups (web, compute, GPU).
- For GPUs: a node group with `gpus` **and** `addons.gpuOperator.enabled: true`.
- Enable monitoring and backups (Velero) on critical clusters.
:::

:::warning Warning
- Cluster deletions are **irreversible** — check your backups.
- Without the `gpuOperator` addon, GPUs attached to workers are not exposed to pods.
:::
