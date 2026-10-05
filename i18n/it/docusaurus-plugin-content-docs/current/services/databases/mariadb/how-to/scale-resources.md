---
title: "Come modificare le risorse di un cluster"
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
| **MariaDB Version** | Sì |
| **Disk size (GB)** | Sì |
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

- **Disk size (GB)**: inserisca la nuova capacità.
- **MariaDB Version**: selezioni la versione di destinazione (10.6, 10.11, 11.4 o 11.8). Il modulo propone anche le versioni inferiori alla versione attuale: non torni a una versione precedente, MariaDB non supporta il downgrade.
- **External access**: attivi o disattivi l'esposizione sull'Internet pubblico.

### 3. Salvare

Faccia clic su **Save**. Il messaggio « Cluster updated » conferma che la modifica è stata presa in carico. Se la nuova configurazione supera la quota del progetto, il pulsante resta inattivo.

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
