---
title: Virtual Machine Instances
---

Une **Virtual Machine (VM)** simule du matériel informatique, permettant à divers systèmes d'exploitation et applications de s'exécuter dans un environnement isolé.

---

## Exemple de Configuration

Voici un exemple de configuration YAML pour une machine virtuelle avec des paramètres typiques :

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

À l'aide du kubeconfig fourni par Hikube et de ce yaml d'exemple, enregistré sous un fichier `manifest.yaml`, vous pouvez facilement tester le déploiement de l'application à l'aide de la commande suivante :

```sh
kubectl apply -f manifest.yaml
```

---

## Accéder à une Machine Virtuelle

Vous pouvez accéder à une machine virtuelle en utilisant l'outil **virtctl** :

- **Console Série** :  
  `virtctl console <vm>`

- **Accès VNC** :  
  `virtctl vnc <vm>`

- **Accès SSH** :  
  `virtctl ssh <user>@<vm>`

---

## Paramètres Configurables

### **Paramètres Généraux**

| **Nom**              | **Description**                                                                   | **Valeur Par Défaut** |
|-----------------------|-----------------------------------------------------------------------------------|------------------------|
| `external`           | Permet l'accès externe depuis l'extérieur du cluster.                            | `false`               |
| `externalPorts`      | Spécifie les ports à exposer en dehors du cluster.                                | `[]`                  |
| `running`            | Indique si la VM doit être en cours d'exécution.                                 | `true`                |
| `instanceType`       | Type d'instance de la machine virtuelle.                                          | `u1.medium`           |
| `instanceProfile`    | Profil des préférences pour la machine virtuelle (OS invité).                    | `ubuntu`              |
| `disks`              | Liste des disques à attacher.                                                    | `[]`                  |
| `resources.cpu`      | Nombre de cœurs CPU alloués à la machine virtuelle.                               | `""`                  |
| `resources.memory`   | Quantité de mémoire allouée à la machine virtuelle.                               | `""`                  |
| `sshKeys`            | Liste des clés publiques SSH pour l'authentification (clé unique ou liste).       | `[]`                  |
| `cloudInit`          | Configuration des données utilisateur via cloud-init. Voir la documentation pour plus de détails. | `#cloud-config`       |
