---
title: "Come riavviare un cluster — RabbitMQ"
sidebar_label: "Come riavviare un cluster"
---

# Come riavviare un cluster RabbitMQ

Questa guida spiega come riavviare un cluster RabbitMQ dalla [console Hikube](https://console.hikube.cloud), ad esempio quando un nodo non si comporta più normalmente.

## Prerequisiti

- Un **cluster RabbitMQ** con lo stato **Ready** nel suo progetto
- Il diritto di modificare questo cluster

## Cosa succede durante il riavvio

Tutti i pod del cluster vengono ricreati contemporaneamente:

- il cluster non è raggiungibile per qualche secondo, il tempo che i nodi si riavviino;
- le connessioni AMQP aperte vengono interrotte e i suoi client devono riconnettersi;
- i dati vengono conservati: vhost, utenti, code durevoli e i loro messaggi persistenti. Come per ogni riavvio di RabbitMQ, le code non durevoli e i messaggi non persistenti non sopravvivono.

L'indirizzo del campo **Host** non cambia.

:::warning
Pianifichi il riavvio in una finestra di manutenzione o al di fuori delle ore di punta, e verifichi che i suoi producer e consumer sappiano riconnettersi automaticamente.
:::

## Passaggi

### 1. Aprire la pagina del cluster

Nel menu **DB & Messaging** → **RabbitMQ**, faccia clic sul cluster.

### 2. Avviare il riavvio

1. Faccia clic su **Restart**, accanto ai pulsanti **Edit** e **Delete**.
2. La finestra «Restart `<name>`?» ricorda l'effetto del riavvio. Confermi con **Restart**.

Il messaggio «Restart started» conferma che la richiesta è stata accettata. Il riavvio prosegue in background.

:::note
Un cluster ancora in fase di creazione non ha ancora nulla da riavviare: la richiesta viene rifiutata. Attenda che il cluster abbia lo stato **Ready**, quindi rilanci il riavvio.
:::

## Verifica

Lo stato del cluster non cambia durante un riavvio: resta visualizzato come **Ready**. Verifichi nei log delle sue applicazioni che le connessioni siano state ristabilite e che il consumo dei messaggi sia ripreso.

## Per approfondire

- [Concetti](../concepts.md): quorum queues e alta disponibilità
- [Modificare la configurazione di un cluster](./scale-resources.md)
