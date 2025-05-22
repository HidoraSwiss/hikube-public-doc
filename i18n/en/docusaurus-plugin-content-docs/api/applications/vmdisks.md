---
title: VMDisks
---

A **Virtual Machine Disk (VM Disk)** is a virtual storage unit used by virtual machines. This disk can be based on a source image or defined with a specific size. The service allows flexible disk configuration to meet the needs of virtual machines.

---

## Configuration Example

Here is a YAML configuration example for a virtual disk using a source image downloaded from HTTP:

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: vm-disk-example
spec:
  source:
    http:
      url: "https://download.cirros-cloud.net/0.6.2/cirros-0.6.2-x86_64-disk.img"
  optical: false
  storage: 10Gi
  storageClass: "replicated"
```

Using the kubeconfig provided by Hikube and this example yaml, saved as a `manifest.yaml` file, you can easily test the application deployment using the following command:

```sh
kubectl apply -f manifest.yaml
```

---

## Configurable Parameters

### **General Parameters**

| **Name**      | **Description**                                                | **Default Value** |
|-----------------|--------------------------------------------------------------------|------------------------|
| `source`       | Location of the source image used to create the disk.              | `{}`                  |
| `optical`      | Indicates if the disk should be considered as an optical disk.     | `false`               |
| `storage`      | Disk size allocated for the virtual machine.                       | `5Gi`                 |
| `storageClass` | Storage class used for data.                                       | `"replicated"` or `"local"`          |

---

## Examples of Well-Known Source Images

Here are examples of commonly used source images for virtual disks:

- **Ubuntu**:
  `https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img`

- **Fedora**:
  `https://download.fedoraproject.org/pub/fedora/linux/releases/40/Cloud/x86_64/images/Fedora-Cloud-Base-Generic.x86_64-40-1.14.qcow2`

- **Cirros**:
  `https://download.cirros-cloud.net/0.6.2/cirros-0.6.2-x86_64-disk.img`

- **Alpine**:
  `https://dl-cdn.alpinelinux.org/alpine/v3.20/releases/cloud/nocloud_alpine-3.20.2-x86_64-bios-tiny-r0.qcow2`

- **Talos**:
  `https://github.com/siderolabs/talos/releases/download/v1.7.6/nocloud-amd64.raw.xz`
