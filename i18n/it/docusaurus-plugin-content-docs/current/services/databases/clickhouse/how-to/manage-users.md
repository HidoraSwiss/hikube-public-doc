---
title: "Come gestire utenti e profili ClickHouse"
---

# Come gestire utenti e profili ClickHouse

Questa guida spiega come creare e gestire gli utenti ClickHouse su Hikube, definire permessi in sola lettura per gli analisti e configurare la retention dei log delle query.

## Prerequisiti

- Un'istanza ClickHouse distribuita su Hikube (vedere l'[avvio rapido](../quick-start.md))
- `kubectl` configurato per interagire con l'API Hikube
- Il file YAML di configurazione della vostra istanza ClickHouse

## Passaggi

### 1. Creare un utente admin

Definite un utente con accesso completo in scrittura e lettura nel campo `users` del manifesto:

```yaml title="clickhouse-users.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resourcesPreset: small
  size: 10Gi
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
  users:
    admin:
      password: MonMotDePasseAdmin2024
```

:::warning
Usate password forti in produzione. Le password sono memorizzate nel manifesto in chiaro -- assicuratevi di proteggere l'accesso ai vostri file YAML e ai Secret Kubernetes associati.
:::

### 2. Creare un utente in sola lettura

Aggiungete un utente `analyst` con il flag `readonly: true` per limitare l'accesso alle sole query di lettura (SELECT):

```yaml title="clickhouse-users-readonly.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resourcesPreset: small
  size: 10Gi
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
  users:
    admin:
      password: MonMotDePasseAdmin2024
    analyst:
      password: AnalysteSecure2024
      readonly: true
```

:::tip
Create un utente in sola lettura per gli strumenti di analisi e reporting (Grafana, Metabase, ecc.). Questo limita i rischi di modifica accidentale dei dati.
:::

### 3. Configurare i log delle query

ClickHouse registra le query eseguite nelle tabelle di sistema `query_log` e `query_thread_log`. Configurate la dimensione di archiviazione e la durata di retention dei log:

```yaml title="clickhouse-users-logs.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resourcesPreset: small
  size: 10Gi
  logStorageSize: 5Gi
  logTTL: 30
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
  users:
    admin:
      password: MonMotDePasseAdmin2024
    analyst:
      password: AnalysteSecure2024
      readonly: true
```

- **`logStorageSize`**: dimensione del volume persistente dedicato ai log (predefinito: `2Gi`)
- **`logTTL`**: durata di retention in giorni per `query_log` e `query_thread_log` (predefinito: `15`)

:::note
Regolate `logTTL` in base alle vostre esigenze di audit. Un valore elevato consuma più spazio disco (`logStorageSize`). Per un ambiente di sviluppo, `7` giorni e generalmente sufficiente.
:::

### 4. Applicare le modifiche

```bash
kubectl apply -f clickhouse-users-logs.yaml
```

### 5. Connettersi con clickhouse-client

Testate la connessione con ogni utente:

```bash
# Connessione con l'utente admin
kubectl exec -it my-clickhouse-0-0 -- clickhouse-client --user admin --password MonMotDePasseAdmin2024
```

```bash
# Connessione con l'utente analyst
kubectl exec -it my-clickhouse-0-0 -- clickhouse-client --user analyst --password AnalysteSecure2024
```

### 6. Verificare i permessi

Una volta connessi con l'utente `analyst`, verificate che la scrittura sia bloccata:

```sql
-- Questa query deve riuscire (lettura autorizzata)
SELECT count() FROM system.tables;

-- Questa query deve fallire (scrittura vietata)
CREATE TABLE test_write (id UInt32) ENGINE = Memory;
```

L'utente in sola lettura ricevera un errore del tipo:

```console
Code: 164. DB::Exception: analyst: Not enough privileges.
```

## Verifica

Verificate che gli utenti siano correttamente configurati:

```bash
# Verificare la configurazione della risorsa ClickHouse
kubectl get clickhouse my-clickhouse -o yaml | grep -A 10 users

# Verificare che i pod siano nello stato Running
kubectl get pods -l app.kubernetes.io/instance=my-clickhouse
```

Connettetevi come admin ed elencate gli utenti:

```sql
SELECT name, storage, auth_type FROM system.users;
```

## Per approfondire

- [Riferimento API](../api-reference.md) -- Parametri `users`, `logStorageSize` e `logTTL`
- [Come scalare verticalmente ClickHouse](./scale-resources.md) -- Regolare le risorse CPU e memoria
- [Come configurare lo sharding](./configure-sharding.md) -- Distribuzione orizzontale dei dati
