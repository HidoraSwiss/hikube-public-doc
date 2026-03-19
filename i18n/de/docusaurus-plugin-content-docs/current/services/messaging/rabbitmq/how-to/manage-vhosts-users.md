---
title: "Vhosts und Benutzer verwalten"
---

# Vhosts und Benutzer verwalten

Diese Anleitung erklärt, wie Sie Benutzer, Virtual Hosts (Vhosts) und RabbitMQ-Berechtigungen auf Hikube deklarativ über Kubernetes-Manifeste erstellen und verwalten.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- Ein auf Hikube bereitgestellter **RabbitMQ**-Cluster (oder ein Manifest zur Bereitstellung)
- (Optional) **rabbitmqadmin** oder ein Browser für den Zugriff auf die Management UI

## Schritte

### 1. Benutzer erstellen

Die Benutzer werden im Abschnitt `users` des Manifests deklariert. Jeder Benutzer wird durch einen Namen identifiziert und hat ein Passwort.

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
Trennen Sie die Benutzer nach funktionaler Rolle: ein **Admin**-Konto für die Administration, **Anwendungskonten** für jeden Dienst und ein dediziertes **Monitoring**-Konto für die Überwachung. Dies erleichtert das Audit und begrenzt die Auswirkungen bei Kompromittierung.
:::

### 2. Vhosts mit Berechtigungen erstellen

Die Virtual Hosts isolieren Queues, Exchanges und Bindings zwischen verschiedenen Anwendungen oder Umgebungen. Jeder Vhost definiert die Rollen `admin` (vollständiger Lese-/Schreibzugriff) und `readonly` (nur Lesen).

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

**Verfügbare Rollen:**

| Rolle | Beschreibung |
|-------|--------------|
| `admin` | Vollzugriff: Queues erstellen/löschen, Nachrichten veröffentlichen und konsumieren |
| `readonly` | Nur Lesezugriff: Nachrichten konsumieren, Metriken einsehen |

:::tip
Isolieren Sie jede Anwendung in einem dedizierten Vhost. Dies begrenzt die Auswirkungen bei Überlastung einer Anwendung und erleichtert die Berechtigungsverwaltung.
:::

### 3. Änderungen anwenden

Kombinieren Sie die vollständige Konfiguration in einem einzigen Manifest:

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

### 4. Benutzer und Vhosts überprüfen

Überprüfen Sie, ob die RabbitMQ-Ressource aktualisiert wurde:

```bash
kubectl get rabbitmq my-rabbitmq -o yaml | grep -A 20 "users:\|vhosts:"
```

Für eine eingehendere Überprüfung verbinden Sie sich mit einem RabbitMQ-Pod:

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl list_users
```

**Erwartetes Ergebnis:**

```console
Listing users ...
user	tags
admin	[administrator]
appuser	[]
monitoring	[]
```

Vhosts auflisten:

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl list_vhosts
```

**Erwartetes Ergebnis:**

```console
Listing vhosts ...
name
production
analytics
```

Berechtigungen eines Vhosts überprüfen:

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl list_permissions -p production
```

**Erwartetes Ergebnis:**

```console
Listing permissions for vhost "production" ...
user	configure	write	read
admin	.*	.*	.*
appuser	.*	.*	.*
monitoring		    	.*
```

### 5. AMQP-Verbindung testen

Öffnen Sie einen Port-Forward zum RabbitMQ-Service:

```bash
kubectl port-forward svc/my-rabbitmq 5672:5672
```

Testen Sie die Verbindung mit einem AMQP-Client (Beispiel mit Python `pika`):

```python
import pika

credentials = pika.PlainCredentials('appuser', 'AppUserPassword456')
connection = pika.BlockingConnection(
    pika.ConnectionParameters('127.0.0.1', 5672, 'production', credentials)
)
channel = connection.channel()
channel.queue_declare(queue='test-queue')
channel.basic_publish(exchange='', routing_key='test-queue', body='Hello Hikube!')
print("Nachricht erfolgreich gesendet")
connection.close()
```

Sie können auch über Port-Forward auf die Management UI zugreifen:

```bash
kubectl port-forward svc/my-rabbitmq 15672:15672
```

Dann öffnen Sie `http://127.0.0.1:15672` in Ihrem Browser und melden Sie sich mit dem Konto `admin` an.

## Überprüfung

Die Konfiguration ist erfolgreich, wenn:

- Die Benutzer in `rabbitmqctl list_users` erscheinen
- Die Vhosts in `rabbitmqctl list_vhosts` aufgelistet sind
- Die Berechtigungen dem Manifest entsprechen (`rabbitmqctl list_permissions`)
- Die Benutzer sich über AMQP auf ihrem jeweiligen Vhost verbinden können
- Die `readonly`-Benutzer keine Nachrichten veröffentlichen können

## Weiterführende Informationen

- **[RabbitMQ API-Referenz](../api-reference.md)**: Vollständige Dokumentation der Parameter `users` und `vhosts`
- **[RabbitMQ-Cluster skalieren](./scale-resources.md)**: Ressourcen und Anzahl der Replikate anpassen
