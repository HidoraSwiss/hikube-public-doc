---
title: "Come rinnovare la password Redis"
sidebar_position: 3
---

# Come rinnovare la password Redis

Questa guida spiega come generare una nuova password per un cluster Redis dalla [console Hikube](https://console.hikube.cloud), ad esempio dopo lo smarrimento della password iniziale o nell'ambito di una rotazione periodica.

## Prerequisiti

- Un cluster **Redis** con l'autenticazione attivata. Su un cluster senza autenticazione, la rotazione viene rifiutata: attivi prima **Authentication required** da **Edit** (si veda [Modificare le risorse](./scale-resources.md)).
- L'elenco delle applicazioni che utilizzano questo cluster, per aggiornarle subito dopo il riavvio

:::warning
La nuova password si applica solo dopo un [riavvio del cluster](./restart-cluster.md). Fino ad allora, i server Redis accettano ancora la vecchia password e rifiutano la nuova. Il riavvio interrompe brevemente il cluster (circa un minuto): pianifichi la rotazione in una finestra di manutenzione.
:::

## Passaggi

### 1. Aprire la sezione Security

Apra **DB & Messaging** → **Redis**, quindi il cluster interessato. La sezione **Security** permette di generare una nuova password globale per questo cluster.

### 2. Avviare la rotazione

1. Faccia clic su **Rotate password**.
2. Nella finestra **Rotate password**, confermi con **Perform rotation**.

### 3. Copiare la nuova password

La finestra **Generated password** mostra la nuova password. La copi nel suo gestore di password: non verrà più mostrata dopo la chiusura della finestra.

La finestra ricorda: «The new password is accepted only after the cluster restarts; until then, the servers still accept the previous one.»

### 4. Riavviare il cluster

1. Nella stessa finestra, faccia clic su **Restart now**, quindi confermi con **Restart**.
2. Per riavviare più tardi, faccia clic su **Done**: la pagina del cluster mostra il banner **Restart required** fino al riavvio, con un pulsante **Restart now**.

Il cluster non è raggiungibile per circa un minuto. Si veda [Riavviare un cluster](./restart-cluster.md).

### 5. Aggiornare le applicazioni

Una volta riavviato il cluster, sostituisca la vecchia password nella configurazione delle sue applicazioni (variabili d'ambiente, secret Kubernetes dei suoi cluster, file di configurazione), quindi le riavvii se non rileggono la configurazione a caldo. Prima del riavvio del cluster, la nuova password viene ancora rifiutata.

## Verifica

```bash
REDISCLI_AUTH='<nuova password>' redis-cli -h <host> -p 6379 ping
# PONG
```

Se il comando risponde `WRONGPASS`, il cluster non è ancora stato riavviato: verifichi se sulla pagina del cluster è visualizzato il banner **Restart required**.

## Per approfondire

- [Riavviare un cluster](./restart-cluster.md)
- [Concetti Redis](../concepts.md): autenticazione
- [Risoluzione dei problemi Redis](../troubleshooting.md)
