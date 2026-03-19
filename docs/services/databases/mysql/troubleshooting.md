---
sidebar_position: 7
title: Depannage
---

# Depannage — MySQL

### Replication cassee (binlog purge)

**Cause** : le binary log (binlog) a ete purge sur le primary avant que le replica n'ait pu le lire. C'est un probleme connu du MariaDB Operator lorsque `mariadbbackup` n'est pas encore utilise pour initialiser les noeuds.

**Solution** :

1. Identifiez le replica desynchronise :
   ```bash
   kubectl get pods -l app=mysql-<name>
   ```
2. Effectuez un dump depuis un replica fonctionnel et restaurez-le sur le primary :
   ```bash
   mysqldump -h <replica-host> -P 3306 -u<user> -p<password> --column-statistics=0 <database> <table> > fix-table.sql
   mysql -h <primary-host> -P 3306 -u<user> -p<password> <database> < fix-table.sql
   ```
3. Verifiez que la replication reprend correctement apres la restauration.

:::note
Ce probleme est reference dans le [MariaDB Operator](https://github.com/mariadb-operator/mariadb-operator/issues/141). Une correction automatique est prevue dans les futures versions de l'operateur.
:::

### Backup Restic echoue

**Cause** : les identifiants S3 sont incorrects, l'endpoint est inaccessible, ou le `resticPassword` ne correspond pas a celui utilise lors de l'initialisation du depot.

**Solution** :

1. Verifiez les logs du pod de backup :
   ```bash
   kubectl logs -l app=mysql-<name>-backup
   ```
2. Assurez-vous que les parametres S3 sont corrects dans votre manifeste :
   - `s3Bucket` : le bucket existe et est accessible
   - `s3AccessKey` / `s3SecretKey` : les cles sont valides
   - `s3Region` : la region correspond a celle du bucket
3. Verifiez que le `resticPassword` est identique a celui utilise lors de la premiere sauvegarde. Un changement de mot de passe rend les anciennes sauvegardes inaccessibles.
4. Testez la connectivite vers l'endpoint S3 depuis le cluster.

### Connexion refusee

**Cause** : les pods MySQL ne sont pas en cours d'execution, le nom du Secret est incorrect, ou la limite `maxUserConnections` est atteinte.

**Solution** :

1. Verifiez que les pods sont en etat `Running` :
   ```bash
   kubectl get pods -l app=mysql-<name>
   ```
2. Recuperez les identifiants depuis le Secret. Le pattern est `mysql-<name>-auth` :
   ```bash
   kubectl get secret mysql-<name>-auth -o jsonpath='{.data.password}' | base64 -d
   ```
3. Verifiez que la limite `maxUserConnections` n'est pas atteinte pour l'utilisateur concerne.
4. Testez la connexion depuis un pod dans le cluster :
   ```bash
   kubectl run test-mysql --rm -it --image=mariadb:11 -- mysql -h mysql-<name> -P 3306 -u<user> -p
   ```

### Pod en CrashLoopBackOff

**Cause** : le pod redemarre en boucle, generalement a cause d'un manque de memoire (OOMKilled) ou d'une configuration invalide.

**Solution** :

1. Consultez les logs du pod precedent pour identifier l'erreur :
   ```bash
   kubectl logs mysql-<name>-0 --previous
   ```
2. Verifiez si le pod a ete tue pour depassement memoire (OOMKilled) :
   ```bash
   kubectl describe pod mysql-<name>-0 | grep -i oom
   ```
3. Si c'est un probleme de memoire, augmentez le `resourcesPreset` ou definissez des `resources` explicites :
   ```yaml title="mysql.yaml"
   spec:
     resourcesPreset: medium    # Passer de nano/micro a medium ou plus
   ```
4. Appliquez la modification et attendez le redemarrage :
   ```bash
   kubectl apply -f mysql.yaml
   ```

### Espace disque plein

**Cause** : le volume persistant est sature par les donnees, les logs binaires ou les fichiers temporaires.

**Solution** :

1. Verifiez l'utilisation du disque dans le pod :
   ```bash
   kubectl exec mysql-<name>-0 -- df -h /var/lib/mysql
   ```
2. Augmentez la taille du volume dans votre manifeste :
   ```yaml title="mysql.yaml"
   spec:
     size: 20Gi    # Augmenter depuis la valeur actuelle
   ```
3. Appliquez la modification :
   ```bash
   kubectl apply -f mysql.yaml
   ```
4. Si le probleme est urgent, nettoyez les donnees obsoletes depuis un client MySQL.

:::warning
Ne reduisez jamais la valeur de `size`. L'augmentation de volume est supportee, mais la reduction ne l'est pas.
:::
