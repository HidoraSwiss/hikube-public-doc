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
| **PostgreSQL Version** | Sì, solo verso una versione superiore |
| **Preset** | Sì |
| **Disk size (GB)** | Sì, solo in aumento |
| **External access** | Sì |
| **Number of replicas** | No, « The mode cannot be changed after creation ». Il modulo mostra il valore attuale (1, 2 o 3) |

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
- **Disk size (GB)**: inserisca la nuova capacità, almeno pari alla dimensione attuale. Un valore inferiore mostra « The disk size cannot be reduced: N GB minimum. » e non viene salvato.
- **PostgreSQL Version**: selezioni la versione di destinazione. Il modulo propone solo la versione attuale e le versioni superiori. Un aggiornamento di versione maggiore (ad esempio 17 → 18) avviene sul posto: l'istanza viene arrestata durante la migrazione dei dati.
- **External access**: attivi o disattivi l'esposizione sull'Internet pubblico.

Quando cambia il preset o la versione, compare l'avviso « The cluster instances will restart »; per un cambio di versione, ricorda che una versione aggiornata non può più essere riportata indietro.

### 3. Salvare

Faccia clic su **Save**. Il messaggio « Cluster updated » conferma che la modifica è stata presa in carico. Se la nuova configurazione supera la quota del progetto, il pulsante resta inattivo.

:::warning
Un cambio di preset o di versione comporta il riavvio delle istanze al salvataggio. Su un cluster con 1 replica, il database non è disponibile durante il riavvio e, in caso di aggiornamento di versione maggiore, per tutta la durata della migrazione; pianifichi l'operazione al di fuori delle ore di carico elevato.
:::

:::note
L'API applica le stesse regole: una versione inferiore a quella attuale è rifiutata con il codice `80203`, una dimensione del disco inferiore a quella attuale con il codice `80204`.
:::

:::tip
Aumenti la dimensione del disco prima che sia pieno. Monitori lo spazio utilizzato con `SELECT pg_size_pretty(pg_database_size(current_database()));`.
:::

## Verifica

La pagina del cluster mostra i nuovi valori nei riquadri **PostgreSQL Version**, **Allocated Size** ed **External Access**, e lo stato torna a **Ready** una volta applicato l'aggiornamento.

## Per approfondire

- [Concetti PostgreSQL](../concepts.md): replica, preset, accesso di rete
- [Gestire utenti e database](./manage-users-databases.md)
