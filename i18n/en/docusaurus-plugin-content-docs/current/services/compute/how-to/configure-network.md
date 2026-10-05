---
title: "How to configure the network and firewall"
---

# How to configure the network and firewall

A Hikube VM can be exposed on the Internet through a public IPv4 address, filtered by a firewall that opens only the ports you choose. It can also be connected to private networks (VPCs). This guide explains how to set these options from the console, at creation or on an existing VM.

## Prerequisites

- A Hikube account and a project
- An existing VM, or the creation wizard open
- The list of ports your application needs

## Steps

### 1. Choose the exposure mode

| Configuration | Effect | Use case |
|---------------|-------|-------------|
| **Public IPv4 Address** enabled + **Enable Firewall** checked | Only the **Allowed Ports** are reachable from the Internet | Production, targeted services (recommended) |
| **Public IPv4 Address** enabled + firewall unchecked | All ports of the VM are reachable from the Internet | VPN, gateway, protocols with dynamic ports |
| **Public IPv4 Address** disabled | No exposure on the Internet | Internal VM, reachable through a [VPC](../../networking/overview.md) |

:::tip Recommendation
Keep the firewall enabled in production and open only the ports you need.

The firewall only filters traffic arriving through the public IP. Traffic between the project's VMs, on a VPC as well as on the main network, is not filtered: use the OS firewall for that (ufw, firewalld, nftables).
:::

### 2. Set the options at creation

At the **Network** step of the wizard:

1. **Public IPv4 Address**: leave the switch on to expose the VM.
2. **Enable Firewall**: leave the box checked.
3. **Allowed Ports**: check **SSH (22)**, **HTTP (80)**, **HTTPS (443)** as needed.
4. For another port, enter it in **Custom port...** (1 to 65535) and click the add button. It appears checked in the list; the trash icon removes it.

The **Summary** shows **Public IP**, **Firewall** and **Open Ports** before deployment.

### 3. Change the options of an existing VM

1. Open the VM detail page and click **Edit**.
2. In **Network & Security**, adjust **Public IPv4 Address**, **Enable Firewall** and the **Allowed Ports**.
3. Click **Save**.

These changes apply within a few seconds, without restarting the VM, unlike a change of instance type, disks or GPUs.

### 4. Connect the VM to a private network (optional)

Under **VPC Networks (Secondary)**, check a VPC, then one or more of its **Subnets**. Each subnet adds a private interface to the VM, which the OS does not configure automatically (see [Connect a VM to a VPC](../../networking/how-to/attach-vm-to-vpc.md#4-check-in-the-os)). The **+ VPC** button creates a VPC without leaving the screen, and **Add subnet** creates a subnet in the checked VPC. Details are in [Networking: quick start](../../networking/quick-start.md).

## Verification

On the detail page, **Network & Security** section:

- **Public IP**: **Active** or **Disabled**;
- **IP Addresses**: the **Primary** address and, where applicable, the **Secondary** addresses of the VPC subnets;
- **VPC Networks**: the connected VPCs and subnets;
- **Firewall & Ports**: the open ports, or **No ports open**.

Test from your workstation:

```bash
# SSH
ssh ubuntu@<public-ip>

# HTTP, if a web server is listening
curl http://<public-ip>

# A port that is not allowed must be unreachable
nc -zv -w 5 <public-ip> 8080
```

:::warning Firewall disabled
Without the Hikube firewall, the VM is fully exposed. Configure a firewall in the OS (ufw, firewalld, nftables) before disabling the option.
:::

## Further reading

- [Networking: VPCs and subnets](../../networking/overview.md)
- [VM quick start](../quick-start.md)
- [Troubleshooting](../troubleshooting.md)
