---
title: "How to configure external networking"
---

# How to configure external networking

Hikube offers two network exposure methods to make a VM accessible from the outside: **PortList** (recommended) and **WholeIP**. This guide explains how to choose and configure each method.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- An existing **VMInstance** or a manifest ready to deploy
- Knowledge of the ports required for your application

## Steps

### 1. Choose the exposure method

Hikube supports two methods via the `externalMethod` parameter:

| Method | Description | Use case |
|--------|-------------|----------|
| **PortList** | Only the ports listed in `externalPorts` are exposed. Automatic firewall. | Production, secure environments |
| **WholeIP** | All VM ports are exposed. No network filtering. | Development, testing, VPN/Gateway, full administrative access |

:::tip Recommendation
Use **PortList** in production. This method applies an automatic firewall that only exposes explicitly declared ports.
:::

### 2. Configure with PortList (recommended)

With `PortList`, you explicitly declare the ports to expose via `externalPorts`. Everything else is blocked at the network level:

```yaml title="vm-portlist.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-web-server
spec:
  runStrategy: Always
  instanceType: u1.xlarge
  instanceProfile: ubuntu
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 80
    - 443
  disks:
    - vm-system-disk
  sshKeys:
    - ssh-ed25519 AAAA... user@host
```

In this example, only SSH (22), HTTP (80) and HTTPS (443) ports are accessible from the outside.

### 3. Configure with WholeIP (alternative)

With `WholeIP`, the VM receives a public IP with all ports open. The `externalPorts` parameter is not needed:

```yaml title="vm-wholeip.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-dev
spec:
  runStrategy: Always
  instanceType: u1.xlarge
  instanceProfile: ubuntu
  external: true
  externalMethod: WholeIP
  disks:
    - vm-system-disk
  sshKeys:
    - ssh-ed25519 AAAA... user@host
```

:::warning Security
With `WholeIP`, the VM is fully exposed on the Internet. All ports are accessible. Make sure to configure a **firewall at the operating system level** (ufw, firewalld, iptables) to restrict access.
:::

### 4. Apply and verify access

Apply the manifest:

```bash
kubectl apply -f vm-portlist.yaml
```

Wait for the VM to be in `Running` state:

```bash
kubectl get vminstance vm-web-server -w
```

## Verification

Retrieve the VM's external IP address:

```bash
kubectl get vminstance vm-web-server -o yaml
```

Test connectivity on the exposed ports:

```bash
# Test SSH
ssh -i ~/.ssh/hikube-vm ubuntu@<IP-EXTERNE>

# Test HTTP (if a web server is installed)
curl http://<IP-EXTERNE>
```

To verify that a non-exposed port is properly blocked (with PortList):

```bash
# This port should be unreachable with PortList
nc -zv <IP-EXTERNE> 8080
```

:::note Modifying ports
To add or remove exposed ports with `PortList`, edit the `externalPorts` list in the manifest and reapply with `kubectl apply`.
:::

## Going further

- [API Reference](../api-reference.md) -- Network configuration section
- [Quick start](../quick-start.md)
