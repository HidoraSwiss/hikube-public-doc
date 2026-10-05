---
title: "Come configurare JetStream"
---

# Come configurare JetStream

:::info Disponibilità
NATS non è ancora disponibile in self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

Questa guida spiega come dimensionare **JetStream** su un cluster NATS Hikube e poi come creare e utilizzare gli stream dalla CLI `nats`. JetStream fornisce la persistenza dei messaggi, lo streaming e il replay con garanzie di consegna.

L'attivazione di JetStream, la dimensione del suo volume e la configurazione avanzata del server fanno parte della configurazione dell'istanza. Questa opzione non è disponibile nella console; contatti il supporto.

## Prerequisiti

- Un cluster **NATS** predisposto su Hikube, il suo URL (`<nats-url>`) e delle credenziali
- La CLI **nats** installata in locale, con un contesto salvato (vedere l'[avvio rapido](../quick-start.md))

## Procedura

### 1. Dimensionare lo storage JetStream

| Parametro | Descrizione |
|-----------|-------------|
| JetStream attivato | Attiva o disattiva la persistenza sull'istanza |
| Dimensione del volume | Spazio su disco riservato ai dati JetStream |

Il dimensionamento del volume dipende dal caso d'uso:

- **Messaggi effimeri** (TTL breve, alcune ore): da 10 a 20 GB
- **Conservazione lunga** (giorni, settimane): da 50 a 100 GB
- **Stream voluminosi** (eventi, log): 100 GB e oltre

:::tip
In produzione preveda almeno 3 repliche per beneficiare del consenso Raft di JetStream. Ciò garantisce l'alta disponibilità e la durabilità degli stream in caso di guasto di un nodo.
:::

:::warning
La riduzione del volume JetStream su un'istanza esistente può causare una perdita di dati. Preveda un margine sufficiente in fase di dimensionamento iniziale.
:::

### 2. Regolare la configurazione del server (opzionale)

I parametri seguenti possono essere regolati a livello di istanza:

| Parametro | Descrizione | Predefinito |
|-----------|-------------|-------------|
| `max_payload` | Dimensione massima di un messaggio | `1MB` |
| `write_deadline` | Tempo massimo per scrivere una risposta al client | `2s` |
| `debug` | Attiva i log di debug | `false` |
| `trace` | Attiva il tracciamento dei messaggi (molto verboso) | `false` |

:::note
`debug` e `trace` si giustificano solo per una risoluzione temporanea dei problemi. Queste opzioni generano un volume elevato di log e possono influire sulle prestazioni.
:::

Trasmetta la dimensione desiderata ed eventuali parametri al [supporto](mailto:support@hidora.io), indicando il progetto e il nome dell'istanza.

### 3. Creare uno stream

Una volta attivato JetStream, crei uno stream dalla CLI:

```bash
nats stream add EVENTS \
  --subjects "events.>" \
  --storage file \
  --retention limits \
  --max-msgs -1 \
  --max-bytes -1 \
  --max-age 72h \
  --replicas 3 \
  --defaults
```

**Risultato atteso:**

```console
Stream EVENTS was created

Information:

  Subjects: events.>
  Replicas: 3
  Storage:  File
  Retention: Limits
  ...
```

### 4. Testare lo stream

Pubblichi un messaggio:

```bash
nats pub events.test "Hello JetStream"
```

Consumi il messaggio:

```bash
nats sub "events.>" --count 1
```

**Risultato atteso:**

```console
[#1] Received on "events.test"
Hello JetStream
```

Verifichi lo stato dello stream:

```bash
nats stream info EVENTS
```

## Verifica

La configurazione è corretta se:

- `nats account info` indica che JetStream è disponibile
- È possibile creare uno stream con il numero di repliche desiderato
- I messaggi pubblicati vengono resi persistenti e possono essere consumati
- `nats stream info` mostra il numero corretto di repliche e la politica di conservazione configurata

## Per approfondire

- **[Concetti](../concepts.md)**: modelli di comunicazione e JetStream
- **[Come gestire gli utenti NATS](./manage-users.md)**: account di accesso al cluster
