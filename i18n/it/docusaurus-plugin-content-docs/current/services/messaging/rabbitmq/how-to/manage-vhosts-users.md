---
title: "Come gestire i vhost e gli utenti"
---

# Come gestire i vhost e gli utenti

Questa guida spiega come creare e gestire gli utenti, i virtual host (vhost) e i permessi RabbitMQ su Hikube in modo dichiarativo tramite i manifesti Kubernetes.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Un cluster **RabbitMQ** distribuito su Hikube (o un manifesto pronto per la distribuzione)
- (Opzionale) **rabbitmqadmin** o un browser per accedere alla Management UI

## Passi

### 1. Creare degli utenti

Gli utenti sono dichiarati nella sezione `users` del manifesto. Ogni utente è identificato da un nome e possiede una password.

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
Separate gli utenti per ruolo funzionale: un account **admin** per l'amministrazione, account **applicativi** per ogni servizio, e un account **monitoring** dedicato alla supervisione. Questo facilita l'audit e limita l'impatto in caso di compromissione.
:::

### 2. Creare dei vhost con permessi

I virtual host isolano le code, gli exchange e i binding tra diverse applicazioni o ambienti. Ogni vhost definisce dei ruoli `admin` (lettura/scrittura completa) e `readonly` (sola lettura).

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

**Ruoli disponibili:**

| Ruolo | Descrizione |
|-------|-------------|
| `admin` | Accesso completo: creare/eliminare code, pubblicare e consumare messaggi |
| `readonly` | Accesso in sola lettura: consumare messaggi, consultare le metriche |

:::tip
Isolate ogni applicazione in un vhost dedicato. Questo limita l'impatto in caso di sovraccarico di un'applicazione e facilita la gestione dei permessi.
:::

### 3. Applicare le modifiche

Combinate la configurazione completa in un unico manifesto:

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

### 4. Verificare gli utenti e i vhost

Verificate che la risorsa RabbitMQ sia stata aggiornata correttamente:

```bash
kubectl get rabbitmq my-rabbitmq -o yaml | grep -A 20 "users:\|vhosts:"
```

Per una verifica più approfondita, connettetevi a un pod RabbitMQ:

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl list_users
```

**Risultato atteso:**

```console
Listing users ...
user	tags
admin	[administrator]
appuser	[]
monitoring	[]
```

Elencate i vhost:

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl list_vhosts
```

**Risultato atteso:**

```console
Listing vhosts ...
name
production
analytics
```

Verificate i permessi di un vhost:

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl list_permissions -p production
```

**Risultato atteso:**

```console
Listing permissions for vhost "production" ...
user	configure	write	read
admin	.*	.*	.*
appuser	.*	.*	.*
monitoring		    	.*
```

### 5. Testare la connessione AMQP

Aprite un port-forward verso il servizio RabbitMQ:

```bash
kubectl port-forward svc/my-rabbitmq 5672:5672
```

Testate la connessione con un client AMQP (esempio con Python `pika`):

```python
import pika

credentials = pika.PlainCredentials('appuser', 'AppUserPassword456')
connection = pika.BlockingConnection(
    pika.ConnectionParameters('127.0.0.1', 5672, 'production', credentials)
)
channel = connection.channel()
channel.queue_declare(queue='test-queue')
channel.basic_publish(exchange='', routing_key='test-queue', body='Hello Hikube!')
print("Messaggio inviato con successo")
connection.close()
```

Potete anche accedere alla Management UI tramite port-forward:

```bash
kubectl port-forward svc/my-rabbitmq 15672:15672
```

Poi aprite `http://127.0.0.1:15672` nel vostro browser e connettetevi con l'account `admin`.

## Verifica

La configurazione è riuscita se:

- Gli utenti appaiono in `rabbitmqctl list_users`
- I vhost sono elencati in `rabbitmqctl list_vhosts`
- I permessi corrispondono al manifesto (`rabbitmqctl list_permissions`)
- Gli utenti possono connettersi tramite AMQP sul proprio vhost rispettivo
- Gli utenti `readonly` non possono pubblicare messaggi

## Per approfondire

- **[Riferimento API RabbitMQ](../api-reference.md)**: documentazione completa dei parametri `users` e `vhosts`
- **[Come scalare il cluster RabbitMQ](./scale-resources.md)**: regolare le risorse e il numero di repliche
