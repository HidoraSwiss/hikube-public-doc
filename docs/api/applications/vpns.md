---
title: VPN
---

Le **Managed VPN Service** est une solution essentielle pour garantir une communication sécurisée et privée sur Internet. Ce service simplifie le déploiement et la gestion des serveurs VPN, vous permettant d'établir facilement des connexions sécurisées.

---

## Exemple de Configuration

Voici un exemple de configuration YAML pour un serveur VPN avec deux réplicas et des adresses IP externes spécifiées :

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VPN
metadata:
  name: vpn-example
spec:
  external: true
  replicas: 2
  host: "vpn.example.org"
  users:
    - name: "user1"
      password: "secure-password"
    - name: "user2"
      password: "another-secure-password"
  externalIPs:
    - "192.168.1.100"
    - "192.168.1.101"
```

À l'aide du kubeconfig fourni par Hikube et de ce yaml d'exemple, enregistré sous un fichier `manifest.yaml`, vous pouvez facilement tester le déploiement de l'application à l'aide de la commande suivante :

```sh
kubectl apply -f manifest.yaml
```

---

## Paramètres Configurables

### **Paramètres Généraux**

| **Nom**        | **Description**                                      | **Valeur Par Défaut** |
|-----------------|------------------------------------------------------|------------------------|
| `external`     | Permet l'accès externe depuis l'extérieur du cluster. | `false`               |
| `replicas`     | Nombre de réplicas du serveur VPN.                    | `2`                   |

---

### **Paramètres de Configuration**

| **Nom**          | **Description**                                     | **Valeur Par Défaut** |
|-------------------|-----------------------------------------------------|------------------------|
| `host`           | Hôte utilisé pour générer des URL.                  | `""`                  |
| `users`          | Configuration des utilisateurs.                     | `{}`                  |
| `externalIPs`    | Liste des adresses IP externes pour le service.      | `[]`                  |

---

## Ressources Additionnelles

Pour en savoir plus sur le service VPN et ses clients compatibles, consultez les ressources suivantes :

- **[Clients Compatibles Shadowsocks](https://shadowsocks5.github.io/en/download/clients.html)**  
  Liste des clients compatibles avec Shadowsocks.

- **[Documentation Shadowsocks](https://shadowsocks.org/)**  
  Guide officiel pour comprendre et configurer Shadowsocks.

- **[Shadowbox sur GitHub](https://github.com/Jigsaw-Code/outline-server/tree/master/src/shadowbox)**  
  Référentiel GitHub pour Shadowbox et Outline Server.
  