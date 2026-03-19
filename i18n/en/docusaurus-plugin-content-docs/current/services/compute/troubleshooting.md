---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — Virtual Machines

### VM does not boot

**Cause**: the system disk is not ready, the source image is invalid, or the instance profile does not match the image.

**Solution**:

1. Verify that VMDisk resources exist and are ready:
   ```bash
   kubectl get vmdisk
   ```

2. Check the VMInstance events:
   ```bash
   kubectl describe vminstance <vm-name>
   ```

3. Make sure the `instanceProfile` matches the image used (for example `ubuntu` for an Ubuntu image).

4. Verify that the chosen `instanceType` is valid (prefix `s1`, `u1`, or `m1` followed by a valid size).

---

### SSH timeout with PortList

**Cause**: port 22 is not in the `externalPorts` list, external exposure is not enabled, or the SSH key was not injected.

**Solution**:

1. Verify that `external: true` is enabled and port 22 is listed:
   ```yaml title="vm.yaml"
   spec:
     external: true
     externalMethod: PortList
     externalPorts:
       - 22
   ```

2. Retrieve the exposed service IP address:
   ```bash
   kubectl get svc
   ```

3. Verify that your SSH key was injected in the manifest:
   ```yaml title="vm.yaml"
   spec:
     sshKeys:
       - "ssh-ed25519 AAAAC3... user@laptop"
   ```

4. Test the connection in verbose mode:
   ```bash
   ssh -v user@<external-ip>
   ```

---

### .local DNS does not work in the VM

**Cause**: `systemd-resolved` treats `.local` domains as mDNS (multicast DNS), which prevents standard DNS resolution for these domains.

**Solution**:

1. Create a drop-in for `systemd-networkd` that disables mDNS:
   ```bash
   sudo mkdir -p /etc/systemd/network/10-cloud-init-eth0.network.d
   ```

2. Create the configuration file:
   ```bash
   sudo tee /etc/systemd/network/10-cloud-init-eth0.network.d/override.conf << 'EOF'
   [Network]
   MulticastDNS=no
   EOF
   ```

3. Reload the network configuration:
   ```bash
   sudo networkctl reload
   ```

4. Verify that resolution works:
   ```bash
   resolvectl status
   resolvectl query my-service.local
   ```

:::note
This issue affects all distributions using `systemd-resolved` (Ubuntu 22.04+, Debian 12+, etc.). The fix persists after reboot.
:::

---

### Disk not attached to the VM

**Cause**: the VMDisk name does not match the entry in `spec.disks`, the VMDisk is not ready, or the `storageClass` is invalid.

**Solution**:

1. Verify that the VMDisk name exactly matches the one referenced in `spec.disks`:
   ```yaml title="vm.yaml"
   spec:
     disks:
       - data-volume  # Must match the VMDisk metadata.name
   ```

2. Check the VMDisk status:
   ```bash
   kubectl get vmdisk data-volume
   kubectl describe vmdisk data-volume
   ```

3. The available storageClasses on Hikube are: `local`, `replicated`, and `replicated-async`. For a VM (single instance), `replicated` is recommended.

---

### Serial console / VNC for debugging

**Cause**: the VM is not responding via SSH and you need direct access to diagnose the issue.

**Solution**:

1. For serial console access (text):
   ```bash
   virtctl console <vm-name>
   ```

2. For VNC access (graphical):
   ```bash
   virtctl vnc <vm-name>
   ```

3. From the console, you can check:
   - Boot logs
   - Network configuration (`ip addr`, `ip route`)
   - Service status (`systemctl status`)
   - System logs (`journalctl -xe`)

:::tip
`virtctl` is the KubeVirt CLI. Install it from the [KubeVirt releases](https://github.com/kubevirt/kubevirt/releases).
:::
