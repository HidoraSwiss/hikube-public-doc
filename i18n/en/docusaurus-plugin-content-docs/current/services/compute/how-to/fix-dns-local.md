---
title: "How to fix .local DNS resolution in VMs"
---

# How to fix .local DNS resolution in VMs

Hikube VMs based on Debian or Ubuntu use `systemd-resolved` for DNS resolution. However, the cluster's internal DNS domain is `cozy.local`, and `systemd-resolved` refuses all `*.local` queries by default because this TLD is reserved for the mDNS protocol (RFC 6762). This guide explains how to fix this behavior to allow DNS resolution of Kubernetes services from within a VM.

## Prerequisites

- A Hikube **VMInstance** based on Debian or Ubuntu
- **SSH** or **console** access to the VM
- **root** or **sudo** privileges on the VM

## Steps

### 1. Diagnose the problem

Connect to the VM:

```bash
virtctl ssh ubuntu@my-vm
```

Check the current DNS configuration:

```bash
resolvectl status
```

Look at your network interface section (usually `enp1s0`). You will notice the absence of search domains and routing domains.

Test the resolution of a Kubernetes service:

```bash
dig my-service.my-namespace.svc.cozy.local
```

**Typical result of the problem:**

```
;; ->>HEADER<<- opcode: QUERY, status: REFUSED, id: 12345
```

The `REFUSED` status confirms that `systemd-resolved` is sending the `.local` query to mDNS (disabled in the VM) instead of the unicast DNS server.

**Root cause**: KubeVirt's DHCP (virt-launcher) provides a DNS server but does not transmit search domains. Without the `~local` routing domain, `systemd-resolved` applies the default RFC 6762 behavior and routes `.local` to mDNS.

### 2. Create the systemd-networkd drop-in

The solution is to create a drop-in file for `systemd-networkd` that declares the appropriate search domains and routing domains.

:::warning Do not use netplan
Netplan does not support routing domains (`~` prefix). Use a `systemd-networkd` drop-in directly.
:::

Create the drop-in directory:

```bash
sudo mkdir -p /etc/systemd/network/10-netplan-enp1s0.network.d/
```

Create the configuration file:

```bash
sudo tee /etc/systemd/network/10-netplan-enp1s0.network.d/dns-fix.conf << 'EOF'
[Network]
Domains=<namespace>.svc.cozy.local svc.cozy.local cozy.local ~local ~.
EOF
```

:::note Replace the namespace
Replace `<namespace>` with the actual name of your Hikube namespace (tenant). For example: `tenant-prod.svc.cozy.local`.
:::

**Explanation of the configured domains:**

| Domain | Role |
|--------|------|
| `<namespace>.svc.cozy.local` | Search domain: enables short name resolution (e.g., `my-service` instead of `my-service.my-namespace.svc.cozy.local`) |
| `svc.cozy.local` | Search domain: resolution of services in other namespaces |
| `cozy.local` | Search domain: resolution of any name in the cluster |
| `~local` | Routing domain: forces `.local` to the unicast DNS instead of mDNS |
| `~.` | Routing domain: makes this interface the default DNS route (otherwise external resolution stops working) |

### 3. Apply the configuration

Restart the network services:

```bash
sudo systemctl restart systemd-networkd systemd-resolved
```

### 4. Verify the configuration

Check that the domains are correctly applied:

```bash
resolvectl status
```

You should see the search domains and routing domains in the `enp1s0` interface section:

```
Link 2 (enp1s0)
    Current Scopes: DNS
         Protocols: +DefaultRoute ...
Current DNS Server: 10.x.x.x
       DNS Servers: 10.x.x.x
        DNS Domain: ~.
                    ~local
                    <namespace>.svc.cozy.local
                    svc.cozy.local
                    cozy.local
```

## Verification

Test DNS resolution of a Kubernetes service by fully qualified domain name (FQDN):

```bash
dig my-service.my-namespace.svc.cozy.local
```

**Expected output:** `NOERROR` status with a response containing the service's IP address.

Test short name resolution (using search domains):

```bash
dig my-service
```

Test that external DNS resolution still works:

```bash
dig google.com
```

:::tip Persistence
This configuration is **persistent**: it survives VM reboots. The drop-in file is automatically read by `systemd-networkd` at startup.
:::

:::note Platform-level fix
This issue will eventually be resolved at the Hikube platform level by configuring KubeVirt's DHCP (virt-launcher) to transmit search domains to VMs. In the meantime, this manual fix is required.
:::

## Going further

- [API Reference](../api-reference.md)
- [Quick start](../quick-start.md)
