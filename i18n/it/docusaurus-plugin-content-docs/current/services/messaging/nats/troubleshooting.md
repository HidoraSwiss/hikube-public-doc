---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — NATS

:::info Disponibilità
NATS non è ancora disponibile in self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

Le diagnosi seguenti si eseguono dalla CLI `nats` (vedere l'[avvio rapido](./quick-start.md) per salvare un contesto di connessione). Quando è necessario un intervento lato piattaforma (risorse, storage, riavvio, log del server), [contatti il supporto](mailto:support@hidora.io) indicando il progetto e il nome dell'istanza.

### Messaggi persi (senza JetStream)

**Causa**: JetStream non è attivato oppure nessuno stream è configurato per acquisire i messaggi. Senza JetStream, NATS funziona in modalità fire-and-forget: i messaggi vengono consegnati solo ai subscriber connessi al momento della pubblicazione.

**Soluzione**:

1. Verifichi che JetStream sia disponibile per il suo account:
   ```bash
   nats account info
   ```
   Se JetStream non è attivato sull'istanza, contatti il supporto.
2. Crei uno stream per acquisire i messaggi dei subject desiderati:
   ```bash
   nats stream add --subjects "orders.>" --storage file --replicas 3 --retention limits orders-stream
   ```
3. Verifichi che lo stream sia stato creato e acquisisca i messaggi:
   ```bash
   nats stream info orders-stream
   ```

### Il consumer non riceve i messaggi

**Causa**: il consumer è iscritto a un subject che non corrisponde a quello utilizzato dal producer. Gli errori più comuni includono un refuso nel nome del subject, un uso errato dei caratteri jolly o una configurazione errata del queue group.

**Soluzione**:

1. Verifichi il subject esatto utilizzato dal producer e dal consumer: i subject **distinguono tra maiuscole e minuscole**.
2. Verifichi la ricezione con una sottoscrizione diagnostica:
   ```bash
   nats sub ">"
   ```
   In questo modo può vedere **tutti i messaggi** che il suo utente è autorizzato a ricevere.
3. Verifichi i caratteri jolly utilizzati: `orders.*` **non** corrisponde a `orders.new.urgent` (utilizzi `orders.>` per i sottolivelli).
4. Se utilizza i queue group, verifichi che il consumer sia effettivamente membro del gruppo previsto e che il nome del gruppo sia identico.

### Storage JetStream pieno

**Causa**: il volume JetStream ha raggiunto la capacità massima. I nuovi messaggi non possono più essere resi persistenti e le pubblicazioni falliscono.

**Soluzione**:

1. Verifichi l'utilizzo dello storage JetStream:
   ```bash
   nats account info
   ```
2. Individui gli stream più voluminosi:
   ```bash
   nats stream list
   ```
3. Elimini i messaggi vecchi dagli stream che lo consentono:
   ```bash
   nats stream purge <nome-stream>
   ```
4. Regoli la politica di conservazione degli stream: utilizzi `limits` con `max-age` per eliminare automaticamente i messaggi vecchi:
   ```bash
   nats stream edit <nome-stream> --max-age 72h
   ```
5. Se necessario, richieda l'aumento del volume JetStream. Questa opzione non è disponibile nella console; contatti il supporto.

### Memoria insufficiente

**Causa**: il server NATS consuma più memoria del limite assegnato, spesso a causa di un numero elevato di connessioni, di messaggi voluminosi (`max_payload` elevato) o di stream JetStream in memoria.

**Soluzione**:

1. Preferisca lo storage `file` rispetto a `memory` per gli stream voluminosi.
2. Riduca la dimensione dei messaggi pubblicati se non sono necessari messaggi molto voluminosi.
3. Se il problema persiste, richieda un preset superiore o una regolazione di `max_payload`. Questa opzione non è disponibile nella console; contatti il supporto.

### Connessione rifiutata

**Causa**: URL o porta errati, credenziali errate oppure tentativo di connessione dall'esterno della piattaforma senza accesso esterno attivato.

**Soluzione**:

1. Verifichi di utilizzare l'URL e le credenziali comunicati dal supporto.
2. Verifichi la connessione:
   ```bash
   nats server check connection --server <nats-url> --user <utente> --password <password>
   ```
3. Un errore `Authorization Violation` indica credenziali errate; chieda al supporto di verificare o rinnovare la password.
4. Se si connette dall'esterno della piattaforma, verifichi con il supporto che l'accesso esterno sia attivato sull'istanza.
