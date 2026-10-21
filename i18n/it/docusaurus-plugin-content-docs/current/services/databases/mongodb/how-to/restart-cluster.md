---
title: "Come riavviare un cluster — MongoDB"
sidebar_label: "Come riavviare un cluster"
sidebar_position: 4
---

# Come riavviare un cluster

Questa guida spiega come riavviare un cluster MongoDB dalla [console Hikube](https://console.hikube.cloud), ad esempio quando un membro non si comporta più normalmente.

## Prerequisiti

- Un cluster **MongoDB** con lo stato **Ready** nel suo progetto
- Il diritto di modificare questo cluster

## Cosa succede durante il riavvio

Tutti i pod del cluster vengono ricreati contemporaneamente:

- il cluster non è raggiungibile per qualche secondo, il tempo che i membri si riavviino;
- le connessioni aperte vengono interrotte e le sue applicazioni devono riconnettersi;
- i dati vengono conservati.

Su un cluster con sharding, i router `mongos` non vengono riavviati.

:::warning
Pianifichi il riavvio in una finestra di manutenzione o al di fuori delle ore di punta, e verifichi che le sue applicazioni sappiano riconnettersi automaticamente.
:::

## Passaggi

### 1. Aprire la pagina del cluster

1. Apra **DB & Messaging** → **MongoDB**.
2. Apra il cluster.

### 2. Avviare il riavvio

1. Faccia clic su **Restart**, accanto ai pulsanti **Edit** e **Delete**.
2. La finestra «Restart `<name>`?» ricorda l'effetto del riavvio. Confermi con **Restart**.

Il messaggio «Restart started» conferma che la richiesta è stata accettata. Il riavvio prosegue in background.

:::note
Un cluster ancora in fase di creazione non ha ancora nulla da riavviare: la richiesta viene rifiutata. Attenda che il cluster abbia lo stato **Ready**, quindi rilanci il riavvio.
:::

## Verifica

Lo stato del cluster non cambia durante un riavvio: resta visualizzato come **Ready**. Per confermare il riavvio, controlli da quanti secondi il membro è in esecuzione:

```bash
mongosh "mongodb://<host>:27017/admin?directConnection=true&authSource=admin" --username <utente> \
  --eval "db.serverStatus().uptime"
```

Un valore basso conferma che il membro si è appena riavviato.

## Per approfondire

- [Concetti MongoDB](../concepts.md): replicazione, alta disponibilità e sharding
- [Modificare le risorse di un cluster](./scale-resources.md)
