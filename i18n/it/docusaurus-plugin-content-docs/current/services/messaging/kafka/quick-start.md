---
sidebar_position: 3
title: Avvio rapido
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Iniziare con Kafka

:::info Disponibilità
Kafka non è ancora disponibile in modalità self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

Questa guida spiega come ottenere un **cluster Kafka** su Hikube ed eseguire i primi test di pubblicazione e consumo con gli strumenti client Kafka.

---

## Obiettivi

Al termine di questa guida avrà:

- Un **cluster Kafka** fornito nel suo progetto Hikube
- Un **topic** pronto a ricevere messaggi
- Pubblicato e consumato un primo messaggio dal suo computer o dalla sua applicazione

---

## Prerequisiti

- Un **account Hikube** e un **progetto** (vedere l'[avvio rapido di Hikube](../../../getting-started/quick-start.md))
- Un client Kafka installato: gli script Kafka (`kafka-console-producer.sh`, `kafka-console-consumer.sh`) oppure **kcat** (in precedenza `kafkacat`)

---

## Passo 1: Preparare la richiesta

Raccolga i parametri dell'istanza desiderata:

| Parametro | Descrizione | Esempio |
|-----------|-------------|---------|
| Progetto | Progetto Hikube in cui creare l'istanza | `demo01` |
| Nome | Nome dell'istanza Kafka | `events` |
| Broker | Numero di broker Kafka | `3` |
| Preset dei broker | Profilo CPU/memoria (vedere [Concetti](./concepts.md#preset-di-risorse)) | `small` |
| Storage dei broker | Dimensione del volume per broker | `10 GB` |
| ZooKeeper | Numero di istanze (dispari), preset e dimensione dello storage | `3`, `small`, `5 GB` |
| Topic | Nome, partizioni, repliche e opzioni (`retention.ms`, `cleanup.policy`…) | `my-topic`, 3 partizioni, 3 repliche |
| Accesso esterno | Esporre o meno il cluster all'esterno della piattaforma | No |

---

## Passo 2: Richiedere l'istanza

Invii questi parametri al supporto all'indirizzo [support@hidora.io](mailto:support@hidora.io), oppure tramite il pulsante **Contact support** del menu del profilo della console.

Il supporto le comunica in risposta le informazioni di connessione:

- l'indirizzo dei **server bootstrap** (indicato come `<bootstrap-servers>` nel seguito di questa guida);
- se previsti, le credenziali e i parametri di sicurezza da utilizzare lato client.

:::note
All'interno del progetto, i broker sono in ascolto sulla porta `9092` (senza cifratura) e `9093` (TLS). Con l'accesso esterno, l'indirizzo pubblico utilizza la porta `9094`, cifrata in TLS per impostazione predefinita: i suoi client devono quindi considerare attendibile il certificato dell'autorità del cluster, che il supporto le trasmette (ad esempio `-X security.protocol=SSL -X ssl.ca.location=ca.crt` con kcat). Per impostazione predefinita non è configurata alcuna autenticazione dei client. Utilizzi sempre l'indirizzo e la porta comunicati dal supporto.
:::

---

## Passo 3: Pubblicare un messaggio

Con gli script Kafka:

```bash
echo "Hello Hikube!" | kafka-console-producer.sh \
  --bootstrap-server <bootstrap-servers> \
  --topic my-topic
```

Oppure con kcat:

```bash
echo "Hello Hikube!" | kcat -b <bootstrap-servers> -t my-topic -P
```

---

## Passo 4: Consumare il messaggio

Con gli script Kafka:

```bash
kafka-console-consumer.sh \
  --bootstrap-server <bootstrap-servers> \
  --topic my-topic \
  --from-beginning \
  --max-messages 1
```

Oppure con kcat:

```bash
kcat -b <bootstrap-servers> -t my-topic -C -o beginning -e
```

**Risultato atteso:**

```console
Hello Hikube!
```

:::note
kcat si installa con `apt install kcat` (Debian/Ubuntu) o `brew install kcat` (macOS).
:::

---

## Passo 5: Risoluzione rapida dei problemi

### Connessione impossibile

Verifichi i metadati del cluster dal suo client:

```bash
kcat -b <bootstrap-servers> -L
```

**Cause frequenti:** indirizzo o porta errati, accesso esterno non attivato mentre ci si connette dall'esterno della piattaforma, parametri di sicurezza del client mancanti.

### Topic non trovato

Elenchi i topic visibili:

```bash
kafka-topics.sh --bootstrap-server <bootstrap-servers> --list
```

**Cause frequenti:** errore di battitura nel nome del topic, topic non dichiarato nella configurazione dell'istanza.

### Problema lato cluster

Se il cluster sembra non disponibile (broker irraggiungibili, errori di quorum di ZooKeeper), [contatti il supporto](mailto:support@hidora.io) precisando il nome del progetto e dell'istanza.

---

## Passo 6: Pulizia

Per eliminare l'istanza, invii la richiesta al [supporto](mailto:support@hidora.io) indicando il progetto e il nome dell'istanza.

:::warning
L'eliminazione di un cluster Kafka cancella tutti i dati associati. Questa operazione è **irreversibile**.
:::

---

## Passi successivi

- **[Concetti](./concepts.md)**: topic, partizioni, ZooKeeper e preset
- **[Come creare e gestire i topic](./how-to/manage-topics.md)**: opzioni di configurazione dei topic

<NavigationFooter
  nextSteps={[
    {label: "FAQ", href: "../faq"},
    {label: "Concetti", href: "../concepts"},
  ]}
  seeAlso={[
    {label: "Tutti i servizi di messaggistica", href: "../../"},
  ]}
/>
