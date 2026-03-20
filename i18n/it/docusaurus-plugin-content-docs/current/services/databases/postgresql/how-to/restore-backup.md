---
title: "Come ripristinare un backup (PITR)"
---

# Come ripristinare un backup (PITR)

Questa guida spiega come ripristinare un database PostgreSQL a un istante preciso grazie al meccanismo di **Point-In-Time Recovery (PITR)** integrato in Hikube.

:::warning
Il ripristino PITR crea una **nuova istanza** PostgreSQL con un nome diverso. Non ripristina l'istanza esistente sul posto. La vecchia istanza non viene modificata.
:::

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Un'istanza PostgreSQL originale con i **backup attivati** (`backup.enabled: true`)
- I backup devono essere stati correttamente inviati al bucket S3
- Il **nome della vecchia istanza** PostgreSQL (`bootstrap.oldName`)
- (Opzionale) Un **timestamp RFC 3339** per il ripristino a un istante preciso

## Passaggi

### 1. Identificare il punto di ripristino

Determinate l'istante al quale desiderate ripristinare i vostri dati. Il timestamp deve essere nel formato **RFC 3339**:

```
YYYY-MM-DDTHH:MM:SSZ
```

**Esempi:**

| Timestamp | Descrizione |
|-----------|-------------|
| `2025-06-15T10:30:00Z` | 15 giugno 2025 alle 10:30 UTC |
| `2025-06-15T14:00:00+02:00` | 15 giugno 2025 alle 14:00 (ora di Parigi) |
| _(vuoto)_ | Ripristino all'ultimo stato disponibile |

:::tip
Se lasciate `recoveryTime` vuoto, il ripristino viene effettuato fino all'ultimo WAL disponibile, cioe lo stato più recente possibile.
:::

### 2. Preparare il manifesto della nuova istanza

Create un manifesto per la nuova istanza PostgreSQL. Il nome deve essere **diverso** dall'istanza originale. La configurazione (replicas, resources, archiviazione) deve essere **identica** a quella dell'istanza originale.

Aggiungete la sezione `bootstrap` per attivare il ripristino:

```yaml title="postgresql-restored.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database-restored
spec:
  replicas: 3
  resourcesPreset: medium
  size: 20Gi

  users:
    admin:
      password: SecureAdminPassword

  databases:
    myapp:
      roles:
        admin:
          - admin

  backup:
    enabled: true
    schedule: "0 2 * * *"
    retentionPolicy: 30d
    destinationPath: s3://backups/postgresql/my-database-restored/
    endpointURL: https://prod.s3.hikube.cloud
    s3AccessKey: oobaiRus9pah8PhohL1ThaeTa4UVa7gu
    s3SecretKey: ju3eum4dekeich9ahM1te8waeGai0oog

  bootstrap:
    enabled: true
    oldName: "my-database"
    recoveryTime: "2025-06-15T10:30:00Z"
```

**Parametri chiave della sezione `bootstrap`:**

| Parametro | Descrizione | Richiesto |
|-----------|-------------|--------|
| `bootstrap.enabled` | Attiva il ripristino da un backup | Si |
| `bootstrap.oldName` | Nome della vecchia istanza PostgreSQL | Si |
| `bootstrap.recoveryTime` | Timestamp RFC 3339 del punto di ripristino. Vuoto = ultimo stato disponibile | No |

:::note
Il campo `bootstrap.oldName` corrisponde al `metadata.name` dell'istanza originale. In questo esempio, la vecchia istanza si chiamava `my-database`.
:::

### 3. Applicare il manifesto

```bash
kubectl apply -f postgresql-restored.yaml
```

La creazione della nuova istanza e il ripristino possono richiedere diversi minuti a seconda del volume di dati.

### 4. Verificare il ripristino

Monitorate lo stato della nuova istanza:

```bash
kubectl get postgres my-database-restored
```

**Risultato atteso:**

```console
NAME                      READY   AGE     VERSION
my-database-restored      True    3m12s   0.18.0
```

Verificate che i pod siano nello stato `Running`:

```bash
kubectl get po | grep postgres-my-database-restored
```

**Risultato atteso:**

```console
postgres-my-database-restored-1   1/1     Running   0   3m
postgres-my-database-restored-2   1/1     Running   0   2m
postgres-my-database-restored-3   1/1     Running   0   1m
```

### 5. Validare i dati ripristinati

Recuperate le credenziali di connessione della nuova istanza:

```bash
kubectl get secret postgres-my-database-restored-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

Connettetevi al database e verificate che i dati siano presenti:

```bash
kubectl port-forward svc/postgres-my-database-restored-rw 5432:5432
```

```bash
psql -h 127.0.0.1 -U admin myapp
```

```sql
-- Verificare le tabelle e i dati
\dt
SELECT count(*) FROM votre_table;
```

## Verifica

Il ripristino ha avuto successo se:

- L'istanza `my-database-restored` e nello stato `READY: True`
- I pod PostgreSQL sono tutti nello stato `Running`
- I dati sono presenti e coerenti al timestamp richiesto
- La connessione `psql` funziona correttamente

:::tip
Una volta validato il ripristino, ricordatevi di aggiornare le vostre applicazioni per puntare alla nuova istanza (`postgres-my-database-restored-rw` al posto di `postgres-my-database-rw`).
:::

## Per approfondire

- **[Riferimento API PostgreSQL](../api-reference.md)**: documentazione completa dei parametri `bootstrap`
- **[Come configurare i backup automatici](./configure-backups.md)**: attivare i backup sulla nuova istanza
