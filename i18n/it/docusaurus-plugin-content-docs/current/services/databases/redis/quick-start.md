---
sidebar_position: 3
title: Avvio rapido
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Distribuire Redis in 5 minuti

Questa guida la accompagna nella creazione del suo primo cluster **Redis** dalla [console Hikube](https://console.hikube.cloud), fino ai primi test con `redis-cli`.

---

## Obiettivi

Al termine di questa guida, avrà:

- Un cluster **Redis** distribuito nel suo progetto Hikube
- Una password di accesso generata dalla piattaforma
- Una connessione funzionante con `redis-cli`

---

## Prerequisiti

- Un **account Hikube** e un **progetto** con quote sufficienti (CPU, memoria, storage)
- Il client **`redis-cli`** installato sul suo computer, se desidera testare una connessione da Internet

---

## Passo 1: Creare il cluster

1. Acceda alla [console Hikube](https://console.hikube.cloud) e selezioni il suo progetto.
2. Nel menu laterale, apra **DB & Messaging** → **Redis**. Viene visualizzata la pagina **Redis Clusters**.
3. Faccia clic su **Create a cluster**. Si apre la procedura guidata **Create a Redis cluster**.

---

## Passo 2: Configurare e confermare

La procedura guidata comprende quattro passaggi: **General**, **Configuration**, **Summary** e **Done**.

### General

Inserisca il **Cluster Name**, ad esempio `demo-cache` (da 3 a 16 caratteri: minuscole, cifre e trattini; inizia con una lettera, termina con una lettera o una cifra). Faccia clic su **Next**.

### Configuration

| Campo | Valore consigliato per questa guida | Nota |
|-------|----------------------------------|----------|
| **Version** | `8 (Latest)` | Versioni proposte: 8 e 7 |
| **Preset** | `Small (1 CPU, 512Mi)` | Capacità allocata a ogni nodo |
| **Volume size (GB)** | `10` | Storage allocato a ogni nodo |
| **Number of replicas** | `3` | Da 1 a 8; minimo 2 per il failover automatico |
| **Public network** | Attivato | Necessario per connettersi dal suo computer |
| **Enable authentication** | Attivato | Attiva per impostazione predefinita; da mantenere |

Il banner nella parte superiore della procedura guidata mostra l'**Estimated Cost** e l'impatto sulle quote del progetto. Faccia clic su **Next**.

:::warning
Il **Number of replicas** non può più essere modificato dopo la creazione.
:::

### Summary

Rilegga il riepilogo (**Name**, **Version**, **Preset**, **Replicas**, **Storage size**, **Network**: **Public** o **Private**), quindi faccia clic su **Create**.

---

## Passo 3: Verificare lo stato

Il passaggio **Done** mostra «Cluster successfully created». Faccia clic su **Finish** per tornare all'elenco **Redis Clusters**, quindi apra il cluster.

| Stato | Significato |
|--------|---------------|
| **Creating** | Il cluster è in fase di provisioning |
| **Ready** / **Running** | Il cluster è operativo |
| **Error** / **Failed** | Il provisioning non è riuscito |

**Risultato atteso:** dopo alcuni minuti, la sezione **Connection** della pagina del cluster mostra lo **Status** **Ready** e l'**Host** del cluster.

---

## Passo 4: Recuperare le credenziali

Quando l'autenticazione è attivata, il passaggio **Done** della procedura guidata mostra, in **User Credentials**:

- l'utente **`default`**;
- la sua **Password**;
- la **Internal Connection String**: l'indirizzo del cluster, quando la rete pubblica è attivata.

:::warning
Copi subito la password: non verrà più mostrata. In caso di smarrimento, ne generi una nuova dalla sezione **Security** della pagina del cluster (**Rotate password**). Si veda [Rinnovare la password](./how-to/rotate-password.md).
:::

L'indirizzo resta consultabile nella pagina del cluster, sezione **Connection**, campo **Host** (pulsante di copia a destra).

---

## Passo 5: Connessione e test

```bash
export REDIS_HOST=<host>
export REDISCLI_AUTH='<password>'

# Test PING
redis-cli -h "$REDIS_HOST" -p 6379 ping
# PONG

# Creare una chiave
redis-cli -h "$REDIS_HOST" -p 6379 SET hello "hikube"
# OK

# Leggere la chiave
redis-cli -h "$REDIS_HOST" -p 6379 GET hello
# "hikube"
```

:::tip
La variabile `REDISCLI_AUTH` evita che la password compaia nella cronologia della shell, a differenza dell'opzione `-a`.
:::

---

## Passo 6: Risoluzione rapida dei problemi

### L'host mostra «Waiting for allocation...»

La rete pubblica è disattivata, oppure l'indirizzo IP pubblico non è ancora stato assegnato. Se necessario, attivi **External access** tramite **Edit**, quindi attenda qualche istante.

### `NOAUTH Authentication required` o `WRONGPASS`

La password è assente o errata. Verifichi la variabile `REDISCLI_AUTH`, oppure generi una nuova password dalla sezione **Security**.

### Il pulsante Next resta inattivo

La configurazione supera le quote del progetto. Riduca il preset, la dimensione del volume o il numero di repliche.

### Il cluster resta in Error

[Contatti il supporto](mailto:support@hidora.io) indicando il nome del progetto e del cluster.

---

## Passo 7: Pulizia

1. Apra la pagina del cluster (**DB & Messaging** → **Redis** → nome del cluster).
2. Faccia clic su **Delete**.
3. Inserisca il nome esatto del cluster nel campo **Resource name to confirm**, quindi faccia clic su **Permanently delete**.

:::warning
Questa azione elimina il cluster Redis e tutti i dati associati. È **irreversibile**.
:::

---

## Riepilogo

Dalla console ha creato:

- Un cluster **Redis** replicato, supervisionato da Sentinel
- Una password di accesso
- Una connessione `redis-cli` tramite la rete pubblica

<NavigationFooter
  nextSteps={[
    {label: "Alta disponibilità", href: "../how-to/configure-ha"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Tutti i database", href: "../../"},
  ]}
/>
