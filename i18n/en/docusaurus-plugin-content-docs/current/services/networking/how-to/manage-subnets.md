---
title: "How to manage the subnets of a VPC"
---

# How to manage the subnets of a VPC

A VPC cannot be modified after it is created, but you can add subnets to it and delete those that are no longer used. This guide shows how to do this from the console and how to choose the address ranges.

## Prerequisites

- A Hikube account and a project
- An existing VPC in **Infrastructure** > **Networking**

## Steps

### 1. Plan the address ranges

Choose a private IPv4 range that does not overlap any other subnet of the VPC. Example layout:

| Subnet | CIDR block | Addresses |
|--------|------------|-----------|
| `app` | `172.16.0.0/24` | 256 |
| `db` | `172.16.1.0/24` | 256 |
| `admin` | `172.16.2.0/26` | 64 |

Allowed ranges: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, excluding the reserved ranges `10.244.0.0/16` and `10.96.0.0/12`.

### 2. Open the subnet list

1. Open **Infrastructure** > **Networking**.
2. In the VPC's **Actions** menu, click **View Subnets**.

The **Subnets for `<vpc>`** page lists each subnet with its **Subnet Name** and its **CIDR Block**.

### 3. Create a subnet

1. Click **Create Subnet**.
2. **Subnet Name**: 1 to 63 characters, lowercase letters, digits and hyphens.
3. **IPv4 CIDR Block**: for example `172.16.2.0/26`.
4. Click **Create Subnet**.

The console shows **Subnet created!** and returns to the list. The subnet is immediately offered in the **VPC Networks (Secondary)** section of VMs.

### 4. Delete a subnet

1. First detach the VMs that use it (see [Connect a VM to a VPC](./attach-vm-to-vpc.md#5-detach-a-vm)).
2. In the subnet list, open the row's **Actions** menu and click **Delete**.
3. Enter the subnet's name to confirm, then click **Permanently delete**.

If a VM is still connected to it, the console shows **Cannot delete** and the list of the VMs concerned.

### 5. Change the range of a subnet

A subnet cannot be modified. Create a new subnet with the right range, connect the VMs to it, detach them from the old one, then delete it.

## Verification

The **Subnets for `<vpc>`** page reflects creations and deletions. On a connected VM, the **VPC Networks** section of the detail page shows the connected subnets with their range.

## Further reading

- [Concepts: address ranges](../concepts.md#address-ranges)
- [Connect a VM to a VPC](./attach-vm-to-vpc.md)
