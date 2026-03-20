---
title: "Come gestire gli utenti"
---

# Come gestire gli utenti NATS

Questa guida spiega come creare e gestire gli utenti di un cluster NATS su Hikube in modo dichiarativo tramite i manifesti Kubernetes.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Un cluster **NATS** distribuito su Hikube (o un manifesto pronto per la distribuzione)
- (Opzionale) la CLI **nats** installata localmente per testare le connessioni

## Passi

### 1. Aggiungere degli utenti

Gli utenti sono dichiarati nella sezione `users` del manifesto. Ogni utente è identificato da un nome e possiede una password.

```yaml title="nats-users.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: my-nats
spec:
  replicas: 3
  resourcesPreset: small

  jetstream:
    enabled: true
    size: 10Gi

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: AppUserPassword456
    monitoring:
      password: MonitoringPassword789
```

**Parametri utente:**

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `users[name].password` | `string` | Password associata all'utente |

:::tip
Create utenti distinti per applicazione per un controllo degli accessi granulare. Utilizzate un account **admin** per l'amministrazione, account **applicativi** per servizio, e un account **monitoring** dedicato alla supervisione.
:::

### 2. Applicare le modifiche

```bash
kubectl apply -f nats-users.yaml
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

### 3. Testare la connessione con la CLI nats

Aprite un port-forward verso il servizio NATS:

```bash
kubectl port-forward svc/my-nats 4222:4222
```

Testate la connessione con ogni utente:

**Connessione con l'utente admin:**

```bash
nats pub test "Hello from admin" \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

**Risultato atteso:**

```console
Published 16 bytes to "test"
```

**Connessione con l'utente appuser:**

```bash
nats pub app.events "Hello from appuser" \
  --server nats://appuser:AppUserPassword456@127.0.0.1:4222
```

**Risultato atteso:**

```console
Published 18 bytes to "app.events"
```

**Test con una password errata:**

```bash
nats pub test "This should fail" \
  --server nats://admin:wrongpassword@127.0.0.1:4222
```

**Risultato atteso:**

```console
nats: error: Authorization Violation
```

:::warning
Se `external: true` è attivato, il cluster NATS è accessibile dall'esterno del cluster Kubernetes. Assicuratevi che tutti gli utenti dispongano di password robuste.
:::

### 4. Verificare le connessioni attive

Potete verificare le connessioni attive sul cluster NATS:

```bash
nats server report connections \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

**Risultato atteso:**

```console
╭──────────────────────────────────────────────────────────╮
│                   Connection Report                       │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│ Server   │ Conns    │ In Msgs  │ Out Msgs │ In Bytes     │
├──────────┼──────────┼──────────┼──────────┼──────────────┤
│ my-nats-0│ 2        │ 5        │ 3        │ 128B         │
│ my-nats-1│ 1        │ 2        │ 1        │ 64B          │
│ my-nats-2│ 0        │ 0        │ 0        │ 0B           │
╰──────────┴──────────┴──────────┴──────────┴──────────────╯
```

Per vedere il dettaglio delle connessioni per utente:

```bash
nats server report connz \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

## Verifica

La configurazione è riuscita se:

- I pod NATS sono tutti nello stato `Running` dopo l'aggiornamento
- Ogni utente può connettersi con la propria password
- Una password errata viene rifiutata (`Authorization Violation`)
- Le connessioni attive sono visibili nel report del server

## Per approfondire

- **[Riferimento API NATS](../api-reference.md)**: documentazione completa dei parametri `users`
- **[Come configurare JetStream](./configure-jetstream.md)**: attivare la persistenza dei messaggi e lo streaming
