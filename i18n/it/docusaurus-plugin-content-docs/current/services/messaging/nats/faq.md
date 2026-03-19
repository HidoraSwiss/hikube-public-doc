---
sidebar_position: 6
title: FAQ
---

# FAQ — NATS

### È necessario attivare JetStream?

**JetStream** aggiunge la **persistenza**, lo **streaming** e il **replay** dei messaggi a NATS. Senza JetStream, NATS funziona in modalità **pub/sub puro** (fire-and-forget): i messaggi vengono trasmessi solo agli iscritti connessi al momento della pubblicazione.

JetStream è attivato per impostazione predefinita (`jetstream.enabled: true`). Disattivatelo solo se avete bisogno unicamente di messaggistica effimera senza persistenza:

```yaml title="nats.yaml"
jetstream:
  enabled: true
  size: 10Gi
```

:::tip
In produzione, mantenete sempre JetStream attivato per beneficiare della persistenza dei messaggi, della possibilità di rileggere gli eventi e dei consumer group durevoli.
:::

### Qual è la differenza tra pub/sub e queue group?

NATS propone due modelli di consumo:

- **Pub/sub classico**: ogni iscritto riceve **tutti i messaggi** pubblicati sul subject. Adatto alla diffusione (notifiche, log).
- **Queue group**: gli iscritti di uno stesso gruppo si **condividono i messaggi** (load balancing). Ogni messaggio viene consegnato a **un solo iscritto** del gruppo. Adatto all'elaborazione distribuita.

Più queue group possono iscriversi allo stesso subject — ogni gruppo riceve una copia di ogni messaggio, ma un solo membro per gruppo lo elabora.

### Come funzionano i wildcard nei subject?

NATS utilizza un sistema di subject gerarchici separati da punti (`.`). Sono disponibili due wildcard:

| **Wildcard** | **Descrizione**                        | **Esempio**                                                     |
| ------------ | -------------------------------------- | --------------------------------------------------------------- |
| `*`          | Corrisponde a **un solo token**        | `orders.*` corrisponde a `orders.new` ma non a `orders.new.urgent` |
| `>`          | Corrisponde a **uno o più token**      | `orders.>` corrisponde a `orders.new`, `orders.new.urgent`, ecc. |

Esempi:
- `logs.*`: riceve `logs.info`, `logs.error`, ma non `logs.app.error`
- `logs.>`: riceve `logs.info`, `logs.error`, `logs.app.error`, ecc.

### Qual è la differenza tra `resourcesPreset` e `resources`?

Il campo `resourcesPreset` applica una configurazione CPU/memoria predefinita, mentre `resources` permette di specificare valori espliciti. Se `resources` è definito, `resourcesPreset` viene **ignorato**.

| **Preset** | **CPU** | **Memoria** |
| ---------- | ------- | ----------- |
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Esempio con risorse esplicite:

```yaml title="nats.yaml"
replicas: 3
resources:
  cpu: 2000m
  memory: 2Gi
```

### NATS persiste i messaggi?

Per impostazione predefinita, NATS funziona in modalità **fire-and-forget**: i messaggi vengono trasmessi solo agli iscritti connessi al momento della pubblicazione. **Nessuna persistenza** avviene senza configurazione aggiuntiva.

Per persistere i messaggi, devono essere soddisfatte due condizioni:

1. **JetStream deve essere attivato** (`jetstream.enabled: true`)
2. **Uno stream deve essere creato** per catturare i messaggi dei subject interessati

Senza uno stream configurato, anche con JetStream attivato, i messaggi pubblicati su un subject senza stream associato non vengono persistiti.

### Come configurare NATS in modo avanzato?

Il campo `config.merge` consente di aggiungere o sovrascrivere parametri della configurazione NATS:

```yaml title="nats.yaml"
config:
  merge:
    max_payload: 8MB
    write_deadline: 2s
    debug: false
    trace: false
```

Parametri comuni:

| **Parametro**      | **Descrizione**                                          | **Default** |
| ------------------ | -------------------------------------------------------- | ----------- |
| `max_payload`      | Dimensione massima di un messaggio                       | 1MB         |
| `write_deadline`   | Timeout di scrittura verso un client                     | 2s          |
| `debug`            | Attiva i log di debug                                    | false       |
| `trace`            | Attiva il tracciamento dei messaggi (molto verboso)      | false       |

:::warning
Attivare `debug` e `trace` in produzione genera un volume di log considerevole. Utilizzateli solo per la diagnostica temporanea.
:::
