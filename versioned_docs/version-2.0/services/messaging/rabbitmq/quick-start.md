---
sidebar_position: 2
title: Démarrage rapide
---

# Déployer RabbitMQ en 5 minutes

Ce guide vous accompagne pas à pas dans le déploiement de votre premier **cluster RabbitMQ** sur Hikube, du manifeste YAML jusqu'aux premiers tests de messagerie.

---

## Objectifs

À la fin de ce guide, vous aurez :

- Un **cluster RabbitMQ** déployé et opérationnel sur Hikube
- **3 nœuds RabbitMQ** répliqués pour la haute disponibilité
- Un **vhost** et un **utilisateur admin** configurés
- Un **stockage persistant** pour les données RabbitMQ
- Un accès à l'**interface de gestion** (Management UI)

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- **kubectl** configuré avec votre kubeconfig Hikube
- **Droits administrateur** sur votre tenant
- Un **namespace** dédié pour héberger votre cluster RabbitMQ
- **Python** avec le module `pika` installé (optionnel, pour les tests)

---

## Étape 1 : Créer le manifeste RabbitMQ

Créez un fichier `rabbitmq.yaml` avec la configuration suivante :

```yaml title="rabbitmq.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: example
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

:::tip
Avec 3 réplicas, RabbitMQ utilise les **quorum queues** pour garantir la durabilité des messages. Consultez la [Référence API](./api-reference.md) pour la configuration complète.
:::

---

## Étape 2 : Déployer le cluster RabbitMQ

Appliquez le manifeste et vérifiez que le déploiement démarre :

```bash
# Appliquer le manifeste
kubectl apply -f rabbitmq.yaml
```

Vérifiez le statut du cluster (peut prendre 2-3 minutes) :

```bash
kubectl get rabbitmq
```

**Résultat attendu :**

```console
NAME      READY   AGE     VERSION
example   True    2m      0.10.0
```

---

## Étape 3 : Vérification des pods

Vérifiez que tous les pods sont en état `Running` :

```bash
kubectl get pods | grep rabbitmq
```

**Résultat attendu :**

```console
rabbitmq-example-rabbitmq-server-0    1/1     Running   0   2m
rabbitmq-example-rabbitmq-server-1    1/1     Running   0   2m
rabbitmq-example-rabbitmq-server-2    1/1     Running   0   2m
```

Avec `replicas: 3`, vous obtenez **3 nœuds RabbitMQ** formant un cluster haute disponibilité.

| Préfixe | Rôle | Nombre |
|---------|------|--------|
| `rabbitmq-example-rabbitmq-server-*` | **RabbitMQ Server** (broker de messages + Management UI) | 3 |

---

## Étape 4 : Récupérer les identifiants

Les mots de passe sont stockés dans des Secrets Kubernetes :

```bash
# Identifiants de l'utilisateur défini dans le manifeste
kubectl get secret rabbitmq-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Résultat attendu :**

```console
admin: strongpassword
```

Un utilisateur par défaut est également créé automatiquement par l'opérateur :

```bash
# Identifiants de l'utilisateur par défaut
kubectl get secret rabbitmq-example-rabbitmq-default-user -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

---

## Étape 5 : Connexion et tests

### Accès à l'interface de gestion (Management UI)

```bash
kubectl port-forward svc/rabbitmq-example-rabbitmq 15672:15672 &
```

Accédez à l'interface via votre navigateur : http://localhost:15672

Connectez-vous avec les identifiants de l'utilisateur par défaut récupérés à l'étape 4.

### Test de messagerie avec Python

```bash
kubectl port-forward svc/rabbitmq-example-rabbitmq 5672:5672 &
```

```python title="test_rabbitmq.py"
import pika

credentials = pika.PlainCredentials('admin', 'strongpassword')
parameters = pika.ConnectionParameters(
    host='localhost',
    port=5672,
    virtual_host='default',
    credentials=credentials
)

connection = pika.BlockingConnection(parameters)
channel = connection.channel()

# Création d'une queue
channel.queue_declare(queue='test')

# Envoi d'un message
channel.basic_publish(exchange='', routing_key='test', body='Hello Hikube!')
print("Message envoyé avec succès")

connection.close()
```

```bash
python test_rabbitmq.py
```

**Résultat attendu :**

```console
Message envoyé avec succès
```

:::note
Si vous n'avez pas `pika`, installez-le avec `pip install pika`.
:::

---

## Étape 6 : Dépannage rapide

### Pods en CrashLoopBackOff

```bash
# Vérifier les logs du pod en erreur
kubectl logs rabbitmq-example-rabbitmq-server-0

# Vérifier les events du pod
kubectl describe pod rabbitmq-example-rabbitmq-server-0
```

**Causes fréquentes :** mémoire insuffisante (`resources.memory` trop faible), volume de stockage plein, erreur de résolution DNS entre les nœuds.

### RabbitMQ non accessible

```bash
# Vérifier que les services existent
kubectl get svc | grep rabbitmq

# Vérifier le service RabbitMQ
kubectl describe svc rabbitmq-example-rabbitmq
```

**Causes fréquentes :** port-forward non actif, mauvais port (5672 pour AMQP, 15672 pour Management UI), identifiants incorrects.

### Cluster non formé

```bash
# Vérifier l'état du cluster RabbitMQ
kubectl exec rabbitmq-example-rabbitmq-server-0 -- rabbitmqctl cluster_status

# Vérifier les logs de formation du cluster
kubectl logs rabbitmq-example-rabbitmq-server-0 | grep -i cluster
```

**Causes fréquentes :** problème de résolution DNS entre les nœuds, cookie Erlang non synchronisé, ressources insuffisantes pour le processus de formation du cluster.

### Commandes de diagnostic générales

```bash
# Events récents sur le namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# État détaillé du cluster RabbitMQ
kubectl describe rabbitmq example
```

---

## Étape 7 : Nettoyage

Pour supprimer les ressources de test :

```bash
kubectl delete -f rabbitmq.yaml
```

:::warning
Cette action supprime le cluster RabbitMQ et toutes les données associées. Cette opération est **irréversible**.
:::

---

## Résumé

Vous avez déployé :

- Un cluster RabbitMQ avec **3 nœuds** en haute disponibilité
- Un **utilisateur admin** et un **vhost** par défaut configurés
- Une **interface de gestion** (Management UI) accessible localement
- Un stockage persistant pour la durabilité des données

---

## Prochaines étapes

- **[Référence API](./api-reference.md)** : Configuration complète de toutes les options RabbitMQ
- **[Vue d'ensemble](./overview.md)** : Architecture détaillée et cas d'usage RabbitMQ sur Hikube
