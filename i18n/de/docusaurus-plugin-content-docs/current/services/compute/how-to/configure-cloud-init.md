---
title: "cloud-init konfigurieren"
---

# cloud-init konfigurieren

cloud-init ist der Standard für die automatische Initialisierung von VMs: Anlegen von Benutzern, Installieren von Paketen, Schreiben von Dateien, Ausführen von Befehlen. In der Hikube-Konsole wird das cloud-init-Skript im Feld **Cloud-Init script (User Data)** eingegeben.

## Voraussetzungen

- Ein Hikube-Konto und ein Projekt
- Ein **Linux**-Image: Das cloud-init-Feld wird für Windows-Images nicht angeboten
- Grundkenntnisse des **YAML**-Formats

## Schritte

### 1. Das Skript bei der Erstellung eingeben

1. Öffnen Sie **Infrastructure** > **VM Instances** > **Create an Instance** und füllen Sie die Schritte **General**, **Configuration** und **Storage** aus.
2. Aktivieren Sie im Schritt **Network**, Abschnitt **Initialization & Access**, den Schalter **Cloud-Init script (User Data)**.
3. Geben Sie Ihre Konfiguration in das Textfeld ein. Sie muss mit `#cloud-config` beginnen.
4. Schließen Sie den Assistenten ab und klicken Sie auf **Create instance**.

Die unter **Authorized SSH keys** eingegebenen Schlüssel werden von der Plattform eingefügt: Sie müssen sie für den Standardbenutzer nicht im Skript wiederholen.

### 2. Beispiele

#### Zusätzlicher Benutzer mit sudo

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

Der Eintrag `default` behält den Standardbenutzer des Images bei (zum Beispiel `ubuntu`).

#### Beim Start installierte Pakete

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

#### Befehle beim Start

```yaml title="user-data.yaml"
#cloud-config
runcmd:
  - mkdir -p /opt/app
  - echo "VM initialisiert am $(date)" > /opt/app/init.log
  - systemctl enable --now docker
```

#### Webserver

Erlauben Sie im Schritt **Network** auch die Ports **HTTP (80)** und **HTTPS (443)**.

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
      <body><h1>VM betriebsbereit</h1></body>
      </html>
runcmd:
  - systemctl enable --now nginx
```

### 3. Das Skript einer bestehenden VM ändern

1. Öffnen Sie die Detailseite der VM und klicken Sie auf **Edit**.
2. Ändern Sie unter **Advanced Configuration** das Feld **Cloud-Init script (User Data)**.
3. Klicken Sie auf **Save**.

Das neue Skript wird ohne Neustart der VM gespeichert, aber nicht automatisch erneut ausgeführt: Fahren Sie mit dem nächsten Schritt fort.

### 4. Das Skript erneut ausführen

1. Klicken Sie bei einer VM im Status **Running** auf **Reload UserData**, im Abschnitt **Actions** der Detailseite oder im Menü **Actions** der Liste. Die Konsole zeigt **The UserData reload has been initiated.** an.
2. Das Neuladen startet die VM nicht neu: Das Skript wird beim nächsten Start erneut ausgeführt. Klicken Sie auf **Restart**, um es sofort anzuwenden.

Beim Neustart behandelt cloud-init die VM als neue Instanz: Es führt das gesamte Skript erneut aus (`runcmd`, `write_files`, `packages`…) und generiert die SSH-Hostschlüssel neu. Ihr SSH-Client meldet dann eine Änderung des Hostschlüssels; entfernen Sie den alten Eintrag mit `ssh-keygen -R <public-ip>`.

Wenn Sie die **SSH Keys** einer VM ändern, bietet die Konsole dieses Neuladen direkt im Dialog **SSH keys changed** an: **Reload user-data** oder **Don't reload user-data**.

:::warning Auswirkungen eines Neuladens
Ein Neuladen mit anschließendem Neustart führt dazu, dass die VM das gesamte cloud-init-Skript erneut ausführt. Schreiben Sie idempotente Skripte (ohne unerwünschte Nebenwirkungen bei mehrfacher Ausführung), insbesondere für `runcmd` und `write_files`.
:::

## Überprüfung

Verbinden Sie sich mit der VM und prüfen Sie den Zustand von cloud-init:

```bash
cloud-init status
```

**Erwartetes Ergebnis:**

```
status: done
```

Sehen Sie bei Problemen im Protokoll nach:

```bash
sudo cat /var/log/cloud-init-output.log
```

Prüfen Sie die Syntax eines Skripts vor dem Senden (auf einem Rechner, auf dem cloud-init installiert ist):

```bash
cloud-init schema --config-file user-data.yaml
```

Das gespeicherte Skript ist jederzeit auf der Detailseite sichtbar, Abschnitt **Advanced Configuration** > **Cloud-Init User Data**.

## Weiterführende Informationen

- [CUDA über cloud-init installieren](./install-cuda-drivers.md)
- [VM-Schnellstart](../quick-start.md)
- [cloud-init-Dokumentation](https://cloudinit.readthedocs.io/)
