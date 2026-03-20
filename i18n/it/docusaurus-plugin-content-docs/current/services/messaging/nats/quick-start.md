---
sidebar_position: 2
title: Avvio rapido
---

# Distribuire NATS in 5 minuti

Questa guida vi accompagna passo dopo passo nella distribuzione del vostro primo **cluster NATS** su Hikube, dal manifesto YAML fino ai primi test di messaggistica.

---

## Obiettivi

Al termine di questa guida, avrete:

- Un **cluster NATS** distribuito e operativo su Hikube
- Una configurazione ad **alta disponibilità** con più repliche
- **JetStream** attivato per l'archiviazione persistente dei messaggi
- Un **utente** configurato per connettersi al vostro cluster

---

## Prerequisiti

Prima di iniziare, assicuratevi di avere:

- **kubectl** configurato con il vostro kubeconfig Hikube
- **Diritti di amministratore** sul vostro tenant
- Un **namespace** dedicato per ospitare il vostro cluster NATS
- La **CLI NATS** (`nats`) installata sulla vostra postazione (opzionale, per i test)

---

## Passo 1: Creare il manifesto NATS

Create un file `nats.yaml` con la seguente configurazione:

```yaml title="nats.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: example
spec:
  external: false

  replicas: 3
  resourcesPreset: small
  storageClass: replicated

  jetstream:
    enabled: true
    size: 10Gi

  users:
    user1:
      password: mypassword

  config:
    merge:
      max_payload: 16MB
      write_deadline: 2s
      debug: false
      trace: false
```

:::tip
Se `resources` è definito, il valore di `resourcesPreset` viene ignorato. Consultate il [Riferimento API](./api-reference.md) per la lista completa delle opzioni disponibili.
:::

---

## Passo 2: Distribuire il cluster NATS

Applicate il manifesto e verificate che la distribuzione sia avviata:

```bash
# Applicare il manifesto
kubectl apply -f nats.yaml
```

Verificate lo stato del cluster (può richiedere 1-2 minuti):

```bash
kubectl get nats
```

**Risultato atteso:**

```console
NAME      READY   AGE     VERSION
example   True    2m      0.10.0
```

---

## Passo 3: Verifica dei pod

Verificate che tutti i pod siano nello stato `Running`:

```bash
kubectl get pods | grep nats
```

**Risultato atteso:**

```console
nats-example-0    1/1     Running   0   2m
nats-example-1    1/1     Running   0   2m
nats-example-2    1/1     Running   0   2m
```

Con `replicas: 3`, ottenete **3 pod NATS** che formano un cluster ad alta disponibilità con consenso Raft per JetStream.

| Prefisso | Ruolo | Numero |
|----------|-------|--------|
| `nats-example-*` | **NATS Server** (messaggistica + JetStream) | 3 |

---

## Passo 4: Recuperare le credenziali

Le password degli utenti NATS sono archiviate in un Secret Kubernetes:

```bash
kubectl get secret nats-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Risultato atteso:**

```console
user1: mypassword
```

---

## Passo 5: Connessione e test

### Port-forward del servizio NATS

```bash
kubectl port-forward svc/nats-example 4222:4222 &
```

### Test di pubblicazione e consumo

```bash
# Creare uno stream JetStream
nats -s nats://user1:mypassword@localhost:4222 stream add EVENTS \
  --subjects "events.*" --storage file --replicas 3 --retention limits \
  --max-msgs -1 --max-bytes -1 --max-age 24h --discard old

# Pubblicare un messaggio
nats -s nats://user1:mypassword@localhost:4222 pub events.test "Hello Hikube!"

# Consumare il messaggio
nats -s nats://user1:mypassword@localhost:4222 stream view EVENTS
```

**Risultato atteso:**

```console
[1] Subject: events.test Received: 2025-01-15T10:30:00Z
  Hello Hikube!
```

:::note
Se non avete la CLI NATS, potete installarla da [nats-io/natscli](https://github.com/nats-io/natscli).
:::

---

## Passo 6: Risoluzione rapida dei problemi

### Pod in CrashLoopBackOff

```bash
# Verificare i log del pod in errore
kubectl logs nats-example-0

# Verificare gli eventi del pod
kubectl describe pod nats-example-0
```

**Cause frequenti:** memoria insufficiente (`resources.memory` troppo bassa), volume JetStream pieno (`jetstream.size` troppo basso).

### NATS non accessibile

```bash
# Verificare che i servizi esistano
kubectl get svc | grep nats

# Verificare il servizio NATS
kubectl describe svc nats-example
```

**Cause frequenti:** port-forward non attivo, porta errata (4222 per i client), credenziali errate.

### JetStream non funzionante

```bash
# Verificare lo stato di JetStream nei log
kubectl logs nats-example-0 | grep -i jetstream

# Verificare il report JetStream
nats -s nats://user1:mypassword@localhost:4222 server report jetstream
```

**Cause frequenti:** `jetstream.enabled: false` nel manifesto, spazio di archiviazione JetStream insufficiente, numero di repliche insufficiente per il fattore di replica richiesto.

### Comandi di diagnostica generali

```bash
# Eventi recenti sul namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Stato dettagliato del cluster NATS
kubectl describe nats example
```

---

## Passo 7: Pulizia

Per eliminare le risorse di test:

```bash
kubectl delete -f nats.yaml
```

:::warning
Questa azione elimina il cluster NATS e tutti i dati associati. Questa operazione è **irreversibile**.
:::

---

## Riepilogo

Avete distribuito:

- Un cluster NATS con **3 repliche** in alta disponibilità
- **JetStream** attivato per la persistenza dei messaggi
- Un **utente** autenticato per connettersi al cluster
- Un archivio persistente per la durabilità dei dati

---

## Prossimi passi

- **[Riferimento API](./api-reference.md)**: Configurazione completa di tutte le opzioni NATS
- **[Panoramica](./overview.md)**: Architettura dettagliata e casi d'uso NATS su Hikube
