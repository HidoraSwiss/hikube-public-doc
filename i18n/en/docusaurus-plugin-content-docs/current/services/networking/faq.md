---
sidebar_position: 6
title: FAQ
---

# FAQ — Networking

### What is a VPC for if my VM already has a public IP?

The public IP is used to expose the VM on the Internet. The VPC is used for traffic **between your VMs**, on private addresses that cannot be reached from the Internet. This way you can give a public IP only to front-end VMs and keep the others private.

---

### Can a VM be connected to several VPCs?

Yes. Check several VPCs, and one or more subnets in each, in the **VPC Networks (Secondary)** section. Each subnet adds a network interface to the VM.

---

### Which address ranges can I use?

Private IPv4 ranges: `10.0.0.0/8`, `172.16.0.0/12` or `192.168.0.0/16`, without overlapping another subnet of the same VPC or the reserved ranges `10.244.0.0/16` and `10.96.0.0/12`. We recommend `/24` ranges within `172.16.0.0/12`. See [Concepts](./concepts.md#address-ranges).

---

### Can two VPCs use the same range?

Yes: VPCs are isolated, their ranges can overlap. Only the subnets of the same VPC must not overlap.

---

### Can I connect two VPCs to each other?

VPC interconnection (*peering*) and static routes are not offered in the console; contact [support](mailto:support@hidora.io).

---

### Can I modify a VPC or a subnet?

No. You can add subnets to a VPC and delete those that are no longer used. To change a range, create a new subnet and migrate the VMs to it (see [Manage subnets](./how-to/manage-subnets.md)).

---

### Can my Kubernetes clusters or databases join a VPC?

Not from the console: the **VPC Networks (Secondary)** section only exists for VM instances.

---

### Does the VM's firewall apply to VPC traffic?

No. The Hikube firewall (**Enable Firewall**, **Allowed Ports**) only filters traffic arriving through the VM's public IP. Traffic between VMs of a VPC is not filtered, whatever the allowed ports: for that, configure a firewall in the OS (ufw, firewalld, nftables).

---

### Why can't I delete my VPC?

A VM is still connected to it: the console shows **Cannot delete** with the names of the VMs. Detach them (**Edit** > **Network & Security**) or delete them, then try again.

---

### How many subnets can I create?

The **Create VPC** wizard accepts up to ten subnets. More can be added afterwards with **Create Subnet**, as long as their ranges do not overlap.
