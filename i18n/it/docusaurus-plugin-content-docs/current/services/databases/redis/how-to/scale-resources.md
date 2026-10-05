---
title: "Come modificare le risorse di un cluster Redis"
sidebar_position: 2
---

# Come modificare le risorse di un cluster Redis

Questa guida spiega come regolare un cluster Redis esistente dalla [console Hikube](https://console.hikube.cloud): preset (CPU e memoria), dimensione del volume, versione, accesso esterno e autenticazione.

## Prerequisiti

- Un cluster **Redis** esistente nel suo progetto
- Quote di progetto sufficienti per la nuova configurazione

## Cosa è modificabile

| Parametro | Modificabile dopo la creazione |
|-----------|---------------------------|
| **Redis Version** | Sì |
| **Preset** | Sì |
| **Volume Size (GB)** | Sì |
| **External access** | Sì |
| **Authentication required** | Sì |
| **Number of replicas** | No, «The mode cannot be changed after creation» |

Per cambiare il numero di repliche, [contatti il supporto](mailto:support@hidora.io).

## Passaggi

### 1. Aprire il modulo di modifica

1. Apra **DB & Messaging** → **Redis**.
2. Apra il cluster, quindi faccia clic su **Edit** (oppure utilizzi **Actions** → **Edit** nell'elenco).

La pagina **Edit cluster** mostra il riquadro **Cluster settings** e l'impatto sulle quote del progetto.

### 2. Regolare i parametri

- **Preset**: scelga un preset superiore se la memoria è satura. La memoria del preset limita il volume di dati che Redis può mantenere in memoria.
- **Volume Size (GB)**: «Storage capacity allocated to each node in the cluster.»
- **Redis Version**: `8 (Latest)` o `7`.
- **External access**: «Allow access to the cluster from outside the private network.»
- **Authentication required**: «Enable password protection.»

### 3. Salvare

Faccia clic su **Save changes**. Il messaggio «Changes saved» conferma l'applicazione delle modifiche.

:::warning
Disattivare l'autenticazione su un cluster esposto sulla rete pubblica rende i suoi dati accessibili a chiunque conosca l'indirizzo. Mantenga l'autenticazione attivata.
:::

## Verifica

- La pagina del cluster, sezione **General**, mostra la nuova **Version** e la nuova **Size**.
- Da un client, controlli la memoria disponibile:

```bash
redis-cli -h <host> -p 6379 INFO memory | grep -E 'used_memory_human|maxmemory_human'
```

## Per approfondire

- [Configurare l'alta disponibilità](./configure-ha.md)
- [Rinnovare la password](./rotate-password.md)
