---
title: "Come rinnovare la password Redis"
sidebar_position: 3
---

# Come rinnovare la password Redis

Questa guida spiega come generare una nuova password per un cluster Redis dalla [console Hikube](https://console.hikube.cloud), ad esempio dopo lo smarrimento della password iniziale o nell'ambito di una rotazione periodica.

## Prerequisiti

- Un cluster **Redis** con l'autenticazione attivata
- L'elenco delle applicazioni che utilizzano questo cluster, per aggiornarle subito dopo la rotazione

:::warning
La rotazione revoca immediatamente la password attuale. Le applicazioni che la utilizzano ancora perdono l'accesso finché non vengono aggiornate.
:::

## Passaggi

### 1. Aprire la sezione Security

Apra **DB & Messaging** → **Redis**, quindi il cluster interessato. La sezione **Security** indica: «Generate a new global password for this cluster. This action will revoke the current password.»

### 2. Avviare la rotazione

1. Faccia clic su **Rotate password**.
2. Nella finestra **Rotate password**, confermi con **Perform rotation**.

### 3. Copiare la nuova password

La finestra **Generated password** mostra la nuova password. La copi nel suo gestore di password: non verrà più mostrata dopo la chiusura della finestra. Faccia clic su **Done**.

### 4. Aggiornare le applicazioni

Sostituisca la vecchia password nella configurazione delle sue applicazioni (variabili d'ambiente, secret Kubernetes dei suoi cluster, file di configurazione), quindi le riavvii se non rileggono la configurazione a caldo.

## Verifica

```bash
REDISCLI_AUTH='<nuova password>' redis-cli -h <host> -p 6379 ping
# PONG
```

## Per approfondire

- [Concetti Redis](../concepts.md): autenticazione
- [Risoluzione dei problemi Redis](../troubleshooting.md)
