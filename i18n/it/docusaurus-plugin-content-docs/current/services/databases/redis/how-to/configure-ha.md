---
title: "Come configurare l'alta disponibilità Redis"
sidebar_position: 1
---

# Come configurare l'alta disponibilità Redis

Questa guida spiega come creare un cluster Redis ad alta disponibilità dalla [console Hikube](https://console.hikube.cloud). Il servizio utilizza **Redis Sentinel** per garantire il failover automatico non appena il cluster conta almeno 2 repliche. Vengono sempre distribuiti tre Sentinel, qualunque sia il numero di repliche.

## Prerequisiti

- Un **progetto** Hikube con quote sufficienti: il consumo di CPU, memoria e storage è moltiplicato per il numero di repliche
- Conoscenza delle basi di Redis (si veda l'[avvio rapido](../quick-start.md))

:::warning
L'alta disponibilità si decide **alla creazione**: il numero di repliche non può più essere modificato in seguito. Per trasformare un cluster esistente, [contatti il supporto](mailto:support@hidora.io) oppure crei un nuovo cluster.
:::

## Passaggi

### 1. Aprire la procedura guidata

Apra **DB & Messaging** → **Redis**, quindi faccia clic su **Create a cluster**. Compili il **Cluster Name** e faccia clic su **Next**.

### 2. Configurare almeno 3 repliche

Nel passaggio **Configuration**:

| Campo | Valore consigliato in produzione |
|-------|----------------------------------|
| **Number of replicas** | `3` (oppure `5` per tollerare due guasti) |
| **Preset** | `medium` o superiore, in base alla dimensione del dataset |
| **Volume size (GB)** | Superiore al volume di dati previsto |
| **Enable authentication** | Attivato |
| **Public network** | Disattivato, salvo necessità di accesso da Internet |

:::tip
Il quorum si basa sui tre Sentinel, non sul numero di repliche: 2 repliche sono sufficienti per il failover, 3 o più consentono di tollerare un numero maggiore di guasti.
:::

### 3. Creare il cluster

Nel passaggio **Summary**, controlli la riga **Replicas** e il costo stimato, quindi faccia clic su **Create**. Copi la password mostrata nel passaggio **Done**.

### 4. Comprendere il failover automatico

Quando il master diventa indisponibile:

1. I Sentinel rilevano il guasto e si accordano tramite quorum.
2. Una replica viene promossa a nuovo master.
3. Le altre repliche vengono riconfigurate per seguirlo.

Con la rete pubblica attivata, l'indirizzo mostrato nel campo **Host** punta al master corrente: i suoi client non devono cambiare indirizzo dopo un failover, ma le connessioni aperte vengono interrotte e devono essere ristabilite.

:::note
Configuri i suoi client Redis con la riconnessione automatica e tempi di nuovo tentativo, in modo da assorbire la commutazione.
:::

## Verifica

- Nella pagina del cluster, sezione **General**, il campo **Replicas** mostra il numero scelto.
- La sezione **Connection** mostra lo **Status** **Ready**.
- Da un client, verifichi il ruolo del nodo raggiunto:

```bash
redis-cli -h <host> -p 6379 INFO replication
```

**Risultato atteso:** `role:master` e `connected_slaves` pari al numero di repliche meno uno.

## Per approfondire

- [Concetti Redis](../concepts.md): Sentinel, persistenza, autenticazione
- [Modificare le risorse](./scale-resources.md)
