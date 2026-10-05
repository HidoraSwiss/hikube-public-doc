---
title: "How to configure cloud-init"
---

# How to configure cloud-init

cloud-init is the standard for automatic VM initialization: creating users, installing packages, writing files, running commands. In the Hikube console, the cloud-init script is entered in the **Cloud-Init script (User Data)** field.

## Prerequisites

- A Hikube account and a project
- A **Linux** image: the cloud-init field is not offered for Windows images
- Basic knowledge of the **YAML** format

## Steps

### 1. Enter the script at creation

1. Open **Infrastructure** > **VM Instances** > **Create an Instance** and fill in the **General**, **Configuration** and **Storage** steps.
2. At the **Network** step, **Initialization & Access** section, turn on the **Cloud-Init script (User Data)** switch.
3. Enter your configuration in the text area. It must start with `#cloud-config`.
4. Finish the wizard and click **Create instance**.

The keys entered in **Authorized SSH keys** are injected by the platform: there is no need to repeat them in the script for the default user.

### 2. Examples

#### Additional user with sudo

```yaml title="user-data.yaml"
#cloud-config
users:
  - default
  - name: deployer
    sudo: ALL=(ALL) NOPASSWD:ALL
    groups: sudo
    shell: /bin/bash
    ssh_authorized_keys:
      - ssh-ed25519 AAAA... deployer@ci
```

The `default` entry keeps the image's default user (for example `ubuntu`).

#### Packages installed at boot

```yaml title="user-data.yaml"
#cloud-config
package_update: true
package_upgrade: true
packages:
  - htop
  - curl
  - git
  - docker.io
```

#### Commands at boot

```yaml title="user-data.yaml"
#cloud-config
runcmd:
  - mkdir -p /opt/app
  - echo "VM initialized on $(date)" > /opt/app/init.log
  - systemctl enable --now docker
```

#### Web server

Also allow the **HTTP (80)** and **HTTPS (443)** ports at the **Network** step.

```yaml title="user-data.yaml"
#cloud-config
packages:
  - nginx
write_files:
  - path: /var/www/html/index.html
    content: |
      <!DOCTYPE html>
      <html>
      <head><title>Hikube VM</title></head>
      <body><h1>VM up and running</h1></body>
      </html>
runcmd:
  - systemctl enable --now nginx
```

### 3. Change the script of an existing VM

1. Open the VM detail page and click **Edit**.
2. In **Advanced Configuration**, edit **Cloud-Init script (User Data)**.
3. Click **Save**.

The new script is saved, without restarting the VM, but it is not replayed automatically: go to the next step.

### 4. Replay the script

1. On a VM with **Running** status, click **Reload UserData**, from the **Actions** section of the detail page or from the **Actions** menu of the list. The console shows **The UserData reload has been initiated.**
2. The reload does not restart the VM: the script is replayed at the next boot. Click **Restart** to apply it right away.

At restart, cloud-init treats the VM as a new instance: it runs the whole script again (`runcmd`, `write_files`, `packages`…) and regenerates the SSH host keys. Your SSH client then reports a host key change; remove the old entry with `ssh-keygen -R <public-ip>`.

When you change the **SSH Keys** of a VM, the console offers this reload directly in the **SSH keys changed** dialog: **Reload user-data** or **Don't reload user-data**.

:::warning Effects of a reload
A reload followed by a restart makes the VM run the whole cloud-init script again. Write idempotent scripts (with no unwanted effect if run several times), especially for `runcmd` and `write_files`.
:::

## Verification

Connect to the VM and check the cloud-init status:

```bash
cloud-init status
```

**Expected result:**

```
status: done
```

Check the log if there is a problem:

```bash
sudo cat /var/log/cloud-init-output.log
```

Validate the syntax of a script before submitting it (on a machine where cloud-init is installed):

```bash
cloud-init schema --config-file user-data.yaml
```

The saved script is visible at any time on the detail page, **Advanced Configuration** > **Cloud-Init User Data** section.

## Further reading

- [Install CUDA via cloud-init](./install-cuda-drivers.md)
- [VM quick start](../quick-start.md)
- [cloud-init documentation](https://cloudinit.readthedocs.io/)
