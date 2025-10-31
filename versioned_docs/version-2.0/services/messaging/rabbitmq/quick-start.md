---
sidebar_position: 2
title: Démarrage rapide
---

# Déployer RabbitMQ en 5 minutes

Ce guide vous accompagne dans le déploiement de votre premier **cluster RabbitMQ** sur Hikube en **quelques minutes seulement** 🐇⚙️

---

## Objectifs

À la fin de ce guide, vous aurez :

* Un **cluster RabbitMQ** déployé et opérationnel sur Hikube
* Une configuration avec **3 nœuds RabbitMQ** répliqués
* Un **vhost** et un **utilisateur admin** configurés
* Un **stockage persistant** pour les données RabbitMQ

---

## Prérequis

Avant de commencer, assurez-vous d’avoir :

* **kubectl** configuré avec votre kubeconfig Hikube
* Les **droits administrateur** sur votre tenant
* Un **namespace** prêt pour héberger le cluster RabbitMQ
* (Optionnel) Une **connexion externe** si vous souhaitez exposer RabbitMQ à l’extérieur du cluster

---

## Étape 1 : Créer le manifeste RabbitMQ

### **Préparez le fichier `rabbitmq.yaml`**

Créez un fichier `rabbitmq.yaml` contenant la configuration suivante :

```yaml title="rabbitmq.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: default
  namespace: tenant-damien
spec:
  replicas: 3
  resourcesPreset: small
  size: 10Gi
  storageClass: replicated
  users:
    admin:
      password: "strongpassword"
  vhosts:
    default:
      roles:
        admin: ["admin"]
```

### **Déployez le manifest RabbitMQ**

```bash
# Appliquer la configuration
kubectl apply -f rabbitmq.yaml
```

---

## Étape 2 : Vérification du déploiement

Attendez quelques instants que les pods soient créés, puis vérifiez leur statut :

```bash
# Vérifier le statut de la ressource RabbitMQ
kubectl get rabbitmq
NAME       READY   AGE   VERSION
default    True    2m    3.13.0

# Vérifier les pods RabbitMQ
kubectl get pods | grep rabbitmq
rabbitmq-rabbitmq-server-0   1/1   Running   0   2m
rabbitmq-rabbitmq-server-1   1/1   Running   0   2m
rabbitmq-rabbitmq-server-2   1/1   Running   0   2m
```

Une fois tous les pods en état `Running`, votre cluster est prêt à l’emploi.

---

## Étape 3 : Connexion au cluster RabbitMQ

### **Port-forward vers le Management UI**

RabbitMQ fournit une interface web d’administration. Exposez-la localement :

```bash
kubectl port-forward svc/rabbitmq-rabbitmq 15672:15672
```

Puis accédez à l’interface via votre navigateur :
👉 [http://localhost:15672](http://localhost:15672)

Connectez-vous avec :

* **Utilisateur :** `admin`
* **Mot de passe :** `strongpassword`

---

## Étape 4 : Tester la messagerie

### **Port-forward du port AMQP**

```bash
kubectl port-forward svc/rabbitmq-rabbitmq 5672:5672
```

### **Publier et consommer un message**

Installez un client RabbitMQ local, comme `rabbitmqadmin` ou `pika` (Python) :

#### Exemple avec Python (`pika`)

```bash
pip install pika
```

Créez un fichier `test_rabbitmq.py` :

```python
import pika

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

channel.queue_declare(queue='test')
channel.basic_publish(exchange='', routing_key='test', body='Hello Hikube!')
print("Message envoyé : Hello Hikube!")

method_frame, header_frame, body = channel.basic_get('test')
if method_frame:
    print(f"Message reçu : {body.decode()}")
    channel.basic_ack(method_frame.delivery_tag)

connection.close()
```

Exécutez ensuite :

```bash
python test_rabbitmq.py
```

✅ Vous devriez voir :

```
Message envoyé : Hello Hikube!
Message reçu : Hello Hikube!
```

---

## Étape 5 : Ajouter un vhost ou un utilisateur

Vous pouvez modifier la configuration de votre cluster via `kubectl patch` :

```bash
kubectl patch rabbitmq default --type='merge' -p '{
  "spec": {
    "users": {
      "app": {
        "password": "apppassword123"
      }
    },
    "vhosts": {
      "analytics": {
        "roles": {
          "admin": ["admin"],
          "readonly": ["app"]
        }
      }
    }
  }
}'
```

---

## 📋 Résumé

Vous avez déployé :

* Un **cluster RabbitMQ** haute disponibilité sur votre tenant Hikube
* **3 réplicas RabbitMQ** avec stockage persistant
* Un **utilisateur administrateur** et un **vhost par défaut**
* Une **interface web de gestion** accessible localement
* Une **connexion AMQP** testée avec un producteur/consommateur

---

Souhaitez-tu que je fasse aussi la **page “Vue d’ensemble” RabbitMQ** en anglais (pour docs.hikube.cloud/en), en gardant le même ton professionnel et structuré ?
