---
title: "How to connect a VM to a VPC"
---

# How to connect a VM to a VPC

This guide explains how to connect a VM to one or more VPC subnets, at creation or on an existing VM, then how to check and configure the interface in the OS. It also covers detaching.

## Prerequisites

- A Hikube account and a project
- A VPC with at least one subnet (see [Quick start](../quick-start.md)), or the intention to create one from the VM wizard
- SSH access to the VM for verification

## Steps

### 1. Connect a new VM

1. Open **VM Instances** > **Create an Instance** and fill in the first steps.
2. At the **Network** step, **VPC Networks (Secondary)** section, check the VPC you want.
3. Under **Subnets**, check one or more subnets.
4. Finish the wizard: the **Summary** shows **Private Networks** with the number of subnets. Click **Create instance**.

No VPC yet? Click **+ VPC** in the **VPC Networks (Secondary)** section: the **Create VPC** dialog lets you create the VPC and its subnets, then checks it automatically. To add a subnet to a checked VPC, click **Add subnet**, enter a name and a CIDR range, then confirm.

### 2. Connect an existing VM

1. Open the VM's detail page and click **Edit**.
2. In **Network & Security**, under **VPC Networks (Secondary)**, check the VPC, then the subnets.
3. Click **Save**.

### 3. Check in the console

On the VM's detail page, **Network & Security** section:

- **VPC Networks** lists each VPC with its **Connected subnets** and their range, for example `app (172.16.0.0/24)`;
- **IP Addresses** adds one **Secondary** address per subnet.

### 4. Check in the OS

```bash
ip -br addr
```

**Expected result:** one additional interface per connected subnet. The OS does not configure it automatically: it first appears without an address, for example:

```
lo               UNKNOWN        127.0.0.1/8 ::1/128
enp1s0           UP             10.x.x.x/xx ...
enp2s0           DOWN
```

Enable DHCP on the secondary interface. Example with netplan (Ubuntu):

```yaml title="/etc/netplan/60-vpc.yaml"
network:
  version: 2
  ethernets:
    enp2s0:
      dhcp4: true
      dhcp4-overrides:
        use-routes: false
```

```bash
sudo chmod 600 /etc/netplan/60-vpc.yaml
sudo netplan apply
ip -br addr show enp2s0
```

**Expected result:** `enp2s0` is `UP` with the **Secondary** address shown in the console, for example `172.16.0.11/24`.

`use-routes: false` prevents the VPC interface from replacing the default route: Internet access keeps going through the primary interface.

### 5. Detach a VM

1. VM detail page > **Edit**.
2. Under **VPC Networks (Secondary)**, uncheck the subnet, or the whole VPC.
3. Click **Save**.

Then remove the corresponding configuration in the OS (for example the netplan file you added).

## Verification

From another VM on the same subnet:

```bash
ping -c 3 <secondary-address-of-the-vm>
```

## Further reading

- [Manage subnets](./manage-subnets.md)
- [Configure a VM's network and firewall](../../compute/how-to/configure-network.md)
- [Troubleshooting](../troubleshooting.md)
