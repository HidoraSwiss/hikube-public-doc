---
sidebar_position: 3
title: Avvio rapido
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Creare un cluster RabbitMQ in 5 minuti

Questa guida la accompagna nella creazione del suo primo **cluster RabbitMQ** dalla [console Hikube](https://console.hikube.cloud), fino all'invio di un primo messaggio.

---

## Obiettivi

Al termine di questa guida, avrà:

- Un **cluster RabbitMQ** operativo nel suo progetto
- Un **vhost** e un **utente** con i relativi diritti
- La **password** di questo utente e l'**indirizzo di connessione** del cluster
- Un primo messaggio pubblicato con un client AMQP

---

## Prerequisiti

- Un **account Hikube** e un **progetto** (vedere l'[avvio rapido Hikube](../../../getting-started/quick-start.md))
- Una quota di progetto sufficiente per il cluster (CPU, memoria e storage)
- **Python 3** con il modulo `pika` installato, per il test del passo 5 (`pip install pika`)

---

## Passo 1: Aprire la procedura guidata di creazione

1. Acceda alla [console Hikube](https://console.hikube.cloud) e selezioni il suo progetto.
2. Nel menu laterale, apra **DB & Messaging** → **RabbitMQ**. Viene visualizzata la pagina **RabbitMQ Clusters**.
3. Faccia clic su **Create a cluster**. Si apre la procedura guidata **Create a RabbitMQ cluster**.

---

## Passo 2: Configurare e creare il cluster

La procedura guidata comprende cinque passaggi. Un banner mostra il costo stimato e, al passaggio **Configuration**, il consumo della quota del progetto.

### General

Inserisca il **Cluster Name** (viene proposto un nome predefinito). Deve contenere da 3 a 16 caratteri: lettere minuscole, cifre e trattini, iniziare con una lettera e terminare con una lettera o una cifra. Esempio: `rabbit-demo`.

### Configuration

| Campo | Valore consigliato per questa guida | Nota |
|-------|-------------------------------------|------|
| **RabbitMQ Version** | 4.2 | Versioni disponibili: 4.2, 4.1, 4.0, 3.13 |
| **Preset** | Small | Non modificabile dopo la creazione |
| **Disk size (GB)** | 10 | Capacità per nodo |
| **Number of replicas** | 3 (Max High Availability) | 1 (Standalone), 3 o 5; non modificabile dopo la creazione |
| **External access** | Attivato | Espone il cluster su Internet; necessario per il test dal suo computer |

:::note
Se la quota di storage del progetto viene superata, la console mostra « Storage quota exceeded for this project » e il pulsante **Next** resta inattivo. Riduca la dimensione o il numero di repliche, oppure faccia aumentare la quota del progetto.
:::

### VHosts

Inserisca un **VHost Name** (ad esempio `demo`) e faccia clic su **Add**. Per passare al passaggio successivo è necessario almeno un vhost.

### Users

1. In **Add a new user**, inserisca lo **Username** (ad esempio `app-user`; lettere minuscole, cifre e trattini).
2. In **VHost access**, scelga **Administrator** per il vhost `demo`.
3. Faccia clic su **Add user**.

Per continuare è necessario almeno un utente.

### Summary

Rilegga il riepilogo (nome, versione, preset, repliche, dimensione, rete **Public** o **Private**, costo stimato, numero di vhost e di utenti da creare), quindi faccia clic su **Create cluster**.

### Done: copiare la password

Al termine del deployment, la schermata **Done** mostra **Creation complete!** e, per ogni utente creato, la relativa **Password**.

:::warning Password mostrata una sola volta
Copi subito la password e la conservi in un gestore di password. Non verrà più mostrata dopo aver lasciato questa schermata. In caso di smarrimento, ne generi una nuova con l'azione **Change Password** (vedere [Gestire vhost e utenti](./how-to/manage-vhosts-users.md)).
:::

Faccia quindi clic su **Finish** per tornare all'elenco dei cluster.

---

## Passo 3: Verificare lo stato del cluster

1. Nell'elenco **RabbitMQ Clusters**, il cluster compare con lo stato **Creating**, poi **Ready** quando è operativo.
2. Faccia clic sul cluster per aprirne la pagina di dettaglio:
   - **General Information**: **Version**, **Replicas**, **Volume Size**;
   - **VHosts** e **Users**: gli elementi creati dalla procedura guidata;
   - **Connection**: **Host**, **Status** ed **External Access** (**Enabled** o **Disabled**).

---

## Passo 4: Recuperare le credenziali

Per connettersi, occorrono:

| Informazione | Dove trovarla |
|--------------|---------------|
| **Username** | Sezione **Users** della pagina del cluster |
| **Password** | Copiata nella schermata **Done** della procedura guidata (passo 2) |
| **VHost** | Sezione **VHosts** della pagina del cluster |
| **Host** | Campo **Host** della sezione **Connection** |
| **Porta** | 5672 (AMQP) |

Finché l'indirizzo non è assegnato, il campo **Host** mostra « Not available / Creating ». Una volta assegnato l'indirizzo, lo copi con il pulsante di copia.

:::note
Il campo **Host** viene compilato quando l'**External access** è attivato. Senza accesso esterno, il cluster resta raggiungibile dalle VM e dai cluster Kubernetes del progetto tramite un indirizzo interno, che la console non mostra: [contatti il supporto](mailto:support@hidora.io) per ottenerlo.
:::

Quando l'host è già noto, la schermata **Done** della procedura guidata mostra anche una stringa di connessione nella forma:

```text
amqp://app-user:<password>@<host>:5672
```

---

## Passo 5: Connessione e test

Crei lo script seguente sostituendo l'host e la password con i suoi valori:

```python title="test_rabbitmq.py"
import pika

credentials = pika.PlainCredentials('app-user', '<password>')
parameters = pika.ConnectionParameters(
    host='<host>',
    port=5672,
    virtual_host='demo',
    credentials=credentials,
)

connection = pika.BlockingConnection(parameters)
channel = connection.channel()

# Dichiarazione di una quorum queue (replicata sui nodi del cluster)
channel.queue_declare(queue='test', durable=True, arguments={'x-queue-type': 'quorum'})

# Invio di un messaggio
channel.basic_publish(exchange='', routing_key='test', body='Hello Hikube!')
print("Messaggio inviato con successo")

# Lettura del messaggio
method, properties, body = channel.basic_get(queue='test', auto_ack=True)
print(f"Messaggio ricevuto: {body.decode()}")

connection.close()
```

```bash
python test_rabbitmq.py
```

**Risultato atteso:**

```console
Messaggio inviato con successo
Messaggio ricevuto: Hello Hikube!
```

---

## Passo 6: Risoluzione rapida dei problemi

| Sintomo | Cause frequenti | Azione |
|---------|-----------------|--------|
| Il cluster resta in **Creating** | Provisioning in corso | Attenda qualche minuto; se lo stato non cambia, consulti la [risoluzione dei problemi](./troubleshooting.md) |
| Stato **Error** | Provisioning non riuscito | [Contatti il supporto](mailto:support@hidora.io) indicando il nome e l'identificativo del cluster |
| `ACCESS_REFUSED` alla connessione | Password errata, oppure utente senza diritti sul vhost | Verifichi il vhost in **Manage Access**; rigeneri la password se necessario |
| Connessione impossibile (timeout) | Accesso esterno disattivato, host o porta errati | Verifichi **External Access** e **Host** nella sezione **Connection**; la porta AMQP è 5672 |
| `NOT_FOUND - no vhost` | Nome del vhost errato nel client | Utilizzi esattamente il nome mostrato nella sezione **VHosts** |

---

## Passo 7: Pulizia

1. Apra la pagina di dettaglio del cluster e faccia clic su **Delete** (oppure, dall'elenco, apra il menu delle azioni del cluster e scelga **Delete cluster**).
2. Nella finestra di conferma, inserisca il nome esatto del cluster in **Resource name to confirm**.
3. Faccia clic su **Permanently delete**.

:::warning
Questa azione è irreversibile: il cluster, i suoi vhost, i suoi utenti e tutti i messaggi archiviati vengono eliminati definitivamente.
:::

---

## Riepilogo

Dalla console ha creato:

- Un cluster RabbitMQ di **3 nodi** in alta disponibilità
- Un **vhost** e un **utente amministratore** di tale vhost
- Una **connessione AMQP** funzionante dal suo computer

<NavigationFooter
  nextSteps={[
    {label: "Gestire vhost e utenti", href: "../how-to/manage-vhosts-users"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Tutti i servizi di messaggistica", href: "../../"},
  ]}
/>
