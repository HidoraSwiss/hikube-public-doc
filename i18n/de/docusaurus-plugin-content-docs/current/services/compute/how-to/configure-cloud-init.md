---
title: "Cloud-init konfigurieren"
---

# Cloud-init konfigurieren

cloud-init ist der Industriestandard für die automatische Initialisierung von VMs beim ersten Start. Hikube unterstützt cloud-init nativ über den Parameter `cloudInit` der VMInstance. Diese Anleitung zeigt, wie Sie es verwenden, um die Konfiguration Ihrer VMs zu automatisieren.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrem Hikube-Kubeconfig
- Grundkenntnisse des **YAML**-Formats
- Ein VMInstance-Manifest, das konfiguriert werden soll

## Schritte

### 1. Cloud-init verstehen

cloud-init wird automatisch beim ersten Start der VM ausgeführt. Es ermöglicht:

- Benutzer erstellen und SSH-Zugriffe konfigurieren
- Pakete installieren
- Befehle beim Start ausführen
- Konfigurationsdateien schreiben
- Netzwerk, Hostname usw. konfigurieren

Die cloud-init-Konfiguration wird als YAML-Inline im Feld `spec.cloudInit` der VMInstance übergeben. Sie muss mit `#cloud-config` beginnen.

### 2. Manifest mit cloud-init erstellen

Hier ein vollständiges Beispiel einer VMInstance mit einer cloud-init-Konfiguration, die einen Benutzer erstellt, Pakete installiert und Befehle ausführt:

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

### 3. Praktische Beispiele

#### Sudo-Benutzer hinzufügen

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

#### Pakete beim Start installieren

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

#### Befehle beim Start ausführen

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
      - echo "VM initialisiert am $(date)" > /opt/app/init.log
      - curl -fsSL https://get.docker.com | sh
      - usermod -aG docker ubuntu
```

#### Webserver konfigurieren

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
          <body><h1>VM betriebsbereit</h1></body>
          </html>

    runcmd:
      - systemctl enable --now nginx
```

### 4. Anwenden und überprüfen

Stellen Sie die VM bereit:

```bash
kubectl apply -f vm-cloud-init.yaml
```

Warten Sie, bis die VM bereit ist:

```bash
kubectl get vminstance vm-configured -w
```

## Überprüfung

Verbinden Sie sich mit der VM und überprüfen Sie, dass cloud-init korrekt ausgeführt wurde:

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@vm-configured
```

Überprüfen Sie den cloud-init-Status:

```bash
cloud-init status
```

**Erwartetes Ergebnis:**

```
status: done
```

Überprüfen Sie die installierten Pakete:

```bash
dpkg -l | grep -E "htop|docker|nginx"
```

Konsultieren Sie die cloud-init-Logs bei Problemen:

```bash
sudo cat /var/log/cloud-init-output.log
```

:::warning Einmalige Ausführung
cloud-init wird **nur beim ersten Start** der VM ausgeführt. Folgende Neustarts führen die Konfiguration nicht erneut aus. Um eine Neuausführung zu erzwingen, verwenden Sie `sudo cloud-init clean` und starten Sie dann neu.
:::

:::tip Cloud-init-Seed
Der Parameter `cloudInitSeed` ermöglicht das Übergeben zusätzlicher Seed-Daten. Ändern Sie diesen Wert, um cloud-init beim nächsten Start zur Neuausführung zu zwingen.
:::

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Abschnitt Cloud-init
- [Schnellstart](../quick-start.md)
