---
title: "Come gestire utenti e database"
---

# Come gestire utenti e database

Questa guida vi spiega come creare e gestire gli utenti, i database e i ruoli di accesso della vostra istanza MySQL su Hikube. Imparerete anche a commutare il nodo primary in un cluster replicato.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Un'istanza **MySQL** distribuita sul vostro tenant
- Un client **mysql** per testare le connessioni

## Passaggi

### 1. Aggiungere un utente

Gli utenti sono definiti nella sezione `users` del manifesto. Ogni utente è identificato da un nome e può avere una password e un limite di connessioni:

```yaml title="mysql-users.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: example
spec:
  replicas: 2
  size: 10Gi
  resourcesPreset: small

  users:
    appuser:
      password: SecureAppPassword
      maxUserConnections: 100
    analytics:
      password: SecureAnalyticsPassword
      maxUserConnections: 20
    readonly:
      password: SecureReadOnlyPassword
      maxUserConnections: 10
```

| Parametro | Descrizione | Predefinito |
|---|---|---|
| `users[name].password` | Password dell'utente | `""` |
| `users[name].maxUserConnections` | Numero massimo di connessioni simultanee per questo utente | `0` (illimitato) |

:::tip
Limitate il `maxUserConnections` per utente per evitare che un'applicazione consumi tutte le connessioni disponibili del server.
:::

### 2. Creare un database con ruoli

I database sono definiti nella sezione `databases`. Ogni database può assegnare ruoli **admin** (lettura/scrittura) o **readonly** (sola lettura) agli utenti:

```yaml title="mysql-databases.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: example
spec:
  replicas: 2
  size: 10Gi
  resourcesPreset: small

  users:
    appuser:
      password: SecureAppPassword
      maxUserConnections: 100
    analytics:
      password: SecureAnalyticsPassword
      maxUserConnections: 20
    readonly:
      password: SecureReadOnlyPassword
      maxUserConnections: 10

  databases:
    production:
      roles:
        admin:
          - appuser          # appuser ha i diritti completi su "production"
        readonly:
          - readonly         # readonly può solo leggere "production"
          - analytics        # analytics può anche leggere "production"
    analytics_db:
      roles:
        admin:
          - analytics        # analytics ha i diritti completi su "analytics_db"
        readonly:
          - readonly         # readonly può leggere "analytics_db"
```

:::note
Uno stesso utente può avere ruoli diversi su database diversi. Ad esempio, `analytics` e **admin** su `analytics_db` ma **readonly** su `production`.
:::

### 3. Applicare le modifiche

Applicate il manifesto per creare o aggiornare utenti e database:

```bash
kubectl apply -f mysql-databases.yaml
```

### 4. Recuperare le credenziali

Le password sono memorizzate in un Secret Kubernetes chiamato `<instance>-credentials`:

```bash
kubectl get secret example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Risultato atteso:**

```console
root: cr42msoxKhnEajfo
appuser: SecureAppPassword
analytics: SecureAnalyticsPassword
readonly: SecureReadOnlyPassword
```

:::tip
La password `root` e generata automaticamente dall'operatore. Utilizzatela solo per l'amministrazione del cluster, mai nelle vostre applicazioni.
:::

### 5. Testare la connessione

#### Tramite port-forward (accesso interno)

```bash
kubectl port-forward svc/mysql-example 3306:3306
```

```bash
mysql -h 127.0.0.1 -P 3306 -u appuser -p production
```

#### Tramite LoadBalancer (se `external: true`)

```bash
# Recuperare l'IP esterno
kubectl get svc mysql-example-primary -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

```bash
mysql -h <IP_ESTERNO> -P 3306 -u appuser -p production
```

Verificate i diritti dell'utente:

```sql
-- Come appuser (admin su production)
SHOW DATABASES;
CREATE TABLE test (id INT PRIMARY KEY);
INSERT INTO test VALUES (1);

-- Come readonly (sola lettura su production)
SELECT * FROM test;       -- OK
INSERT INTO test VALUES (2);  -- ERRORE: accesso negato
```

### 6. Commutare il nodo primary (opzionale)

In un cluster MySQL replicato, un nodo e designato come **primary** (scritture) e gli altri come **repliche** (lettura). Potete commutare il ruolo primary verso un altro nodo, ad esempio durante una manutenzione.

#### Modificare la risorsa MariaDB

```bash
kubectl edit mariadb mysql-example
```

Modificate la sezione `replication` per designare il nuovo primary:

```yaml title="switchover.yaml"
spec:
  replication:
    primary:
      podIndex: 1   # Promuovere mysql-example-1 a primary
```

#### Verificare la commutazione

```bash
kubectl get mariadb
```

**Risultato atteso:**

```console
NAME            READY   STATUS    PRIMARY           UPDATES                    AGE
mysql-example   True    Running   mysql-example-1   ReplicasFirstPrimaryLast   84m
```

:::warning
La commutazione del primary può comportare una **breve interruzione delle scritture** durante la promozione del nuovo nodo. Le letture restano disponibili tramite le repliche.
:::

## Verifica

Verificate la configurazione completa della vostra istanza:

```bash
kubectl get mariadb example -o yaml
```

Assicuratevi che:
- Gli utenti siano presenti nella sezione `users`
- I database siano elencati nella sezione `databases`
- I ruoli siano correttamente assegnati

## Per approfondire

- [Riferimento API](../api-reference.md): lista completa dei parametri utenti e database
- [Come scalare verticalmente](./scale-resources.md): regolare le risorse CPU e memoria
