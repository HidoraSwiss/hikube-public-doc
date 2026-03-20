---
title: "Come gestire utenti e database"
---

# Come gestire utenti e database

Questa guida spiega come creare e gestire utenti, database, ruoli ed estensioni PostgreSQL su Hikube in modo dichiarativo tramite i manifesti Kubernetes.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Un'istanza **PostgreSQL** distribuita su Hikube (o un manifesto pronto per il deployment)
- (Opzionale) **psql** installato localmente per testare la connessione

## Passaggi

### 1. Aggiungere utenti

Gli utenti sono dichiarati nella sezione `users` del manifesto. Ogni utente è identificato da un nome e possiede una password.

```yaml title="postgresql-users.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 2
  resourcesPreset: medium
  size: 10Gi

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: AppUserPassword456
    readonly:
      password: ReadOnlyPassword789
    replicator:
      password: ReplicatorPassword
      replication: true
```

**Parametri utente:**

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `users[name].password` | `string` | Password dell'utente |
| `users[name].replication` | `bool` | Concede il privilegio di replica all'utente |

:::note
Il privilegio `replication` è necessario per gli utenti utilizzati da strumenti di Change Data Capture (CDC) come Debezium, o per la replica logica PostgreSQL. Attivatelo solo se ne avete bisogno.
:::

### 2. Creare database con ruoli

I database sono dichiarati nella sezione `databases`. Ogni database può definire ruoli `admin` e `readonly`, che vengono assegnati agli utenti dichiarati in `users`.

```yaml title="postgresql-databases.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 2
  resourcesPreset: medium
  size: 10Gi

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: AppUserPassword456
    readonly:
      password: ReadOnlyPassword789

  databases:
    myapp:
      roles:
        admin:
          - admin
          - appuser
        readonly:
          - readonly
    analytics:
      roles:
        admin:
          - admin
        readonly:
          - appuser
          - readonly
```

**Ruoli disponibili:**

| Ruolo | Descrizione |
|-------|-------------|
| `admin` | Accesso completo in lettura/scrittura sul database |
| `readonly` | Accesso in sola lettura sul database |

:::tip
Seguite il principio del minimo privilegio: concedete il ruolo `admin` solo agli utenti che ne hanno realmente bisogno. Usate `readonly` per i servizi di reporting o monitoring.
:::

### 3. Attivare estensioni

Le estensioni PostgreSQL vengono attivate per database tramite il campo `extensions`:

```yaml title="postgresql-extensions.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 2
  resourcesPreset: medium
  size: 10Gi

  users:
    admin:
      password: SecureAdminPassword

  databases:
    myapp:
      roles:
        admin:
          - admin
      extensions:
        - hstore
        - uuid-ossp
        - pgcrypto
```

**Estensioni comuni:**

| Estensione | Descrizione |
|-----------|-------------|
| `hstore` | Tipo di dati chiave-valore |
| `uuid-ossp` | Generazione di identificatori UUID |
| `pgcrypto` | Funzioni crittografiche (hashing, cifratura) |

### 4. Applicare le modifiche

Combinate tutti gli elementi in un unico manifesto e applicatelo:

```yaml title="postgresql-complete.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 2
  resourcesPreset: medium
  size: 10Gi

  users:
    admin:
      password: SecureAdminPassword
      replication: true
    appuser:
      password: AppUserPassword456
    readonly:
      password: ReadOnlyPassword789

  databases:
    myapp:
      roles:
        admin:
          - admin
          - appuser
        readonly:
          - readonly
      extensions:
        - hstore
        - uuid-ossp
    analytics:
      roles:
        admin:
          - admin
        readonly:
          - appuser
          - readonly
      extensions:
        - pgcrypto
```

```bash
kubectl apply -f postgresql-complete.yaml
```

### 5. Recuperare le credenziali

Le password degli utenti sono memorizzate in un Secret Kubernetes. Recuperatele con:

```bash
kubectl get secret postgres-my-database-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Risultato atteso:**

```console
admin: SecureAdminPassword
appuser: AppUserPassword456
readonly: ReadOnlyPassword789
```

:::note
Se non specificate una password per un utente, l'operatore ne genera una automaticamente. Usate il comando qui sopra per recuperarla.
:::

### 6. Testare la connessione

Aprite un port-forward verso il servizio PostgreSQL:

```bash
kubectl port-forward svc/postgres-my-database-rw 5432:5432
```

Connettetevi con `psql`:

```bash
psql -h 127.0.0.1 -U appuser myapp
```

Verificate gli utenti e i ruoli:

```sql
-- Elencare gli utenti
\du

-- Elencare i database
\l

-- Verificare le estensioni installate
\dx
```

**Risultato atteso per `\du`:**

```console
                                 List of roles
     Role name      |                         Attributes
--------------------+------------------------------------------------------------
 admin              | Replication
 appuser            |
 myapp_admin        | No inheritance, Cannot login
 myapp_readonly     | No inheritance, Cannot login
 analytics_admin    | No inheritance, Cannot login
 analytics_readonly | No inheritance, Cannot login
 postgres           | Superuser, Create role, Create DB, Replication, Bypass RLS
 readonly           |
```

## Verifica

La configurazione ha avuto successo se:

- Gli utenti appaiono in `\du` con gli attributi corretti
- I database sono elencati in `\l`
- Le estensioni sono attive (verificabili con `\dx` in ogni database)
- Ogni utente può connettersi con la propria password
- Gli utenti `readonly` non possono modificare i dati

## Per approfondire

- **[Riferimento API PostgreSQL](../api-reference.md)**: documentazione completa dei parametri `users`, `databases` e `extensions`
- **[Avvio rapido PostgreSQL](../quick-start.md)**: distribuire un'istanza PostgreSQL completa
