---
title: VPN
---

The **Managed VPN Service** is an essential solution for ensuring secure and private communication over the Internet. This service simplifies the deployment and management of VPN servers, allowing you to easily establish secure connections.

---

## Configuration Example

Here is a YAML configuration example for a VPN server with two replicas and specified external IP addresses:

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VPN
metadata:
  name: vpn-example
spec:
  external: true
  replicas: 2
  host: "vpn.example.org"
  users:
    - name: "user1"
      password: "secure-password"
    - name: "user2"
      password: "another-secure-password"
  externalIPs:
    - "192.168.1.100"
    - "192.168.1.101"
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
| `replicas`     | Number of VPN server replicas.                      | `2`                   |

---

### **Configuration Parameters**

| **Name**       | **Description**                                 | **Default Value** |
|-------------------|-----------------------------------------------------|------------------------|
| `host`           | Host used to generate URLs.                        | `""`                  |
| `users`          | Users configuration.                               | `{}`                  |
| `externalIPs`    | List of external IP addresses for the service.      | `[]`                  |

---

## Additional Resources

To learn more about the VPN service and its compatible clients, check the following resources:

- **[Compatible Shadowsocks Clients](https://shadowsocks5.github.io/en/download/clients.html)**
  List of clients compatible with Shadowsocks.

- **[Shadowsocks Documentation](https://shadowsocks.org/)**
  Official guide for understanding and configuring Shadowsocks.

- **[Shadowbox on GitHub](https://github.com/Jigsaw-Code/outline-server/tree/master/src/shadowbox)**
  GitHub repository for Shadowbox and Outline Server.
