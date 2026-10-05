---
sidebar_position: 6
title: FAQ
---

# FAQ — RabbitMQ

### Qual è la differenza tra quorum queues e classic queues?

RabbitMQ propone due tipi principali di queue:

- **Quorum queues**: basate sul protocollo **Raft**, i dati vengono replicati su più nodi del cluster. Garantiscono la **durabilità** e l'**alta disponibilità** dei messaggi. Consigliate per la produzione.
- **Classic queues**: archiviate su un solo nodo, senza replica tra i nodi. In caso di guasto di tale nodo, i messaggi non sono più disponibili.

Il tipo di queue viene scelto dall'applicazione al momento della dichiarazione (argomento `x-queue-type: quorum`).

:::tip
Per beneficiare della replica delle quorum queues, crei il cluster con **3 (Max High Availability)** o **5 (Ultra High Availability)** repliche.
:::

### A cosa servono i virtual host (vhost)?

I **virtual host** (vhost) forniscono un **isolamento logico** all'interno di uno stesso cluster RabbitMQ:

- Ogni vhost possiede i propri exchange, queue e binding
- I diritti sono gestiti **per vhost**, il che permette di controllare l'accesso per applicazione
- Un utente può avere diritti diversi a seconda del vhost (**Administrator** su uno, **Read-only** su un altro)

I vhost si creano nella procedura guidata di creazione (passaggio **VHosts**) oppure in seguito con **Add a VHost** nella pagina del cluster. Consulti [Gestire vhost e utenti](./how-to/manage-vhosts-users.md).

### Come funzionano gli exchange in RabbitMQ?

Un **exchange** riceve i messaggi dai producer e li instrada verso le queue secondo regole di **binding**:

| **Tipo**    | **Comportamento**                                                                  |
| ----------- | ---------------------------------------------------------------------------------- |
| `direct`    | Instrada il messaggio verso la queue la cui **routing key** corrisponde esattamente |
| `fanout`    | Diffonde il messaggio a **tutte le queue** collegate, senza filtro                 |
| `topic`     | Instrada secondo un **pattern** di routing key (es. `orders.*`, `logs.#`)          |
| `headers`   | Instrada secondo gli **header** del messaggio anziché la routing key               |

Il producer pubblica verso un exchange, mai direttamente verso una queue. Exchange e binding vengono dichiarati dalle sue applicazioni.

### Su quale porta connettersi?

I client AMQP si connettono sulla porta **5672**, all'indirizzo mostrato nel campo **Host** della sezione **Connection** del cluster (quando l'**External Access** è attivato).

### È possibile cambiare il numero di repliche o il preset dopo la creazione?

No. Il **Number of replicas** (e quindi la modalità standalone o cluster) e il **Preset** sono fissati alla creazione. La versione, la dimensione del disco e l'accesso esterno restano modificabili. Consulti [Modificare la configurazione di un cluster](./how-to/scale-resources.md).

### Ho perso la password di un utente. Come posso recuperarla?

La password viene mostrata una sola volta e non può essere riletta. Ne generi una nuova con l'azione **Change Password** dell'utente, quindi aggiorni le sue applicazioni: la vecchia password viene revocata immediatamente.

### Quali diritti conferiscono « Administrator » e « Read-only »?

- **Administrator**: lettura, scrittura e configurazione sul vhost (dichiarare exchange e queue, pubblicare, consumare).
- **Read-only**: sola lettura sul vhost.

Un utente senza accesso a un vhost non può connettersi a esso.

### Come accedere all'interfaccia di management di RabbitMQ?

La console Hikube non offre l'accesso all'interfaccia web di management di RabbitMQ. Con l'**External Access**, la porta 15672 di questa interfaccia è raggiungibile all'indirizzo del cluster, in HTTP non cifrato, ma gli utenti creati dalla console non hanno il tag di amministrazione RabbitMQ che essa richiede: non possono quindi accedervi. Vhost e utenti si gestiscono dalla console; exchange e queue, dalle sue applicazioni. Per un'esigenza specifica, [contatti il supporto](mailto:support@hidora.io).

### Come viene stimato il costo di un cluster?

La procedura guidata di creazione mostra un **Estimated Cost** mensile e orario, calcolato in base al preset, al numero di repliche, alla dimensione del disco e all'accesso esterno. La fatturazione effettiva è calcolata sulle ore di utilizzo.
