---
title: "How to create a Windows VM"
---

# How to create a Windows VM

The Hikube console offers ready-to-use **Windows Server** images. This guide explains how to create a Windows Server VM, retrieve the generated administrator password and connect over RDP.

## Prerequisites

- A Hikube account and a project with at least 4 vCPU, 16 GB of memory and 50 GB of storage available
- An RDP client (Remote Desktop Connection on Windows, Windows App on macOS, `xfreerdp` or Remmina on Linux)
- A password manager to store the administrator password

## Steps

### 1. Start the wizard

Open **Infrastructure** > **VM Instances** and click **Create an Instance**. At the **General** step, enter the **Instance name** (for example `win-srv01`), then **Next**.

### 2. Choose the instance type

At the **Configuration** step, choose at least **Universal (U)** > **XLARGE** (4 vCPU, 16 GB). Click **Next**.

:::note Windows license
The Windows license is billed according to the number of vCPUs. It is included in the estimated cost shown at the top of the wizard.
:::

### 3. Choose the image and the system disk

At the **Storage** step:

1. Under **Operating System**, select the **windows-server** card and version **2022** or **2025**.
2. Set **Size (GB)** to at least `50`: this is the minimum for Windows (message **Min. 50 GB required** below the field).
3. Choose the **Replication Type** and, if needed, enable **Disk Encryption**.
4. Click **Next**.

### 4. Open the RDP port

At the **Network** step:

1. Leave **Public IPv4 Address** enabled and **Enable Firewall** checked.
2. In **Custom port...**, enter `3389` and click the add button.
3. Uncheck **SSH (22)** if you do not use OpenSSH on the server.

The **Cloud-Init script (User Data)** field is not offered for Windows.

### 5. Deploy and copy the password

At the **Summary** step, click **Create instance**. The **Windows Instance Credentials** dialog opens and shows:

- **Default Username**;
- **Administrator Password**.

Copy both values with the copy buttons and save them in your password manager, then click **I copied the password and continue**.

:::warning Password shown only once
The password is generated at creation and **will not be shown again**. If you lose it, it cannot be retrieved from the console.
:::

### 6. Wait for startup

In the **VM Instances** list, wait for the **Running** status. The first Windows boot (initialization and configuration) takes several minutes longer than a Linux VM: wait before the first RDP connection.

### 7. Connect over RDP

Note the public IP address on the detail page: it appears in the **SSH Connection** block of the **Network & Security** section. Then connect:

```bash
# Linux
xfreerdp /v:<public-ip> /u:<username>
```

On Windows or macOS, add a PC with the address `<public-ip>` in your Remote Desktop client and use the credentials copied in step 5.

## Verification

Test that the RDP port is open from your workstation:

```bash
nc -zv -w 5 <public-ip> 3389
```

**Expected result:** `Connection to <public-ip> 3389 port [tcp/ms-wbt-server] succeeded!`

Once connected, change the password and apply Windows updates.

:::note Installing from your own ISO
Installing Windows from a custom ISO requires graphical console access (VNC) during installation. This option is not offered in the console; contact [support](mailto:support@hidora.io).
:::

## Further reading

- [Configure the network and firewall](./configure-network.md)
- [Attach an extra disk](./attach-extra-disk.md)
