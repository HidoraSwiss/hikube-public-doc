---
sidebar_position: 2
title: Avvio rapido
---

# Distribuire RabbitMQ in 5 minuti

Questa guida vi accompagna passo dopo passo nella distribuzione del vostro primo **cluster RabbitMQ** su Hikube, dal manifesto YAML fino ai primi test di messaggistica.

---

## Obiettivi

Al termine di questa guida, avrete:

- Un **cluster RabbitMQ** distribuito e operativo su Hikube
- **3 nodi RabbitMQ** replicati per l'alta disponibilità
- Un **vhost** e un **utente admin** configurati
- Un **archivio persistente** per i dati RabbitMQ
- Un accesso all'**interfaccia di gestione** (Management UI)

---

## Prerequisiti

Prima di iniziare, assicuratevi di avere:

- **kubectl** configurato con il vostro kubeconfig Hikube
- **Diritti di amministratore** sul vostro tenant
- Un **namespace** dedicato per ospitare il vostro cluster RabbitMQ
- **Python** con il modulo `pika` installato (opzionale, per i test)

---

## Passo 1: Creare il manifesto RabbitMQ

Create un file `rabbitmq.yaml` con la seguente configurazione:

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
Con 3 repliche, RabbitMQ utilizza le **quorum queue** per garantire la durabilità dei messaggi. Consultate il [Riferimento API](./api-reference.md) per la configurazione completa.
:::

---

## Passo 2: Distribuire il cluster RabbitMQ

Applicate il manifesto e verificate che la distribuzione sia avviata:

```bash
# Applicare il manifesto
kubectl apply -f rabbitmq.yaml
```

Verificate lo stato del cluster (può richiedere 2-3 minuti):

```bash
kubectl get rabbitmq
```

**Risultato atteso:**

```console
NAME      READY   AGE     VERSION
example   True    2m      0.10.0
```

---

## Passo 3: Verifica dei pod

Verificate che tutti i pod siano nello stato `Running`:

```bash
kubectl get pods | grep rabbitmq
```

**Risultato atteso:**

```console
rabbitmq-example-rabbitmq-server-0    1/1     Running   0   2m
rabbitmq-example-rabbitmq-server-1    1/1     Running   0   2m
rabbitmq-example-rabbitmq-server-2    1/1     Running   0   2m
```

Con `replicas: 3`, ottenete **3 nodi RabbitMQ** che formano un cluster ad alta disponibilità.

| Prefisso | Ruolo | Numero |
|----------|-------|--------|
| `rabbitmq-example-rabbitmq-server-*` | **RabbitMQ Server** (broker di messaggi + Management UI) | 3 |

---

## Passo 4: Recuperare le credenziali

Le password sono archiviate in Secret Kubernetes:

```bash
# Credenziali dell'utente definito nel manifesto
kubectl get secret rabbitmq-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Risultato atteso:**

```console
admin: strongpassword
```

Un utente predefinito viene anche creato automaticamente dall'operatore:

```bash
# Credenziali dell'utente predefinito
kubectl get secret rabbitmq-example-rabbitmq-default-user -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

---

## Passo 5: Connessione e test

### Accesso all'interfaccia di gestione (Management UI)

```bash
kubectl port-forward svc/rabbitmq-example-rabbitmq 15672:15672 &
```

Accedete all'interfaccia tramite il vostro browser: http://localhost:15672

Connettetevi con le credenziali dell'utente predefinito recuperate al passo 4.

### Test di messaggistica con Python

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

# Creazione di una coda
channel.queue_declare(queue='test')

# Invio di un messaggio
channel.basic_publish(exchange='', routing_key='test', body='Hello Hikube!')
print("Messaggio inviato con successo")

connection.close()
```

```bash
python test_rabbitmq.py
```

**Risultato atteso:**

```console
Messaggio inviato con successo
```

:::note
Se non avete `pika`, installatelo con `pip install pika`.
:::

---

## Passo 6: Risoluzione rapida dei problemi

### Pod in CrashLoopBackOff

```bash
# Verificare i log del pod in errore
kubectl logs rabbitmq-example-rabbitmq-server-0

# Verificare gli eventi del pod
kubectl describe pod rabbitmq-example-rabbitmq-server-0
```

**Cause frequenti:** memoria insufficiente (`resources.memory` troppo bassa), volume di archiviazione pieno, errore di risoluzione DNS tra i nodi.

### RabbitMQ non accessibile

```bash
# Verificare che i servizi esistano
kubectl get svc | grep rabbitmq

# Verificare il servizio RabbitMQ
kubectl describe svc rabbitmq-example-rabbitmq
```

**Cause frequenti:** port-forward non attivo, porta errata (5672 per AMQP, 15672 per Management UI), credenziali errate.

### Cluster non formato

```bash
# Verificare lo stato del cluster RabbitMQ
kubectl exec rabbitmq-example-rabbitmq-server-0 -- rabbitmqctl cluster_status

# Verificare i log di formazione del cluster
kubectl logs rabbitmq-example-rabbitmq-server-0 | grep -i cluster
```

**Cause frequenti:** problema di risoluzione DNS tra i nodi, cookie Erlang non sincronizzato, risorse insufficienti per il processo di formazione del cluster.

### Comandi di diagnostica generali

```bash
# Eventi recenti sul namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Stato dettagliato del cluster RabbitMQ
kubectl describe rabbitmq example
```

---

## Passo 7: Pulizia

Per eliminare le risorse di test:

```bash
kubectl delete -f rabbitmq.yaml
```

:::warning
Questa azione elimina il cluster RabbitMQ e tutti i dati associati. Questa operazione è **irreversibile**.
:::

---

## Riepilogo

Avete distribuito:

- Un cluster RabbitMQ con **3 nodi** in alta disponibilità
- Un **utente admin** e un **vhost** predefinito configurati
- Un'**interfaccia di gestione** (Management UI) accessibile localmente
- Un archivio persistente per la durabilità dei dati

---

## Prossimi passi

- **[Riferimento API](./api-reference.md)**: Configurazione completa di tutte le opzioni RabbitMQ
- **[Panoramica](./overview.md)**: Architettura dettagliata e casi d'uso RabbitMQ su Hikube
