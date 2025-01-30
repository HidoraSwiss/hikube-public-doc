---
title: NATS
---

**NATS** est une solution de messagerie légère et performante utilisée pour les communications entre microservices, IoT et applications en temps réel. Ce service managé facilite la gestion des clusters NATS, avec prise en charge de Jetstream pour la messagerie persistante.

---

## Exemple de Configuration

Voici un exemple de configuration YAML pour un cluster NATS avec Jetstream activé et des paramètres personnalisés :

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: nats-example
spec:
  external: false
  replicas: 3
  storageClass: "replicated"
  users:
    user1:
      password: "strongpassword"
    user2: {}
  jetstream:
    enabled: true
    size: 20Gi
  config:
    merge:
      server_name: "nats-example"
      authorization:
        token: "my-secret-token"
      jetstream:
        max_memory_store: 2Gi
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
| `replicas`     | Nombre de réplicas du cluster NATS.                   | `2`                   |
| `storageClass` | Classe de stockage utilisée pour les données.         | `"replicated"` ou `"local"`  |

---

### **Paramètres de Configuration**

| **Nom**              | **Description**                                                                                     | **Valeur Par Défaut** |
|-----------------------|-----------------------------------------------------------------------------------------------------|------------------------|
| `users`              | Configuration des utilisateurs.                                                                     | `{}`                  |
| `jetstream.size`     | Taille du stockage persistant pour Jetstream (message store).                                        | `10Gi`                |
| `jetstream.enabled`  | Active ou désactive Jetstream pour la messagerie persistante.                                        | `true`                |
| `config.merge`       | Configuration supplémentaire à fusionner dans la configuration de NATS.                             | `{}`                  |
| `config.resolver`    | Configuration supplémentaire à fusionner pour la résolution dans la configuration de NATS.          | `{}`                  |

---

## Ressources Additionnelles

Pour en savoir plus sur NATS et Jetstream, consultez les ressources suivantes :

- **[Documentation Officielle NATS](https://docs.nats.io/)**  
  Guide complet pour configurer et utiliser NATS.

- **[Documentation Jetstream](https://docs.nats.io/jetstream/)**  
  Guide sur l'utilisation de Jetstream pour la messagerie persistante.
