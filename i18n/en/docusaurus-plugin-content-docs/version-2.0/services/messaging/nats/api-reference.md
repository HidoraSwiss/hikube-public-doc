---
sidebar_position: 3
title: API Reference
---

# NATS API Reference

This reference details the configuration and operation of **NATS clusters** on Hikube, including **user** management, **JetStream** configuration for message persistence, and customization options via the `config` field.

---

## Base Structure

### **NATS Resource**

#### YAML Configuration Example

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: nats
spec:
  replicas: 2
  resourcesPreset: nano
  external: false
  jetstream:
    enabled: true
    size: 10Gi
  users:
    user1:
      password: "mypassword"
```

---

## Parameters

### **Common Parameters**

| **Parameter**      | **Type**   | **Description**                                                                                      | **Default** | **Required** |
| ------------------ | ---------- | ---------------------------------------------------------------------------------------------------- | ----------- | ------------ |
| `replicas`         | `int`      | Number of NATS replicas (cluster nodes)                                                              | `2`         | Yes          |
| `resources`        | `object`   | Explicit CPU and memory configuration for each replica. If empty, `resourcesPreset` is used.         | `{}`        | No           |
| `resources.cpu`    | `quantity` | CPU available per NATS replica                                                                       | `""`        | No           |
| `resources.memory` | `quantity` | RAM available per NATS replica                                                                       | `""`        | No           |
| `resourcesPreset`  | `string`   | Default resource preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`)           | `"nano"`    | Yes          |
| `storageClass`     | `string`   | StorageClass used to store persistent cluster data                                                   | `""`        | No           |
| `external`         | `bool`     | Enable external access to the NATS cluster (expose outside the Kubernetes cluster)                   | `false`     | No           |

#### YAML Example

```yaml title="nats.yaml"
replicas: 3
resourcesPreset: small
external: true
storageClass: replicated
```

---

### **Application Parameters (NATS-Specific)**

| **Parameter**          | **Type**            | **Description**                                                                                                | **Default** | **Required**   |
| ---------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- | ----------- | -------------- |
| `users`                | `map[string]object` | List of users authorized to connect to the NATS cluster. The key is the username.                              | `{}`        | No             |
| `users[name].password` | `string`            | Password associated with the user.                                                                             | `""`        | Yes if defined |
| `jetstream`            | `object`            | **JetStream** module configuration for message persistence.                                                    | `{}`        | No             |
| `jetstream.enabled`    | `bool`              | Enable or disable the JetStream module.                                                                        | `true`      | No             |
| `jetstream.size`       | `quantity`          | Persistent volume size allocated for JetStream.                                                                | `10Gi`      | No             |
| `config`               | `object`            | Advanced NATS configuration. Allows adding or overriding certain values of the default configuration.          | `{}`        | No             |
| `config.merge`         | `object`            | Additional configuration merged into the main NATS configuration.                                              | `{}`        | No             |
| `config.resolver`      | `object`            | NATS resolver-specific configuration (DNS, operator, etc.).                                                    | `{}`        | No             |

#### YAML Example

```yaml title="nats.yaml"
users:
  admin:
    password: "supersecurepassword"
  client:
    password: "clientpassword"

jetstream:
  enabled: true
  size: 20Gi

config:
  merge:
    debug: true
    trace: true
  resolver:
    dir: /data/nats/resolver
```

---

### **resources and resourcesPreset**

The `resources` field allows explicitly defining the CPU and memory configuration of each replica.
If this field is left empty, the value of the `resourcesPreset` parameter is used.

#### YAML Example

```yaml title="nats.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```

⚠️ **Note:** if `resources` is defined, the `resourcesPreset` value is ignored.

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

```yaml title="nats-production.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: production
spec:
  external: false
  replicas: 3
  resources:
    cpu: 2000m
    memory: 4Gi
  storageClass: replicated

  jetstream:
    enabled: true
    size: 50Gi

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: SecureAppPassword
    monitoring:
      password: SecureMonitoringPassword

  config:
    merge:
      max_payload: 8MB
      write_deadline: 2s
      debug: false
      trace: false
```

### Development Cluster

```yaml title="nats-development.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: development
spec:
  external: true
  replicas: 1
  resourcesPreset: nano

  jetstream:
    enabled: true
    size: 5Gi

  users:
    dev:
      password: devpassword
```

---

:::tip Best Practices

- **JetStream in production**: always enable JetStream (`jetstream.enabled: true`) to benefit from message persistence and streaming
- **3 replicas minimum** in production to ensure high availability and Raft consensus for JetStream
- **`max_payload`**: adjust the maximum message size according to your use case (default: 1MB, recommended maximum: 8MB)
- **Dedicated users**: create separate users per application for granular access control
:::

:::warning Warning

- **Deletions are irreversible**: deleting a NATS resource results in the permanent loss of JetStream streams and all messages
- **Modifying `jetstream.size`**: reducing the JetStream volume size on an existing cluster can lead to data loss
- **External access**: enabling `external: true` exposes the NATS cluster to the Internet -- make sure authentication is properly configured
:::
