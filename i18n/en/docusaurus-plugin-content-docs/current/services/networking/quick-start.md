---
sidebar_position: 3
title: Quick start
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Create a VPC and connect two VMs to it

This guide creates a VPC with a subnet from the [Hikube console](https://console.hikube.cloud), connects two VMs to it and checks that they communicate through their private addresses.

---

## Prerequisites

- A Hikube account and a **project** (see [Hikube quick start](../../getting-started/quick-start.md)).
- Two Linux VMs in this project, at least one of them reachable over SSH (see [Create your first VM](../compute/quick-start.md)). You can also create them during this guide.

---

## Step 1: Open the VPC creation wizard

1. In the side menu, open **Infrastructure** > **Networking**. The **Virtual Private Clouds** page lists the project's VPCs.
2. Click **Create VPC**.

The **Create VPC** wizard has three steps: **General**, **Subnets** and **Review**.

---

## Step 2: Configure and validate

### General

Enter the **VPC Name**, for example `vpc-demo` (3 to 16 characters: lowercase letters, digits and hyphens, starting with a letter). Click **Next**.

### Subnets

A subnet is pre-filled with the **CIDR Block** `172.16.0.0/24`.

1. **Name**: replace the generated name with `app`.
2. **CIDR Block**: keep `172.16.0.0/24`.
3. Optional: **Add a subnet** to create more (for example `db` in `172.16.1.0/24`), up to ten.
4. Click **Next**.

### Review

The **Configuration Summary** shows the **VPC Name** and its **Subnets**. Click **Create VPC**.

The console shows **VPC Created** and returns to the list.

---

## Step 3: Check the status

In the VPC list, the status of `vpc-demo` (**State** column in table view) should change from **Provisioning** to **Ready**.

Open the VPC's **Actions** menu and click **View Subnets**: the **Subnets for vpc-demo** page lists `app` with its **CIDR Block** `172.16.0.0/24`.

**Expected result:** VPC **Ready**, subnet `app` listed.

---

## Step 4: Connect the VMs to the subnet

For each of the two VMs:

1. Open **VM Instances**, click the VM, then **Edit**.
2. In **Network & Security**, under **VPC Networks (Secondary)**, check `vpc-demo`.
3. Under **Subnets**, check `app`.
4. Click **Save**.

For a new VM, make the same selection at the **Network** step of the **Create an Instance** wizard.

On the detail page of each VM, **Network & Security** section:

- **VPC Networks** shows `vpc-demo` and `app (172.16.0.0/24)`;
- **IP Addresses** shows a **Secondary** address in `172.16.0.0/24`. Note the one of the second VM.

---

## Step 5: Connect and test

Connect to the first VM over SSH (command from the **SSH Connection** block), then list its interfaces:

```bash
ip -br addr
```

**Expected result:** an additional interface appears (for example `enp2s0`), without an address: the OS does not configure it automatically.

Enable DHCP on this interface. Example with netplan (Ubuntu):

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

**Expected result:** `enp2s0` is `UP` with an address in `172.16.0.x/24`, the one shown as **Secondary** in the console. Do the same on the second VM.

Test communication with the second VM on its private address:

```bash
ping -c 3 172.16.0.11
```

Replace `172.16.0.11` with the **Secondary** address noted in step 4. The ping should get replies; this traffic goes neither through the Internet nor through the public IP firewall.

---

## Step 6: Quick troubleshooting

| Symptom | Action |
|---------|--------|
| **Invalid CIDR block** on creation | Enter an IPv4 range in the `a.b.c.d/n` format, for example `172.16.2.0/24`. |
| Error message mentioning an overlap (*overlaps*) | The range overlaps another subnet of the VPC or a reserved range (`10.244.0.0/16`, `10.96.0.0/12`): choose another range. |
| The secondary interface has no address in the VM | See [Troubleshooting](./troubleshooting.md#the-secondary-interface-has-no-address-in-the-vm). |
| The ping gets no reply | Check that both VMs are on the **same** subnet and that the OS firewall (ufw, firewalld) allows ICMP. |

---

## Step 7: Cleanup

1. Detach the VMs: **Edit** > **Network & Security**, uncheck `vpc-demo`, then **Save**.
2. In **Networking**, open the VPC's **Actions** menu and click **Delete**.
3. Enter the VPC's name to confirm, then click **Permanently delete**.

Deleting a VPC also deletes its subnets. It is refused as long as a VM is connected to it: the console shows **Cannot delete** with the list of the VMs concerned.

---

## Next steps

- [Connect or detach an existing VM](./how-to/attach-vm-to-vpc.md)
- [Manage subnets](./how-to/manage-subnets.md)
- [Concepts](./concepts.md)

<NavigationFooter
  nextSteps={[
    {label: "How-to guides", href: "../how-to/attach-vm-to-vpc"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
