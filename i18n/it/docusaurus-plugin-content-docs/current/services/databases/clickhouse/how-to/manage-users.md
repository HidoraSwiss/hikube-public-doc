---
title: "Come gestire utenti e profili ClickHouse"
sidebar_position: 1
---

# Come gestire utenti e profili ClickHouse

:::info Disponibilità
ClickHouse non è ancora disponibile in modalità self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

Questa guida presenta le opzioni di gestione degli utenti di un'istanza ClickHouse Hikube e il modo per verificarne i permessi.

## Opzioni disponibili

Gli utenti di un'istanza ClickHouse vengono definiti dalla piattaforma, su richiesta al supporto. Per ogni utente, precisi:

| Opzione | Descrizione |
|---------|-------------|
| Nome utente | Identificativo di accesso |
| Accesso | **Completo** (lettura e scrittura) o **sola lettura** (solo query `SELECT`) |

Anche la conservazione dei log delle query (`system.query_log`, `system.query_thread_log`) e la dimensione dello storage a essi dedicato si impostano su richiesta.

:::tip
Crei un utente in sola lettura per gli strumenti di analisi e reporting (Grafana, Metabase, ecc.). In questo modo si limitano i rischi di modifica accidentale dei dati.
:::

## Passaggi

### 1. Richiedere la creazione o la modifica di un utente

[Contatti il supporto](mailto:support@hidora.io) indicando il progetto, il nome dell'istanza, il nome dell'utente e il livello di accesso desiderato.

### 2. Connettersi con clickhouse-client

```bash
clickhouse-client --host <host> --port 9000 --user analyst --password
```

### 3. Verificare i permessi

Una volta connesso con un utente in sola lettura, verifichi che la scrittura sia bloccata:

```sql
-- Questa query deve riuscire (lettura autorizzata)
SELECT count() FROM system.tables;

-- Questa query deve fallire (scrittura vietata)
CREATE TABLE test_write (id UInt32) ENGINE = Memory;
```

L'utente in sola lettura riceve un errore del tipo:

```console
Code: 164. DB::Exception: analyst: Not enough privileges.
```

## Verifica

```sql
SHOW GRANTS;
```

## Per approfondire

- [Concetti ClickHouse](../concepts.md)
- [Risoluzione dei problemi](../troubleshooting.md)
