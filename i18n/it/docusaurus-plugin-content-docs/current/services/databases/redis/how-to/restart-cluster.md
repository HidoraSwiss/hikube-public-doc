---
title: "Come riavviare un cluster Redis"
sidebar_position: 4
---

# Come riavviare un cluster Redis

Questa guida spiega come riavviare un cluster Redis dalla [console Hikube](https://console.hikube.cloud), in particolare per applicare una modifica dell'autenticazione o una nuova password.

## Quando riavviare

Alcune modifiche vengono salvate immediatamente, ma raggiungono i server Redis in esecuzione solo dopo un riavvio del cluster:

- l'attivazione o la disattivazione di **Authentication required** su un cluster esistente;
- la [rotazione della password](./rotate-password.md).

Fino ad allora, i server mantengono la configurazione precedente. Dopo l'attivazione dell'autenticazione, le connessioni senza password funzionano ancora; dopo una rotazione, i server accettano ancora la vecchia password e rifiutano la nuova.

Finché un riavvio è in sospeso, la pagina del cluster mostra il banner **Restart required**, con un pulsante **Restart now**.

## Prerequisiti

- Un cluster **Redis** con lo stato **Ready** nel suo progetto
- Il diritto di modificare questo cluster

## Cosa succede durante il riavvio

Tutte le istanze del cluster vengono riavviate contemporaneamente, sentinelle comprese:

- il cluster non è raggiungibile per circa un minuto;
- le connessioni aperte vengono interrotte e le sue applicazioni devono riconnettersi;
- i dati vengono conservati.

:::warning
Pianifichi il riavvio in una finestra di manutenzione o al di fuori delle ore di punta, e verifichi che le sue applicazioni sappiano riconnettersi automaticamente.
:::

## Passaggi

### 1. Aprire la pagina del cluster

1. Apra **DB & Messaging** → **Redis**.
2. Apra il cluster.

### 2. Avviare il riavvio

1. Faccia clic su **Restart**, accanto ai pulsanti **Edit** e **Delete**. Se è visualizzato il banner **Restart required**, il suo pulsante **Restart now** ha lo stesso effetto.
2. La finestra «Restart `<name>`?» ricorda l'effetto del riavvio. Confermi con **Restart**.

Il messaggio «Restart started» conferma che la richiesta è stata accettata. Il riavvio prosegue in background.

La console propone il riavvio anche al momento opportuno:

- dopo aver salvato una modifica dell'autenticazione da **Edit**: confermi con **Restart**, oppure faccia clic su **Later** per rimandarlo; il banner **Restart required** resta allora sulla pagina del cluster;
- nella finestra che mostra la nuova password dopo una rotazione, con il pulsante **Restart now**.

:::note
Un cluster ancora in fase di creazione non ha ancora nulla da riavviare: la richiesta viene rifiutata. Dopo il passaggio allo stato **Ready**, attenda qualche minuto che il cluster finisca di avviarsi, quindi rilanci il riavvio.
:::

## Verifica

Lo stato del cluster non cambia durante un riavvio: resta visualizzato come **Ready**. Il banner **Restart required** scompare una volta preso in carico il riavvio. Controlli poi che l'istanza si sia appena riavviata:

```bash
REDISCLI_AUTH='<password>' redis-cli -h <host> -p 6379 INFO server | grep uptime_in_seconds
```

Dopo una modifica dell'autenticazione o della password, verifichi anche che la nuova configurazione sia applicata:

```bash
# Autenticazione attivata: una connessione senza password viene rifiutata
redis-cli -h <host> -p 6379 ping
# NOAUTH Authentication required.

# Nuova password accettata
REDISCLI_AUTH='<nuova password>' redis-cli -h <host> -p 6379 ping
# PONG
```

## Per approfondire

- [Rinnovare la password](./rotate-password.md)
- [Modificare le risorse di un cluster Redis](./scale-resources.md)
- [Risoluzione dei problemi Redis](../troubleshooting.md)
