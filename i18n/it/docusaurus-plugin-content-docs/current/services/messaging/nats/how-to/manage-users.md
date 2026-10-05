---
title: "Come gestire gli utenti"
---

# Come gestire gli utenti NATS

:::info Disponibilità
NATS non è ancora disponibile in self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

Questa guida spiega come organizzare gli utenti di un cluster NATS su Hikube e come verificarne gli accessi dalla CLI `nats`.

Gli utenti (nome e password) fanno parte della configurazione dell'istanza. La loro creazione, eliminazione o il rinnovo della password vanno richiesti al supporto. Questa opzione non è disponibile nella console; contatti il supporto.

## Prerequisiti

- Un cluster **NATS** predisposto su Hikube e il suo URL (`<nats-url>`)
- La CLI **nats** installata in locale

## Procedura

### 1. Definire gli account necessari

Crei utenti distinti per ciascun utilizzo, per un controllo degli accessi granulare, ad esempio:

| Utente | Utilizzo |
|--------|----------|
| `admin` | Amministrazione (creazione di stream, report del server) |
| `appuser` | Account applicativo, uno per servizio |
| `monitoring` | Monitoraggio |

### 2. Richiedere la creazione degli utenti

Invii l'elenco degli utenti al [supporto](mailto:support@hidora.io), indicando il progetto e il nome dell'istanza. Il supporto le trasmette le password; le conservi in un gestore di password.

### 3. Testare la connessione con la CLI nats

Salvi un contesto per ciascun utente, quindi verifichi la pubblicazione:

```bash
nats context save hikube-admin --server <nats-url> --user admin --password <password-admin>
nats --context hikube-admin pub test "Hello from admin"
```

**Risultato atteso:**

```console
Published 16 bytes to "test"
```

**Test con una password errata:**

```bash
nats pub test "This should fail" --server <nats-url> --user admin --password wrongpassword
```

**Risultato atteso:**

```console
nats: error: Authorization Violation
```

:::warning
Se l'accesso esterno è attivato sull'istanza, il cluster NATS è raggiungibile da Internet. Si assicuri che tutti gli utenti dispongano di password robuste.
:::

### 4. Verificare le connessioni attive

Con un account che disponga dei diritti sufficienti, consulti le connessioni attive:

```bash
nats --context hikube-admin server report connections
```

:::note
I report `nats server …` richiedono l'accesso all'account di sistema del server NATS. Se il comando viene rifiutato, chieda al supporto lo stato delle connessioni.
:::

## Verifica

La configurazione è corretta se:

- Ogni utente può connettersi con la propria password
- Una password errata viene rifiutata (`Authorization Violation`)

## Per approfondire

- **[Concetti](../concepts.md)**: gestione degli utenti e JetStream
- **[Come configurare JetStream](./configure-jetstream.md)**: attivare la persistenza dei messaggi e lo streaming
