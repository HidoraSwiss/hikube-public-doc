---
sidebar_position: 3
title: Avvio rapido
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Iniziare con ClickHouse

:::info Disponibilità
ClickHouse non è ancora disponibile in modalità self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

Questa guida descrive le informazioni da preparare per richiedere un'istanza **ClickHouse** e i primi passi con `clickhouse-client` una volta consegnata l'istanza.

---

## Obiettivi

Al termine di questa guida avrà:

- Una richiesta di provisioning completa, con la topologia adatta alle sue esigenze
- Una connessione funzionante con `clickhouse-client`
- Una prima tabella analitica

---

## Prerequisiti

- Un **account Hikube** e un **progetto** con quote sufficienti
- Il client **`clickhouse-client`** installato sul suo computer

---

## Passo 1: Definire la topologia

Scelga il numero di **shard** e di **repliche** in base al suo utilizzo (vedere [Panoramica](./overview.md)):

| Utilizzo | Shard | Repliche per shard |
|----------|-------|--------------------|
| POC, sviluppo | 1 | 1 |
| Produzione, volume moderato | 1 | 2 |
| Produzione, grandi volumi | 2 o più | 2 |

Una configurazione replicata si basa su **ClickHouse Keeper** (3 istanze consigliate) per il coordinamento.

---

## Passo 2: Richiedere l'istanza

[Contatti il supporto](mailto:support@hidora.io) indicando:

| Informazione | Esempio |
|--------------|---------|
| Progetto | `analytics` |
| Nome dell'istanza | `events-ch` |
| Shard / repliche per shard | `1` / `2` |
| Preset per replica | `large` (2 CPU, 2Gi) |
| Dimensione dello storage per replica | `50 GB` |
| Utenti e diritti | `app` (accesso completo), `analyst` (sola lettura) |
| Accesso da Internet | Sì / No |
| Backup | Sì / No, con la conservazione desiderata |

---

## Passo 3: Verificare la consegna

Il supporto le conferma la messa a disposizione dell'istanza, insieme alle informazioni di connessione: indirizzo, porte e credenziali.

---

## Passo 4: Recuperare le credenziali

Conservi le password ricevute in un gestore di password. Per cambiarle, contatti il supporto.

---

## Passo 5: Connessione e test

ClickHouse espone il protocollo nativo (porta `9000` per impostazione predefinita) e l'interfaccia HTTP (porta `8123` per impostazione predefinita).

```bash
clickhouse-client \
  --host <host> \
  --port 9000 \
  --user app \
  --password \
  --query "SHOW DATABASES;"
```

**Risultato atteso:**

```console
INFORMATION_SCHEMA
default
information_schema
system
```

Crei quindi una prima tabella:

```sql
CREATE TABLE default.events
(
    ts DateTime,
    user_id UInt64,
    action String
)
ENGINE = MergeTree
ORDER BY (ts, user_id);

INSERT INTO default.events VALUES (now(), 1, 'login');
SELECT action, count() FROM default.events GROUP BY action;
```

---

## Passo 6: Risoluzione rapida dei problemi

### Connessione impossibile

Verifichi l'indirizzo e la porta: `9000` per il protocollo nativo (`clickhouse-client`), `8123` per HTTP. Se l'istanza non è esposta su Internet, si connetta da una risorsa dello stesso progetto.

### Autenticazione rifiutata

Verifichi l'utente e la password ricevuti. Per reimpostare una password, contatti il supporto.

### Query lente

Verifichi che l'`ORDER BY` delle sue tabelle corrisponda ai filtri che usa più spesso. Consulti [Risoluzione dei problemi](./troubleshooting.md).

---

## Passo 7: Pulizia

Per eliminare un'istanza ClickHouse, [contatti il supporto](mailto:support@hidora.io) indicando il progetto e il nome dell'istanza.

:::warning
L'eliminazione di un'istanza cancella tutti i dati associati. È **irreversibile**.
:::

---

<NavigationFooter
  nextSteps={[
    {label: "Concetti", href: "../concepts"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Tutti i database", href: "../../"},
  ]}
/>
