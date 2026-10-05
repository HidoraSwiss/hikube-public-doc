---
title: "Come modificare le risorse di un cluster"
sidebar_position: 2
---

# Come modificare le risorse di un cluster

Questa guida spiega come adattare un cluster PostgreSQL esistente dalla [console Hikube](https://console.hikube.cloud): preset di istanza (CPU e memoria), dimensione del disco, versione e accesso esterno.

## Prerequisiti

- Un cluster **PostgreSQL** esistente nel suo progetto
- Una quota di progetto sufficiente per la nuova configurazione

## Cosa è modificabile

| Parametro | Modificabile dopo la creazione |
|-----------|--------------------------------|
| **PostgreSQL Version** | Sì |
| **Preset** | Sì |
| **Disk size (GB)** | Sì |
| **External access** | Sì |
| **Number of replicas** | No, « The mode cannot be changed after creation » |

Per cambiare il numero di repliche di un cluster esistente, [contatti il supporto](mailto:support@hidora.io).

## Preset disponibili

| Preset | CPU | Memoria |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

Fa fede l'elenco mostrato nel modulo. Le risorse si applicano a ogni nodo del cluster.

## Passaggi

### 1. Aprire il modulo di modifica

1. Apra **DB & Messaging** → **PostgreSQL**.
2. Nell'elenco **PostgreSQL Clusters**, apra il menu **Actions** del cluster e scelga **Edit**, oppure apra la pagina del cluster e faccia clic su **Edit**.

La pagina **Edit PostgreSQL cluster** mostra il riquadro **Cluster settings** e l'impatto della configurazione sulla quota del progetto.

### 2. Adattare i parametri

- **Preset**: selezioni un preset superiore per aumentare la CPU e la memoria di ogni nodo.
- **Disk size (GB)**: inserisca la nuova capacità.
- **PostgreSQL Version**: selezioni la versione di destinazione. Il modulo propone tutte le versioni, ma è possibile solo un aggiornamento di versione: una versione inferiore viene rifiutata dalla piattaforma, il cluster resta sulla versione attuale e la configurazione rimane in errore finché non seleziona di nuovo una versione superiore o uguale. Un aggiornamento di versione maggiore (ad esempio 17 → 18) avviene sul posto: l'istanza viene arrestata durante la migrazione dei dati.
- **External access**: attivi o disattivi l'esposizione sull'Internet pubblico.

### 3. Salvare

Faccia clic su **Save**. Il messaggio « Cluster updated » conferma che la modifica è stata presa in carico. Se la nuova configurazione supera la quota del progetto, il pulsante resta inattivo.

:::warning
Un cambio di preset o di versione comporta il riavvio delle istanze. Su un cluster con 1 replica, il database non è disponibile durante il riavvio e, in caso di aggiornamento di versione maggiore, per tutta la durata della migrazione; pianifichi l'operazione al di fuori delle ore di carico elevato.
:::

:::tip
Aumenti la dimensione del disco prima che sia pieno. Monitori lo spazio utilizzato con `SELECT pg_size_pretty(pg_database_size(current_database()));`.
:::

## Verifica

La pagina del cluster mostra i nuovi valori nei riquadri **PostgreSQL Version**, **Allocated Size** ed **External Access**, e lo stato torna a **Ready** una volta applicato l'aggiornamento.

## Per approfondire

- [Concetti PostgreSQL](../concepts.md): replica, preset, accesso di rete
- [Gestire utenti e database](./manage-users-databases.md)
