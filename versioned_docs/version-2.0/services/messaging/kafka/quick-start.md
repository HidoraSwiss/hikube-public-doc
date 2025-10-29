---
sidebar_position: 2
title: Démarrage rapide
---

# Déployer Kafka en 5 minutes

Ce guide vous accompagne dans le déploiement de votre premier **cluster Kafka** sur Hikube en **quelques minutes** !

---

## Objectifs

À la fin de ce guide, vous aurez :

* Un **cluster Kafka** déployé et opérationnel sur Hikube
* Une configuration avec **3 brokers Kafka** et **3 nœuds ZooKeeper**
* Un **topic** prêt à recevoir des messages
* Un **stockage persistant** pour vos données Kafka et ZooKeeper

---

## Prérequis

Avant de commencer, assurez-vous d’avoir :

* **kubectl** configuré avec votre kubeconfig Hikube
* Les **droits administrateur** sur votre tenant
* Un **namespace** disponible pour héberger votre cluster Kafka
* (Optionnel) Un **service externe** si vous souhaitez exposer Kafka à l’extérieur du cluster

---

## Étape 1 : Créer le manifeste Kafka

### **Préparez le fichier `kafka.yaml`**

Créez un fichier `kafka.yaml` comme ci-dessous :

```yaml title="kafka.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: default
  namespace: tenant-damien
spec:
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
    storageClass: replicated
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
    storageClass: replicated
  topics:
    - name: my-topic
      partitions: 3
      replicas: 3
      config:
        retention.ms: "604800000"
        cleanup.policy: "delete"
```

### **Déployez le manifest Kafka**

```bash
# Appliquer le fichier yaml
kubectl apply -f kafka.yaml
```

---

## Étape 2 : Vérification du déploiement

Attendez quelques minutes que les pods soient créés, puis vérifiez leur état :

```bash
# Vérifier le statut de la ressource Kafka
kubectl get kafka
NAME       READY   AGE   VERSION
example    True    2m    0.13.0

# Vérifier les pods Kafka et ZooKeeper
kubectl get pods | grep kafka
kafka-example-kafka-0        1/1     Running   0   2m
kafka-example-kafka-1        1/1     Running   0   2m
kafka-example-kafka-2        1/1     Running   0   2m
kafka-example-zookeeper-0    1/1     Running   0   2m
kafka-example-zookeeper-1    1/1     Running   0   2m
kafka-example-zookeeper-2    1/1     Running   0   2m
```

---

## Étape 3 : Connexion et test du cluster

### **Port-forward du service Kafka**

```bash
kubectl port-forward svc/kafka-default-kafka-bootstrap 9092:9092
```

### **Publier et consommer un message en local**

Installez le client Kafka si nécessaire :

```bash
# Sur votre machine locale
sudo apt install kafkacat -y  # ou kafka-console-producer/kafka-console-consumer
```

Puis testez la communication :

```bash
# Envoyer un message
kafkacat -b localhost:9092 -t default -P
Hello Hikube!
Ctrl+D

# Consommer le message
kafkacat -b localhost:9092 -t default -C -o beginning
Hello Hikube!
```

---

## Étape 4 : Gestion des topics

Vous pouvez créer de nouveaux topics directement via `kubectl` :

```bash
kubectl patch kafka example --type='merge' -p '{
  "spec": {
    "topics": [
      {
        "name": "events",
        "partitions": 5,
        "replicas": 3,
        "config": {
          "retention.ms": "259200000", 
          "cleanup.policy": "compact"
        }
      }
    ]
  }
}'

```

Vérifiez ensuite dans les logs du broker que le topic a bien été créé.

---

## 📋 Résumé

Vous avez déployé :

* Un **cluster Kafka** complet sur votre tenant Hikube
* **3 brokers Kafka** et **3 serveurs ZooKeeper**
* Un **topic par défaut** prêt à recevoir des messages
* Un **stockage persistant** pour Kafka et ZooKeeper
* Un **accès local** via port-forward pour tester la production et la consommation de messages
