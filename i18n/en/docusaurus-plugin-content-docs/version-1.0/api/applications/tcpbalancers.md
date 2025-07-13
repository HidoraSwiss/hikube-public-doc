---
title: TCP Balancers
---

The **Managed TCP Load Balancer** service simplifies the deployment and management of TCP load balancers. It efficiently distributes incoming TCP traffic across multiple backend servers, ensuring high availability and optimal resource utilization.

---

## Configuration Example

Here is a YAML configuration example for a TCP Load Balancer deployment with two replicas and an enabled network whitelist:

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: TCPBalancer
metadata:
  name: tcp-balancer-example
spec:
  external: false
  replicas: 2
  httpAndHttps:
    mode: tcp
    targetPorts:
      http: 80
      https: 443
    endpoints:
      - address: "192.168.1.10"
      - address: "192.168.1.11"
  whitelistHTTP: true
  whitelist:
    - "192.168.1.0/24"
    - "10.0.0.0/8"
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
| `replicas`     | Number of HAProxy replicas.                         | `2`                   |

---

### **Configuration Parameters**

| **Name**                    | **Description**                                      | **Default Value** |
|------------------------------|----------------------------------------------------------|------------------------|
| `httpAndHttps.mode`         | Mode for the balancer (`tcp` or `tcp-with-proxy`).    | `tcp`                 |
| `httpAndHttps.targetPorts.http` | HTTP port used by the balancer.                      | `80`                  |
| `httpAndHttps.targetPorts.https` | HTTPS port used by the balancer.                    | `443`                 |
| `httpAndHttps.endpoints`    | List of backend endpoint addresses.                   | `[]`                  |
| `whitelistHTTP`             | Enables HTTP security via a network whitelist.        | `false`               |
| `whitelist`                 | List of authorized client networks.                   | `[]`                  |

---

## Additional Resources

To learn more about HAProxy and TCP load balancing, check the following resources:

- **[Official HAProxy Documentation](https://www.haproxy.com/documentation/)**
  Comprehensive guide for configuring and using HAProxy in load balancing scenarios.
