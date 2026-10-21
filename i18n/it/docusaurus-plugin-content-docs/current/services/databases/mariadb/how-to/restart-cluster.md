---
title: "Come riavviare un cluster — MariaDB"
sidebar_label: "Come riavviare un cluster"
sidebar_position: 5
---

# Come riavviare un cluster

Questa guida spiega come riavviare un cluster MariaDB dalla [console Hikube](https://console.hikube.cloud), ad esempio quando un'istanza non si comporta più normalmente.

## Prerequisiti

- Un cluster **MariaDB** con lo stato **Ready** nel suo progetto
- Il diritto di modificare questo cluster

## Cosa succede durante il riavvio

Tutte le istanze del cluster vengono riavviate contemporaneamente:

- il cluster non è raggiungibile per qualche secondo, il tempo che le istanze si riavviino;
- le connessioni aperte vengono interrotte e le sue applicazioni devono riconnettersi;
- i dati vengono conservati.

:::warning
Pianifichi il riavvio in una finestra di manutenzione o al di fuori delle ore di punta, e verifichi che le sue applicazioni sappiano riconnettersi automaticamente.
:::

## Passaggi

### 1. Aprire la pagina del cluster

1. Apra **DB & Messaging** → **MariaDB**.
2. Apra il cluster.

### 2. Avviare il riavvio

1. Faccia clic su **Restart**, accanto ai pulsanti **Edit** e **Delete**.
2. La finestra «Restart `<name>`?» ricorda l'effetto del riavvio. Confermi con **Restart**.

Il messaggio «Restart started» conferma che la richiesta è stata accettata. Il riavvio prosegue in background.

:::note
Un cluster ancora in fase di creazione non ha ancora nulla da riavviare: la richiesta viene rifiutata. Dopo il passaggio allo stato **Ready**, attenda qualche minuto che il cluster finisca di avviarsi, quindi rilanci il riavvio.
:::

## Verifica

Lo stato del cluster non cambia durante un riavvio: resta visualizzato come **Ready**. Per confermare il riavvio, controlli da quanti secondi l'istanza è in esecuzione:

```bash
mysql -h <host> -P 3306 -u <utente> -p -e "SHOW GLOBAL STATUS LIKE 'Uptime';"
```

Un valore basso conferma che l'istanza si è appena riavviata.

## Per approfondire

- [Concetti MariaDB](../concepts.md): replica e alta disponibilità
- [Modificare le risorse di un cluster](./scale-resources.md)
