---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — MySQL

### Replica interrotta (binlog eliminato)

**Causa**: il binary log (binlog) è stato eliminato sul primary prima che la replica abbia potuto leggerlo. Questo e un problema noto del MariaDB Operator quando `mariadbbackup` non è ancora utilizzato per inizializzare i nodi.

**Soluzione**:

1. Identificate la replica desincronizzata:
   ```bash
   kubectl get pods -l app=mysql-<name>
   ```
2. Effettuate un dump da una replica funzionante e ripristinatelo sul primary:
   ```bash
   mysqldump -h <replica-host> -P 3306 -u<user> -p<password> --column-statistics=0 <database> <table> > fix-table.sql
   mysql -h <primary-host> -P 3306 -u<user> -p<password> <database> < fix-table.sql
   ```
3. Verificate che la replica riprenda correttamente dopo il ripristino.

:::note
Questo problema e documentato nel [MariaDB Operator](https://github.com/mariadb-operator/mariadb-operator/issues/141). Una correzione automatica e prevista nelle future versioni dell'operatore.
:::

### Backup Restic fallito

**Causa**: le credenziali S3 sono errate, l'endpoint e inaccessibile, o il `resticPassword` non corrisponde a quello utilizzato durante l'inizializzazione del repository.

**Soluzione**:

1. Verificate i log del pod di backup:
   ```bash
   kubectl logs -l app=mysql-<name>-backup
   ```
2. Assicuratevi che i parametri S3 siano corretti nel vostro manifesto:
   - `s3Bucket`: il bucket esiste ed e accessibile
   - `s3AccessKey` / `s3SecretKey`: le chiavi sono valide
   - `s3Region`: la regione corrisponde a quella del bucket
3. Verificate che il `resticPassword` sia identico a quello utilizzato durante il primo backup. Un cambio di password rende i vecchi backup inaccessibili.
4. Testate la connettività verso l'endpoint S3 dal cluster.

### Connessione rifiutata

**Causa**: i pod MySQL non sono in esecuzione, il nome del Secret e errato, o il limite `maxUserConnections` è stato raggiunto.

**Soluzione**:

1. Verificate che i pod siano nello stato `Running`:
   ```bash
   kubectl get pods -l app=mysql-<name>
   ```
2. Recuperate le credenziali dal Secret. Il pattern e `mysql-<name>-auth`:
   ```bash
   kubectl get tenantsecret mysql-<name>-auth -o jsonpath='{.data.password}' | base64 -d
   ```
3. Verificate che il limite `maxUserConnections` non sia stato raggiunto per l'utente interessato.
4. Testate la connessione da un pod nel cluster:
   ```bash
   kubectl run test-mysql --rm -it --image=mariadb:11 -- mysql -h mysql-<name> -P 3306 -u<user> -p
   ```

### Pod in CrashLoopBackOff

**Causa**: il pod si riavvia in loop, generalmente a causa di una mancanza di memoria (OOMKilled) o di una configurazione non valida.

**Soluzione**:

1. Consultate i log del pod precedente per identificare l'errore:
   ```bash
   kubectl logs mysql-<name>-0 --previous
   ```
2. Verificate se il pod è stato terminato per superamento della memoria (OOMKilled):
   ```bash
   kubectl describe pod mysql-<name>-0 | grep -i oom
   ```
3. Se si tratta di un problema di memoria, aumentate il `resourcesPreset` o definite `resources` esplicite:
   ```yaml title="mysql.yaml"
   spec:
     resourcesPreset: medium    # Passare da nano/micro a medium o superiore
   ```
4. Applicate la modifica e attendete il riavvio:
   ```bash
   kubectl apply -f mysql.yaml
   ```

### Spazio disco pieno

**Causa**: il volume persistente e saturato dai dati, dai log binari o dai file temporanei.

**Soluzione**:

1. Verificate l'utilizzo del disco nel pod:
   ```bash
   kubectl exec mysql-<name>-0 -- df -h /var/lib/mysql
   ```
2. Aumentate la dimensione del volume nel vostro manifesto:
   ```yaml title="mysql.yaml"
   spec:
     size: 20Gi    # Aumentare dal valore attuale
   ```
3. Applicate la modifica:
   ```bash
   kubectl apply -f mysql.yaml
   ```
4. Se il problema e urgente, pulite i dati obsoleti da un client MySQL.

:::warning
Non riducete mai il valore di `size`. L'aumento del volume e supportato, ma la riduzione non lo e.
:::
