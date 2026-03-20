---
sidebar_position: 2
title: Avvio rapido
---

# Distribuire PostgreSQL in 5 minuti

Questa guida vi accompagna nel deployment del vostro primo database **PostgreSQL** su Hikube, dall'installazione alla prima connessione.

---

## Obiettivi

Alla fine di questa guida, avrete:

- Un database **PostgreSQL** distribuito su Hikube
- Un cluster replicato con un **primary** e delle **repliche** per garantire l'alta disponibilità
- Un utente e una password per connettervi
- Un'archiviazione persistente per conservare i vostri dati

---

## Prerequisiti

Prima di iniziare, assicuratevi di avere:

- **kubectl** configurato con il vostro kubeconfig Hikube
- **Diritti di amministratore** sul vostro tenant
- Un **namespace** disponibile per ospitare il vostro database
- (Opzionale) Un bucket **S3-compatible** se desiderate attivare i backup automatici tramite CloudNativePG

---

## Passo 1: Creare il manifesto PostgreSQL

### **Preparate il file manifest**

Create un file `postgresql.yaml` come segue:

```yaml title="postgresql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: example
spec:
  # configuration backup
  backup:
    enabled: false
    destinationPath: s3://bucket/path/to/folder/
    endpointURL: https://prod.s3.hikube.cloud
    retentionPolicy: 30d
    s3AccessKey: <your-access-key>
    s3SecretKey: <your-secret-key>
    schedule: 0 2 * * * *
  bootstrap:
    enabled: false
    oldName: ""
    recoveryTime: ""
  # creation databases
  databases:
    airflow:
      extensions:
      - hstore
      roles: # assign roles to the database
        admin:
        - airflow
    myapp:
      roles:
        admin:
        - user1
        - debezium
        readonly:
        - user2
  external: true # create service LoadBalancer if true (with public IP)
  # define parameters about postgresql
  postgresql:
    parameters:
      max_connections: 200
  quorum:
    maxSyncReplicas: 0
    minSyncReplicas: 0
  replicas: 3 # total number of postgresql instance
  resources:
    cpu: 3000m
    memory: 3Gi
  resourcesPreset: micro
  size: 10Gi
  storageClass: ""
  # create users
  users:
    airflow:
      password: qwerty123
    debezium:
      replication: true
    user1:
      password: strongpassword
    user2:
      password: hackme
```

### **Distribuite il yaml PostgreSQL**

```bash
# Applicare il yaml
kubectl apply -f postgresql.yaml
```

---

## Passo 2: Verifica del deployment

Verificate lo stato del vostro cluster PostgreSQL (può richiedere 1-2 minuti):

```bash
kubectl get postgreses
```

**Risultato atteso:**

```console
NAME      READY   AGE     VERSION
example   True    1m36s   0.18.0
```

---

## Passo 3: Verifica dei pod

Verificate che i pod applicativi siano nello stato `Running`:

```bash
kubectl get po -o wide | grep postgres
```

**Risultato atteso:**

```console
postgres-example-1                                1/1     Running     0             23m   10.244.117.142   gld-csxhk-006   <none>           <none>
postgres-example-2                                1/1     Running     0             19m   10.244.117.168   luc-csxhk-005   <none>           <none>
postgres-example-3                                1/1     Running     0             18m   10.244.117.182   plo-csxhk-004   <none>           <none>
```

Con `replicas: 3`, ottenete **3 istanze PostgreSQL** distribuite su datacenter diversi per l'alta disponibilità.

Verificate che ogni istanza disponga di un volume persistente (PVC):

```bash
kubectl get pvc | grep postgres
```

**Risultato atteso:**

```console
postgres-example-1                         Bound     pvc-36fbac70-f976-4ef5-ae64-29b06817b18a   10Gi       RWO            local          <unset>                 9m43s
postgres-example-2                         Bound     pvc-f042a765-0ffd-46e5-a1f2-c703fe59b56c   10Gi       RWO            local          <unset>                 8m38s
postgres-example-3                         Bound     pvc-1dcbab1f-18c1-4eae-9b12-931c8c2f9a74   10Gi       RWO            local          <unset>                 4m28s
```

---

## Passo 4: Recuperare le credenziali

Le password sono memorizzate in un Secret Kubernetes:

```bash
kubectl get secret postgres-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Risultato atteso:**

```console
airflow: qwerty123
debezium: tJ7H4RLTEYckNY7C
user1: strongpassword
user2: hackme
```

---

## Passo 5: Connessione e test

### Accesso esterno (se `external: true`)

Verificate i servizi disponibili:

```bash
kubectl get svc | grep postgre
```

```console
postgres-example-external-write      LoadBalancer   10.96.171.243   91.223.132.64   5432/TCP                     10m
postgres-example-r                   ClusterIP      10.96.18.28     <none>          5432/TCP                     10m
postgres-example-ro                  ClusterIP      10.96.238.251   <none>          5432/TCP                     10m
postgres-example-rw                  ClusterIP      10.96.59.254    <none>          5432/TCP                     10m
```

### Accesso tramite port-forward (se `external: false`)

```bash
kubectl port-forward svc/postgres-example-rw 5432:5432
```

:::note
Si raccomanda di non esporre il database all'esterno se non ne avete necessità.
:::

### Test di connessione con psql

```bash
psql -h 91.223.132.64 -U user1 myapp
```

```console
psql (17.4, server 17.2 (Debian 17.2-1.pgdg110+1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off, ALPN: postgresql)
Type "help" for help.

myapp=> \du
                                 List of roles
     Role name     |                         Attributes
-------------------+------------------------------------------------------------
 airflow           |
 airflow_admin     | No inheritance, Cannot login
 airflow_readonly  | No inheritance, Cannot login
 app               |
 debezium          | Replication
 myapp_admin       | No inheritance, Cannot login
 myapp_readonly    | No inheritance, Cannot login
 postgres          | Superuser, Create role, Create DB, Replication, Bypass RLS
 streaming_replica | Replication
 user1             |
 user2             |

myapp=>
```

---

## Passo 6: Risoluzione rapida dei problemi

### Pod in CrashLoopBackOff

```bash
# Verificare i log del pod in errore
kubectl logs postgres-example-1

# Verificare gli eventi del pod
kubectl describe pod postgres-example-1
```

**Cause frequenti:** memoria insufficiente (`resources.memory` troppo bassa), volume di archiviazione pieno, errore di configurazione PostgreSQL in `postgresql.parameters`.

### PostgreSQL non accessibile

```bash
# Verificare che i servizi esistano
kubectl get svc | grep postgres

# Verificare che il LoadBalancer abbia un IP esterno
kubectl describe svc postgres-example-external-write
```

**Cause frequenti:** `external: false` nel manifesto, LoadBalancer in attesa di assegnazione IP, nome del servizio errato nella stringa di connessione.

### Replica in errore

```bash
# Verificare lo stato del cluster CloudNativePG
kubectl describe postgres example

# Verificare i log del primary
kubectl logs postgres-example-1 -c postgres
```

**Cause frequenti:** archiviazione insufficiente su una replica, problema di rete tra i nodi, parametri `quorum` mal configurati.

### Comandi di diagnostica generali

```bash
# Eventi recenti sul namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Stato dettagliato del cluster PostgreSQL
kubectl describe postgres example
```

---

## 📋 Riepilogo

Avete distribuito:

- Un database **PostgreSQL** sul vostro tenant Hikube
- Un cluster replicato con un **primary** e degli **standby** per l'alta disponibilità
- Utenti e ruoli configurati, con password memorizzate nei Secret Kubernetes
- Un'archiviazione persistente (PVC) collegata a ogni istanza PostgreSQL
- Un accesso sicuro tramite `psql` (servizio interno o LoadBalancer)
- La possibilità di attivare **backup S3** automatici

---

## Pulizia

Per eliminare le risorse di test:

```bash
kubectl delete -f postgresql.yaml
```

:::warning
Questa azione elimina il cluster PostgreSQL e tutti i dati associati. Questa operazione e **irreversibile**.
:::

---

## Prossimi passi

- **[Riferimento API](./api-reference.md)**: Configurazione completa di tutte le opzioni PostgreSQL
- **[Panoramica](./overview.md)**: Architettura dettagliata e casi d'uso PostgreSQL su Hikube
