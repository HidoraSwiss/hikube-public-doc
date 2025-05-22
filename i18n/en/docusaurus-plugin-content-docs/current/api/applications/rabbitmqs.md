---
title: RabbitMQ
---

**RabbitMQ** is a powerful message broker, essential in modern distributed systems. The **Managed RabbitMQ** service simplifies the deployment and management of RabbitMQ clusters, ensuring reliability and scalability for your messaging needs.

---

## Configuration Example

Here is a YAML configuration example for a RabbitMQ deployment with three replicas:

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: rabbitmq-example
spec:
  external: false
  replicas: 3
  size: 20Gi
  storageClass: replicated
  users:
    user1:
      password: securepassword
  vhosts:
    myapp:
      roles:
        admin:
        - user1

```

Using the kubeconfig provided by Hikube and this example yaml, saved as a `manifest.yaml` file, you can easily test the application deployment using the following command:

```sh
kubectl apply -f manifest.yaml
```

---

## Configurable Parameters

### **General Parameters**

| **Name**      | **Description**                                  | **Default Value** |
|-----------------|------------------------------------------------------|------------------------|
| `external`     | Allows external access from outside the cluster.    | `false`               |
| `size`         | Size of the persistent volume for data.             | `10Gi`                |
| `replicas`     | Number of RabbitMQ replicas.                        | `3`                   |
| `storageClass` | Storage class used for data.                        | `"replicated"` or `"local"`   |

---

### **Configuration Parameters**

| **Name**    | **Description**                   | **Default Value** |
|--------------|---------------------------------------|------------------------|
| `users`      | Users configuration.                  | `{}`                  |
| `vhosts`     | Virtual Hosts configuration.          | `{}`                  |

---

## Additional Resources

To learn more about RabbitMQ and its operator, check the following resources:

- **[Official RabbitMQ Cluster Operator Documentation](https://www.rabbitmq.com/kubernetes/operator/operator-overview.html)**
  Comprehensive guide on using the RabbitMQ operator.
