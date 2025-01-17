---
title: RabbitMQ
---

# RabbitMQ

**RabbitMQ** est un puissant courtier de messages, essentiel dans les systèmes distribués modernes. Le service **Managed RabbitMQ** simplifie le déploiement et la gestion des clusters RabbitMQ, garantissant fiabilité et évolutivité pour vos besoins de messagerie.

---

## Détails du Déploiement

Ce service utilise l'opérateur officiel RabbitMQ (**RabbitMQ Cluster Operator**), garantissant la fiabilité et le fonctionnement fluide de vos instances RabbitMQ.

---

## Paramètres Configurables

### **Paramètres Généraux**

| **Nom**        | **Description**                                      | **Valeur Par Défaut** |
|-----------------|------------------------------------------------------|------------------------|
| `external`     | Permet l'accès externe depuis l'extérieur du cluster. | `false`               |
| `size`         | Taille du volume persistant pour les données.         | `10Gi`                |
| `replicas`     | Nombre de réplicas RabbitMQ.                          | `3`                   |
| `storageClass` | Classe de stockage utilisée pour les données.         | `""` (non spécifié)   |

---

### **Paramètres de Configuration**

| **Nom**      | **Description**                       | **Valeur Par Défaut** |
|--------------|---------------------------------------|------------------------|
| `users`      | Configuration des utilisateurs.      | `{}`                  |
| `vhosts`     | Configuration des Virtual Hosts.     | `{}`                  |

---

## Exemple de Configuration

Voici un exemple de configuration YAML pour un déploiement RabbitMQ avec trois réplicas :

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: rabbitmq-example
spec:
  external: false
  size: 20Gi
  replicas: 3
  storageClass: "fast-storage"
  users:
    - name: "admin"
      password: "secure-password"
      tags: "administrator"
  vhosts:
    - name: "/"
    - name: "app-vhost"
```

---

## Ressources Additionnelles

Pour en savoir plus sur RabbitMQ et son opérateur, consultez les ressources suivantes :

- **[GitHub RabbitMQ Cluster Operator](https://github.com/rabbitmq/cluster-operator/)**  
  Référentiel officiel pour l'opérateur RabbitMQ.

- **[Documentation Officielle RabbitMQ Cluster Operator](https://www.rabbitmq.com/kubernetes/operator/operator-overview.html)**  
  Guide complet sur l'utilisation de l'opérateur RabbitMQ.
