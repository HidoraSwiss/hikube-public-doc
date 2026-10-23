---
title: "Come modificare la configurazione di un cluster"
---

# Come modificare la configurazione di un cluster RabbitMQ

Questa guida spiega quali parametri di un cluster RabbitMQ possono essere modificati dopo la creazione dalla [console Hikube](https://console.hikube.cloud) e come procedere.

## Prerequisiti

- Un **cluster RabbitMQ** creato nel suo progetto
- Una quota di progetto sufficiente se intende aumentare la dimensione del disco

## Parametri modificabili

| Parametro | Modificabile dopo la creazione | Nota |
|-----------|--------------------------------|------|
| **RabbitMQ Version** | Sì | Versione attuale e versioni superiori tra 4.2, 4.1, 4.0, 3.13 |
| **Disk size (GB)** | Sì | Capacità per nodo, solo in aumento, entro il limite della quota di storage del progetto |
| **External access** | Sì | Consulti [Configurare l'accesso esterno](./configure-external-access.md) |
| **Preset** | No | « The resources preset cannot be changed after creation » |
| **Number of replicas** | No | « The mode cannot be changed after creation » |

## Procedura

### 1. Aprire il modulo di modifica

1. Nel menu **DB & Messaging** → **RabbitMQ**, faccia clic sul cluster.
2. Faccia clic su **Edit**. In alternativa, può aprire il menu delle azioni del cluster nell'elenco e scegliere **Edit**.

La pagina **Edit RabbitMQ cluster** mostra il riquadro **Cluster settings**. I campi **Preset** e **Number of replicas** vi appaiono disattivati.

### 2. Regolare i parametri

- **RabbitMQ Version**: selezioni la versione di destinazione. Il modulo propone solo la versione attuale e le versioni superiori.
- **Disk size (GB)**: inserisca la nuova capacità per nodo. La dimensione può solo aumentare: un valore inferiore mostra « The disk size cannot be reduced: N GB minimum. » e non viene salvato.
- **External access**: attivi o disattivi l'interruttore.

:::warning Cambio di versione
Quando cambia la versione, compare l'avviso « The cluster instances will restart »: una versione aggiornata non può più essere riportata indietro. Il cambio di versione ricrea i nodi RabbitMQ uno alla volta: con una sola replica, il cluster non è disponibile durante il riavvio (nell'ordine di uno o due minuti) e i client devono riconnettersi. Gli indirizzi delle zone **Internal** ed **External** non cambiano. Verifichi il cambio di versione su un cluster non di produzione prima di applicarlo a un cluster di produzione e controlli la compatibilità dei suoi client con la versione di destinazione.
:::

### 3. Salvare

Faccia clic su **Save**. Il messaggio « Cluster updated » conferma che i parametri sono stati applicati e la console torna alla pagina di dettaglio.

Se la quota del progetto non consente la nuova configurazione, il pulsante **Save** resta inattivo.

:::note
L'API applica le stesse regole: una versione inferiore a quella attuale è rifiutata con il codice `140203`, una dimensione del disco inferiore a quella attuale con il codice `140204`.
:::

## Cambiare preset o numero di repliche

Il preset e il numero di repliche sono fissati alla creazione. Esistono due possibilità:

- **Creare un nuovo cluster** con la configurazione desiderata, ricreare vhost e utenti, quindi migrare le sue applicazioni;
- **Contattare il supporto**: queste opzioni non sono disponibili nella console; [contatti il supporto](mailto:support@hidora.io).

## Verifica

Nella pagina di dettaglio del cluster, la sezione **General Information** mostra la **Version** e la **Volume Size** aggiornate, e la sezione **Connection** lo stato dell'**External Access**.

## Per approfondire

- [Concetti](../concepts.md): modalità di deployment e preset
- [Gestire vhost e utenti](./manage-vhosts-users.md)
