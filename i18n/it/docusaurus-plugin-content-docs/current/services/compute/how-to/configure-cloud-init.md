---
title: "Come configurare cloud-init"
---

# Come configurare cloud-init

cloud-init è lo standard dell'industria per l'inizializzazione automatica delle VM al primo avvio. Hikube supporta cloud-init nativamente tramite il parametro `cloudInit` della VMInstance. Questa guida mostra come utilizzarlo per automatizzare la configurazione delle vostre VM.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Conoscenza di base del formato **YAML**
- Un manifest VMInstance pronto da configurare

## Passi

### 1. Comprendere cloud-init

cloud-init viene eseguito automaticamente al primo avvio della VM. Permette di:

- Creare utenti e configurare gli accessi SSH
- Installare pacchetti
- Eseguire comandi all'avvio
- Scrivere file di configurazione
- Configurare la rete, l'hostname, ecc.

La configurazione cloud-init viene passata in YAML inline nel campo `spec.cloudInit` della VMInstance. Deve iniziare con `#cloud-config`.

### 2. Creare un manifest con cloud-init

Ecco un esempio completo di VMInstance con una configurazione cloud-init che crea un utente, installa pacchetti ed esegue comandi:

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

### 3. Esempi pratici

#### Aggiungere un utente sudo

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

#### Installare pacchetti all'avvio

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

#### Eseguire comandi all'avvio

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
      - echo "VM inizializzata il $(date)" > /opt/app/init.log
      - curl -fsSL https://get.docker.com | sh
      - usermod -aG docker ubuntu
```

#### Configurare un server web

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
          <body><h1>VM operativa</h1></body>
          </html>

    runcmd:
      - systemctl enable --now nginx
```

### 4. Applicare e verificare

Distribuite la VM:

```bash
kubectl apply -f vm-cloud-init.yaml
```

Attendete che la VM sia pronta:

```bash
kubectl get vminstance vm-configured -w
```

## Verifica

Connettetevi alla VM e verificate che cloud-init si sia eseguito correttamente:

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@vm-configured
```

Verificate lo stato di cloud-init:

```bash
cloud-init status
```

**Risultato atteso:**

```
status: done
```

Verificate i pacchetti installati:

```bash
dpkg -l | grep -E "htop|docker|nginx"
```

Consultate i log di cloud-init in caso di problemi:

```bash
sudo cat /var/log/cloud-init-output.log
```

:::warning Esecuzione unica
cloud-init viene eseguito **unicamente al primo avvio** della VM. I riavvii successivi non eseguono nuovamente la configurazione. Per forzare una riesecuzione, utilizzate `sudo cloud-init clean` poi riavviate.
:::

:::tip Seed cloud-init
Il parametro `cloudInitSeed` permette di passare dati seed supplementari. Modificate questo valore per forzare cloud-init a rieseguirsi al prossimo avvio.
:::

## Per approfondire

- [Riferimento API](../api-reference.md) -- sezione Cloud-init
- [Avvio rapido](../quick-start.md)
