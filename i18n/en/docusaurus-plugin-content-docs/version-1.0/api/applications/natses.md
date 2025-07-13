---
title: NATS
---

**NATS** is a lightweight and high-performance messaging solution used for microservices communication, IoT, and real-time applications. This managed service facilitates the management of NATS clusters, with support for Jetstream for persistent messaging.

---

## Configuration Example

Here is a YAML configuration example for a NATS cluster with Jetstream enabled and custom parameters:

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: nats-example
spec:
  external: false
  replicas: 3
  storageClass: "replicated"
  users:
    user1:
      password: "strongpassword"
    user2: {}
  jetstream:
    enabled: true
    size: 20Gi
  config:
    merge:
      server_name: "nats-example"
      authorization:
        token: "my-secret-token"
      jetstream:
        max_memory_store: 2Gi
```

Using the kubeconfig provided by Hikube and this example yaml, saved as a `manifest.yaml` file, you can easily test the application deployment using the following command:

```sh
kubectl apply -f manifest.yaml
```

---

## Configurable Parameters

### **General Parameters**

| **Name**       | **Description**                                   | **Default Value** |
|-----------------|------------------------------------------------------|------------------------|
| `external`     | Allows external access from outside the cluster.    | `false`               |
| `replicas`     | Number of replicas in the NATS cluster.             | `2`                   |
| `storageClass` | Storage class used for data.                        | `"replicated"` or `"local"`  |

---

### **Configuration Parameters**

| **Name**           | **Description**                                                                       | **Default Value** |
|-----------------------|-----------------------------------------------------------------------------------------------------|------------------------|
| `users`              | Users configuration.                                                                  | `{}`                  |
| `jetstream.size`     | Size of persistent storage for Jetstream (message store).                            | `10Gi`                |
| `jetstream.enabled`  | Enables or disables Jetstream for persistent messaging.                              | `true`                |
| `config.merge`       | Additional configuration to merge into the NATS configuration.                        | `{}`                  |
| `config.resolver`    | Additional configuration to merge for resolution in the NATS configuration.           | `{}`                  |

---

## Additional Resources

To learn more about NATS and Jetstream, check the following resources:

- **[Official NATS Documentation](https://docs.nats.io/)**
  Comprehensive guide for configuring and using NATS.

- **[Jetstream Documentation](https://docs.nats.io/jetstream/)**
  Guide on using Jetstream for persistent messaging.
