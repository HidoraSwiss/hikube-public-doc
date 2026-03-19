---
sidebar_position: 7
title: Depannage
---

# Depannage — PostgreSQL

### Pod PostgreSQL en etat Pending

**Cause** : le PersistentVolumeClaim (PVC) ne parvient pas a se lier a un volume. Cela peut etre du a une `storageClass` inexistante, un quota de stockage depasse ou un manque de ressources sur les noeuds.

**Solution** :

1. Verifiez l'etat du pod et les evenements associes :
   ```bash
   kubectl describe pod pg-<name>-1
   ```
2. Verifiez l'etat du PVC :
   ```bash
   kubectl get pvc
   kubectl describe pvc pg-<name>-1
   ```
3. Assurez-vous que la `storageClass` specifiee dans votre manifeste existe :
   ```bash
   kubectl get storageclass
   ```
4. Verifiez que votre quota de stockage n'est pas atteint.
5. Si necessaire, corrigez la `storageClass` dans votre manifeste et reappliquez :
   ```bash
   kubectl apply -f postgresql.yaml
   ```

### Replication desynchronisee entre primary et standby

**Cause** : un decalage (lag) de replication peut survenir en raison d'une charge reseau elevee, de ressources insuffisantes sur les standby, ou d'un volume de transactions important sur le primary.

**Solution** :

1. Connectez-vous au primary et verifiez l'etat de la replication :
   ```sql
   SELECT client_addr, state, sent_lsn, write_lsn, flush_lsn, replay_lsn
   FROM pg_stat_replication;
   ```
2. Comparez les positions LSN entre `sent_lsn` et `replay_lsn`. Un ecart important indique un lag.
3. Verifiez les ressources allouees aux standby (CPU, memoire). Si necessaire, augmentez le `resourcesPreset` ou les `resources` explicites.
4. Verifiez la connectivite reseau entre les pods :
   ```bash
   kubectl logs pg-<name>-2
   ```
5. Si le lag persiste, envisagez de reduire la charge d'ecriture sur le primary ou d'augmenter les ressources.

### Connexion refusee a PostgreSQL

**Cause** : les pods ne sont pas en cours d'execution, le nom du Secret est incorrect, ou le service n'est pas accessible.

**Solution** :

1. Verifiez que les pods PostgreSQL sont en etat `Running` :
   ```bash
   kubectl get pods -l app=pg-<name>
   ```
2. Verifiez que le service existe et pointe vers les bons endpoints :
   ```bash
   kubectl get svc pg-<name>-rw
   kubectl get endpoints pg-<name>-rw
   ```
3. Assurez-vous d'utiliser le bon nom de Secret pour les identifiants. Le pattern est `pg-<name>-app` :
   ```bash
   kubectl get secret pg-<name>-app
   ```
4. Testez la connexion depuis un pod dans le meme namespace :
   ```bash
   kubectl run test-pg --rm -it --image=postgres:16 -- psql -h pg-<name>-rw -p 5432 -U <user>
   ```

### Restauration PITR echouee

**Cause** : les parametres de bootstrap sont mal configures. Le champ `bootstrap.oldName` doit correspondre exactement au nom de l'instance d'origine, et le nom de la nouvelle instance doit etre different.

**Solution** :

1. Verifiez que `bootstrap.oldName` correspond exactement au nom de l'instance PostgreSQL d'origine :
   ```yaml title="postgresql-restore.yaml"
   apiVersion: apps.cozystack.io/v1alpha1
   kind: Postgres
   metadata:
     name: restored-db       # Doit etre un nouveau nom
   spec:
     bootstrap:
       enabled: true
       oldName: "original-db"  # Nom exact de l'ancienne instance
       recoveryTime: "2025-06-15T14:30:00Z"  # Format RFC 3339
   ```
2. Le `recoveryTime` doit etre au format **RFC 3339** (ex: `2025-06-15T14:30:00Z`). Si laisse vide, la restauration se fait au dernier etat disponible.
3. Le nom dans `metadata.name` doit etre **different** de `bootstrap.oldName`.
4. Assurez-vous que les sauvegardes de l'instance d'origine sont toujours accessibles dans le stockage S3.

### Performances lentes

**Cause** : les parametres PostgreSQL ne sont pas adaptes a la charge de travail, ou les ressources allouees sont insuffisantes.

**Solution** :

1. Ajustez les parametres PostgreSQL dans votre manifeste :
   ```yaml title="postgresql.yaml"
   spec:
     postgresql:
       parameters:
         shared_buffers: 512MB       # ~25% de la RAM allouee
         work_mem: 64MB              # Memoire par operation de tri
         max_connections: 200        # Adapter selon la charge
         effective_cache_size: 1536MB  # ~75% de la RAM
   ```
2. Verifiez que le `resourcesPreset` est adapte a votre charge :
   - Developpement : `nano` ou `micro`
   - Production : `medium`, `large` ou superieur
3. Surveillez l'utilisation des ressources :
   ```bash
   kubectl top pod pg-<name>-1
   ```
4. Si les requetes sont lentes, identifiez-les avec `pg_stat_statements` et optimisez les index.
5. Augmentez les ressources si necessaire en passant a un preset superieur ou en definissant des `resources` explicites.
