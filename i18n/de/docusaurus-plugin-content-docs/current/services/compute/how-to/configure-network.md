---
title: "Konfiguration von le réseau externe"
---

# Konfiguration von le réseau externe

Hikube bietet deux méthodes d'exposition réseau pour rendre une VM accessible depuis l'extérieur : **PortList** (recommandé) et **WholeIP**. Dieser Leitfaden erklärt comment choisir et configurer chaque méthode.

## Voraussetzungen

- **kubectl** configuré avec votre kubeconfig Hikube
- Une **VMInstance** existante ou un manifeste prêt à déployer
- Connaissance des ports nécessaires pour votre application

## Schritte

### 1. Choisir la méthode d'exposition

Hikube supporte deux méthodes via le paramètre `externalMethod` :

| Méthode | Beschreibung | Anwendungsfälle |
|---------|-------------|-------------|
| **PortList** | Seuls les ports listés dans `externalPorts` sont exposés. Firewall automatique. | Production, environnements sécurisés |
| **WholeIP** | Tous les ports de la VM sont exposés. Aucun filtrage réseau. | Développement, tests, VPN/Gateway, accès administratif complet |

:::tip Recommandation
Utilisez **PortList** en production. Cette méthode applique un firewall automatique qui n'expose que les ports explicitement déclarés.
:::

### 2. Configurer avec PortList (recommandé)

Avec `PortList`, vous déclarez explicitement les ports à exposer via `externalPorts`. Tout le reste est bloqué au niveau réseau :

```yaml title="vm-portlist.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-web-server
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
```

Dans cet exemple, seuls les ports SSH (22), HTTP (80) et HTTPS (443) sont accessibles depuis l'extérieur.

### 3. Configurer avec WholeIP (alternative)

Avec `WholeIP`, la VM reçoit une IP publique avec tous les ports ouverts. Le paramètre `externalPorts` n'est pas nécessaire :

```yaml title="vm-wholeip.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-dev
spec:
  runStrategy: Always
  instanceType: u1.xlarge
  instanceProfile: ubuntu
  external: true
  externalMethod: WholeIP
  disks:
    - vm-system-disk
  sshKeys:
    - ssh-ed25519 AAAA... user@host
```

:::warning Sécurité
Avec `WholeIP`, la VM est entièrement exposée sur Internet. Tous les ports sont accessibles. Configurez impérativement un **firewall au niveau du système d'exploitation** (ufw, firewalld, iptables) pour restreindre les accès.
:::

### 4. Appliquer et vérifier l'accès

Appliquez le manifeste :

```bash
kubectl apply -f vm-portlist.yaml
```

Attendez que la VM soit en état `Running` :

```bash
kubectl get vminstance vm-web-server -w
```

## Überprüfung

Récupérez l'adresse IP externe de la VM :

```bash
kubectl get vminstance vm-web-server -o yaml
```

Testez la connectivité sur les ports exposés :

```bash
# Test SSH
ssh -i ~/.ssh/hikube-vm ubuntu@<IP-EXTERNE>

# Test HTTP (si un serveur web est installé)
curl http://<IP-EXTERNE>
```

Pour vérifier qu'un port non exposé est bien bloqué (avec PortList) :

```bash
# Ce port devrait être inaccessible avec PortList
nc -zv <IP-EXTERNE> 8080
```

:::note Modification des ports
Pour ajouter ou retirer des ports exposés avec `PortList`, modifiez la liste `externalPorts` dans le manifeste et réappliquez avec `kubectl apply`.
:::

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- section Configuration réseau
- [Schnellstart](../quick-start.md)
