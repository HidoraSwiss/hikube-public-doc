---
title: "How to resolve .local DNS in VMs"
---

# How to resolve .local DNS in VMs

Hikube VMs based on Debian or Ubuntu use `systemd-resolved` for DNS resolution. However, the platform's internal DNS domain ends in `.local` (`cozy.local`), and by default `systemd-resolved` refuses `*.local` queries because this TLD is reserved for the mDNS protocol (RFC 6762). This guide explains how to fix this behavior in the VM's OS.

## Prerequisites

- A Hikube VM based on Debian or Ubuntu
- **SSH** access to the VM (command from the **SSH Connection** block on the detail page)
- **root** or **sudo** privileges

## Steps

### 1. Diagnose the problem

Connect to the VM:

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@<public-ip>
```

Check the current DNS configuration:

```bash
resolvectl status
```

Find the section for the main network interface (often `enp1s0`). It contains neither a search domain nor a routing domain.

Test resolving a `.local` name:

```bash
dig mon-service.cozy.local
```

**Typical result of the problem:**

```
;; ->>HEADER<<- opcode: QUERY, status: REFUSED, id: 12345
```

The `REFUSED` status confirms that `systemd-resolved` sends the `.local` query to mDNS instead of the unicast DNS server.

**Root cause**: the platform's DHCP provides a DNS server but no search domain. Without a `~local` routing domain, `systemd-resolved` applies RFC 6762 and routes `.local` to mDNS.

### 2. Create the systemd-networkd drop-in

:::warning Do not use netplan
Netplan does not handle routing domains (`~` prefix). Use a `systemd-networkd` drop-in directly.
:::

Find the name of the network file generated for the interface:

```bash
networkctl status enp1s0 | grep "Network File"
```

Create the matching drop-in directory (here for `10-netplan-enp1s0.network`):

```bash
sudo mkdir -p /etc/systemd/network/10-netplan-enp1s0.network.d/
```

Create the configuration file:

```bash
sudo tee /etc/systemd/network/10-netplan-enp1s0.network.d/dns-fix.conf << 'EOF'
[Network]
Domains=cozy.local ~local ~.
EOF
```

**Configured domains:**

| Domain | Role |
|---------|------|
| `cozy.local` | Search domain: resolves names relative to `cozy.local` |
| `~local` | Routing domain: forces `.local` to unicast DNS instead of mDNS |
| `~.` | Routing domain: makes this interface the default DNS route (without it, external resolution stops working) |

:::note Additional search domains
If you were given a more specific internal domain (for example `<space>.svc.cozy.local`), add it at the start of the `Domains=` line to be able to use short names. If in doubt about which domain to use, contact [support](mailto:support@hidora.io).
:::

### 3. Apply the configuration

```bash
sudo systemctl restart systemd-networkd systemd-resolved
```

### 4. Check the configuration

```bash
resolvectl status
```

The interface section must list the domains:

```
Link 2 (enp1s0)
    Current Scopes: DNS
         Protocols: +DefaultRoute ...
Current DNS Server: 10.x.x.x
       DNS Servers: 10.x.x.x
        DNS Domain: ~.
                    ~local
                    cozy.local
```

## Verification

Test resolving a fully qualified `.local` name:

```bash
dig mon-service.cozy.local
```

**Expected result:** status `NOERROR` (or `NXDOMAIN` if the name does not exist), and no longer `REFUSED`.

Check that external resolution still works:

```bash
dig example.com
```

:::tip Persistence
The drop-in is read by `systemd-networkd` at every boot: the fix survives restarts.
:::

:::tip Automate with cloud-init
To apply the fix from creation, add it to the **Cloud-Init script (User Data)**:

```yaml title="user-data.yaml"
#cloud-config
write_files:
  - path: /etc/systemd/network/10-netplan-enp1s0.network.d/dns-fix.conf
    content: |
      [Network]
      Domains=cozy.local ~local ~.
runcmd:
  - systemctl restart systemd-networkd systemd-resolved
```
:::

## Further reading

- [Configure cloud-init](./configure-cloud-init.md)
- [Troubleshooting](../troubleshooting.md)
