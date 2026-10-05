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
| **MongoDB Version** | Sì |
| **Disk size (GB)** | Sì |
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

- **Disk size (GB)**: inserisca la nuova capacità.
- **MongoDB Version**: selezioni la versione di destinazione (6.0, 7.0 o 8.0).
- **External access**: attivi o disattivi l'esposizione sulla rete Internet pubblica.

:::tip
MongoDB supporta gli aggiornamenti di versione principale solo da una versione alla successiva (6.0 → 7.0 → 8.0). Il modulo propone tutte le versioni, compresi un salto di versione o una versione inferiore: non salti versioni e non torni indietro.
:::

### 3. Salvare

Faccia clic su **Save**. Il messaggio «Cluster updated» conferma l'applicazione delle modifiche. Se la nuova configurazione supera le quote del progetto, il pulsante resta inattivo.

## Verifica

La pagina del cluster mostra i nuovi valori nei riquadri **MongoDB Version** e **Allocated Size**. Da `mongosh`, controlli lo spazio utilizzato:

```javascript
db.stats({ scale: 1024 * 1024 })
```

## Per approfondire

- [Concetti MongoDB](../concepts.md): replicazione, preset, accesso di rete
- [Configurare lo sharding](./configure-sharding.md)
