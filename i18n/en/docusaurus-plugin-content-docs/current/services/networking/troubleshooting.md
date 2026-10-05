---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — Networking

### CIDR block refused when creating a subnet

**Cause**: invalid format, public range, overlap with another subnet of the VPC or with a reserved range.

**Solution**:

| Message | Fix |
|---------|-----|
| **Invalid CIDR block (ex: 192.168.1.0/24)** or **Invalid CIDR format (e.g. 172.16.0.0/24)** | Enter an IPv4 address followed by a prefix, for example `172.16.0.0/24`. |
| Message stating that the range must be private | Use a range within `10.0.0.0/8`, `172.16.0.0/12` or `192.168.0.0/16`. |
| Message mentioning an overlap (*overlaps*) with an existing subnet | Choose a range that does not overlap the other subnets of the VPC (list in **View Subnets**). |
| Message mentioning an overlap with a reserved network | Avoid `10.244.0.0/16` and `10.96.0.0/12`; prefer `172.16.0.0/12`. |

---

### VPC or subnet name refused

**Cause**: the name does not follow the rules, or it already exists.

**Solution**:

- **VPC**: 3 to 16 characters, lowercase letters, digits and hyphens, starting with a letter and ending with a letter or a digit. Unique within the project.
- **Subnet**: 1 to 63 characters, lowercase letters, digits and hyphens. Unique within the VPC.

---

### The VPC stays in Provisioning

**Cause**: the platform has not finished provisioning the network.

**Solution**: the list updates automatically; wait a few moments. If the state does not change to **Ready** after a few minutes, contact [support](mailto:support@hidora.io), giving the name of the VPC.

---

### The secondary interface has no address in the VM

**Cause**: the platform adds the interface to the VM, but the OS does not configure it automatically (this is the case on Ubuntu 24.04); or the VM has not yet taken the change into account.

**Solution**:

1. On the VM's detail page, check that **VPC Networks** lists the subnet and that **IP Addresses** contains a **Secondary** address.
2. In the VM, list the interfaces:
   ```bash
   ip -br link
   ip -br addr
   ```
3. If the interface exists without an address, enable DHCP on it (netplan example in [Connect a VM to a VPC](./how-to/attach-vm-to-vpc.md#4-check-in-the-os)).
4. If the interface does not appear at all, restart the VM (**Restart** in the **Actions** section).
5. If the problem persists, contact [support](mailto:support@hidora.io).

---

### Two VMs on the same subnet cannot communicate

**Cause**: VMs on different subnets or VPCs, interface not configured in the OS, or OS firewall.

**Solution**:

1. Compare the **VPC Networks** section of the two VMs: they must share the same VPC **and** the same subnet.
2. Check in each VM that the secondary interface carries the address shown in the console (`ip -br addr`).
3. Check the OS firewall (`sudo ufw status`, `sudo firewall-cmd --list-all`, `sudo nft list ruleset`).
4. Test with the interface specified explicitly:
   ```bash
   ping -c 3 -I enp2s0 <other-vm-address>
   ```

---

### The VM lost Internet access after adding a VPC

**Cause**: the OS network configuration made the VPC interface the default route.

**Solution**: check the default route:

```bash
ip route show default
```

It must go through the primary interface. If it goes through the VPC interface, disable the use of DHCP routes on that interface (`use-routes: false` with netplan, see [Connect a VM to a VPC](./how-to/attach-vm-to-vpc.md#4-check-in-the-os)).

---

### Cannot delete

**Cause**: the VPC or the subnet is still used by VMs. The console lists the VMs concerned.

**Solution**: for each VM listed, open **Edit** > **Network & Security**, uncheck the VPC or the subnet, then **Save**. Then try the deletion again.
