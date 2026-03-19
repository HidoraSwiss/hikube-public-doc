---
sidebar_position: 2
title: Avvio rapido
---

# Distribuire ClickHouse in 5 minuti

Questa guida vi accompagna nel deployment del vostro primo database **ClickHouse** su Hikube in **pochi minuti**!

---

## Obiettivi

Alla fine di questa guida, avrete:

- Un database **ClickHouse** distribuito su Hikube
- Una configurazione iniziale con **shard** e **repliche** adattata alle vostre esigenze
- Un utente e una password per connettervi
- Un'archiviazione persistente per conservare i vostri dati

---

## Prerequisiti

Prima di iniziare, assicuratevi di avere:

- **kubectl** configurato con il vostro kubeconfig Hikube
- **Diritti di amministratore** sul vostro tenant
- Un **namespace** disponibile per ospitare il vostro database
- (Opzionale) Un bucket **S3-compatible** se desiderate attivare i backup automatici

---

## Passo 1: Creare il manifesto ClickHouse

### **Preparate il file manifest**

Create un file `clickhouse.yaml` come segue:

```yaml title="clickhouse.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: example
spec:
#   backup:
#     cleanupStrategy: --keep-last=3 --keep-daily=3 --keep-within-weekly=1m
#     enabled: false
#     resticPassword: <password>
#     s3AccessKey: <your-access-key>
#     s3Bucket: s3.example.org/clickhouse-backups
#     s3Region: us-east-1
#     s3SecretKey: <your-secret-key>
#     schedule: 0 2 * * *
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
  logStorageSize: 2Gi
  logTTL: 15
  replicas: 2
  resources:
    cpu: 3000m
    memory: 3Gi
  resourcesPreset: small
  shards: 1
  size: 10Gi
  storageClass: ""
  users:
    user1:
      password: strongpassword
    user2:
      readonly: true
      password: hackme
```

### **Distribuite il yaml ClickHouse**

```bash
# Applicare il yaml
kubectl apply -f clickhouse.yaml
```

---

## Passo 2: Verifica del deployment

Verificate lo stato del vostro cluster ClickHouse (può richiedere 1-2 minuti):

```bash
kubectl get clickhouse
```

**Risultato atteso:**

```console
NAME      READY   AGE     VERSION
example   True    2m48s   0.13.0
```

---

## Passo 3: Verifica dei pod

Verificate che i pod applicativi siano nello stato `Running`:

```bash
kubectl get po | grep clickhouse
```

**Risultato atteso:**

```console
chi-clickhouse-example-clickhouse-0-0-0           1/1     Running     0             3m43s
chi-clickhouse-example-clickhouse-0-1-0           1/1     Running     0             2m28s
chk-clickhouse-example-keeper-cluster1-0-0-0      1/1     Running     0             3m17s
chk-clickhouse-example-keeper-cluster1-0-1-0      1/1     Running     0             2m50s
chk-clickhouse-example-keeper-cluster1-0-2-0      1/1     Running     0             2m28s
```

Con `replicas: 2` e `shards: 1`, ottenete **2 pod ClickHouse** (repliche dello shard) e **3 pod ClickHouse Keeper** per il coordinamento del cluster.

---

## Passo 4: Recuperare le credenziali

Le password sono memorizzate in un Secret Kubernetes:

```bash
kubectl get secret clickhouse-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Risultato atteso:**

```console
backup: vIdZUNiaLKaVbIvl
user1: strongpassword
user2: hackme
```

---

## Passo 5: Connessione e test

### Port-forward del servizio ClickHouse

```bash
kubectl port-forward svc/chendpoint-clickhouse-example 9000:9000
```

### Test di connessione con clickhouse-client

In un altro terminale, connettetevi e verificate la versione di ClickHouse:

```bash
clickhouse-client \
  --host 127.0.0.1 \
  --port 9000 \
  --user user1 \
  --password 'strongpassword' \
  --query "SHOW DATABASES;"
```

**Risultato atteso:**

```console
INFORMATION_SCHEMA
default
information_schema
system
```

---

## Passo 6: Risoluzione rapida dei problemi

### Pod in CrashLoopBackOff

```bash
# Verificare i log del pod ClickHouse in errore
kubectl logs chi-clickhouse-example-clickhouse-0-0-0

# Verificare gli eventi del pod
kubectl describe pod chi-clickhouse-example-clickhouse-0-0-0
```

**Cause frequenti:** memoria insufficiente (`resources.memory` troppo bassa), volume di archiviazione pieno, errore nella configurazione degli shard o delle repliche.

### ClickHouse non accessibile

```bash
# Verificare che i servizi esistano
kubectl get svc | grep clickhouse

# Verificare il servizio endpoint
kubectl describe svc chendpoint-clickhouse-example
```

**Cause frequenti:** port-forward non attivo, porta errata (9000 per il protocollo nativo, 8123 per HTTP), servizio non pronto.

### ClickHouse Keeper non funzionale

```bash
# Verificare i log del Keeper
kubectl logs chk-clickhouse-example-keeper-cluster1-0-0-0

# Verificare lo stato dei pod Keeper
kubectl get pods | grep keeper
```

**Cause frequenti:** il quorum Keeper necessità di un numero dispari di repliche (3 minimo raccomandato), spazio disco Keeper insufficiente (`clickhouseKeeper.size` troppo basso).

### Comandi di diagnostica generali

```bash
# Eventi recenti sul namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Stato dettagliato del cluster ClickHouse
kubectl describe clickhouse example
```

---

## 📋 Riepilogo

Avete distribuito:

- Un database **ClickHouse** sul vostro tenant Hikube
- Una configurazione iniziale con **shard** e **repliche**
- Un componente **ClickHouse Keeper** per il coordinamento del cluster
- Un'archiviazione persistente collegata per i vostri dati e log
- Utenti con password generate e memorizzate in un Secret Kubernetes
- Un accesso al vostro database tramite `clickhouse-client`
- La possibilità di configurare **backup S3** automatici

---

## Pulizia

Per eliminare le risorse di test:

```bash
kubectl delete -f clickhouse.yaml
```

:::warning
Questa azione elimina il cluster ClickHouse e tutti i dati associati. Questa operazione e **irreversibile**.
:::

---

## Prossimi passi

- **[Riferimento API](./api-reference.md)**: Configurazione completa di tutte le opzioni ClickHouse
- **[Panoramica](./overview.md)**: Architettura dettagliata e casi d'uso ClickHouse su Hikube
