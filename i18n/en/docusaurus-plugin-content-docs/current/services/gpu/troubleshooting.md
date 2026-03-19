---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — GPU

### GPU not detected in the VM

**Cause**: the `gpus` field is not configured in the manifest, or the PCI passthrough did not properly attach the GPU to the VM.

**Solution**:

1. Verify that the `gpus` field is present in your manifest:
   ```yaml title="vm-gpu.yaml"
   spec:
     gpus:
       - name: "nvidia.com/AD102GL_L40S"
   ```

2. Inside the VM, check PCI detection:
   ```bash
   lspci | grep -i nvidia
   ```

3. Verify that the NVIDIA kernel module is loaded:
   ```bash
   lsmod | grep nvidia
   ```

4. If no results, the drivers are not installed. See the next section.

---

### Missing NVIDIA drivers

**Cause**: NVIDIA drivers are not installed in the VM, or the kernel headers do not match the running kernel version.

**Solution**:

1. Install prerequisites and drivers via cloud-init or manually:
   ```bash
   sudo apt-get update
   sudo apt-get install -y linux-headers-$(uname -r)
   sudo apt-get install -y nvidia-driver-550 nvidia-utils-550
   ```

2. Reboot the VM after installation:
   ```bash
   sudo reboot
   ```

3. Verify the installation:
   ```bash
   nvidia-smi
   ```

:::tip
To automate installation, use the `cloudInit` field in your VM manifest so that drivers are installed at first boot.
:::

---

### GPU pod in Pending state

**Cause**: no node with available GPU, the cluster GPU configuration is missing, or the GPU Operator is not active.

**Solution**:

1. Check pod events:
   ```bash
   kubectl describe pod <pod-name>
   ```
   Look for the `Insufficient nvidia.com/gpu` message.

2. Verify that GPU nodes exist and have allocatable GPUs:
   ```bash
   kubectl get nodes -o json | jq '.items[] | {name: .metadata.name, gpu: .status.allocatable["nvidia.com/gpu"]}'
   ```

3. Check the GPU nodeGroup configuration in the cluster manifest:
   ```yaml title="cluster.yaml"
   spec:
     nodeGroups:
       gpu-workers:
         minReplicas: 1
         maxReplicas: 4
         instanceType: "u1.2xlarge"
         gpus:
           - name: "nvidia.com/AD102GL_L40S"
   ```

4. Make sure the GPU Operator addon is enabled:
   ```yaml title="cluster.yaml"
   spec:
     addons:
       gpuOperator:
         enabled: true
   ```

---

### `nvidia-smi` fails in a pod

**Cause**: the GPU Operator is not enabled on the cluster, which prevents automatic driver installation and device plugin availability.

**Solution**:

1. Enable the GPU Operator addon on the cluster:
   ```yaml title="cluster.yaml"
   spec:
     addons:
       gpuOperator:
         enabled: true
   ```

2. Apply the change:
   ```bash
   kubectl apply -f cluster.yaml
   ```

3. Verify that GPU Operator pods are running:
   ```bash
   kubectl get pods -n gpu-operator
   ```

4. Once the GPU Operator is operational, recreate your GPU pod.

---

### GPU Operator not working

**Cause**: the addon is not enabled, the operator pods are in error state, or the nodes do not have physical GPU hardware.

**Solution**:

1. Verify that the addon is enabled in the cluster manifest:
   ```yaml title="cluster.yaml"
   spec:
     addons:
       gpuOperator:
         enabled: true
   ```

2. Check the GPU Operator pod status:
   ```bash
   kubectl get pods -n gpu-operator
   kubectl describe pod -n gpu-operator <pod-name>
   ```

3. Verify that nodes have GPU hardware:
   ```bash
   kubectl get nodes -o json | jq '.items[] | {name: .metadata.name, gpu: .status.capacity["nvidia.com/gpu"]}'
   ```

4. If pods are in `CrashLoopBackOff`, check the logs:
   ```bash
   kubectl logs -n gpu-operator <pod-name>
   ```
