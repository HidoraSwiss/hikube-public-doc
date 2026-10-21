---
title: "Come riavviare un cluster — PostgreSQL"
sidebar_label: "Come riavviare un cluster"
sidebar_position: 5
---

# Come riavviare un cluster

Questa guida spiega come riavviare un cluster PostgreSQL dalla [console Hikube](https://console.hikube.cloud), ad esempio quando un'istanza non si comporta più normalmente.

## Prerequisiti

- Un cluster **PostgreSQL** con lo stato **Ready** nel suo progetto
- Il diritto di modificare questo cluster

## Cosa succede durante il riavvio

Il riavvio è progressivo: prima si riavviano le repliche, poi il primario.

- Le letture continuano a essere servite per tutta la durata dell'operazione.
- Le scritture vengono sospese per una quarantina di secondi, il tempo che il primario si riavvii.
- I dati vengono conservati.

Su un cluster con 1 replica, nessun'altra istanza subentra: il database non è disponibile durante il riavvio.

:::warning
Pianifichi il riavvio in una finestra di manutenzione o al di fuori delle ore di punta, e verifichi che le sue applicazioni sappiano riconnettersi e ripetere una scrittura rifiutata.
:::

## Passaggi

### 1. Aprire la pagina del cluster

1. Apra **DB & Messaging** → **PostgreSQL**.
2. Nell'elenco **PostgreSQL Clusters**, apra il cluster.

### 2. Avviare il riavvio

1. Faccia clic su **Restart**, accanto ai pulsanti **Edit** e **Delete**.
2. La finestra «Restart `<name>`?» ricorda l'effetto del riavvio. Confermi con **Restart**.

Il messaggio «Restart started» conferma che la richiesta è stata accettata. Il riavvio prosegue in background.

:::note
Un cluster ancora in fase di creazione non ha ancora nulla da riavviare: la richiesta viene rifiutata. Dopo il passaggio allo stato **Ready**, attenda qualche minuto che il cluster finisca di avviarsi, quindi rilanci il riavvio.
:::

## Verifica

Lo stato del cluster non cambia durante un riavvio: resta visualizzato come **Ready**. Per confermare il riavvio, controlli l'ora di avvio del primario:

```bash
psql "host=<host> port=5432 dbname=<database> user=<utente> sslmode=require" \
  -c "SELECT pg_postmaster_start_time();"
```

L'ora restituita corrisponde al momento del riavvio.

## Per approfondire

- [Concetti PostgreSQL](../concepts.md): replica e alta disponibilità
- [Modificare le risorse di un cluster](./scale-resources.md)
