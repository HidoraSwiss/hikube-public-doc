---
sidebar_position: 6
title: FAQ
---

# FAQ — Virtuelle Maschinen

### Was ist der Unterschied zwischen aktivierter und deaktivierter Firewall?

| | **Enable Firewall** angehakt | Firewall nicht angehakt |
|---|---|---|
| **Offene Ports auf der öffentlichen IP** | Nur die **Allowed Ports** | Alle |
| **Sicherheit** | Reduzierte Angriffsfläche | Firewall im Betriebssystem zu konfigurieren (ufw, firewalld, nftables) |
| **Anwendungsfall** | Produktion, gezielte Dienste | VPN, Gateway, Protokolle mit dynamischen Ports |

Die Ports lassen sich jederzeit über die Detailseite > **Edit** > **Network & Security** ändern. Siehe [Netzwerk konfigurieren](./how-to/configure-network.md).

---

### Welche Images sind verfügbar?

AlmaLinux, CentOS Stream, CloudLinux, Debian, openSUSE, Oracle Linux, Rocky Linux, Ubuntu und Windows Server. Die Einzelheiten zu den Versionen finden Sie in der [Übersicht](./overview.md#betriebssysteme); maßgeblich ist die im Schritt **Storage** des Assistenten angezeigte Liste.

---

### Kann ich mein eigenes Image verwenden?

Ja, in zwei Schritten: Erstellen Sie zuerst im Menü **Disks** eine Disk aus der URL Ihres Images (ISO oder QCOW2, über HTTPS). Wählen Sie dann im VM-Erstellungsassistenten **Existing** für die **System Disk (Boot)** und wählen Sie diese Disk aus. Die Karte **Custom Image** ist im VM-Assistenten ausgegraut (**Reserved**): Sie ist nur bei der Erstellung einer Disk verwendbar. Siehe [System-Disk aus einem Image erstellen](../storage/disks/how-to/create-from-image.md).

---

### Wie wähle ich meinen Instanztyp?

| Serie | Bezeichnung | Verhältnis | Anwendungsbeispiel |
|-------|---------|-------|-----------------|
| `s1` | **Standard (S)** | 1:2 | Entwicklung, Tests |
| `u1` | **Universal (U)** | 1:4 | Webserver, Anwendungen |
| `m1` | **Memory (M)** | 1:8 | Datenbanken, Caches |

Zum Beispiel bietet `u1.xlarge` 4 vCPU und 16 GB RAM. Der Instanztyp kann später über **Edit** geändert werden; die VM wird neu gestartet.

---

### Wie füge ich eine zusätzliche Disk hinzu?

Bei der Erstellung klicken Sie im Schritt **Storage** auf **Add a disk**. Bei einer bestehenden VM öffnen Sie die Detailseite, klicken auf **Edit**, dann im Abschnitt **Storage** auf **Add a disk** und anschließend auf **Save**. Die VM wird neu gestartet. Die vollständige Anleitung, einschließlich der Formatierung im Betriebssystem, finden Sie [hier](./how-to/attach-extra-disk.md).

---

### Wie verbinde ich mich per SSH?

1. Fügen Sie Ihren öffentlichen Schlüssel unter **Authorized SSH keys** hinzu (Schritt **Network** des Assistenten oder **Edit** > **Advanced Configuration** > **SSH Keys**).
2. Lassen Sie **Public IPv4 Address** aktiviert und den Port **SSH (22)** erlaubt.
3. Kopieren Sie den Befehl aus dem Block **SSH Connection** auf der Detailseite und ergänzen Sie Ihren privaten Schlüssel:
   ```bash
   ssh -i ~/.ssh/ma-cle ubuntu@<public-ip>
   ```

Standardbenutzer je nach Image:

| Image | Benutzer |
|-------|-------------|
| Ubuntu | `ubuntu` |
| Debian | `debian` |
| Rocky Linux | `rocky` |
| AlmaLinux | `almalinux` |
| CentOS Stream, CloudLinux | `cloud-user` |
| Oracle Linux | `opc` |
| openSUSE | `opensuse` |

Der tatsächliche Benutzer wird immer auf der Detailseite unter **System Image** angezeigt.

---

### Wie passe ich die VM beim Start an?

Aktivieren Sie im Schritt **Network** des Assistenten **Cloud-Init script (User Data)** und geben Sie Ihre Konfiguration ein:

```yaml title="user-data.yaml"
#cloud-config
packages:
  - nginx
  - htop
runcmd:
  - systemctl enable --now nginx
```

Siehe [cloud-init konfigurieren](./how-to/configure-cloud-init.md).

---

### Was passiert mit den Disks, wenn ich eine VM lösche?

Sie werden getrennt, nicht gelöscht. Sie bleiben im Menü **Disks**, können an eine andere VM angebunden werden (Option **Existing**) und zählen bis zu ihrer Löschung weiter zum Speicher-Quota des Projekts.

---

### Kann ich auf die serielle Konsole oder VNC der VM zugreifen?

Diese Option wird in der Konsole nicht angeboten; wenden Sie sich an den [Support](mailto:support@hidora.io). Der Zugriff erfolgt per SSH (Linux) oder RDP (Windows).

---

### Warum ist die Schaltfläche Edit in der Liste ausgegraut?

Im Menü **Actions** der Liste ist **Edit** nur verfügbar, wenn die VM **Running** ist. Um eine gestoppte VM zu ändern, öffnen Sie ihre Detailseite und klicken Sie auf **Edit**.
