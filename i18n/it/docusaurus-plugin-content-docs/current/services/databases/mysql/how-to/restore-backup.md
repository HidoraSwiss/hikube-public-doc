---
title: "Come ripristinare un backup"
---

# Come ripristinare un backup

Questa guida vi spiega come ripristinare un database MySQL a partire da un backup Restic archiviato in un bucket S3-compatible. Il ripristino viene effettuato tramite il CLI **Restic** dalla vostra postazione di lavoro.

## Prerequisiti

- **Restic CLI** installato sulla vostra macchina locale
- Le **credenziali S3** utilizzate durante la configurazione dei backup (Access Key, Secret Key)
- La **password Restic** utilizzata per cifrare i backup
- Il **nome del bucket S3** e il percorso del repository
- Un client **mysql** per importare i dati ripristinati

## Passaggi

### 1. Installare Restic CLI

Installate Restic secondo il vostro sistema operativo:

```bash
# macOS (Homebrew)
brew install restic

# Debian / Ubuntu
sudo apt install restic

# Dai binari ufficiali
# https://github.com/restic/restic/releases
```

### 2. Configurare le variabili d'ambiente Restic

Esportate le variabili necessarie affinche Restic possa accedere al repository di backup:

```bash
export AWS_ACCESS_KEY_ID="HIKUBE123ACCESSKEY"
export AWS_SECRET_ACCESS_KEY="HIKUBE456SECRETKEY"
export RESTIC_PASSWORD="SuperStrongResticPassword!"
export RESTIC_REPOSITORY="s3:s3.hikube.cloud/mysql-backups/example"
```

:::warning
Il percorso del repository (`RESTIC_REPOSITORY`) corrisponde al `s3Bucket` configurato nel manifesto MySQL, seguito dal **nome dell'istanza**. Ad esempio, per un'istanza chiamata `example` con `s3Bucket: s3.hikube.cloud/mysql-backups`, il repository sara `s3:s3.hikube.cloud/mysql-backups/example`.
:::

### 3. Elencare gli snapshot disponibili

Visualizzate l'insieme dei backup archiviati nel repository:

```bash
restic snapshots
```

**Risultato atteso:**

```console
repository abc12345 opened successfully
ID        Time                 Host        Tags        Paths
---------------------------------------------------------------
a1b2c3d4  2025-01-15 02:00:05  mysql-example            /backup
e5f6g7h8  2025-01-16 02:00:03  mysql-example            /backup
i9j0k1l2  2025-01-17 02:00:04  mysql-example            /backup
---------------------------------------------------------------
3 snapshots
```

:::tip
Potete filtrare gli snapshot per data con `restic snapshots --latest 5` per visualizzare solo i 5 piu recenti.
:::

### 4. Ripristinare uno snapshot

Ripristinate l'ultimo snapshot (o uno snapshot specifico) in una directory locale:

```bash
# Ripristinare l'ultimo snapshot
restic restore latest --target /tmp/mysql-restore

# Oppure ripristinare uno snapshot specifico tramite il suo ID
restic restore a1b2c3d4 --target /tmp/mysql-restore
```

Il contenuto ripristinato sara disponibile in `/tmp/mysql-restore/backup/`.

### 5. Importare i dati in MySQL

Una volta estratti i file di backup, importateli nella vostra istanza MySQL:

```bash
# Identificare i file di dump ripristinati
ls /tmp/mysql-restore/backup/

# Importare il dump nel database di destinazione
mysql -h <host-mysql> -P 3306 -u <utente> -p <database> < /tmp/mysql-restore/backup/dump.sql
```

:::note
L'indirizzo dell'host MySQL dipende dalla vostra configurazione:
- **Accesso interno** (port-forward): `127.0.0.1` dopo `kubectl port-forward svc/mysql-example 3306:3306`
- **Accesso esterno** (LoadBalancer): l'IP esterno del servizio `mysql-example-primary`
:::

### 6. Pulire i file temporanei

Una volta terminato e verificato il ripristino, eliminate i file temporanei:

```bash
rm -rf /tmp/mysql-restore
```

## Verifica

Connettetevi all'istanza MySQL e verificate che i dati siano stati correttamente ripristinati:

```bash
mysql -h <host-mysql> -P 3306 -u <utente> -p <database>
```

```sql
-- Verificare le tabelle presenti
SHOW TABLES;

-- Verificare il numero di righe in una tabella
SELECT COUNT(*) FROM <nome_tabella>;
```

:::warning Testate il ripristino regolarmente
Si raccomanda fortemente di testare la procedura di ripristino in modo regolare, idealmente in un ambiente di sviluppo. Un backup che non e mai stato testato non garantisce un ripristino riuscito.
:::

## Per approfondire

- [Riferimento API](../api-reference.md): configurazione completa dei parametri di backup
- [Come configurare i backup automatici](./configure-backups.md): configurazione dei backup Restic + S3
