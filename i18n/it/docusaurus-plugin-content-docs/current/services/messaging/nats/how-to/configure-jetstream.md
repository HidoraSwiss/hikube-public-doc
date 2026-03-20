---
title: "Come configurare JetStream"
---

# Come configurare JetStream

Questa guida spiega come attivare e configurare il modulo **JetStream** su un cluster NATS distribuito su Hikube. JetStream fornisce la persistenza dei messaggi, lo streaming e il pattern request/reply con garanzie di consegna.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Un cluster **NATS** distribuito su Hikube (o un manifesto pronto per la distribuzione)
- (Opzionale) la CLI **nats** installata localmente per i test

## Passi

### 1. Attivare JetStream

JetStream è attivato per impostazione predefinita (`jetstream.enabled: true`). Se lo avete disattivato o desiderate configurarlo esplicitamente, aggiungete la sezione `jetstream` al manifesto:

```yaml title="nats-jetstream.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: my-nats
spec:
  replicas: 3
  resourcesPreset: small
  external: false

  jetstream:
    enabled: true
    size: 20Gi

  users:
    admin:
      password: SecureAdminPassword
```

**Parametri JetStream:**

| Parametro | Tipo | Descrizione | Default |
|-----------|------|-------------|---------|
| `jetstream.enabled` | `bool` | Attiva o disattiva JetStream | `true` |
| `jetstream.size` | `quantity` | Dimensione del volume persistente per i dati JetStream | `10Gi` |

:::tip
Utilizzate minimo 3 repliche in produzione per beneficiare del consenso Raft di JetStream. Questo garantisce l'alta disponibilità e la durabilità degli stream in caso di guasto di un nodo.
:::

### 2. Configurare l'archiviazione JetStream

Il dimensionamento del volume JetStream dipende dal vostro caso d'uso:

- **Messaggi effimeri** (TTL breve, qualche ora): da `10Gi` a `20Gi`
- **Retention lunga** (giorni, settimane): da `50Gi` a `100Gi`
- **Stream voluminosi** (eventi, log): `100Gi` e oltre

```yaml title="nats-jetstream-storage.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: my-nats
spec:
  replicas: 3
  resourcesPreset: medium
  storageClass: replicated

  jetstream:
    enabled: true
    size: 50Gi

  users:
    admin:
      password: SecureAdminPassword
```

:::warning
Ridurre `jetstream.size` su un cluster esistente può comportare una perdita di dati. Prevedete sempre un margine sufficiente durante il dimensionamento iniziale.
:::

### 3. Configurazione avanzata tramite config.merge

Il campo `config.merge` consente di regolare i parametri di basso livello di NATS:

```yaml title="nats-config-advanced.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: my-nats
spec:
  replicas: 3
  resourcesPreset: medium
  storageClass: replicated

  jetstream:
    enabled: true
    size: 50Gi

  users:
    admin:
      password: SecureAdminPassword

  config:
    merge:
      max_payload: 8MB
      write_deadline: 2s
      debug: false
      trace: false
```

**Opzioni di configurazione comuni:**

| Parametro | Descrizione | Default |
|-----------|-------------|---------|
| `max_payload` | Dimensione massima di un messaggio | `1MB` |
| `write_deadline` | Ritardo massimo per scrivere una risposta al client | `2s` |
| `debug` | Attiva i log di debug | `false` |
| `trace` | Attiva il tracciamento dei messaggi (molto verboso) | `false` |

:::note
Attivate `debug` e `trace` solo per la risoluzione temporanea dei problemi. Queste opzioni generano un volume importante di log e possono impattare le prestazioni.
:::

### 4. Applicare e verificare

Applicate il manifesto:

```bash
kubectl apply -f nats-config-advanced.yaml
```

Monitorate il rolling update dei pod:

```bash
kubectl get po -w | grep my-nats
```

Attendete che tutti i pod siano nello stato `Running`:

```bash
kubectl get po | grep my-nats
```

**Risultato atteso:**

```console
my-nats-0   1/1     Running   0   2m
my-nats-1   1/1     Running   0   4m
my-nats-2   1/1     Running   0   6m
```

### 5. Testare JetStream

Aprite un port-forward verso il servizio NATS:

```bash
kubectl port-forward svc/my-nats 4222:4222
```

Create uno stream con la CLI `nats`:

```bash
nats stream create EVENTS \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222 \
  --subjects "events.>" \
  --retention limits \
  --max-msgs -1 \
  --max-bytes -1 \
  --max-age 72h \
  --replicas 3
```

**Risultato atteso:**

```console
Stream EVENTS was created

Information:

  Subjects: events.>
  Replicas: 3
  Storage:  File
  Retention: Limits
  ...
```

Pubblicate un messaggio:

```bash
nats pub events.test "Hello JetStream" \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

Consumate il messaggio:

```bash
nats sub "events.>" \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222 \
  --count 1
```

**Risultato atteso:**

```console
[#1] Received on "events.test"
Hello JetStream
```

Verificate lo stato dello stream:

```bash
nats stream info EVENTS \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

## Verifica

La configurazione è riuscita se:

- I pod NATS sono tutti nello stato `Running`
- Uno stream può essere creato con il numero di repliche desiderato
- I messaggi pubblicati vengono persistiti e possono essere consumati
- Lo stream info mostra il numero corretto di repliche e la politica di retention configurata

## Per approfondire

- **[Riferimento API NATS](../api-reference.md)**: documentazione completa dei parametri `jetstream`, `config` e `config.merge`
- **[Come gestire gli utenti NATS](./manage-users.md)**: creare e gestire gli account di accesso al cluster
