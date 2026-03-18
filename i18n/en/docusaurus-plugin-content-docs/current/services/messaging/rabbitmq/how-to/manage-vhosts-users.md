---
title: "How to manage vhosts and users"
---

# How to manage vhosts and users

This guide explains how to create and manage RabbitMQ users, virtual hosts (vhosts), and permissions on Hikube declaratively via Kubernetes manifests.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- A **RabbitMQ** cluster deployed on Hikube (or a manifest ready to deploy)
- (Optional) **rabbitmqadmin** or a browser to access the Management UI

## Steps

### 1. Create users

Users are declared in the `users` section of the manifest. Each user is identified by a name and has a password.

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
Separate users by functional role: an **admin** account for administration, **application** accounts for each service, and a dedicated **monitoring** account for supervision. This facilitates auditing and limits impact in case of compromise.
:::

### 2. Create vhosts with permissions

Virtual hosts isolate queues, exchanges, and bindings between different applications or environments. Each vhost defines `admin` (full read/write) and `readonly` (read-only) roles.

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

**Available roles:**

| Role | Description |
|------|-------------|
| `admin` | Full access: create/delete queues, publish and consume messages |
| `readonly` | Read-only access: consume messages, view metrics |

:::tip
Isolate each application in a dedicated vhost. This limits the impact in case of overload from one application and simplifies permission management.
:::

### 3. Apply the changes

Combine the full configuration in a single manifest:

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

### 4. Verify users and vhosts

Verify that the RabbitMQ resource has been updated:

```bash
kubectl get rabbitmq my-rabbitmq -o yaml | grep -A 20 "users:\|vhosts:"
```

For a more thorough verification, connect to a RabbitMQ pod:

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl list_users
```

**Expected output:**

```console
Listing users ...
user	tags
admin	[administrator]
appuser	[]
monitoring	[]
```

List the vhosts:

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl list_vhosts
```

**Expected output:**

```console
Listing vhosts ...
name
production
analytics
```

Check the permissions of a vhost:

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl list_permissions -p production
```

**Expected output:**

```console
Listing permissions for vhost "production" ...
user	configure	write	read
admin	.*	.*	.*
appuser	.*	.*	.*
monitoring		    	.*
```

### 5. Test the AMQP connection

Open a port-forward to the RabbitMQ service:

```bash
kubectl port-forward svc/my-rabbitmq 5672:5672
```

Test the connection with an AMQP client (example with Python `pika`):

```python
import pika

credentials = pika.PlainCredentials('appuser', 'AppUserPassword456')
connection = pika.BlockingConnection(
    pika.ConnectionParameters('127.0.0.1', 5672, 'production', credentials)
)
channel = connection.channel()
channel.queue_declare(queue='test-queue')
channel.basic_publish(exchange='', routing_key='test-queue', body='Hello Hikube!')
print("Message sent successfully")
connection.close()
```

You can also access the Management UI via port-forward:

```bash
kubectl port-forward svc/my-rabbitmq 15672:15672
```

Then open `http://127.0.0.1:15672` in your browser and log in with the `admin` account.

## Verification

The configuration is successful if:

- Users appear in `rabbitmqctl list_users`
- Vhosts are listed in `rabbitmqctl list_vhosts`
- Permissions match the manifest (`rabbitmqctl list_permissions`)
- Users can connect via AMQP on their respective vhost
- `readonly` users cannot publish messages

## Next steps

- **[RabbitMQ API reference](../api-reference.md)**: full documentation of `users` and `vhosts` parameters
- **[How to scale the RabbitMQ cluster](./scale-resources.md)**: adjust resources and replica count
