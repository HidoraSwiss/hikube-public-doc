---
title: "Come modificare le risorse di un cluster — MariaDB"
sidebar_label: "Come modificare le risorse di un cluster"
sidebar_position: 2
---

# Come modificare le risorse di un cluster

Questa guida spiega come adattare un cluster MariaDB esistente dalla [console Hikube](https://console.hikube.cloud): dimensione del disco, versione e accesso esterno.

## Prerequisiti

- Un cluster **MariaDB** esistente nel suo progetto
- Una quota di progetto sufficiente per la nuova configurazione

## Cosa è modificabile

| Parametro | Modificabile dopo la creazione |
|-----------|--------------------------------|
| **MariaDB Version** | Sì, solo verso una versione superiore |
| **Disk size (GB)** | Sì, solo in aumento |
| **External access** | Sì |
| **Preset** | No, « The resources preset cannot be changed after creation » |
| **Number of replicas** | No, « The mode cannot be changed after creation » |

Per cambiare il preset (CPU e memoria) o il numero di repliche di un cluster esistente, [contatti il supporto](mailto:support@hidora.io).

## Passaggi

### 1. Aprire il modulo di modifica

1. Apra **DB & Messaging** → **MariaDB**.
2. Apra il cluster, quindi faccia clic su **Edit** (oppure utilizzi **Actions** → **Edit** nell'elenco).

La pagina **Edit MariaDB cluster** mostra il riquadro **Cluster settings** e l'impatto sulla quota del progetto.

### 2. Adattare i parametri

- **Disk size (GB)**: inserisca la nuova capacità, almeno pari alla dimensione attuale. Un valore inferiore mostra « The disk size cannot be reduced: N GB minimum. » e non viene salvato.
- **MariaDB Version**: selezioni la versione di destinazione. Il modulo propone solo la versione attuale e le versioni superiori: MariaDB non supporta il downgrade.
- **External access**: attivi o disattivi l'esposizione sull'Internet pubblico.

Quando cambia la versione, compare l'avviso « The cluster instances will restart »: la modifica riavvia le istanze del cluster al salvataggio, e una versione aggiornata non può più essere riportata indietro. La pianifichi al di fuori dei periodi di forte attività.

### 3. Salvare

Faccia clic su **Save**. Il messaggio « Cluster updated » conferma che la modifica è stata presa in carico. Se la nuova configurazione supera la quota del progetto, il pulsante resta inattivo.

:::note
L'API applica le stesse regole: una versione inferiore a quella attuale è rifiutata con il codice `110203`, una dimensione del disco inferiore a quella attuale con il codice `110204`.
:::

:::tip
Aumenti la dimensione del disco prima che sia pieno. Per misurare lo spazio utilizzato per database:

```sql
SELECT table_schema, ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS size_mb
FROM information_schema.tables
GROUP BY table_schema;
```
:::

## Verifica

La pagina del cluster mostra i nuovi valori nei riquadri **MariaDB Version** e **Allocated Size**, e lo stato dell'**External Access** nel riquadro **Connection and network**.

## Per approfondire

- [Concetti MariaDB](../concepts.md): replica, preset, accesso di rete
- [Gestire utenti e database](./manage-users-databases.md)
