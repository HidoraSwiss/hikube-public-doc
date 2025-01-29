---
title: Kafka
---

Kafka est une plateforme de messagerie distribuée conçue pour gérer des flux de données en temps réel avec une haute disponibilité et une tolérance aux pannes. Cette page détaille les paramètres de configuration pour Kafka, y compris les options pour ZooKeeper, et propose un exemple d'utilisation.

---

## Exemple de Configuration

Voici un exemple de configuration YAML pour déployer Kafka avec ZooKeeper dans un cluster Kubernetes :

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: kafka-example
spec:
  external: true
  kafka:
    size: 20Gi
    replicas: 3
    storageClass: "replicated"
  zookeeper:
    size: 10Gi
    replicas: 3
    storageClass: "replicated"
  topics:
    - name: "example-topic"
      partitions: 3
      replicationFactor: 2
    - name: "another-topic"
      partitions: 5
      replicationFactor: 3
```

À l'aide du kubeconfig fourni par Hikube et de ce yaml d'exemple, enregistré sous un fichier manifest.yaml, vous pouvez facilement tester le déploiement de l'application à l'aide de la commande suivante :

`kubectl apply -f manifest.yaml`

Dans cet exemple :

- **`external`** : Activé pour permettre un accès externe à Kafka depuis l'extérieur du cluster.
- **`kafka.size`** : Défini à `20Gi`, spécifiant la taille du volume persistant pour Kafka.
- **`kafka.replicas`** : Configuré à `3`, garantissant la redondance et la haute disponibilité.
- **`kafka.storageClass`** : Utilise une classe de stockage nommée `replicated`.
- **`zookeeper.size`** : Défini à `10Gi` pour le stockage persistant des données ZooKeeper.
- **`zookeeper.replicas`** : Configuré à `3`, assurant une tolérance aux pannes pour ZooKeeper.
- **`zookeeper.storageClass`** : Utilise une classe de stockage fiable nommée `reliable-storage`.
- **`topics`** :
  - **`example-topic`** : Un topic avec 3 partitions et un facteur de réplication de 2.
  - **`another-topic`** : Un topic avec 5 partitions et un facteur de réplication de 3.

Cette configuration garantit un déploiement robuste et performant de Kafka, en intégrant des pratiques optimales pour la gestion des données et des topics.

---

## Paramètres Configurables

### **Paramètres Généraux**

Ces paramètres configurent les composants Kafka et ZooKeeper pour assurer leur déploiement et leur bon fonctionnement.

| **Nom**               | **Description**                                              | **Valeur Par Défaut** |
|------------------------|--------------------------------------------------------------|------------------------|
| `external`            | Permet l'accès externe à Kafka depuis l'extérieur du cluster. | `false`               |
| `kafka.size`          | Taille du volume persistant pour les données Kafka.           | `10Gi`                |
| `kafka.replicas`      | Nombre de réplicas Kafka.                                     | `3`                   |
| `kafka.storageClass`  | Classe de stockage utilisée pour les données Kafka.           | `"replicated"` ou `"local"`   |
| `zookeeper.size`      | Taille du volume persistant pour les données ZooKeeper.       | `5Gi`                 |
| `zookeeper.replicas`  | Nombre de réplicas ZooKeeper.                                 | `3`                   |
| `zookeeper.storageClass` | Classe de stockage utilisée pour les données ZooKeeper.    | `"replicated"` ou `"local"`   |

---

### **Paramètres de Configuration**

Ces paramètres permettent de personnaliser la gestion des topics Kafka.

| **Nom**   | **Description**              | **Valeur Par Défaut** |
|-----------|------------------------------|------------------------|
| `topics`  | Configuration des topics.    | `[]`                  |

---

## Ressources Additionnelles

Pour approfondir vos connaissances sur Kafka et ses composants, consultez les ressources suivantes :

- [**Documentation Officielle Kafka**](https://kafka.apache.org/documentation/)  
  Guide officiel pour configurer et exploiter Kafka, avec des exemples pratiques et des concepts avancés.

- [**ZooKeeper Documentation**](https://zookeeper.apache.org/doc/r3.8.0/index.html)  
  Guide complet pour comprendre et configurer ZooKeeper, une composante clé pour le bon fonctionnement de Kafka.
