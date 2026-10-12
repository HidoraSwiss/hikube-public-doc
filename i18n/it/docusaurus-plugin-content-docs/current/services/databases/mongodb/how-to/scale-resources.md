---
title: "Come modificare le risorse di un cluster"
sidebar_position: 2
---

# Come modificare le risorse di un cluster

Questa guida spiega come regolare un cluster MongoDB esistente dalla [console Hikube](https://console.hikube.cloud): dimensione del disco, versione e accesso esterno.

## Prerequisiti

- Un cluster **MongoDB** esistente nel suo progetto
- Quote di progetto sufficienti per la nuova configurazione

## Cosa è modificabile

| Parametro | Modificabile dopo la creazione |
|-----------|---------------------------|
| **MongoDB Version** | Sì, solo verso una versione superiore |
| **Disk size (GB)** | Sì, solo in aumento |
| **External access** | Sì |
| **Preset** | No, «The resources preset cannot be changed after creation» |
| **Number of replicas** | No, «The mode cannot be changed after creation» |
| **Sharding** | No, l'opzione non compare nel modulo di modifica |

Per cambiare il preset, il numero di repliche o la topologia di un cluster esistente, [contatti il supporto](mailto:support@hidora.io).

## Passaggi

### 1. Aprire il modulo di modifica

1. Apra **DB & Messaging** → **MongoDB**.
2. Apra il cluster, quindi faccia clic su **Edit** (oppure utilizzi **Actions** → **Edit** nell'elenco).

La pagina **Edit MongoDB cluster** mostra il riquadro **Cluster settings** e l'impatto sulle quote del progetto.

### 2. Regolare i parametri

- **Disk size (GB)**: inserisca la nuova capacità, almeno pari alla dimensione attuale. Un valore inferiore mostra «The disk size cannot be reduced: N GB minimum.» e non viene salvato.
- **MongoDB Version**: selezioni la versione di destinazione. Il modulo propone solo la versione attuale e le versioni superiori.
- **External access**: attivi o disattivi l'esposizione sulla rete Internet pubblica.

:::tip
MongoDB supporta gli aggiornamenti di versione principale solo da una versione alla successiva (6.0 → 7.0 → 8.0). Il modulo propone tutte le versioni superiori, compreso un salto di versione: non salti versioni.
:::

Quando cambia la versione, compare l'avviso «The cluster instances will restart»: la modifica riavvia le istanze del cluster al salvataggio, e una versione aggiornata non può più essere riportata indietro. La pianifichi al di fuori dei periodi di forte attività.

### 3. Salvare

Faccia clic su **Save**. Il messaggio «Cluster updated» conferma l'applicazione delle modifiche. Se la nuova configurazione supera le quote del progetto, il pulsante resta inattivo.

:::note
L'API applica le stesse regole: una versione inferiore a quella attuale è rifiutata con il codice `150203`, una dimensione del disco inferiore a quella attuale con il codice `150204`.
:::

## Verifica

La pagina del cluster mostra i nuovi valori nei riquadri **MongoDB Version** e **Allocated Size**. Da `mongosh`, controlli lo spazio utilizzato:

```javascript
db.stats({ scale: 1024 * 1024 })
```

## Per approfondire

- [Concetti MongoDB](../concepts.md): replicazione, preset, accesso di rete
- [Configurare lo sharding](./configure-sharding.md)
