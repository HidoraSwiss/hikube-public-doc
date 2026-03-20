---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — MySQL

### Defekte Replikation (Binlog gelöscht)

**Ursache**: Das Binary Log (Binlog) wurde auf dem Primary gelöscht, bevor das Replika es lesen konnte. Dies ist ein bekanntes Problem des MariaDB Operators, wenn `mariadbbackup` noch nicht zur Initialisierung der Knoten verwendet wird.

**Lösung**:

1. Identifizieren Sie das desynchronisierte Replika:
   ```bash
   kubectl get pods -l app=mysql-<name>
   ```
2. Führen Sie einen Dump von einem funktionierenden Replika durch und stellen Sie ihn auf dem Primary wieder her:
   ```bash
   mysqldump -h <replica-host> -P 3306 -u<user> -p<password> --column-statistics=0 <database> <table> > fix-table.sql
   mysql -h <primary-host> -P 3306 -u<user> -p<password> <database> < fix-table.sql
   ```
3. Überprüfen Sie, dass die Replikation nach der Wiederherstellung korrekt fortgesetzt wird.

:::note
Dieses Problem ist im [MariaDB Operator](https://github.com/mariadb-operator/mariadb-operator/issues/141) referenziert. Eine automatische Korrektur ist in zukünftigen Versionen des Operators geplant.
:::

### Restic-Backup fehlgeschlagen

**Ursache**: Die S3-Anmeldedaten sind falsch, der Endpoint ist nicht erreichbar oder das `resticPassword` stimmt nicht mit dem bei der Initialisierung des Repositories verwendeten überein.

**Lösung**:

1. Überprüfen Sie die Logs des Backup-Pods:
   ```bash
   kubectl logs -l app=mysql-<name>-backup
   ```
2. Stellen Sie sicher, dass die S3-Parameter in Ihrem Manifest korrekt sind:
   - `s3Bucket`: Der Bucket existiert und ist zugänglich
   - `s3AccessKey` / `s3SecretKey`: Die Schlüssel sind gültig
   - `s3Region`: Die Region entspricht der des Buckets
3. Überprüfen Sie, dass das `resticPassword` identisch mit dem bei der ersten Sicherung verwendeten ist. Eine Passwortänderung macht alte Sicherungen unzugänglich.
4. Testen Sie die Verbindung zum S3-Endpoint vom Cluster aus.

### Verbindung verweigert

**Ursache**: Die MySQL-Pods laufen nicht, der Secret-Name ist falsch oder das `maxUserConnections`-Limit ist erreicht.

**Lösung**:

1. Überprüfen Sie, dass die Pods den Status `Running` haben:
   ```bash
   kubectl get pods -l app=mysql-<name>
   ```
2. Rufen Sie die Anmeldedaten aus dem Secret ab. Das Muster ist `mysql-<name>-auth`:
   ```bash
   kubectl get tenantsecret mysql-<name>-auth -o jsonpath='{.data.password}' | base64 -d
   ```
3. Überprüfen Sie, dass das `maxUserConnections`-Limit für den betreffenden Benutzer nicht erreicht ist.
4. Testen Sie die Verbindung von einem Pod im Cluster:
   ```bash
   kubectl run test-mysql --rm -it --image=mariadb:11 -- mysql -h mysql-<name> -P 3306 -u<user> -p
   ```

### Pod im CrashLoopBackOff

**Ursache**: Der Pod startet in einer Schleife neu, üblicherweise wegen Speichermangel (OOMKilled) oder einer ungültigen Konfiguration.

**Lösung**:

1. Prüfen Sie die Logs des vorherigen Pods, um den Fehler zu identifizieren:
   ```bash
   kubectl logs mysql-<name>-0 --previous
   ```
2. Prüfen Sie, ob der Pod wegen Speicherüberschreitung (OOMKilled) beendet wurde:
   ```bash
   kubectl describe pod mysql-<name>-0 | grep -i oom
   ```
3. Bei einem Speicherproblem erhöhen Sie den `resourcesPreset` oder definieren Sie explizite `resources`:
   ```yaml title="mysql.yaml"
   spec:
     resourcesPreset: medium    # Von nano/micro auf medium oder höher wechseln
   ```
4. Wenden Sie die Änderung an und warten Sie auf den Neustart:
   ```bash
   kubectl apply -f mysql.yaml
   ```

### Festplatte voll

**Ursache**: Das persistente Volume ist durch Daten, Binary Logs oder temporäre Dateien gesättigt.

**Lösung**:

1. Überprüfen Sie die Festplattennutzung im Pod:
   ```bash
   kubectl exec mysql-<name>-0 -- df -h /var/lib/mysql
   ```
2. Erhöhen Sie die Volume-Größe in Ihrem Manifest:
   ```yaml title="mysql.yaml"
   spec:
     size: 20Gi    # Vom aktuellen Wert erhöhen
   ```
3. Wenden Sie die Änderung an:
   ```bash
   kubectl apply -f mysql.yaml
   ```
4. Bei dringendem Bedarf bereinigen Sie veraltete Daten über einen MySQL-Client.

:::warning
Verringern Sie niemals den Wert von `size`. Die Volume-Vergrößerung wird unterstützt, die Verkleinerung jedoch nicht.
:::
