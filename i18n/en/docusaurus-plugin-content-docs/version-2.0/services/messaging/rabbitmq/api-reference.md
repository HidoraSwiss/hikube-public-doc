---
sidebar_position: 3
title: API Reference
---

# RabbitMQ API Reference

This reference details the configuration and operation of **RabbitMQ clusters** on Hikube, including **user** management, **vhosts**, and **queues**.
Deployments rely on the **official RabbitMQ operator**, ensuring simplified, highly available management that follows upstream project best practices.

---

## Base Structure

### **RabbitMQ Resource**

#### YAML Configuration Example

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: rabbitmq
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

---

## Parameters

### **Common Parameters**

| **Parameter**      | **Type**   | **Description**                                                                         | **Default** | **Required** |
| ------------------ | ---------- | --------------------------------------------------------------------------------------- | ----------- | ------------ |
| `external`         | `bool`     | Enable external access to the RabbitMQ cluster (expose outside the cluster)             | `false`     | No           |
| `replicas`         | `int`      | Number of RabbitMQ replicas (cluster nodes)                                             | `3`         | Yes          |
| `resources`        | `object`   | Explicit CPU and memory configuration for each RabbitMQ replica                         | `{}`        | No           |
| `resources.cpu`    | `quantity` | CPU available per replica                                                               | `null`      | No           |
| `resources.memory` | `quantity` | RAM available per replica                                                               | `null`      | No           |
| `resourcesPreset`  | `string`   | Resource preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`)      | `"small"`   | Yes          |
| `size`             | `quantity` | Persistent volume size used for RabbitMQ data                                           | `10Gi`      | Yes          |
| `storageClass`     | `string`   | StorageClass used to store RabbitMQ data                                                | `""`        | No           |

#### YAML Example

```yaml title="rabbitmq.yaml"
replicas: 3
resourcesPreset: medium
size: 20Gi
storageClass: replicated
external: true
```

---

### **User Parameters**

| **Parameter**          | **Type**            | **Description**              | **Default** | **Required** |
| ---------------------- | ------------------- | ---------------------------- | ----------- | ------------ |
| `users`                | `map[string]object` | List of RabbitMQ users       | `{}`        | Yes          |
| `users[name].password` | `string`            | User password                | `null`      | Yes          |

#### YAML Example

```yaml title="rabbitmq.yaml"
users:
  admin:
    password: "securepassword"
  app:
    password: "apppassword123"
```

---

### **Virtual Hosts (vhosts) Parameters**

| **Parameter**                 | **Type**            | **Description**                                                   | **Default** | **Required** |
| ----------------------------- | ------------------- | ----------------------------------------------------------------- | ----------- | ------------ |
| `vhosts`                      | `map[string]object` | List of RabbitMQ virtual hosts                                    | `{}`        | No           |
| `vhosts[name].roles`          | `object`            | Roles and permissions associated with this virtual host           | `{}`        | No           |
| `vhosts[name].roles.admin`    | `[]string`          | List of users with administrator access on this vhost             | `[]`        | No           |
| `vhosts[name].roles.readonly` | `[]string`          | List of users with read-only access                               | `[]`        | No           |

#### YAML Example

```yaml title="rabbitmq.yaml"
vhosts:
  "default":
    roles:
      admin: ["admin"]
      readonly: ["app"]
  "analytics":
    roles:
      admin: ["admin"]
      readonly: ["analyst"]
```

---

### **resources and resourcesPreset**

The `resources` field allows explicitly defining the CPU and memory configuration of each RabbitMQ replica.
If this field is left empty, the value of the `resourcesPreset` parameter is used.

#### YAML Example

```yaml title="rabbitmq.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```

⚠️ If `resources` is defined, the `resourcesPreset` value is ignored.

| **Preset name** | **CPU** | **Memory** |
| --------------- | ------- | ---------- |
| `nano`          | 100m    | 128Mi      |
| `micro`         | 250m    | 256Mi      |
| `small`         | 500m    | 512Mi      |
| `medium`        | 500m    | 1Gi        |
| `large`         | 1       | 2Gi        |
| `xlarge`        | 2       | 4Gi        |
| `2xlarge`       | 4       | 8Gi        |

---

## Complete Examples

### Production Cluster

```yaml title="rabbitmq-production.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: production
spec:
  replicas: 3
  resources:
    cpu: 2000m
    memory: 4Gi
  size: 20Gi
  storageClass: replicated
  external: false

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: SecureAppPassword
    monitoring:
      password: SecureMonitoringPassword

  vhosts:
    production:
      roles:
        admin: ["admin"]
        readonly: ["monitoring"]
    analytics:
      roles:
        admin: ["admin"]
        readonly: ["appuser"]
```

### Development Cluster

```yaml title="rabbitmq-development.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: development
spec:
  replicas: 1
  resourcesPreset: nano
  size: 5Gi
  external: true

  users:
    dev:
      password: devpassword

  vhosts:
    default:
      roles:
        admin: ["dev"]
```

---

:::tip Best Practices

- **3 replicas for quorum queues**: with 3 nodes, RabbitMQ uses quorum queues to ensure message durability in case of failure
- **Vhosts per application**: isolate each application in a dedicated vhost to limit the impact in case of overload
- **Distinct roles**: separate admin, application, and monitoring users with appropriate permissions
- **Replicated storage**: use `storageClass: replicated` to protect data against the loss of a node
:::

:::warning Warning

- **Deletions are irreversible**: deleting a RabbitMQ resource results in the permanent loss of all queues and messages
- **Fewer than 3 replicas**: with fewer than 3 replicas, quorum queues cannot guarantee message durability in case of failure
- **Exposed ports**: if `external: true`, the AMQP (5672) and Management UI (15672) ports are accessible from outside -- secure the credentials
:::

---

### External References

* **Official RabbitMQ Operator:** [GitHub -- rabbitmq/cluster-operator](https://github.com/rabbitmq/cluster-operator/)
* **RabbitMQ Operator Documentation:** [operator-overview.html](https://www.rabbitmq.com/kubernetes/operator/operator-overview.html)
