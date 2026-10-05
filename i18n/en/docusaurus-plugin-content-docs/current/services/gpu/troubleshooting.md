---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — GPU

### The GPU section does not appear in the wizard

**Cause**: the **Hardware Acceleration (GPU)** section (VM) or **GPU** section (Kubernetes node group) is only displayed if the platform offers at least one model.

**Solution**: reload the page. If the section is still missing, contact [support](mailto:support@hidora.io).

---

### All models are Unavailable

**Cause**: no free unit for these models at creation time.

**Solution**: try again later or contact [sales@hidora.io](mailto:sales@hidora.io) for a capacity requirement.

---

### "The following GPUs are not available: …" on creation or save

**Cause**: the requested GPUs are not free together on the same physical server, or were assigned between opening the wizard and creation. A VM, like a Kubernetes node, runs on a single server.

**Solution**:

1. Reduce the number of GPUs per VM or per node.
2. Avoid combining several models on the same VM.
3. Choose another available model.

---

### The VM with a GPU does not restart

**Cause**: stopping the VM released the GPU, which was assigned to another workload. The console shows **These GPUs are no longer available, they may have been claimed by another workload: …**.

**Solution**:

1. In the **Select an alternative GPU** dialog, choose a model in **Available GPU**.
2. Click **Update and Start**: the VM's configuration is updated, then the VM starts.
3. If the dialog shows **No GPUs are currently available.**, try again later.

---

### GPU not detected in the VM

**Cause**: the GPU is not attached to the VM, or the VM has not restarted after the GPU was added.

**Solution**:

1. On the detail page, check that the GPU appears under **GPUs** (**Resources & Characteristics** section). Otherwise, add it via **Edit** > **Resources (CPU / RAM)**, then **Save**.
2. After adding it, wait for the VM to return to the **Running** status.
3. In the VM:
   ```bash
   lspci | grep -i nvidia
   ```
4. If the GPU appears in `lspci` but not in `nvidia-smi`, the drivers are missing: see the next section.

---

### NVIDIA drivers missing in the VM

**Cause**: Hikube images do not include the NVIDIA drivers, or the kernel headers do not match the kernel version.

**Solution**:

1. Install the drivers by following [Install CUDA and GPU drivers](../compute/how-to/install-cuda-drivers.md). On Ubuntu, check that the kernel headers are present:
   ```bash
   sudo apt-get install -y linux-headers-$(uname -r)
   ```
2. Restart the VM (`sudo reboot` or **Restart** in the console).
3. Check:
   ```bash
   nvidia-smi
   ```

---

### GPU pod in Pending state

**Cause**: no node in the cluster has a free GPU, the GPU group has 0 nodes, or the GPU Operator is not ready.

**Solution**:

1. Check the pod's events:
   ```bash
   kubectl describe pod <pod>
   ```
   The message `Insufficient nvidia.com/gpu` means that no node has a free GPU.
2. Check the allocatable GPUs:
   ```bash
   kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
   ```
3. In the console, open the cluster and check the GPU node group (**Node Pools**): number of active nodes, GPU model. Increase **Maximum nodes** via **Edit** if all GPUs are in use.
4. Check that the **GPU Operator** addon is active (it is enabled automatically as soon as a group has GPUs).

---

### `nvidia-smi` fails in a pod

**Cause**: the GPU Operator components are not yet ready on the node, or the pod does not request a GPU.

**Solution**:

1. Check that the pod declares `nvidia.com/gpu` in `resources.limits`.
2. Check the state of the GPU Operator pods:
   ```bash
   kubectl get pods -A | grep -i gpu-operator
   ```
3. If pods are in `CrashLoopBackOff`, check their logs:
   ```bash
   kubectl logs -n <namespace> <pod>
   ```
4. Once the operator is ready, recreate your pod. If the problem persists, contact [support](mailto:support@hidora.io).

---

### Cannot add a GPU to an existing node group

**Cause**: a group created without GPUs cannot receive any (**GPUs cannot be added to an existing node group: add a new node group for GPUs**). Conversely, a GPU group must keep at least one GPU.

**Solution**: in **Edit** > **Node groups**, click **Add node group** and configure the GPU on this new group.
