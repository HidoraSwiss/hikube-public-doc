---
title: "How to configure cloud-init"
---

# How to configure cloud-init

cloud-init is the industry standard for automatic VM initialization on first boot. Hikube natively supports cloud-init via the `cloudInit` parameter of the VMInstance. This guide shows how to use it to automate the configuration of your VMs.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- Basic knowledge of the **YAML** format
- A VMInstance manifest ready to configure

## Steps

### 1. Understanding cloud-init

cloud-init runs automatically on the VM's first boot. It allows you to:

- Create users and configure SSH access
- Install packages
- Run commands at startup
- Write configuration files
- Configure the network, hostname, etc.

The cloud-init configuration is passed as inline YAML in the `spec.cloudInit` field of the VMInstance. It must start with `#cloud-config`.

### 2. Create a manifest with cloud-init

Here is a complete example of a VMInstance with a cloud-init configuration that creates a user, installs packages and runs commands:

```yaml title="vm-cloud-init.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-configured
spec:
  runStrategy: Always
  instanceType: u1.xlarge
  instanceProfile: ubuntu
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 80
  disks:
    - vm-system-disk
  sshKeys:
    - ssh-ed25519 AAAA... user@host
  cloudInit: |
    #cloud-config
    users:
      - name: admin
        sudo: ALL=(ALL) NOPASSWD:ALL
        shell: /bin/bash
        ssh_authorized_keys:
          - ssh-ed25519 AAAA... user@host

    packages:
      - htop
      - curl
      - docker.io
      - nginx

    runcmd:
      - systemctl enable --now docker
      - systemctl enable --now nginx
```

### 3. Practical examples

#### Add a sudo user

```yaml title="cloud-init-user.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-with-user
spec:
  runStrategy: Always
  instanceType: s1.medium
  instanceProfile: ubuntu
  disks:
    - vm-system-disk
  cloudInit: |
    #cloud-config
    users:
      - name: deployer
        sudo: ALL=(ALL) NOPASSWD:ALL
        groups: docker, sudo
        shell: /bin/bash
        ssh_authorized_keys:
          - ssh-ed25519 AAAA... deployer@ci
```

#### Install packages at startup

```yaml title="cloud-init-packages.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-with-packages
spec:
  runStrategy: Always
  instanceType: u1.xlarge
  instanceProfile: ubuntu
  disks:
    - vm-system-disk
  cloudInit: |
    #cloud-config
    package_update: true
    package_upgrade: true
    packages:
      - htop
      - docker.io
      - curl
      - wget
      - git
      - build-essential
```

#### Run commands at startup

```yaml title="cloud-init-runcmd.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-with-commands
spec:
  runStrategy: Always
  instanceType: u1.xlarge
  instanceProfile: ubuntu
  disks:
    - vm-system-disk
  cloudInit: |
    #cloud-config
    runcmd:
      - mkdir -p /opt/app
      - echo "VM initialisée le $(date)" > /opt/app/init.log
      - curl -fsSL https://get.docker.com | sh
      - usermod -aG docker ubuntu
```

#### Configure a web server

```yaml title="cloud-init-webserver.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-webserver
spec:
  runStrategy: Always
  instanceType: u1.xlarge
  instanceProfile: ubuntu
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 80
    - 443
  disks:
    - vm-system-disk
  sshKeys:
    - ssh-ed25519 AAAA... user@host
  cloudInit: |
    #cloud-config
    packages:
      - nginx
      - certbot
      - python3-certbot-nginx

    write_files:
      - path: /var/www/html/index.html
        content: |
          <!DOCTYPE html>
          <html>
          <head><title>Hikube VM</title></head>
          <body><h1>VM opérationnelle</h1></body>
          </html>

    runcmd:
      - systemctl enable --now nginx
```

### 4. Apply and verify

Deploy the VM:

```bash
kubectl apply -f vm-cloud-init.yaml
```

Wait for the VM to be ready:

```bash
kubectl get vminstance vm-configured -w
```

## Verification

Connect to the VM and verify that cloud-init ran correctly:

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@vm-configured
```

Check the cloud-init status:

```bash
cloud-init status
```

**Expected output:**

```
status: done
```

Verify the installed packages:

```bash
dpkg -l | grep -E "htop|docker|nginx"
```

Check the cloud-init logs in case of issues:

```bash
sudo cat /var/log/cloud-init-output.log
```

:::warning One-time execution
cloud-init runs **only on the first boot** of the VM. Subsequent reboots do not re-run the configuration. To force a re-execution, use `sudo cloud-init clean` then reboot.
:::

:::tip Cloud-init seed
The `cloudInitSeed` parameter allows passing additional seed data. Change this value to force cloud-init to re-run on the next boot.
:::

## Going further

- [API Reference](../api-reference.md) -- Cloud-init section
- [Quick start](../quick-start.md)
