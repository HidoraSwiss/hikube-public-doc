---
title: TCP Balancers
---

# TCP Balancers

Le service **Managed TCP Load Balancer** simplifie le déploiement et la gestion des load balancers TCP. Il permet de distribuer efficacement le trafic TCP entrant sur plusieurs serveurs backend, garantissant une haute disponibilité et une utilisation optimale des ressources.

---

## Détails du Déploiement

Le service utilise **HAProxy**, une solution reconnue pour l'équilibrage de charge TCP. Ce choix garantit une infrastructure de load balancing fiable, performante et facile à gérer.

---

## Paramètres Configurables

### **Paramètres Généraux**

| **Nom**        | **Description**                                      | **Valeur Par Défaut** |
|-----------------|------------------------------------------------------|------------------------|
| `external`     | Permet l'accès externe depuis l'extérieur du cluster. | `false`               |
| `replicas`     | Nombre de réplicas HAProxy.                           | `2`                   |

---

### **Paramètres de Configuration**

| **Nom**                     | **Description**                                           | **Valeur Par Défaut** |
|------------------------------|----------------------------------------------------------|------------------------|
| `httpAndHttps.mode`         | Mode pour le balancer (`tcp` ou `tcp-with-proxy`).         | `tcp`                 |
| `httpAndHttps.targetPorts.http` | Port HTTP utilisé par le balancer.                       | `80`                  |
| `httpAndHttps.targetPorts.https` | Port HTTPS utilisé par le balancer.                     | `443`                 |
| `httpAndHttps.endpoints`    | Liste des adresses des endpoints backend.                 | `[]`                  |
| `whitelistHTTP`             | Active la sécurisation HTTP via une liste blanche réseau. | `false`               |
| `whitelist`                 | Liste des réseaux clients autorisés.                      | `[]`                  |

---

## Exemple de Configuration

Voici un exemple de configuration YAML pour un déploiement de TCP Load Balancer avec deux réplicas et une liste blanche réseau activée :

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: TCPBalancer
metadata:
  name: tcp-balancer-example
spec:
  external: false
  replicas: 2
  httpAndHttps:
    mode: tcp
    targetPorts:
      http: 80
      https: 443
    endpoints:
      - address: "192.168.1.10"
      - address: "192.168.1.11"
  whitelistHTTP: true
  whitelist:
    - "192.168.1.0/24"
    - "10.0.0.0/8"
```

---

## Ressources Additionnelles

Pour en savoir plus sur HAProxy et l'équilibrage de charge TCP, consultez les ressources suivantes :

- **[Documentation Officielle HAProxy](https://www.haproxy.com/documentation/)**  
  Guide complet pour configurer et utiliser HAProxy dans des scénarios d'équilibrage de charge.
