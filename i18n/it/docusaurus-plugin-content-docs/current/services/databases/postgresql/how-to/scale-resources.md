---
title: "Come modificare le risorse di un cluster — PostgreSQL"
sidebar_label: "Come modificare le risorse di un cluster"
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
| `u1.medium` | 1 | 4Gi |
| `u1.large` | 2 | 8Gi |
| `u1.xlarge` | 4 | 16Gi |
| `u1.2xlarge` | 8 | 32Gi |
| `u1.4xlarge` | 16 | 64Gi |
| `u1.8xlarge` | 32 | 128Gi |
| `s1.small` | 1 | 2Gi |
| `s1.medium` | 2 | 4Gi |
| `s1.large` | 4 | 8Gi |
| `s1.xlarge` | 8 | 16Gi |
| `s1.2xlarge` | 16 | 32Gi |
| `s1.4xlarge` | 32 | 64Gi |
| `m1.large` | 2 | 16Gi |
| `m1.xlarge` | 4 | 32Gi |
| `m1.2xlarge` | 8 | 64Gi |
| `m1.4xlarge` | 16 | 128Gi |
| `m1.8xlarge` | 32 | 256Gi |

I preset riprendono le taglie delle [macchine virtuali](../../../compute/overview.md) delle serie `u1`, `s1` e `m1`. Fa fede l'elenco mostrato nel modulo. Le risorse si applicano a ogni nodo del cluster.

Un cluster creato con un vecchio preset (`small`, `medium`…) lo conserva: il modulo lo mostra così com'è e lo salva senza modifiche finché non ne sceglie un altro. Se le risorse del cluster sono state fissate al di fuori del suo preset, il modulo lo indica con la menzione « (override) ».

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
