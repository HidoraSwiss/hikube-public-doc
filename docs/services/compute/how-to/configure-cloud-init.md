---
title: "Comment configurer cloud-init"
---

# Comment configurer cloud-init

cloud-init est le standard de l'industrie pour l'initialisation automatique des VMs au premier démarrage. Hikube supporte cloud-init nativement via le paramètre `cloudInit` de la VMInstance. Ce guide montre comment l'utiliser pour automatiser la configuration de vos VMs.

## Prérequis

- **kubectl** configuré avec votre kubeconfig Hikube
- Connaissance de base du format **YAML**
- Un manifeste VMInstance prêt à configurer

## Étapes

### 1. Comprendre cloud-init

cloud-init s'exécute automatiquement au premier démarrage de la VM. Il permet de :

- Créer des utilisateurs et configurer les accès SSH
- Installer des paquets
- Exécuter des commandes au démarrage
- Écrire des fichiers de configuration
- Configurer le réseau, le hostname, etc.

La configuration cloud-init est passée en YAML inline dans le champ `spec.cloudInit` de la VMInstance. Elle doit commencer par `#cloud-config`.

### 2. Créer un manifeste avec cloud-init

Voici un exemple complet de VMInstance avec une configuration cloud-init qui crée un utilisateur, installe des paquets et exécute des commandes :

```yaml title="vm-cloud-init.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-configured
spec:
  running: true
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

### 3. Exemples pratiques

#### Ajouter un utilisateur sudo

```yaml title="cloud-init-user.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-with-user
spec:
  running: true
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

#### Installer des paquets au démarrage

```yaml title="cloud-init-packages.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-with-packages
spec:
  running: true
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

#### Exécuter des commandes au démarrage

```yaml title="cloud-init-runcmd.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-with-commands
spec:
  running: true
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

#### Configurer un serveur web

```yaml title="cloud-init-webserver.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-webserver
spec:
  running: true
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

### 4. Appliquer et vérifier

Déployez la VM :

```bash
kubectl apply -f vm-cloud-init.yaml
```

Attendez que la VM soit prête :

```bash
kubectl get vminstance vm-configured -w
```

## Vérification

Connectez-vous à la VM et vérifiez que cloud-init s'est exécuté correctement :

```bash
virtctl ssh ubuntu@vm-configured
```

Vérifiez le statut de cloud-init :

```bash
cloud-init status
```

**Résultat attendu :**

```
status: done
```

Vérifiez les paquets installés :

```bash
dpkg -l | grep -E "htop|docker|nginx"
```

Consultez les logs cloud-init en cas de problème :

```bash
sudo cat /var/log/cloud-init-output.log
```

:::warning Exécution unique
cloud-init s'exécute **uniquement au premier démarrage** de la VM. Les redémarrages suivants n'exécutent pas de nouveau la configuration. Pour forcer une ré-exécution, utilisez `sudo cloud-init clean` puis redémarrez.
:::

:::tip Seed cloud-init
Le paramètre `cloudInitSeed` permet de passer des données seed supplémentaires. Modifiez cette valeur pour forcer cloud-init à se ré-exécuter lors du prochain démarrage.
:::

## Pour aller plus loin

- [Référence API](../api-reference.md) -- section Cloud-init
- [Démarrage rapide](../quick-start.md)
