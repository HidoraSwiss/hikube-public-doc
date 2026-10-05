---
sidebar_position: 3
title: Avvio rapido
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Iniziare con NATS

:::info Disponibilità
NATS non è ancora disponibile in self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

Questa guida spiega come ottenere un **cluster NATS** su Hikube ed eseguire i primi test di pubblicazione e consumo con la CLI `nats`.

---

## Obiettivi

Al termine di questa guida, avrà:

- Un **cluster NATS** predisposto nel suo progetto Hikube, con **JetStream** attivato
- Un **utente** per connettersi al cluster
- Creato uno stream, pubblicato e consumato un primo messaggio

---

## Prerequisiti

- Un **account Hikube** e un **progetto** (vedere l'[avvio rapido Hikube](../../../getting-started/quick-start.md))
- La **CLI NATS** (`nats`) installata sul suo computer, disponibile su [nats-io/natscli](https://github.com/nats-io/natscli)

---

## Passo 1: Preparare la richiesta

Raccolga i parametri dell'istanza desiderata:

| Parametro | Descrizione | Esempio |
|-----------|-------------|---------|
| Progetto | Progetto Hikube in cui creare l'istanza | `demo01` |
| Nome | Nome dell'istanza NATS | `events` |
| Repliche | Numero di server NATS (3 per l'alta disponibilità di JetStream) | `3` |
| Preset | Profilo CPU/memoria (vedere [Concetti](./concepts.md#preset-di-risorse)) | `small` |
| JetStream | Attivazione e dimensione del volume di persistenza | Attivato, `10 GB` |
| Utenti | Nomi degli account da creare | `user1` |
| Configurazione avanzata | Parametri NATS da regolare (`max_payload`, `write_deadline`…) | `max_payload: 16MB` |
| Accesso esterno | Esporre o meno il cluster all'esterno della piattaforma | No |

---

## Passo 2: Richiedere l'istanza

Invii questi parametri al supporto all'indirizzo [support@hidora.io](mailto:support@hidora.io), oppure tramite il pulsante **Contact support** del menu del profilo della console.

Il supporto le comunica in risposta:

- l'**URL del server** NATS (indicato come `<nats-url>` nel resto di questa guida);
- le **credenziali** degli utenti richiesti.

:::note
La porta client NATS standard è `4222`. Con l'accesso esterno, TLS viene attivato automaticamente: si connetta in `tls://` e consideri attendibile il certificato dell'autorità che il supporto le trasmette. Le password degli utenti sono generate dalla piattaforma. Utilizzi sempre l'indirizzo e la porta comunicati dal supporto.
:::

Per evitare di ripetere l'URL e le credenziali, salvi un contesto nella CLI:

```bash
nats context save hikube --server <nats-url> --user <utente> --password <password> --select
```

---

## Passo 3: Creare uno stream JetStream

```bash
nats stream add EVENTS \
  --subjects "events.*" --storage file --replicas 3 --retention limits \
  --max-msgs -1 --max-bytes -1 --max-age 24h --discard old --defaults
```

:::note
Il numero di repliche di uno stream non può superare il numero di server NATS dell'istanza.
:::

---

## Passo 4: Pubblicare e consumare un messaggio

```bash
# Pubblicare un messaggio
nats pub events.test "Hello Hikube!"

# Leggere il contenuto dello stream
nats stream view EVENTS
```

**Risultato atteso:**

```console
[1] Subject: events.test Received: 2025-01-15T10:30:00Z
  Hello Hikube!
```

---

## Passo 5: Risoluzione rapida dei problemi

### Connessione rifiutata

```bash
nats server check connection
```

**Cause frequenti:** URL o porta errati, credenziali errate (`Authorization Violation`), accesso esterno non attivato mentre ci si connette dall'esterno della piattaforma.

### JetStream non funzionante

```bash
nats account info
```

**Cause frequenti:** JetStream non attivato sull'istanza, spazio di archiviazione JetStream insufficiente, numero di repliche dello stream superiore al numero di server.

### Problema lato cluster

Se il cluster sembra non disponibile, [contatti il supporto](mailto:support@hidora.io) indicando il nome del progetto e dell'istanza.

---

## Passo 6: Pulizia

Elimini lo stream di test dalla CLI:

```bash
nats stream rm EVENTS -f
```

Per eliminare l'istanza stessa, invii la richiesta al [supporto](mailto:support@hidora.io) indicando il progetto e il nome dell'istanza.

:::warning
L'eliminazione di un cluster NATS cancella tutti i dati associati, compresi gli stream JetStream. Questa operazione è **irreversibile**.
:::

---

## Passi successivi

- **[Concetti](./concepts.md)**: modelli di comunicazione e JetStream
- **[Come configurare JetStream](./how-to/configure-jetstream.md)**: dimensionamento e gestione degli stream

<NavigationFooter
  nextSteps={[
    {label: "FAQ", href: "../faq"},
    {label: "Concetti", href: "../concepts"},
  ]}
  seeAlso={[
    {label: "Tutti i servizi di messaggistica", href: "../../"},
  ]}
/>
