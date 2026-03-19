---
sidebar_position: 7
title: Dépannage
---

# Dépannage — MySQL

### Réplication cassée (binlog purgé)

**Cause** : le binary log (binlog) a été purgé sur le primary avant que le réplica n'ait pu le lire. C'est un problème connu du MariaDB Operator lorsque `mariadbbackup` n'est pas encore utilisé pour initialiser les nœuds.

**Solution** :

1. Identifiez le réplica désynchronisé :
   ```bash
   kubectl get pods -l app=mysql-<name>
   ```
2. Effectuez un dump depuis un réplica fonctionnel et restaurez-le sur le primary :
   ```bash
   mysqldump -h <replica-host> -P 3306 -u<user> -p<password> --column-statistics=0 <database> <table> > fix-table.sql
   mysql -h <primary-host> -P 3306 -u<user> -p<password> <database> < fix-table.sql
   ```
3. Vérifiez que la réplication reprend correctement après la restauration.

:::note
Ce problème est référencé dans le [MariaDB Operator](https://github.com/mariadb-operator/mariadb-operator/issues/141). Une correction automatique est prévue dans les futures versions de l'opérateur.
:::

### Backup Restic échoué

**Cause** : les identifiants S3 sont incorrects, l'endpoint est inaccessible, ou le `resticPassword` ne correspond pas à celui utilisé lors de l'initialisation du dépôt.

**Solution** :

1. Vérifiez les logs du pod de backup :
   ```bash
   kubectl logs -l app=mysql-<name>-backup
   ```
2. Assurez-vous que les paramètres S3 sont corrects dans votre manifeste :
   - `s3Bucket` : le bucket existe et est accessible
   - `s3AccessKey` / `s3SecretKey` : les clés sont valides
   - `s3Region` : la région correspond à celle du bucket
3. Vérifiez que le `resticPassword` est identique à celui utilisé lors de la première sauvegarde. Un changement de mot de passe rend les anciennes sauvegardes inaccessibles.
4. Testez la connectivité vers l'endpoint S3 depuis le cluster.

### Connexion refusée

**Cause** : les pods MySQL ne sont pas en cours d'exécution, le nom du Secret est incorrect, ou la limite `maxUserConnections` est atteinte.

**Solution** :

1. Vérifiez que les pods sont en état `Running` :
   ```bash
   kubectl get pods -l app=mysql-<name>
   ```
2. Récupérez les identifiants depuis le Secret. Le pattern est `mysql-<name>-auth` :
   ```bash
   kubectl get secret mysql-<name>-auth -o jsonpath='{.data.password}' | base64 -d
   ```
3. Vérifiez que la limite `maxUserConnections` n'est pas atteinte pour l'utilisateur concerné.
4. Testez la connexion depuis un pod dans le cluster :
   ```bash
   kubectl run test-mysql --rm -it --image=mariadb:11 -- mysql -h mysql-<name> -P 3306 -u<user> -p
   ```

### Pod en CrashLoopBackOff

**Cause** : le pod redémarre en boucle, généralement à cause d'un manque de mémoire (OOMKilled) ou d'une configuration invalide.

**Solution** :

1. Consultez les logs du pod précédent pour identifier l'erreur :
   ```bash
   kubectl logs mysql-<name>-0 --previous
   ```
2. Vérifiez si le pod a été tué pour dépassement mémoire (OOMKilled) :
   ```bash
   kubectl describe pod mysql-<name>-0 | grep -i oom
   ```
3. Si c'est un problème de mémoire, augmentez le `resourcesPreset` ou définissez des `resources` explicites :
   ```yaml title="mysql.yaml"
   spec:
     resourcesPreset: medium    # Passer de nano/micro à medium ou plus
   ```
4. Appliquez la modification et attendez le redémarrage :
   ```bash
   kubectl apply -f mysql.yaml
   ```

### Espace disque plein

**Cause** : le volume persistant est saturé par les données, les logs binaires ou les fichiers temporaires.

**Solution** :

1. Vérifiez l'utilisation du disque dans le pod :
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
4. Si le problème est urgent, nettoyez les données obsolètes depuis un client MySQL.

:::warning
Ne réduisez jamais la valeur de `size`. L'augmentation de volume est supportée, mais la réduction ne l'est pas.
:::
