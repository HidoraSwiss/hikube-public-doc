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

---

## Étape 1 : Créer le manifeste RabbitMQ

### **Préparez le fichier `rabbitmq.yaml`**

Créez un fichier `rabbitmq.yaml` contenant la configuration suivante :

```yaml title="rabbitmq.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: default
  namespace: tenant-x
spec:
  replicas: 3
  resourcesPreset: large
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

Connectez-vous avec en recuperant le default user:

```bash
kubectl get secret rabbitmq-rabbitmq-default-user -o jsonpath='{.data}' | jq -r 'to_entries[] | "\(.key): \(.value | @base64d)"'
```

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

# Identifiants définis dans ta CR RabbitMQ
credentials = pika.PlainCredentials('admin', 'strongpassword')

# Connexion au service RabbitMQ du cluster CozyStack
parameters = pika.ConnectionParameters(
    host='localhost',  # Nom DNS Kubernetes
    port=5672,
    virtual_host='default',  # correspond à ton vhost
    credentials=credentials
)

# Connexion
connection = pika.BlockingConnection(parameters)
channel = connection.channel()

# Création d’une queue "test"
channel.queue_declare(queue='test')

# Envoi d’un message simple
channel.basic_publish(exchange='', routing_key='test', body='Hello from CozyStack!')
print(" [x] Message envoyé à RabbitMQ 🎉")

# Fermeture propre
connection.close()
```

Exécutez ensuite :

```bash
python test_rabbitmq.py
```

✅ Vous devriez voir :

```
Message envoyé :  [x] Message envoyé à RabbitMQ 🎉
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

## Nettoyage

Pour supprimer les ressources de test :

```bash
kubectl delete -f rabbitmq.yaml
```

:::warning
Cette action supprime le cluster RabbitMQ et toutes les données associées. Cette opération est **irréversible**.
:::

---

## Prochaines étapes

- **[Référence API](./api-reference.md)** : Configuration complète de toutes les options RabbitMQ
- **[Vue d'ensemble](./overview.md)** : Architecture détaillée et cas d'usage RabbitMQ sur Hikube
