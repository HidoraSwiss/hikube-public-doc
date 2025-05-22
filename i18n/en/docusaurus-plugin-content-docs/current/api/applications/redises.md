---
title: Redis
---

**Redis** is an ultra-fast and versatile in-memory data store, often used as a cache to significantly improve application performance. The **Managed Redis** service provides a turnkey solution for deploying and managing Redis clusters, ensuring optimal availability and responsiveness of your data.

---

## Configuration Example

Here is a YAML configuration example for a Redis deployment with two replicas and enabled authentication:

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: redis-example
spec:
  external: false
  size: 1Gi
  replicas: 2
  storageClass: "replicated"
  authEnabled: true
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
| `size`         | Size of the persistent volume for data.             | `1Gi`                 |
| `replicas`     | Number of Redis replicas.                           | `2`                   |
| `storageClass` | Storage class used for data.                        | `"replicated"` or `"local"`   |
| `authEnabled`  | Enables automatic password generation.              | `true`                |

---

## Additional Resources

To deepen your knowledge of Redis and its operator, check the following resources:

- **[Official Redis Documentation](https://redis.io/docs/)**
  Comprehensive guide for configuring and using Redis.
