---
title: HTTPCache
---

The **HTTPCache** service is a managed cache system based on **Nginx** designed to optimize web traffic and improve web application performance. It combines customized Nginx instances with **HAProxy** to provide efficient caching and load balancing.

---

## Configuration Example

Here is a YAML configuration example to deploy HTTPCache with two replicas for HAProxy and Nginx:

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: HTTPCache
metadata:
  name: httpcache-example
spec:
  external: true
  size: 20Gi
  storageClass: "replicated"
  haproxy:
    replicas: 2
  nginx:
    replicas: 2
  endpoints:
    - url: "https://example-origin.com"
    - url: "https://another-origin.com"
```

Using the kubeconfig provided by Hikube and this example yaml, saved as a `manifest.yaml` file, you can easily test the application deployment using the following command:

```sh
kubectl apply -f manifest.yaml
```

---

## Main Features

- **Nginx Modules and Integrations**:
  - **VTS** module for statistics.
  - Integration with **ip2location** and **ip2proxy** for IP geolocation.
  - **51Degrees** support for device detection.
  - Cache purge functionality.

- **HAProxy Role**:
  - HAProxy uses a **consistent hash** based on URL to direct traffic to appropriate Nginx instances.
  - Active/backup operation for high availability.

- **Cache Storage**:
  - Each Nginx instance uses a **Persistent Volume Claim (PVC)** to store cached content, ensuring fast and reliable access to frequently used resources.

---

## Deployment Architecture

The deployment architecture is divided into three main layers:

1. **Load Balancer**: HAProxy for load balancing.
2. **Caching Layer**: Nginx instances with PVC.
3. **Origin Layer**: Origin servers for non-cached content.

Here is a diagram illustrating the architecture:

```scss
      ┌─────────┐
      │ metallb │ arp announce
      └────┬────┘
           │
           │
   ┌───────▼───────────────────────────┐
   │  kubernetes service               │  node
   │ (externalTrafficPolicy: Local)    │  level
   └──────────┬────────────────────────┘
              │
              │
         ┌────▼────┐  ┌─────────┐
         │ haproxy │  │ haproxy │   loadbalancer
         │ (active)│  │ (backup)│      layer
         └────┬────┘  └─────────┘
              │
              │ balance uri whole
              │ hash-type consistent
       ┌──────┴──────┬──────────────┐
   ┌───▼───┐     ┌───▼───┐      ┌───▼───┐ caching
   │ nginx │     │ nginx │      │ nginx │  layer
   └───┬───┘     └───┬───┘      └───┬───┘
       │             │              │
  ┌────┴───────┬─────┴────┬─────────┴──┐
  │            │          │            │
┌───▼────┐ ┌────▼───┐ ┌───▼────┐  ┌────▼───┐
│ origin │ │ origin │ │ origin │  │ origin │
└────────┘ └────────┘ └────────┘  └────────┘
```

---

## Configurable Parameters

### **General Parameters**

| **Name**          | **Description**                                           | **Default Value** |
|---------------------|--------------------------------------------------------------|------------------------|
| `external`         | Allows external access to the HTTPCache service from outside the cluster. | `false`               |
| `size`             | Size of the persistent volume used for caching.           | `10Gi`                |
| `storageClass`     | Storage class used for data.                              | `"replicated"` or `"local"`   |
| `haproxy.replicas` | Number of HAProxy replicas.                               | `2`                   |
| `nginx.replicas`   | Number of Nginx replicas.                                 | `2`                   |

---

### **Configuration Parameters**

| **Name**      | **Description**               | **Default Value** |
|-----------------|---------------------------------|------------------------|
| `endpoints`    | Endpoints configuration.        | `[]`                  |

---

## Known Issues

- **Upstream response times in the VTS module**:
  The **VTS** module displays incorrect response times. This issue is documented here:
  [GitHub Issue - VTS Module](https://github.com/vozlt/nginx-module-vts/issues/198)

---

## Additional Resources

To learn more about configuring and using HTTPCache components, here are some useful resources:

- [**Official Nginx Documentation**](https://nginx.org/en/docs/)
  Comprehensive guide for configuring and optimizing Nginx, including specific modules like cache management.

- [**Official HAProxy Documentation**](https://haproxy.org/)
  Everything you need to know to configure HAProxy as a high-performance load balancer.
