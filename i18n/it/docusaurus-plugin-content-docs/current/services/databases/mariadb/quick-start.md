---
sidebar_position: 2
title: Avvio rapido
---

# Distribuire MySQL in 5 minuti

Questa guida vi accompagna nel deployment del vostro primo database **MySQL** su Hikube, dall'installazione alla prima connessione.

---

## Obiettivi

Alla fine di questa guida, avrete:

- Un database **MySQL** operativo su Hikube
- Un cluster replicato con un **primary** e delle **repliche** per garantire l'alta disponibilità
- **Utenti e password** per accedere alle vostre applicazioni
- Un'**archiviazione persistente** collegata a ogni istanza per garantire la durabilita dei dati
- (Opzionale) La possibilità di attivare **backup automatici** verso uno storage compatibile S3

---

## Prerequisiti

Prima di iniziare, assicuratevi di avere:

- **kubectl** configurato con il vostro kubeconfig Hikube
- **Diritti di amministratore** sul vostro tenant
- Un **namespace** disponibile per ospitare il vostro database
- (Opzionale) Un bucket **S3-compatible** se desiderate attivare i backup automatici tramite MariaDB-Operator

---

## Passo 1: Creare il manifesto MySQL

### **Preparate il file manifest**

Create un file `mysql.yaml` come segue:

```yaml title="mysql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example
spec:
  backup:
    cleanupStrategy: --keep-last=3 --keep-daily=3 --keep-within-weekly=1m
    enabled: false
    resticPassword: <password>
    s3AccessKey: <your-access-key>
    s3Bucket: s3.example.org/mysql-backups
    s3Region: us-east-1
    s3SecretKey: <your-secret-key>
    schedule: 0 2 * * *
  databases:
    myapp1:
      roles:
        admin:
        - user1
        readonly:
        - user2
  external: true
  replicas: 3
  resources:
    cpu: 3000m
    memory: 3Gi
  resourcesPreset: nano
  size: 10Gi
  storageClass: ""
  users:
    user1:
      maxUserConnections: 1000
      password: hackme
    user2:
      maxUserConnections: 1000
      password: hackme
```

### **Distribuite il yaml MySQL**

```bash
# Applicare il yaml
kubectl apply -f mysql.yaml
```

---

## Passo 2: Verifica del deployment

Verificate lo stato del vostro cluster MySQL (può richiedere 1-2 minuti):

```bash
kubectl get mysql
```

**Risultato atteso:**

```console
NAME      READY   AGE     VERSION
example   True    1m16s   0.10.0
```

---

## Passo 3: Verifica dei pod

Verificate che i pod applicativi siano nello stato `Running`:

```bash
kubectl get po -o wide | grep mysql
```

**Risultato atteso:**

```console
mysql-example-0                                   1/1     Running     0             24m   10.244.123.64    gld-csxhk-006   <none>           <none>
mysql-example-1                                   1/1     Running     0             24m   10.244.123.65    luc-csxhk-005   <none>           <none>
mysql-example-2                                   1/1     Running     0             24m   10.244.123.66    plo-csxhk-001   <none>           <none>
mysql-example-metrics-747cf456c9-6vnq9            1/1     Running     0             23m   10.244.123.73    plo-csxhk-004   <none>           <none>
```

Con `replicas: 3`, ottenete **3 istanze MySQL** (1 primary + 2 repliche) distribuite su datacenter diversi, più un pod di metriche.

Verificate che ogni istanza disponga di un volume persistente (PVC):

```bash
kubectl get pvc | grep mysql
```

**Risultato atteso:**

```console
storage-mysql-example-0                    Bound     pvc-3622a61d-7432-4a36-9812-953e30f85fbe   10Gi       RWO            local          <unset>                 24m
storage-mysql-example-1                    Bound     pvc-b9933029-c9c6-40c2-a67d-69dcb224a9bb   10Gi       RWO            local          <unset>                 24m
storage-mysql-example-2                    Bound     pvc-597da2f3-1604-416c-a480-2dae7aae75e1   10Gi       RWO            local          <unset>                 24m
```

---

## Passo 4: Recuperare le credenziali

Le password sono memorizzate in un Secret Kubernetes:

```bash
kubectl get secret mysql-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Risultato atteso:**

```console
root: cr42msoxKhnEajfo
user1: hackme
user2: hackme
```

---

## Passo 5: Connessione e test

### Accesso esterno (se `external: true`)

Verificate i servizi disponibili:

```bash
kubectl get svc | grep mysql
```

```console
mysql-example                        ClusterIP      10.96.149.25    <none>          3306/TCP                     27m
mysql-example-internal               ClusterIP      None            <none>          3306/TCP                     27m
mysql-example-metrics                ClusterIP      10.96.101.154   <none>          9104/TCP                     26m
mysql-example-primary                LoadBalancer   10.96.161.170   91.223.132.64   3306:32537/TCP               27m
mysql-example-secondary              ClusterIP      10.96.105.28    <none>          3306/TCP                     27m
```

### Accesso tramite port-forward (se `external: false`)

```bash
kubectl port-forward svc/mysql-example 3306:3306
```

:::note
Si raccomanda di non esporre il database all'esterno se non ne avete necessità.
:::

### Test di connessione con mysql

```bash
mysql -h 91.223.132.64 -u user1 -p myapp1
```

```console
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 1214
Server version: 11.0.2-MariaDB-1:11.0.2+maria~ubu2204-log mariadb.org binary distribution

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| myapp1             |
+--------------------+
2 rows in set (0.00 sec)

mysql>
```

---

## Passo 6: Risoluzione rapida dei problemi

### Pod in CrashLoopBackOff

```bash
# Verificare i log del pod in errore
kubectl logs mysql-example-0

# Verificare gli eventi del pod
kubectl describe pod mysql-example-0
```

**Cause frequenti:** memoria insufficiente (`resources.memory` troppo bassa), volume di archiviazione pieno, errore di configurazione MariaDB.

### MySQL non accessibile

```bash
# Verificare che i servizi esistano
kubectl get svc | grep mysql

# Verificare che il LoadBalancer abbia un IP esterno
kubectl describe svc mysql-example-primary
```

**Cause frequenti:** `external: false` nel manifesto, LoadBalancer in attesa di assegnazione IP, porta o nome host errato nella stringa di connessione.

### Replica in errore

```bash
# Verificare lo stato del cluster MariaDB
kubectl get mariadb

# Ispezionare i dettagli della risorsa MariaDB
kubectl describe mariadb mysql-example
```

**Cause frequenti:** binlog eliminato prima della sincronizzazione di una replica, spazio disco insufficiente, problema di rete tra i nodi.

### Comandi di diagnostica generali

```bash
# Eventi recenti sul namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Stato dettagliato del cluster MySQL
kubectl describe mysql example
```

---

## 📋 Riepilogo

Avete distribuito:

- Un database **MySQL** sul vostro tenant Hikube
- Un cluster replicato con un **primary** e delle **repliche** per assicurare la continuità del servizio
- Utenti creati automaticamente, con le loro credenziali memorizzate nei Secret Kubernetes
- Un'archiviazione persistente (PVC) dedicata a ogni pod MySQL per garantire la durabilita dei dati
- Un accesso sicuro tramite il client `mysql` (port-forward o LoadBalancer)
- La possibilità di configurare **backup S3** e ripristinare in caso di necessità

---

## Pulizia

Per eliminare le risorse di test:

```bash
kubectl delete -f mysql.yaml
```

:::warning
Questa azione elimina il cluster MySQL e tutti i dati associati. Questa operazione e **irreversibile**.
:::

---

## Prossimi passi

- **[Riferimento API](./api-reference.md)**: Configurazione completa di tutte le opzioni MySQL
- **[Panoramica](./overview.md)**: Architettura dettagliata e casi d'uso MySQL su Hikube
