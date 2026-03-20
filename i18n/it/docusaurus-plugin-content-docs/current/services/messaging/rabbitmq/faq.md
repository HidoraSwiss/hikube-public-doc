---
sidebar_position: 6
title: FAQ
---

# FAQ — RabbitMQ

### Qual è la differenza tra quorum queue e classic queue?

RabbitMQ propone due tipi principali di code:

- **Quorum queue**: basate sul protocollo **Raft**, i dati vengono replicati su più nodi del cluster. Garantiscono la **durabilità** e l'**alta disponibilità** dei messaggi. Raccomandate per la produzione.
- **Classic queue**: archiviate su un solo nodo, più veloci in scrittura ma **senza replica**. In caso di guasto del nodo, i messaggi vengono persi.

:::tip
Con 3 o più repliche (`replicas: 3`), RabbitMQ utilizza le quorum queue per impostazione predefinita, garantendo la durabilità dei messaggi in caso di guasto di un nodo.
:::

### A cosa servono i virtual host (vhost)?

I **virtual host** (vhost) forniscono un **isolamento logico** all'interno di uno stesso cluster RabbitMQ:

- Ogni vhost possiede i propri exchange, code e binding
- I permessi sono gestiti **per vhost**, consentendo di controllare l'accesso per applicazione
- Un utente può avere ruoli diversi secondo il vhost (admin su uno, readonly sull'altro)

Esempio di configurazione con più vhost:

```yaml title="rabbitmq.yaml"
vhosts:
  production:
    roles:
      admin: ["admin"]
      readonly: ["monitoring"]
  staging:
    roles:
      admin: ["admin", "dev"]
```

### Come funzionano gli exchange in RabbitMQ?

Un **exchange** riceve i messaggi dai produttori e li instrada verso le code secondo regole di **binding**:

| **Tipo**    | **Comportamento**                                                              |
| ----------- | ------------------------------------------------------------------------------ |
| `direct`    | Instrada il messaggio verso la coda la cui **routing key** corrisponde esattamente |
| `fanout`    | Diffonde il messaggio a **tutte le code** collegate, senza filtro              |
| `topic`     | Instrada secondo un **pattern** di routing key (es. `orders.*`, `logs.#`)      |
| `headers`   | Instrada secondo gli **header** del messaggio piuttosto che la routing key     |

Il produttore pubblica verso un exchange, mai direttamente verso una coda.

### Quali protocolli sono supportati?

RabbitMQ su Hikube supporta i seguenti protocolli:

| **Protocollo**       | **Porta** | **Utilizzo**                           |
| -------------------- | --------- | -------------------------------------- |
| AMQP                 | 5672      | Protocollo principale per i messaggi   |
| Management HTTP API  | 15672     | Interfaccia web e API di gestione      |

### Qual è la differenza tra `resourcesPreset` e `resources`?

Il campo `resourcesPreset` applica una configurazione CPU/memoria predefinita, mentre `resources` permette di specificare valori espliciti. Se `resources` è definito, `resourcesPreset` viene **ignorato**.

| **Preset** | **CPU** | **Memoria** |
| ---------- | ------- | ----------- |
| `nano`     | 100m    | 128Mi       |
| `micro`    | 250m    | 256Mi       |
| `small`    | 500m    | 512Mi       |
| `medium`   | 500m    | 1Gi         |
| `large`    | 1       | 2Gi         |
| `xlarge`   | 2       | 4Gi         |
| `2xlarge`  | 4       | 8Gi         |

Esempio con risorse esplicite:

```yaml title="rabbitmq.yaml"
replicas: 3
resources:
  cpu: 2000m
  memory: 4Gi
size: 20Gi
```

### Come accedere all'interfaccia di gestione?

L'interfaccia di gestione RabbitMQ è accessibile sulla porta **15672**. Due opzioni:

**Opzione 1 — Port-forward (accesso locale)**:

```bash
kubectl port-forward svc/<nome-rabbitmq> 15672:15672
```

Poi aprite `http://localhost:15672` nel vostro browser.

**Opzione 2 — Accesso esterno**:

Attivate `external: true` nel vostro manifesto per esporre il servizio tramite un LoadBalancer:

```yaml title="rabbitmq.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: rabbitmq
spec:
  external: true
  replicas: 3
  resourcesPreset: small
  size: 10Gi
```

:::warning
L'accesso esterno espone le porte AMQP (5672) e Management (15672) su Internet. Assicuratevi di utilizzare password robuste per tutti gli utenti.
:::
