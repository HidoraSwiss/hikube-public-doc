---
sidebar_position: 6
title: FAQ
---

# FAQ — Machines virtuelles

### Quelle est la différence entre PortList et WholeIP ?

| Caractéristique | `PortList` | `WholeIP` |
|----------------|-----------|-----------|
| **Fonctionnement** | Seuls les ports listés dans `externalPorts` sont exposés | Tous les ports de la VM sont exposés |
| **Sécurité** | Contrôle fin, surface d'attaque réduite | Nécessite un firewall au niveau de l'OS |
| **Cas d'usage** | Production, services ciblés | Développement, tests rapides |

:::warning
Avec `WholeIP`, vous devez impérativement configurer un firewall dans la VM (iptables, nftables, ufw) pour protéger les services non exposés.
:::

```yaml title="vm-portlist.yaml"
spec:
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 443
```

---

### Quelles images sont disponibles ?

Hikube propose des **Golden Images** pré-configurées :

| Système d'exploitation | Versions disponibles |
|----------------------|---------------------|
| **Ubuntu** | 22.04, 24.04 |
| **Debian** | 11, 12, 13 |
| **CentOS Stream** | 9, 10 |
| **Rocky Linux** | 8, 9, 10 |
| **AlmaLinux** | 8, 9, 10 |

Les images suivent le format `{os}-{version}` dans le champ `instanceProfile`. Par exemple : `ubuntu`, `debian`, `centos`, `rocky`, `almalinux`.

---

### Comment choisir mon instanceType ?

Les instances suivent trois gammes avec des ratios vCPU:RAM différents :

| Gamme | Préfixe | Ratio | Exemple d'usage |
|-------|---------|-------|-----------------|
| **Standard** | `s1` | 1:2 | Serveurs web, applications légères |
| **Universal** | `u1` | 1:4 | Applications métier, bases de données |
| **Memory** | `m1` | 1:8 | Cache, traitements en mémoire |

Les tailles disponibles vont de `small` à `8xlarge`. Par exemple : `u1.xlarge` offre 4 vCPU et 16 Go de RAM.

---

### Comment ajouter un disque supplémentaire ?

Créez d'abord une ressource `VMDisk`, puis référencez-la dans votre `VMInstance` :

```yaml title="data-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: data-volume
spec:
  size: 100Gi
  storageClass: replicated
```

```yaml title="vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: my-vm
spec:
  instanceType: u1.large
  instanceProfile: ubuntu
  disks:
    - data-volume
```

---

### Comment accéder à ma VM en SSH ?

1. Injectez votre clé SSH publique dans le manifeste de la VM :
   ```yaml title="vm-ssh.yaml"
   spec:
     sshKeys:
       - "ssh-ed25519 AAAAC3... user@laptop"
   ```

2. Exposez le port 22 via `PortList` :
   ```yaml title="vm-ssh.yaml"
   spec:
     external: true
     externalMethod: PortList
     externalPorts:
       - 22
   ```

3. Récupérez l'adresse IP externe :
   ```bash
   kubectl get svc
   ```

4. Connectez-vous :
   ```bash
   ssh user@<external-ip>
   ```

:::note
Le nom d'utilisateur par défaut dépend de l'image : `ubuntu` pour Ubuntu, `debian` pour Debian, `cloud-user` pour CentOS/Rocky/AlmaLinux.
:::

---

### Comment personnaliser la VM au démarrage ?

Utilisez le champ `cloudInit` pour injecter une configuration cloud-init au format YAML :

```yaml title="vm-cloudinit.yaml"
spec:
  cloudInit: |
    #cloud-config
    packages:
      - nginx
      - htop
    users:
      - name: admin
        sudo: ALL=(ALL) NOPASSWD:ALL
        ssh_authorized_keys:
          - ssh-ed25519 AAAAC3... admin@company
    runcmd:
      - systemctl enable nginx
      - systemctl start nginx
```

Cloud-init s'exécute au premier démarrage de la VM et permet d'installer des paquets, créer des utilisateurs, exécuter des commandes, etc.

---

### Quelle est la différence entre `instanceProfile` et `instanceType` ?

| Paramètre | Rôle | Exemples |
|-----------|------|----------|
| `instanceProfile` | Définit le **profil OS** (système d'exploitation) | `ubuntu`, `debian`, `centos`, `rocky`, `almalinux` |
| `instanceType` | Définit la **taille** de la VM (CPU/RAM) | `s1.small`, `u1.large`, `m1.2xlarge` |

Les deux sont obligatoires et complémentaires : `instanceProfile` détermine quel OS sera installé, tandis que `instanceType` dimensionne les ressources CPU et mémoire allouées à la VM.
