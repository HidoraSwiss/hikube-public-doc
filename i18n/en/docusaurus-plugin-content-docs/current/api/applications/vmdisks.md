---
title: VMDisks
---

Un **Virtual Machine Disk (VM Disk)** est une unité de stockage virtuelle utilisée par les machines virtuelles. Ce disque peut être basé sur une image source ou défini avec une taille spécifique. Le service permet une configuration flexible des disques pour répondre aux besoins des machines virtuelles.

---

## Paramètres Configurables

### **Paramètres Généraux**

| **Nom**        | **Description**                                                    | **Valeur Par Défaut** |
|-----------------|--------------------------------------------------------------------|------------------------|
| `source`       | Emplacement de l'image source utilisée pour créer le disque.       | `{}`                  |
| `optical`      | Indique si le disque doit être considéré comme un disque optique.  | `false`               |
| `storage`      | Taille du disque allouée pour la machine virtuelle.                | `5Gi`                 |
| `storageClass` | Classe de stockage utilisée pour les données.                      | `"replicated"` ou `"local"`          |

---

## Exemple de Configuration

Voici un exemple de configuration YAML pour un disque virtuel utilisant une image source téléchargée depuis un HTTP :

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisks
metadata:
  name: vm-disk-example
spec:
  source:
    http:
      url: "https://download.cirros-cloud.net/0.6.2/cirros-0.6.2-x86_64-disk.img"
  optical: false
  storage: 10Gi
  storageClass: "replicated"
```

---

## Exemples d'Images Source Bien Connues

Voici des exemples d'images source couramment utilisées pour les disques virtuels :

- **Ubuntu** :  
  `https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img`

- **Fedora** :  
  `https://download.fedoraproject.org/pub/fedora/linux/releases/40/Cloud/x86_64/images/Fedora-Cloud-Base-Generic.x86_64-40-1.14.qcow2`

- **Cirros** :  
  `https://download.cirros-cloud.net/0.6.2/cirros-0.6.2-x86_64-disk.img`

- **Alpine** :  
  `https://dl-cdn.alpinelinux.org/alpine/v3.20/releases/cloud/nocloud_alpine-3.20.2-x86_64-bios-tiny-r0.qcow2`

- **Talos** :  
  `https://github.com/siderolabs/talos/releases/download/v1.7.6/nocloud-amd64.raw.xz`

---

## Ressources Additionnelles

Pour en savoir plus sur la gestion des disques virtuels et les images source :

- **[Documentation Ubuntu Cloud Images](https://cloud-images.ubuntu.com/)**  
  Guide pour accéder et configurer les images Ubuntu pour le cloud.

- **[Documentation Fedora Cloud](https://fedoraproject.org/wiki/Cloud)**  
  Guide complet pour utiliser les images Fedora dans les environnements cloud.

- **[Documentation Cirros](https://cirros-cloud.net/)**  
  Informations sur l'utilisation des images Cirros.
  