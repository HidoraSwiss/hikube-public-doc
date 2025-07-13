---
title: RabbitMQ
---

**RabbitMQ** est un puissant courtier de messages, essentiel dans les systèmes distribués modernes. Le service **Managed RabbitMQ** simplifie le déploiement et la gestion des clusters RabbitMQ, garantissant fiabilité et évolutivité pour vos besoins de messagerie.

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
  replicas: 3
  size: 20Gi
  storageClass: replicated
  users:
    user1:
      password: securepassword
  vhosts:
    myapp:
      roles:
        admin:
        - user1

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
| `size`         | Taille du volume persistant pour les données.         | `10Gi`                |
| `replicas`     | Nombre de réplicas RabbitMQ.                          | `3`                   |
| `storageClass` | Classe de stockage utilisée pour les données.         | `"replicated"` ou `"local"`   |

---

### **Paramètres de Configuration**

| **Nom**      | **Description**                       | **Valeur Par Défaut** |
|--------------|---------------------------------------|------------------------|
| `users`      | Configuration des utilisateurs.      | `{}`                  |
| `vhosts`     | Configuration des Virtual Hosts.     | `{}`                  |

---

## Ressources Additionnelles

Pour en savoir plus sur RabbitMQ et son opérateur, consultez les ressources suivantes :

- **[Documentation Officielle RabbitMQ Cluster Operator](https://www.rabbitmq.com/kubernetes/operator/operator-overview.html)**
  Guide complet sur l'utilisation de l'opérateur RabbitMQ.
