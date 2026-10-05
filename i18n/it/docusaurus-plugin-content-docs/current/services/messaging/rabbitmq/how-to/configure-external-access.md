---
title: "Come configurare l'accesso esterno"
---

# Come configurare l'accesso esterno

Per impostazione predefinita, un cluster RabbitMQ non è esposto su Internet. L'opzione **External access** espone il cluster su un indirizzo pubblico, affinché applicazioni situate al di fuori di Hikube (o il suo computer) possano connettersi in AMQP.

## Prerequisiti

- Un **cluster RabbitMQ** creato nel suo progetto, oppure la procedura guidata di creazione aperta
- Almeno un **utente** RabbitMQ e la relativa password

## Attivare l'accesso esterno alla creazione

Al passaggio **Configuration** della procedura guidata **Create a RabbitMQ cluster**, attivi **External access**. Il riepilogo del passaggio **Summary** indica allora **Public** nella riga **Network** (anziché **Private**).

## Attivare o disattivare l'accesso esterno su un cluster esistente

1. Apra la pagina del cluster e faccia clic su **Edit**.
2. Attivi o disattivi l'interruttore **External access**.
3. Faccia clic su **Save**.

## Recuperare l'indirizzo pubblico

1. Apra la pagina del cluster.
2. Nella sezione **Connection**, verifichi che **External Access** indichi **Enabled**.
3. Copi il valore del campo **Host**. Finché l'indirizzo non è assegnato, il campo mostra « Not available / Creating ».

I suoi client si connettono quindi a questo host, porta **5672**:

```text
amqp://<utente>:<password>@<host>:5672/<vhost>
```

La connessione AMQP non è cifrata: TLS (AMQPS, porta 5671) non è disponibile. L'indirizzo pubblico espone anche le porte 15672 (interfaccia di management) e 15692 (metriche Prometheus).

## Buone pratiche di sicurezza

:::warning
Un cluster con accesso esterno è raggiungibile da Internet. Non condivida uno stesso utente tra più applicazioni e ne rinnovi la password con **Change Password** in caso di dubbio.
:::

- Disattivi l'**External access** se il cluster è utilizzato solo da applicazioni interne al suo progetto: credenziali e messaggi transitano in chiaro su Internet.
- Assegni il diritto **Read-only** alle applicazioni che si limitano a consumare.
- Elimini gli utenti inutilizzati.

## Verifica

Da un computer esterno, verifichi l'apertura della porta AMQP:

```bash
nc -zv <host> 5672
```

Quindi esegua lo script di test del passo 5 dell'[avvio rapido](../quick-start.md).

## Per approfondire

- [Gestire vhost e utenti](./manage-vhosts-users.md)
- [Modificare la configurazione di un cluster](./scale-resources.md)
