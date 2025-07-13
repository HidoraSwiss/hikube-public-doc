---
title: Virtual Machine Instances
---

A **Virtual Machine (VM)** simulates computer hardware, allowing various operating systems and applications to run in an isolated environment.

---

## Configuration Example

Here is a YAML configuration example for a virtual machine with typical parameters:

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-example
spec:
  external: true
  externalPorts:
    - port: 22
  running: true
  instanceType: "u1.medium"
  instanceProfile: "ubuntu"
  disks:
    - name: "root-disk"
      size: "20Gi"
      storageClass: "replicated"
  resources:
    cpu: "2"
    memory: "4Gi"
  sshKeys:
    - "ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAr..."
  cloudInit: |
    #cloud-config
    users:
      - name: ubuntu
        ssh_authorized_keys:
          - "ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAr..."
```

Using the kubeconfig provided by Hikube and this example yaml, saved as a `manifest.yaml` file, you can easily test the application deployment using the following command:

```sh
kubectl apply -f manifest.yaml
```

---

## Accessing a Virtual Machine

You can access a virtual machine using the **virtctl** tool:

- **Serial Console**:
  `virtctl console <vm>`

- **VNC Access**:
  `virtctl vnc <vm>`

- **SSH Access**:
  `virtctl ssh <user>@<vm>`

---

## Configurable Parameters

### **General Parameters**

| **Name**           | **Description**                                                             | **Default Value** |
|-----------------------|-----------------------------------------------------------------------------------|------------------------|
| `external`           | Allows external access from outside the cluster.                             | `false`               |
| `externalPorts`      | Specifies ports to expose outside the cluster.                               | `[]`                  |
| `running`            | Indicates if the VM should be running.                                       | `true`                |
| `instanceType`       | Virtual machine instance type.                                               | `u1.medium`           |
| `instanceProfile`    | Profile preferences for the virtual machine (guest OS).                      | `ubuntu`              |
| `disks`              | List of disks to attach.                                                     | `[]`                  |
| `resources.cpu`      | Number of CPU cores allocated to the virtual machine.                        | `""`                  |
| `resources.memory`   | Amount of memory allocated to the virtual machine.                           | `""`                  |
| `sshKeys`            | List of SSH public keys for authentication (single key or list).             | `[]`                  |
| `cloudInit`          | User data configuration via cloud-init. See documentation for more details.  | `#cloud-config`       |
