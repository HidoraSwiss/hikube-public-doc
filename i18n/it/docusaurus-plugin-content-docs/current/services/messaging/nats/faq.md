---
sidebar_position: 6
title: FAQ
---

# FAQ — NATS

:::info Disponibilità
NATS non è ancora disponibile in self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

### Come ottenere un cluster NATS?

Invii la richiesta al [supporto](mailto:support@hidora.io) con i parametri dell'istanza (repliche, preset, JetStream, utenti, accesso esterno). L'[avvio rapido](./quick-start.md) elenca le informazioni da preparare.

### È necessario attivare JetStream?

**JetStream** aggiunge a NATS la **persistenza**, lo **streaming** e il **replay** dei messaggi. Senza JetStream, NATS funziona in modalità **pub/sub puro** (fire-and-forget): i messaggi vengono trasmessi solo ai subscriber connessi al momento della pubblicazione.

:::tip
In produzione, mantenga JetStream attivato per beneficiare della persistenza dei messaggi, della possibilità di rieseguire gli eventi e dei consumer durevoli.
:::

L'attivazione di JetStream e la dimensione del suo volume fanno parte della configurazione dell'istanza. Questa opzione non è disponibile nella console; contatti il supporto.

### Qual è la differenza tra pub/sub e queue group?

NATS propone due modelli di consumo:

- **Pub/sub classico**: ogni subscriber riceve **tutti i messaggi** pubblicati sul subject. Adatto alla diffusione (notifiche, log).
- **Queue groups**: i subscriber di uno stesso gruppo si **ripartiscono i messaggi** (load balancing). Ogni messaggio viene consegnato a **un solo subscriber** del gruppo. Adatto all'elaborazione distribuita.

Più queue group possono iscriversi allo stesso subject: ogni gruppo riceve una copia di ciascun messaggio, ma un solo membro per gruppo lo elabora.

### Come funzionano i caratteri jolly nei subject?

NATS utilizza un sistema di subject gerarchici separati da punti (`.`). Sono disponibili due caratteri jolly:

| **Carattere jolly** | **Descrizione**                          | **Esempio**                                                         |
| ------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| `*`                 | Corrisponde a **un solo token**          | `orders.*` corrisponde a `orders.new` ma non a `orders.new.urgent`  |
| `>`                 | Corrisponde a **uno o più token**        | `orders.>` corrisponde a `orders.new`, `orders.new.urgent`, ecc.    |

Esempi:
- `logs.*`: riceve `logs.info`, `logs.error`, ma non `logs.app.error`
- `logs.>`: riceve `logs.info`, `logs.error`, `logs.app.error`, ecc.

### Quali preset di risorse sono disponibili?

| **Preset** | **CPU** | **Memoria** |
| ---------- | ------- | ----------- |
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

È possibile richiedere anche valori espliciti di CPU/memoria, che in tal caso sostituiscono il preset. Questa opzione non è disponibile nella console; contatti il supporto.

### NATS rende persistenti i messaggi?

Per impostazione predefinita, NATS funziona in modalità **fire-and-forget**: i messaggi vengono trasmessi solo ai subscriber connessi al momento della pubblicazione. Senza configurazione aggiuntiva **non avviene alcuna persistenza**.

Per rendere persistenti i messaggi, devono essere soddisfatte due condizioni:

1. **JetStream deve essere attivato** sull'istanza
2. **Deve essere creato uno stream** (ad esempio con `nats stream add`) per acquisire i messaggi dei subject interessati

Anche con JetStream attivato, i messaggi pubblicati su un subject senza stream associato non vengono resi persistenti.

### È possibile regolare la configurazione del server NATS?

Alcuni parametri del server possono essere regolati a livello di istanza:

| **Parametro**      | **Descrizione**                                          | **Predefinito** |
| ------------------ | -------------------------------------------------------- | --------------- |
| `max_payload`      | Dimensione massima di un messaggio                       | 1MB             |
| `write_deadline`   | Timeout di scrittura verso un client                     | 2s              |
| `debug`            | Attiva i log di debug                                    | false           |
| `trace`            | Attiva il tracciamento dei messaggi (molto verboso)      | false           |

Questa opzione non è disponibile nella console; contatti il supporto.

:::warning
Attivare `debug` e `trace` in produzione genera un volume di log considerevole. Li richieda solo per una diagnosi temporanea.
:::
