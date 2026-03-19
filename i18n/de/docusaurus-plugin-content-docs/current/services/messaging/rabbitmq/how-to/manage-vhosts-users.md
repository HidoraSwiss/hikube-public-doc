---
title: "Verwaltung von les vhosts et utilisateurs"
---

# Verwaltung von les vhosts et utilisateurs

Dieser Leitfaden erklärt comment créer et gérer les utilisateurs, virtual hosts (vhosts) et permissions RabbitMQ auf Hikube de manière déclarative via les manifestes Kubernetes.

## Voraussetzungen

- **kubectl** configuré avec votre kubeconfig Hikube
- Un cluster **RabbitMQ** déployé sur Hikube (ou un manifeste prêt à déployer)
- (Optionnel) **rabbitmqadmin** ou un navigateur pour accéder à la Management UI

## Schritte

### 1. Créer des utilisateurs

Les utilisateurs sont déclarés dans la section `users` du manifeste. Chaque utilisateur est identifié par un nom et possède un mot de passe.

```yaml title="rabbitmq-users.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: my-rabbitmq
spec:
  replicas: 3
  resourcesPreset: small
  size: 10Gi

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: AppUserPassword456
    monitoring:
      password: MonitoringPassword789
```

:::tip
Séparez les utilisateurs par rôle fonctionnel : un compte **admin** pour l'administration, des comptes **applicatifs** pour chaque service, et un compte **monitoring** dédié à la supervision. Cela facilite l'audit et limite l'impact en cas de compromission.
:::

### 2. Créer des vhosts avec permissions

Les virtual hosts isolent les files, échanges et bindings entre différentes applications ou environnements. Chaque vhost définit des rôles `admin` (lecture/écriture complète) et `readonly` (lecture seule).

```yaml title="rabbitmq-vhosts.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: my-rabbitmq
spec:
  replicas: 3
  resourcesPreset: small
  size: 10Gi

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: AppUserPassword456
    monitoring:
      password: MonitoringPassword789

  vhosts:
    production:
      roles:
        admin:
          - admin
          - appuser
        readonly:
          - monitoring
    analytics:
      roles:
        admin:
          - admin
        readonly:
          - appuser
          - monitoring
```

**Rôles disponibles :**

| Rôle | Beschreibung |
|------|-------------|
| `admin` | Accès complet : créer/supprimer des queues, publier et consommer des messages |
| `readonly` | Accès en lecture seule : consommer des messages, consulter les métriques |

:::tip
Isolez chaque application dans un vhost dédié. Cela limite l'impact en cas de surcharge d'une application et facilite la gestion des permissions.
:::

### 3. Appliquer les changements

Combinez la configuration complète dans un seul manifeste :

```yaml title="rabbitmq-complete.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: my-rabbitmq
spec:
  replicas: 3
  resourcesPreset: small
  size: 10Gi

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: AppUserPassword456
    monitoring:
      password: MonitoringPassword789

  vhosts:
    production:
      roles:
        admin:
          - admin
          - appuser
        readonly:
          - monitoring
    analytics:
      roles:
        admin:
          - admin
        readonly:
          - appuser
          - monitoring
```

```bash
kubectl apply -f rabbitmq-complete.yaml
```

### 4. Vérifier les utilisateurs et vhosts

Überprüfen Sie, ob la ressource RabbitMQ a bien été Aktualisierung :

```bash
kubectl get rabbitmq my-rabbitmq -o yaml | grep -A 20 "users:\|vhosts:"
```

Pour une Überprüfung plus poussée, connectez-vous à un pod RabbitMQ :

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl list_users
```

**Erwartetes Ergebnis :**

```console
Listing users ...
user	tags
admin	[administrator]
appuser	[]
monitoring	[]
```

Listez les vhosts :

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl list_vhosts
```

**Erwartetes Ergebnis :**

```console
Listing vhosts ...
name
production
analytics
```

Vérifiez les permissions d'un vhost :

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl list_permissions -p production
```

**Erwartetes Ergebnis :**

```console
Listing permissions for vhost "production" ...
user	configure	write	read
admin	.*	.*	.*
appuser	.*	.*	.*
monitoring		    	.*
```

### 5. Tester la connexion AMQP

Ouvrez un port-forward vers le service RabbitMQ :

```bash
kubectl port-forward svc/my-rabbitmq 5672:5672
```

Testez la connexion avec un client AMQP (exemple avec Python `pika`) :

```python
import pika

credentials = pika.PlainCredentials('appuser', 'AppUserPassword456')
connection = pika.BlockingConnection(
    pika.ConnectionParameters('127.0.0.1', 5672, 'production', credentials)
)
channel = connection.channel()
channel.queue_declare(queue='test-queue')
channel.basic_publish(exchange='', routing_key='test-queue', body='Hello Hikube!')
print("Message envoyé avec succès")
connection.close()
```

Vous pouvez aussi accéder à la Management UI via port-forward :

```bash
kubectl port-forward svc/my-rabbitmq 15672:15672
```

Puis ouvrez `http://127.0.0.1:15672` dans votre navigateur et connectez-vous avec le compte `admin`.

## Überprüfung

La configuration est réussie si :

- Les utilisateurs apparaissent dans `rabbitmqctl list_users`
- Les vhosts sont listés dans `rabbitmqctl list_vhosts`
- Les permissions correspondent au manifeste (`rabbitmqctl list_permissions`)
- Les utilisateurs peuvent se connecter via AMQP sur leur vhost respectif
- Les utilisateurs `readonly` ne peuvent pas publier de messages

## Weiterführende Informationen

- **[API-Referenz RabbitMQ](../api-reference.md)** : documentation complète des paramètres `users` et `vhosts`
- **[Skalierung von le cluster RabbitMQ](./scale-resources.md)** : ajuster les ressources et le nombre de réplicas
